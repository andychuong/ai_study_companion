# Test Data Seeding Guide

## Overview

The test data seeding script (`scripts/seed-test-data.ts`) creates comprehensive test data for the AI Study Companion application, including users, goals, sessions, practices, and concepts.

## Running the Seed Script

```bash
npm run seed
```

This will:
- Create a tutor user (if doesn't exist)
- Create/verify test student user (if doesn't exist)
- Create concepts for Chemistry and Mathematics
- Create goals (active and completed)
- Create sessions with transcripts and analysis
- Create student concept mastery tracking
- Create practice problems (completed and assigned)

## Created Users

### Tutor User
- **Email**: `tutor@example.com`
- **Password**: `password123`
- **Name**: Dr. Sarah Johnson
- **Role**: `tutor`
- **ID**: Displayed when script runs

### Student User
- **Email**: `test@example.com`
- **Password**: `password123`
- **Name**: Test User
- **Role**: `student`
- **Grade**: 10
- **ID**: Displayed when script runs

## Created Data

### Concepts (6 total)
1. Quadratic Equations (Mathematics, difficulty: 5)
2. Chemical Bonding (Chemistry, difficulty: 6)
3. pH and Acidity (Chemistry, difficulty: 4)
4. Algebraic Expressions (Mathematics, difficulty: 3)
5. Oxidation States (Chemistry, difficulty: 7)
6. Molarity Calculations (Chemistry, difficulty: 6)

### Goals (3 total)
1. **Active**: Master acid-base chemistry and pH calculations (Chemistry, 45% progress)
2. **Active**: Complete Algebra II curriculum (Mathematics, 30% progress)
3. **Completed**: Understand chemical bonding concepts (Chemistry, 100% progress)

### Sessions (3 total)
1. **Acid-Base Chemistry** (Oct 15, 2025)
   - Duration: 1 hour
   - Topics: Acid-Base Chemistry, pH Calculations, Hydrogen Ion Concentration
   - Concepts: pH and Acidity (75% mastery), Molarity Calculations (60% mastery)

2. **Chemical Bonding** (Oct 20, 2025)
   - Duration: 45 minutes
   - Topics: Chemical Bonding, Ionic Bonds, Covalent Bonds
   - Concepts: Chemical Bonding (80% mastery)

3. **Quadratic Equations** (Nov 1, 2025)
   - Duration: 1 hour
   - Topics: Quadratic Equations, Algebra
   - Concepts: Quadratic Equations (70% mastery), Algebraic Expressions (65% mastery)

### Practices (2 total)
1. **Completed Practice** (from Acid-Base session)
   - 2 questions (pH calculation, water formula)
   - Score: 100%
   - Completed: Oct 16, 2025

2. **Assigned Practice** (from Chemical Bonding session)
   - 1 question (bond types)
   - Status: Assigned
   - Due: Nov 15, 2025

## Using the Test Data

### Login
You can login with either user:
- Student: `test@example.com` / `password123`
- Tutor: `tutor@example.com` / `password123`

### Testing Features

1. **Goals Page** (`/goals`)
   - View 3 goals (2 active, 1 completed)
   - Create new goals
   - Mark goals as complete

2. **Sessions Page** (`/sessions`)
   - View 3 sessions with transcripts
   - See analysis data (topics, concepts, strengths)
   - View concept mastery levels

3. **Practice Page** (`/practice`)
   - View 2 practices (1 completed, 1 assigned)
   - Complete the assigned practice
   - Review completed practice results

4. **Dashboard** (`/dashboard`)
   - See progress statistics
   - View active goals count
   - See sessions and practices data

5. **Chat** (`/chat`)
   - Chat with AI about Chemistry or Mathematics topics
   - The AI can reference the session transcripts for context

### Uploading Transcripts

To upload a new transcript, you'll need the tutor ID. You can find it:
- In the seed script output
- By querying the database: `SELECT id FROM users WHERE email = 'tutor@example.com'`

Example API call:
```bash
curl -X POST http://localhost:3001/api/transcripts/upload \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "tutorId": "TUTOR_ID_HERE",
    "sessionDate": "2025-11-07T10:00:00Z",
    "duration": 3600,
    "transcript": "Your transcript text here...",
    "transcriptSource": "manual_upload",
    "transcriptFormat": "plain_text"
  }'
```

## Re-running the Script

The script is **idempotent** - you can run it multiple times safely:
- Existing users won't be duplicated
- Existing concepts won't be recreated
- Existing goals won't be duplicated (based on subject + description)
- New sessions and practices will be created each time

## Troubleshooting

### DATABASE_URL not set
Make sure `.env.local` exists and contains `DATABASE_URL`:
```bash
DATABASE_URL=postgresql://user:password@host:port/database
```

### User already exists
This is normal - the script checks for existing users and won't create duplicates.

### Duplicate key errors
If you see duplicate key errors, the script tried to create data that already exists. This shouldn't happen due to the idempotency checks, but if it does, you can:
1. Clear specific tables in the database
2. Modify the script to skip those items
3. Delete specific records manually

## Next Steps

After seeding:
1. ✅ Test Goals feature - Create, view, and complete goals
2. ✅ Test Sessions - View transcripts and analysis
3. ✅ Test Practices - Complete assigned practices
4. ✅ Test Dashboard - Verify data visualization
5. ✅ Test Chat - Ask questions about seeded topics

## Notes

- The tutor user is required for uploading transcripts
- Session transcripts include realistic conversation examples
- Practices are linked to sessions for context
- Concept mastery is tracked and updated based on session performance
- All dates are set in the past for realistic testing

