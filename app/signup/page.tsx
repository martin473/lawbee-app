"use client"
import { useActionState, useEffect } from "react"
import { signup } from './actions'
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NavBar } from "@/components/ui/navbar-unified";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"


export default function SignupPage() {
  const [signupState, signupAction, isPending] = useActionState(signup, null)

  // Log the error state to console for debugging
  useEffect(() => {
    if (signupState) {
      console.log("Signup state:", signupState)
      if (signupState.error) {
        console.error("Signup error:", signupState.error)
      }
    }
  }, [signupState])

  return (
    <div className="flex flex-col">
      <NavBar />
      <div className="w-dvw h-dvh flex justify-center items-center">
        <form action={signupAction}>
          <FieldSet className=' border-1 bg-gray-50 p-2 w-3xs rounded-md'>
            <FieldLegend>Create Account</FieldLegend>
            <FieldGroup>
              {signupState?.error && (
                <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
                  {signupState.error}
                </div>
              )}
              {signupState?.success && (
                <div className="text-green-600 text-sm p-2 bg-green-50 rounded">
                  {signupState.message}
                </div>
              )}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input className='bg-white' id="email" name="email" type="email" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input className='bg-white' id="password" name="password" type="password" required />
              </Field>
              <div className='flex justify-right'>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Signing up..." : "Sign up"}
                </Button>
            </div>
            </FieldGroup>
          </FieldSet>
        </form>
      </div>
    </div>
  )
}
