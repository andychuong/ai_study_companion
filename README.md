# AI Study Companion - Backend

Backend API for the AI Study Companion application, built with Next.js 14+ and deployed on Vercel.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: Neon PostgreSQL (via Drizzle ORM)
- **Vector DB**: Pinecone
- **AI**: OpenAI (GPT-4 Turbo, GPT-3.5 Turbo, text-embedding-3-large)
- **Background Jobs**: Inngest
- **Authentication**: NextAuth.js v5
- **Storage**: Vercel Blob Storage
- **Caching**: Vercel KV (Redis)
- **Rate Limiting**: Upstash Redis

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)
- Pinecone account
- OpenAI API key
- Vercel account (for deployment)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env.local
```

3. Fill in your environment variables in `.env.local`

4. Run database migrations:
```bash
npm run db:generate
npm run db:migrate
```

5. Start development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000/api`

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── transcripts/  # Transcript management
│   │   ├── chat/         # Conversational Q&A
│   │   ├── practice/     # Practice problems
│   │   ├── goals/        # Goal management
│   │   ├── progress/     # Progress tracking
│   │   ├── suggestions/  # Subject suggestions
│   │   ├── tutor/        # Tutor routing
│   │   ├── engagement/   # Engagement nudges
│   │   └── analytics/    # Analytics endpoints
│   ├── api/inngest/      # Inngest webhook
│   └── layout.tsx
├── lib/
│   ├── db/               # Database client and schema
│   ├── openai/           # OpenAI client
│   ├── pinecone/         # Pinecone client
│   ├── inngest/          # Inngest functions
│   ├── auth/             # Authentication config
│   ├── storage/          # Vercel Blob storage
│   ├── cache/            # Caching utilities
│   └── utils/            # Utility functions
├── types/                # TypeScript types
└── drizzle/              # Database migrations
```

## API Endpoints

See `BACKEND_PRD.md` for complete API documentation.

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh token

### Transcripts
- `POST /api/transcripts/upload` - Upload session transcript
- `GET /api/transcripts/:sessionId` - Get session transcript
- `GET /api/transcripts/student/:studentId` - Get all transcripts for student

### Chat
- `POST /api/chat/message` - Send message to AI companion
- `GET /api/chat/conversation/:conversationId` - Get conversation history
- `POST /api/chat/conversation` - Create new conversation

### Practice
- `POST /api/practice/generate` - Generate practice problems
- `GET /api/practice/:practiceId` - Get practice problems
- `POST /api/practice/:practiceId/submit` - Submit practice answers
- `GET /api/practice/student/:studentId` - Get all practices for student

### Goals & Progress
- `GET /api/goals/student/:studentId` - Get student goals
- `POST /api/goals` - Create new goal
- `PUT /api/goals/:goalId/complete` - Mark goal as completed
- `GET /api/progress/student/:studentId` - Get progress dashboard

### Subject Suggestions
- `GET /api/suggestions/student/:studentId` - Get subject suggestions
- `POST /api/suggestions/:suggestionId/accept` - Accept suggestion

### Tutor Routing
- `POST /api/tutor/routing/analyze` - Analyze if tutor needed
- `GET /api/tutor/context/:studentId` - Get tutor context

## Background Jobs

Background jobs are handled by Inngest:

- **Transcript Analysis**: Analyzes uploaded transcripts and extracts insights
- **Practice Generation**: Generates adaptive practice problems
- **Engagement Nudges**: Sends personalized engagement messages
- **Subject Suggestions**: Generates subject suggestions after goal completion

## Database Schema

See `lib/db/schema.ts` for the complete database schema.

## Development

### Running Locally

```bash
npm run dev
```

### Database Migrations

```bash
# Generate migration
npm run db:generate

# Run migration
npm run db:migrate

# Open Drizzle Studio
npm run db:studio
```

### Type Checking

```bash
npm run type-check
```

## Deployment

Deploy to Vercel:

```bash
vercel
```

Make sure to set all environment variables in Vercel dashboard.

## Documentation

- [Backend PRD](./BACKEND_PRD.md) - Complete backend architecture and API specification
- [Main PRD](./PRD.md) - Product requirements document
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - Development overview

## License

Private - All Rights Reserved


