import { Injectable, Logger } from "@nestjs/common";
import { GoogleGenAI, Type } from "@google/genai";
import { loadEnv } from "@phumspace/config";
import {
  DECISION_HINTS,
  IMAGE_QUALITY_LEVELS,
  NEXT_ACTIONS,
  VERIFICATION_LEVELS,
  type ModelSynthesisOutput,
  type VisionObservation,
} from "@phumspace/contracts";

export interface EvidenceCandidate {
  entityId: string;
  title: string;
  description: string | null;
  citationIds: string[];
}

/**
 * Alias -> model id that (AI_Specification: "model khong hard-code trong code/prompt ma goi
 * qua alias cau hinh"). Ten model Gemini co the doi theo thoi gian — kiem tra lai tai lieu
 * chinh thuc truoc khi trien khai production (xem docs Phu luc E, ghi chu cuoi tai lieu).
 */
const MODEL_ALIAS_MAP: Record<string, string> = {
  vision_fast: "gemini-3.6-flash",
  grounded_quality: "gemini-3.6-flash",
};

function resolveModelAlias(alias: string): string {
  return MODEL_ALIAS_MAP[alias] ?? alias;
}

const VISION_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    observedFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
    sceneContext: { type: Type.STRING },
    imageQuality: { type: Type.STRING, enum: [...IMAGE_QUALITY_LEVELS] },
    clarificationNeeded: { type: Type.BOOLEAN },
  },
  required: [
    "observedFeatures",
    "sceneContext",
    "imageQuality",
    "clarificationNeeded",
  ],
};

const SYNTHESIS_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    decisionHint: { type: Type.STRING, enum: [...DECISION_HINTS] },
    primaryCandidateId: { type: Type.STRING, nullable: true },
    alternativeCandidateIds: { type: Type.ARRAY, items: { type: Type.STRING } },
    observedFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
    title: { type: Type.STRING },
    summary: { type: Type.STRING },
    culturalMeaning: { type: Type.STRING },
    citationIds: { type: Type.ARRAY, items: { type: Type.STRING } },
    verificationLabel: { type: Type.STRING, enum: [...VERIFICATION_LEVELS] },
    uncertaintyNote: { type: Type.STRING },
    nextActions: {
      type: Type.ARRAY,
      items: { type: Type.STRING, enum: [...NEXT_ACTIONS] },
    },
  },
  required: [
    "decisionHint",
    "primaryCandidateId",
    "alternativeCandidateIds",
    "observedFeatures",
    "title",
    "summary",
    "citationIds",
    "verificationLabel",
    "nextActions",
  ],
};

const VISION_PROMPT = `Ban la mot he thong quan sat anh cho ung dung du lich van hoa Khmer Nam Bo.
CHI mo ta nhung gi nhin thay trong anh (vat the, hoa van, chu viet, boi canh). TUYET DOI KHONG
suy doan y nghia van hoa, ten rieng, hay lich su — do la viec cua buoc sau, dua tren du lieu da
kiem chung. Neu anh mo, thieu sang hoac khong ro doi tuong, hay noi ro trong imageQuality va
clarificationNeeded. Tra ve dung JSON schema da cho.`;

function buildSynthesisPrompt(
  observation: VisionObservation,
  candidates: EvidenceCandidate[],
): string {
  const evidenceLines = candidates
    .map(
      (c) =>
        `- id="${c.entityId}" title="${c.title}" citationIds=[${c.citationIds.map((id) => `"${id}"`).join(",")}]\n  mo ta: ${c.description ?? "(khong co)"}`,
    )
    .join("\n");

  return `Ban la lop dien giai cho AI Cultural Scanner cua PhumSpace. NGUYEN TAC BAT BUOC:
- CHI duoc dung thong tin trong "Du lieu da kiem chung" duoi day. KHONG duoc bia them su that,
  ten goi, hay y nghia van hoa nao ngoai danh sach nay.
- Neu khong co ung vien nao thuc su khop voi dac diem quan sat duoc, dat decisionHint="NO_MATCH",
  primaryCandidateId=null, citationIds=[].
- Neu chon mot ung vien lam primaryCandidateId, PHAI dung dung "id" trong danh sach va citationIds
  PHAI la tap con cua citationIds cua ung vien do (khong duoc rong).
- nextActions chi duoc chon tu enum da cho — TUYET DOI khong de xuat diem thuong/huy hieu/xep hang.
- summary toi da 900 ky tu, ngan gon, trung lap.

Dac diem quan sat duoc tu anh:
- observedFeatures: ${JSON.stringify(observation.observedFeatures)}
- sceneContext: ${observation.sceneContext}

Du lieu da kiem chung (evidence bundle, chi duoc dung nguon nay):
${evidenceLines || "(khong co ung vien nao duoc truy xuat)"}

Tra ve dung JSON schema da cho.`;
}

/**
 * GeminiAdapter — co lap toan bo lời goi Gemini SDK sau 1 interface hep (observeImage/synthesize).
 * Khi thieu GEMINI_API_KEY hoac goi loi, cac phuong thuc nem loi ro rang — ScanPipelineService
 * chiu trach nhiem fallback UNKNOWN/requiresHumanReview (graceful degradation theo AI_Specification),
 * adapter nay khong tu quyet dinh nghiep vu.
 */
@Injectable()
export class GeminiAdapter {
  private readonly logger = new Logger(GeminiAdapter.name);
  private readonly client: GoogleGenAI | null;
  private readonly visionModel: string;
  private readonly synthesisModel: string;

  constructor() {
    const env = loadEnv();
    this.client = env.GEMINI_API_KEY
      ? new GoogleGenAI({ apiKey: env.GEMINI_API_KEY })
      : null;
    this.visionModel = resolveModelAlias(env.GEMINI_VISION_MODEL_ALIAS);
    this.synthesisModel = resolveModelAlias(env.GEMINI_SYNTHESIS_MODEL_ALIAS);
    if (!this.client) {
      this.logger.warn(
        "GEMINI_API_KEY chua duoc cau hinh — Scanner se chay o che do graceful-degradation.",
      );
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  async observeImage(
    imageBytes: Buffer,
    mimeType: string,
  ): Promise<VisionObservation> {
    if (!this.client) throw new Error("GEMINI_API_KEY chua duoc cau hinh.");

    const response = await this.client.models.generateContent({
      model: this.visionModel,
      contents: [
        {
          role: "user",
          parts: [
            { text: VISION_PROMPT },
            { inlineData: { mimeType, data: imageBytes.toString("base64") } },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: VISION_RESPONSE_SCHEMA,
      },
    });

    if (!response.text) throw new Error("SAFETY_BLOCKED_OR_EMPTY_RESPONSE");
    return validateVisionOutput(JSON.parse(response.text));
  }

  async synthesize(input: {
    observation: VisionObservation;
    candidates: EvidenceCandidate[];
  }): Promise<ModelSynthesisOutput> {
    if (!this.client) throw new Error("GEMINI_API_KEY chua duoc cau hinh.");

    const response = await this.client.models.generateContent({
      model: this.synthesisModel,
      contents: [
        {
          role: "user",
          parts: [
            { text: buildSynthesisPrompt(input.observation, input.candidates) },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: SYNTHESIS_RESPONSE_SCHEMA,
      },
    });

    if (!response.text) throw new Error("SAFETY_BLOCKED_OR_EMPTY_RESPONSE");
    return validateSynthesisOutput(JSON.parse(response.text));
  }
}

function validateVisionOutput(value: unknown): VisionObservation {
  if (!value || typeof value !== "object")
    throw new Error("Gemini vision output không đúng schema.");
  const item = value as Record<string, unknown>;
  if (
    !Array.isArray(item.observedFeatures) ||
    !item.observedFeatures.every((v) => typeof v === "string") ||
    typeof item.sceneContext !== "string" ||
    !(IMAGE_QUALITY_LEVELS as readonly unknown[]).includes(item.imageQuality) ||
    typeof item.clarificationNeeded !== "boolean"
  )
    throw new Error("Gemini vision output thiếu trường bắt buộc.");
  return item as unknown as VisionObservation;
}
function validateSynthesisOutput(value: unknown): ModelSynthesisOutput {
  if (!value || typeof value !== "object")
    throw new Error("Gemini synthesis output không đúng schema.");
  const item = value as Record<string, unknown>;
  const strings = (key: string) =>
    Array.isArray(item[key]) &&
    (item[key] as unknown[]).every((v) => typeof v === "string");
  if (
    !(DECISION_HINTS as readonly unknown[]).includes(item.decisionHint) ||
    !(
      item.primaryCandidateId === null ||
      typeof item.primaryCandidateId === "string"
    ) ||
    !strings("alternativeCandidateIds") ||
    !strings("observedFeatures") ||
    typeof item.title !== "string" ||
    typeof item.summary !== "string" ||
    !strings("citationIds") ||
    !(VERIFICATION_LEVELS as readonly unknown[]).includes(
      item.verificationLabel,
    ) ||
    !strings("nextActions") ||
    !(item.nextActions as unknown[]).every((v) =>
      (NEXT_ACTIONS as readonly unknown[]).includes(v),
    )
  )
    throw new Error("Gemini synthesis output thiếu hoặc sai trường bắt buộc.");
  return item as unknown as ModelSynthesisOutput;
}
