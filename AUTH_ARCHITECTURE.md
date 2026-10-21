# Authentication Architecture

## Overview

This document explains how authentication state is managed across the application.

## Architecture Layers

### 1. **Middleware Layer** (`middleware.ts` + `utils/supabase/middleware.ts`)
- **Purpose:** Runs on every request, refreshes session, protects routes
- **What it does:**
  - Refreshes Supabase session cookies
  - Redirects unauthenticated users from protected routes
  - Allows public routes (`/login`, `/signup`, `/hero`, `/auth`, `/error`)

### 2. **Server-Side Auth Utilities** (`lib/auth/server.ts`)
- **Purpose:** Helper functions for Server Components and Server Actions
- **Key Functions:**
  - `getUser()` - Get user or null
  - `requireAuth()` - Get user or redirect to login
  - `isAuthenticated()` - Boolean check

### 3. **Client-Side Auth Context** (`lib/auth/client.tsx`)
- **Purpose:** React context for client components
- **Components:**
  - `<AuthProvider>` - Wraps app in root layout
  - `useAuth()` - Hook to access user state
- **Features:**
  - Automatically listens to auth state changes
  - Provides loading state
  - Reactive updates when user logs in/out

### 4. **UI Components**
- **Unified Navbar** (`components/ui/navbar-unified.tsx`)
  - Automatically switches between logged-in and logged-out views
  - Uses `useAuth()` to determine state
- **Old Navbars** (deprecated):
  - `components/ui/navbar.tsx` - For logged-out users
  - `components/ui/loggedInNavbar.tsx` - For logged-in users

## Data Flow

### Login Flow
1. User submits login form → Server Action (`app/login/actions.ts`)
2. Server Action calls Supabase → Sets session cookies
3. Middleware refreshes session on next request
4. `AuthProvider` detects auth change → Updates context
5. Components using `useAuth()` re-render with new user
6. Navbar automatically switches to logged-in view

### Logout Flow
1. User clicks logout → Server Action (`app/login/actions.ts`)
2. Server Action calls `supabase.auth.signOut()` → Clears cookies
3. `AuthProvider` detects auth change → Sets user to null
4. Components using `useAuth()` re-render
5. Navbar automatically switches to logged-out view
6. Hard redirect to `/hero` (clears all state)

### Protected Route Access
1. User navigates to protected route
2. Middleware checks auth → If not authenticated, redirects to `/hero`
3. Server Component can use `requireAuth()` for additional checks
4. Client Component can use `useAuth()` to conditionally render

## File Structure

```
lib/auth/
├── server.ts          # Server-side utilities
├── client.tsx         # Client-side context & hooks
└── README.md          # Detailed usage guide

components/ui/
├── navbar-unified.tsx # Unified navbar (use this)
├── navbar.tsx         # Old logged-out navbar (deprecated)
└── loggedInNavbar.tsx # Old logged-in navbar (deprecated)

app/
├── layout.tsx         # Contains <AuthProvider>
├── login/
│   ├── actions.ts     # Login/logout server actions
│   └── page.tsx       # Login page
└── signup/
    ├── actions.ts     # Signup server action
    └── page.tsx       # Signup page

utils/supabase/
├── server.ts          # Server Supabase client
├── client.ts          # Client Supabase client
└── middleware.ts      # Middleware session refresh
```

## Best Practices

### Server Components
- Use `requireAuth()` for protected pages
- Use `getUser()` for optional auth
- Don't manually call `createClient()` and `getUser()` - use helpers

### Client Components
- Use `useAuth()` hook to access user state
- Check `loading` state before rendering
- Handle `user === null` case

### Server Actions
- Use `requireAuth()` at the start of protected actions
- Return errors instead of redirecting (let client handle it)

### Route Protection
- Middleware handles most route protection automatically
- Use `requireAuth()` in Server Components for additional checks
- Use `useAuth()` in Client Components for conditional rendering

## Migration Path

1. ✅ **AuthProvider added to layout** - Done
2. ⏳ **Replace old navbars** - Use `navbar-unified.tsx`
3. ⏳ **Update pages to use helpers** - Replace manual auth checks
4. ⏳ **Remove old navbar components** - After migration complete

## Example: Complete Page with Auth

### Server Component Example
```tsx
// app/dashboard/page.tsx
import { requireAuth } from '@/lib/auth/server'
import { NavBar } from '@/components/ui/navbar-unified'

export default async function DashboardPage() {
  const user = await requireAuth() // Protected route
  
  return (
    <>
      <NavBar />
      <div>Welcome, {user.email}!</div>
    </>
  )
}
```

### Client Component Example
```tsx
// components/UserMenu.tsx
'use client'

import { useAuth } from '@/lib/auth/client'
import { logout } from '@/app/login/actions'

export function UserMenu() {
  const { user, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user) return null
  
  return (
    <div>
      <p>{user.email}</p>
      <form action={logout}>
        <button type="submit">Logout</button>
      </form>
    </div>
  )
}
```

## Benefits of This Architecture

1. **Single Source of Truth:** Auth state managed in one place
2. **Type Safety:** TypeScript types throughout
3. **Reactive:** Components automatically update on auth changes
4. **Simple API:** Easy-to-use functions and hooks
5. **Consistent:** Same patterns everywhere
6. **Maintainable:** Clear separation of concerns
