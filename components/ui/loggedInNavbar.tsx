"use client"

import { useActionState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { logout } from "@/app/login/actions";

export function LoggedInNavBar() {
  const [logoutState, logoutAction, isPending] = useActionState(logout, null)
  const router = useRouter()
  const hasRedirected = useRef(false)

  // Handle successful logout redirect - only once
  useEffect(() => {
    if (logoutState?.success && logoutState.redirect && !hasRedirected.current) {
      hasRedirected.current = true
      // Use window.location for hard navigation to clear all state
      window.location.href = logoutState.redirect
    }
  }, [logoutState])

  return (
    <div className="flex justify-center"> {/*globally center nav bar*/}
      <div className="w-9/10 p-2 h-10 flex content-center justify-between"> {/*allign items within nav bar*/}
        <div>LawBee</div>
        <div className="flex space-x-2"> {/*button group & spacing*/}
          <a href={`/`}>
          <Button size="sm" variant="default">
            Find Bills
          </Button>
          </a>
          <a href={`/mybills`}>
          <Button size="sm" variant="outline">
            My Bills
          </Button>
          </a>
          <form action={logoutAction}>
            <Button size="sm" variant="outline" type="submit" disabled={isPending}>
              {isPending ? "Logging out..." : "Logout"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
