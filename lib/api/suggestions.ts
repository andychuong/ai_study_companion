import apiClient from './client';
import { AxiosResponse } from 'axios';

export interface SubjectSuggestion {
  suggestionId: string;
  subject: string;
  description: string | null;
  relevanceScore: number | null;
  valueProposition: string | null;
  status: 'pending' | 'accepted' | 'dismissed';
}

export interface SuggestionsResponse {
  suggestions: SubjectSuggestion[];
}

export interface AcceptSuggestionResponse {
  suggestionId: string;
  goalId: string;
  message: string;
}

export const suggestionsApi = {
  /**
   * Get all subject suggestions for a student
   */
  getStudentSuggestions: async (studentId: string): Promise<AxiosResponse<SuggestionsResponse>> => {
    return apiClient.get<SuggestionsResponse>(`/suggestions/student/${studentId}`);
  },

  /**
   * Accept a subject suggestion (creates a new goal)
   */
  acceptSuggestion: async (suggestionId: string): Promise<AxiosResponse<AcceptSuggestionResponse>> => {
    return apiClient.post<AcceptSuggestionResponse>(`/suggestions/${suggestionId}/accept`);
  },

  /**
   * Dismiss a subject suggestion
   */
  dismissSuggestion: async (suggestionId: string): Promise<AxiosResponse<{ message: string }>> => {
    return apiClient.post<{ message: string }>(`/suggestions/${suggestionId}/dismiss`);
  },
};

