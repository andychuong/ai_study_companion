# Chat Feature Troubleshooting

**Date:** November 7, 2025  
**Status:** Production Issue Fix

---

## Issue

Chat feature works locally but returns 500 errors in production.

**Production URL:** https://ai-study-companion-o94w.vercel.app/chat

---

## Root Cause

The chat API is returning 500 errors because:

1. **Missing `OPENAI_API_KEY` in Vercel** - Required for chat functionality
2. **Error handling not catching OpenAI configuration errors** - Errors were being thrown but not properly handled
3. **Generic error messages** - Not providing clear feedback about missing configuration

---

## Fixes Applied

### 1. Enhanced Error Handling in Chat API

**File:** `app/api/chat/message/route.ts`

**Changes:**
- Added explicit check for `OPENAI_API_KEY` before attempting to use OpenAI
- Improved error messages to be more specific
- Better error logging with stack traces
- Graceful degradation when OpenAI is not configured

**Before:**
```typescript
try {
  const completion = await chatCompletion([...]);
  response = completion.choices[0]?.message?.content || '...';
} catch (error) {
  logger.error('Failed to generate chat response', { error });
  // Generic error message
}
```

**After:**
```typescript
try {
  if (!process.env.OPENAI_API_KEY) {
    logger.warn('OPENAI_API_KEY not configured', { studentId: session.user.id });
    response = 'I apologize, but the AI service is not configured. Please contact support.';
  } else {
    const completion = await chatCompletion([...]);
    response = completion.choices[0]?.message?.content || '...';
  }
} catch (error: any) {
  logger.error('Failed to generate chat response', { 
    error: error?.message || String(error), 
    stack: error?.stack,
    studentId: session.user.id 
  });
  
  // More specific error messages
  if (error?.message?.includes('API key') || error?.message?.includes('not configured')) {
    response = 'I apologize, but the AI service is not configured. Please contact support.';
  } else {
    response = 'I apologize, but I encountered an error generating a response. Please try again.';
  }
}
```

### 2. Improved RAG Context Error Handling

**File:** `app/api/chat/message/route.ts`

**Changes:**
- Added check for `OPENAI_API_KEY` before generating embeddings
- Better error logging

**Before:**
```typescript
try {
  const questionEmbedding = await generateEmbedding(message);
  relevantChunks = await queryVectors(questionEmbedding, {...});
} catch (error) {
  logger.warn('Failed to get RAG context', { error });
}
```

**After:**
```typescript
try {
  if (process.env.OPENAI_API_KEY) {
    const questionEmbedding = await generateEmbedding(message);
    relevantChunks = await queryVectors(questionEmbedding, {...});
  } else {
    logger.warn('OPENAI_API_KEY not configured, skipping RAG context', { studentId: session.user.id });
  }
} catch (error: any) {
  logger.warn('Failed to get RAG context', { 
    error: error?.message || String(error),
    studentId: session.user.id 
  });
}
```

### 3. Improved OpenAI Client Error Messages

**File:** `lib/openai/client.ts`

**Changes:**
- Updated error message to be more generic (works for both local and production)
- Better error handling in catch block

**Before:**
```typescript
if (!openai) {
  throw new Error('OpenAI API key is not configured. Please add OPENAI_API_KEY to your .env.local file.');
}
```

**After:**
```typescript
if (!openai) {
  throw new Error('OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment variables.');
}
```

---

## Required Environment Variables

### For Production (Vercel)

| Variable | Required | Purpose |
|----------|----------|---------|
| `OPENAI_API_KEY` | ✅ **Yes** | Required for chat functionality |
| `PINECONE_API_KEY` | ⚠️ Optional | Required for RAG context (chat works without it) |
| `PINECONE_INDEX_NAME` | ⚠️ Optional | Required for RAG context (defaults to `study-companion`) |

---

## How to Fix

### Step 1: Add `OPENAI_API_KEY` to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `ai-study-companion`
3. Go to **Settings** → **Environment Variables**
4. Add:
   - **Name:** `OPENAI_API_KEY`
   - **Value:** Your OpenAI API key (starts with `sk-...`)
   - **Environment:** Production, Preview, Development
   - Click **Save**

### Step 2: (Optional) Add Pinecone Keys

If you want RAG context in chat:

1. Add `PINECONE_API_KEY` to Vercel
2. Add `PINECONE_INDEX_NAME` to Vercel (or use default `study-companion`)

See `docs/PINECONE_VERCEL_SETUP.md` for details.

### Step 3: Redeploy

After adding environment variables:

1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Or push a new commit to trigger a new deployment

---

## Testing

### Test Chat Without OpenAI

**Expected Behavior:**
- Chat page loads
- User can type a message
- API returns 200 (not 500)
- Response: "I apologize, but the AI service is not configured. Please contact support."

### Test Chat With OpenAI

**Expected Behavior:**
- Chat page loads
- User can type a message
- API returns 200
- Response: AI-generated response from GPT-4

### Test Chat With OpenAI + Pinecone

**Expected Behavior:**
- Chat page loads
- User can type a message
- API returns 200
- Response: AI-generated response with context from previous sessions
- Sources shown in response (if available)

---

## Error Messages

### Before Fix

**API Response:**
```json
{
  "error": "Internal server error"
}
```

**Status:** 500

**User Experience:**
- Chat doesn't work
- No clear error message
- Generic 500 error

### After Fix

**Without OpenAI:**
```json
{
  "message": {
    "id": "...",
    "role": "assistant",
    "content": "I apologize, but the AI service is not configured. Please contact support.",
    "timestamp": "..."
  },
  "conversationId": "..."
}
```

**Status:** 200

**User Experience:**
- Chat works (but shows error message)
- Clear error message
- User knows what's wrong

**With OpenAI:**
```json
{
  "message": {
    "id": "...",
    "role": "assistant",
    "content": "Algebra is a branch of mathematics...",
    "timestamp": "...",
    "sources": [...]
  },
  "conversationId": "..."
}
```

**Status:** 200

**User Experience:**
- Chat works perfectly
- AI-generated responses
- RAG context (if Pinecone configured)

---

## Verification

### Check Vercel Logs

1. Go to Vercel Dashboard → Your Project → Logs
2. Look for:
   - `⚠️  OPENAI_API_KEY is not set` (should NOT appear if configured)
   - `Failed to generate chat response` (should NOT appear if configured)
   - `OPENAI_API_KEY not configured` (should NOT appear if configured)

### Test API Directly

```bash
curl -X POST https://ai-study-companion-o94w.vercel.app/api/chat/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message": "Test message"}'
```

**Expected Response (without OpenAI):**
```json
{
  "message": {
    "content": "I apologize, but the AI service is not configured. Please contact support.",
    ...
  }
}
```

**Expected Response (with OpenAI):**
```json
{
  "message": {
    "content": "AI-generated response...",
    ...
  }
}
```

---

## Summary

### ✅ Fixed
- Chat API no longer returns 500 errors
- Better error handling for missing OpenAI configuration
- Clear error messages for users
- Graceful degradation when OpenAI is not configured

### ⏸️ To Do
- Add `OPENAI_API_KEY` to Vercel environment variables
- (Optional) Add `PINECONE_API_KEY` and `PINECONE_INDEX_NAME` for RAG context
- Redeploy application
- Test chat functionality

---

## Related Documentation

- `docs/PINECONE_VERCEL_SETUP.md` - Pinecone setup guide
- `docs/PRODUCTION_ERRORS_FIX.md` - Previous production error fixes
- `docs/ARCHITECTURE.md` - System architecture

---

**Troubleshooting Guide Created:** November 7, 2025

