# Tutor Setup for Production Testing

**Date:** November 7, 2025  
**Status:** Setup Guide

---

## Overview

This guide explains how to create a tutor user in the production database for testing the tutor booking and routing features.

---

## Quick Start

### Option 1: Using Environment Variables

```bash
# Set production database URL
export DATABASE_URL="postgresql://user:password@host:port/database"

# Set tutor credentials (optional - defaults provided)
export TUTOR_EMAIL="tutor@example.com"
export TUTOR_PASSWORD="TestTutor123!"
export TUTOR_NAME="Test Tutor"

# Run the script
npx tsx scripts/create-tutor.ts
```

### Option 2: Using .env.local

1. Add to `.env.local`:
```env
DATABASE_URL=postgresql://user:password@host:port/database
TUTOR_EMAIL=tutor@example.com
TUTOR_PASSWORD=TestTutor123!
TUTOR_NAME=Test Tutor
```

2. Run the script:
```bash
npx tsx scripts/create-tutor.ts
```

---

## Script Details

### File: `scripts/create-tutor.ts`

**What it does:**
- Creates a new user in the `users` table with `role: 'tutor'`
- Hashes the password using bcrypt
- Checks for existing users to avoid duplicates
- Returns tutor information on success

**Required:**
- `DATABASE_URL` environment variable (production database)

**Optional:**
- `TUTOR_EMAIL` (default: `tutor@example.com`)
- `TUTOR_PASSWORD` (default: `TestTutor123!`)
- `TUTOR_NAME` (default: `Test Tutor`)

---

## Step-by-Step Instructions

### Step 1: Get Production Database URL

1. Go to your database provider (Neon, Supabase, etc.)
2. Copy the connection string
3. Format: `postgresql://user:password@host:port/database`

### Step 2: Set Environment Variables

**Option A: Command Line**
```bash
export DATABASE_URL="your_production_database_url"
export TUTOR_EMAIL="tutor@example.com"
export TUTOR_PASSWORD="SecurePassword123!"
export TUTOR_NAME="John Doe - Math Tutor"
```

**Option B: .env.local**
```env
DATABASE_URL=postgresql://user:password@host:port/database
TUTOR_EMAIL=tutor@example.com
TUTOR_PASSWORD=SecurePassword123!
TUTOR_NAME=John Doe - Math Tutor
```

### Step 3: Run the Script

```bash
npx tsx scripts/create-tutor.ts
```

**Expected Output:**
```
📝 Tutor Creation Script
=======================

🔧 Creating tutor user...
📧 Email: tutor@example.com
👤 Name: Test Tutor
✅ Tutor created successfully!
   ID: abc123-def456-ghi789
   Email: tutor@example.com
   Name: Test Tutor
   Role: tutor

✅ Done!

📋 Next Steps:
   1. Test tutor login at: https://ai-study-companion-o94w.vercel.app/login
   2. Verify tutor appears in tutor list API
   3. Test tutor booking flow
```

---

## Verification

### Test 1: Check Tutor List API

```bash
# Get auth token first (login as student)
TOKEN="your_auth_token"

# Check tutor list
curl -X GET https://ai-study-companion-o94w.vercel.app/api/tutors/list \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
[
  {
    "id": "abc123-def456-ghi789",
    "email": "tutor@example.com",
    "name": "Test Tutor"
  }
]
```

### Test 2: Test Tutor Login

1. Go to: https://ai-study-companion-o94w.vercel.app/login
2. Login with tutor credentials:
   - Email: `tutor@example.com`
   - Password: `TestTutor123!`
3. Should successfully authenticate

### Test 3: Test Tutor Booking Flow

1. Go to chat page
2. Ask a question that triggers tutor routing
3. Click "Request Tutor" or "Book Tutor Session"
4. Verify tutor appears in the booking modal

---

## Default Credentials

If you don't set custom credentials, the script uses:

- **Email:** `tutor@example.com`
- **Password:** `TestTutor123!`
- **Name:** `Test Tutor`

⚠️ **Security Note:** Change these defaults for production use!

---

## Troubleshooting

### Error: DATABASE_URL is not set

**Solution:**
```bash
export DATABASE_URL="your_database_url"
# Or add to .env.local
```

### Error: Duplicate email

**Solution:**
- Tutor already exists with that email
- Use a different email or check existing tutors

### Error: User exists but is not a tutor

**Solution:**
- A user with that email exists but has a different role
- Use a different email or update the existing user's role

### Error: Connection refused

**Solution:**
- Check database URL is correct
- Verify database is accessible from your network
- Check firewall settings

---

## Multiple Tutors

To create multiple tutors, run the script multiple times with different emails:

```bash
# Tutor 1
export TUTOR_EMAIL="math-tutor@example.com"
export TUTOR_NAME="Math Tutor"
npx tsx scripts/create-tutor.ts

# Tutor 2
export TUTOR_EMAIL="science-tutor@example.com"
export TUTOR_NAME="Science Tutor"
npx tsx scripts/create-tutor.ts
```

---

## Database Schema

Tutors are stored in the `users` table:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role user_role NOT NULL,  -- 'student', 'tutor', or 'admin'
  grade INTEGER,  -- NULL for tutors
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Key Points:**
- `role` must be `'tutor'`
- `grade` is NULL for tutors (only for students)
- Email must be unique

---

## API Endpoints

### Get Tutor List

**Endpoint:** `/api/tutors/list`  
**Method:** GET  
**Auth:** Required (any authenticated user)  
**Response:**
```json
[
  {
    "id": "uuid",
    "email": "tutor@example.com",
    "name": "Test Tutor"
  }
]
```

### Tutor Context

**Endpoint:** `/api/tutor/context/student/[studentId]`  
**Method:** GET  
**Auth:** Required (tutor role)  
**Purpose:** Get student context for tutor

---

## Security Considerations

1. **Password Strength:** Use strong passwords for production tutors
2. **Email Verification:** Consider adding email verification for tutors
3. **Access Control:** Ensure tutor endpoints require proper authentication
4. **Rate Limiting:** Implement rate limiting on tutor creation

---

## Next Steps

After creating a tutor:

1. ✅ **Test Login:** Verify tutor can log in
2. ✅ **Test List:** Verify tutor appears in tutor list
3. ✅ **Test Booking:** Test the tutor booking flow
4. ✅ **Test Routing:** Test tutor routing analysis
5. ✅ **Test Context:** Test tutor context API (requires tutor auth)

---

**Setup Guide Created:** November 7, 2025

