import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { QuizStatus } from '@prisma/client';

@Injectable()
export class QuizRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPublishedQuizzes(): Promise<any[]> {
    return this.prisma.quiz.findMany({
      where: { status: QuizStatus.PUBLISHED },
      include: {
        questions: {
          where: { status: QuizStatus.PUBLISHED },
          select: { id: true, status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPublishedQuizBySlug(slug: string): Promise<any | null> {
    return this.prisma.quiz.findFirst({
      where: {
        slug,
        status: QuizStatus.PUBLISHED,
      },
      include: {
        questions: {
          where: { status: QuizStatus.PUBLISHED },
          include: {
            options: true,
            heritageEntity: {
              include: {
                currentVersion: {
                  include: {
                    names: true,
                  },
                },
              },
            },
            sourceResource: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async findQuestionById(questionId: string): Promise<any | null> {
    return this.prisma.quizQuestion.findUnique({
      where: { id: questionId },
      include: {
        options: true,
        heritageEntity: {
          include: {
            currentVersion: {
              include: {
                names: true,
              },
            },
          },
        },
        sourceResource: true,
      },
    });
  }
}
