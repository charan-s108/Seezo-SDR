"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Button } from "@/components/ui/button"
import { MailCheck, RefreshCcw } from "lucide-react"

export default function VerifyOtpPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email")

  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)

  const handleVerify = async () => {
    if (!email) {
      alert("Missing email. Please restart signup.")
      return
    }

    if (otp.length !== 6) {
      alert("Please enter a valid 6-digit code")
      return
    }

    setLoading(true)

    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        code: otp,
      }),
    })

    setLoading(false)

    if (res.ok) {
      window.location.href = "/dashboard"
    } else {
      const data = await res.json()
      alert(data.error || "Verification failed")
    }
  }

  const handleResend = async () => {
    if (!email) return
  
    const res = await fetch("/api/auth/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
  
    if (res.ok) {
      alert("OTP resent successfully")
    } else {
      const data = await res.json()
      alert(data.error || "Failed to resend OTP")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md rounded-xl border bg-background p-8 shadow-sm">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <MailCheck className="h-6 w-6 text-primary" />
          </div>

          <h1 className="text-2xl font-bold">
            Verify your email
          </h1>

          <p className="text-sm text-muted-foreground">
            We’ve sent a 6-digit verification code to
          </p>

          {email && (
            <p className="text-sm font-medium">
              {email}
            </p>
          )}
        </div>

        {/* OTP Input */}
        <div className="mt-8 flex flex-col items-center space-y-6">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          <Button
            className="w-full"
            onClick={handleVerify}
            disabled={loading || otp.length !== 6}
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Didn’t receive the code?{" "}
          <button
          onClick={handleResend}
          className="inline-flex items-center gap-1 underline"
          >
          <RefreshCcw className="h-3.5 w-3.5" />
          Resend
          </button>
        </div>
      </div>
    </div>
  )
}
