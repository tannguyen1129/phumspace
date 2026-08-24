import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  createHash,
  randomBytes,
} from "node:crypto";
import { Injectable } from "@nestjs/common";
import { loadEnv } from "@phumspace/config";
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
@Injectable()
export class MfaService {
  generateSecret(): string {
    return base32(randomBytes(20));
  }
  provisioningUri(email: string, secret: string): string {
    return `otpauth://totp/PhumSpace:${encodeURIComponent(email)}?secret=${secret}&issuer=PhumSpace&algorithm=SHA1&digits=6&period=30`;
  }
  verify(secret: string, code: string): boolean {
    const counter = Math.floor(Date.now() / 30_000);
    return [-1, 0, 1].some(
      (offset) => totp(secret, counter + offset) === code.replace(/\s/g, ""),
    );
  }
  encrypt(secret: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", this.key(), iv);
    const encrypted = Buffer.concat([
      cipher.update(secret, "utf8"),
      cipher.final(),
    ]);
    return [
      iv.toString("base64url"),
      cipher.getAuthTag().toString("base64url"),
      encrypted.toString("base64url"),
    ].join(".");
  }
  decrypt(payload: string): string {
    const [iv, tag, encrypted] = payload.split(".");
    const decipher = createDecipheriv(
      "aes-256-gcm",
      this.key(),
      Buffer.from(iv, "base64url"),
    );
    decipher.setAuthTag(Buffer.from(tag, "base64url"));
    return Buffer.concat([
      decipher.update(Buffer.from(encrypted, "base64url")),
      decipher.final(),
    ]).toString("utf8");
  }
  private key(): Buffer {
    return createHash("sha256").update(loadEnv().MFA_ENCRYPTION_KEY).digest();
  }
}
function base32(value: Buffer): string {
  let bits = "";
  for (const byte of value) bits += byte.toString(2).padStart(8, "0");
  let out = "";
  for (let i = 0; i < bits.length; i += 5)
    out += ALPHABET[parseInt(bits.slice(i, i + 5).padEnd(5, "0"), 2)];
  return out;
}
function decodeBase32(value: string): Buffer {
  let bits = "";
  for (const char of value.replace(/=+$/, ""))
    bits += ALPHABET.indexOf(char).toString(2).padStart(5, "0");
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8)
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}
function totp(secret: string, counter: number): string {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(counter));
  const hash = createHmac("sha1", decodeBase32(secret)).update(buffer).digest();
  const offset = hash[hash.length - 1] & 15;
  return ((hash.readUInt32BE(offset) & 0x7fffffff) % 1_000_000)
    .toString()
    .padStart(6, "0");
}
