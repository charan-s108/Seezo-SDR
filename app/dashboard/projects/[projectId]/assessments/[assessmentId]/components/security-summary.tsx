import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { AssessmentSummary } from "@/types/assessment"

export function SecuritySummary({
  summary,
}: {
  summary?: AssessmentSummary
}) {
  if (!summary) {
    return (
      <p className="text-sm text-muted-foreground">
        Security summary not available.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm whitespace-pre-line">
          {summary.executiveSummary}
        </p>
      </div>
    </div>
  )
}
