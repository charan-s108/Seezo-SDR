import { ObjectId } from "mongodb"

export interface OpenQuestion {
  _id?: ObjectId
  assessmentId: ObjectId

  question: string
  context?: string
  suggestedAnswer?: string
  impact?: string

  createdAt: Date
}
