"use client"
import { useActionState, useEffect } from "react"
import { requestPasswordReset } from './actions'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NavBar } from "@/components/ui/navbar-unified";
import Link from "next/link";

import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(requestPasswordReset, null)

  return (
    <div className="flex flex-col">
      <NavBar />
      <div className="w-dvw h-dvh flex justify-center items-center">
        <form action={formAction}>
          <FieldSet className=' border-1 bg-gray-50 p-2 w-3xs rounded-md'>
            <FieldLegend>Reset Password</FieldLegend>
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
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input className='bg-white' id="email" name="email" type="email" required />
              </Field>
              <div className='flex justify-between items-center'>
                <Link href="/login" className="text-sm text-blue-600 hover:underline">
                  Back to login
                </Link>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Sending..." : "Send Reset Link"}
                </Button>
              </div>
            </FieldGroup>
          </FieldSet>
        </form>
      </div>
    </div>
  )
}
