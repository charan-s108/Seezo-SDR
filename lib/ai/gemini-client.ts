import { GoogleGenAI } from "@google/genai"

export const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
})

// export const GEMINI_MODEL_ID = "gemini-2.5-flash"
// export const GEMINI_MODEL_ID = "gemini-2.5-flash-lite"
export const GEMINI_MODEL_ID = "gemini-2.0-flash"
// export const GEMINI_MODEL_ID = "gemini-2.0-flash-lite"

export const geminiModels = genAI.models

export const geminiFiles = genAI.files
