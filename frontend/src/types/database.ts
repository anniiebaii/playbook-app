/**
 * Supabase schema types for the typed client. Mirrors `backend/prisma/schema.prisma`.
 *
 * This follows the format produced by `supabase gen types typescript`; regenerate it with
 * that command after schema changes. With these types, PostgREST `select` strings are
 * parsed at compile time, so query results are checked against the domain models.
 */

/* eslint-disable @typescript-eslint/consistent-type-definitions, @typescript-eslint/consistent-indexed-object-style --
   Kept in the generated format: Supabase's generic constraints need `type` aliases (interfaces
   lack an implicit index signature) and `{ [_ in never]: never }` for empty sections. */

type Timestamp = string;

type Enums = Database['public']['Enums'];

type ForeignKey<Name extends string, Column extends string, Table extends string> = {
  foreignKeyName: Name;
  columns: [Column];
  isOneToOne: false;
  referencedRelation: Table;
  referencedColumns: ['id'];
};

/** A table whose `id`, timestamps, and defaulted columns are optional on insert. */
type Table<
  Row,
  Required extends keyof Row,
  Relationships extends ForeignKey<string, string, string>[] = [],
> = {
  Row: Row;
  Insert: Pick<Row, Required> & Partial<Omit<Row, Required>>;
  Update: Partial<Row>;
  Relationships: Relationships;
};

type UserRow = {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  status: Enums['user_status'];
  title: string | null;
  /** Postgres arrays are nullable even though Prisma declares lists as required. */
  expertise: string[] | null;
  bio: string | null;
  rating: number | null;
  responseTime: string | null;
  avatar: string | null;
  points: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

type QuestionRow = {
  id: number;
  text: string;
  description: string | null;
  role: string;
  tags: string[] | null;
  views: number;
  status: Enums['question_status'];
  priority: Enums['priority'];
  authorId: string;
  assignedToId: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

type AnswerRow = {
  id: number;
  type: Enums['answer_type'];
  content: string;
  authorId: string;
  questionId: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

type ReactionRow = {
  id: number;
  userId: string;
  questionId: number;
  createdAt: Timestamp;
};

type NotificationRow = {
  id: number;
  type: Enums['notification_type'];
  title: string;
  message: string;
  read: boolean;
  icon: string;
  color: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type Database = {
  public: {
    Tables: {
      users: Table<UserRow, 'id' | 'email' | 'name'>;
      questions: Table<
        QuestionRow,
        'text' | 'role' | 'authorId',
        [
          ForeignKey<'questions_authorId_fkey', 'authorId', 'users'>,
          ForeignKey<'questions_assignedToId_fkey', 'assignedToId', 'users'>,
        ]
      >;
      answers: Table<
        AnswerRow,
        'content' | 'authorId' | 'questionId',
        [
          ForeignKey<'answers_authorId_fkey', 'authorId', 'users'>,
          ForeignKey<'answers_questionId_fkey', 'questionId', 'questions'>,
        ]
      >;
      question_upvotes: Table<
        ReactionRow,
        'userId' | 'questionId',
        [
          ForeignKey<'question_upvotes_questionId_fkey', 'questionId', 'questions'>,
          ForeignKey<'question_upvotes_userId_fkey', 'userId', 'users'>,
        ]
      >;
      question_bookmarks: Table<
        ReactionRow,
        'userId' | 'questionId',
        [
          ForeignKey<'question_bookmarks_questionId_fkey', 'questionId', 'questions'>,
          ForeignKey<'question_bookmarks_userId_fkey', 'userId', 'users'>,
        ]
      >;
      notifications: Table<
        NotificationRow,
        'type' | 'title' | 'message' | 'icon' | 'color' | 'userId',
        [ForeignKey<'notifications_userId_fkey', 'userId', 'users'>]
      >;
    };
    Views: { [_ in never]: never };
    Functions: {
      is_admin: { Args: { [_ in never]: never }; Returns: boolean };
      admin_set_user_status: {
        Args: { target_user_id: string; new_status: Enums['user_status'] };
        Returns: undefined;
      };
      admin_delete_user: { Args: { target_user_id: string }; Returns: undefined };
    };
    Enums: {
      user_status: 'ACTIVE' | 'INACTIVE';
      question_status: 'PENDING' | 'ANSWERED';
      priority: 'LOW' | 'MEDIUM' | 'HIGH';
      answer_type: 'TEXT' | 'VIDEO' | 'AUDIO';
      notification_type: 'ANSWER' | 'QUESTION' | 'UPVOTE';
    };
    CompositeTypes: { [_ in never]: never };
  };
};
