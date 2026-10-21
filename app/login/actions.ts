'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

interface ActionState {
  error?: string;
  success?: boolean;
  redirect?: string;
}

export async function login(prevState: ActionState | null, formData: FormData) {
  try {
    const supabase = await createClient()
    const user = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }
    const {data, error} = await supabase.auth.signInWithPassword(user)
    if (error) {
      // Return just the error message from Supabase
      return { error: error.message }
    }
    revalidatePath('/', 'layout')
    // Return success - redirect will be handled client-side
    return { success: true, redirect: '/' }
  } catch (error) {
    // Catch any unexpected errors
    return { error: error instanceof Error ? error.message : 'An unexpected error occurred' }
  }
}

export async function logout() {
  try {
    const supabase = await createClient()
    // Sign out with scope: 'global' to clear all sessions
    const { error } = await supabase.auth.signOut({ scope: 'global' })
    
    if (error) {
      return { error: error.message }
    }
    
    // Clear all paths to ensure cookies are cleared
    revalidatePath('/', 'layout')
    revalidatePath('/hero', 'layout')
    revalidatePath('/login', 'layout')
    
    // Return success - redirect will be handled client-side
    return { success: true, redirect: '/hero' }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An unexpected error occurred during logout' }
  }
}
