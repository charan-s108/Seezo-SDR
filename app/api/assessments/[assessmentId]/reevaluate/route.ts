import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { processAssessmentWithAI } from "@/lib/ai/process-assessment"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ assessmentId: string }> }
) {
  try {
    const { assessmentId } = await params
    const { answers, requirementReviews } = await req.json()

    const client = await clientPromise
    const db = client.db()

    const assessment = await db
      .collection("assessments")
      .findOne({ _id: new ObjectId(assessmentId) })

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      )
    }

    // Store user context for the re-evaluation
    await db.collection("assessments").updateOne(
      { _id: assessment._id },
      {
        $set: {
          status: "in_progress",
          updatedAt: new Date(),
          reevaluationContext: {
            answers,
            requirementReviews,
            reevaluatedAt: new Date(),
          },
        },
      }
    )

    // Trigger re-evaluation
    processAssessmentWithAI(assessmentId).catch((err) => {
      console.error("Re-evaluation processing failed:", err)
      db.collection("assessments").updateOne(
        { _id: assessment._id },
        { $set: { status: "draft", updatedAt: new Date() } }
      )
    })

    return NextResponse.json(
      { message: "Re-evaluation started", assessmentId },
      { status: 200 }
    )
  } catch (error) {
    console.error("Re-evaluate endpoint error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
