import { Module } from "@nestjs/common";
import { HandbookController } from "./interface/handbook.controller";
import { HandbookService } from "./application/handbook.service";
import { TermsRepository } from "./infrastructure/terms.repository";
import { TermAudioRepository } from "./infrastructure/term-audio.repository";
import { LearningProgressRepository } from "./infrastructure/learning-progress.repository";

/** HandbookModule — Interactive Khmer Handbook (tu vung, audio nguoi ban dia, tien do hoc). */
@Module({
  controllers: [HandbookController],
  providers: [HandbookService, TermsRepository, TermAudioRepository, LearningProgressRepository],
  exports: [HandbookService],
})
export class HandbookModule {}
