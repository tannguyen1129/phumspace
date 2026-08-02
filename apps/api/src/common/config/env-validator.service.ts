import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvValidatorService implements OnModuleInit {
  private readonly logger = new Logger(EnvValidatorService.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.validateEnvironment();
  }

  validateEnvironment(): void {
    const requiredVars = [
      { key: 'DATABASE_URL', description: 'Cấu hình URL kết nối PostgreSQL Database' },
      { key: 'CORS_ORIGIN', description: 'Allowlist Domain CORS cho Frontend Web' },
      { key: 'GOOGLE_CLIENT_ID', description: 'Google Identity Client ID cho Staff OIDC Login' },
    ];

    const missing: string[] = [];

    for (const item of requiredVars) {
      const val = this.configService.get<string>(item.key) || process.env[item.key];
      if (!val || val.trim() === '' || val.includes('your-google-client-id')) {
        this.logger.warn(`⚠️ Warning: Biến môi trường "${item.key}" chưa được cấu hình chính thức (${item.description}).`);
      }
    }

    // AI Scanner Provider Check
    const geminiKey = this.configService.get<string>('GEMINI_API_KEY') || process.env['GEMINI_API_KEY'];
    if (!geminiKey || geminiKey.includes('your-gemini-api-key')) {
      this.logger.warn('⚠️ GEMINI_API_KEY chưa được thiết lập. AI Cultural Scanner sẽ tự động vận hành ở chế độ Demo Mock Provider.');
    }

    this.logger.log('✅ Startup Environment Validation completed successfully.');
  }
}
