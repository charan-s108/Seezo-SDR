import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { AssessmentPDFDocument } from "@/lib/pdf/assessment-document"
import path from "path"
import fs from "fs/promises"

export const runtime = "nodejs"

const isImageSource = (src: any) =>
  (src?.mimeType && src.mimeType.startsWith("image/")) || src?.type === "diagram"

const toAbsoluteLocalPath = async (storagePath: string) => {
  const candidates: string[] = []
  if (path.isAbsolute(storagePath)) candidates.push(storagePath)
  const normalized = storagePath.replace(/^\//, "")
  candidates.push(path.join(process.cwd(), "public", normalized))

  for (const candidate of candidates) {
    try {
      await fs.access(candidate)
      return candidate
    } catch {
      continue
    }
  }

  return null
}

const withEmbeddedImages = async (sources: any[]) => {
  if (!Array.isArray(sources) || sources.length === 0) return sources || []

  return Promise.all(
    sources.map(async (src) => {
      if (!isImageSource(src)) return src
      if (src?.storage?.kind !== "local" || !src?.storage?.path) return src

      try {
        const absolutePath = await toAbsoluteLocalPath(src.storage.path)
        if (!absolutePath) return src
        const fileBuffer = await fs.readFile(absolutePath)
        const mime = src.mimeType || "image/png"
        const dataUrl = `data:${mime};base64,${fileBuffer.toString("base64")}`
        return { ...src, imageDataUrl: dataUrl }
      } catch {
        return src
      }
    })
  )
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ assessmentId: string }> }
) {
  try {
    const { assessmentId } = await params

    const client = await clientPromise
    const db = client.db()

    // Fetch assessment with user data
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

    // Fetch project name
    const project = await db
      .collection("projects")
      .findOne({ _id: assessment.projectId })

    // Fetch all related data (only security requirements and compliance, no questions)
    const [securityRequirements, complianceFindings, openQuestions] = await Promise.all([
      db
        .collection("security_requirements")
        .find({ assessmentId: assessment._id })
        .toArray(),
      db
        .collection("compliance_findings")
        .find({ assessmentId: assessment._id })
        .toArray(),
      db
        .collection("open_questions")
        .find({ assessmentId: assessment._id })
        .toArray(),
    ])

    // Get sources from assessment document
    const sources = assessment.sources || []
    const sourcesWithImages = await withEmbeddedImages(sources)

    // Generate PDF
    const pdfDocument = AssessmentPDFDocument({
      assessment: {
        name: assessment.name,
        mode: assessment.mode,
        risk: assessment.risk || "unknown",
        createdAt: assessment.createdAt,
        completedAt: assessment.completedAt,
        createdBy: assessment.createdBy,
        summary: assessment.summary,
      },
      projectName: project?.name || "Unknown Project",
      securityRequirements: securityRequirements.map((r: any) => ({
        ...r,
        id: r._id.toString(),
      })),
      complianceFindings: complianceFindings.map((c: any) => ({
        ...c,
        id: c._id.toString(),
      })),
      openQuestions: openQuestions.map((q: any) => ({
        ...q,
        id: q._id.toString(),
      })),
      sources: sourcesWithImages,
    })

    const pdfBuffer = await renderToBuffer(pdfDocument)

    // Return PDF as downloadable file
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${assessment.name.replace(
          /[^a-zA-Z0-9]/g,
          "_"
        )}_security_report.pdf"`,
      },
    })
  } catch (error) {
    console.error("PDF export error:", error)
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    )
  }
}
