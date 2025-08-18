import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types and Interfaces for Supabase schema
export interface User {
  id: number;
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
  type: 'text' | 'video' | 'audio';
  content: string;
  author: string;
  isAdmin: boolean;
  timestamp: Date;
}

export interface Question {
  id: number;
  text: string;
  description?: string;
  role: string;
  tags: string[];
  views: number;
  status: 'PENDING' | 'ANSWERED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  authorId: number;
  assignedToId?: number;
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
  type: 'text' | 'video' | 'audio';
  content: string;
}

export interface QuestionData {
  text: string;
  description?: string;
  tags: string[];
}

export interface QuestionUpvote {
  id: number;
  questionId: number;
  userId: number;
  createdAt: Date;
} 

export interface QuestionBookmark {
  id: number;
  questionId: number;
  userId: number;
  createdAt: Date;
} 

// Interfaces and Types for App logic

// This interface extends Question to include relational data and computed fields for easier use within the application.
export interface QuestionWithRelations extends Question {
  author: User; // Relation, not always present
 // authorEmail: User["email"]; // Relation, not always present
  assignedTo?: User;
  answers?: Answer[];
  upvotes?: QuestionUpvote[];
  bookmarks?: QuestionBookmark[];

  // Computed fields
  upvoteCount?: number;
  bookmarkCount?: number;
}