"use client"
import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { login } from './actions'
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


export default function LoginPage() {
  const [loginState, loginAction, isPending] = useActionState(login, null)
  const router = useRouter()

  // Log the error state to console for debugging
  useEffect(() => {
    if (loginState) {
      console.log("Login state:", loginState)
      if (loginState.error) {
        console.error("Login error:", loginState.error)
      }
      // Handle successful login redirect
      if (loginState.success && loginState.redirect) {
        router.push(loginState.redirect)
      }
    }
  }, [loginState, router])

  return (
    <div className="flex flex-col">
      <NavBar />
      <div className="w-dvw h-dvh flex justify-center items-center">
        <form action={loginAction}>
          <FieldSet className=' border-1 bg-gray-50 p-2 w-3xs rounded-md'>
            <FieldLegend className=''>Log In</FieldLegend>
            <FieldGroup>
              {loginState?.error && (
                <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
                  {loginState.error}
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
              <div className='flex justify-between items-center'>
                <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </a>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Logging in..." : "Log in"}
                </Button>
            </div>
            </FieldGroup>
          </FieldSet>
        </form>
      </div>
    </div>
  )
}
