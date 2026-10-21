import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  // Supabase might use 'token_hash' or 'token' - check both
  const token_hash = searchParams.get('token_hash') || searchParams.get('token')
  const type = searchParams.get('type') as EmailOtpType | null
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  const supabase = await createClient()

  // Debug logging - log all query params to see what Supabase is sending
  console.log('Auth confirm route hit:', { 
    pathname: request.nextUrl.pathname,
    allParams: Object.fromEntries(searchParams.entries()),
    token_hash: token_hash ? 'present' : 'missing',
    code: code ? 'present' : 'missing',
    type,
    next 
  })

  // Handle code exchange flow - @supabase/ssr automatically exchanges code when getUser() is called
  if (code) {
    // First, try to exchange the code explicitly
    try {
      const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Code exchange error:', exchangeError)
        return NextResponse.redirect(new URL(`/error?message=${encodeURIComponent(exchangeError.message)}`, request.url))
      }
    } catch (err) {
      console.error('Code exchange exception:', err)
      const errorMessage = err instanceof Error ? err.message : 'Code exchange failed';
      return NextResponse.redirect(new URL(`/error?message=${encodeURIComponent(errorMessage)}`, request.url))
    }
    
    // After code exchange, get the user to verify session was created
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('Get user error after code exchange:', userError)
      return NextResponse.redirect(new URL(`/error?message=${encodeURIComponent(userError.message)}`, request.url))
    }
    
    if (!user) {
      return NextResponse.redirect(new URL('/error?message=Failed to create session after code exchange', request.url))
    }
    
    // Code exchanged successfully - check if this is a password reset flow
    // For password reset, Supabase typically includes type=recovery in the URL
    // OR the middleware should have set next=/reset-password
    // If type is recovery OR next is /reset-password, redirect to /reset-password
    if (type === 'recovery' || next === '/reset-password') {
      console.log('Password reset code exchanged, redirecting to /reset-password')
      return NextResponse.redirect(new URL('/reset-password', request.url))
    }
    
    if (next && next !== '/') {
      // Use the next parameter if provided
      console.log('Code exchanged successfully, redirecting to:', next)
      return NextResponse.redirect(new URL(next, request.url))
    }
    
    // Default to home for other flows (email confirmation, etc.)
    console.log('Code exchanged successfully, redirecting to home')
    return NextResponse.redirect(new URL('/', request.url))
  }
  // If we have token_hash and type, verify the OTP
  else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    
    if (!error) {
      // For password reset (recovery type), always redirect to reset password page
      if (type === 'recovery') {
        console.log('Password reset token verified, redirecting to /reset-password')
        return NextResponse.redirect(new URL('/reset-password', request.url))
      }
      // For other types (email confirmation, etc.), redirect to specified URL or root
      return NextResponse.redirect(new URL(next, request.url))
    } else {
      console.error('OTP verification error:', error)
      // Redirect to error page with the error message
      return NextResponse.redirect(new URL(`/error?message=${encodeURIComponent(error.message)}`, request.url))
    }
  } else {
    // No token_hash or code - check if user has a valid session (Supabase might have already verified)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (user && type === 'recovery') {
      // User has a session and type is recovery - redirect to reset password page
      console.log('User has valid session for password reset, redirecting to /reset-password')
      return NextResponse.redirect(new URL('/reset-password', request.url))
    } else if (user) {
      // User has a valid session for other auth types
      console.log('User has valid session, redirecting to:', next)
      return NextResponse.redirect(new URL(next, request.url))
    } else {
      console.log('Missing token_hash/code/type and no valid session. Available params:', Object.fromEntries(searchParams.entries()))
      // Redirect to error page with helpful message
      return NextResponse.redirect(new URL('/error?message=Missing authentication token or session expired', request.url))
    }
  }
}