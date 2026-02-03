export type SourceType =
  | "file"
  | "diagram"
  | "text"
  | "github"
  | "jira"
  | "confluence"
  | "gdocs"

export type AssessmentSource = {
  _id: string
  name: string
  type: SourceType
  size?: number
  mimeType?: string
  storage: {
    kind: "local" | "s3" | "github"
    path: string
  }
  uploadedAt: string
}

export type AssessmentUser = {
  _id: string
  name: string
  email?: string
}

export type AssessmentSummary = {
  riskSummary: string
  executiveSummary: string
  securityRequirementsCount: number
  openQuestionsCount: number
  complianceFindingsCount: number
}

export type AssessmentAIProgress = {
  currentStep?: "assets" | "requirements" | "questions" | "compliance" | "summary" | "done"
  completed?: {
    assets?: boolean
    requirements?: boolean
    questions?: boolean
    compliance?: boolean
  }
}

export type Assessment = {
  _id: string
  projectId: string

  name: string
  mode: "quick" | "deep"
  risk: "unknown" | "low" | "medium" | "high" | "critical"
  status: "draft" | "in_progress" | "completed"

  summary?: AssessmentSummary
  aiProgress?: AssessmentAIProgress
  sources: AssessmentSource[]

  createdBy?: AssessmentUser

  createdAt: string
  updatedAt: string
  completedAt?: string
}

export type AssessmentWithStats = Assessment & {
  sourceCount: number
}
