import { Module } from "@nestjs/common";
import { OrganizationModule } from "../organization/organization.module";
import { OlympiadController } from "./interface/olympiad.controller";
import { OlympiadService } from "./application/olympiad.service";
import { QuestionsRepository } from "./infrastructure/questions.repository";
import { SubmissionsRepository } from "./infrastructure/submissions.repository";
import { CompetitionsRepository } from "./infrastructure/competitions.repository";

/**
 * OlympiadModule — Quiz & Digital Culture Olympiad, rut gon cho MVP (quiz solo + phong thi
 * polling). Import OrganizationModule (facade) de kiem tra quyen so huu khi 1 competition duoc
 * gan cho to chuc (FR-ORG-003/004) — khong dong truc tiep vao repository cua Organization.
 */
@Module({
  imports: [OrganizationModule],
  controllers: [OlympiadController],
  providers: [OlympiadService, QuestionsRepository, SubmissionsRepository, CompetitionsRepository],
})
export class OlympiadModule {}
