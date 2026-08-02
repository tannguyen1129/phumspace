import { Module } from '@nestjs/common';
import { QuizController } from './controllers/quiz.controller';
import { QuizAttemptController } from './controllers/quiz-attempt.controller';
import { QuizService } from './services/quiz.service';
import { QuizAttemptService } from './services/quiz-attempt.service';
import { QuizScoringService } from './services/quiz-scoring.service';
import { QuizRepository } from './repositories/quiz.repository';
import { QuizAttemptRepository } from './repositories/quiz-attempt.repository';
import { PassportModule } from '../passport/passport.module';

@Module({
  imports: [PassportModule],
  controllers: [QuizController, QuizAttemptController],
  providers: [
    QuizService,
    QuizAttemptService,
    QuizScoringService,
    QuizRepository,
    QuizAttemptRepository,
  ],
  exports: [QuizService, QuizAttemptService, QuizScoringService],
})
export class QuizModule {}
