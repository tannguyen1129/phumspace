import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../../../common/auth/current-user.decorator";
import {
  JwtAuthGuard,
  type AuthenticatedUser,
} from "../../../common/auth/jwt-auth.guard";
import { PersonalizationService } from "../application/personalization.service";
import { SaveItemDto } from "./dto/save-item.dto";
import { PrivacyRequestDto } from "./dto/privacy-request.dto";

/**
 * PersonalizationController — khu vuc "Toi" (SRS muc 7.3). Toan bo yeu cau account-required va
 * chi thao tac tren du lieu cua chinh nguoi dung dang dang nhap (khong nhan userId tu client).
 * Khong co API/schema diem thuong hay achievement (FR-PER-006).
 */
@UseGuards(JwtAuthGuard)
@Controller("personalization")
export class PersonalizationController {
  constructor(
    private readonly personalizationService: PersonalizationService,
  ) {}

  @Get("health")
  health() {
    return { module: "personalization", status: "ok" };
  }

  @Post("saved")
  async save(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: SaveItemDto,
  ) {
    if (!dto.entityId && !dto.termId) {
      throw new BadRequestException("Can co entityId hoac termId.");
    }
    if (dto.entityId && dto.termId) {
      throw new BadRequestException(
        "Chi duoc chon 1 trong 2: entityId hoac termId.",
      );
    }
    return dto.entityId
      ? this.personalizationService.saveEntity(currentUser.id, dto.entityId)
      : this.personalizationService.saveTerm(
          currentUser.id,
          dto.termId as string,
        );
  }

  @Delete("saved/entity/:entityId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async unsaveEntity(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("entityId") entityId: string,
  ) {
    await this.personalizationService.unsaveEntity(currentUser.id, entityId);
  }

  @Delete("saved/term/:termId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async unsaveTerm(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("termId") termId: string,
  ) {
    await this.personalizationService.unsaveTerm(currentUser.id, termId);
  }

  @Get("saved")
  async listSaved(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query("type") type?: "entity" | "term",
    @Query("q") q?: string,
  ) {
    return this.personalizationService.listSaved(currentUser.id, { type, q });
  }

  @Get("history")
  async listHistory(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.personalizationService.listHistory(currentUser.id);
  }

  @Delete("history/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteHistoryItem(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    await this.personalizationService.deleteHistoryItem(currentUser.id, id);
  }

  @Get("export")
  async exportData(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.personalizationService.exportPersonalData(currentUser.id);
  }

  @Post("delete-account")
  requestLegacyAccountDeletion(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.personalizationService.createPrivacyRequest(
      currentUser.id,
      "DELETE",
    );
  }

  @Post("privacy-requests")
  createPrivacyRequest(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: PrivacyRequestDto,
  ) {
    return this.personalizationService.createPrivacyRequest(
      currentUser.id,
      dto.requestType,
    );
  }
  @Get("privacy-requests")
  listPrivacyRequests(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.personalizationService.listPrivacyRequests(currentUser.id);
  }
  @Post("privacy-requests/:id/cancel")
  async cancelPrivacyRequest(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    await this.personalizationService.cancelPrivacyRequest(currentUser.id, id);
    return { cancelled: true };
  }
  @Post("privacy-requests/:id/execute")
  async executePrivacyRequest(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    await this.personalizationService.executeDeleteRequest(currentUser.id, id);
    return { completed: true };
  }
}
