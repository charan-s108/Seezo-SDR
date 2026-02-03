import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"

type RouteContext = {
  params: Promise<{
    assessmentId: string
  }>
}

export async function GET(req: Request, context: RouteContext) {
  try {
    const { assessmentId } = await context.params

    if (!ObjectId.isValid(assessmentId)) {
      return NextResponse.json(
        { error: "Invalid assessment ID" },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()

    const assessment = await db
      .collection("assessments")
      .aggregate([
        { $match: { _id: new ObjectId(assessmentId) } },
        {
          $lookup: {
            from: "users",
            localField: "createdBy",
            foreignField: "_id",
            as: "createdByUser",
          },
        },
        {
          $addFields: {
            createdBy: { $arrayElemAt: ["$createdByUser", 0] },
          },
        },
        {
          $project: {
            createdByUser: 0,
          },
        },
      ])
      .next()

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(assessment)
  } catch (error) {
    console.error("❌ Failed to fetch assessment:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { assessmentId } = await context.params

    if (!ObjectId.isValid(assessmentId)) {
      return NextResponse.json(
        { error: "Invalid assessment ID" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { risk } = body

    if (!risk || !["low", "medium", "high", "critical", "unknown"].includes(risk)) {
      return NextResponse.json(
        { error: "Invalid risk value" },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()

    const result = await db
      .collection("assessments")
      .updateOne(
        { _id: new ObjectId(assessmentId) },
        { 
          $set: { 
            risk,
            updatedAt: new Date()
          } 
        }
      )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, risk })
  } catch (error) {
    console.error("❌ Failed to update assessment risk:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
