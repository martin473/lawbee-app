import { type NextRequest, NextResponse } from 'next/server'

/**
 * Route handler to catch Supabase redirects
 * Supabase redirects to the Site URL (root) with token_hash and type query params
 * We redirect to /auth/confirm to handle the token verification
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  
  // If we have token params, redirect to /auth/confirm to handle verification
  if (token_hash && type) {
    const next = searchParams.get('next') || (type === 'recovery' ? '/reset-password' : '/')
    return NextResponse.redirect(new URL(`/auth/confirm?token_hash=${token_hash}&type=${type}&next=${next}`, request.url))
  }
  
  // If no token params, redirect to home
  return NextResponse.redirect(new URL('/', request.url))
}
