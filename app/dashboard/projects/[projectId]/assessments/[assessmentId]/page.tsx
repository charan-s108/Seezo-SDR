"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

import ProjectBreadcrumb from "@/components/navigation/project-breadcrumb"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { ExportMenu } from "@/components/assessments/export-menu"

import { Cog, Clock, User, Layers, RefreshCw } from "lucide-react"

import { Overview } from "./components/overview"
import { SecurityRequirementsTable } from "./components/security-requirements-table"
import { updateRequirementReview } from "@/app/actions/update-requirement-review"
import { OpenQuestionsTable } from "./components/open-questions-table"
import type { QuestionStatus } from "./components/open-questions-table"
import { SecuritySummary } from "./components/security-summary"
import { SecurityRequirementReview } from "./components/security-requirements-table"
import { RequirementReviewStatus } from "@/app/actions/update-requirement-review"
import { AssetsTable } from "./components/assets-table"
import { ComplianceTable } from "./components/compliance-table"
import { DecisionTree } from "./components/decision-tree"
import { AIGeneratingBanner } from "./components/ai-generating-banner"

import type { Assessment } from "@/types/assessment"
import { cn } from "@/lib/utils"

/* ======================================================
   Types
====================================================== */

type AssessmentRisk =
  | "unknown"
  | "low"
  | "medium"
  | "high"
  | "critical"

/* ======================================================
   Risk Calculation
====================================================== */

function calculateLiveRisk(requirements: any[]): AssessmentRisk {
  if (!Array.isArray(requirements) || requirements.length === 0) {
    return "unknown"
  }

  // Check for critical risk
  if (requirements.some((r: any) => {
    const riskValue = r.risk_ranking || r.riskRanking || r.risk || r.riskLevel || r.severity || ""
    return riskValue.toLowerCase() === "critical"
  })) return "critical"

  // Check for high risk
  if (requirements.some((r: any) => {
    const riskValue = r.risk_ranking || r.riskRanking || r.risk || r.riskLevel || r.severity || ""
    return riskValue.toLowerCase() === "high"
  })) return "high"

  // Check for medium risk
  if (requirements.some((r: any) => {
    const riskValue = r.risk_ranking || r.riskRanking || r.risk || r.riskLevel || r.severity || ""
    return riskValue.toLowerCase() === "medium"
  })) return "medium"

  return "low"
}

/* ======================================================
   Helpers
====================================================== */

function riskBadgeClass(risk: AssessmentRisk) {
  switch (risk) {
    case "critical":
      return "bg-red-100 text-red-700"
    case "high":
      return "bg-orange-100 text-orange-700"
    case "medium":
      return "bg-yellow-100 text-yellow-700"
    case "low":
      return "bg-green-100 text-green-700"
    default:
      return "bg-muted text-muted-foreground"
  }
}

/* ======================================================
   Loading Skeleton
====================================================== */

function AssessmentSkeleton() {
  return (
    <div className="min-h-full rounded-xl border bg-background p-6 space-y-8">
      <Skeleton className="h-4 w-64" />

      <div className="flex justify-between">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-9 w-32" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>

      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

/* ======================================================
   Page
====================================================== */

export default function AssessmentDetailPage() {
  const router = useRouter()
  const params = useParams()

  const projectId = params.projectId as string
  const assessmentId = params.assessmentId as string
  const [activeTab, setActiveTab] = useState("overview")

  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [projectName, setProjectName] = useState("")
  const [loading, setLoading] = useState(true)

  const [securityRequirements, setSecurityRequirements] = useState([])
  const [openQuestions, setOpenQuestions] = useState([])
  const [complianceFindings, setComplianceFindings] = useState([])
  const [requirementReviews, setRequirementReviews] = useState<SecurityRequirementReview[]>([])

  // Track which APIs have been fetched for the AI banner
  const [assetsLoaded, setAssetsLoaded] = useState(false)
  const [requirementsLoaded, setRequirementsLoaded] = useState(false)
  const [questionsLoaded, setQuestionsLoaded] = useState(false)
  const [complianceLoaded, setComplianceLoaded] = useState(false)

  /* -------------------------------
     Fetch Data
  -------------------------------- */

  const loadAssessment = async () => {
    const res = await fetch(`/api/assessments/${assessmentId}`)
    if (!res.ok) return null

    const data = await res.json()
    setAssessment(data)
    return data
  }

  const loadAssessmentData = async () => {
    const [reqRes, qRes, compRes] = await Promise.all([
      fetch(`/api/security-requirements?assessmentId=${assessmentId}`),
      fetch(`/api/open-questions?assessmentId=${assessmentId}`),
      fetch(`/api/compliance?assessmentId=${assessmentId}`),
    ])

    if (reqRes.ok) {
      const requirements = await reqRes.json()
      setSecurityRequirements(requirements)
      if (requirements.length > 0) setRequirementsLoaded(true)

      // Update compliance coverage based on current requirements
      if (requirements.length > 0) {
        await fetch(`/api/compliance`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assessmentId,
            securityRequirements: requirements
          })
        })

        // Refetch compliance with updated statuses
        const updatedCompRes = await fetch(`/api/compliance?assessmentId=${assessmentId}`)
        if (updatedCompRes.ok) {
          setComplianceFindings(await updatedCompRes.json())
        }
      }
    }
    if (qRes.ok) {
      const questions = await qRes.json()
      setOpenQuestions(questions)
      if (questions.length > 0) setQuestionsLoaded(true)
    }
    if (compRes.ok && !reqRes.ok) {
      const compliance = await compRes.json()
      setComplianceFindings(compliance)
      if (compliance.length > 0) setComplianceLoaded(true)
    }
  }

  useEffect(() => {
    if (!projectId || !assessmentId) return

    async function loadAll() {
      let complianceUpdated = false
      try {
        const [
          projectRes,
          reqRes,
          qRes,
          compRes,
        ] = await Promise.all([
          fetch(`/api/projects/${projectId}`),
          fetch(`/api/security-requirements?assessmentId=${assessmentId}`),
          fetch(`/api/open-questions?assessmentId=${assessmentId}`),
          fetch(`/api/compliance?assessmentId=${assessmentId}`),
        ])

        const projectData = await projectRes.json()
        setProjectName(projectData.project?.name ?? "")

        if (reqRes.ok) {
          const requirements = await reqRes.json()
          setSecurityRequirements(requirements)
          if (requirements.length > 0) setRequirementsLoaded(true)

          if (requirements.length > 0) {
            await fetch(`/api/compliance`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                assessmentId,
                securityRequirements: requirements,
              }),
            })

            const updatedCompRes = await fetch(`/api/compliance?assessmentId=${assessmentId}`)
            if (updatedCompRes.ok) {
              const updatedCompliance = await updatedCompRes.json()
              setComplianceFindings(updatedCompliance)
              if (updatedCompliance.length > 0) setComplianceLoaded(true)
              complianceUpdated = true
            }
          }
        }
        if (qRes.ok) {
          const questions = await qRes.json()
          setOpenQuestions(questions)
          if (questions.length > 0) setQuestionsLoaded(true)
        }
        if (compRes.ok && !complianceUpdated) {
          const compliance = await compRes.json()
          setComplianceFindings(compliance)
          if (compliance.length > 0) setComplianceLoaded(true)
        }

        // Mark assets as loaded if assessment has sources
        const assessment = await loadAssessment()
        if (assessment?.sources && assessment.sources.length > 0) {
          setAssetsLoaded(true)
        }
      } finally {
        setLoading(false)
      }
    }

    loadAll()
  }, [projectId, assessmentId])

  useEffect(() => {
    if (!assessment) return

    if (
      assessment.status !== "draft" &&
      assessment.status !== "in_progress"
    ) {
      return
    }

    const interval = setInterval(async () => {
      const latest = await loadAssessment()

      if (latest?.status === "completed") {
        clearInterval(interval)

        await loadAssessmentData()

        // Mark all as loaded on completion
        setAssetsLoaded(true)
        setRequirementsLoaded(true)
        setQuestionsLoaded(true)
        setComplianceLoaded(true)

        router.refresh()
      } else if (latest?.status === "in_progress") {
        // During in_progress, check and mark any newly available data
        // Requirements should be available first
        if ((!requirementsLoaded || securityRequirements.length === 0) && latest) {
          const reqRes = await fetch(`/api/security-requirements?assessmentId=${assessmentId}`)
          if (reqRes.ok) {
            const reqs = await reqRes.json()
            if (reqs.length > 0) {
              setSecurityRequirements(reqs)
              setRequirementsLoaded(true)
            }
          }
        }

        // Then questions
        if ((!questionsLoaded || openQuestions.length === 0) && latest) {
          const qRes = await fetch(`/api/open-questions?assessmentId=${assessmentId}`)
          if (qRes.ok) {
            const questions = await qRes.json()
            if (questions.length > 0) {
              setOpenQuestions(questions)
              setQuestionsLoaded(true)
            }
          }
        }

        // Then compliance
        if ((!complianceLoaded || complianceFindings.length === 0) && latest) {
          const compRes = await fetch(`/api/compliance?assessmentId=${assessmentId}`)
          if (compRes.ok) {
            const compliance = await compRes.json()
            if (compliance.length > 0) {
              setComplianceFindings(compliance)
              setComplianceLoaded(true)
            }
          }
        }

        // Mark assets as loaded if sources exist
        if (!assetsLoaded && latest?.sources?.length > 0) {
          setAssetsLoaded(true)
        }
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [assessment?.status, assessmentId, assetsLoaded, requirementsLoaded, questionsLoaded, complianceLoaded])

  /* -------------------------------
     Loading State
  -------------------------------- */

  if (loading) {
    return <AssessmentSkeleton />
  }

  if (!assessment) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-sm text-red-600">Assessment not found</p>
        <Button variant="ghost" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    )
  }

  /* -------------------------------
     Handlers
  -------------------------------- */
    const handleRequirementStatusChange = async (
    requirementId: string,
    status: RequirementReviewStatus
  ) => {
    // ✅ 1. Update UI state FIRST
    setRequirementReviews((prev) => {
      const exists = prev.find(
        (r) => r.requirementId === requirementId
      )

      if (exists) {
        return prev.map((r) =>
          r.requirementId === requirementId
            ? { ...r, status }
            : r
        )
      }

      return [...prev, { requirementId, status }]
    })

    // ✅ 2. Call server action
    await updateRequirementReview(
      assessmentId,
      requirementId,
      status
    )

    // ✅ 3. Refresh requirements to update decision tree
    const res = await fetch(`/api/security-requirements?assessmentId=${assessmentId}`)
    if (res.ok) {
      const data = await res.json()
      setSecurityRequirements(data)
      setRequirementsLoaded(true)  // Mark requirements as loaded

      // ✅ 4. Update assessment risk in database
      const newRisk = calculateLiveRisk(data)
      await fetch(`/api/assessments/${assessmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ risk: newRisk })
      })

      // Update local assessment state
      setAssessment(prev => prev ? { ...prev, risk: newRisk } : prev)

      // ✅ 5. Update compliance coverage based on requirement status change
      const complianceRes = await fetch(`/api/compliance`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId,
          securityRequirements: data
        })
      })

      // ✅ 6. Refresh compliance findings to show updated coverage
      if (complianceRes.ok) {
        const complianceData = await fetch(`/api/compliance?assessmentId=${assessmentId}`)
        if (complianceData.ok) {
          setComplianceFindings(await complianceData.json())
        }
      }
    }
  }

  const handleQuestionAnswerSaved = async (
    questionId: string,
    status: QuestionStatus
  ) => {
    // Refresh questions to reflect the updated status and update decision tree
    const res = await fetch(`/api/open-questions?assessmentId=${assessmentId}`)
    if (res.ok) {
      const data = await res.json()
      setOpenQuestions(data)
      setQuestionsLoaded(true)  // Mark questions as loaded
    }
  }

  const handleReevaluate = async () => {
    if (!canReevaluate) return

    try {
      const res = await fetch(`/api/assessments/${assessmentId}/reevaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: openQuestions,
          requirementReviews: requirementReviews,
        }),
      })

      if (!res.ok) {
        alert("Re-evaluation failed. Please try again.")
        return
      }

      // Assessment is now in_progress, start polling for completion
      const interval = setInterval(async () => {
        const latest = await loadAssessment()

        if (latest?.status === "completed") {
          clearInterval(interval)
          await loadAssessmentData()
          router.refresh()
        }
      }, 4000)
    } catch (error) {
      console.error("Re-evaluation error:", error)
      alert("Error starting re-evaluation")
    }
  }

  /* -------------------------------
     Derived Counts (Live)
  -------------------------------- */

  const requirementStatusById = new Map(
    requirementReviews.map((r) => [r.requirementId, r.status])
  )

  const openRequirementsCount = securityRequirements.filter((req: any) => {
    const requirementId = req.id ?? req._id
    const status = requirementStatusById.get(requirementId) ?? req.status ?? "open"
    return status === "open"
  }).length

  const openQuestionsCount = openQuestions.filter((q: any) => {
    const status = q.status ?? (q.answered ? "answered" : "open")
    return status === "open"
  }).length

  const canReevaluate =
    openRequirementsCount === 0 && openQuestionsCount === 0

  const allQuestionsAnswered = openQuestionsCount === 0
  const allRequirementsReviewed = openRequirementsCount === 0

  /* -------------------------------
     Render
  -------------------------------- */

  return (
    <div className="min-h-full rounded-xl border bg-background p-6 flex flex-col gap-8">
      {/* ================= Breadcrumb ================= */}
      <ProjectBreadcrumb
        projectName={projectName}
        assessmentName={assessment.name}
      />

      {/* ================= Header ================= */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{assessment.name}</h1>

        <div className="flex gap-2">
          <Button variant="ghost" className="cursor-pointer" 
            onClick={() => router.back()}>
            Back
          </Button>

          <ExportMenu 
            projectId={projectId}
            assessmentId={assessmentId}
            assessmentName={assessment.name}
          />

          <Button 
            className="cursor-pointer"
            disabled={!canReevaluate}
            onClick={handleReevaluate}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Re-evaluate
          </Button>
        </div>
      </div>

      {/* ================= Risk + Meta Grid ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* ================= Risk Card ================= */}
      <div className="rounded-lg border bg-background p-4 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            Assessment Risk
          </p>

          {/* ✅ Show live calculated risk based on current requirements */}
          <div
            className={cn(
              "inline-flex items-center px-2 rounded-md text-sm font-semibold",
              riskBadgeClass(calculateLiveRisk(securityRequirements))
            )}
          >
            {calculateLiveRisk(securityRequirements).toUpperCase()}
          </div>

            <p className="text-xs text-muted-foreground max-w-md whitespace-pre-line">
              {assessment.summary?.riskSummary ??
                "Risk summary will be available once assessment completes."}
            </p>
        </div>
      </div>

        {/* ================= Meta Card ================= */}
        <div className="rounded-lg border bg-background p-4 grid grid-cols-2 gap-4 text-sm">
          {/* Last Updated */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Last Updated</p>
              <p className="font-medium">
                {new Date(assessment.updatedAt).toLocaleString()}
              </p>
            </div>
            <div className="p-2 rounded-md bg-muted">
              <Clock className="h-4 w-4" />
            </div>
          </div>

          {/* Created By */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Created By</p>
              <p className="font-medium">
                {assessment.createdBy?.name ?? "Unknown"}
              </p>
            </div>
            <div className="p-2 rounded-md bg-muted">
              <User className="h-4 w-4" />
            </div>
          </div>

          {/* Mode */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Mode</p>
              <p className="font-medium capitalize">
                {assessment.mode}
              </p>
            </div>
            <div className="p-2 rounded-md bg-muted">
              <Cog className="h-4 w-4" />
            </div>
          </div>

          {/* Resources */}
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Resources</p>

              <ul className="space-y-1">
                {assessment.sources?.length ? (
                  assessment.sources.map((src) => (
                    <li key={src._id}>
                      <a
                        href={src.storage.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline text-xs"
                      >
                        {src.name}
                      </a>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-muted-foreground">
                    No files uploaded
                  </li>
                )}
              </ul>
            </div>
            <div className="p-2 rounded-md bg-muted">
              <Layers className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* ================= AI Generating Banner ================= */}
      {(() => {
        const isGenerating =
          assessment?.status === "draft" ||
          assessment?.status === "in_progress"
        
        return (
          isGenerating && (
            <div className="mb-4">
              <AIGeneratingBanner 
                status={assessment.status}
                assetsLoaded={assetsLoaded}
                requirementsLoaded={requirementsLoaded}
                questionsLoaded={questionsLoaded}
                complianceLoaded={complianceLoaded}
                aiProgress={assessment.aiProgress}
              />
            </div>
          )
        )
      })()}

      {/* ================= Tabs ================= */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requirements">Security Requirements</TabsTrigger>
          <TabsTrigger value="questions">Open Questions</TabsTrigger>
          <TabsTrigger value="summary">Security Summary</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="decision">Decision Tree</TabsTrigger>
        </TabsList>

        {/* -------- Overview -------- */}
        <TabsContent value="overview">
          <Overview 
            assessment={assessment}
            securityRequirementsCurrentCount={securityRequirements.length}
            openQuestionsCurrentCount={openQuestions.length}
            complianceFindingsCurrentCount={complianceFindings.length}
            complianceFindings={complianceFindings}
            allQuestionsAnswered={allQuestionsAnswered}
            allRequirementsReviewed={allRequirementsReviewed}
          />
        </TabsContent>


        {/* -------- Security Requirements -------- */}
        <TabsContent value="requirements">
          <SecurityRequirementsTable 
            securityRequirements={securityRequirements} 
            reviews={requirementReviews} 
            onStatusChange={handleRequirementStatusChange} />
        </TabsContent>

        {/* -------- Open Questions -------- */}
        <TabsContent value="questions">
          <OpenQuestionsTable
            openQuestions={openQuestions}
            assessmentId={assessmentId}
            onAnswerSaved={handleQuestionAnswerSaved}
          />
        </TabsContent>

        {/* -------- Security Summary -------- */}
        <TabsContent value="summary">
          {assessment?.summary && (
            <SecuritySummary summary={assessment.summary} />
          )}
        </TabsContent>

        {/* -------- Assets -------- */}
        <TabsContent value="assets">
          <AssetsTable sources={assessment.sources} />
        </TabsContent>


        {/* -------- Compliance -------- */}
        <TabsContent value="compliance">
          <ComplianceTable 
            complianceFindings={complianceFindings}
            securityRequirements={securityRequirements}
            onNavigateToRequirements={() => setActiveTab('requirements')}
          />
        </TabsContent>

        {/* -------- Decision Tree -------- */}
        <TabsContent value="decision">
          <DecisionTree 
            securityRequirementsCurrentCount={openRequirementsCount}
            openQuestionsCurrentCount={openQuestionsCount}
            complianceFindingsCount={complianceFindings.length}
            sourcesCount={assessment?.sources?.length || 0}
            requirements={securityRequirements}
            openQuestions={openQuestions}
            onNavigate={setActiveTab} 
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
