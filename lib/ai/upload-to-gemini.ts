import fs from "fs/promises"
import path from "path"
import { geminiFiles } from "./gemini-client"

export async function uploadImageToGemini(
  relativePath: string,
  mimeType: string
) {
  const fullPath = path.join(process.cwd(), "public", relativePath)

  const buffer = await fs.readFile(fullPath)

  const blob = new Blob([buffer], { type: mimeType })

  const uploadedFile = await geminiFiles.upload({
    file: blob,
  })

  console.log(
    `📤 Gemini upload complete → ${uploadedFile.name}`
  )

  return uploadedFile
}
