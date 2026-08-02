import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ContributionStatus, ReviewAssignmentStatus } from '@prisma/client';

@Injectable()
export class ModerationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(params: {
    page?: number;
    limit?: number;
    status?: ContributionStatus;
    contributionType?: any;
    assignedStaffUserId?: string;
  }): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.contributionType) where.contributionType = params.contributionType;

    if (params.assignedStaffUserId) {
      where.reviewAssignments = {
        some: {
          assignedStaffUserId: params.assignedStaffUserId,
          status: ReviewAssignmentStatus.ACTIVE,
        },
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.communityContribution.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          media: true,
          reviewAssignments: {
            where: { status: ReviewAssignmentStatus.ACTIVE },
            include: { assignedStaffUser: true },
          },
        },
      }),
      this.prisma.communityContribution.count({ where }),
    ]);

    return { data, total };
  }

  async findByPublicId(publicId: string): Promise<any | null> {
    return this.prisma.communityContribution.findUnique({
      where: { publicId },
      include: {
        fields: true,
        media: true,
        consent: true,
        relatedHeritageEntity: true,
        relatedPlace: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
        reviewAssignments: {
          where: { status: ReviewAssignmentStatus.ACTIVE },
          include: { assignedStaffUser: true },
        },
        reviews: {
          orderBy: { reviewedAt: 'desc' },
          include: { reviewerStaffUser: true },
        },
      },
    });
  }

  async findMediaById(publicId: string, mediaId: string): Promise<any | null> {
    return this.prisma.contributionMedia.findFirst({
      where: {
        id: mediaId,
        contribution: { publicId },
      },
    });
  }

  async assignReview(contributionId: string, staffUserId: string, assignedByStaffUserId?: string): Promise<void> {
    // Release existing active assignments
    await this.prisma.contributionReviewAssignment.updateMany({
      where: { contributionId, status: ReviewAssignmentStatus.ACTIVE },
      data: { status: ReviewAssignmentStatus.RELEASED, releasedAt: new Date() },
    });

    // Create new assignment
    await this.prisma.contributionReviewAssignment.create({
      data: {
        contributionId,
        assignedStaffUserId: staffUserId,
        assignedByStaffUserId,
        status: ReviewAssignmentStatus.ACTIVE,
      },
    });
  }

  async releaseReview(contributionId: string): Promise<void> {
    await this.prisma.contributionReviewAssignment.updateMany({
      where: { contributionId, status: ReviewAssignmentStatus.ACTIVE },
      data: { status: ReviewAssignmentStatus.RELEASED, releasedAt: new Date() },
    });
  }
}
