import { pgTable, uuid, varchar, text, integer, timestamp, jsonb, boolean, check, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['student', 'tutor', 'admin']);
export const sessionStatusEnum = pgEnum('session_status', ['pending', 'processing', 'completed', 'failed']);
export const goalStatusEnum = pgEnum('goal_status', ['active', 'completed', 'paused']);
export const practiceStatusEnum = pgEnum('practice_status', ['assigned', 'in_progress', 'completed']);

// Users Table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull(),
  grade: integer('grade'), // for students
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Students Table (Extended Profile)
export const students = pgTable('students', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  grade: integer('grade'),
  learningStyle: varchar('learning_style', { length: 50 }),
  interests: jsonb('interests').$type<string[]>(),
  strengths: jsonb('strengths').$type<string[]>(),
  preferences: jsonb('preferences').$type<Record<string, any>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Sessions Table
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tutorId: uuid('tutor_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sessionDate: timestamp('session_date').notNull(),
  duration: integer('duration').notNull(), // seconds
  transcript: text('transcript').notNull(),
  transcriptSource: varchar('transcript_source', { length: 50 }).notNull(),
  transcriptFormat: varchar('transcript_format', { length: 50 }).notNull(),
  analysisStatus: sessionStatusEnum('analysis_status').default('pending').notNull(),
  analysisData: jsonb('analysis_data').$type<{
    topics: string[];
    concepts: Array<{
      name: string;
      difficulty: number;
      masteryLevel: number;
    }>;
    studentStrengths: string[];
    areasForImprovement: string[];
    actionItems: string[];
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Concepts Table
export const concepts = pgTable('concepts', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 100 }).notNull(),
  description: text('description'),
  difficulty: integer('difficulty').$type<number>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  difficultyCheck: check('difficulty_check', 'difficulty >= 1 AND difficulty <= 10'),
}));

// Student Concepts (Mastery Tracking)
export const studentConcepts = pgTable('student_concepts', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  conceptId: uuid('concept_id').notNull().references(() => concepts.id, { onDelete: 'cascade' }),
  masteryLevel: integer('mastery_level').default(0).notNull(),
  lastPracticed: timestamp('last_practiced'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  masteryCheck: check('mastery_check', 'mastery_level >= 0 AND mastery_level <= 100'),
  uniqueStudentConcept: check('unique_student_concept', `(${table.studentId}, ${table.conceptId}) IS UNIQUE`),
}));

// Goals Table
export const goals = pgTable('goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  subject: varchar('subject', { length: 100 }).notNull(),
  description: text('description').notNull(),
  status: goalStatusEnum('status').default('active').notNull(),
  progress: integer('progress').default(0).notNull(),
  targetDate: timestamp('target_date'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  progressCheck: check('progress_check', 'progress >= 0 AND progress <= 100'),
}));

// Practices Table
export const practices = pgTable('practices', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sessionId: uuid('session_id').references(() => sessions.id, { onDelete: 'set null' }),
  status: practiceStatusEnum('status').default('assigned').notNull(),
  questions: jsonb('questions').$type<Array<{
    questionId: string;
    question: string;
    type: string;
    options?: string[];
    difficulty: number;
    conceptId: string;
  }>>().notNull(),
  answers: jsonb('answers').$type<Array<{
    questionId: string;
    answer: string;
    timestamp: string;
  }>>(),
  score: integer('score'),
  assignedAt: timestamp('assigned_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  dueAt: timestamp('due_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Conversations Table
export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Messages Table
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 50 }).notNull(),
  content: text('content').notNull(),
  metadata: jsonb('metadata').$type<{
    confidence?: number;
    sources?: Array<{
      sessionId: string;
      relevance: number;
      excerpt: string;
    }>;
    suggestTutor?: boolean;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  roleCheck: check('role_check', "role IN ('user', 'assistant')"),
}));

// Subject Suggestions Table
export const subjectSuggestions = pgTable('subject_suggestions', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  completedGoalId: uuid('completed_goal_id').references(() => goals.id, { onDelete: 'set null' }),
  subject: varchar('subject', { length: 100 }).notNull(),
  description: text('description'),
  relevanceScore: integer('relevance_score').$type<number>(),
  valueProposition: text('value_proposition'),
  status: varchar('status', { length: 50 }).default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  statusCheck: check('status_check', "status IN ('pending', 'accepted', 'dismissed')"),
}));

// Notifications Table (for engagement nudges and other notifications)
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(), // 'engagement_nudge', 'goal_completed', 'practice_assigned', etc.
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  cta: varchar('cta', { length: 255 }), // Call-to-action text
  ctaUrl: varchar('cta_url', { length: 500 }), // URL for CTA button
  urgency: varchar('urgency', { length: 20 }).default('low').notNull(), // 'low', 'medium', 'high'
  read: boolean('read').default(false).notNull(),
  readAt: timestamp('read_at'),
  metadata: jsonb('metadata').$type<Record<string, any>>(), // Additional data
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  urgencyCheck: check('urgency_check', "urgency IN ('low', 'medium', 'high')"),
}));

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  student: one(students, {
    fields: [users.id],
    references: [students.userId],
  }),
  sessionsAsStudent: many(sessions, { relationName: 'studentSessions' }),
  sessionsAsTutor: many(sessions, { relationName: 'tutorSessions' }),
  goals: many(goals),
  practices: many(practices),
  conversations: many(conversations),
  studentConcepts: many(studentConcepts),
  suggestions: many(subjectSuggestions),
  notifications: many(notifications),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  student: one(users, {
    fields: [sessions.studentId],
    references: [users.id],
    relationName: 'studentSessions',
  }),
  tutor: one(users, {
    fields: [sessions.tutorId],
    references: [users.id],
    relationName: 'tutorSessions',
  }),
  practices: many(practices),
}));

export const conceptsRelations = relations(concepts, ({ many }) => ({
  studentConcepts: many(studentConcepts),
}));

export const studentConceptsRelations = relations(studentConcepts, ({ one }) => ({
  student: one(users, {
    fields: [studentConcepts.studentId],
    references: [users.id],
  }),
  concept: one(concepts, {
    fields: [studentConcepts.conceptId],
    references: [concepts.id],
  }),
}));

export const goalsRelations = relations(goals, ({ one, many }) => ({
  student: one(users, {
    fields: [goals.studentId],
    references: [users.id],
  }),
  suggestions: many(subjectSuggestions),
}));

export const practicesRelations = relations(practices, ({ one }) => ({
  student: one(users, {
    fields: [practices.studentId],
    references: [users.id],
  }),
  session: one(sessions, {
    fields: [practices.sessionId],
    references: [sessions.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  student: one(users, {
    fields: [conversations.studentId],
    references: [users.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

export const subjectSuggestionsRelations = relations(subjectSuggestions, ({ one }) => ({
  student: one(users, {
    fields: [subjectSuggestions.studentId],
    references: [users.id],
  }),
  completedGoal: one(goals, {
    fields: [subjectSuggestions.completedGoalId],
    references: [goals.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  student: one(users, {
    fields: [notifications.studentId],
    references: [users.id],
  }),
}));

