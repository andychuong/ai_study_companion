"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { practiceApi } from "@/lib/api/practice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";
import { useUIStore } from "@/lib/stores/uiStore";
import { handleApiError } from "@/lib/api/errorHandler";
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Lightbulb, BookOpen } from "lucide-react";
import { Question } from "@/types";

export default function PracticeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const practiceId = params.practiceId as string;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [hints, setHints] = useState<Record<string, string>>({});
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});
  const { addNotification } = useUIStore();

  const { data: practice, isLoading } = useQuery({
    queryKey: ["practice", practiceId],
    queryFn: async () => {
      const response = await practiceApi.getPractice(practiceId);
      return response.data;
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const response = await practiceApi.submitPractice(practiceId, 
        Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer,
        }))
      );
      return response.data;
    },
    onSuccess: () => {
      setShowResults(true);
      addNotification({
        type: "success",
        message: "Practice submitted successfully!",
      });
    },
    onError: (error) => {
      addNotification({
        type: "error",
        message: handleApiError(error),
      });
    },
  });

  const hintMutation = useMutation({
    mutationFn: async (questionId: string) => {
      const response = await practiceApi.getHint(practiceId, questionId);
      return response.data;
    },
    onSuccess: (data) => {
      setHints((prev) => ({ ...prev, [data.questionId]: data.hint }));
      setShowHint((prev) => ({ ...prev, [data.questionId]: true }));
    },
    onError: (error) => {
      addNotification({
        type: "error",
        message: handleApiError(error),
      });
    },
  });

  const explanationMutation = useMutation({
    mutationFn: async (questionId: string) => {
      const studentAnswer = answers[questionId];
      const response = await practiceApi.getExplanation(practiceId, questionId, studentAnswer);
      return response.data;
    },
    onSuccess: (data) => {
      setExplanations((prev) => ({ ...prev, [data.questionId]: data.explanation }));
      setShowExplanation((prev) => ({ ...prev, [data.questionId]: true }));
    },
    onError: (error) => {
      addNotification({
        type: "error",
        message: handleApiError(error),
      });
    },
  });

  const handleGetHint = () => {
    const questionId = currentQuestion.id;
    if (hints[questionId]) {
      setShowHint((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
    } else {
      hintMutation.mutate(questionId);
    }
  };

  const handleGetExplanation = () => {
    const questionId = currentQuestion.id;
    if (explanations[questionId]) {
      setShowExplanation((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
    } else {
      explanationMutation.mutate(questionId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading practice..." />
      </div>
    );
  }

  if (!practice) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-600">Practice not found</p>
      </div>
    );
  }

  // Handle case where practice is still being generated (no questions yet)
  if (!practice.questions || practice.questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Practice Problems Generating</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-12">
            <LoadingSpinner size="lg" text="Practice problems are being generated. Please check back in a few moments." />
            <p className="text-secondary-600 mt-4">
              This practice is based on your session and will include questions tailored to the concepts you covered.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = practice.questions[currentQuestionIndex];
  const currentQuestionId = currentQuestion.id;
  const isLastQuestion = currentQuestionIndex === practice.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length !== practice.questions.length) {
      addNotification({
        type: "warning",
        message: "Please answer all questions before submitting",
      });
      return;
    }
    submitMutation.mutate();
  };

  if (showResults && submitMutation.data) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Practice Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-4xl font-bold text-primary-600 mb-2">
                {submitMutation.data.score}%
              </div>
              <p className="text-secondary-600">Your Score</p>
            </div>

            <div className="space-y-4 mt-8">
              {practice.questions.map((question, index) => {
                const feedback = submitMutation.data.feedback.find(
                  (f) => f.questionId === question.id
                );
                return (
                  <Card key={question.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3 mb-4">
                        {feedback?.correct ? (
                          <CheckCircle className="h-6 w-6 text-success flex-shrink-0 mt-1" />
                        ) : (
                          <XCircle className="h-6 w-6 text-error flex-shrink-0 mt-1" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium mb-2">
                            Question {index + 1}: {question.question}
                          </p>
                          <p className="text-sm text-secondary-600 mb-2">
                            Your answer: {answers[question.id]}
                          </p>
                          {feedback && (
                            <div className="mt-2 p-3 bg-secondary-50 rounded-lg">
                              <p className="text-sm">{feedback.explanation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex gap-4 mt-6">
              <Button onClick={() => router.push("/practice")} variant="outline">
                Back to Practices
              </Button>
              <Button onClick={() => router.push("/dashboard")}>
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">
            {practice.subject || "Practice"}
          </h1>
          {practice.topic && (
            <p className="text-secondary-600 mt-1">{practice.topic}</p>
          )}
        </div>
        <Badge variant="warning">Question {currentQuestionIndex + 1} of {practice.questions.length}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg">{currentQuestion.question}</p>

          {currentQuestion.type === "multiple_choice" && currentQuestion.options ? (
            <div className="space-y-2">
              {currentQuestion.options.map((option, index) => (
                <label
                  key={index}
                  className="flex items-center p-3 border border-secondary-200 rounded-lg cursor-pointer hover:bg-secondary-50"
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={option}
                    checked={answers[currentQuestion.id] === option}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    className="mr-3"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          ) : (
            <Input
              placeholder="Type your answer..."
              value={answers[currentQuestion.id] || ""}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            />
          )}

          {/* AI Hint and Explanation Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleGetHint}
              loading={hintMutation.isPending}
              className="flex-1"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              {hints[currentQuestionId] && showHint[currentQuestionId]
                ? "Hide Hint"
                : "Get Hint"}
            </Button>
            <Button
              variant="outline"
              onClick={handleGetExplanation}
              loading={explanationMutation.isPending}
              className="flex-1"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              {explanations[currentQuestionId] && showExplanation[currentQuestionId]
                ? "Hide Explanation"
                : "Show Explanation"}
            </Button>
          </div>

          {/* Display Hint */}
          {hints[currentQuestionId] && showHint[currentQuestionId] && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900 mb-1">Hint</p>
                  <p className="text-blue-800">{hints[currentQuestionId]}</p>
                </div>
              </div>
            </div>
          )}

          {/* Display Explanation */}
          {explanations[currentQuestionId] && showExplanation[currentQuestionId] && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <BookOpen className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900 mb-1">Explanation</p>
                  <p className="text-green-800">{explanations[currentQuestionId]}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstQuestion}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {isLastQuestion ? (
              <Button onClick={handleSubmit} loading={submitMutation.isPending}>
                Submit Practice
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

