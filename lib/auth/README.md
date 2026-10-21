# Authentication State Management

This directory contains utilities for managing authentication state across your Next.js application.

## Architecture Overview

### Server-Side (`lib/auth/server.ts`)
- **Use in:** Server Components, Server Actions, Route Handlers
- **Purpose:** Check auth state on the server, protect routes
- **Key Functions:**
  - `getUser()` - Get current user (returns null if not authenticated)
  - `requireAuth()` - Get user or redirect to login
  - `isAuthenticated()` - Check if user is logged in

### Client-Side (`lib/auth/client.tsx`)
- **Use in:** Client Components
- **Purpose:** Access auth state in React components
- **Key Components/Hooks:**
  - `<AuthProvider>` - Wrap your app to provide auth context
  - `useAuth()` - Hook to access user state

## Setup

The `AuthProvider` is already added to your root layout. All client components can now use `useAuth()`.

## Usage Examples

### Server Component (Protected Route)

```tsx
// app/dashboard/page.tsx
import { requireAuth } from '@/lib/auth/server'

export default async function DashboardPage() {
  const user = await requireAuth() // Redirects to /login if not authenticated
  
  return <div>Welcome {user.email}</div>
}
```

### Server Component (Optional Auth)

```tsx
// app/page.tsx
import { getUser } from '@/lib/auth/server'

export default async function HomePage() {
  const user = await getUser() // Returns null if not authenticated
  
  return (
    <div>
      {user ? (
        <div>Welcome back, {user.email}!</div>
      ) : (
        <div>Welcome, guest!</div>
      )}
    </div>
  )
}
```

### Client Component

```tsx
// components/UserProfile.tsx
'use client'

import { useAuth } from '@/lib/auth/client'

export function UserProfile() {
  const { user, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <div>Please log in</div>
  
  return <div>Hello, {user.email}!</div>
}
```

### Conditional Rendering

```tsx
'use client'

import { useAuth } from '@/lib/auth/client'

export function ConditionalContent() {
  const { user } = useAuth()
  
  return (
    <>
      {user ? (
        <div>Logged in content</div>
      ) : (
        <div>Public content</div>
      )}
    </>
  )
}
```

### Server Action

```tsx
// app/actions.ts
'use server'

import { requireAuth } from '@/lib/auth/server'

export async function updateProfile(formData: FormData) {
  const user = await requireAuth() // Ensures user is authenticated
  
  // ... update profile logic
}
```

## Unified Navbar

Use the unified navbar component that automatically switches based on auth state:

```tsx
import { NavBar } from '@/components/ui/navbar-unified'

export default function Page() {
  return (
    <>
      <NavBar /> {/* Automatically shows correct navbar */}
      {/* rest of page */}
    </>
  )
}
```

## Migration Guide

### Replacing Old Navbars

**Before:**
```tsx
import { LoggedInNavBar } from '@/components/ui/loggedInNavbar'
import { NavBar } from '@/components/ui/navbar'

// Had to manually choose which one
<LoggedInNavBar />
```

**After:**
```tsx
import { NavBar } from '@/components/ui/navbar-unified'

// Automatically switches based on auth
<NavBar />
```

### Replacing Manual Auth Checks

**Before:**
```tsx
// app/private/page.tsx
import { createClient } from '@/utils/supabase/server'

export default async function PrivatePage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/login')
  }
  return <p>Hello {data.user.email}</p>
}
```

**After:**
```tsx
// app/private/page.tsx
import { requireAuth } from '@/lib/auth/server'

export default async function PrivatePage() {
  const user = await requireAuth() // Handles redirect automatically
  return <p>Hello {user.email}</p>
}
```

## Benefits

1. **Centralized:** All auth logic in one place
2. **Type-safe:** TypeScript types for user objects
3. **Reactive:** Client components automatically update when auth changes
4. **Simple:** Easy-to-use functions and hooks
5. **Consistent:** Same patterns across server and client
6. **Automatic:** Navbar switches based on auth state
