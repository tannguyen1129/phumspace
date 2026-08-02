import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { QuizService } from './services/quiz.service';
import { QuizAttemptService } from './services/quiz-attempt.service';
import { QuizScoringService } from './services/quiz-scoring.service';
import { QuizRepository } from './repositories/quiz.repository';
import { QuizAttemptRepository } from './repositories/quiz-attempt.repository';

describe('Cultural Quiz System (Sprint 5A Tests)', () => {
  let quizService: QuizService;
  let attemptService: QuizAttemptService;
  let scoringService: QuizScoringService;

  const mockPublishedQuiz = {
    id: 'quiz-1',
    slug: 'thu-thach-di-san-tra-vinh',
    title: 'Thử thách Kiến thức Di sản Trà Vinh',
    description: 'Mô tả bài thử thách',
    status: 'PUBLISHED',
    difficulty: 'EASY',
    passingScore: 70,
    estimatedMinutes: 5,
    createdAt: new Date('2026-08-01T00:00:00.000Z'),
    questions: [
      {
        id: 'q-1',
        quizId: 'quiz-1',
        questionText: 'Tên Khmer của Chùa Âng là gì?',
        questionType: 'SINGLE_CHOICE',
        explanation: 'Wat Kompong Chray',
        order: 1,
        points: 10,
        status: 'PUBLISHED',
        options: [
          { id: 'opt-1', optionText: 'Wat Kompong Chray', order: 1, isCorrect: true },
          { id: 'opt-2', optionText: 'Wat Samron Sen', order: 2, isCorrect: false },
        ],
      },
      {
        id: 'q-2',
        quizId: 'quiz-1',
        questionText: 'Lễ hội Ok Om Bok là lễ gì?',
        questionType: 'SINGLE_CHOICE',
        explanation: 'Lễ Cúng Trăng',
        order: 2,
        points: 10,
        status: 'PUBLISHED',
        options: [
          { id: 'opt-3', optionText: 'Lễ Cúng Trăng', order: 1, isCorrect: true },
          { id: 'opt-4', optionText: 'Lễ Đua Ghe Ngo', order: 2, isCorrect: false },
        ],
      },
    ],
  };

  const mockAttempt = {
    id: 'attempt-1',
    attemptToken: 'token-1',
    quizId: 'quiz-1',
    status: 'IN_PROGRESS',
    totalQuestions: 2,
    score: 0,
    maxPossibleScore: 20,
    percentageScore: 0,
    isPassed: false,
    startedAt: new Date('2026-08-01T20:00:00.000Z'),
    completedAt: null,
    quiz: mockPublishedQuiz,
    answers: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizService,
        QuizAttemptService,
        QuizScoringService,
        {
          provide: QuizRepository,
          useValue: {
            findPublishedQuizzes: jest.fn().mockResolvedValue([mockPublishedQuiz]),
            findPublishedQuizBySlug: jest.fn().mockImplementation((slug) => {
              if (slug === 'thu-thach-di-san-tra-vinh') return Promise.resolve(mockPublishedQuiz);
              return Promise.resolve(null);
            }),
            findQuestionById: jest.fn().mockImplementation((qId) => {
              const q = mockPublishedQuiz.questions.find((item) => item.id === qId);
              return Promise.resolve(q || null);
            }),
          },
        },
        {
          provide: QuizAttemptRepository,
          useValue: {
            createAttempt: jest.fn().mockResolvedValue(mockAttempt),
            findAttemptById: jest.fn().mockImplementation((id) => {
              if (id === 'attempt-1') return Promise.resolve(mockAttempt);
              if (id === 'attempt-completed') return Promise.resolve({ ...mockAttempt, status: 'COMPLETED' });
              return Promise.resolve(null);
            }),
            upsertAnswer: jest.fn().mockResolvedValue({ id: 'ans-1' }),
            completeAttempt: jest.fn().mockImplementation((data) =>
              Promise.resolve({
                ...mockAttempt,
                status: 'COMPLETED',
                score: data.score,
                percentageScore: data.percentageScore,
                isPassed: data.isPassed,
                completedAt: new Date(),
              }),
            ),
          },
        },
      ],
    }).compile();

    quizService = module.get<QuizService>(QuizService);
    attemptService = module.get<QuizAttemptService>(QuizAttemptService);
    scoringService = module.get<QuizScoringService>(QuizScoringService);
  });

  it('1. QuizService getPublishedQuizBySlug should return quiz detail WITHOUT isCorrect in options', async () => {
    const result = await quizService.getPublishedQuizBySlug('thu-thach-di-san-tra-vinh');

    expect(result.slug).toBe('thu-thach-di-san-tra-vinh');
    expect(result.questions).toHaveLength(2);

    // Security check: ensure isCorrect does NOT exist in public options!
    const firstOption = result.questions[0].options[0] as any;
    expect(firstOption.isCorrect).toBeUndefined();
    expect(JSON.stringify(result)).not.toContain('isCorrect');
  });

  it('2. QuizService should throw 404 for DRAFT or non-existent quiz', async () => {
    await expect(quizService.getPublishedQuizBySlug('thu-thach-am-thuc-khmer')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('3. QuizScoringService should award full points for correct option', () => {
    const question = mockPublishedQuiz.questions[0];
    const evalResult = scoringService.evaluateAnswer(question, 'opt-1');

    expect(evalResult.isCorrect).toBe(true);
    expect(evalResult.awardedPoints).toBe(10);
  });

  it('4. QuizScoringService should award 0 points for incorrect option', () => {
    const question = mockPublishedQuiz.questions[0];
    const evalResult = scoringService.evaluateAnswer(question, 'opt-2');

    expect(evalResult.isCorrect).toBe(false);
    expect(evalResult.awardedPoints).toBe(0);
  });

  it('5. QuizScoringService should throw BadRequestException for invalid optionId', () => {
    const question = mockPublishedQuiz.questions[0];
    expect(() => scoringService.evaluateAnswer(question, 'opt-invalid')).toThrow(
      BadRequestException,
    );
  });

  it('6. QuizAttemptService submitAnswer should evaluate and record user answer', async () => {
    const response = await attemptService.submitAnswer('attempt-1', 'q-1', 'opt-1');

    expect(response.questionId).toBe('q-1');
    expect(response.isCorrect).toBe(true);
    expect(response.awardedPoints).toBe(10);
    expect(response.explanation).toContain('Wat Kompong Chray');
  });

  it('7. QuizAttemptService should reject answer submissions on completed attempts', async () => {
    await expect(attemptService.submitAnswer('attempt-completed', 'q-1', 'opt-1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('8. QuizAttemptService completeAttempt should compute percentage score and pass status', async () => {
    const completed = await attemptService.completeAttempt('attempt-1');

    expect(completed.status).toBe('COMPLETED');
    expect(completed.percentageScore).toBeDefined();
  });
});
