import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  AdminLoginRequestContract,
  AdminSessionContract,
  StaffProfileContract,
  AdminSecuritySessionContract,
} from '@phumspace/contracts';

export class AdminLoginRequestDto implements AdminLoginRequestContract {
  @ApiProperty({ example: 'mock-google-id-token-admin.demo@phumspace.vn', description: 'Google OAuth ID Token từ frontend' })
  @IsString()
  @IsNotEmpty()
  idToken!: string;
}

export class AdminSessionResponseDto implements AdminSessionContract {
  @ApiProperty({ example: 'SUCCESS' })
  status!: string;

  @ApiProperty({ example: 'Đăng nhập Admin thành công.' })
  message!: string;
}

export class StaffProfileDto implements StaffProfileContract {
  @ApiProperty({ example: '11111111-1111-1111-1111-111111111111' })
  id!: string;

  @ApiProperty({ example: 'admin.demo@phumspace.vn' })
  email!: string;

  @ApiProperty({ example: 'Admin Demo' })
  displayName?: string;

  @ApiProperty({ example: ['ADMIN'], type: [String] })
  roles!: ('REVIEWER' | 'EDITOR' | 'ADMIN')[];

  @ApiProperty({ example: '2026-08-02T18:00:00.000Z' })
  sessionExpiresAt!: string;

  @ApiProperty({ example: '2026-08-02T10:00:00.000Z' })
  lastLoginAt?: string;
}

export class AdminSecuritySessionDto implements AdminSecuritySessionContract {
  @ApiProperty({ example: '11111111-1111-1111-1111-111111111111' })
  sessionId!: string;

  @ApiProperty({ example: 'admin.demo@phumspace.vn' })
  staffEmail!: string;

  @ApiProperty({ example: ['ADMIN'], type: [String] })
  roles!: string[];

  @ApiProperty({ example: '2026-08-02T10:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-08-02T10:05:00.000Z' })
  lastSeenAt!: string;

  @ApiProperty({ example: '2026-08-02T18:00:00.000Z' })
  expiresAt!: string;
}
