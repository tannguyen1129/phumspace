import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { VERIFICATION_LEVELS } from "../vocabulary";
import { NEXT_ACTIONS } from "../scanner";

const schema = JSON.parse(
  readFileSync(join(__dirname, "../../schemas/scan-result.schema.json"), "utf-8")
);

describe("scan-result.schema.json", () => {
  it("verificationLabel enum khop voi VERIFICATION_LEVELS trong vocabulary.ts", () => {
    expect(schema.properties.verificationLabel.enum).toEqual(VERIFICATION_LEVELS);
  });

  it("khong chua hanh dong mang tinh diem thuong/reward trong nextActions", () => {
    const rewardLikePattern = /reward|badge|point|achievement|prize/i;
    const nextActionsEnum: string[] = schema.properties.nextActions.items.enum;
    for (const action of nextActionsEnum) {
      expect(action).not.toMatch(rewardLikePattern);
    }
    expect(nextActionsEnum).toEqual(NEXT_ACTIONS as unknown as string[]);
  });

  it("summary bi gioi han <=900 ky tu theo dac ta", () => {
    expect(schema.properties.summary.maxLength).toBe(900);
  });
});
