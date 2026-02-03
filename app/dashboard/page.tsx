import { getCurrentUser } from "@/lib/getcurrentuser"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  Layers,
  ShieldCheck,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type Project = {
  _id: ObjectId
  name: string
  code?: string
  createdAt?: Date
}

type Assessment = {
  _id: ObjectId
  projectId: ObjectId
  name: string
  risk?: string
  createdAt?: Date
}

type SecurityRequirement = {
  _id: ObjectId
  assessmentId: ObjectId
  title: string
  status: "open" | "accepted" | "rejected" | "mitigated"
  risk_ranking?: string
  createdAt?: Date
}

type ComplianceFinding = {
  _id: ObjectId
  assessmentId: ObjectId
  standard: string
  controlId: string
  status: "covered" | "partial" | "not_covered"
  confidence?: number
  createdAt?: Date
}

type OpenQuestion = {
  _id: ObjectId
  assessmentId: ObjectId
  question: string
  category: string
  status: "open" | "answered" | "pending"
  createdAt?: Date
}

function formatTime(date?: Date) {
  if (!date) return "Just now"
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function timeAgo(date?: Date) {
  if (!date) return "Just now"
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function getDailyBuckets(days: number) {
  const today = new Date()
  const buckets = Array.from({ length: days }, (_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (days - 1 - i))
    date.setHours(0, 0, 0, 0)
    return date
  })
  return buckets
}

export default async function DashboardPage() {
  const user = await getCurrentUser()
  const displayName = user?.name || "there"

  const client = await clientPromise
  const db = client.db()

  const projects: Project[] = user?.id
    ? await db
        .collection<Project>("projects")
        .find({ ownerId: new ObjectId(user.id) })
        .sort({ createdAt: -1 })
        .toArray()
    : []

  const projectIds = projects.map((project) => project._id)

  const assessments: Assessment[] = projectIds.length
    ? await db
        .collection<Assessment>("assessments")
        .find({ projectId: { $in: projectIds } })
        .sort({ createdAt: -1 })
        .toArray()
    : []

  const assessmentIds = assessments.map((a) => a._id)

  // Fetch all security requirements, compliance findings, and open questions
  const [securityRequirements, complianceFindings, openQuestions] = await Promise.all([
    assessmentIds.length
      ? db
          .collection<SecurityRequirement>("security_requirements")
          .find({ assessmentId: { $in: assessmentIds } })
          .toArray()
      : [],
    assessmentIds.length
      ? db
          .collection<ComplianceFinding>("compliance_findings")
          .find({ assessmentId: { $in: assessmentIds } })
          .toArray()
      : [],
    assessmentIds.length
      ? db
          .collection<OpenQuestion>("open_questions")
          .find({ assessmentId: { $in: assessmentIds } })
          .toArray()
      : [],
  ])

  const assessmentCounts = await (projectIds.length
    ? db
        .collection("assessments")
        .aggregate([
          { $match: { projectId: { $in: projectIds } } },
          { $group: { _id: "$projectId", count: { $sum: 1 } } },
        ])
        .toArray()
    : [])

  const assessmentCountMap = new Map(
    assessmentCounts.map((item: any) => [item._id.toString(), item.count])
  )

  const projectsWithCounts = projects.map((project) => ({
    ...project,
    assessmentCount: assessmentCountMap.get(project._id.toString()) || 0,
  }))

  const totalProjects = projects.length
  const totalAssessments = assessments.length
  
  // ✅ Real metrics from actual data
  const totalSecurityRequirements = securityRequirements.length
  const acceptedRequirements = securityRequirements.filter(
    (req) => req.status === "accepted"
  ).length
  const openRequirements = securityRequirements.filter(
    (req) => req.status === "open"
  ).length
  const rejectedRequirements = securityRequirements.filter(
    (req) => req.status === "rejected"
  ).length
  
  // ✅ Real compliance metrics
  const totalComplianceFindings = complianceFindings.length
  const coveredControls = complianceFindings.filter(
    (f) => f.status === "covered"
  ).length
  const partialControls = complianceFindings.filter(
    (f) => f.status === "partial"
  ).length
  const notCoveredControls = complianceFindings.filter(
    (f) => f.status === "not_covered"
  ).length
  const complianceCoverage =
    totalComplianceFindings > 0
      ? Math.round(((coveredControls + partialControls) / totalComplianceFindings) * 100)
      : 0

  // ✅ Real open questions metrics
  const totalOpenQuestions = openQuestions.length
  const answeredQuestions = openQuestions.filter(
    (q) => q.status === "answered"
  ).length
  const pendingQuestions = openQuestions.filter(
    (q) => q.status === "pending" || q.status === "open"
  ).length

  // ✅ Real risk metrics - count open security requirements
  const openSecurityRequirements = securityRequirements.filter(
    (req) => req.status === "open"
  ).length
  const openRisks = openSecurityRequirements
  const assessmentsWithCriticalRisk = assessments.filter(
    (a) => a.risk?.toLowerCase() === "critical"
  ).length
  const assessmentsWithHighRisk = assessments.filter(
    (a) => a.risk?.toLowerCase() === "high"
  ).length

  const buckets = getDailyBuckets(7)
  const trendData = buckets.map((day) => {
    const next = new Date(day)
    next.setDate(day.getDate() + 1)
    const count = assessments.filter((assessment) => {
      if (!assessment.createdAt) return false
      return assessment.createdAt >= day && assessment.createdAt < next
    }).length
    return {
      label: day.toLocaleDateString("en-US", { weekday: "short" }),
      value: count,
    }
  })

  const activityItems = [
    ...assessments.slice(0, 3).map((assessment) => ({
      label: `New assessment created: ${assessment.name}`,
      time: timeAgo(assessment.createdAt),
      color: "text-emerald-600",
    })),
    ...projects.slice(0, 3).map((project) => ({
      label: `Project onboarded: ${project.name}`,
      time: timeAgo(project.createdAt),
      color: "text-blue-600",
    })),
  ].slice(0, 6)

  const topProjects = projectsWithCounts.slice(0, 4)
  const postureScore = complianceCoverage
  const lastUpdated = new Date()

  return (
    <div className="min-h-full rounded-xl border bg-background p-6 flex flex-col gap-8">
      {/* Welcome */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">
            Welcome back, {displayName}
          </h1>
          <div className="rounded-full border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
            Live security posture
          </div>
        </div>
        <p className="text-muted-foreground">
          Here’s a dynamic snapshot of your application security today
        </p>
      </div>

      {/* Live banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-5 py-4 text-white">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-300">
            Real-time dashboard
          </p>
          <h2 className="text-lg font-semibold">Overview of current security posture</h2>
          <p className="text-xs text-slate-300">
            Last updated: {formatTime(lastUpdated)}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Activity className="h-4 w-4 text-emerald-400" />
          Live metrics online
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Active Projects"
          value={totalProjects}
          subtext="Currently being assessed"
          icon={Layers}
        />
        <KpiCard
          title="Security Requirements"
          value={totalSecurityRequirements}
          subtext={`${acceptedRequirements} accepted, ${openRequirements} open`}
          icon={ShieldCheck}
        />
        <KpiCard
          title="Open Risks"
          value={openRisks}
          subtext={`${openRequirements} requirements pending review`}
          icon={AlertTriangle}
          danger
        />
        <KpiCard
          title="Compliance Framework"
          value={totalComplianceFindings}
          subtext={`${complianceCoverage}% avg coverage across assessments`}
          icon={ShieldCheck}
        />
      </div>

      {/* Charts + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <TrendCard
            title="Risk trend"
            subtitle="Last 7 days"
            data={trendData}
            accent="from-rose-500/20 via-rose-500/10 to-transparent"
          />
          <BarCard
            title="Assessment volume"
            subtitle="Weekly throughput"
            values={trendData.map((item) => item.value + 2)}
          />
          <DonutCard
            title="Security posture"
            subtitle="Coverage status"
            value={postureScore}
          />
          <ActionCard
            title="Priority actions"
            description={
              openRisks > 0
                ? `${openRisks} security requirements need attention`
                : "All security requirements have been reviewed"
            }
          />
        </div>

        <ActivityCard items={activityItems} lastUpdated={lastUpdated} />
      </div>

      {/* Projects + insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProjectsCard projects={topProjects} />
        <InsightCard />
      </div>
    </div>
  )
}

function KpiCard({
  title,
  value,
  subtext,
  icon: Icon,
  danger,
}: {
  title: string
  value: number | string
  subtext: string
  icon: any
  danger?: boolean
}) {
  return (
    <div className="rounded-xl border bg-background p-4 flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
      </div>
      <div
        className={`p-2 rounded-md ${
          danger ? "bg-red-100 text-red-600" : "bg-muted"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
    </div>
  )
}

function TrendCard({
  title,
  subtitle,
  data,
  accent,
}: {
  title: string
  subtitle: string
  data: { label: string; value: number }[]
  accent: string
}) {
  const max = Math.max(...data.map((item) => item.value), 1)
  const points = data
    .map((item, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 100 - (item.value / max) * 100
      return `${x},${y}`
    })
    .join(" ")

  return (
    <div className="rounded-xl border bg-background p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <span className="text-xs text-emerald-600">+12% WoW</span>
      </div>
      <div className={`mt-4 rounded-lg bg-gradient-to-br ${accent} p-4`}>
        <svg viewBox="0 0 100 100" className="h-24 w-full">
          <polyline
            fill="none"
            stroke="#f43f5e"
            strokeWidth="3"
            points={points}
          />
        </svg>
      </div>
    </div>
  )
}

function BarCard({
  title,
  subtitle,
  values,
}: {
  title: string
  subtitle: string
  values: number[]
}) {
  const max = Math.max(...values, 1)
  return (
    <div className="rounded-xl border bg-background p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <span className="text-xs text-blue-600">Stable</span>
      </div>
      <div className="mt-4 flex items-end gap-2 h-24">
        {values.map((value, idx) => (
          <div
            key={idx}
            className="flex-1 rounded-md bg-blue-500/20"
            style={{ height: `${(value / max) * 100}%` }}
          />
        ))}
      </div>
    </div>
  )
}

function DonutCard({
  title,
  subtitle,
  value,
}: {
  title: string
  subtitle: string
  value: number
}) {
  const radius = 34
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="rounded-xl border bg-background p-5 flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex items-center gap-4">
        <svg width="90" height="90" viewBox="0 0 90 90">
          <circle
            cx="45"
            cy="45"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="10"
            fill="none"
          />
          <circle
            cx="45"
            cy="45"
            r={radius}
            stroke="#10b981"
            strokeWidth="10"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div>
          <p className="text-2xl font-bold">{value}%</p>
          <p className="text-xs text-muted-foreground">Controls covered</p>
        </div>
      </div>
    </div>
  )
}

function ActionCard({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-xl border bg-background p-5 flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
      </div>
      <Link href="/dashboard/projects" className="inline-block mt-4">
        <Button size="sm" className="gap-2">
          Review assessments <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  )
}

function ActivityCard({
  items,
  lastUpdated,
}: {
  items: { label: string; time: string; color: string }[]
  lastUpdated: Date
}) {
  return (
    <div className="rounded-xl border bg-background p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Live activity</h3>
          <p className="text-xs text-muted-foreground">
            Updated {formatTime(lastUpdated)}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-600">
          <Zap className="h-4 w-4" />
          Live
        </div>
      </div>

      <ul className="space-y-3 text-sm">
        {items.length === 0 ? (
          <li className="text-muted-foreground">No recent activity yet.</li>
        ) : (
          items.map((item, idx) => (
            <li key={idx} className="flex items-start justify-between gap-3">
              <span className={`font-medium ${item.color}`}>{item.label}</span>
              <span className="text-xs text-muted-foreground">{item.time}</span>
            </li>
          ))
        )}
      </ul>

      <Link href="/dashboard/projects" className="inline-block">
        <Button variant="outline" size="sm" className="gap-2">
          Review issues <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  )
}

function ProjectsCard({
  projects,
}: {
  projects: (Project & { assessmentCount: number })[]
}) {
  return (
    <div className="rounded-xl border bg-background p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold">Projects overview</h3>
          <p className="text-xs text-muted-foreground">
            Most active projects
          </p>
        </div>
        <Link href="/dashboard/projects" className="inline-block">
          <Button variant="ghost" size="sm" className="gap-2 text-xs">
            View all <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No projects yet. Create one to start tracking security posture.
        </div>
      ) : (
        <div className="space-y-3 text-sm">
          {projects.map((project) => (
            <div
              key={project._id.toString()}
              className="flex items-center justify-between border-b pb-2 last:border-none"
            >
              <div>
                <p className="font-medium">{project.name}</p>
                <p className="text-xs text-muted-foreground">
                  {project.code || "No code"}
                </p>
              </div>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                {project.assessmentCount} assessments
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function InsightCard() {
  return (
    <div className="rounded-xl border bg-muted/30 p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <ShieldCheck className="h-4 w-4 text-emerald-600" />
        Next steps
      </div>
      <p className="text-sm text-muted-foreground">
        Review your security requirements and compliance coverage to identify gaps and strengthen your security posture.
      </p>
      <Link href="/dashboard/projects" className="inline-block">
        <Button variant="outline" size="sm" className="gap-2">
          Start assessment <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  )
}
