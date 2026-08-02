import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  QuizSummaryContract,
  QuizDetailContract,
  QuizQuestionContract,
  QuizOptionContract,
  StartQuizAttemptResponseContract,
  SubmitQuizAnswerResponseContract,
  CompleteQuizResponseContract,
  QuizResultContract,
  QuizAnswerReviewContract,
} from '@phumspace/contracts';

export class QuizOptionDto implements QuizOptionContract {
  @ApiProperty({ example: '11111111-1111-1111-1111-111111111111' })
  id!: string;

  @ApiProperty({ example: 'Wat Kompong Chray' })
  optionText!: string;

  @ApiProperty({ example: 1 })
  order!: number;
  // Tuyệt đối KHÔNG có isCorrect trong DTO public này!
}

export class QuizQuestionDto implements QuizQuestionContract {
  @ApiProperty({ example: '11111111-1111-1111-1111-111111111111' })
  id!: string;

  @ApiProperty({ example: 'Tên Khmer truyền thống của Chùa Âng tại Trà Vinh là gì?' })
  questionText!: string;

  @ApiProperty({ example: 'SINGLE_CHOICE' })
  questionType!: string;

  @ApiProperty({ example: 1 })
  order!: number;

  @ApiProperty({ example: 10 })
  points!: number;

  @ApiProperty({ type: [QuizOptionDto] })
  options!: QuizOptionDto[];
}

export class QuizSummaryDto implements QuizSummaryContract {
  @ApiProperty({ example: '11111111-1111-1111-1111-111111111111' })
  id!: string;

  @ApiProperty({ example: 'thu-thach-di-san-tra-vinh' })
  slug!: string;

  @ApiProperty({ example: 'Thử thách Kiến thức Di sản Văn hóa Trà Vinh' })
  title!: string;

  @ApiPropertyOptional({ example: 'Cùng PhumSpace kiểm tra kiến thức về chùa cổ Chùa Âng' })
  description?: string;

  @ApiProperty({ example: 'EASY' })
  difficulty!: string;

  @ApiProperty({ example: 70 })
  passingScore!: number;

  @ApiProperty({ example: 5 })
  estimatedMinutes!: number;

  @ApiProperty({ example: 6 })
  totalQuestions!: number;

  @ApiProperty({ example: '2026-08-01T00:00:00.000Z' })
  createdAt!: string;
}

export class QuizDetailDto extends QuizSummaryDto implements QuizDetailContract {
  @ApiProperty({ type: [QuizQuestionDto] })
  questions!: QuizQuestionDto[];
}

export class StartQuizAttemptResponseDto implements StartQuizAttemptResponseContract {
  @ApiProperty({ example: '33333333-3333-3333-3333-333333333333' })
  attemptId!: string;

  @ApiProperty({ example: '44444444-4444-4444-4444-444444444444' })
  attemptToken!: string;

  @ApiProperty({ type: QuizDetailDto })
  quiz!: QuizDetailDto;

  @ApiProperty({ example: '2026-08-01T20:00:00.000Z' })
  startedAt!: string;
}

export class SubmitQuizAnswerResponseDto implements SubmitQuizAnswerResponseContract {
  @ApiProperty({ example: '11111111-1111-1111-1111-111111111111' })
  questionId!: string;

  @ApiProperty({ example: true })
  isCorrect!: boolean;

  @ApiProperty({ example: 10 })
  awardedPoints!: number;

  @ApiPropertyOptional({ example: 'Chùa Âng có tên Khmer chính thức là Wat Kompong Chray.' })
  explanation?: string;

  @ApiPropertyOptional({
    example: { id: 'entity-1', slug: 'chua-hang-tra-vinh', name: 'Chùa Âng' },
  })
  relatedHeritageEntity?: {
    id: string;
    slug: string;
    name: string;
  };

  @ApiProperty({
    example: [{ id: 'src-1', title: 'Địa chí Trà Vinh', locator: 'tr. 145' }],
  })
  publicSources!: {
    id: string;
    title: string;
    locator?: string;
  }[];
}

export class CompleteQuizResponseDto implements CompleteQuizResponseContract {
  @ApiProperty({ example: '33333333-3333-3333-3333-333333333333' })
  attemptId!: string;

  @ApiProperty({ example: 'COMPLETED' })
  status!: string;

  @ApiProperty({ example: 60 })
  score!: number;

  @ApiProperty({ example: 60 })
  maxPossibleScore!: number;

  @ApiProperty({ example: 100.0 })
  percentageScore!: number;

  @ApiProperty({ example: true })
  isPassed!: boolean;

  @ApiProperty({ example: '2026-08-01T20:05:00.000Z' })
  completedAt!: string;
}

export class QuizAnswerReviewDto implements QuizAnswerReviewContract {
  @ApiProperty({ example: '11111111-1111-1111-1111-111111111111' })
  questionId!: string;

  @ApiProperty({ example: 'Tên Khmer truyền thống của Chùa Âng tại Trà Vinh là gì?' })
  questionText!: string;

  @ApiPropertyOptional({ example: 'opt-1' })
  selectedOptionId?: string;

  @ApiProperty({ example: 'opt-1' })
  correctOptionId!: string;

  @ApiProperty({ example: true })
  isCorrect!: boolean;

  @ApiProperty({ example: 10 })
  awardedPoints!: number;

  @ApiPropertyOptional({ example: 'Chùa Âng có tên Khmer chính thức là Wat Kompong Chray.' })
  explanation?: string;

  @ApiPropertyOptional({
    example: { id: 'entity-1', slug: 'chua-hang-tra-vinh', name: 'Chùa Âng' },
  })
  relatedHeritageEntity?: {
    id: string;
    slug: string;
    name: string;
  };
}

export class QuizResultDto implements QuizResultContract {
  @ApiProperty({ example: '33333333-3333-3333-3333-333333333333' })
  attemptId!: string;

  @ApiProperty({ example: 'Thử thách Kiến thức Di sản Văn hóa Trà Vinh' })
  quizTitle!: string;

  @ApiProperty({ example: 'thu-thach-di-san-tra-vinh' })
  quizSlug!: string;

  @ApiProperty({ example: 60 })
  score!: number;

  @ApiProperty({ example: 60 })
  maxPossibleScore!: number;

  @ApiProperty({ example: 100.0 })
  percentageScore!: number;

  @ApiProperty({ example: 70 })
  passingScore!: number;

  @ApiProperty({ example: true })
  isPassed!: boolean;

  @ApiProperty({ example: '2026-08-01T20:05:00.000Z' })
  completedAt!: string;

  @ApiProperty({ type: [QuizAnswerReviewDto] })
  reviews!: QuizAnswerReviewDto[];
}
