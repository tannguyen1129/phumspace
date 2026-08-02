import { Controller, Get, Post, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { QuizService } from '../services/quiz.service';
import { QuizAttemptService } from '../services/quiz-attempt.service';
import {
  QuizSummaryDto,
  QuizDetailDto,
  StartQuizAttemptResponseDto,
} from '../dto/response/quiz-response.dto';

@ApiTags('Cultural Quiz')
@Controller('quizzes')
export class QuizController {
  constructor(
    private readonly quizService: QuizService,
    private readonly quizAttemptService: QuizAttemptService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách các thử thách Cultural Quiz đã công bố (PUBLISHED)',
    description: 'Truy vấn danh sách các bài thử thách kiến thức di sản văn hóa công khai.',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách bài thử thách quiz',
    type: [QuizSummaryDto],
  })
  async getQuizzes(): Promise<QuizSummaryDto[]> {
    return this.quizService.getPublishedQuizzes();
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'Lấy chi tiết thử thách Quiz theo slug (Không chứa đáp án đúng)',
    description: 'Truy vấn chi tiết quiz kèm danh sách câu hỏi và lựa chọn (isCorrect tuyệt đối được bảo mật giấu kín).',
  })
  @ApiParam({ name: 'slug', example: 'thu-thach-di-san-tra-vinh' })
  @ApiResponse({
    status: 200,
    description: 'Chi tiết bài thử thách quiz',
    type: QuizDetailDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy quiz hoặc quiz ở trạng thái DRAFT',
  })
  async getQuizBySlug(@Param('slug') slug: string): Promise<QuizDetailDto> {
    return this.quizService.getPublishedQuizBySlug(slug);
  }

  @Post(':slug/attempts')
  @ApiOperation({
    summary: 'Khởi tạo lượt làm quiz mới cho Guest User (Start Quiz Attempt)',
    description: 'Tạo một attempt token mới và trả về danh sách câu hỏi để làm bài.',
  })
  @ApiParam({ name: 'slug', example: 'thu-thach-di-san-tra-vinh' })
  @ApiResponse({
    status: 201,
    description: 'Khởi tạo attempt thành công',
    type: StartQuizAttemptResponseDto,
  })
  async startAttempt(@Param('slug') slug: string): Promise<StartQuizAttemptResponseDto> {
    return this.quizAttemptService.startAttempt(slug);
  }
}
