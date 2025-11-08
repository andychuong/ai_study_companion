import apiClient from './client';
import { AxiosResponse } from 'axios';

export interface TutorRoutingAnalysis {
  shouldRoute: boolean;
  reason: string;
  recommendedTopic: string;
  urgency: 'low' | 'medium' | 'high';
  tutorContext: {
    summary: string;
    focusAreas: string[];
    studentStrengths: string[];
  };
}

export interface TutorRoutingContext {
  studentId: string;
  recentConversations?: string[];
  practiceResults?: string[];
  currentQuestion?: string;
}

export interface Tutor {
  id: string;
  email: string;
  name: string;
}

export interface TutorContext {
  studentId: string;
  studentProfile: {
    name: string;
    grade: number | null;
    learningStyle: string;
  };
  recentSessions: Array<{
    sessionId: string;
    date: Date;
    topics: string[];
  }>;
  currentChallenges: string[];
  recommendedFocus: string[];
  studentStrengths: string[];
  practiceHistory: Array<{
    practiceId: string;
    score: number | null;
    completedAt: Date | null;
  }>;
}

export interface BookSessionRequest {
  tutorId: string;
  sessionDate: Date;
  duration: number;
}

export interface BookSessionResponse {
  sessionId: string;
  tutorId: string;
  tutorName: string;
  sessionDate: Date;
  duration: number;
  message: string;
}

export interface TutorStudent {
  id: string;
  name: string;
  email: string;
  grade?: number;
  totalSessions: number;
  lastSessionDate: Date;
  recentSessions: Array<{
    id: string;
    sessionDate: Date;
    duration: number;
    analysisStatus: string;
  }>;
}

export interface TutorStudentsResponse {
  students: TutorStudent[];
}

export const tutorApi = {
  /**
   * Analyze if student needs tutor routing
   */
  analyzeRouting: async (context: TutorRoutingContext): Promise<AxiosResponse<TutorRoutingAnalysis>> => {
    return apiClient.post<TutorRoutingAnalysis>('/tutor/routing/analyze', { context });
  },

  /**
   * Get list of available tutors
   */
  getTutors: async (): Promise<AxiosResponse<Tutor[]>> => {
    return apiClient.get<Tutor[]>('/tutors/list');
  },

  /**
   * Get tutor context for a student (students can access their own context)
   */
  getTutorContext: async (studentId: string, topic?: string): Promise<AxiosResponse<TutorContext>> => {
    const url = topic 
      ? `/tutor/context/student/${studentId}?topic=${encodeURIComponent(topic)}`
      : `/tutor/context/student/${studentId}`;
    return apiClient.get<TutorContext>(url);
  },

  /**
   * Book a session with a tutor
   */
  bookSession: async (data: BookSessionRequest): Promise<AxiosResponse<BookSessionResponse>> => {
    return apiClient.post<BookSessionResponse>('/sessions/book', {
      tutorId: data.tutorId,
      sessionDate: data.sessionDate.toISOString(),
      duration: data.duration,
    });
  },

  /**
   * Get list of students for a tutor
   */
  getTutorStudents: async (): Promise<AxiosResponse<TutorStudentsResponse>> => {
    return apiClient.get<TutorStudentsResponse>('/tutor/students');
  },
};

