import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { Queue } from "bullmq";
import sharp from "sharp";
import type { ScanRequestStatus } from "@phumspace/contracts";
import {
  AI_SCAN_QUEUE,
  AI_SCAN_QUEUE_NAME,
} from "../../../common/queue/queue.module";
import { MediaStorageService } from "../../../common/storage/media-storage.service";
import { ScanRequestsRepository } from "../infrastructure/scan-requests.repository";
import { ScanResultsRepository } from "../infrastructure/scan-results.repository";
import type { ScanRequest, ScanResultRecord } from "../domain/scan";
import {
  ScanFeedbackRepository,
  type ScanFeedbackType,
} from "../infrastructure/scan-feedback.repository";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const SHARP_ENCODER_BY_MIME: Record<string, "jpeg" | "png" | "webp"> = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
};

export interface ScanStatusView {
  id: string;
  status: ScanRequestStatus;
  errorMessage: string | null;
  result: ScanResultRecord | null;
}

export interface ScanHistoryItem extends ScanStatusView {
  createdAt: Date;
  imageUrl: string;
}

/**
 * ScannerService — dieu phoi buoc Intake (System Design/AI Specification pipeline).
 * Xu ly that (Observe/Retrieve/Synthesize/Decide) chay bat dong bo trong apps/worker qua
 * queue "ai-scan" — API chi tao yeu cau va cho phep client poll trang thai/ket qua.
 */
@Injectable()
export class ScannerService {
  constructor(
    private readonly scanRequestsRepository: ScanRequestsRepository,
    private readonly scanResultsRepository: ScanResultsRepository,
    private readonly mediaStorageService: MediaStorageService,
    @Inject(AI_SCAN_QUEUE) private readonly scanQueue: Queue,
    private readonly scanFeedbackRepository: ScanFeedbackRepository,
  ) {}

  async createScan(input: {
    userId: string;
    file: { buffer: Buffer; mimetype: string; size: number };
    placeId?: string;
  }): Promise<ScanRequest> {
    if (!ALLOWED_MIME_TYPES.has(input.file.mimetype)) {
      throw new BadRequestException("Chi chap nhan anh JPEG/PNG/WebP.");
    }
    if (input.file.size > MAX_IMAGE_BYTES) {
      throw new BadRequestException("Anh vuot qua 8MB.");
    }

    // Sanitize (System Design buoc "Intake"): rotate() bake huong anh theo EXIF Orientation
    // truoc khi metadata bi bo, roi ma hoa lai qua sharp — mac dinh sharp KHONG giu EXIF/GPS
    // tru khi goi withMetadata(), nen day chinh la buoc strip EXIF (rieng tu, bao ve vi tri
    // chup cua nguoi dung khoi bi lo qua GPS tag trong anh). File hong/khong phai anh that
    // (dinh dang gia, upload dang do) phai tra 400 ro rang thay vi de sharp nem loi thanh 500
    // (Phu luc D "Scanner: anh khong thuoc du lieu/API timeout" — tim thay khi dien tap M7).
    const encoder = SHARP_ENCODER_BY_MIME[input.file.mimetype];
    let sanitizedBuffer: Buffer;
    try {
      const sanitizedImage = sharp(input.file.buffer).rotate();
      sanitizedBuffer = await sanitizedImage[encoder]().toBuffer();
    } catch {
      throw new BadRequestException(
        "Anh bi hong hoac khong dung dinh dang — vui long chup/chon lai.",
      );
    }

    const mediaKey = await this.mediaStorageService.upload(
      sanitizedBuffer,
      input.file.mimetype,
      "scans",
    );
    const scanRequest = await this.scanRequestsRepository.create({
      userId: input.userId,
      mediaKey,
      mimeType: input.file.mimetype,
      placeId: input.placeId,
    });

    await this.scanQueue.add(
      AI_SCAN_QUEUE_NAME,
      { scanRequestId: scanRequest.id },
      { attempts: 2, backoff: { type: "exponential", delay: 2000 } },
    );

    return scanRequest;
  }
  async addFeedback(
    scanRequestId: string,
    userId: string,
    input: {
      feedbackType: ScanFeedbackType;
      selectedEntityId?: string;
      note?: string;
    },
  ) {
    await this.getScanStatus(scanRequestId, userId);
    return this.scanFeedbackRepository.create({
      scanRequestId,
      userId,
      ...input,
    });
  }

  async getScanStatus(
    scanRequestId: string,
    userId: string,
  ): Promise<ScanStatusView> {
    const scanRequest =
      await this.scanRequestsRepository.findById(scanRequestId);
    // 404 thay vi 403 khi khong phai chu so huu — tranh lo thong tin ton tai cua scan cua nguoi khac (chong IDOR).
    if (!scanRequest || scanRequest.userId !== userId) {
      throw new NotFoundException("Khong tim thay yeu cau quet.");
    }
    const result =
      await this.scanResultsRepository.findByScanRequestId(scanRequestId);
    return {
      id: scanRequest.id,
      status: scanRequest.status,
      errorMessage: scanRequest.errorMessage,
      result,
    };
  }

  /** Lich su quet cua user hien tai, kem anh da chup (Personalization "History" — FR-PER-002). */
  async listHistoryForUser(userId: string): Promise<ScanHistoryItem[]> {
    const scanRequests = await this.scanRequestsRepository.listForUser(userId);
    return Promise.all(
      scanRequests.map(async (scanRequest) => {
        const result = await this.scanResultsRepository.findByScanRequestId(
          scanRequest.id,
        );
        const imageUrl = await this.mediaStorageService.getPresignedUrl(
          scanRequest.mediaKey,
        );
        return {
          id: scanRequest.id,
          status: scanRequest.status,
          errorMessage: scanRequest.errorMessage,
          result,
          createdAt: scanRequest.createdAt,
          imageUrl,
        };
      }),
    );
  }

  /** Quyen xoa lich su ca nhan (FR-PER-002/007) — xoa ca ban ghi DB lan anh tren object storage. */
  async deleteScanForUser(
    scanRequestId: string,
    userId: string,
  ): Promise<void> {
    const scanRequest =
      await this.scanRequestsRepository.findById(scanRequestId);
    if (!scanRequest || scanRequest.userId !== userId) {
      throw new NotFoundException("Khong tim thay yeu cau quet.");
    }
    await this.scanRequestsRepository.delete(scanRequestId);
    await this.mediaStorageService.delete(scanRequest.mediaKey);
  }
}
