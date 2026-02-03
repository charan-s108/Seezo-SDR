import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

type OverviewProps = {
  assessment: {
    summary?: {
      securityRequirementsCount?: number
      openQuestionsCount?: number
      complianceFindingsCount?: number
    }
    sources?: any[]
  }
  securityRequirementsCurrentCount?: number
  openQuestionsCurrentCount?: number
  complianceFindingsCurrentCount?: number
  complianceFindings?: any[]
  allQuestionsAnswered?: boolean
  allRequirementsReviewed?: boolean
}

export function Overview({ 
  assessment,
  securityRequirementsCurrentCount,
  openQuestionsCurrentCount,
  complianceFindingsCurrentCount,
  complianceFindings = [],
  allQuestionsAnswered = false,
  allRequirementsReviewed = false,
}: OverviewProps) {
  // Use current counts from DB, fallback to initial summary counts
  const reqCount = securityRequirementsCurrentCount ?? assessment.summary?.securityRequirementsCount ?? 0
  const questionCount = openQuestionsCurrentCount ?? assessment.summary?.openQuestionsCount ?? 0
  const complianceCount = complianceFindingsCurrentCount ?? assessment.summary?.complianceFindingsCount ?? 0
  const assetCount = assessment.sources?.length ?? 0

  // Calculate compliance coverage (covered + partial both count towards coverage)
  const complianceCoverage = complianceFindings.length > 0
    ? Math.round((complianceFindings.filter((f: any) => f.status === 'covered' || f.status === 'partial').length / complianceFindings.length) * 100)
    : 0

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <OverviewItem
            title="Security Requirements"
            count={reqCount}
            description="Identified controls, gaps, and risks"
            badge={allRequirementsReviewed ? "Reviewed" : reqCount ? "Available" : "None"}
            badgeVariant={reqCount ? "default" : "secondary"}
          />

          <OverviewItem
            title="Open Questions"
            count={questionCount}
            description="Assumptions requiring clarification"
            badge={allQuestionsAnswered ? "Answered" : "Action needed"}
            badgeVariant={allQuestionsAnswered ? "secondary" : "destructive"}
          />

          <OverviewItem
            title="Compliance Coverage"
            count={complianceCount}
            description="Mapped controls to standards"
            badge={complianceCount ? `${complianceCoverage}% Covered` : "Not assessed"}
            badgeVariant={complianceCoverage >= 80 ? "default" : complianceCoverage >= 50 ? "secondary" : "destructive"}
            progress={complianceCoverage}
          />

          <OverviewItem
            title="Assets Reviewed"
            count={assetCount}
            description="Diagrams, docs, and configs analyzed"
            badge={assetCount ? "Analyzed" : "Missing"}
            badgeVariant={assetCount ? "default" : "secondary"}
          />
        </CardContent>
      </Card>
    </div>
  )
}

/* ================= Overview Item ================= */

function OverviewItem({
  title,
  count,
  description,
  badge,
  badgeVariant,
  progress,
}: {
  title: string
  count: number
  description: string
  badge: string
  badgeVariant: "default" | "secondary" | "destructive"
  progress?: number
}) {
  return (
    <div className="rounded-md border p-3 space-y-1.5">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">{title}</h4>
        <Badge variant={badgeVariant} className="text-xs">
          {badge}
        </Badge>
      </div>

      <div className="text-xl font-semibold">{count}</div>

      {progress !== undefined && (
        <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}

      <Separator />

      <p className="text-xs text-muted-foreground">
        {description}
      </p>
    </div>
  )
}
