"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import SocialButtons from "./socialbuttons"
import Image from "next/image"

export default function SignupForm({
  onSwitch,
}: {
  onSwitch: () => void
}) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    if (!name || !email || !company) {
      alert("Please fill in all fields")
      return
    }

    setLoading(true)

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        company,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      alert(data.error || "Something went wrong")
      return
    }

    window.location.href = `/auth/verify?email=${encodeURIComponent(email)}`
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

        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Sign up to continue to Seezo SDR
        </p>
      </div>

      {/* Form */}
      <div className="space-y-3">
        <Input
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          type="email"
          placeholder="Work email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          placeholder="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          required
        />

        <Button
          className="w-full"
          onClick={handleSignup}
          disabled={loading}
        >
          {loading ? "Creating account..." : "Continue"}
        </Button>
      </div>

      {/* Switch to login */}
      <p className="text-sm text-center text-muted-foreground">
        Already have an account?{" "}
        <button
          onClick={onSwitch}
          className="text-primary underline cursor-pointer"
        >
          Log in
        </button>
      </p>

      <SocialButtons />
    </div>
  )
}
