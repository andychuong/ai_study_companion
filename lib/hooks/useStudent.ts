import { useQuery } from "@tanstack/react-query";
import { Student } from "@/types";
import apiClient from "@/lib/api/client";

export function useStudent(studentId: string) {
  return useQuery({
    queryKey: ["student", studentId],
    queryFn: async () => {
      const response = await apiClient.get<Student>(`/students/${studentId}`);
      return response.data;
    },
    enabled: !!studentId,
  });
}

