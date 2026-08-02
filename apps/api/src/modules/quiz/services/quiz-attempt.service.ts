import { Injectable, Inject, Optional, NotFoundException, BadRequestException } from '@nestjs/common';
import { QuizRepository } from '../repositories/quiz.repository';
import { QuizAttemptRepository } from '../repositories/quiz-attempt.repository';
import { QuizScoringService } from './quiz-scoring.service';
import { QuizMapper } from '../mappers/quiz.mapper';
import { PassportRewardService } from '../../passport/services/passport-reward.service';
import { PassportService } from '../../passport/services/passport.service';
import {
  StartQuizAttemptResponseDto,
  SubmitQuizAnswerResponseDto,
  CompleteQuizResponseDto,
  QuizResultDto,
} from '../dto/response/quiz-response.dto';

@Injectable()
export class QuizAttemptService {
  constructor(
    private readonly quizRepository: QuizRepository,
    private readonly attemptRepository: QuizAttemptRepository,
    private readonly scoringService: QuizScoringService,
    @Optional() private readonly passportRewardService?: PassportRewardService,
    @Optional() private readonly passportService?: PassportService,
  ) {}

  async startAttempt(quizSlug: string): Promise<StartQuizAttemptResponseDto> {
    const quiz = await this.quizRepository.findPublishedQuizBySlug(quizSlug);
    if (!quiz) {
      throw new NotFoundException({
        errorCode: 'QUIZ_NOT_FOUND',
        message: `Không tìm thấy thử thách quiz với slug "${quizSlug}" hoặc quiz chưa được công bố.`,
      });
    }

    const publishedQuestions = (quiz.questions || []).filter((q: any) => q.status === 'PUBLISHED');
    if (publishedQuestions.length === 0) {
      throw new BadRequestException({
        errorCode: 'QUIZ_HAS_NO_PUBLISHED_QUESTIONS',
        message: `Thử thách quiz "${quiz.title}" chưa có câu hỏi công bố.`,
      });
    }

    const maxPossibleScore = publishedQuestions.reduce((sum: number, q: any) => sum + (q.points || 10), 0);

    const attempt = await this.attemptRepository.createAttempt({
      quizId: quiz.id,
      totalQuestions: publishedQuestions.length,
      maxPossibleScore,
    });

    const quizDetail = QuizMapper.toQuizDetailDto(quiz);

    return {
      attemptId: attempt.id,
      attemptToken: attempt.attemptToken,
      quiz: quizDetail,
      startedAt: attempt.startedAt.toISOString(),
    };
  }

  async submitAnswer(
    attemptId: string,
    questionId: string,
    selectedOptionId?: string,
  ): Promise<SubmitQuizAnswerResponseDto> {
    const attempt = await this.attemptRepository.findAttemptById(attemptId);
    if (!attempt) {
      throw new NotFoundException({
        errorCode: 'ATTEMPT_NOT_FOUND',
        message: 'Lượt làm quiz không tồn tại.',
      });
    }

    if (attempt.status === 'COMPLETED') {
      throw new BadRequestException({
        errorCode: 'ATTEMPT_ALREADY_COMPLETED',
        message: 'Lượt làm quiz này đã hoàn thành và không thể nộp thêm câu trả lời.',
      });
    }

    const question = await this.quizRepository.findQuestionById(questionId);
    if (!question || question.quizId !== attempt.quizId) {
      throw new BadRequestException({
        errorCode: 'QUESTION_NOT_IN_QUIZ',
        message: 'Câu hỏi không thuộc thử thách quiz này.',
      });
    }

    // Evaluate answer with QuizScoringService
    const evalResult = this.scoringService.evaluateAnswer(question, selectedOptionId);

    // Save answer to database
    await this.attemptRepository.upsertAnswer({
      attemptId,
      questionId,
      selectedOptionId,
      isCorrect: evalResult.isCorrect,
      awardedPoints: evalResult.awardedPoints,
    });

    // Format response
    const entity = question.heritageEntity;
    let relatedHeritageEntity: { id: string; slug: string; name: string } | undefined;

    if (entity) {
      const prefName = entity.currentVersion?.names?.find(
        (n: any) => n.nameType === 'PREFERRED' && n.language === 'vi',
      )?.originalValue || entity.canonicalCode;

      relatedHeritageEntity = {
        id: entity.id,
        slug: entity.canonicalCode,
        name: prefName,
      };
    }

    const publicSources = question.sourceResource
      ? [
          {
            id: question.sourceResource.id,
            title: question.sourceResource.title,
            locator: question.sourceResource.locator ?? undefined,
          },
        ]
      : [];

    return {
      questionId,
      isCorrect: evalResult.isCorrect,
      awardedPoints: evalResult.awardedPoints,
      explanation: question.explanation ?? undefined,
      relatedHeritageEntity,
      publicSources,
    };
  }

  async completeAttempt(attemptId: string, rawPassportToken?: string): Promise<CompleteQuizResponseDto> {
    const attempt = await this.attemptRepository.findAttemptById(attemptId);
    if (!attempt) {
      throw new NotFoundException({
        errorCode: 'ATTEMPT_NOT_FOUND',
        message: 'Lượt làm quiz không tồn tại.',
      });
    }

    if (attempt.status === 'COMPLETED') {
      return {
        attemptId: attempt.id,
        status: attempt.status,
        score: attempt.score,
        maxPossibleScore: attempt.maxPossibleScore,
        percentageScore: attempt.percentageScore,
        isPassed: attempt.isPassed,
        completedAt: attempt.completedAt?.toISOString() || new Date().toISOString(),
      };
    }

    const answers = attempt.answers || [];
    const summary = this.scoringService.calculateAttemptSummary(
      attempt.quiz,
      answers,
      attempt.maxPossibleScore,
    );

    const completed = await this.attemptRepository.completeAttempt({
      attemptId,
      score: summary.totalScore,
      percentageScore: summary.percentageScore,
      isPassed: summary.isPassed,
    });

    // Trigger Fail-safe Passport Reward if guest session token is provided
    if (rawPassportToken && this.passportService && this.passportRewardService) {
      const passport = await this.passportService.getPassportByRawToken(rawPassportToken);
      if (passport) {
        await this.passportRewardService.rewardQuizAttempt(passport.id, completed);
      }
    }

    return {
      attemptId: completed.id,
      status: completed.status,
      score: completed.score,
      maxPossibleScore: completed.maxPossibleScore,
      percentageScore: completed.percentageScore,
      isPassed: completed.isPassed,
      completedAt: completed.completedAt.toISOString(),
    };
  }

  async getAttemptResult(attemptId: string): Promise<QuizResultDto> {
    const attempt = await this.attemptRepository.findAttemptById(attemptId);
    if (!attempt) {
      throw new NotFoundException({
        errorCode: 'ATTEMPT_NOT_FOUND',
        message: 'Lượt làm quiz không tồn tại.',
      });
    }

    const reviews = (attempt.answers || []).map((ans: any) => {
      const q = ans.question;
      const options = q?.options || [];
      const correctOption = options.find((opt: any) => opt.isCorrect === true);

      const entity = q?.heritageEntity;
      let relatedHeritageEntity: { id: string; slug: string; name: string } | undefined;

      if (entity) {
        const prefName = entity.currentVersion?.names?.find(
          (n: any) => n.nameType === 'PREFERRED' && n.language === 'vi',
        )?.originalValue || entity.canonicalCode;

        relatedHeritageEntity = {
          id: entity.id,
          slug: entity.canonicalCode,
          name: prefName,
        };
      }

      return {
        questionId: ans.questionId,
        questionText: q?.questionText || '',
        selectedOptionId: ans.selectedOptionId ?? undefined,
        correctOptionId: correctOption?.id || '',
        isCorrect: ans.isCorrect,
        awardedPoints: ans.awardedPoints,
        explanation: q?.explanation ?? undefined,
        relatedHeritageEntity,
      };
    });

    return {
      attemptId: attempt.id,
      quizTitle: attempt.quiz?.title || '',
      quizSlug: attempt.quiz?.slug || '',
      score: attempt.score,
      maxPossibleScore: attempt.maxPossibleScore,
      percentageScore: attempt.percentageScore,
      passingScore: attempt.quiz?.passingScore || 70,
      isPassed: attempt.isPassed,
      completedAt: attempt.completedAt?.toISOString() || attempt.startedAt.toISOString(),
      reviews,
    };
  }
}
