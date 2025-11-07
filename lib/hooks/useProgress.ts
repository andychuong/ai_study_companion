import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/types";
import { progressApi } from "@/lib/api/progress";

export function useProgress(studentId: string) {
  return useQuery({
    queryKey: ["progress", studentId],
    queryFn: async () => {
      const response = await progressApi.getProgress(studentId);
      return response.data;
    },
    enabled: !!studentId,
  });
}

