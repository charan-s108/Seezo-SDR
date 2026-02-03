import { ObjectId } from "mongodb"

export interface Otp {
  _id?: ObjectId
  userId: ObjectId
  codeHash: string
  expiresAt: Date
  createdAt: Date
}
