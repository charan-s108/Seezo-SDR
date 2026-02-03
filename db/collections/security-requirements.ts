import { ObjectId } from "mongodb"

export interface SecurityRequirement {
  _id?: ObjectId
  assessmentId: ObjectId

  title: string
  description: string
  category?: string

  asvs?: string[]
  stride?: string[]
  iso27001?: string[]
  soc2?: string[]
  pciDss?: string[]
  gdpr?: string[]

  risk?: "low" | "medium" | "high" | "critical"

  createdAt: Date
}
