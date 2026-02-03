import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import type { SecurityRequirement } from "@/db/collections/security-requirements"

export async function GET(req: Request) {
  const client = await clientPromise
  const db = client.db()

  const { searchParams } = new URL(req.url)
  const assessmentId = searchParams.get("assessmentId")

  if (!assessmentId) {
    return NextResponse.json([], { status: 400 })
  }

  const data = await db
    .collection<SecurityRequirement>("security_requirements")
    .find({ assessmentId: new ObjectId(assessmentId) })
    .sort({ createdAt: 1 })
    .toArray()

  return NextResponse.json(data)
}
