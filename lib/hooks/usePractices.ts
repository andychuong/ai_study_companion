import { useQuery } from "@tanstack/react-query";
import { Practice } from "@/types";
import { practiceApi } from "@/lib/api/practice";

export interface PracticeFilters {
  status?: string;
  subject?: string;
  limit?: number;
  offset?: number;
}

export function usePractices(studentId: string, filters?: PracticeFilters) {
  return useQuery({
    queryKey: ["practices", studentId, filters],
    queryFn: async () => {
      const response = await practiceApi.getStudentPractices(studentId, filters);
      return response.data;
    },
    enabled: !!studentId,
  });
}

