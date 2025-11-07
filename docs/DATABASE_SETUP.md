# Database Setup Guide

This guide will help you get a `DATABASE_URL` for your AI Study Companion application.

## Option 1: Neon (Recommended for Serverless)

Neon is a serverless PostgreSQL database that's perfect for Vercel deployments.

### Steps:

1. **Sign up for Neon**
   - Go to https://neon.tech
   - Sign up for a free account (no credit card required)

2. **Create a new project**
   - Click "Create Project"
   - Choose a project name (e.g., "ai-study-companion")
   - Select a region close to you
   - Choose PostgreSQL version (15 or 16 recommended)

3. **Get your connection string**
   - After creating the project, you'll see a connection string that looks like:
     ```
     postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
     ```
   - **Important**: Use the **connection pooler** URL for serverless (it will have `-pooler` in the hostname)
   - The connection string should look like:
     ```
     postgresql://username:password@ep-xxx-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require
     ```

4. **Copy the connection string**
   - Click "Copy connection string" in the Neon dashboard
   - This is your `DATABASE_URL`

---

## Option 2: Supabase (Alternative)

Supabase provides PostgreSQL with additional features like authentication and storage.

### Steps:

1. **Sign up for Supabase**
   - Go to https://supabase.com
   - Sign up for a free account

2. **Create a new project**
   - Click "New Project"
   - Choose an organization (or create one)
   - Enter project details:
     - Name: "ai-study-companion"
     - Database Password: (create a strong password)
     - Region: Choose closest to you
   - Wait for the project to be created (~2 minutes)

3. **Get your connection string**
   - Go to Project Settings → Database
   - Scroll to "Connection string"
   - Select "URI" tab
   - Copy the connection string
   - It will look like:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
     ```
   - Replace `[YOUR-PASSWORD]` with the password you set during project creation

4. **Use connection pooling (recommended)**
   - For serverless, use the "Connection pooling" string instead
   - It will have `pooler.supabase.com` in the hostname
   - Format: `postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-xxx.pooler.supabase.com:6543/postgres`

---

## Option 3: Local PostgreSQL (For Development)

If you want to run PostgreSQL locally:

### Steps:

1. **Install PostgreSQL**
   - **macOS**: `brew install postgresql@15` or download from https://postgresapp.com
   - **Windows**: Download from https://www.postgresql.org/download/windows/
   - **Linux**: `sudo apt-get install postgresql` (Ubuntu/Debian)

2. **Start PostgreSQL**
   ```bash
   # macOS with Homebrew
   brew services start postgresql@15
   
   # Or with Postgres.app, just open the app
   ```

3. **Create a database**
   ```bash
   # Connect to PostgreSQL
   psql postgres
   
   # Create database
   CREATE DATABASE ai_study_companion;
   
   # Create a user (optional)
   CREATE USER study_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE ai_study_companion TO study_user;
   
   # Exit
   \q
   ```

4. **Get your connection string**
   ```
   postgresql://study_user:your_password@localhost:5432/ai_study_companion
   ```
   Or if using default postgres user:
   ```
   postgresql://postgres:your_password@localhost:5432/ai_study_companion
   ```

---

## Setting Up Your Environment Variables

Once you have your `DATABASE_URL`, add it to your `.env.local` file:

1. **Create `.env.local` file** (if it doesn't exist):
   ```bash
   touch .env.local
   ```

2. **Add your DATABASE_URL**:
   ```bash
   DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
   ```

3. **Add other required variables**:
   ```bash
   # Database
   DATABASE_URL=your_connection_string_here
   
   # NextAuth
   NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
   NEXTAUTH_URL=http://localhost:3001
   
   # OpenAI (get from https://platform.openai.com/api-keys)
   OPENAI_API_KEY=sk-...
   
   # Pinecone (get from https://app.pinecone.io)
   PINECONE_API_KEY=your_pinecone_key
   PINECONE_INDEX_NAME=study-companion
   ```

4. **Generate NEXTAUTH_SECRET**:
   ```bash
   openssl rand -base64 32
   ```
   Copy the output and use it as your `NEXTAUTH_SECRET`

---

## Running Database Migrations

After setting up your `DATABASE_URL`, run the migrations to create the database schema:

```bash
# Generate migration files from your schema
npm run db:generate

# Apply migrations to your database
npm run db:migrate

# (Optional) Open Drizzle Studio to view your database
npm run db:studio
```

---

## Testing Your Connection

You can test if your database connection works by:

1. **Starting the dev server**:
   ```bash
   npm run dev
   ```

2. **Making a test API call**:
   ```bash
   curl -X POST http://localhost:3001/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "test123",
       "name": "Test User",
       "role": "student",
       "grade": 10
     }'
   ```

If it works, you'll get a response with a user object and token!

---

## Troubleshooting

### Connection Refused
- Check that your database is running (for local PostgreSQL)
- Verify your connection string is correct
- For Neon/Supabase, ensure you're using the pooler URL for serverless

### SSL Required
- Add `?sslmode=require` to your connection string
- Neon and Supabase require SSL connections

### Authentication Failed
- Double-check your username and password
- For Supabase, make sure you replaced `[YOUR-PASSWORD]` in the connection string

### Database Does Not Exist
- Create the database first (for local PostgreSQL)
- Neon/Supabase create the database automatically

---

## Quick Start (Recommended: Neon)

1. Go to https://neon.tech and sign up
2. Create a new project
3. Copy the **pooler** connection string
4. Add it to `.env.local` as `DATABASE_URL`
5. Run `npm run db:migrate`
6. Start coding! 🚀

