import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envConfig } from './config/env.config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { PhumDataModule } from './modules/phum-data/phum-data.module';
import { AiModule } from './modules/ai/ai.module';
import { QuizModule } from './modules/quiz/quiz.module';
import { PassportModule } from './modules/passport/passport.module';
import { ContributionModule } from './modules/contribution/contribution.module';
import { AdminModule } from './modules/admin/admin.module';
import { HandbookModule } from './modules/handbook/handbook.module';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { EnvValidatorService } from './common/config/env-validator.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
    }),
    PrismaModule,
    HealthModule,
    PhumDataModule,
    AiModule,
    QuizModule,
    PassportModule,
    ContributionModule,
    AdminModule,
    HandbookModule,
  ],
  providers: [EnvValidatorService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
