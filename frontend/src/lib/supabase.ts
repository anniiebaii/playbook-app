import { createClient } from '@supabase/supabase-js'



// Debug environment variables
console.log('Environment variables debug:')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL)
console.log('REACT_APP_SUPABASE_ANON_KEY exists:', !!process.env.REACT_APP_SUPABASE_ANON_KEY)
console.log('All REACT_APP_ vars:', Object.keys(process.env).filter(key => key.startsWith('REACT_APP_')))

// Check if Supabase is properly configured
if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables!')
  console.error('Required variables: REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY')
  console.error('Make sure your .env file is in the same directory as package.json')
} else {
  console.log('✅ Supabase environment variables found')
}


const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


// Types and Interfaces for Supabase schema
export interface User {
  id: string; // UUID
  email: string;
  password: string;
  name: string;
  isAdmin: boolean;
  joinDate: Date;
  status: 'active' | 'inactive';
  title?: string;
  expertise?: string[];
  bio?: string;
  answersCount?: number;
  rating?: number;
  responseTime?: string;
  avatar?: string;
  points: number;
}

export interface Answer {
  id: number;
  type: 'TEXT' | 'VIDEO' | 'AUDIO';
  content: string;
  authorId: string; // UUID
  questionId: number;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: number;
  text: string;
  description?: string;
  role: string;
  tags: string[];
  views: number;
  status: QuestionStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  authorId: string; // UUID
  assignedToId?: string; // UUID
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: number;
  type: 'answer' | 'question' | 'upvote';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  icon: React.ComponentType<any>;
  color: string;
}

export interface NewAnswer {
  type: AnswerType
  content: string;
}

export interface QuestionData {
  title: string;
  description?: string;
  tags: string[];
  authorId: string; // UUID
}

export interface QuestionUpvote {
  id: number;
  questionId: number;
  userId: string; // UUID
  createdAt: Date;
} 

export interface QuestionBookmark {
  id: number;
  questionId: number;
  userId: string; // UUID
  createdAt: Date;
} 

// Interfaces and Types for App logic

export type QuestionStatus = 'PENDING' | 'ANSWERED';
export type AnswerType = 'TEXT' | 'VIDEO' | 'AUDIO';

// This interface extends Question to include relational data and computed fields for easier use within the application.
export interface QuestionWithRelations extends Question {
  author: User; // Relation, not always present
 // authorEmail: User["email"]; // Relation, not always present
  assignedTo?: User;
  answers?: AnswerWithRelations[];
  upvotes?: QuestionUpvote[];
  bookmarks?: QuestionBookmark[];

  // Computed fields
  upvoteCount?: number;
  bookmarkCount?: number;
}

export interface AnswerData {
  type: AnswerType;
  content: string;
  authorId: string; // UUID
  questionId: number;
  isAdmin: boolean;
}

export interface CreateUpvoteInput {
  questionId: number;
  userId: string; // UUID
}

export interface CreateBookmarkInput {
  questionId: number;
  userId: string; // UUID
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  isAdmin?: boolean;
}

export interface UpdateAnswerInput {
  type?: AnswerType;
  content?: string;
}

export interface AnswerWithRelations extends Answer {
  author: User
}

export interface GetAnswersFilters {
  questionId?: number;
  authorId?: string; // UUID
  type?: AnswerType;
  limit?: number;
  offset?: number;
}

export interface UserWithRelations extends User {
  bookmarks?: QuestionBookmark[];
  upvotes?: QuestionUpvote[];
}