import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { CurrentUser } from "../../../common/auth/current-user.decorator";
import { JwtAuthGuard, type AuthenticatedUser } from "../../../common/auth/jwt-auth.guard";
import { Roles } from "../../../common/auth/roles.decorator";
import { RolesGuard } from "../../../common/auth/roles.guard";
import { HandbookService } from "../application/handbook.service";
import { CreateTermDto } from "./dto/create-term.dto";
import { UpdateProgressDto } from "./dto/update-progress.dto";
import { RecordPracticeDto } from "./dto/record-practice.dto";

const MAX_AUDIO_BYTES = 10 * 1024 * 1024;
const CONTRIBUTOR_ROLES = ["CONTRIBUTOR", "TEACHER_ORGANIZER", "REVIEWER", "PUBLISHER", "SYSTEM_ADMIN"] as const;

/** HandbookController — tu vung Khmer, audio nguoi ban dia, tien do hoc (HBK-001..010). */
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("handbook")
export class HandbookController {
  constructor(private readonly handbookService: HandbookService) {}

  @Get("health")
  health() {
    return { module: "handbook", status: "ok" };
  }

  @Get("terms")
  listTerms(
    @Query("entityId") entityId?: string,
    @Query("q") q?: string,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string
  ) {
    return this.handbookService.listTerms({
      entityId,
      query: q,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Get("terms/:id")
  getTerm(@CurrentUser() currentUser: AuthenticatedUser, @Param("id") id: string) {
    return this.handbookService.getTermDetail(id, currentUser.id);
  }

  @Roles(...CONTRIBUTOR_ROLES)
  @Post("terms")
  createTerm(@CurrentUser() currentUser: AuthenticatedUser, @Body() dto: CreateTermDto) {
    return this.handbookService.createTerm({ ...dto, createdBy: currentUser.id });
  }

  @Roles(...CONTRIBUTOR_ROLES)
  @Post("terms/:id/audio")
  @UseInterceptors(FileInterceptor("audio", { storage: memoryStorage(), limits: { fileSize: MAX_AUDIO_BYTES } }))
  async addAudio(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id") termId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body("speakerName") speakerName?: string,
    @Body("region") region?: string
    ,@Body("recordedAt") recordedAt?: string
    ,@Body("rightsNote") rightsNote?: string
    ,@Body("transcript") transcript?: string
  ) {
    if (!file) {
      throw new BadRequestException("Thieu file audio (field 'audio').");
    }
    return this.handbookService.addAudio({
      termId,
      file: { buffer: file.buffer, mimetype: file.mimetype, size: file.size },
      speakerName,
      region,
      recordedAt: recordedAt ? new Date(recordedAt) : undefined,
      rightsNote,
      transcript,
      createdBy: currentUser.id,
    });
  }

  @Patch("terms/:id/progress")
  updateProgress(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id") termId: string,
    @Body() dto: UpdateProgressDto
  ) {
    return this.handbookService.updateProgress(currentUser.id, termId, dto.status);
  }

  @Get("me/progress")
  listMyProgress(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.handbookService.listMyProgress(currentUser.id);
  }

  @Get("practice/deck")
  getPracticeDeck(@Query("limit") limit?: string) {
    return this.handbookService.getPracticeDeck(limit ? Number(limit) : 10);
  }

  @Post("practice/result")
  recordPractice(@CurrentUser() currentUser: AuthenticatedUser, @Body() dto: RecordPracticeDto) {
    return this.handbookService.recordPractice(currentUser.id, dto.termId, dto.result);
  }
}
