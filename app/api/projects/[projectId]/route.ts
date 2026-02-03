import clientPromise from "@/lib/mongodb"
import { NextResponse, NextRequest } from "next/server"
import { ObjectId } from "mongodb"
import { getCurrentUser } from "@/lib/getcurrentuser"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params 

  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const client = await clientPromise
  const db = client.db("seezo")

  const project = await db.collection("projects").findOne({
    _id: new ObjectId(projectId),
    ownerId: new ObjectId(user.id),
  })

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  return NextResponse.json({ project })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params
    const { name, code, description } = await request.json()

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!ObjectId.isValid(projectId)) {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db("seezo")
    const collection = db.collection("projects")

    // Verify project ownership
    const project = await collection.findOne({
      _id: new ObjectId(projectId),
      ownerId: new ObjectId(user.id),
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Check if code is unique (excluding current project)
    const existingProject = await collection.findOne({
      code: code.toUpperCase(),
      _id: { $ne: new ObjectId(projectId) }
    })

    if (existingProject) {
      return NextResponse.json(
        { error: "Project code already exists" },
        { status: 400 }
      )
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(projectId) },
      {
        $set: {
          name,
          code: code.toUpperCase(),
          description,
          updatedAt: new Date(),
        }
      }
    )

    return NextResponse.json({
      success: true,
      message: "Project updated successfully"
    })
  } catch (error) {
    console.error("Update project error:", error)
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!ObjectId.isValid(projectId)) {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db("seezo")

    const objectId = new ObjectId(projectId)

    // Verify project ownership
    const project = await db.collection("projects").findOne({
      _id: objectId,
      ownerId: new ObjectId(user.id),
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Delete all related assessments and their data
    const assessments = await db.collection("assessments")
      .find({ projectId: objectId })
      .toArray()

    const assessmentIds = assessments.map(a => a._id)

    // Delete assessments and all related data
    const collections = [
      "security_requirements",
      "open_questions",
      "compliance_findings",
      "assessments",
    ]

    for (const collectionName of collections) {
      await db.collection(collectionName).deleteMany({
        assessmentId: { $in: assessmentIds }
      })
    }

    // Delete the project itself
    const result = await db.collection("projects").deleteOne({
      _id: objectId
    })

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully"
    })
  } catch (error) {
    console.error("Delete project error:", error)
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    )
  }
}
