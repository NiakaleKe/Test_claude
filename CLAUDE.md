# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# First-time setup (install deps, generate Prisma client, run migrations)
npm run setup

# Development server (Turbopack)
npm run dev

# Build for production
npm run build

# Lint
npm run lint

# Run all tests
npm test

# Run a single test file
npx vitest run src/components/chat/__tests__/ChatInterface.test.tsx

# Reset the database
npm run db:reset
```

## Architecture

UIGen is a Next.js 15 App Router application that uses Claude AI to generate React components with live preview. The core loop: user sends a chat message → `/api/chat` streams tool calls → AI manipulates a virtual file system → the preview iframe re-renders.

### Virtual File System

`src/lib/file-system.ts` — An in-memory `VirtualFileSystem` class that holds all generated files (never written to disk). It is serialized to JSON for persistence (stored in Prisma as a string in `Project.data`) and reconstructed on each request.

### AI Integration (`src/app/api/chat/route.ts`)

Uses Vercel AI SDK's `streamText` with two tools backed by the VirtualFileSystem:
- `str_replace_editor` (`src/lib/tools/str-replace.ts`) — text editor operations (view, create, str_replace, insert)
- `file_manager` (`src/lib/tools/file-manager.ts`) — file/directory management (delete, rename, list)

When `ANTHROPIC_API_KEY` is missing, `getLanguageModel()` (`src/lib/provider.ts`) returns a `MockLanguageModel` that produces static demo components without hitting the API.

### Preview Rendering (`src/components/preview/PreviewFrame.tsx`)

Files from the VirtualFileSystem are compiled in-browser by `@babel/standalone` inside an `<iframe srcdoc>`. `src/lib/transform/jsx-transformer.ts` builds an import map and generates the preview HTML. The entry point defaults to `/App.jsx` with fallbacks to `App.tsx`, `index.jsx`, `index.tsx`.

### State Management

`src/lib/contexts/file-system-context.tsx` — React context wrapping the VirtualFileSystem, provides `refreshTrigger` to tell `PreviewFrame` when to re-render.

`src/lib/contexts/chat-context.tsx` — React context for chat state shared between `ChatInterface` and the rest of the UI.

### Auth & Persistence

- JWT-based auth via `jose`, stored as an httpOnly cookie (`auth-token`), 7-day expiry.
- `src/lib/auth.ts` is `server-only` — never import it in client components.
- Anonymous users' work is preserved in `sessionStorage` via `src/lib/anon-work-tracker.ts` and can be saved to a project on sign-up/sign-in.
- Prisma with SQLite (`prisma/dev.db`). Messages and file system state are stored as JSON strings in `Project.messages` and `Project.data`.
- Generated Prisma client lives in `src/generated/prisma/` (not `node_modules`).

### Routing

- `/` — Home; authenticated users are redirected to their most recent project or a new one is created.
- `/[projectId]` — Project workspace with chat, code editor, and preview panels.
- `/api/chat` — Streaming AI endpoint (no auth required; project save only happens for authenticated users).
- Middleware (`src/middleware.ts`) protects `/api/projects` and `/api/filesystem` routes.

### UI Components

`src/components/ui/` contains shadcn/ui primitives (Radix UI based). The main layout uses `react-resizable-panels` for the chat/editor/preview split. Code editing uses Monaco Editor.
