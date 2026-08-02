import {
  QuizSummaryDto,
  QuizDetailDto,
  QuizQuestionDto,
  QuizOptionDto,
} from '../dto/response/quiz-response.dto';

export class QuizMapper {
  static toQuizSummaryDto(quiz: any): QuizSummaryDto {
    const publishedQuestionsCount = quiz.questions
      ? quiz.questions.filter((q: any) => q.status === 'PUBLISHED').length
      : 0;

    return {
      id: quiz.id,
      slug: quiz.slug,
      title: quiz.title,
      description: quiz.description ?? undefined,
      difficulty: quiz.difficulty,
      passingScore: quiz.passingScore,
      estimatedMinutes: quiz.estimatedMinutes,
      totalQuestions: publishedQuestionsCount,
      createdAt: quiz.createdAt.toISOString(),
    };
  }

  static toQuizDetailDto(quiz: any): QuizDetailDto {
    const summary = this.toQuizSummaryDto(quiz);
    const publishedQuestions = (quiz.questions || [])
      .filter((q: any) => q.status === 'PUBLISHED')
      .sort((a: any, b: any) => a.order - b.order)
      .map((q: any) => this.toQuizQuestionDto(q));

    return {
      ...summary,
      questions: publishedQuestions,
    };
  }

  static toQuizQuestionDto(question: any): QuizQuestionDto {
    const sortedOptions = (question.options || [])
      .sort((a: any, b: any) => a.order - b.order)
      .map((opt: any) => this.toQuizOptionDto(opt));

    return {
      id: question.id,
      questionText: question.questionText,
      questionType: question.questionType,
      order: question.order,
      points: question.points,
      options: sortedOptions,
    };
  }

  static toQuizOptionDto(option: any): QuizOptionDto {
    // Tuyệt đối loại bỏ isCorrect khỏi Public Option DTO!
    return {
      id: option.id,
      optionText: option.optionText,
      order: option.order,
    };
  }
}
