// Core types for the application

export interface User {
  id: string;
  email: string;
  name: string;
  role: "student" | "tutor";
  grade?: number;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  grade: number;
  goals: Goal[];
  sessions: Session[];
}

export interface Goal {
  id: string;
  studentId: string;
  subject: string;
  description: string;
  status: "active" | "completed" | "paused";
  createdAt: Date;
  completedAt?: Date;
  progress: number; // 0-100
}

export interface Session {
  id: string;
  studentId: string;
  tutorId: string;
  date: Date;
  duration: number;
  transcript: string;
  transcriptSource: "read_ai" | "manual_upload" | "api_import" | "other";
  transcriptFormat: "plain_text" | "json" | "csv" | "markdown";
  topics: string[];
  concepts: Concept[];
  extractedAt: Date;
  analysisStatus: "pending" | "processing" | "completed";
}

export interface Concept {
  id: string;
  name: string;
  subject: string;
  difficulty: number;
  masteryLevel: number; // 0-100
  lastPracticed?: Date;
}

export interface Practice {
  id: string;
  studentId: string;
  conceptId?: string;
  questions: Question[];
  assignedAt: Date;
  completedAt?: Date;
  score?: number;
  status: "assigned" | "in_progress" | "completed";
  subject?: string;
  topic?: string;
}

export interface Question {
  id: string;
  question: string;
  type: "multiple_choice" | "short_answer" | "problem_solving";
  options?: string[];
  difficulty: number;
  correctAnswer?: string;
  explanation?: string;
}

export interface Conversation {
  id: string;
  studentId: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: Source[];
  suggestTutor?: boolean;
}

export interface Source {
  sessionId: string;
  relevance: number;
  excerpt: string;
}

export interface GoalProgress {
  goalId: string;
  subject: string;
  description: string;
  status: "active" | "completed" | "paused";
  progress: number;
  sessionsCount: number;
  practicesCount: number;
  averageScore: number;
  targetDate: string | null;
  createdAt: string;
  completedAt: string | null;
  daysUntilTarget: number | null;
  isNearingCompletion: boolean;
}

export interface Progress {
  studentId: string;
  activeGoals: number;
  sessionsThisMonth: number;
  practicesCompleted: number;
  averageScore: number;
  improvementRate: number;
  learningProgress: Array<{
    date: string;
    score: number;
  }>;
  subjectDistribution: Array<{
    subject: string;
    count: number;
  }>;
  conceptMastery: Array<{
    concept: string;
    masteryLevel: number;
  }>;
  goalsProgress?: GoalProgress[]; // Multi-goal progress breakdown
}

