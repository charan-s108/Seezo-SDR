"use server"

import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export type QuestionStatus = "open" | "answered" | "not_applicable"

export async function updateQuestionStatus(
  assessmentId: string,
  questionId: string,
  status: QuestionStatus
) {
  if (!assessmentId || !questionId) {
    throw new Error("Missing assessmentId or questionId")
  }

  const client = await clientPromise
  const db = client.db()
  const collection = db.collection("open_questions")

  const result = await collection.updateOne(
    {
      _id: new ObjectId(questionId),
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
    throw new Error("Question not found")
  }

  console.log("✅ Question status persisted", {
    questionId,
    status,
  })

  return {
    success: true,
    questionId,
    status,
  }
}