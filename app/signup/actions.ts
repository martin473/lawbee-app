'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

interface ActionState {
  error?: string;
  success?: boolean;
  message?: string;
}

export async function signup(prevState: ActionState | null, formData: FormData) {
  try {
    const supabase = await createClient()

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    const { data: signupData, error } = await supabase.auth.signUp({
      ...data,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/confirm`,
      },
    })

    if (error) {
      // Return just the error message from Supabase
      return { error: error.message }
    }

    // Check if email confirmation is required
    if (signupData.user && !signupData.session) {
      // Email confirmation required
      return { 
        success: true, 
        message: 'Please check your email to confirm your account before signing in.' 
      }
    }

    // User is automatically logged in (if email confirmation is disabled)
    revalidatePath('/', 'layout')
    return { success: true, message: 'Account created successfully!' }
  } catch (error) {
    // Catch any unexpected errors
    return { error: error instanceof Error ? error.message : 'An unexpected error occurred' }
  }
}

/*
supabase recommended signup function
async function signUpNewUser() {
  const { data, error } = await supabase.auth.signUp({
    email: 'valid.email@supabase.io',
    password: 'example-password',
    options: {
      emailRedirectTo: 'https://example.com/welcome',
    },
  })
}
*/
