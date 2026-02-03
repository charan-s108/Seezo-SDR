import { ObjectId } from "mongodb"

export type AssessmentSource = {
  _id: ObjectId
  name: string
  type: "file" | "diagram" | "text" | "github" | "jira" | "confluence" | "gdocs"
  size: number
  mimeType: string
  storage: {
    kind: "local" | "s3" | "pending"
    path?: string
  }
  uploadedAt: Date
}

export type Assessment = {
  _id?: ObjectId
  projectId: ObjectId
  name: string
  mode: "quick" | "deep"
  risk: "unknown" | "low" | "medium" | "high" | "critical"
  status: "draft" | "in_progress" | "completed"

  summary: {
    riskSummary: string
    securityRequirementsCount: number
    openQuestionsCount: number
    complianceFindingsCount: number
  }

  sources: AssessmentSource[]

  createdBy: ObjectId
  createdAt: Date
  updatedAt: Date
}
