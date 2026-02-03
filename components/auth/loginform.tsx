"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import SocialButtons from "./socialbuttons"
import Image from "next/image"

export default function LoginForm({
  onSwitch,
}: {
  onSwitch: () => void
}) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email) {
      alert("Please enter your email")
      return
    }

    setLoading(true)

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      alert(data.error)
      return
    }

    window.location.href = `/auth/verify?email=${email}`
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Image
            src="/seezo-logo.png"
            alt="Seezo"
            width={32}
            height={32}
          />
          <span className="text-xl font-semibold">Seezo</span>
        </div>

        <h1 className="text-2xl font-bold">Welcome</h1>
        <p className="text-sm text-muted-foreground">
          Log in to Seezo SDR App
        </p>
      </div>

      {/* Form */}
      <div className="space-y-3">
        <Input
          type="email"
          placeholder="Work email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Button
          className="w-full"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Sending code..." : "Continue"}
        </Button>
      </div>

      {/* Switch */}
      <p className="text-sm text-center text-muted-foreground">
        Don’t have an account?{" "}
        <button
          onClick={onSwitch}
          className="text-primary underline cursor-pointer"
        >
          Sign up
        </button>
      </p>

      <SocialButtons />
    </div>
  )
}
