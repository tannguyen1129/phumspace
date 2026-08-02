import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 3001;
  const apiPrefix = configService.get<string>('apiPrefix') || '/api/v1';
  const corsOrigin = configService.get<string>('corsOrigin') || 'http://localhost:3000';

  // Enable Cookie Parser for HttpOnly Session Cookie parsing
  app.use(cookieParser());

  // Global prefix
  app.setGlobalPrefix(apiPrefix);

  // Request validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS configuration for local development supporting credentials
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Swagger / OpenAPI setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('PhumSpace REST API')
    .setDescription('Tài liệu API PhumSpace — Nền tảng số hóa & bảo tồn di sản văn hóa Khmer Nam Bộ (PhumData Core & Passport)')
    .setVersion('1.0')
    .addTag('Health', 'Kiểm tra trạng thái dịch vụ')
    .addTag('Heritage Entities', 'Truy vấn các thực thể di sản văn hóa đã công bố (PUBLISHED)')
    .addTag('Places', 'Truy vấn danh sách và chi tiết địa điểm')
    .addTag('Categories', 'Truy vấn danh mục di sản văn hóa')
    .addTag('AI Scanner', 'Phân tích & đối chiếu di sản bằng AI Gemini')
    .addTag('Cultural Quiz', 'Thử thách kiến thức di sản văn hóa')
    .addTag('Phum Passport', 'Hồ sơ hành trình văn hóa guest user & huy hiệu thành tựu')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
  logger.log(`PhumSpace API is running on: http://localhost:${port}${apiPrefix}`);
  logger.log(`Swagger OpenAPI Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
