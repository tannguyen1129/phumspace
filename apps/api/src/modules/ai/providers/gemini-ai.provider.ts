import { Injectable, Logger, ServiceUnavailableException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import {
  AiProvider,
  VisualObservationResult,
  PhumDataCandidateBundle,
  GroundedSynthesisResult,
} from '../interfaces/ai-provider.interface';
import { VISUAL_OBSERVATION_SYSTEM_INSTRUCTION } from '../prompts/visual-observation.prompt';
import { GROUNDED_SYNTHESIS_SYSTEM_INSTRUCTION } from '../prompts/grounded-synthesis.prompt';

@Injectable()
export class GeminiAiProvider implements AiProvider {
  private readonly logger = new Logger(GeminiAiProvider.name);
  private readonly ai: GoogleGenAI | null = null;
  private readonly modelName: string;
  private readonly timeoutMs: number;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.modelName = this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.5-flash';
    this.timeoutMs = parseInt(this.configService.get<string>('GEMINI_REQUEST_TIMEOUT_MS') || '10000', 10);

    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    } else {
      this.logger.warn('GEMINI_API_KEY chưa được cấu hình. GeminiAiProvider hoạt động ở chế độ chờ.');
    }
  }

  async analyzeImageObservation(params: {
    imageBuffer: Buffer;
    mimeType: string;
  }): Promise<VisualObservationResult> {
    if (!this.ai) {
      throw new ServiceUnavailableException({
        errorCode: 'AI_PROVIDER_UNAVAILABLE',
        message: 'Khóa API Gemini chưa được cấu hình trên máy chủ.',
      });
    }

    try {
      const base64Image = params.imageBuffer.toString('base64');
      const response = await this.executeWithTimeout(
        this.ai.models.generateContent({
          model: this.modelName,
          contents: [
            {
              role: 'user',
              parts: [
                { text: 'Trích xuất đặc điểm thị giác quan sát được từ tấm ảnh này theo đúng định dạng JSON.' },
                {
                  inlineData: {
                    mimeType: params.mimeType,
                    data: base64Image,
                  },
                },
              ],
            },
          ],
          config: {
            systemInstruction: VISUAL_OBSERVATION_SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        }),
      );

      const text = response.text;
      if (!text) throw new Error('Gemini API trả về nội dung rỗng');
      return JSON.parse(text) as VisualObservationResult;
    } catch (err: any) {
      this.logger.error(`Lỗi Stage 1 Visual Observation: ${err.message}`);
      if (err.name === 'AbortError' || err.message?.includes('timeout')) {
        throw new ServiceUnavailableException({
          errorCode: 'AI_PROVIDER_UNAVAILABLE',
          message: 'Hệ thống Gemini API phản hồi quá thời gian cho phép.',
        });
      }
      throw new InternalServerErrorException({
        errorCode: 'AI_RESPONSE_INVALID',
        message: 'Không thể phân tích đặc điểm hình ảnh từ Gemini API.',
      });
    }
  }

  async synthesizeGroundedAnalysis(params: {
    observation: VisualObservationResult;
    candidates: PhumDataCandidateBundle[];
  }): Promise<GroundedSynthesisResult> {
    if (!this.ai) {
      throw new ServiceUnavailableException({
        errorCode: 'AI_PROVIDER_UNAVAILABLE',
        message: 'Khóa API Gemini chưa được cấu hình trên máy chủ.',
      });
    }

    try {
      const promptContext = JSON.stringify({
        observation: params.observation,
        publishedCandidates: params.candidates,
      });

      const response = await this.executeWithTimeout(
        this.ai.models.generateContent({
          model: this.modelName,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `Dưới đây là thông tin đặc điểm thị giác quan sát được và danh sách candidate PhumData PUBLISHED hợp lệ:\n${promptContext}`,
                },
              ],
            },
          ],
          config: {
            systemInstruction: GROUNDED_SYNTHESIS_SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        }),
      );

      const text = response.text;
      if (!text) throw new Error('Gemini API trả về kết quả tổng hợp rỗng');
      return JSON.parse(text) as GroundedSynthesisResult;
    } catch (err: any) {
      this.logger.error(`Lỗi Stage 3 Grounded Synthesis: ${err.message}`);
      if (err.name === 'AbortError' || err.message?.includes('timeout')) {
        throw new ServiceUnavailableException({
          errorCode: 'AI_PROVIDER_UNAVAILABLE',
          message: 'Hệ thống Gemini API phản hồi quá thời gian cho phép.',
        });
      }
      throw new InternalServerErrorException({
        errorCode: 'AI_RESPONSE_INVALID',
        message: 'Không thể tổng hợp kết quả đối chiếu dữ liệu di sản.',
      });
    }
  }

  private async executeWithTimeout<T>(promise: Promise<T>): Promise<T> {
    let timer: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        const err = new Error('Gemini API request timeout');
        err.name = 'AbortError';
        reject(err);
      }, this.timeoutMs);
    });

    try {
      const res = await Promise.race([promise, timeoutPromise]);
      clearTimeout(timer!);
      return res;
    } catch (err) {
      clearTimeout(timer!);
      throw err;
    }
  }
}
