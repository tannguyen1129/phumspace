import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Throttle } from "@nestjs/throttler";
import { memoryStorage } from "multer";
import { CurrentUser } from "../../../common/auth/current-user.decorator";
import {
  JwtAuthGuard,
  type AuthenticatedUser,
} from "../../../common/auth/jwt-auth.guard";
import { ScannerService } from "../application/scanner.service";
import { ScanFeedbackDto } from "./dto/scan-feedback.dto";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

/** ScannerController — AI Cultural Scanner (SCN-001..016). Toan bo yeu cau account-required. */
@UseGuards(JwtAuthGuard)
@Controller("scanner")
export class ScannerController {
  constructor(private readonly scannerService: ScannerService) {}

  @Get("health")
  health() {
    return { module: "scanner", status: "ok" };
  }

  // Rieng tu voi Scanner (System Design muc 16.2): moi scan ton chi phi Gemini + xu ly anh,
  // gioi han chat hon default de chan lam dung tai nguyen AI.
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post("scans")
  @UseInterceptors(
    FileInterceptor("image", {
      storage: memoryStorage(),
      limits: { fileSize: MAX_IMAGE_BYTES },
    }),
  )
  async createScan(
    @CurrentUser() currentUser: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body("placeId") placeId?: string,
  ) {
    if (!file) {
      throw new BadRequestException("Thieu file anh (field 'image').");
    }
    const scanRequest = await this.scannerService.createScan({
      userId: currentUser.id,
      file: { buffer: file.buffer, mimetype: file.mimetype, size: file.size },
      placeId: placeId || undefined,
    });
    return { id: scanRequest.id, status: scanRequest.status };
  }

  @Get("scans/:id")
  getScan(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    return this.scannerService.getScanStatus(id, currentUser.id);
  }
  @Post("scans/:id/feedback")
  addFeedback(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: ScanFeedbackDto,
  ) {
    return this.scannerService.addFeedback(id, currentUser.id, dto);
  }
}
