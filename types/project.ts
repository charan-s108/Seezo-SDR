export type Project = {
  _id: string
  name: string
  code: string
  description?: string

  ownerName: string
  assessmentCount: number

  createdAt: string
}
