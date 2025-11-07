// Database type definitions for type-safe access

export type TranscriptSource = 'read_ai' | 'manual_upload' | 'api_import' | 'other';
export type TranscriptFormat = 'plain_text' | 'json' | 'csv' | 'markdown';
export type SessionStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type GoalStatus = 'active' | 'completed' | 'paused';
export type PracticeStatus = 'assigned' | 'in_progress' | 'completed';

export interface PracticeQuestion {
  questionId: string;
  question: string;
  type: string;
  options?: string[];
  difficulty: number;
  conceptId: string;
  correct_answer?: string;
  correctAnswer?: string;
  explanation?: string;
}

export interface SessionAnalysisData {
  topics: string[];
  concepts: Array<{
    name: string;
    difficulty: number;
    masteryLevel: number;
  }>;
  studentStrengths: string[];
  areasForImprovement: string[];
  actionItems: string[];
}

