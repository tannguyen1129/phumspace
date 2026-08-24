import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ENTITY_TYPES, type EntityType } from "@phumspace/contracts";
import { CurrentUser } from "../../../common/auth/current-user.decorator";
import { JwtAuthGuard, type AuthenticatedUser } from "../../../common/auth/jwt-auth.guard";
import { Roles } from "../../../common/auth/roles.decorator";
import { RolesGuard } from "../../../common/auth/roles.guard";
import { PhumDataService } from "../application/phumdata.service";
import { AttachCategoryDto } from "./dto/attach-category.dto";
import { AttachSourceDto } from "./dto/attach-source.dto";
import { CreateEntityDto } from "./dto/create-entity.dto";
import { CreateRelationDto } from "./dto/create-relation.dto";
import { CreateSourceDto } from "./dto/create-source.dto";
import { CreateVersionDto } from "./dto/create-version.dto";
import { PublishVersionDto } from "./dto/publish-version.dto";

/**
 * Toan bo /v1/phumdata/* yeu cau account-required (JwtAuthGuard). Doc (list/get/search/taxonomy/
 * relations/sources) mo cho moi Registered User; ghi (create entity/version/relation/source/category)
 * can vai tro CONTRIBUTOR tro len; publish can PUBLISHER/SYSTEM_ADMIN. Quy trinh kiem duyet day du
 * (Reviewer duyet truoc khi Publisher cong bo) se sieu chinh o Milestone M5.
 */
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("phumdata")
export class PhumDataController {
  constructor(private readonly phumDataService: PhumDataService) {}

  @Get("health")
  health() {
    return { module: "phumdata", status: "ok" };
  }

  @Get("entities")
  listEntities(
    @Query("entityType") entityType?: string,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string
  ) {
    const validEntityType = isEntityType(entityType) ? entityType : undefined;
    return this.phumDataService.listEntities({
      entityType: validEntityType,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Get("entities/:id")
  getEntity(@Param("id") id: string) {
    return this.phumDataService.getEntity(id);
  }

  @Roles("CONTRIBUTOR", "REVIEWER", "PUBLISHER", "SYSTEM_ADMIN")
  @Post("entities")
  createEntity(@CurrentUser() currentUser: AuthenticatedUser, @Body() dto: CreateEntityDto) {
    return this.phumDataService.createDraftEntity({ ...dto, createdBy: currentUser.id });
  }

  @Roles("CONTRIBUTOR", "REVIEWER", "PUBLISHER", "SYSTEM_ADMIN")
  @Post("entities/:id/versions")
  createVersion(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id") entityId: string,
    @Body() dto: CreateVersionDto
  ) {
    return this.phumDataService.createNewVersion({ ...dto, entityId, createdBy: currentUser.id });
  }

  @Roles("PUBLISHER", "SYSTEM_ADMIN")
  @Patch("versions/:id/publish")
  publishVersion(@Param("id") versionId: string, @Body() dto: PublishVersionDto) {
    return this.phumDataService.publishVersion(versionId, dto.verificationLevel);
  }

  @Get("search")
  search(@Query("q") query?: string, @Query("limit") limit?: string, @Query("offset") offset?: string) {
    return this.phumDataService.search({
      query,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Get("taxonomy")
  listTaxonomy(@Query("scheme") scheme?: string) {
    return this.phumDataService.listTaxonomy(scheme);
  }

  @Roles("CONTRIBUTOR", "REVIEWER", "PUBLISHER", "SYSTEM_ADMIN")
  @Post("entities/:id/categories")
  async attachCategory(@Param("id") entityId: string, @Body() dto: AttachCategoryDto) {
    await this.phumDataService.attachCategory(entityId, dto.termId);
    return { attached: true };
  }

  @Roles("CONTRIBUTOR", "REVIEWER", "PUBLISHER", "SYSTEM_ADMIN")
  @Post("relations")
  createRelation(@CurrentUser() currentUser: AuthenticatedUser, @Body() dto: CreateRelationDto) {
    return this.phumDataService.createRelation({ ...dto, createdBy: currentUser.id });
  }

  @Get("entities/:id/relations")
  listRelations(@Param("id") entityId: string) {
    return this.phumDataService.listRelations(entityId);
  }

  @Roles("CONTRIBUTOR", "REVIEWER", "PUBLISHER", "SYSTEM_ADMIN")
  @Post("sources")
  createSource(@CurrentUser() currentUser: AuthenticatedUser, @Body() dto: CreateSourceDto) {
    return this.phumDataService.createSource({ ...dto, createdBy: currentUser.id });
  }

  @Get("sources")
  listSources(@Query("limit") limit?: string, @Query("offset") offset?: string) {
    return this.phumDataService.listSources(limit ? Number(limit) : undefined, offset ? Number(offset) : undefined);
  }

  @Roles("CONTRIBUTOR", "REVIEWER", "PUBLISHER", "SYSTEM_ADMIN")
  @Post("versions/:id/sources")
  async attachSource(@Param("id") versionId: string, @Body() dto: AttachSourceDto) {
    await this.phumDataService.attachSourceToVersion(versionId, dto.sourceId);
    return { attached: true };
  }

  @Get("versions/:id/sources")
  listSourcesForVersion(@Param("id") versionId: string) {
    return this.phumDataService.listSourcesForVersion(versionId);
  }
}

function isEntityType(value: string | undefined): value is EntityType {
  return !!value && (ENTITY_TYPES as readonly string[]).includes(value);
}
