import { genAI } from "./gemini-client"

/* ================================
   Model Fallback Strategy
================================= */

const MODEL_FALLBACK_CHAIN = [
  "gemini-2.5-flash",           // Primary: Best quality, highest rate limit
  "gemini-2.5-flash-lite",      // Secondary: Lighter, faster fallback
  "gemini-2.0-flash",           // Tertiary: Reliable fallback
  "gemini-2.0-flash-lite",      // Last resort: Budget option
]

interface APIRequestOptions {
  contents: any[]
  assessmentId?: string
}

interface RetryConfig {
  maxRetries?: number
  initialDelayMs?: number
  backoffMultiplier?: number
}

/* ================================
   Assessment-Level Model Tracker
   (Ensures same model for all 5 steps)
================================= */

const assessmentModelCache = new Map<string, string>()

/**
 * Get or select a model for this assessment
 * Once a model is selected, it's reused for all 5 API calls in this assessment
 */
function getModelForAssessment(assessmentId: string): string {
  if (assessmentModelCache.has(assessmentId)) {
    return assessmentModelCache.get(assessmentId)!
  }

  // First time: use primary model
  const model = MODEL_FALLBACK_CHAIN[0]
  assessmentModelCache.set(assessmentId, model)
  console.log(`📍 Assessment ${assessmentId} → Using model: ${model}`)
  return model
}

/**
 * Switch to next model in fallback chain when rate limit is hit
 */
function switchModelForAssessment(
  assessmentId: string
): string | null {
  const currentModel = assessmentModelCache.get(assessmentId)
  const currentIndex = MODEL_FALLBACK_CHAIN.indexOf(currentModel || "")

  if (currentIndex === -1 || currentIndex >= MODEL_FALLBACK_CHAIN.length - 1) {
    // No more models available
    return null
  }

  const nextModel = MODEL_FALLBACK_CHAIN[currentIndex + 1]
  assessmentModelCache.set(assessmentId, nextModel)
  console.log(`⚠️  Rate limited! Switched model for ${assessmentId} → ${nextModel}`)
  return nextModel
}

/**
 * Clear cached model when assessment completes
 */
export function clearModelCacheForAssessment(assessmentId: string): void {
  assessmentModelCache.delete(assessmentId)
}

/* ================================
   API Call with Fallback & Retry
================================= */

export async function callGeminiWithFallback(
  options: APIRequestOptions,
  retryConfig: RetryConfig = {}
) {
  const {
    maxRetries = 3,
    initialDelayMs = 500,
    backoffMultiplier = 2,
  } = retryConfig

  const assessmentId = options.assessmentId || "unknown"
  let lastError: any = null

  // Try each model in the fallback chain
  for (let modelAttempt = 0; modelAttempt < MODEL_FALLBACK_CHAIN.length; modelAttempt++) {
    const model = modelAttempt === 0
      ? getModelForAssessment(assessmentId)
      : switchModelForAssessment(assessmentId)

    if (!model) {
      throw new Error(
        `🚫 All models exhausted. Last error: ${lastError?.message || "Unknown"}`
      )
    }

    // Try current model with exponential backoff retries
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await genAI.models.generateContent({
          model,
          contents: options.contents,
        })

        // Success! Return the response
        return response

      } catch (error: any) {
        lastError = error

        // Check if this is a rate limit error
        const isRateLimitError = 
          error?.status === 429 || 
          error?.message?.includes("429") ||
          error?.message?.includes("rate limit") ||
          error?.message?.includes("quota")

        if (isRateLimitError && modelAttempt < MODEL_FALLBACK_CHAIN.length - 1) {
          // Rate limited - will try next model (don't retry with same model)
          console.warn(`⏱️  429 Rate limit on ${model}. Trying next model...`)
          break // Break retry loop, go to next model
        }

        if (attempt < maxRetries && !isRateLimitError) {
          // Not rate limited and we have retries left - wait and retry
          const delayMs = initialDelayMs * Math.pow(backoffMultiplier, attempt)
          console.warn(`⏰ API error (${error?.status}). Retrying in ${delayMs}ms...`)
          await new Promise(resolve => setTimeout(resolve, delayMs))
          continue
        }

        // Out of retries or rate limited with no more fallback models
        if (modelAttempt === MODEL_FALLBACK_CHAIN.length - 1) {
          throw error // No more models, throw the error
        }
        
        // Try next model
        break
      }
    }
  }

  // Should not reach here
  throw new Error(`Failed to get API response after all fallback attempts. Last error: ${lastError?.message}`)
}

/* ================================
   Exports for Testing
================================= */

export function getActiveModelsForAssessment(assessmentId: string): string[] {
  return [
    assessmentModelCache.get(assessmentId) || MODEL_FALLBACK_CHAIN[0],
    ...MODEL_FALLBACK_CHAIN
  ]
}
