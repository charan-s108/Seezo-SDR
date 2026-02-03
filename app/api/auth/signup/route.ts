import clientPromise from "@/lib/mongodb"
import { NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(req: Request) {
  const { name, email, company } = await req.json()

  if (!name || !email || !company) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    )
  }

  const client = await clientPromise
  const db = client.db()

  // 1️⃣ Check if user already exists
  const existingUser = await db
    .collection("users")
    .findOne({ email })

  if (existingUser) {
    return NextResponse.json(
      { error: "User already exists" },
      { status: 409 }
    )
  }

  // 2️⃣ Create user (unverified)
  const userResult = await db.collection("users").insertOne({
    name,
    email,
    company,
    verified: false,
    createdAt: new Date(),
  })

  const userId = userResult.insertedId

  // 3️⃣ Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const codeHash = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex")

  // 4️⃣ Store OTP
  await db.collection("otps").insertOne({
    userId,
    codeHash,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
    createdAt: new Date(),
  })

  // 5️⃣ Send email (TEMP)
  console.log(`OTP for ${email}: ${otp}`)

  return NextResponse.json({ success: true })
}
