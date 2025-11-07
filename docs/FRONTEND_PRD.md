# Frontend Product Requirements Document (PRD)
## AI Study Companion - Frontend Architecture

**Version:** 1.0  
**Date:** November 2025  
**Status:** Draft  
**Framework:** Next.js 14+ (App Router) with React

---

## 1. Executive Summary

### 1.1 Overview
This document specifies the frontend architecture, user interfaces, components, and user experience for the AI Study Companion application. The frontend is built using **Next.js 14+ with App Router**, React, TypeScript, and modern UI libraries to provide an intuitive, responsive, and engaging learning companion experience.

### 1.2 Technology Stack

#### Core Framework
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **UI Library**: React 18+
- **Styling**: Tailwind CSS
- **Component Library**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React

#### State Management
- **Server State**: TanStack Query (React Query) v5
- **Client State**: Zustand or React Context
- **Form Management**: React Hook Form + Zod validation

#### Data Fetching
- **API Client**: Axios or Fetch API
- **Real-time**: WebSockets (Socket.io) or Server-Sent Events
- **Caching**: TanStack Query cache

#### UI/UX Libraries
- **Animations**: Framer Motion
- **Charts**: Recharts or Chart.js
- **Date Handling**: date-fns
- **Rich Text**: Tiptap or React Quill (for practice answers)

#### Development Tools
- **Linting**: ESLint
- **Formatting**: Prettier
- **Testing**: Vitest + React Testing Library
- **E2E Testing**: Playwright

---

## 2. User Interface Architecture

### 2.1 Application Structure

```
app/
├── (auth)/
│   ├── login/
│   ├── register/
│   └── layout.tsx
├── (dashboard)/
│   ├── dashboard/
│   │   ├── page.tsx (Progress Dashboard)
│   │   └── components/
│   ├── chat/
│   │   ├── page.tsx (AI Companion Chat)
│   │   └── components/
│   ├── practice/
│   │   ├── page.tsx (Practice List)
│   │   ├── [practiceId]/
│   │   │   └── page.tsx (Practice Detail)
│   │   └── components/
│   ├── sessions/
│   │   ├── page.tsx (Session History)
│   │   ├── [sessionId]/
│   │   │   └── page.tsx (Session Detail)
│   │   └── components/
│   ├── goals/
│   │   ├── page.tsx (Goals Management)
│   │   └── components/
│   └── layout.tsx (Dashboard Layout)
├── api/ (API Routes - Backend)
├── components/ (Shared Components)
├── lib/ (Utilities, API clients)
├── hooks/ (Custom React Hooks)
├── types/ (TypeScript types)
└── layout.tsx (Root Layout)
```

### 2.2 Component Architecture

#### Atomic Design Pattern
```
components/
├── atoms/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Badge.tsx
│   └── Avatar.tsx
├── molecules/
│   ├── SearchBar.tsx
│   ├── PracticeCard.tsx
│   ├── SessionCard.tsx
│   └── GoalCard.tsx
├── organisms/
│   ├── ChatInterface.tsx
│   ├── PracticeInterface.tsx
│   ├── ProgressDashboard.tsx
│   └── SessionHistory.tsx
└── templates/
    ├── DashboardLayout.tsx
    └── AuthLayout.tsx
```

---

## 3. Page Specifications

### 3.1 Authentication Pages

#### Login Page (`/login`)
**Purpose**: User authentication

**Components**:
- Email input field
- Password input field
- "Remember me" checkbox
- "Forgot password?" link
- Submit button
- "Sign up" link

**Features**:
- Form validation (email format, password requirements)
- Error message display
- Loading state during authentication
- Redirect to dashboard on success
- Social login options (optional)

**Design**:
- Clean, centered layout
- Brand logo/name
- Responsive design

#### Register Page (`/register`)
**Purpose**: New user registration

**Components**:
- Name input
- Email input
- Password input (with strength indicator)
- Confirm password input
- Role selector (Student/Tutor)
- Grade selector (for students)
- Terms & conditions checkbox
- Submit button
- "Already have account?" link

**Features**:
- Real-time form validation
- Password strength meter
- Email availability check
- Success message and redirect

### 3.2 Dashboard Pages

#### Main Dashboard (`/dashboard`)
**Purpose**: Overview of student progress and activity

**Layout Sections**:

1. **Header**
   - User profile dropdown
   - Notifications bell
   - Navigation menu

2. **Quick Stats Cards**
   - Active Goals: Count and progress
   - Sessions This Month: Count
   - Practices Completed: Count and average score
   - Improvement Rate: Percentage

3. **Recent Activity Feed**
   - Latest practice completions
   - Recent chat interactions
   - Upcoming practice due dates
   - Goal milestones

4. **Progress Charts**
   - Learning progress over time (line chart)
   - Subject distribution (pie chart)
   - Concept mastery levels (bar chart)

5. **Quick Actions**
   - "Start Practice" button
   - "Chat with AI" button
   - "View Sessions" button
   - "Set New Goal" button

**Components**:
- `ProgressDashboard.tsx` (main component)
- `StatsCard.tsx`
- `ActivityFeed.tsx`
- `ProgressChart.tsx`
- `QuickActions.tsx`

**Data Requirements**:
- GET `/api/progress/student/:studentId`
- GET `/api/practice/student/:studentId?status=completed&limit=5`
- GET `/api/goals/student/:studentId`

#### AI Chat Interface (`/chat`)
**Purpose**: Conversational Q&A with AI companion

**Layout**:

1. **Chat Header**
   - AI companion avatar/icon
   - "AI Study Companion" title
   - Status indicator (online/thinking)
   - Settings button

2. **Message List**
   - User messages (right-aligned, blue)
   - AI messages (left-aligned, gray)
   - Timestamps
   - Loading indicators
   - Error messages
   - Source citations (when referencing sessions)

3. **Input Area**
   - Text input field
   - Send button
   - Voice input button (optional)
   - Attachment button (optional)
   - Character counter

4. **Sidebar** (Collapsible)
   - Conversation history
   - Suggested questions
   - Related sessions
   - Quick actions

**Features**:
- Real-time message streaming
- Markdown rendering for AI responses
- Code syntax highlighting
- Link previews
- Copy message button
- Regenerate response option
- Suggest tutor session button (when AI detects need)

**Components**:
- `ChatInterface.tsx`
- `MessageList.tsx`
- `MessageBubble.tsx`
- `ChatInput.tsx`
- `ChatSidebar.tsx`
- `SuggestedQuestions.tsx`

**Data Requirements**:
- POST `/api/chat/message`
- GET `/api/chat/conversation/:conversationId`
- WebSocket connection for real-time updates

**User Interactions**:
- Type and send message
- Click suggested questions
- View source citations
- Request tutor session
- Clear conversation
- Export conversation

#### Practice List (`/practice`)
**Purpose**: View and manage practice assignments

**Layout**:

1. **Filter Bar**
   - Status filter (All, Assigned, In Progress, Completed)
   - Subject filter
   - Date range picker
   - Sort options

2. **Practice Grid/List**
   - Practice cards showing:
     - Subject and topic
     - Due date
     - Status badge
     - Progress indicator
     - Score (if completed)
     - Action buttons

3. **Empty State**
   - Message when no practices
   - "Generate Practice" CTA

**Components**:
- `PracticeList.tsx`
- `PracticeCard.tsx`
- `PracticeFilters.tsx`
- `EmptyState.tsx`

**Data Requirements**:
- GET `/api/practice/student/:studentId`

#### Practice Detail (`/practice/[practiceId]`)
**Purpose**: Complete practice assignment

**Layout**:

1. **Practice Header**
   - Subject and topic
   - Progress indicator (Question X of Y)
   - Timer (if timed)
   - Save & Exit button

2. **Question Display**
   - Question text (with formatting)
   - Question type indicator
   - Image/media (if applicable)
   - Answer input (varies by type):
     - Multiple choice: Radio buttons
     - Short answer: Text input
     - Problem-solving: Textarea with formatting

3. **Navigation**
   - Previous question button
   - Next question button
   - Question list/navigator
   - Submit button

4. **Results View** (After submission)
   - Score display
   - Correct/incorrect indicators
   - Detailed feedback per question
   - Concept mastery updates
   - "Review Mistakes" button
   - "New Practice" button

**Components**:
- `PracticeInterface.tsx`
- `QuestionDisplay.tsx`
- `AnswerInput.tsx`
- `PracticeResults.tsx`
- `QuestionNavigator.tsx`

**Data Requirements**:
- GET `/api/practice/:practiceId`
- POST `/api/practice/:practiceId/submit`

**User Interactions**:
- Answer questions
- Navigate between questions
- Save progress
- Submit practice
- Review results
- View explanations

#### Session History (`/sessions`)
**Purpose**: View past tutoring sessions

**Layout**:

1. **Session List**
   - Session cards showing:
     - Date and duration
     - Tutor name
     - Subject
     - Topics covered
     - Status (Analyzed/Pending)
     - View details button

2. **Session Detail Modal/Page**
   - Session information
   - Transcript viewer
   - Extracted concepts
   - Topics covered
   - Student strengths/weaknesses
   - Action items
   - Related practices

**Components**:
- `SessionHistory.tsx`
- `SessionCard.tsx`
- `SessionDetail.tsx`
- `TranscriptViewer.tsx`
- `ConceptList.tsx`

**Data Requirements**:
- GET `/api/transcripts/student/:studentId`
- GET `/api/transcripts/:sessionId`

#### Goals Management (`/goals`)
**Purpose**: Manage learning goals

**Layout**:

1. **Active Goals Section**
   - Goal cards with:
     - Subject and description
     - Progress bar
     - Status badge
     - Target date
     - Actions (Edit, Complete, Pause)

2. **Completed Goals Section**
   - Collapsible section
   - Completed goal cards
   - Subject suggestions (after completion)

3. **Create Goal Form**
   - Modal or separate page
   - Subject selector
   - Description input
   - Target date picker
   - Submit button

**Components**:
- `GoalsList.tsx`
- `GoalCard.tsx`
- `CreateGoalForm.tsx`
- `SubjectSuggestions.tsx`

**Data Requirements**:
- GET `/api/goals/student/:studentId`
- POST `/api/goals`
- PUT `/api/goals/:goalId/complete`
- GET `/api/suggestions/student/:studentId`

---

## 4. Component Specifications

### 4.1 Shared Components

#### Button Component
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}
```

#### Input Component
```typescript
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number';
  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}
```

#### Card Component
```typescript
interface CardProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
}
```

#### Badge Component
```typescript
interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
}
```

#### Progress Bar Component
```typescript
interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  showLabel?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
}
```

#### Modal Component
```typescript
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
}
```

#### Loading Spinner Component
```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary';
  text?: string;
}
```

#### Toast/Notification Component
```typescript
interface ToastProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  onClose?: () => void;
}
```

### 4.2 Feature-Specific Components

#### ChatMessage Component
```typescript
interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Array<{
    sessionId: string;
    relevance: number;
    excerpt: string;
  }>;
  suggestTutor?: boolean;
  onSuggestTutor?: () => void;
}
```

#### PracticeQuestion Component
```typescript
interface PracticeQuestionProps {
  question: {
    id: string;
    question: string;
    type: 'multiple_choice' | 'short_answer' | 'problem_solving';
    options?: string[];
    difficulty: number;
  };
  answer?: string;
  onChange: (answer: string) => void;
  showFeedback?: boolean;
  feedback?: {
    correct: boolean;
    explanation: string;
  };
}
```

#### ProgressChart Component
```typescript
interface ProgressChartProps {
  data: Array<{
    date: string;
    score: number;
  }>;
  type?: 'line' | 'bar' | 'area';
  showTrend?: boolean;
}
```

#### ConceptMastery Component
```typescript
interface ConceptMasteryProps {
  concept: {
    id: string;
    name: string;
    masteryLevel: number;
    lastPracticed?: Date;
  };
  showDetails?: boolean;
}
```

---

## 5. State Management

### 5.1 Server State (TanStack Query)

#### Query Keys Structure
```typescript
const queryKeys = {
  student: (id: string) => ['student', id],
  sessions: (studentId: string) => ['sessions', studentId],
  session: (id: string) => ['session', id],
  practices: (studentId: string, filters?: any) => ['practices', studentId, filters],
  practice: (id: string) => ['practice', id],
  goals: (studentId: string) => ['goals', studentId],
  progress: (studentId: string) => ['progress', studentId],
  conversation: (id: string) => ['conversation', id],
  suggestions: (studentId: string) => ['suggestions', studentId],
};
```

#### Custom Hooks
```typescript
// hooks/useStudent.ts
export function useStudent(studentId: string) {
  return useQuery({
    queryKey: queryKeys.student(studentId),
    queryFn: () => api.getStudent(studentId),
  });
}

// hooks/usePractices.ts
export function usePractices(studentId: string, filters?: PracticeFilters) {
  return useQuery({
    queryKey: queryKeys.practices(studentId, filters),
    queryFn: () => api.getPractices(studentId, filters),
  });
}

// hooks/useChat.ts
export function useChat(conversationId?: string) {
  const sendMessage = useMutation({
    mutationFn: (message: string) => api.sendChatMessage(message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation'] });
    },
  });
  
  return { sendMessage };
}
```

### 5.2 Client State (Zustand)

#### Auth Store
```typescript
interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}
```

#### UI Store
```typescript
interface UIStore {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
}
```

#### Chat Store
```typescript
interface ChatStore {
  currentConversationId: string | null;
  messages: Message[];
  isLoading: boolean;
  setConversation: (id: string) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
}
```

---

## 6. API Integration

### 6.1 API Client Setup

```typescript
// lib/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      logout();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 6.2 API Service Functions

```typescript
// lib/api/transcripts.ts
export const transcriptApi = {
  upload: (data: UploadTranscriptData) =>
    apiClient.post('/transcripts/upload', data),
  getSession: (sessionId: string) =>
    apiClient.get(`/transcripts/${sessionId}`),
  getStudentSessions: (studentId: string, params?: any) =>
    apiClient.get(`/transcripts/student/${studentId}`, { params }),
};

// lib/api/chat.ts
export const chatApi = {
  sendMessage: (data: SendMessageData) =>
    apiClient.post('/chat/message', data),
  getConversation: (conversationId: string) =>
    apiClient.get(`/chat/conversation/${conversationId}`),
  createConversation: (studentId: string) =>
    apiClient.post('/chat/conversation', { studentId }),
};

// lib/api/practice.ts
export const practiceApi = {
  generate: (data: GeneratePracticeData) =>
    apiClient.post('/practice/generate', data),
  getPractice: (practiceId: string) =>
    apiClient.get(`/practice/${practiceId}`),
  submitPractice: (practiceId: string, answers: Answer[]) =>
    apiClient.post(`/practice/${practiceId}/submit`, { answers }),
  getStudentPractices: (studentId: string, params?: any) =>
    apiClient.get(`/practice/student/${studentId}`, { params }),
};

// lib/api/goals.ts
export const goalsApi = {
  getGoals: (studentId: string) =>
    apiClient.get(`/goals/student/${studentId}`),
  createGoal: (data: CreateGoalData) =>
    apiClient.post('/goals', data),
  completeGoal: (goalId: string) =>
    apiClient.put(`/goals/${goalId}/complete`),
};

// lib/api/progress.ts
export const progressApi = {
  getProgress: (studentId: string) =>
    apiClient.get(`/progress/student/${studentId}`),
};
```

---

## 7. Real-time Features

### 7.1 WebSocket Integration

```typescript
// lib/websocket.ts
import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;

  connect(conversationId: string) {
    this.socket = io(process.env.NEXT_PUBLIC_WS_URL || '', {
      query: { conversationId },
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('message', (message: Message) => {
      // Handle incoming message
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });
  }

  sendMessage(message: string) {
    if (this.socket) {
      this.socket.emit('message', message);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export const wsService = new WebSocketService();
```

### 7.2 Server-Sent Events (Alternative)

```typescript
// hooks/useSSE.ts
export function useSSE(url: string, onMessage: (data: any) => void) {
  useEffect(() => {
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [url, onMessage]);
}
```

---

## 8. Responsive Design

### 8.1 Breakpoints

```typescript
// tailwind.config.ts
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};
```

### 8.2 Mobile-First Approach

- **Mobile (< 768px)**: Single column, bottom navigation
- **Tablet (768px - 1024px)**: Two columns, sidebar navigation
- **Desktop (> 1024px)**: Full layout with sidebar

### 8.3 Responsive Components

- Navigation: Hamburger menu on mobile, sidebar on desktop
- Chat: Full screen on mobile, split view on desktop
- Practice: Single question view on mobile, multi-column on desktop
- Dashboard: Stacked cards on mobile, grid layout on desktop

---

## 9. Accessibility (a11y)

### 9.1 Requirements

- **WCAG 2.1 AA Compliance**
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- ARIA labels and roles
- Color contrast ratios

### 9.2 Implementation

- Use semantic HTML elements
- Add ARIA labels where needed
- Ensure keyboard navigation
- Test with screen readers (NVDA, JAWS, VoiceOver)
- Provide alt text for images
- Use focus indicators

---

## 10. Performance Optimization

### 10.1 Code Splitting

- Route-based code splitting (automatic with Next.js)
- Component lazy loading
- Dynamic imports for heavy libraries

### 10.2 Image Optimization

- Use Next.js Image component
- Lazy loading images
- WebP format support
- Responsive images

### 10.3 Caching Strategy

- Static page generation (SSG) where possible
- Incremental Static Regeneration (ISR)
- Client-side caching with TanStack Query
- Service worker for offline support (optional)

### 10.4 Bundle Optimization

- Tree shaking
- Minification
- Compression (gzip/brotli)
- Analyze bundle size with `@next/bundle-analyzer`

---

## 11. Testing Strategy

### 11.1 Unit Tests

```typescript
// components/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    screen.getByText('Click me').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 11.2 Integration Tests

- Test component interactions
- Test API integration
- Test form submissions
- Test navigation flows

### 11.3 E2E Tests

```typescript
// e2e/chat.spec.ts
import { test, expect } from '@playwright/test';

test('user can send message in chat', async ({ page }) => {
  await page.goto('/chat');
  await page.fill('[data-testid="chat-input"]', 'What is pH?');
  await page.click('[data-testid="send-button"]');
  await expect(page.locator('[data-testid="message-list"]')).toContainText('What is pH?');
});
```

---

## 12. Error Handling

### 12.1 Error Boundaries

```typescript
// components/ErrorBoundary.tsx
'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

### 12.2 API Error Handling

```typescript
// lib/api/errorHandler.ts
export function handleApiError(error: any) {
  if (error.response) {
    // Server responded with error
    switch (error.response.status) {
      case 401:
        // Unauthorized
        return 'Please log in to continue';
      case 403:
        return 'You do not have permission to perform this action';
      case 404:
        return 'Resource not found';
      case 500:
        return 'Server error. Please try again later';
      default:
        return error.response.data?.message || 'An error occurred';
    }
  } else if (error.request) {
    // Request made but no response
    return 'Network error. Please check your connection';
  } else {
    // Error setting up request
    return 'An unexpected error occurred';
  }
}
```

---

## 13. Internationalization (i18n)

### 13.1 Setup (Future Enhancement)

- Use `next-intl` or `react-i18next`
- Support English initially
- Prepare for multi-language support
- Store translations in JSON files

---

## 14. Deployment

### 14.1 Vercel Deployment

- Automatic deployments from Git
- Preview deployments for PRs
- Environment variables configuration
- Domain configuration

### 14.2 Build Configuration

```json
// package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:e2e": "playwright test"
  }
}
```

### 14.3 Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 15. Design System

### 15.1 Color Palette

```typescript
// tailwind.config.ts
export const colors = {
  primary: {
    50: '#f0f9ff',
    500: '#3b82f6',
    900: '#1e3a8a',
  },
  secondary: {
    50: '#f8fafc',
    500: '#64748b',
    900: '#0f172a',
  },
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};
```

### 15.2 Typography

- **Headings**: Inter, system-ui
- **Body**: Inter, system-ui
- **Code**: 'Fira Code', monospace

### 15.3 Spacing Scale

- Base: 4px
- Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128

### 15.4 Component Variants

- Consistent button styles
- Unified form inputs
- Standardized cards
- Uniform spacing

---

## 16. User Experience Enhancements

### 16.1 Loading States

- Skeleton loaders for content
- Progress indicators for actions
- Optimistic UI updates

### 16.2 Animations

- Smooth page transitions
- Micro-interactions on buttons
- Loading animations
- Success/error animations

### 16.3 Feedback

- Toast notifications
- Inline error messages
- Success confirmations
- Progress indicators

---

## 17. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Set up Next.js project with TypeScript
- [ ] Configure Tailwind CSS and shadcn/ui
- [ ] Set up TanStack Query
- [ ] Create base layout components
- [ ] Implement authentication pages
- [ ] Set up API client

### Phase 2: Core Features (Week 3-4)
- [ ] Build dashboard page
- [ ] Implement chat interface
- [ ] Create practice list and detail pages
- [ ] Build session history page
- [ ] Implement goals management

### Phase 3: Advanced Features (Week 5-6)
- [ ] Add real-time chat updates
- [ ] Implement progress charts
- [ ] Build subject suggestions UI
- [ ] Add tutor routing interface
- [ ] Create analytics dashboard

### Phase 4: Polish & Optimization (Week 7-8)
- [ ] Add animations and transitions
- [ ] Implement error boundaries
- [ ] Optimize performance
- [ ] Add accessibility features
- [ ] Write tests
- [ ] Responsive design refinement

---

## 18. Component Checklist

### Authentication
- [ ] Login page
- [ ] Register page
- [ ] Password reset
- [ ] Auth guard component

### Dashboard
- [ ] Progress dashboard
- [ ] Stats cards
- [ ] Activity feed
- [ ] Progress charts
- [ ] Quick actions

### Chat
- [ ] Chat interface
- [ ] Message list
- [ ] Message bubble
- [ ] Chat input
- [ ] Suggested questions
- [ ] Source citations

### Practice
- [ ] Practice list
- [ ] Practice card
- [ ] Practice interface
- [ ] Question display
- [ ] Answer input
- [ ] Practice results
- [ ] Question navigator

### Sessions
- [ ] Session list
- [ ] Session card
- [ ] Session detail
- [ ] Transcript viewer
- [ ] Concept list

### Goals
- [ ] Goals list
- [ ] Goal card
- [ ] Create goal form
- [ ] Subject suggestions

### Shared Components
- [ ] Button
- [ ] Input
- [ ] Card
- [ ] Badge
- [ ] Modal
- [ ] Toast
- [ ] Loading spinner
- [ ] Progress bar

---

**Document Status**: Draft - Ready for Review

