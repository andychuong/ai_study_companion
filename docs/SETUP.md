# Backend Setup Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (Neon recommended for serverless)
- Pinecone account
- OpenAI API key
- Vercel account (for deployment)

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API key
- `PINECONE_API_KEY` - Pinecone API key
- `PINECONE_INDEX_NAME` - Pinecone index name (default: "study-companion")
- `NEXTAUTH_SECRET` - Random secret for NextAuth (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Your app URL (e.g., `http://localhost:3000`)

Optional:
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob Storage token
- `KV_REST_API_URL` - Vercel KV URL
- `KV_REST_API_TOKEN` - Vercel KV token
- `UPSTASH_REDIS_REST_URL` - Upstash Redis URL (for rate limiting)
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis token
- `INNGEST_EVENT_KEY` - Inngest event key
- `INNGEST_SIGNING_KEY` - Inngest signing key

### 3. Set Up Database

#### Create Database Schema

```bash
# Generate migration files
npm run db:generate

# Run migrations
npm run db:migrate

# Or use Drizzle Studio to inspect database
npm run db:studio
```

### 4. Set Up Pinecone

1. Create a Pinecone account at https://www.pinecone.io
2. Create a new index:
   - Name: `study-companion` (or your preferred name)
   - Select model: `text-embedding-3-large` (OpenAI)
   - Dimensions: `3072` (full dimensions for best quality) or `1024`/`256` (for cost savings)
   - Metric: `cosine`
   - Vector type: `Dense`
3. Copy your API key and add it to `.env.local`

### 5. Set Up Inngest (Optional for Local Development)

For local development, you can use Inngest Dev Server:

```bash
npx inngest-cli@latest dev
```

Or deploy to Inngest Cloud and add credentials to `.env.local`.

### 6. Run Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000/api`

## Testing the API

### 1. Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123",
    "name": "Test Student",
    "role": "student",
    "grade": 10
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123"
  }'
```

### 3. Upload a Transcript

```bash
curl -X POST http://localhost:3000/api/transcripts/upload \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "tutorId": "tutor-uuid",
    "sessionDate": "2025-11-15T10:00:00Z",
    "duration": 3600,
    "transcript": "Today we discussed chemistry...",
    "transcriptSource": "manual_upload",
    "transcriptFormat": "plain_text"
  }'
```

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication
│   │   ├── transcripts/  # Transcript management
│   │   ├── chat/         # Conversational Q&A
│   │   ├── practice/     # Practice problems
│   │   ├── goals/        # Goal management
│   │   ├── progress/     # Progress tracking
│   │   ├── suggestions/  # Subject suggestions
│   │   ├── tutor/        # Tutor routing
│   │   └── analytics/    # Analytics
│   └── api/inngest/      # Inngest webhook
├── lib/
│   ├── db/               # Database schema and client
│   ├── openai/           # OpenAI client
│   ├── pinecone/         # Pinecone client
│   ├── inngest/          # Inngest functions
│   ├── auth/             # Authentication config
│   ├── storage/          # Vercel Blob storage
│   ├── cache/            # Caching utilities
│   └── utils/            # Utility functions
├── drizzle/              # Database migrations
└── types/                # TypeScript types
```

## Deployment to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy!

Or use Vercel CLI:

```bash
vercel
```

## Common Issues

### Database Connection Issues

- Ensure `DATABASE_URL` is correctly formatted
- For Neon, use the connection pooler URL
- Check that your database allows connections from Vercel IPs

### Pinecone Issues

- Verify index name matches `PINECONE_INDEX_NAME`
- Ensure index has correct dimensions (1536)
- Check API key permissions

### Inngest Issues

- For local dev, run `npx inngest-cli dev`
- Ensure webhook URL is correctly configured
- Check Inngest dashboard for function status

## Next Steps

- Review API documentation in `BACKEND_PRD.md`
- Set up frontend integration (see `FRONTEND_PRD.md`)
- Configure monitoring and logging
- Set up CI/CD pipeline

