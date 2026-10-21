import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { type EmailOtpType } from '@supabase/supabase-js'

/**
 * Route handler for password reset token verification
 * When user clicks the reset link in their email, Supabase redirects here
 * with token_hash. We verify it and redirect to the reset password page.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null

  if (token_hash && type === 'recovery') {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type: 'recovery',
      token_hash,
    })

    if (!error) {
      // Token verified successfully, redirect to reset password page
      return NextResponse.redirect(new URL('/reset-password', request.url))
    }
  }

  // If token verification failed, redirect to error page
  return NextResponse.redirect(new URL('/error', request.url))
}
