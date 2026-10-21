'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

interface ActionState {
  error?: string;
  success?: boolean;
  message?: string;
  redirect?: string;
}

export async function resetPassword(prevState: ActionState | null, formData: FormData) {
  try {
    const supabase = await createClient()
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!password || !confirmPassword) {
      return { error: 'Both password fields are required' }
    }

    if (password !== confirmPassword) {
      return { error: 'Passwords do not match' }
    }

    if (password.length < 6) {
      return { error: 'Password must be at least 6 characters' }
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/', 'layout')
    return { 
      success: true, 
      message: 'Password reset successfully! Redirecting to home...',
      redirect: '/'
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An unexpected error occurred' }
  }
}
