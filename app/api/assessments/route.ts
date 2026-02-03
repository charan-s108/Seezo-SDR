import clientPromise from "@/lib/mongodb"
import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getCurrentUser } from "@/lib/getcurrentuser"
import { AssessmentSource, Assessment } from "@/db/collections/assessments"
import type { SourceType } from "@/types/assessment"

import fs from "fs/promises"
import path from "path"

// 🔥 NEW
import { processAssessmentWithAI } from "@/lib/ai/process-assessment"

/**
 * GET /api/assessments?projectId=...
 */
export async function GET(req: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get("projectId")

  if (!projectId || !ObjectId.isValid(projectId)) {
    return NextResponse.json(
      { error: "Valid projectId is required" },
      { status: 400 }
    )
  }

  const client = await clientPromise
  const db = client.db()

  const assessments = await db
    .collection("assessments")
    .aggregate([
      { $match: { projectId: new ObjectId(projectId) } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "security_requirements",
          let: { aid: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$assessmentId", "$$aid"] } } },
            { $count: "count" },
          ],
          as: "securityRequirementsAgg",
        },
      },
      {
        $lookup: {
          from: "open_questions",
          let: { aid: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$assessmentId", "$$aid"] } } },
            { $count: "count" },
          ],
          as: "openQuestionsAgg",
        },
      },
      {
        $addFields: {
          securityRequirementsCount: {
            $ifNull: [{ $arrayElemAt: ["$securityRequirementsAgg.count", 0] }, 0],
          },
          openQuestionsCount: {
            $ifNull: [{ $arrayElemAt: ["$openQuestionsAgg.count", 0] }, 0],
          },
          sourceTypes: {
            $setUnion: [
              {
                $map: {
                  input: { $ifNull: ["$sources", []] },
                  as: "s",
                  in: "$$s.type",
                },
              },
              [],
            ],
          },
        },
      },
      { $project: { securityRequirementsAgg: 0, openQuestionsAgg: 0 } },
    ])
    .toArray()

  return NextResponse.json({ assessments })
}

/**
 * POST /api/assessments
 */
export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await req.formData()

  const assessmentId = new ObjectId()
  const projectId = formData.get("projectId") as string
  const name = formData.get("name") as string
  const sourceType = formData.get("sourceType") as SourceType
  const files = formData.getAll("files") as File[]

  if (!projectId || !name || !ObjectId.isValid(projectId)) {
    return NextResponse.json(
      { error: "projectId and name are required" },
      { status: 400 }
    )
  }

  const uploadDir = path.join(
    process.cwd(),
    "public/uploads/assessments"
  )

  await fs.mkdir(uploadDir, { recursive: true })

  const storedSources: AssessmentSource[] = []

  for (const file of files) {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const safeName = `${Date.now()}-${file.name}`
    const filePath = path.join(uploadDir, safeName)

    await fs.writeFile(filePath, buffer)

    storedSources.push({
      _id: new ObjectId(),
      name: file.name,
      type: sourceType,
      size: file.size,
      mimeType: file.type,
      storage: {
        kind: "local",
        path: `/uploads/assessments/${safeName}`,
      },
      uploadedAt: new Date(),
    })
  }

  const assessment: Assessment = {
    _id: assessmentId,
    projectId: new ObjectId(projectId),
    name,
    mode: "quick",
    risk: "unknown",
    status: "draft",
    summary: {
      riskSummary: "",
      securityRequirementsCount: 0,
      openQuestionsCount: 0,
      complianceFindingsCount: 0,
    },
    sources: storedSources,
    createdBy: new ObjectId(user.id),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const client = await clientPromise
  const db = client.db()

  // ✅ 1. Persist assessment (source of truth)
  await db.collection("assessments").insertOne(assessment)

  // 🔥 2. Trigger AI asynchronously (DO NOT await)
  processAssessmentWithAI(assessmentId.toString())
    .catch((err) => {
      console.error(
        "AI processing failed for assessment:",
        assessmentId.toString(),
        err
      )
    })

  // ✅ 3. Respond immediately
  return NextResponse.json({
    success: true,
    assessmentId: assessmentId.toString(),
  })
}
