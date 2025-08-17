import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types and Interfaces
export interface User {
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
  author: string;
  authorEmail: string;
  role: string;
  tags: string[];
  upvotes: number;
  upvotedBy: string[];
  savedBy: string[];
  status: 'pending' | 'answered';
  priority: 'low' | 'medium' | 'high';
  views: number;
  assignedTo?: string;
  answers: Answer[];
  timestamp: Date;
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

