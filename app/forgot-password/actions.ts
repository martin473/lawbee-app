'use server'

import { createClient } from '@/utils/supabase/server'

interface ActionState {
  error?: string;
  success?: boolean;
  message?: string;
}

export async function requestPasswordReset(prevState: ActionState | null, formData: FormData) {
  try {
    const supabase = await createClient()
    const email = formData.get('email') as string

    if (!email) {
      return { error: 'Email is required' }
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/confirm?next=/reset-password`,
    })

    if (error) {
      return { error: error.message }
    }

    // Always return success message (for security - don't reveal if email exists)
    return { 
      success: true, 
      message: 'If an account with that email exists, we\'ve sent a password reset link.' 
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An unexpected error occurred' }
  }
}
