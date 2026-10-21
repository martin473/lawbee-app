"use client"
import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { resetPassword } from './actions'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NavBar } from "@/components/ui/navbar-unified";

import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"

export default function ResetPasswordPage() {
  const [state, formAction, isPending] = useActionState(resetPassword, null)
  const router = useRouter()

  useEffect(() => {
    if (state?.success && state.redirect) {
      // Redirect to login after a short delay to show success message
      setTimeout(() => {
        router.push(state.redirect)
      }, 2000)
    }
  }, [state, router])

  return (
    <div className="flex flex-col">
      <NavBar />
      <div className="w-dvw h-dvh flex justify-center items-center">
        <form action={formAction}>
          <FieldSet className=' border-1 bg-gray-50 p-2 w-3xs rounded-md'>
            <FieldLegend>Set New Password</FieldLegend>
            <FieldGroup>
              {state?.error && (
                <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
                  {state.error}
                </div>
              )}
              {state?.success && (
                <div className="text-green-600 text-sm p-2 bg-green-50 rounded">
                  {state.message}
                </div>
              )}
              <Field>
                <FieldLabel htmlFor="password">New Password</FieldLabel>
                <Input className='bg-white' id="password" name="password" type="password" required minLength={6} />
              </Field>
              <Field>
                <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                <Input className='bg-white' id="confirmPassword" name="confirmPassword" type="password" required minLength={6} />
              </Field>
              <div className='flex justify-right'>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Resetting..." : "Reset Password"}
                </Button>
              </div>
            </FieldGroup>
          </FieldSet>
        </form>
      </div>
    </div>
  )
}
