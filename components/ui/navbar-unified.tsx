/**
 * Unified Navbar that automatically switches based on auth state
 * Replaces both NavBar and LoggedInNavBar
 */

'use client'

import { Button } from "@/components/ui/button";
import { logout } from "@/app/login/actions";
import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'

export function NavBar() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [logoutState, logoutAction, isPending] = useActionState(logout, null)
  const hasRedirected = useRef(false)

  // Simple auth check - no complex provider
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    }).catch(() => {
      setUser(null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Handle logout redirect
  useEffect(() => {
    if (logoutState?.success && logoutState.redirect && !hasRedirected.current) {
      hasRedirected.current = true
      // Clear local auth state immediately
      setUser(null)
      setLoading(false)
      // Small delay to ensure state is cleared, then hard redirect
      setTimeout(() => {
        window.location.href = logoutState.redirect
      }, 100)
    }
  }, [logoutState])

  // Show logged-out navbar while loading (allows navigation)
  // Only show logged-in navbar if we're sure user exists
  if (user && !loading) {
    return (
      <div className="flex justify-center">
        <div className="w-9/10 p-2 h-10 flex content-center justify-between">
          <a href="/hero">LawBee</a>
          <div className="flex space-x-2">
            <Link href="/">
              <Button size="sm" variant="default">
                Find Bills
              </Button>
            </Link>
            <Link href="/mybills">
              <Button size="sm" variant="outline">
                My Bills
              </Button>
            </Link>
            <form action={logoutAction}>
              <Button size="sm" variant="outline" type="submit" disabled={isPending}>
                {isPending ? "Logging out..." : "Logout"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // Logged out navbar
  return (
    <div className="flex justify-center">
      <div className="w-9/10 p-2 h-10 flex content-center justify-between">
        <a href="/hero">LawBee</a>
        <div className="flex space-x-2">
          <a href="/login">
            <Button size="sm" variant="default">
              Sign In
            </Button>
          </a>
          <a href="/signup">
            <Button size="sm" variant="outline">
              Sign Up
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}
