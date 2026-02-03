import clientPromise from "@/lib/mongodb"
import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { Project } from "@/db/collections/projects"
import { getCurrentUser } from "@/lib/getcurrentuser"

export async function GET() {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  const client = await clientPromise
  const db = client.db()

  const projects = await db
    .collection("projects")
    .aggregate([
      {
        $match: {
          ownerId: new ObjectId(user.id),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "ownerId",
          foreignField: "_id",
          as: "owner",
        },
      },
      { $unwind: "$owner" },
      {
        $lookup: {
          from: "assessments",
          localField: "_id",
          foreignField: "projectId",
          as: "assessments",
        },
      },
      {
        $addFields: {
          assessmentCount: { $size: "$assessments" },
          ownerName: "$owner.name",
        },
      },
      {
        $project: {
          assessments: 0,
          owner: 0,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ])
    .toArray()

  return NextResponse.json({ projects })
}

export async function POST(req: Request) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  const { name, code, description } = await req.json()

  if (!name || !code) {
    return NextResponse.json(
      { error: "Project name and code are required" },
      { status: 400 }
    )
  }

  const client = await clientPromise
  const db = client.db()

  const existing = await db.collection("projects").findOne({
    ownerId: new ObjectId(user.id),
    code,
  })

  if (existing) {
    return NextResponse.json(
      { error: "Project code already exists" },
      { status: 409 }
    )
  }

  const project: Project = {
    name,
    code,
    description,
    ownerId: new ObjectId(user.id),
    createdAt: new Date(),
  }

  const result = await db
    .collection<Project>("projects")
    .insertOne(project)

  return NextResponse.json({
    success: true,
    projectId: result.insertedId,
  })
}
