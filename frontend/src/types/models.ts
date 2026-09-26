/**
 * Domain models, mirroring the tables defined in `backend/prisma/schema.prisma`.
 *
 * Timestamps are ISO 8601 strings exactly as PostgREST returns them. Nullable
 * database columns are typed as `T | null` (not optional) so the compiler
 * forces callers to handle missing values. That includes array columns: Postgres
 * arrays are nullable even where the Prisma schema declares a required list.
 */

export type UserStatus = 'ACTIVE' | 'INACTIVE';
export type QuestionStatus = 'PENDING' | 'ANSWERED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type AnswerType = 'TEXT' | 'VIDEO' | 'AUDIO';
export type NotificationType = 'ANSWER' | 'QUESTION' | 'UPVOTE';

export interface User {
  id: string; // Supabase Auth UUID
  email: string;
  name: string;
  isAdmin: boolean;
  status: UserStatus;
  title: string | null;
  expertise: string[] | null;
  bio: string | null;
  rating: number | null;
  responseTime: string | null;
  avatar: string | null;
  points: number;
  createdAt: string;
  updatedAt: string;
}

/** Public profile fields that are safe to embed alongside questions and answers. */
export type UserSummary = Pick<User, 'id' | 'name' | 'isAdmin' | 'avatar' | 'title'>;

/** Public profile of an expert advisor (an admin user), shown in the experts directory. */
export type ExpertProfile = UserSummary &
  Pick<User, 'bio' | 'expertise' | 'rating' | 'responseTime'>;

export interface Question {
  id: number;
  text: string;
  description: string | null;
  role: string;
  tags: string[] | null;
  views: number;
  status: QuestionStatus;
  priority: Priority;
  authorId: string;
  assignedToId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  id: number;
  type: AnswerType;
  content: string;
  authorId: string;
  questionId: number;
  createdAt: string;
  updatedAt: string;
}

/** A user's upvote or bookmark on a question. Both tables share this shape. */
export interface QuestionReaction {
  id: number;
  questionId: number;
  userId: string;
  createdAt: string;
}

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AnswerWithAuthor extends Answer {
  author: UserSummary;
}

/** A question joined with everything the UI needs to render it. */
export interface QuestionWithRelations extends Question {
  author: UserSummary;
  assignedTo: UserSummary | null;
  answers: AnswerWithAuthor[];
  upvotes: QuestionReaction[];
  bookmarks: QuestionReaction[];
}

export interface NewQuestionInput {
  title: string;
  description: string;
  tags: string[];
  authorId: string;
  /** Set when the question is directed at a specific expert. */
  assignedToId?: string;
  priority?: Priority;
}

export interface NewAnswerInput {
  questionId: number;
  authorId: string;
  content: string;
  type: AnswerType;
}
