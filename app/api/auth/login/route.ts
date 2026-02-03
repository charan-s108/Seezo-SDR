import clientPromise from "@/lib/mongodb"
import { NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(req: Request) {
  const { email } = await req.json()

  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    )
  }

  const client = await clientPromise
  const db = client.db()

  // 1️⃣ Check if user exists
  const user = await db
    .collection("users")
    .findOne({ email })

  if (!user) {
    return NextResponse.json(
      { error: "Account not found. Please sign up." },
      { status: 404 }
    )
  }

  if (!user.verified) {
    return NextResponse.json(
      { error: "Account not verified. Please verify using OTP." },
      { status: 403 }
    )
  }

  // 2️⃣ Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const codeHash = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex")

  // 3️⃣ Store OTP (new entry every login)
  await db.collection("otps").insertOne({
    userId: user._id,
    codeHash,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
    createdAt: new Date(),
  })

  // 4️⃣ TEMP: Log OTP
  console.log(`🔐 Login OTP for ${email}: ${otp}`)

  return NextResponse.json({ success: true })
}
