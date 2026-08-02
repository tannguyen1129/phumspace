import { Injectable, NotFoundException } from '@nestjs/common';
import { QuizRepository } from '../repositories/quiz.repository';
import { QuizMapper } from '../mappers/quiz.mapper';
import { QuizSummaryDto, QuizDetailDto } from '../dto/response/quiz-response.dto';

@Injectable()
export class QuizService {
  constructor(private readonly quizRepository: QuizRepository) {}

  async getPublishedQuizzes(): Promise<QuizSummaryDto[]> {
    const quizzes = await this.quizRepository.findPublishedQuizzes();
    return quizzes.map((q) => QuizMapper.toQuizSummaryDto(q));
  }

  async getPublishedQuizBySlug(slug: string): Promise<QuizDetailDto> {
    const quiz = await this.quizRepository.findPublishedQuizBySlug(slug);
    if (!quiz) {
      throw new NotFoundException({
        errorCode: 'QUIZ_NOT_FOUND',
        message: `Không tìm thấy thử thách quiz với slug "${slug}" hoặc quiz chưa được công bố.`,
      });
    }

    if (!quiz.questions || quiz.questions.length === 0) {
      throw new NotFoundException({
        errorCode: 'QUIZ_HAS_NO_PUBLISHED_QUESTIONS',
        message: `Thử thách quiz "${quiz.title}" chưa có câu hỏi nào được công bố.`,
      });
    }

    return QuizMapper.toQuizDetailDto(quiz);
  }
}
