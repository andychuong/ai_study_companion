# Pinecone Environment Variables for Vercel

**Date:** November 7, 2025  
**Status:** Setup Guide

---

## Quick Answer

**Yes, you need to add Pinecone keys to Vercel for production.**

You can use the same keys as dev, but it's recommended to use separate keys for better security and access control.

---

## Required Environment Variables

### 1. `PINECONE_API_KEY` (Required)
- **Purpose:** Authenticates your application with Pinecone
- **Where to get it:** Pinecone Console → API Keys section
- **Required for:** RAG features (vector search, transcript analysis)

### 2. `PINECONE_INDEX_NAME` (Optional)
- **Purpose:** Specifies which Pinecone index to use
- **Default:** `study-companion` (if not set)
- **Where to get it:** Pinecone Console → Indexes section
- **Required for:** RAG features

---

## Can You Use the Same Keys as Dev?

### ✅ Yes, You Can
- **Same API Key:** You can use the same `PINECONE_API_KEY` for both dev and production
- **Same Index:** You can use the same `PINECONE_INDEX_NAME` for both environments
- **Works Fine:** This will work and is acceptable for small projects

### ⚠️ Recommended: Separate Keys
- **Better Security:** Separate keys allow you to:
  - Revoke dev keys without affecting production
  - Set different permissions for each environment
  - Track usage separately
  - Better access control

### 📊 Best Practice
- **Development:** Use a dev API key with read-write permissions
- **Production:** Use a production API key with read-write permissions
- **Same Index:** You can share the same index, or create separate indexes

---

## How to Add to Vercel

### Step 1: Get Your Pinecone API Key

1. Go to [Pinecone Console](https://app.pinecone.io/)
2. Log in to your account
3. Select your project
4. Navigate to **API Keys** section
5. Click **Create API Key**
6. Give it a name (e.g., "Production API Key")
7. Copy the API key (you won't be able to see it again!)

### Step 2: Get Your Index Name

1. In Pinecone Console, go to **Indexes** section
2. Find your index name (e.g., `study-companion`)
3. Copy the index name

### Step 3: Add to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `ai-study-companion`
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

**Variable 1:**
- **Name:** `PINECONE_API_KEY`
- **Value:** Your Pinecone API key (starts with `pcsk_...`)
- **Environment:** Production, Preview, Development (or just Production)
- Click **Save**

**Variable 2:**
- **Name:** `PINECONE_INDEX_NAME`
- **Value:** `study-companion` (or your index name)
- **Environment:** Production, Preview, Development (or just Production)
- Click **Save**

### Step 4: Redeploy

After adding the environment variables:
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Or push a new commit to trigger a new deployment

---

## What Happens Without Pinecone Keys?

### ✅ Application Still Works
- The application will still function
- Authentication, goals, sessions, etc. will all work
- Chat will work (but without RAG context)

### ⚠️ RAG Features Won't Work
- **Chat:** Will work but won't have context from previous sessions
- **Transcript Analysis:** Will work but won't store embeddings
- **Vector Search:** Will return empty results

### 📝 Error Handling
The application gracefully handles missing Pinecone keys:
- Returns empty results instead of crashing
- Logs warnings instead of errors
- Continues to function normally

---

## Current Status

### ✅ Already Handled
- Error handling for missing Pinecone keys
- Graceful degradation when Pinecone is unavailable
- Default index name (`study-companion`)

### ⏸️ To Do
- Add `PINECONE_API_KEY` to Vercel
- Add `PINECONE_INDEX_NAME` to Vercel (optional)
- Redeploy application

---

## Verification

### Check if Keys Are Set

After deployment, you can verify:

1. **Check Vercel Logs:**
   - Go to Vercel Dashboard → Your Project → Logs
   - Look for: `⚠️  PINECONE_API_KEY is not set` (should NOT appear)

2. **Test Chat:**
   - Try using the chat feature
   - If RAG is working, responses should reference previous sessions
   - If not working, chat will still work but without context

3. **Test Transcript Upload:**
   - Upload a transcript
   - Check if analysis completes successfully
   - Vectors should be stored in Pinecone

---

## Environment Variables Summary

### Required for Production

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `PINECONE_API_KEY` | ✅ Yes | None | Authenticates with Pinecone |
| `PINECONE_INDEX_NAME` | ⚠️ Optional | `study-companion` | Specifies which index to use |

### Other Required Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string |
| `JWT_SECRET` | ✅ Yes | JWT token signing |
| `OPENAI_API_KEY` | ✅ Yes | AI features (chat, embeddings) |
| `INNGEST_EVENT_KEY` | ⚠️ Optional | Background jobs |
| `INNGEST_SIGNING_KEY` | ⚠️ Optional | Background jobs |

---

## Recommendations

### For Small Projects
- ✅ Use the same API key for dev and production
- ✅ Use the same index for both environments
- ✅ Simple and works fine

### For Larger Projects
- ✅ Create separate API keys for dev and production
- ✅ Consider separate indexes for dev and production
- ✅ Better security and access control
- ✅ Easier to track usage

---

## Troubleshooting

### Issue: Chat Not Using RAG Context

**Possible Causes:**
1. `PINECONE_API_KEY` not set in Vercel
2. `PINECONE_INDEX_NAME` doesn't match your index
3. Index doesn't exist in Pinecone
4. No vectors stored yet (need to upload transcripts first)

**Solutions:**
1. Verify keys are set in Vercel
2. Check index name matches
3. Create index in Pinecone if needed
4. Upload a transcript to generate vectors

### Issue: Transcript Analysis Not Storing Vectors

**Possible Causes:**
1. `PINECONE_API_KEY` not set
2. Index doesn't exist
3. Embedding dimensions mismatch

**Solutions:**
1. Verify `PINECONE_API_KEY` is set
2. Create index with correct dimensions (3072 for text-embedding-3-large)
3. Check Vercel logs for errors

---

## Conclusion

**Yes, add Pinecone keys to Vercel for production.**

**You can use the same keys as dev**, but separate keys are recommended for better security.

**Without Pinecone keys:**
- Application will still work
- RAG features won't work
- Chat will work but without context

**With Pinecone keys:**
- Full RAG functionality
- Chat with context from previous sessions
- Transcript analysis with vector storage

---

**Setup Guide Created:** November 7, 2025

