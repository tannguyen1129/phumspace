import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminStaffService } from '../services/admin-staff.service';
import { AdminSessionGuard } from '../guards/admin-session.guard';
import { AdminRolesGuard } from '../guards/admin-roles.guard';
import { RequireRoles } from '../decorators/require-roles.decorator';
import { StaffRole } from '@prisma/client';
import { AdminSecuritySessionDto } from '../dto/admin-auth.dto';

@ApiTags('Admin Staff Management')
@Controller('admin/security')
@UseGuards(AdminSessionGuard, AdminRolesGuard)
export class AdminStaffController {
  constructor(private readonly adminStaffService: AdminStaffService) {}

  @Get('sessions')
  @RequireRoles(StaffRole.ADMIN)
  @ApiOperation({
    summary: 'Danh sách các phiên đăng nhập nhân sự active (Chỉ dành cho ADMIN)',
    description: 'Truy vấn nhật ký các phiên đăng nhập active của nhân sự trong toàn hệ thống.',
  })
  @ApiResponse({ status: 200, description: 'Danh sách security sessions', type: [AdminSecuritySessionDto] })
  async getActiveSessions(): Promise<AdminSecuritySessionDto[]> {
    return this.adminStaffService.getActiveSecuritySessions();
  }
}
