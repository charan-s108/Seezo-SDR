import clientPromise from "@/lib/mongodb"
import crypto from "crypto"
import { NextResponse } from "next/server"
import { signUserToken } from "@/lib/jwt"
import { ObjectId } from "mongodb"

export async function POST(req: Request) {
  const { email, code } = await req.json()

  if (!email || !code) {
    return NextResponse.json(
      { error: "Missing data" },
      { status: 400 }
    )
  }

  const client = await clientPromise
  const db = client.db()

  const user = await db.collection("users").findOne({ email })

  if (!user) {
    return NextResponse.json(
      { error: "Invalid user" },
      { status: 400 }
    )
  }

  const codeHash = crypto
    .createHash("sha256")
    .update(code)
    .digest("hex")

  const otp = await db.collection("otps").findOne({
    userId: new ObjectId(user._id),
    codeHash,
    expiresAt: { $gt: new Date() },
  })

  if (!otp) {
    return NextResponse.json(
      { error: "Invalid or expired OTP" },
      { status: 400 }
    )
  }

  // ✅ Mark user as verified
  await db.collection("users").updateOne(
    { _id: user._id },
    { $set: { verified: true } }
  )

  // ✅ Invalidate all OTPs for this user
  await db.collection("otps").deleteMany({
    userId: new ObjectId(user._id),
  })

  // ✅ Generate user token (JWT)
  const token = signUserToken({
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    company: user.company,
  })

  // ✅ Create response + set session cookie
  const response = NextResponse.json({ success: true })

    response.cookies.set("seezo_token", token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  })

  return response
}
