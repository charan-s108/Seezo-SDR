export type RequirementReviewStatus =
  | "open"
  | "accepted"
  | "mitigated"
  | "not_applicable"

export type SecurityRequirementReview = {
  requirementId: string
  status: RequirementReviewStatus
  notes?: string
  updatedAt: string
}
