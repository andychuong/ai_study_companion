# Complete Setup Guide - AI Study Companion

This guide will walk you through setting up all the services needed for full functionality.

## ✅ Already Completed
- [x] Database setup (Neon PostgreSQL)
- [x] Database migrations
- [x] User authentication
- [x] Frontend and backend connection

## 🔧 Remaining Setup

### 1. OpenAI API Setup (Required for AI Chat)

**Why**: Powers the AI chat, practice generation, and transcript analysis.

**Steps**:
1. Go to https://platform.openai.com
2. Sign up or log in
3. Navigate to API Keys: https://platform.openai.com/api-keys
4. Click "Create new secret key"
5. Name it (e.g., "AI Study Companion")
6. Copy the key (starts with `sk-`)
7. Add to `.env.local`:
   ```bash
   OPENAI_API_KEY=sk-your-key-here
   ```

**Cost**: Pay-as-you-go. Chat uses GPT-3.5 Turbo (~$0.0015 per 1K tokens). You can set usage limits.

---

### 2. Pinecone Setup (Required for RAG - Retrieval Augmented Generation)

**Why**: Stores embeddings of session transcripts for context-aware AI responses.

**Steps**:
1. Go to https://www.pinecone.io
2. Sign up for a free account
3. Create a new index:
   - Name: `study-companion` (or your preferred name)
   - Select model: `text-embedding-3-large` (OpenAI)
   - Dimensions: `3072` (recommended - full dimensions) or `1024`/`256` (for cost savings)
   - Metric: `cosine`
   - Vector type: `Dense`
   - Pod Type: `s1.x1` (free tier)
4. Go to API Keys section
5. Copy your API key
6. Add to `.env.local`:
   ```bash
   PINECONE_API_KEY=your-pinecone-key-here
   PINECONE_INDEX_NAME=study-companion
   ```

**Free Tier**: Includes 1 index, 100K vectors, and 1 pod. Perfect for development!

---

### 3. Optional Services (Can set up later)

#### Vercel Blob Storage (For transcript storage)
- Get from: https://vercel.com/dashboard/stores
- Add: `BLOB_READ_WRITE_TOKEN=your-token`

#### Upstash Redis (For rate limiting)
- Get from: https://console.upstash.com
- Add: `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

#### Inngest (For background jobs)
- Local dev: `npx inngest-cli@latest dev`
- Or get cloud credentials from: https://app.inngest.com

---

## 🧪 Testing After Setup

### Test OpenAI Integration
```bash
# Test chat endpoint (after adding OPENAI_API_KEY)
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "message": "Hello, can you help me with math?",
    "conversationId": null
  }'
```

### Test Pinecone Integration
```bash
# After uploading a transcript, embeddings will be stored automatically
# Check Pinecone dashboard to see vectors being created
```

---

## 📝 Complete .env.local Template

```bash
# Database
DATABASE_URL=your-neon-connection-string
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=http://localhost:3001

# OpenAI (REQUIRED for AI features)
OPENAI_API_KEY=sk-your-key-here

# Pinecone (REQUIRED for RAG)
PINECONE_API_KEY=your-pinecone-key
PINECONE_INDEX_NAME=study-companion

# Optional Services
BLOB_READ_WRITE_TOKEN=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
```

---

## 🚀 After Setup

1. **Restart your dev server**:
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. **Test the features**:
   - Try AI Chat - should get real responses
   - Upload a transcript - should analyze and create embeddings
   - Generate practice - should create practice problems

3. **Create test data**:
   - Upload a sample transcript
   - Create a goal
   - Start a chat conversation

---

## 💡 Tips

- **OpenAI**: Start with GPT-3.5 Turbo for cost efficiency. Upgrade to GPT-4 if needed.
- **Pinecone**: Free tier is perfect for development. Upgrade when you have more data.
- **Costs**: Monitor usage in OpenAI dashboard. Set spending limits.
- **Development**: All features work without these, but AI responses won't be generated.

---

## 🆘 Troubleshooting

### OpenAI Errors
- Check API key is correct
- Verify you have credits/billing set up
- Check rate limits

### Pinecone Errors
- Verify index name matches `PINECONE_INDEX_NAME`
- Check index dimensions are 1536
- Ensure API key has correct permissions

### Still having issues?
- Check server logs for specific error messages
- Verify `.env.local` is in project root
- Restart dev server after adding env variables

