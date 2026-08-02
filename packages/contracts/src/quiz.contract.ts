export interface QuizOptionContract {
  id: string;
  optionText: string;
  order: number;
}

export interface QuizQuestionContract {
  id: string;
  questionText: string;
  questionType: string;
  order: number;
  points: number;
  options: QuizOptionContract[];
}

export interface QuizSummaryContract {
  id: string;
  slug: string;
  title: string;
  description?: string;
  difficulty: string;
  passingScore: number;
  estimatedMinutes: number;
  totalQuestions: number;
  createdAt: string;
}

export interface QuizDetailContract extends QuizSummaryContract {
  questions: QuizQuestionContract[];
}

export interface StartQuizAttemptResponseContract {
  attemptId: string;
  attemptToken: string;
  quiz: QuizDetailContract;
  startedAt: string;
}

export interface SubmitQuizAnswerRequestContract {
  questionId: string;
  selectedOptionId?: string;
}

export interface SubmitQuizAnswerResponseContract {
  questionId: string;
  isCorrect: boolean;
  awardedPoints: number;
  explanation?: string;
  relatedHeritageEntity?: {
    id: string;
    slug: string;
    name: string;
  };
  publicSources: {
    id: string;
    title: string;
    locator?: string;
  }[];
}

export interface CompleteQuizResponseContract {
  attemptId: string;
  status: string;
  score: number;
  maxPossibleScore: number;
  percentageScore: number;
  isPassed: boolean;
  completedAt: string;
}

export interface QuizAnswerReviewContract {
  questionId: string;
  questionText: string;
  selectedOptionId?: string;
  correctOptionId: string;
  isCorrect: boolean;
  awardedPoints: number;
  explanation?: string;
  relatedHeritageEntity?: {
    id: string;
    slug: string;
    name: string;
  };
}

export interface QuizResultContract {
  attemptId: string;
  quizTitle: string;
  quizSlug: string;
  score: number;
  maxPossibleScore: number;
  percentageScore: number;
  passingScore: number;
  isPassed: boolean;
  completedAt: string;
  reviews: QuizAnswerReviewContract[];
}

export interface QuizErrorContract {
  errorCode:
    | 'QUIZ_NOT_FOUND'
    | 'QUIZ_NOT_PUBLISHED'
    | 'ATTEMPT_NOT_FOUND'
    | 'ATTEMPT_ALREADY_COMPLETED'
    | 'QUESTION_NOT_IN_QUIZ'
    | 'INVALID_OPTION'
    | 'ANSWER_ALREADY_SUBMITTED'
    | 'QUIZ_HAS_NO_PUBLISHED_QUESTIONS';
  message: string;
  timestamp: string;
}
