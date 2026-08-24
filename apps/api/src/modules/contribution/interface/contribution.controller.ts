import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Throttle } from "@nestjs/throttler";
import { memoryStorage } from "multer";
import { AI_PERMISSIONS, CONSENT_SCOPES, type AiPermission, type ConsentScope } from "@phumspace/contracts";
import { CurrentUser } from "../../../common/auth/current-user.decorator";
import { JwtAuthGuard, type AuthenticatedUser } from "../../../common/auth/jwt-auth.guard";
import { MAX_AUDIO_BYTES } from "../../handbook/application/handbook.service";
import { ContributionService } from "../application/contribution.service";

/**
 * ContributionController — CON-001..014. Toan bo yeu cau account-required; KHONG gioi han
 * theo vai tro rieng — moi Registered User co the dong gop (nguyen tac "community-first").
 */
@UseGuards(JwtAuthGuard)
@Controller("contribution")
export class ContributionController {
  constructor(private readonly contributionService: ContributionService) {}

  @Get("health")
  health() {
    return { module: "contribution", status: "ok" };
  }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post("contributions")
  @UseInterceptors(FileInterceptor("audio", { storage: memoryStorage(), limits: { fileSize: MAX_AUDIO_BYTES } }))
  async submit(
    @CurrentUser() currentUser: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body("termId") termId?: string,
    @Body("proposedKhmerText") proposedKhmerText?: string,
    @Body("proposedLatinTransliteration") proposedLatinTransliteration?: string,
    @Body("proposedMeaningVi") proposedMeaningVi?: string,
    @Body("region") region?: string,
    @Body("consentScope") consentScope?: string,
    @Body("aiPermission") aiPermission?: string,
    @Body("attributionName") attributionName?: string,
    @Body("sensitive") sensitive?: string
    ,@Body("language") language?: string
    ,@Body("recordedAt") recordedAt?: string
    ,@Body("recordedBy") recordedBy?: string
    ,@Body("contextNote") contextNote?: string
    ,@Body("locationNote") locationNote?: string
    ,@Body("consentVersion") consentVersion?: string
    ,@Body("attributionRole") attributionRole?: string
    ,@Body("attributionCommunity") attributionCommunity?: string
  ) {
    if (!file) {
      throw new BadRequestException("Thieu file audio (field 'audio').");
    }
    if (!consentScope || !(CONSENT_SCOPES as readonly string[]).includes(consentScope)) {
      throw new BadRequestException(`consentScope phai la mot trong: ${CONSENT_SCOPES.join(", ")}.`);
    }
    const validAiPermission =
      aiPermission && (AI_PERMISSIONS as readonly string[]).includes(aiPermission)
        ? (aiPermission as AiPermission)
        : undefined;

    return this.contributionService.submit({
      contributorId: currentUser.id,
      termId,
      proposedKhmerText,
      proposedLatinTransliteration,
      proposedMeaningVi,
      file: { buffer: file.buffer, mimetype: file.mimetype, size: file.size },
      region,
      consentScope: consentScope as ConsentScope,
      aiPermission: validAiPermission,
      attributionName,
      sensitive: sensitive === "true",
      language, recordedAt: recordedAt ? new Date(recordedAt) : undefined, recordedBy,
      contextNote, locationNote, consentVersion, attributionRole, attributionCommunity,
    });
  }

  @Get("contributions/me")
  listMine(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.contributionService.listMine(currentUser.id);
  }

  @Get("contributions/:id")
  async getOne(@CurrentUser() currentUser: AuthenticatedUser, @Param("id") id: string) {
    const contribution = await this.contributionService.getOwnedById(id, currentUser.id);
    return this.contributionService.attachAudioUrl(contribution);
  }

  @Post("contributions/:id/withdraw")
  withdraw(@CurrentUser() currentUser: AuthenticatedUser, @Param("id") id: string) {
    return this.contributionService.withdraw(id, currentUser.id);
  }

  @Get("drafts") listDrafts(@CurrentUser() user: AuthenticatedUser) { return this.contributionService.listDrafts(user.id); }
  @Put("drafts") saveDraft(@CurrentUser() user: AuthenticatedUser, @Body() body: {id?:string;contributionType:string;payload:Record<string,unknown>}) { return this.contributionService.saveDraft(user.id,body); }
  @Delete("drafts/:id") deleteDraft(@CurrentUser() user: AuthenticatedUser,@Param("id") id:string){return this.contributionService.deleteDraft(id,user.id);}
  @Post("contributions/:id/resubmit") resubmit(@CurrentUser() user:AuthenticatedUser,@Param("id") id:string,@Body() body:{contextNote?:string;locationNote?:string}){return this.contributionService.resubmit(id,user.id,body);}
  @Post("contributions/:id/request") request(@CurrentUser() user:AuthenticatedUser,@Param("id") id:string,@Body() body:{type:"TAKEDOWN"|"CORRECTION";reason:string}){if(!body.reason?.trim())throw new BadRequestException("Can neu ly do.");return this.contributionService.createPostPublishRequest(id,user.id,body.type,body.reason.trim());}
}
