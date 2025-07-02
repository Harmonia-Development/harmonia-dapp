# 📦 Lib Package — Shared Client & Utilities

This package centralizes shared logic, clients, hooks, and types that are reused across different apps (e.g., `webapp`, `admin`). It promotes reusability, consistency, and a clean separation of concerns in a monorepo architecture.

## 🔑 Key Features

- 🔌 **Supabase Clients**: Separation of browser and server clients to support SSR and client-only contexts.
- 🔒 **Middleware**: Auth utilities using Supabase service role tokens and session validation for secure server operations.
- 🔁 **React Query Integration**: Custom hooks and providers to interact with Supabase via TanStack Query.
- 🧩 **Shared Types**: Centralized Supabase client typings to reduce duplication across apps.

## 🗂️ Package Structure

```
packages/lib
├── src/
│   ├── hooks/                           # Custom TanStack Query hooks
│   │   ├── index.ts
│   │   └── use-supabase-query.hook.ts
│   ├── providers/                       # React Query client provider
│   │   ├── index.ts
│   │   └── react-query-client-provider.tsx
│   ├── supabase/
│   │   ├── client/                      # Browser-side Supabase client
│   │   │   ├── browser-client.ts
│   │   │   └── index.ts
│   │   ├── server/                      # Server-side Supabase client and middleware
│   │   │   ├── middleware.ts
│   │   │   ├── server-client.ts
│   │   │   ├── server-query.ts
│   │   │   └── index.ts
│   │   └── shared/                      # Shared logic (e.g., env checks, service client)
│   │       ├── check-env-vars.ts
│   │       ├── service-role-client.ts
│   │       └── index.ts
│   ├── types/                           # Global Supabase-related type definitions
│   │   ├── index.ts
│   │   └── supabase-client.type.ts
│   └── index.ts                         # Barrel export for entire lib
├── package.json                         # Local package definition
```

> ⚠️ This is an internal shared package. It should only be imported from other apps or services within the monorepo — do **not** run it standalone.
