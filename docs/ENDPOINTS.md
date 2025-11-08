# API Endpoints Documentation

This document provides a comprehensive overview of all API endpoints in the AI Study Companion application.

## Table of Contents

- [Authentication](#authentication)
- [Sessions](#sessions)
- [Tutor Management](#tutor-management)
- [Goals](#goals)
- [Practice](#practice)
- [Chat](#chat)
- [Transcripts](#transcripts)
- [Suggestions](#suggestions)
- [Notifications](#notifications)
- [Progress & Analytics](#progress--analytics)
- [Inngest Webhooks](#inngest-webhooks)

---

## Authentication

### POST `/api/auth/register`

Register a new user account.

**Authentication:** None

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "name": "string",
  "role": "student" | "tutor",
  "grade": "number (optional)"
}
```

**Response:**
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "string",
    "grade": "number | undefined"
  },
  "token": "string"
}
```

---

### POST `/api/auth/login`

Authenticate a user and receive a JWT token.

**Authentication:** None

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "string",
    "grade": "number | undefined"
  },
  "token": "string"
}
```

---

### GET `/api/auth/me`

Get the current authenticated user's information.

**Authentication:** Required (Bearer token)

**Response:**
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "string",
    "grade": "number | undefined"
  }
}
```

---

## Sessions

### POST `/api/sessions/book`

Book a tutoring session with a tutor.

**Authentication:** Required (Student role)

**Request Body:**
```json
{
  "tutorId": "string (UUID)",
  "sessionDate": "string (ISO datetime)",
  "duration": "number (positive integer, minutes)"
}
```

**Response:**
```json
{
  "sessionId": "string",
  "tutorId": "string",
  "tutorName": "string",
  "sessionDate": "string (ISO datetime)",
  "duration": "number",
  "message": "string"
}
```

---

## Tutor Management

### GET `/api/tutor/students`

Get a list of all students for the authenticated tutor.

**Authentication:** Required (Tutor role)

**Response:**
```json
{
  "students": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "grade": "number | undefined",
      "totalSessions": "number",
      "lastSessionDate": "string (ISO datetime)",
      "recentSessions": [
        {
          "id": "string",
          "sessionDate": "string (ISO datetime)",
          "duration": "number",
          "analysisStatus": "string"
        }
      ]
    }
  ]
}
```

---

### GET `/api/tutor/context/student/[studentId]`

Get detailed context about a specific student for tutors.

**Authentication:** Required (Tutor or Student - students can only access their own)

**URL Parameters:**
- `studentId` (string, UUID): The ID of the student

**Query Parameters:**
- `topic` (string, optional): Filter by topic

**Response:**
```json
{
  "studentId": "string",
  "studentProfile": {
    "name": "string",
    "grade": "number | null",
    "learningStyle": "string"
  },
  "recentSessions": [
    {
      "sessionId": "string",
      "date": "string (ISO datetime)",
      "topics": "string[]"
    }
  ],
  "currentChallenges": "string[]",
  "recommendedFocus": "string[]",
  "studentStrengths": "string[]",
  "practiceHistory": [
    {
      "practiceId": "string",
      "score": "number | null",
      "completedAt": "string (ISO datetime) | null"
    }
  ]
}
```

---

### GET `/api/tutor/context/[studentId]`

Alternative endpoint for tutor context (same as above).

**Authentication:** Required (Tutor or Student)

**URL Parameters:**
- `studentId` (string, UUID): The ID of the student

**Response:** Same as `/api/tutor/context/student/[studentId]`

---

### POST `/api/tutor/routing/analyze`

Analyze a transcript and route to appropriate tutor.

**Authentication:** Required

**Request Body:**
```json
{
  "transcript": "string",
  "studentId": "string (UUID)"
}
```

**Response:**
```json
{
  "recommendedTutorId": "string",
  "confidence": "number",
  "reasoning": "string"
}
```

---

### GET `/api/tutors/list`

Get a list of all available tutors.

**Authentication:** Required

**Response:**
```json
{
  "tutors": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "specializations": "string[]",
      "availability": "object"
    }
  ]
}
```

---

## Goals

### POST `/api/goals`

Create a new learning goal.

**Authentication:** Required (Student role)

**Request Body:**
```json
{
  "subject": "string",
  "description": "string",
  "targetDate": "string (ISO datetime, optional)"
}
```

**Response:**
```json
{
  "id": "string",
  "studentId": "string",
  "subject": "string",
  "description": "string",
  "status": "string",
  "progress": "number",
  "createdAt": "string (ISO datetime)",
  "completedAt": "string (ISO datetime) | undefined",
  "targetDate": "string (ISO datetime) | undefined"
}
```

**Notes:**
- Triggers `goal.created` Inngest event for study suggestion generation

---

### GET `/api/goals/student/[studentId]`

Get all goals for a specific student.

**Authentication:** Required (Student can only access their own)

**URL Parameters:**
- `studentId` (string, UUID): The ID of the student

**Response:**
```json
{
  "goals": [
    {
      "id": "string",
      "studentId": "string",
      "subject": "string",
      "description": "string",
      "status": "string",
      "progress": "number",
      "createdAt": "string (ISO datetime)",
      "completedAt": "string (ISO datetime) | null",
      "targetDate": "string (ISO datetime) | null"
    }
  ]
}
```

---

### GET `/api/goals/[goalId]`

Get a specific goal by ID.

**Authentication:** Required (Student can only access their own)

**URL Parameters:**
- `goalId` (string, UUID): The ID of the goal

**Response:**
```json
{
  "id": "string",
  "studentId": "string",
  "subject": "string",
  "description": "string",
  "status": "string",
  "progress": "number",
  "createdAt": "string (ISO datetime)",
  "completedAt": "string (ISO datetime) | null",
  "targetDate": "string (ISO datetime) | null"
}
```

---

### POST `/api/goals/[goalId]/complete`

Mark a goal as completed.

**Authentication:** Required (Student role)

**URL Parameters:**
- `goalId` (string, UUID): The ID of the goal

**Response:**
```json
{
  "id": "string",
  "status": "completed",
  "completedAt": "string (ISO datetime)"
}
```

---

## Practice

### POST `/api/practice/generate`

Generate practice problems for a session.

**Authentication:** Required (Student role)

**Request Body:**
```json
{
  "sessionId": "string (UUID)",
  "conceptIds": "string[] (UUID, optional)"
}
```

**Response:**
```json
{
  "practiceId": "string",
  "status": "generating",
  "message": "string"
}
```

**Notes:**
- Triggers `practice.generate` Inngest event for background generation

---

### GET `/api/practice/[practiceId]`

Get a specific practice session.

**Authentication:** Required (Student can only access their own)

**URL Parameters:**
- `practiceId` (string, UUID): The ID of the practice

**Response:**
```json
{
  "id": "string",
  "studentId": "string",
  "sessionId": "string",
  "status": "string",
  "questions": "array",
  "score": "number | null",
  "completedAt": "string (ISO datetime) | null"
}
```

---

### POST `/api/practice/[practiceId]/submit`

Submit answers for a practice session.

**Authentication:** Required (Student role)

**URL Parameters:**
- `practiceId` (string, UUID): The ID of the practice

**Request Body:**
```json
{
  "answers": [
    {
      "questionId": "string",
      "answer": "string"
    }
  ]
}
```

**Response:**
```json
{
  "practiceId": "string",
  "score": "number",
  "status": "completed",
  "feedback": "array"
}
```

---

### GET `/api/practice/[practiceId]/hint`

Get a hint for a specific practice question.

**Authentication:** Required (Student role)

**URL Parameters:**
- `practiceId` (string, UUID): The ID of the practice

**Query Parameters:**
- `questionId` (string, required): The ID of the question

**Response:**
```json
{
  "hint": "string",
  "questionId": "string"
}
```

---

### GET `/api/practice/[practiceId]/explain`

Get an explanation for a specific practice question.

**Authentication:** Required (Student role)

**URL Parameters:**
- `practiceId` (string, UUID): The ID of the practice

**Query Parameters:**
- `questionId` (string, required): The ID of the question

**Response:**
```json
{
  "explanation": "string",
  "questionId": "string"
}
```

---

### GET `/api/practice/student/[studentId]`

Get all practice sessions for a student.

**Authentication:** Required (Student can only access their own)

**URL Parameters:**
- `studentId` (string, UUID): The ID of the student

**Response:**
```json
{
  "practices": [
    {
      "id": "string",
      "sessionId": "string",
      "status": "string",
      "score": "number | null",
      "completedAt": "string (ISO datetime) | null"
    }
  ]
}
```

---

### POST `/api/practice/test/create`

Create a test practice session.

**Authentication:** Required (Student role)

**Request Body:**
```json
{
  "conceptIds": "string[] (UUID, optional)",
  "difficulty": "string (optional)"
}
```

**Response:**
```json
{
  "practiceId": "string",
  "status": "assigned"
}
```

---

## Chat

### POST `/api/chat/message`

Send a message to the AI chat assistant.

**Authentication:** Required (Student role)

**Request Body:**
```json
{
  "message": "string",
  "conversationId": "string (UUID, optional)",
  "studentId": "string (UUID, optional, deprecated)"
}
```

**Response:**
```json
{
  "message": {
    "id": "string",
    "role": "assistant",
    "content": "string",
    "timestamp": "string (ISO datetime)",
    "sources": [
      {
        "sessionId": "string",
        "relevance": "number",
        "excerpt": "string"
      }
    ],
    "suggestTutor": "boolean"
  },
  "conversationId": "string"
}
```

**Notes:**
- Uses RAG (Retrieval Augmented Generation) with Pinecone
- Automatically creates conversation if `conversationId` not provided

---

### GET `/api/chat/conversation/[conversationId]`

Get all messages in a conversation.

**Authentication:** Required (Student can only access their own)

**URL Parameters:**
- `conversationId` (string, UUID): The ID of the conversation

**Response:**
```json
{
  "conversation": {
    "id": "string",
    "studentId": "string",
    "createdAt": "string (ISO datetime)"
  },
  "messages": [
    {
      "id": "string",
      "role": "user" | "assistant",
      "content": "string",
      "createdAt": "string (ISO datetime)",
      "metadata": "object"
    }
  ]
}
```

---

### POST `/api/chat/conversation`

Create a new conversation.

**Authentication:** Required (Student role)

**Response:**
```json
{
  "conversationId": "string",
  "studentId": "string",
  "createdAt": "string (ISO datetime)"
}
```

---

## Transcripts

### POST `/api/transcripts/upload`

Upload a session transcript.

**Authentication:** Required (Student role)

**Request Body:**
```json
{
  "tutorId": "string (UUID)",
  "sessionDate": "string (ISO datetime)",
  "duration": "number (positive)",
  "transcript": "string",
  "transcriptSource": "read_ai" | "manual_upload" | "api_import" | "other",
  "transcriptFormat": "plain_text" | "json" | "csv" | "markdown"
}
```

**Response:**
```json
{
  "sessionId": "string",
  "status": "processing",
  "message": "string"
}
```

**Notes:**
- Triggers `transcript.uploaded` Inngest event for background analysis
- Stores transcript in blob storage

---

### GET `/api/transcripts/[sessionId]`

Get a specific session transcript.

**Authentication:** Required (Student can only access their own)

**URL Parameters:**
- `sessionId` (string, UUID): The ID of the session

**Response:**
```json
{
  "id": "string",
  "studentId": "string",
  "tutorId": "string",
  "sessionDate": "string (ISO datetime)",
  "duration": "number",
  "transcript": "string",
  "analysisStatus": "string",
  "analysisData": "object"
}
```

---

### GET `/api/transcripts/student/[studentId]`

Get all transcripts for a student.

**Authentication:** Required (Student can only access their own)

**URL Parameters:**
- `studentId` (string, UUID): The ID of the student

**Response:**
```json
{
  "transcripts": [
    {
      "id": "string",
      "sessionDate": "string (ISO datetime)",
      "duration": "number",
      "analysisStatus": "string"
    }
  ]
}
```

---

## Suggestions

### GET `/api/suggestions/student/[studentId]`

Get study suggestions for a student.

**Authentication:** Required (Student can only access their own, or Admin)

**URL Parameters:**
- `studentId` (string, UUID): The ID of the student

**Response:**
```json
{
  "suggestions": [
    {
      "suggestionId": "string",
      "topic": "string",
      "description": "string",
      "relevanceScore": "number",
      "status": "string",
      "goalId": "string",
      "practiceActivities": "string[]",
      "difficulty": "string | null",
      "prerequisites": "string[]",
      "estimatedHours": "number | null",
      "valueProposition": "string | null"
    }
  ]
}
```

**Notes:**
- Only returns suggestions linked to active goals
- Filters out old subject suggestions

---

### POST `/api/suggestions/[suggestionId]/accept`

Accept a study suggestion.

**Authentication:** Required (Student role)

**URL Parameters:**
- `suggestionId` (string, UUID): The ID of the suggestion

**Response:**
```json
{
  "suggestionId": "string",
  "status": "accepted"
}
```

---

### POST `/api/suggestions/[suggestionId]/dismiss`

Dismiss a study suggestion.

**Authentication:** Required (Student role)

**URL Parameters:**
- `suggestionId` (string, UUID): The ID of the suggestion

**Response:**
```json
{
  "suggestionId": "string",
  "status": "dismissed"
}
```

---

## Notifications

### GET `/api/notifications/student/[studentId]`

Get all notifications for a student.

**Authentication:** Required (Student can only access their own, or Admin)

**URL Parameters:**
- `studentId` (string, UUID): The ID of the student

**Response:**
```json
{
  "notifications": [
    {
      "id": "string",
      "type": "string",
      "title": "string",
      "message": "string",
      "cta": "string | null",
      "ctaUrl": "string | null",
      "urgency": "string",
      "read": "boolean",
      "readAt": "string (ISO datetime) | null",
      "createdAt": "string (ISO datetime)",
      "metadata": "object"
    }
  ],
  "unreadCount": "number"
}
```

---

### POST `/api/notifications/[notificationId]/read`

Mark a notification as read.

**Authentication:** Required (Student role)

**URL Parameters:**
- `notificationId` (string, UUID): The ID of the notification

**Response:**
```json
{
  "notificationId": "string",
  "read": true,
  "readAt": "string (ISO datetime)"
}
```

---

### POST `/api/notifications/student/[studentId]/read-all`

Mark all notifications as read for a student.

**Authentication:** Required (Student can only access their own)

**URL Parameters:**
- `studentId` (string, UUID): The ID of the student

**Response:**
```json
{
  "studentId": "string",
  "readCount": "number"
}
```

---

## Progress & Analytics

### GET `/api/progress/student/[studentId]`

Get learning progress for a student.

**Authentication:** Required (Student can only access their own)

**URL Parameters:**
- `studentId` (string, UUID): The ID of the student

**Response:**
```json
{
  "studentId": "string",
  "overallProgress": "number",
  "subjectProgress": [
    {
      "subject": "string",
      "progress": "number",
      "concepts": "array"
    }
  ],
  "recentActivity": "array"
}
```

---

### GET `/api/analytics/learning-improvements/[studentId]`

Get learning improvement analytics for a student.

**Authentication:** Required (Student can only access their own)

**URL Parameters:**
- `studentId` (string, UUID): The ID of the student

**Response:**
```json
{
  "studentId": "string",
  "improvementRate": "number",
  "trends": "array",
  "insights": "array"
}
```

---

## Inngest Webhooks

### POST `/api/inngest`

Inngest webhook endpoint for background job processing.

**Authentication:** Inngest signature verification

**Notes:**
- Used by Inngest to trigger background jobs
- Handles events like:
  - `transcript.uploaded` - Analyze session transcripts
  - `practice.generate` - Generate practice problems
  - `goal.created` - Generate study suggestions

---

## Authentication

All endpoints (except `/api/auth/register` and `/api/auth/login`) require authentication via JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

## Error Responses

All endpoints may return the following error responses:

**400 Bad Request:**
```json
{
  "error": "string",
  "details": "object (optional)"
}
```

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**403 Forbidden:**
```json
{
  "error": "Forbidden"
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found"
}
```

**405 Method Not Allowed:**
```json
{
  "error": "Method not allowed"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting

Currently, there are no rate limits implemented. This may change in future versions.

## Versioning

The API does not currently use versioning. All endpoints are under `/api/`.

## Base URL

- **Production:** `https://ai-study-companion-o94w.vercel.app/api`
- **Development:** `http://localhost:3000/api`

---

## Notes

- All UUIDs are in standard UUID v4 format
- All datetime strings are in ISO 8601 format
- All endpoints use JSON for request and response bodies
- Student users can only access their own data (except where explicitly allowed)
- Tutor users can access their students' data
- Admin users can access all data

