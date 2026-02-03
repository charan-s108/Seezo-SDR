"use server"

import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export type QuestionStatus = "open" | "answered" | "not_applicable"

// Extract compliance standards mentioned in user answer
function extractStandardsFromAnswer(answer: string): string[] {
  if (!answer) return []
  
  const standardPatterns = [
    { pattern: /pci[-\s]?dss/gi, standard: "PCI-DSS" },
    { pattern: /gdpr/gi, standard: "GDPR" },
    { pattern: /ccpa/gi, standard: "CCPA" },
    { pattern: /hipaa/gi, standard: "HIPAA" },
    { pattern: /psd2/gi, standard: "PSD2" },
    { pattern: /iso\s?27001/gi, standard: "ISO27001" },
    { pattern: /soc\s?2/gi, standard: "SOC2" },
    { pattern: /asvs/gi, standard: "ASVS" },
    { pattern: /stride/gi, standard: "STRIDE" },
  ]
  
  const found = new Set<string>()
  for (const { pattern, standard } of standardPatterns) {
    if (pattern.test(answer)) {
      found.add(standard)
    }
  }
  
  return Array.from(found)
}

export async function saveQuestionAnswer(
  assessmentId: string,
  questionId: string,
  userAnswer: string,
  status: QuestionStatus = "answered"
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
        userAnswer: userAnswer,
        status: status,
        answered: status === "answered",
        updatedAt: new Date(),
      },
    }
  )

  if (result.matchedCount === 0) {
    throw new Error("Question not found")
  }

  // Extract standards from answer and update assessment's applicableStandards
  const extractedStandards = extractStandardsFromAnswer(userAnswer)
  if (extractedStandards.length > 0) {
    const assessmentCollection = db.collection("assessments")
    await assessmentCollection.updateOne(
      { _id: new ObjectId(assessmentId) },
      {
        $addToSet: {
          applicableStandards: { $each: extractedStandards }
        }
      }
    )
  }

  console.log("✅ Question answer persisted", {
    questionId,
    status,
    extractedStandards,
  })

  return {
    success: true,
    questionId,
    status,
    answered: status === "answered",
  }
}
