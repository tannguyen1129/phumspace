import { Injectable, BadRequestException } from '@nestjs/common';

export interface ScoreEvaluationResult {
  isCorrect: boolean;
  awardedPoints: number;
  selectedOption: any | null;
  correctOption: any | null;
}

@Injectable()
export class QuizScoringService {
  /**
   * Đánh giá câu trả lời của 1 câu hỏi
   */
  evaluateAnswer(
    question: any,
    selectedOptionId?: string,
  ): ScoreEvaluationResult {
    const options = question.options || [];
    const correctOption = options.find((opt: any) => opt.isCorrect === true);

    if (!selectedOptionId) {
      // Người dùng chọn bỏ qua câu hỏi
      return {
        isCorrect: false,
        awardedPoints: 0,
        selectedOption: null,
        correctOption: correctOption || null,
      };
    }

    const selectedOption = options.find((opt: any) => opt.id === selectedOptionId);
    if (!selectedOption) {
      throw new BadRequestException({
        errorCode: 'INVALID_OPTION',
        message: 'Lựa chọn không hợp lệ cho câu hỏi này.',
      });
    }

    const isCorrect = selectedOption.isCorrect === true;
    const awardedPoints = isCorrect ? question.points || 10 : 0;

    return {
      isCorrect,
      awardedPoints,
      selectedOption,
      correctOption: correctOption || null,
    };
  }

  /**
   * Tính toán kết quả lượt làm quiz đã hoàn thành
   */
  calculateAttemptSummary(
    quiz: any,
    answers: any[],
    maxPossibleScore: number,
  ) {
    const totalScore = answers.reduce(
      (sum, ans) => sum + (ans.awardedPoints || 0),
      0,
    );

    const safeMax = maxPossibleScore > 0 ? maxPossibleScore : 1;
    const percentageScore = Math.round((totalScore / safeMax) * 100 * 100) / 100;
    const isPassed = percentageScore >= (quiz.passingScore || 70);

    return {
      totalScore,
      percentageScore,
      isPassed,
    };
  }
}
