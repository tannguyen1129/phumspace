import { createHash } from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import { loadEnv } from "@phumspace/config";
import { PG_POOL } from "../../../common/database/database.module";

@Injectable()
export class EmailDeliveryService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}
  async sendVerification(email: string, token: string): Promise<boolean> {
    const env = loadEnv();
    return this.send(
      email,
      "Xác minh tài khoản PhumSpace",
      "Xác minh email",
      `${env.WEB_BASE_URL}/verify-email?token=${encodeURIComponent(token)}`,
    );
  }

  async sendPasswordReset(email: string, token: string): Promise<boolean> {
    const env = loadEnv();
    return this.send(
      email,
      "Đặt lại mật khẩu PhumSpace",
      "Đặt lại mật khẩu",
      `${env.WEB_BASE_URL}/reset-password?token=${encodeURIComponent(token)}`,
    );
  }
  async sendOrganizationInvite(email:string,token:string):Promise<boolean>{const env=loadEnv();return this.send(email,"Lời mời tham gia tổ chức trên PhumSpace","Chấp nhận lời mời",`${env.WEB_BASE_URL}/organizations/invite?token=${encodeURIComponent(token)}`);}

  private async send(
    to: string,
    subject: string,
    action: string,
    url: string,
  ): Promise<boolean> {
    const env = loadEnv();
    const recipientHash=createHash("sha256").update(to.toLowerCase()).digest("hex");
    if (!env.RESEND_API_KEY) { await this.log(subject,recipientHash,"SKIPPED",undefined,"PROVIDER_NOT_CONFIGURED"); return false; }
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: env.EMAIL_FROM,
          to: [to],
          subject,
          html: `<div style="font-family:system-ui;max-width:560px;margin:auto"><h1>PhumSpace</h1><p>${action} để tiếp tục sử dụng tài khoản an toàn.</p><p><a href="${url}" style="display:inline-block;padding:12px 18px;background:#682c3e;color:#fff;border-radius:10px;text-decoration:none">${action}</a></p><p>Liên kết có thời hạn và chỉ dùng được một lần. Nếu bạn không yêu cầu, hãy bỏ qua email này.</p></div>`,
        }),
      });
      const payload=await response.json().catch(()=>({})) as {id?:string;message?:string};
      await this.log(subject,recipientHash,response.ok?"SENT":"FAILED",payload.id,response.ok?undefined:(payload.message??`HTTP_${response.status}`));
      return response.ok;
    } catch (error) {
      await this.log(subject,recipientHash,"FAILED",undefined,error instanceof Error?error.name:"NETWORK_ERROR");
      return false;
    }
  }
  private async log(template:string,recipientHash:string,status:string,providerMessageId?:string,errorCode?:string){await this.pool.query(`INSERT INTO ops.delivery_attempts(channel,template,recipient_hash,status,provider_message_id,error_code,next_retry_at) VALUES('EMAIL',$1,$2,$3,$4,$5,CASE WHEN $3='FAILED' THEN now()+interval '5 minutes' ELSE NULL END)`,[template,recipientHash,status,providerMessageId??null,errorCode??null]);}
}
