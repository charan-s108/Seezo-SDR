import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { callGeminiWithFallback, clearModelCacheForAssessment } from "./api-request-handler"

import { SYSTEM_PROMPT } from "./prompts/system"
import { diagramAnalysisPrompt } from "./prompts/analyze-diagram"
import { securityRequirementsPrompt } from "./prompts/security-requirements"
import { openQuestionsPrompt } from "./prompts/open-questions"
import { compliancePrompt } from "./prompts/compliance"
import { securitySummaryPrompt } from "./prompts/summary"

import { uploadImageToGemini } from "./upload-to-gemini"

/* -------------------------------
   Helpers
-------------------------------- */

function extractText(res: any): string {
  return (
    res?.candidates?.[0]?.content?.parts
      ?.map((p: any) => p.text ?? "")
      .join("") ?? ""
  )
}

function safeJsonParse(raw: string) {
  const match = raw.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
  if (!match) throw new Error("No JSON found in AI response")
  return JSON.parse(match[0])
}

/* -------------------------------
   Main Processor
-------------------------------- */

export async function processAssessmentWithAI(
  assessmentId: string
) {
  const client = await clientPromise
  const db = client.db()

  const assessment = await db
    .collection("assessments")
    .findOne({ _id: new ObjectId(assessmentId) })

  if (!assessment) throw new Error("Assessment not found")

  // Check if this is a re-evaluation
  const isReevaluation = !!assessment.reevaluationContext

  const updateProgress = async (
    currentStep: "assets" | "requirements" | "questions" | "compliance" | "summary" | "done",
    completed: Partial<Record<"assets" | "requirements" | "questions" | "compliance", boolean>>
  ) => {
    await db.collection("assessments").updateOne(
      { _id: assessment._id },
      {
        $set: {
          aiProgress: {
            currentStep,
            completed: {
              assets: false,
              requirements: false,
              questions: false,
              compliance: false,
              ...completed,
            },
          },
          updatedAt: new Date(),
        },
      }
    )
  }

  try {
    await db.collection("assessments").updateOne(
      { _id: assessment._id },
      { $set: { status: "in_progress", updatedAt: new Date() } }
    )

    await updateProgress("assets", {})

    // Only delete on initial assessment, NOT on re-evaluation
    if (!isReevaluation) {
      await Promise.all([
        db.collection("security_requirements").deleteMany({ assessmentId: assessment._id }),
        db.collection("open_questions").deleteMany({ assessmentId: assessment._id }),
        db.collection("compliance_findings").deleteMany({ assessmentId: assessment._id }),
      ])
    }

    /* ================================
       🧠 STEP 1 — Diagram Analysis
    ================================= */

    let analysisJson: any

    if (isReevaluation) {
      // Re-evaluation: Reuse existing architecture analysis
      const existingAssessment = await db.collection("assessments").findOne({ _id: assessment._id })
      analysisJson = existingAssessment?.architectureAnalysis || {
        components: [],
        dataFlows: [],
        trustBoundaries: [],
        externalExposures: [],
        assumptions: ["Re-evaluation using existing architecture analysis"],
      }
      console.log("♻️ Re-evaluation: Reusing existing architecture analysis")
    } else {
      // Initial assessment: Analyze diagram
      const diagramSource = assessment.sources?.find(
        (s: any) =>
          s.type === "file" &&
          typeof s.mimeType === "string" &&
          s.mimeType.startsWith("image/")
      )

      if (!diagramSource) {
        analysisJson = {
          components: [],
          dataFlows: [],
          trustBoundaries: [],
          externalExposures: [],
          assumptions: ["No architecture diagram provided"],
        }
      } else {
        const uploadedFile = await uploadImageToGemini(
          diagramSource.storage.path,
          diagramSource.mimeType
        )

        const analysisRes = await callGeminiWithFallback({
          assessmentId: assessmentId,
          contents: [
            {
              role: "user",
              parts: [{ text: SYSTEM_PROMPT }],
            },
            {
              role: "user",
              parts: [
                {
                  fileData: {
                    fileUri: uploadedFile.uri,
                  },
                },
              ],
            },
            {
              role: "user",
              parts: [
                {
                  text: diagramAnalysisPrompt({
                    assessmentName: assessment.name,
                    fileName: diagramSource.name,
                  }),
                },
              ],
            },
          ],
        })

        const analysisText = extractText(analysisRes)
        console.log("🧠 Diagram Analysis RAW:\n", analysisText)

        analysisJson = safeJsonParse(analysisText)
      }

      // Store architecture analysis for future re-evaluations
      await db.collection("assessments").updateOne(
        { _id: assessment._id },
        {
          $set: {
            architectureAnalysis: analysisJson,
            updatedAt: new Date(),
          },
        }
      )
    }

    await updateProgress("requirements", { assets: true })

    /* ================================
       🔐 Security Requirements
    ================================= */

    const requirementsRes = await callGeminiWithFallback({
      assessmentId: assessmentId,
      contents: [
        { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
        { role: "user", parts: [{ text: securityRequirementsPrompt(isReevaluation) }] },
        { role: "user", parts: [{ text: JSON.stringify(analysisJson) }] },
        ...(isReevaluation && assessment.reevaluationContext
          ? [
              {
                role: "user",
                parts: [
                  {
                    text: `\n\nUser Context from Re-evaluation:\nUser Answers: ${JSON.stringify(
                      assessment.reevaluationContext.answers
                    )}\nRequirement Reviews: ${JSON.stringify(
                      assessment.reevaluationContext.requirementReviews
                    )}`,
                  },
                ],
              },
            ]
          : []),
      ],
    })

    const requirementsText = extractText(requirementsRes)
    console.log("🔐 Security Requirements RAW:\n", requirementsText)

    const requirementsJson = safeJsonParse(requirementsText)

    if (Array.isArray(requirementsJson)) {
      if (isReevaluation) {
        // Re-evaluation: Merge with existing requirements
        const existingReqs = await db
          .collection("security_requirements")
          .find({ assessmentId: assessment._id })
          .toArray()

        for (const newReq of requirementsJson) {
          // Find similar requirement by title or category
          const similar = existingReqs.find(
            (existing: any) =>
              existing.title?.toLowerCase() === newReq.title?.toLowerCase() ||
              (existing.category === newReq.category &&
                existing.threat === newReq.threat)
          )

          if (similar) {
            // Update existing requirement with refinement
            await db.collection("security_requirements").updateOne(
              { _id: similar._id },
              {
                $set: {
                  ...newReq,
                  isRefined: true,
                  refinedAt: new Date(),
                  version: (similar.version || 1) + 1,
                  updatedAt: new Date(),
                },
              }
            )
            console.log(`♻️ Refined requirement: ${newReq.title}`)
          } else {
            // New requirement discovered
            await db.collection("security_requirements").insertOne({
              ...newReq,
              assessmentId: assessment._id,
              projectId: assessment.projectId,
              status: "open",
              version: 1,
              isRefined: false,
              sourceVersion: "refined",
              createdAt: new Date(),
              discoveredAt: new Date(),
            })
            console.log(`✨ New requirement discovered: ${newReq.title}`)
          }
        }
      } else {
        // Initial assessment: Insert all requirements
        await db.collection("security_requirements").insertMany(
          requirementsJson.map((r: any) => ({
            ...r,
            assessmentId: assessment._id,
            projectId: assessment.projectId,
            status: "open",
            version: 1,
            isRefined: false,
            sourceVersion: "baseline",
            createdAt: new Date(),
          }))
        )
      }
    }

    await updateProgress("questions", { assets: true, requirements: true })

    /* ================================
       ❓ Open Questions
    ================================= */

    const openQuestionsRes = await callGeminiWithFallback({
      assessmentId: assessmentId,
      contents: [
        { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
        {
          role: "user",
          parts: [
            {
              text: openQuestionsPrompt({
                assessmentName: assessment.name,
                mode: assessment.mode,
              }),
            },
          ],
        },
      ],
    })

    const openQuestionsText = extractText(openQuestionsRes)
    console.log("❓ Open Questions RAW:\n", openQuestionsText)

    let openQuestionsJson: any[] = []
    try {
    openQuestionsJson = safeJsonParse(openQuestionsText)
    } catch {
    openQuestionsJson = []
    }

    if (Array.isArray(openQuestionsJson) && openQuestionsJson.length) {
      if (isReevaluation) {
        // Re-evaluation: Merge with existing questions
        const existingQuestions = await db
          .collection("open_questions")
          .find({ assessmentId: assessment._id })
          .toArray()

        for (const newQ of openQuestionsJson) {
          // Find similar question by question text
          const similar = existingQuestions.find(
            (existing: any) =>
              existing.question?.toLowerCase() === newQ.question?.toLowerCase()
          )

          if (similar) {
            // Update existing question with refinement
            await db.collection("open_questions").updateOne(
              { _id: similar._id },
              {
                $set: {
                  ...newQ,
                  isRefined: true,
                  refinedAt: new Date(),
                  version: (similar.version || 1) + 1,
                  updatedAt: new Date(),
                },
              }
            )
          } else {
            // New question discovered
            await db.collection("open_questions").insertOne({
              ...newQ,
              assessmentId: assessment._id,
              projectId: assessment.projectId,
              status: "open",
              version: 1,
              isRefined: false,
              sourceVersion: "refined",
              createdAt: new Date(),
              discoveredAt: new Date(),
            })
          }
        }
      } else {
        // Initial assessment: Insert all questions
        await db.collection("open_questions").insertMany(
          openQuestionsJson.map((q: any) => ({
            ...q,
            assessmentId: assessment._id,
            projectId: assessment.projectId,
            status: "open",
            version: 1,
            isRefined: false,
            sourceVersion: "baseline",
            createdAt: new Date(),
          }))
        )
      }
    }

    await updateProgress("compliance", {
      assets: true,
      requirements: true,
      questions: true,
    })

    /* ================================
       📜 Compliance
    ================================= */

    // Fetch current assessment to get applicable standards
    const currentAssessment = await db
      .collection("assessments")
      .findOne({ _id: assessment._id })

    const applicableStandards = currentAssessment?.applicableStandards || []
    const standardsFilter = applicableStandards.length > 0
      ? `\n\nIMPORTANT: Only generate compliance findings for these applicable standards: ${applicableStandards.join(", ")}. Ignore all other standards.`
      : ""

    const complianceRes = await callGeminiWithFallback({
      assessmentId: assessmentId,
      contents: [
        { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
        { 
          role: "user", 
          parts: [
            {
              text: `System Architecture:\n${JSON.stringify(analysisJson, null, 2)}\n\nSecurity Requirements:\n${JSON.stringify(
                requirementsJson,
                null,
                2
              )}`,
            },
          ],
        },
        { role: "user", parts: [{ text: compliancePrompt() + standardsFilter }] },
      ],
    })

    const complianceText = extractText(complianceRes)
    console.log("📜 Compliance RAW:\n", complianceText)

    let complianceJson: any[] = []
    try {
      const parsed = safeJsonParse(complianceText)
      complianceJson = Array.isArray(parsed) ? parsed : (parsed?.findings ?? [])
    } catch {
      complianceJson = []
    }

    if (Array.isArray(complianceJson) && complianceJson.length) {
      if (isReevaluation) {
        // Re-evaluation: Delete compliance findings for standards NOT in applicableStandards
        if (applicableStandards.length > 0) {
          const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "")
          const applicableNorm = applicableStandards.map((s: string) => normalize(s))
          
          const allFindings = await db
            .collection("compliance_findings")
            .find({ assessmentId: assessment._id })
            .toArray()
          
          const findingsToDelete = allFindings.filter((f: any) => {
            const standardNorm = normalize(f.standard || f.framework || "")
            return !applicableNorm.some((norm: string) => 
              norm === standardNorm || norm.includes(standardNorm) || standardNorm.includes(norm)
            )
          })
          
          if (findingsToDelete.length > 0) {
            await db.collection("compliance_findings").deleteMany({
              _id: { $in: findingsToDelete.map(f => f._id) }
            })
            console.log(`🗑️ Deleted ${findingsToDelete.length} compliance findings for non-applicable standards`)
          }
        }

        // Re-evaluation: Merge with existing compliance findings
        const existingCompliance = await db
          .collection("compliance_findings")
          .find({ assessmentId: assessment._id })
          .toArray()

        for (const newC of complianceJson) {
          // Find similar compliance by standard and controlId
          const similar = existingCompliance.find(
            (existing: any) =>
              existing.standard === newC.standard &&
              existing.controlId === newC.controlId
          )

          if (similar) {
            // Update existing compliance finding with refinement
            await db.collection("compliance_findings").updateOne(
              { _id: similar._id },
              {
                $set: {
                  ...newC,
                  isRefined: true,
                  refinedAt: new Date(),
                  version: (similar.version || 1) + 1,
                  updatedAt: new Date(),
                },
              }
            )
          } else {
            // New compliance finding
            await db.collection("compliance_findings").insertOne({
              ...newC,
              assessmentId: assessment._id,
              projectId: assessment.projectId,
              version: 1,
              isRefined: false,
              sourceVersion: "refined",
              createdAt: new Date(),
              discoveredAt: new Date(),
            })
          }
        }
      } else {
        // Initial assessment: Insert all compliance findings
        await db.collection("compliance_findings").insertMany(
          complianceJson.map((c: any) => ({
            ...c,
            assessmentId: assessment._id,
            projectId: assessment.projectId,
            version: 1,
            isRefined: false,
            sourceVersion: "baseline",
            createdAt: new Date(),
          }))
        )
      }
    }

    await updateProgress("summary", {
      assets: true,
      requirements: true,
      questions: true,
      compliance: true,
    })

    /* ================================
    🧾 Summary
    ================================= */

    let summaryJson = assessment.summary

    // Only generate summary on initial assessment, NOT on re-evaluation
    // Reason: Summary is a narrative assessment of the original design/architecture
    // that doesn't need to change when requirements are refined. It provides historical context.
    if (!isReevaluation) {
      const summaryRes = await callGeminiWithFallback({
      assessmentId: assessmentId,
      contents: [
          {
          role: "user",
          parts: [
              { text: SYSTEM_PROMPT },
          ],
          },
          {
          role: "user",
          parts: [
              {
              text: securitySummaryPrompt({
                  assessmentName: assessment.name,
                  architecture: analysisJson,
                  securityRequirements: requirementsJson,
                  openQuestions: openQuestionsJson,
                  complianceFindings: complianceJson,
              }),
              },
          ],
          },
      ],
      })

      const summaryText =
      summaryRes.candidates?.[0]?.content?.parts
          ?.map((p: { text?: string }) => p.text ?? "")
          .join("") ?? ""

      console.log("🧾 Security Summary RAW:\n", summaryText)

      summaryJson = safeJsonParse(summaryText)
    }

    await updateProgress("done", {
      assets: true,
      requirements: true,
      questions: true,
      compliance: true,
    })

    /* ================================
       ✅ Finalize
    ================================= */

  await db.collection("assessments").updateOne(
    { _id: assessment._id },
    {
      $set: {
        status: "completed",
        risk: deriveOverallRisk(requirementsJson),
        summary: {
          riskSummary: summaryJson?.riskSummary ?? assessment.summary?.riskSummary ?? "",
          executiveSummary: summaryJson?.executiveSummary ?? assessment.summary?.executiveSummary ?? "",
          securityRequirementsCount: Array.isArray(requirementsJson)
            ? requirementsJson.length
            : 0,
          openQuestionsCount: Array.isArray(openQuestionsJson)
            ? openQuestionsJson.length
            : 0,
          complianceFindingsCount: Array.isArray(complianceJson)
            ? complianceJson.length
            : 0,
        },
        aiProgress: {
          currentStep: "done",
          completed: {
            assets: true,
            requirements: true,
            questions: true,
            compliance: true,
          },
        },
        updatedAt: new Date(),
        completedAt: new Date(),
      },
    }
  )
  } catch (err) {
    console.error("❌ AI Processing Failed:", err)

    await db.collection("assessments").updateOne(
      { _id: assessment._id },
      { $set: { status: "draft", updatedAt: new Date() } }
    )

    // Clean up model cache on error
    clearModelCacheForAssessment(assessmentId)

    throw err
  } finally {
    // Clean up model cache when assessment completes
    clearModelCacheForAssessment(assessmentId)
  }
}

/* -------------------------------
   Risk Derivation Helper
-------------------------------- */

export function deriveOverallRisk(requirements: any): "low" | "medium" | "high" | "critical" {
  const items = Array.isArray(requirements)
    ? requirements
    : requirements?.securityRequirements ?? []

  // Check for critical risk across multiple property names the AI might use
  if (items.some((r: any) => {
    const riskValue = r.riskRanking || r.risk || r.riskLevel || r.severity || ""
    return riskValue.toLowerCase() === "critical"
  })) return "critical"

  // Check for high risk across multiple property names the AI might use
  if (items.some((r: any) => {
    const riskValue = r.riskRanking || r.risk || r.riskLevel || r.severity || ""
    return riskValue.toLowerCase() === "high"
  })) return "high"

  // Check for medium risk
  if (items.some((r: any) => {
    const riskValue = r.riskRanking || r.risk || r.riskLevel || r.severity || ""
    return riskValue.toLowerCase() === "medium"
  })) return "medium"

  return "low"
}
