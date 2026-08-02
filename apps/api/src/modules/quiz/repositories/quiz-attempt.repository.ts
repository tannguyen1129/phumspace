import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class QuizAttemptRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createAttempt(data: {
    quizId: string;
    totalQuestions: number;
    maxPossibleScore: number;
  }): Promise<any> {
    return this.prisma.quizAttempt.create({
      data: {
        quizId: data.quizId,
        totalQuestions: data.totalQuestions,
        maxPossibleScore: data.maxPossibleScore,
      },
      include: {
        quiz: true,
      },
    });
  }

  async findAttemptById(attemptId: string): Promise<any | null> {
    return this.prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: true,
        answers: {
          include: {
            question: {
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
              },
            },
            selectedOption: true,
          },
        },
      },
    });
  }

  async upsertAnswer(data: {
    attemptId: string;
    questionId: string;
    selectedOptionId?: string;
    isCorrect: boolean;
    awardedPoints: number;
  }): Promise<any> {
    return this.prisma.quizAnswer.upsert({
      where: {
        attemptId_questionId: {
          attemptId: data.attemptId,
          questionId: data.questionId,
        },
      },
      update: {
        selectedOptionId: data.selectedOptionId ?? null,
        isCorrect: data.isCorrect,
        awardedPoints: data.awardedPoints,
        answeredAt: new Date(),
      },
      create: {
        attemptId: data.attemptId,
        questionId: data.questionId,
        selectedOptionId: data.selectedOptionId ?? null,
        isCorrect: data.isCorrect,
        awardedPoints: data.awardedPoints,
      },
    });
  }

  async completeAttempt(data: {
    attemptId: string;
    score: number;
    percentageScore: number;
    isPassed: boolean;
  }): Promise<any> {
    return this.prisma.quizAttempt.update({
      where: { id: data.attemptId },
      data: {
        status: 'COMPLETED',
        score: data.score,
        percentageScore: data.percentageScore,
        isPassed: data.isPassed,
        completedAt: new Date(),
      },
      include: {
        quiz: true,
        answers: {
          include: {
            question: {
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
              },
            },
          },
        },
      },
    });
  }
}
