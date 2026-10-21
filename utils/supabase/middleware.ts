import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check if this is a Supabase auth callback (password reset, email confirmation, etc.)
  // Supabase redirects with either:
  // 1. token_hash and type query params (OTP flow)
  // 2. code parameter (PKCE/code exchange flow) - @supabase/ssr handles this automatically in getUser()
  const token_hash = request.nextUrl.searchParams.get('token_hash')
  const type = request.nextUrl.searchParams.get('type')
  const code = request.nextUrl.searchParams.get('code')
  
  // Handle OTP flow (token_hash + type)
  if (token_hash && type && request.nextUrl.pathname === '/') {
    // Redirect to /auth/confirm to handle token verification
    const next = request.nextUrl.searchParams.get('next') || (type === 'recovery' ? '/reset-password' : '/')
    const url = request.nextUrl.clone()
    url.pathname = '/auth/confirm'
    url.searchParams.set('token_hash', token_hash)
    url.searchParams.set('type', type)
    url.searchParams.set('next', next)
    return NextResponse.redirect(url)
  }
  
  // Handle code exchange flow - redirect to /auth/confirm to handle code exchange and routing
  // The code will be automatically exchanged by @supabase/ssr when getUser() is called
  // For password reset flows, we need to detect and route appropriately
  // Only redirect if we're not already on /auth/confirm to avoid loops
  if (code && request.nextUrl.pathname !== '/auth/confirm') {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/confirm'
    // Preserve all query params including code
    const type = request.nextUrl.searchParams.get('type')
    const existingNext = request.nextUrl.searchParams.get('next')
    
    // If type is recovery (password reset), preserve it and set next=/reset-password
    if (type === 'recovery') {
      url.searchParams.set('type', 'recovery')
      url.searchParams.set('next', '/reset-password')
    }
    // If next is already set to /reset-password, preserve it (from forgot-password action)
    else if (existingNext === '/reset-password') {
      url.searchParams.set('next', '/reset-password')
    }
    // Preserve any other existing next parameter
    else if (existingNext) {
      url.searchParams.set('next', existingNext)
    }
    // Fallback: if no next is set and we're coming from root or hero, 
    // assume it might be a password reset and set next=/reset-password
    // This handles cases where Supabase redirects to root with just the code
    // Note: This is a best-effort guess - Supabase should preserve the next parameter
    // from redirectTo, but if it doesn't, this fallback helps
    else if (request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/hero') {
      url.searchParams.set('next', '/reset-password')
    }
    
    return NextResponse.redirect(url)
  }

  // If user is authenticated, redirect them away from public pages
  if (user) {
    if (
      request.nextUrl.pathname === '/login' ||
      request.nextUrl.pathname === '/signup'
    ) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  // If no user, redirect them away from protected pages
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/signup') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/hero') &&
    !request.nextUrl.pathname.startsWith('/error') &&
    !request.nextUrl.pathname.startsWith('/forgot-password') &&
    !request.nextUrl.pathname.startsWith('/reset-password')
  ) {
    // no user, potentially respond by redirecting the user to the hero page
    const url = request.nextUrl.clone()
    url.pathname = '/hero'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}
