"use client"

import { useState } from "react"
import LoginForm from "@/components/auth/loginform"
import SignupForm from "@/components/auth/signupform"
import AuthCard from "@/components/auth/authcard"

export default function AuthClient() {
  const [mode, setMode] = useState<"login" | "signup">("login")

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <AuthCard>
        {mode === "login" ? (
          <LoginForm onSwitch={() => setMode("signup")} />
        ) : (
          <SignupForm onSwitch={() => setMode("login")} />
        )}
      </AuthCard>
    </div>
  )
}
