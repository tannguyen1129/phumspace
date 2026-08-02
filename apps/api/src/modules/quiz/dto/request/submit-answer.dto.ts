import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsOptional } from 'class-validator';
import { SubmitQuizAnswerRequestContract } from '@phumspace/contracts';

export class SubmitQuizAnswerRequestDto implements SubmitQuizAnswerRequestContract {
  @ApiProperty({ example: '11111111-1111-1111-1111-111111111111', description: 'ID câu hỏi trong Quiz' })
  @IsUUID()
  @IsNotEmpty()
  questionId!: string;

  @ApiPropertyOptional({ example: '22222222-2222-2222-2222-222222222222', description: 'ID lựa chọn được chọn (bỏ trống nếu chọn bỏ qua câu hỏi)' })
  @IsUUID()
  @IsOptional()
  selectedOptionId?: string;
}
