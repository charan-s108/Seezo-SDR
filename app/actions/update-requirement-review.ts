"use server"

import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export type RequirementReviewStatus =
  | "open"
  | "accepted"
  | "mitigated"
  | "not_applicable"

export async function updateRequirementReview(
  assessmentId: string,
  requirementId: string,
  status: RequirementReviewStatus
) {
  if (!assessmentId || !requirementId) {
    throw new Error("Missing assessmentId or requirementId")
  }

  const client = await clientPromise
  const db = client.db() // uses DB from DATABASE_URL
  const collection = db.collection("security_requirements")

  const result = await collection.updateOne(
    {
      _id: new ObjectId(requirementId),
      assessmentId: new ObjectId(assessmentId),
    },
    {
      $set: {
        status: status, 
        updatedAt: new Date(),
      },
    }
  )

  if (result.matchedCount === 0) {
    throw new Error("Security requirement not found")
  }

  console.log("✅ Requirement review persisted", {
    requirementId,
    status,
  })

  return {
    success: true,
    requirementId,
    status,
  }
}
