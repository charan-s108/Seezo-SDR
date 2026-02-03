"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ClipboardList, FileText, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { StatsCard } from "@/components/projects/stats-card"

import ProjectBreadcrumb from "@/components/navigation/project-breadcrumb"
import EmptyAssessment from "@/components/assessments/empty-assessments"
import AssessmentsTable from "@/components/assessments/assessments-table"

import type { Project } from "@/types/project"
import type { Assessment, SourceType } from "@/types/assessment"

type AssessmentWithStats = Assessment & {
  securityRequirementsCount: number
  openQuestionsCount: number
  sourceTypes: SourceType[]
}

export default function AssessmentsPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.projectId as string

  const [project, setProject] = useState<Project | null>(null)
  const [assessments, setAssessments] = useState<AssessmentWithStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!projectId) return
    fetchProject()
    fetchAssessments()
  }, [projectId])

  useEffect(() => {
    if (!projectId) return

    const hasRunning = assessments.some(
      (a) => a.status === "in_progress" || a.status === "draft"
    )

    if (!hasRunning) return

    const interval = setInterval(() => {
      fetchAssessments()
    }, 5000)

    return () => clearInterval(interval)
  }, [projectId, assessments])

  async function fetchProject() {
    const res = await fetch(`/api/projects/${projectId}`)
    if (!res.ok) return
    const data = await res.json()
    setProject(data.project)
  }

  async function fetchAssessments() {
    setLoading(true)
    try {
      const res = await fetch(`/api/assessments?projectId=${projectId}`)
      if (!res.ok) throw new Error("Failed to fetch")

      const data = await res.json()

      setAssessments(
        (data.assessments || []).map((a: any) => ({
          ...a,
          securityRequirementsCount:
            a.securityRequirementsCount ?? a.summary?.securityRequirementsCount ?? 0,
          openQuestionsCount:
            a.openQuestionsCount ?? a.summary?.openQuestionsCount ?? 0,
          sourceTypes:
            a.sourceTypes ??
            Array.from(
              new Set((a.sources ?? []).map((s: { type: SourceType }) => s.type))
            ),
        }))
      )
    } finally {
      setLoading(false)
    }
  }

  const totalAssessments = assessments.length
  const totalSources = assessments.reduce(
    (sum, a) => sum + (a.sourceTypes.length ?? 0),
    0
  )

  const createPath = `/dashboard/projects/${projectId}/assessments/new-assessment`

  return (
    <div className="min-h-full rounded-xl border bg-background p-6 flex flex-col gap-8">
      <ProjectBreadcrumb projectName={project?.name} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Assessments</h1>

        <Link href={createPath}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Assessment
          </Button>
        </Link>
      </div>

      {/* Stats */}
      {assessments.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <StatsCard
            title="Total Assessments"
            value={totalAssessments}
            icon={ClipboardList}
          />
          <StatsCard
            title="Total Sources"
            value={totalSources}
            icon={FileText}
          />
        </div>
      )}

      {/* Table / Empty */}
      <div className="border rounded-xl bg-background">
        {loading ? (
          <p className="p-6 text-sm text-muted-foreground">
            Loading assessments…
          </p>
        ) : assessments.length === 0 ? (
          <div className="p-6">
            <EmptyAssessment onCreate={() => router.push(createPath)} />
          </div>
        ) : (
          <AssessmentsTable assessments={assessments} />
        )}
      </div>
    </div>
  )
}
