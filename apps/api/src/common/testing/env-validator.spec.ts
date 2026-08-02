import { EnvValidatorService } from '../config/env-validator.service';
import { ConfigService } from '@nestjs/config';

describe('EnvValidatorService (Sprint 8A Observability Tests)', () => {
  let envValidator: EnvValidatorService;
  let configService: ConfigService;

  beforeEach(() => {
    configService = new ConfigService({
      DATABASE_URL: 'postgresql://phumspace:phumspace_dev_password@localhost:5432/phumspace?schema=public',
      CORS_ORIGIN: 'http://localhost:3000',
      GOOGLE_CLIENT_ID: 'valid-google-client-id.apps.googleusercontent.com',
      GEMINI_API_KEY: 'valid-gemini-key',
    });
    envValidator = new EnvValidatorService(configService);
  });

  it('1. Should validate environment successfully without throwing errors', () => {
    expect(() => envValidator.validateEnvironment()).not.toThrow();
  });
});
