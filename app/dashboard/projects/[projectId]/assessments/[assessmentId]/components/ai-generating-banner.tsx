import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react"

type Props = {
  status?: "draft" | "in_progress" | "completed"
  assetsLoaded?: boolean
  requirementsLoaded?: boolean
  questionsLoaded?: boolean
  complianceLoaded?: boolean
  aiProgress?: {
    currentStep?: "assets" | "requirements" | "questions" | "compliance" | "summary" | "done"
    completed?: {
      assets?: boolean
      requirements?: boolean
      questions?: boolean
      compliance?: boolean
    }
  }
}

const steps = [
  { key: "assets", label: "Analyzing assets" },
  { key: "requirements", label: "Generating security requirements" },
  { key: "questions", label: "Identifying open questions" },
  { key: "compliance", label: "Mapping compliance controls" },
]

export function AIGeneratingBanner({ 
  status,
  assetsLoaded = false,
  requirementsLoaded = false,
  questionsLoaded = false,
  complianceLoaded = false,
  aiProgress,
}: Props) {
    const completedFromProgress = aiProgress?.completed ?? {}

    // Determine which steps are complete based on aiProgress, fallback to API data availability
    const completedSteps: { [key: string]: boolean } = {
      assets: completedFromProgress.assets ?? assetsLoaded,
      requirements: completedFromProgress.requirements ?? requirementsLoaded,
      questions: completedFromProgress.questions ?? questionsLoaded,
      compliance: completedFromProgress.compliance ?? complianceLoaded,
    }

    // Find the current step (first incomplete step)
    const currentStepIndex = steps.findIndex(step => !completedSteps[step.key])
    const currentStep = currentStepIndex === -1 ? steps.length : currentStepIndex

  return (
    <Card className="border-dashed border-primary/40 bg-primary/5">
      <CardContent className="space-y-4 py-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Sparkles className="h-6 w-6 text-primary" />
            <Loader2 className="absolute -right-2 -bottom-2 h-4 w-4 animate-spin text-primary" />
          </div>

          <div>
            <p className="font-medium text-sm">
              AI is generating your security assessment
            </p>
            <p className="text-xs text-muted-foreground">
              This may take a few moments
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {steps.map((step, idx) => {
            const done = completedSteps[step.key]
            const active = idx === currentStep && status === "in_progress"

            return (
              <div
                key={step.key}
                className="flex items-center gap-2 text-xs"
              >
                {done ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : active ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                <div className="h-4 w-4 rounded-full border border-muted-foreground/40" />
                )}

                <span
                  className={
                    done
                      ? "text-foreground font-medium"
                      : active
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }
                >
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
