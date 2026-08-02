import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScannerController } from './controllers/scanner.controller';
import { ScannerService } from './services/scanner.service';
import { ImageValidatorService } from './services/image-validator.service';
import { CandidateRetrievalService } from './services/candidate-retrieval.service';
import { DecisionEngineService } from './services/decision-engine.service';
import { GeminiAiProvider } from './providers/gemini-ai.provider';
import { MockAiProvider } from './providers/mock-ai.provider';
import { PassportModule } from '../passport/passport.module';

@Module({
  imports: [ConfigModule, PassportModule],
  controllers: [ScannerController],
  providers: [
    ScannerService,
    ImageValidatorService,
    CandidateRetrievalService,
    DecisionEngineService,
    GeminiAiProvider,
    MockAiProvider,
    {
      provide: 'AiProvider',
      useFactory: (geminiProvider: GeminiAiProvider, mockProvider: MockAiProvider) => {
        if (process.env.NODE_ENV === 'test') {
          return mockProvider;
        }
        return geminiProvider;
      },
      inject: [GeminiAiProvider, MockAiProvider],
    },
  ],
  exports: [ScannerService, ImageValidatorService, CandidateRetrievalService, DecisionEngineService],
})
export class AiModule {}
