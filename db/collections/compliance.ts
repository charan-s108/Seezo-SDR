import { ObjectId } from "mongodb"

export interface ComplianceFinding {
  _id?: ObjectId
  assessmentId: ObjectId

  framework: string
  controlId?: string
  requirement: string

  status: "pass" | "fail" | "partial" | "unknown"
  evidence?: string

  createdAt: Date
}
