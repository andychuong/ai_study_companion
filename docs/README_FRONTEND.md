# AI Study Companion - Frontend

This is the frontend application for the AI Study Companion, built with Next.js 14+ (App Router), React, TypeScript, and Tailwind CSS.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy the environment variables:
```bash
cp .env.example .env.local
```

3. Update `.env.local` with your configuration:
   - `NEXT_PUBLIC_API_URL`: Your backend API URL (default: `http://localhost:3000/api`)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
app/
├── (auth)/              # Authentication route group
│   ├── login/          # Login page
│   └── register/       # Registration page
├── (dashboard)/        # Dashboard route group
│   ├── dashboard/      # Main dashboard
│   ├── chat/           # AI chat interface
│   ├── practice/       # Practice list and detail
│   ├── sessions/       # Session history
│   └── goals/          # Goals management
├── layout.tsx          # Root layout
└── globals.css         # Global styles

components/
├── ui/                 # Base UI components
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   └── ...

lib/
├── api/                # API client and services
│   ├── client.ts
│   ├── auth.ts
│   ├── chat.ts
│   └── ...
├── stores/             # Zustand stores
│   ├── authStore.ts
│   ├── uiStore.ts
│   └── chatStore.ts
├── hooks/              # Custom React hooks
│   ├── useStudent.ts
│   ├── usePractices.ts
│   └── ...
└── providers/          # React providers
    └── QueryProvider.tsx

types/
└── index.ts            # TypeScript type definitions
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components built with Radix UI primitives
- **State Management**: 
  - TanStack Query (React Query) for server state
  - Zustand for client state
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios

## 📱 Features

### Authentication
- Login and registration pages
- Protected routes
- Token-based authentication

### Dashboard
- Progress overview with stats cards
- Learning progress charts
- Subject distribution visualization
- Concept mastery tracking
- Quick actions

### Chat Interface
- Conversational Q&A with AI companion
- Message history
- Source citations
- Tutor routing suggestions

### Practice
- Practice list with filters
- Practice detail page with questions
- Multiple question types (multiple choice, short answer, problem-solving)
- Results and feedback

### Sessions
- Session history
- Session details with transcript viewer
- Concept extraction display
- Topics covered

### Goals
- Create and manage learning goals
- Track progress
- Active and completed goals
- Progress visualization

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Code Style

- ESLint for linting
- TypeScript for type safety
- Prettier (recommended) for formatting

## 🔌 API Integration

The frontend communicates with the backend through REST APIs. All API calls are handled through:

- `lib/api/client.ts` - Axios instance with interceptors
- `lib/api/*.ts` - Service-specific API functions

### API Endpoints Used

- `/api/auth/*` - Authentication
- `/api/transcripts/*` - Session transcripts
- `/api/chat/*` - Chat messages
- `/api/practice/*` - Practice assignments
- `/api/goals/*` - Learning goals
- `/api/progress/*` - Student progress

## 🎨 Styling

The project uses Tailwind CSS with a custom design system:

- **Primary Colors**: Blue palette
- **Secondary Colors**: Gray palette
- **Status Colors**: Success (green), Warning (yellow), Error (red), Info (blue)

## 📦 Building for Production

```bash
npm run build
npm run start
```

## 🧪 Testing

Testing setup is ready for:
- Unit tests with Vitest
- Component tests with React Testing Library
- E2E tests with Playwright (to be configured)

## 📝 Environment Variables

See `.env.example` for all required environment variables.

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript for all new files
3. Follow the component patterns established in `components/ui/`
4. Update types in `types/index.ts` when adding new features

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🐛 Troubleshooting

### Common Issues

1. **API connection errors**: Check `NEXT_PUBLIC_API_URL` in `.env.local`
2. **Authentication not working**: Verify token storage and API endpoints
3. **Styling issues**: Ensure Tailwind CSS is properly configured

## 📄 License

[Your License Here]

