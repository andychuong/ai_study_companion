import { AxiosError } from "axios";

export function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.response) {
      const data = error.response.data as { error?: string; message?: string; code?: string };
      const errorMessage = data?.error || data?.message;
      
      // Server responded with error
      switch (error.response.status) {
        case 400:
          // Bad Request - try to extract validation errors
          if (errorMessage) {
            return errorMessage;
          }
          return "Invalid request. Please check your input and try again.";
        case 401:
          return "Your session has expired. Please log in again.";
        case 403:
          return "You don't have permission to perform this action. Please contact support if you believe this is an error.";
        case 404:
          if (errorMessage) {
            return errorMessage;
          }
          return "The requested resource was not found. It may have been deleted or moved.";
        case 409:
          return errorMessage || "This action conflicts with existing data. Please refresh and try again.";
        case 422:
          return errorMessage || "The data you provided is invalid. Please check your input.";
        case 429:
          return "Too many requests. Please wait a moment and try again.";
        case 500:
          return "Our servers encountered an error. Please try again in a few moments. If the problem persists, contact support.";
        case 503:
          return "Service temporarily unavailable. Please try again in a few moments.";
        default:
          return errorMessage || `An error occurred (${error.response.status}). Please try again.`;
      }
    } else if (error.request) {
      // Request made but no response
      if (error.code === "ECONNABORTED") {
        return "Request timed out. Please check your connection and try again.";
      }
      return "Unable to connect to the server. Please check your internet connection and try again.";
    }
  }
  
  // Error setting up request or unknown error
  if (error instanceof Error) {
    // Provide more context for known error types
    if (error.message.includes("Network")) {
      return "Network error. Please check your connection and try again.";
    }
    if (error.message.includes("timeout")) {
      return "Request timed out. Please try again.";
    }
  }
  
  return "An unexpected error occurred. Please try again or contact support if the problem persists.";
}

