# Frontend Architecture

## Overview

Azmoon-Saz frontend is a Next.js 14 application with App Router, React Query for data, and Material UI for components.

## Folder Structure

```
app/                    # Next.js App Router
  (dashboard)/          # Route group with UserLayout
  exams/                # Exam pages (list, create, [id], take, participate)
  questions/            # Question bank
  providers/            # QueryClientProvider
components/
  admin/                # Admin panel tabs
  exams/                # Exam-related components
  forms/                # FormField, FormSelect, etc.
  feedback/             # Loading, Alert, PageStates
  layout/               # UserLayout, UserSidebar, MobileBottomNav
  questions/            # Question forms, table
  ui/                   # Button, Card, Input, Modal, Table
hooks/                  # useAuth, useExams, useQuestions, etc.
lib/                    # Utilities, validation, query-client
services/               # API layer (ApiClient, domain services)
types/                  # TypeScript types
```

## Data Flow

- **Pages** → use **hooks** (useExams, useAuth, etc.) for data
- **Hooks** → call **services** (examService, authService)
- **Services** → use **ApiClient** for HTTP
- **React Query** handles caching, loading, and error states

## Key Conventions

- **Query keys**: Use `queryKeys` from `lib/query-client.ts`
- **Error handling**: Use `handleError` / `getErrorMessage` from `lib/error-handler`
- **Forms**: React Hook Form + Zod via `lib/validation`
- **Layout**: Authenticated routes use `UserLayout` (via (dashboard) or explicit wrap)

## API Contract

- Backend returns `{ success, data, message? }` for success
- Errors: `{ success: false, message, errors? }` (422 for validation)
- Frontend types use snake_case to match backend
