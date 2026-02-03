import { ObjectId } from "mongodb"

export interface Project {
  _id?: ObjectId

  name: string
  code: string 
  description?: string

  ownerId: ObjectId 

  createdAt: Date
}
