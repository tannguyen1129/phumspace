import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ContributionRepository } from '../repositories/contribution.repository';
import { ContributionMediaService } from './contribution-media.service';
import { ContributionStateMachine } from './contribution-state.machine';
import { ContributionMapper } from '../mappers/contribution.mapper';
import { CreateContributionDto } from '../dto/request/create-contribution.dto';
import { UpdateContributionDto } from '../dto/request/update-contribution.dto';
import {
  ContributionSummaryDto,
  ContributionDetailDto,
} from '../dto/response/contribution-response.dto';
import { ContributionStatus } from '@prisma/client';

@Injectable()
export class ContributionService {
  constructor(
    private readonly contributionRepo: ContributionRepository,
    private readonly mediaService: ContributionMediaService,
  ) {}

  async createContribution(
    passportId: string,
    dto: CreateContributionDto,
  ): Promise<ContributionDetailDto> {
    if (!dto.consent || dto.consent.contributorOwnsRights !== true) {
      throw new BadRequestException({
        errorCode: 'CONTRIBUTION_CONSENT_REQUIRED',
        message: 'Bạn phải xác nhận sở hữu hoặc có quyền cung cấp tư liệu này.',
      });
    }

    const initialStatus = dto.submitImmediately
      ? ContributionStatus.SUBMITTED
      : ContributionStatus.DRAFT;

    const entity = await this.contributionRepo.createContribution({
      passportId,
      contributionType: dto.contributionType,
      status: initialStatus,
      title: dto.title,
      description: dto.description,
      languageCode: dto.languageCode,
      relatedHeritageEntityId: dto.relatedHeritageEntityId,
      relatedPlaceId: dto.relatedPlaceId,
      consent: dto.consent,
      submittedAt: dto.submitImmediately ? new Date() : undefined,
    });

    return ContributionMapper.toDetailDto(entity);
  }

  async getMyContributions(
    passportId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: ContributionSummaryDto[]; total: number }> {
    const result = await this.contributionRepo.findByPassportIdPaginated(passportId, page, limit);
    return {
      data: result.data.map((c) => ContributionMapper.toSummaryDto(c)),
      total: result.total,
    };
  }

  async getContributionDetail(
    publicId: string,
    passportId: string,
  ): Promise<ContributionDetailDto> {
    const entity = await this.contributionRepo.findByPublicId(publicId);
    if (!entity) {
      throw new NotFoundException({
        errorCode: 'CONTRIBUTION_NOT_FOUND',
        message: 'Bản đóng góp không tồn tại.',
      });
    }

    if (entity.passportId !== passportId) {
      throw new ForbiddenException({
        errorCode: 'CONTRIBUTION_FORBIDDEN',
        message: 'Bạn không có quyền truy cập bản đóng góp này.',
      });
    }

    return ContributionMapper.toDetailDto(entity);
  }

  async updateDraft(
    publicId: string,
    passportId: string,
    dto: UpdateContributionDto,
  ): Promise<ContributionDetailDto> {
    const entity = await this.contributionRepo.findByPublicId(publicId);
    if (!entity) {
      throw new NotFoundException({
        errorCode: 'CONTRIBUTION_NOT_FOUND',
        message: 'Bản đóng góp không tồn tại.',
      });
    }

    if (entity.passportId !== passportId) {
      throw new ForbiddenException({
        errorCode: 'CONTRIBUTION_FORBIDDEN',
        message: 'Bạn không có quyền chỉnh sửa bản đóng góp này.',
      });
    }

    if (
      entity.status !== ContributionStatus.DRAFT &&
      entity.status !== ContributionStatus.NEEDS_MORE_INFORMATION
    ) {
      throw new BadRequestException({
        errorCode: 'CONTRIBUTION_NOT_EDITABLE',
        message: 'Chỉ có thể chỉnh sửa bản đóng góp ở trạng thái Bản thảo (DRAFT) hoặc Cần bổ sung thông tin.',
      });
    }

    const updated = await this.contributionRepo.updateContribution(publicId, dto);
    return ContributionMapper.toDetailDto(updated);
  }

  async uploadMedia(
    publicId: string,
    passportId: string,
    file?: Express.Multer.File,
  ): Promise<ContributionDetailDto> {
    const entity = await this.contributionRepo.findByPublicId(publicId);
    if (!entity) {
      throw new NotFoundException({
        errorCode: 'CONTRIBUTION_NOT_FOUND',
        message: 'Bản đóng góp không tồn tại.',
      });
    }

    if (entity.passportId !== passportId) {
      throw new ForbiddenException({
        errorCode: 'CONTRIBUTION_FORBIDDEN',
        message: 'Bạn không có quyền tải phương tiện cho bản đóng góp này.',
      });
    }

    if (
      entity.status !== ContributionStatus.DRAFT &&
      entity.status !== ContributionStatus.NEEDS_MORE_INFORMATION
    ) {
      throw new BadRequestException({
        errorCode: 'CONTRIBUTION_NOT_EDITABLE',
        message: 'Không thể thêm tệp phương tiện khi bản đóng góp đã được gửi kiểm duyệt.',
      });
    }

    const { metadata, mediaType } = await this.mediaService.validateAndSaveMedia(file);

    await this.contributionRepo.addMedia(entity.id, {
      mediaType,
      storageKey: metadata.storageKey,
      originalFileName: metadata.originalFileName,
      mimeType: metadata.mimeType,
      sizeBytes: metadata.sizeBytes,
      checksum: metadata.checksum,
    });

    const refreshed = await this.contributionRepo.findByPublicId(publicId);
    return ContributionMapper.toDetailDto(refreshed);
  }

  async submitContribution(publicId: string, passportId: string): Promise<ContributionDetailDto> {
    const entity = await this.contributionRepo.findByPublicId(publicId);
    if (!entity) {
      throw new NotFoundException({
        errorCode: 'CONTRIBUTION_NOT_FOUND',
        message: 'Bản đóng góp không tồn tại.',
      });
    }

    if (entity.passportId !== passportId) {
      throw new ForbiddenException({
        errorCode: 'CONTRIBUTION_FORBIDDEN',
        message: 'Bạn không có quyền thao tác bản đóng góp này.',
      });
    }

    if (!ContributionStateMachine.isGuestAllowedTransition(entity.status, ContributionStatus.SUBMITTED)) {
      throw new BadRequestException({
        errorCode: 'CONTRIBUTION_INVALID_STATUS_TRANSITION',
        message: `Không thể gửi bản đóng góp từ trạng thái ${entity.status}.`,
      });
    }

    const updated = await this.contributionRepo.transitionStatus(
      publicId,
      entity.status,
      ContributionStatus.SUBMITTED,
      'Gửi bản đóng góp vào hàng đợi kiểm duyệt thành công.',
    );

    return ContributionMapper.toDetailDto(updated);
  }

  async withdrawContribution(publicId: string, passportId: string): Promise<ContributionDetailDto> {
    const entity = await this.contributionRepo.findByPublicId(publicId);
    if (!entity) {
      throw new NotFoundException({
        errorCode: 'CONTRIBUTION_NOT_FOUND',
        message: 'Bản đóng góp không tồn tại.',
      });
    }

    if (entity.passportId !== passportId) {
      throw new ForbiddenException({
        errorCode: 'CONTRIBUTION_FORBIDDEN',
        message: 'Bạn không có quyền thao tác bản đóng góp này.',
      });
    }

    if (!ContributionStateMachine.isGuestAllowedTransition(entity.status, ContributionStatus.WITHDRAWN)) {
      throw new BadRequestException({
        errorCode: 'CONTRIBUTION_WITHDRAW_NOT_ALLOWED',
        message: `Không thể rút bản đóng góp đang ở trạng thái ${entity.status}.`,
      });
    }

    const updated = await this.contributionRepo.transitionStatus(
      publicId,
      entity.status,
      ContributionStatus.WITHDRAWN,
      'Người dùng đã yêu cầu rút bản đóng góp khỏi hệ thống.',
    );

    return ContributionMapper.toDetailDto(updated);
  }
}
