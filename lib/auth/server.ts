/**
 * Server-side authentication utilities
 * Use these in Server Components, Server Actions, and Route Handlers
 */

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export interface AuthUser {
  id: string
  email?: string
  [key: string]: unknown
}

/**
 * Get the current authenticated user (server-side)
 * Returns null if not authenticated
 */
export async function getUser(): Promise<AuthUser | null> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user as unknown as AuthUser
}

/**
 * Get the current authenticated user with session info
 * Returns null if not authenticated
 */
export async function getUserWithSession() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (error || !user) {
    return { user: null, session: null }
  }
  
  return { user: user as unknown as AuthUser, session }
}

/**
 * Require authentication - redirects to login if not authenticated
 * Use this in Server Components that require auth
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  return user
}

/**
 * Check if user is authenticated (server-side)
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getUser()
  return user !== null
}
