import { Controller, Post, Get, Param, Body, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { QuizAttemptService } from '../services/quiz-attempt.service';
import { SubmitQuizAnswerRequestDto } from '../dto/request/submit-answer.dto';
import {
  SubmitQuizAnswerResponseDto,
  CompleteQuizResponseDto,
  QuizResultDto,
} from '../dto/response/quiz-response.dto';

@ApiTags('Cultural Quiz Attempts')
@Controller('quiz-attempts')
export class QuizAttemptController {
  constructor(private readonly quizAttemptService: QuizAttemptService) {}

  @Post(':attemptId/answers')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Nộp câu trả lời cho một câu hỏi trong lượt làm Quiz',
    description: 'Chấm điểm câu trả lời ở backend và trả về phản hồi tức thì kèm giải thích chứng cứ PhumData.',
  })
  @ApiParam({ name: 'attemptId', example: '33333333-3333-3333-3333-333333333333' })
  @ApiResponse({
    status: 200,
    description: 'Nộp câu trả lời thành công',
    type: SubmitQuizAnswerResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Câu hỏi hoặc lựa chọn không hợp lệ, hoặc lượt làm đã hoàn thành',
  })
  async submitAnswer(
    @Param('attemptId') attemptId: string,
    @Body() dto: SubmitQuizAnswerRequestDto,
  ): Promise<SubmitQuizAnswerResponseDto> {
    return this.quizAttemptService.submitAnswer(
      attemptId,
      dto.questionId,
      dto.selectedOptionId,
    );
  }

  @Post(':attemptId/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Hoàn thành lượt làm Quiz (Finalize Quiz Attempt)',
    description: 'Tổng kết điểm số lượt làm bài, tính toán phần trăm và quyết định nhãn Đạt/Chưa đạt (Tự động cộng điểm Phum Passport nếu có session cookie).',
  })
  @ApiParam({ name: 'attemptId', example: '33333333-3333-3333-3333-333333333333' })
  @ApiResponse({
    status: 200,
    description: 'Hoàn thành bài quiz thành công',
    type: CompleteQuizResponseDto,
  })
  async completeAttempt(
    @Param('attemptId') attemptId: string,
    @Req() req: Request,
  ): Promise<CompleteQuizResponseDto> {
    const rawPassportToken = req.cookies?.['phum_passport_session'];
    return this.quizAttemptService.completeAttempt(attemptId, rawPassportToken);
  }

  @Get(':attemptId/result')
  @ApiOperation({
    summary: 'Lấy bảng kết quả chi tiết của lượt làm Quiz',
    description: 'Xem lại điểm số, phần trăm đạt, các câu trả lời đúng/sai và lời giải thích tri thức di sản.',
  })
  @ApiParam({ name: 'attemptId', example: '33333333-3333-3333-3333-333333333333' })
  @ApiResponse({
    status: 200,
    description: 'Bảng kết quả chi tiết lượt làm quiz',
    type: QuizResultDto,
  })
  async getResult(
    @Param('attemptId') attemptId: string,
  ): Promise<QuizResultDto> {
    return this.quizAttemptService.getAttemptResult(attemptId);
  }
}
