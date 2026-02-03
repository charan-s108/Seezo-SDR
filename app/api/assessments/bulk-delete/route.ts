import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { assessmentIds } = await request.json()

    if (!assessmentIds || !Array.isArray(assessmentIds) || assessmentIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid assessment IDs" },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db("seezo")
    
    // Convert string IDs to ObjectId
    const objectIds = assessmentIds.map(id => new ObjectId(id))

    // Delete from all related collections
    const collections = [
      "security_requirements",
      "open_questions",
      "compliance_findings",
    ]

    for (const collectionName of collections) {
      const collection = db.collection(collectionName)
      await collection.deleteMany({
        assessmentId: { $in: objectIds }
      })
    }

    // Also delete the assessments themselves
    const assessmentsCollection = db.collection("assessments")
    await assessmentsCollection.deleteMany({
      _id: { $in: objectIds }
    })

    return NextResponse.json({
      success: true,
      deletedCount: assessmentIds.length,
      message: `Deleted ${assessmentIds.length} assessment(s) and all associated data`
    })
  } catch (error) {
    console.error("Bulk delete error:", error)
    return NextResponse.json(
      { error: "Failed to delete assessments" },
      { status: 500 }
    )
  }
}
