import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, CheckCircle, XCircle, FileCheck, ArrowRight } from "lucide-react"

type DecisionTreeProps = {
  securityRequirementsCurrentCount?: number
  openQuestionsCurrentCount?: number
  complianceFindingsCount?: number
  sourcesCount?: number
  requirements?: any[]
  openQuestions?: any[]
  onNavigate: (tab: string) => void
}

export function DecisionTree({ 
  securityRequirementsCurrentCount = 0,
  openQuestionsCurrentCount = 0,
  complianceFindingsCount = 0,
  sourcesCount = 0,
  requirements = [],
  openQuestions = [],
  onNavigate 
}: DecisionTreeProps) {
  const openQuestionsCount = openQuestionsCurrentCount
  const requirementsCount = securityRequirementsCurrentCount
  const complianceChecked = complianceFindingsCount
  const sourcesAnalyzed = sourcesCount

  const blocked = openQuestionsCurrentCount > 0
  const needsAction = !blocked && requirementsCount > 0

  // Group requirements by category to extract key decisions
  // Include answered open questions as validation evidence
  const decisionCategories = extractDecisions(requirements, openQuestions)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">
          Decision Validation
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          User-validated security decisions based on accepted requirements and answered questions
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ================= Overall Status ================= */}
        <DecisionStatus
          blocked={blocked}
          needsAction={needsAction}
        />

        <Separator />

        {/* ================= Decision Signals ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">    
            <SignalCard
            title="Security Findings"
            value={requirementsCount}
            status={requirementsCount > 0 ? "warn" : "pass"}
            description="Controls or gaps requiring mitigation"
            onClick={() => onNavigate("requirements")}
            />
            
            <SignalCard
            title="Open Questions"
            value={openQuestionsCount}
            status={openQuestionsCount > 0 ? "blocked" : "pass"}
            description="Unanswered assumptions that block decisions"
            onClick={() => onNavigate("questions")}
            />
        </div>

        <Separator />

        {/* ================= Next Steps ================= */}
        <NextSteps
          blocked={blocked}
          needsAction={needsAction}
        />

        <Separator />

        {/* ================= Key Security Decisions ================= */}
        {decisionCategories.length > 0 && (
          <>
            <div>
              <h4 className="text-sm font-medium mb-2">User-Validated Security Decisions</h4>
              <p className="text-xs text-muted-foreground mb-4">
                Based on requirements you accepted. Shows why each decision matters, what breaks if delayed.
              </p>
              <div className="space-y-3">
                {decisionCategories.map((decision, idx) => (
                  <DecisionCard key={idx} decision={decision} onNavigate={onNavigate} />
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

/* ================= Components ================= */

function DecisionStatus({
  blocked,
  needsAction,
}: {
  blocked: boolean
  needsAction: boolean
}) {
  if (blocked) {
    return (
      <StatusBanner
        icon={<XCircle className="text-red-600 h-5 w-5" />}
        title="Decision Blocked"
        message="Critical information is missing. Resolve open questions before proceeding."
        variant="destructive"
      />
    )
  }

  if (needsAction) {
    return (
      <StatusBanner
        icon={<AlertTriangle className="text-yellow-600 h-5 w-5" />}
        title="Decision Requires Action"
        message="Security or compliance actions are required before final approval."
        variant="secondary"
      />
    )
  }

  return (
    <StatusBanner
      icon={<CheckCircle className="text-green-600 h-5 w-5" />}
      title="Ready for Decision"
      message="No blocking issues identified. Proceed with approval or risk acceptance."
      variant="default"
    />
  )
}

function StatusBanner({
  icon,
  title,
  message,
  variant,
}: {
  icon: React.ReactNode
  title: string
  message: string
  variant: "default" | "secondary" | "destructive"
}) {
  return (
    <div className="flex items-start gap-3">
      {icon}
      <div>
        <Badge variant={variant}>{title}</Badge>
        <p className="text-xs text-muted-foreground mt-1">
          {message}
        </p>
      </div>
    </div>
  )
}

function SignalCard({
  title,
  value,
  description,
  status,
  onClick,
}: {
  title: string
  value: number
  description: string
  status: "pass" | "warn" | "blocked"
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-md border p-4 space-y-2 hover:bg-muted transition"
    >
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{title}</div>
        <SignalIcon status={status} />
      </div>

      <div className="text-2xl font-semibold">
        {value}
      </div>

      <p className="text-xs text-muted-foreground">
        {description}
      </p>
    </button>
  )
}

function SignalIcon({ status }: { status: "pass" | "warn" | "blocked" }) {
  if (status === "pass") {
    return <CheckCircle className="h-4 w-4 text-green-600" />
  }
  if (status === "warn") {
    return <AlertTriangle className="h-4 w-4 text-yellow-600" />
  }
  return <XCircle className="h-4 w-4 text-red-600" />
}

function NextSteps({
  blocked,
  needsAction,
}: {
  blocked: boolean
  needsAction: boolean
}) {
  let text = "No further actions required."

  if (blocked) {
    text =
      "Answer the open questions to unblock the assessment."
  } else if (needsAction) {
    text =
      "Review security findings and decide on mitigation or risk acceptance."
  }

  return (
    <div className="text-sm">
      <div className="font-medium mb-1">
        Recommended Next Step
      </div>
      <p className="text-muted-foreground">
        {text}
      </p>
    </div>
  )
}



/* ================= Decision Extraction & Cards ================= */

interface Decision {
  category: string
  question: string
  answer: string
  evidence: string[]
  answeredQuestions: Array<{
    question: string
    answer: string
  }>
  riskContext: {
    whyNow: string
    whatBreaks: string
    riskReduced: string
  }
  requirements: Array<{
    title: string
    risk: string
    reasoning: string
  }>
}

function extractDecisions(requirements: any[], openQuestions: any[] = []): Decision[] {
  // ONLY include accepted requirements - these are user-validated decisions
  const acceptedRequirements = requirements.filter(req => req.status?.toLowerCase() === 'accepted')
  
  // Include answered open questions for validation context
  const answeredQuestions = openQuestions.filter(q => q.answered === true || q.status === 'answered')
  
  // Group requirements by category
  const categoryGroups: { [key: string]: any[] } = {}
  
  acceptedRequirements.forEach(req => {
    const cat = req.category || 'Other'
    if (!categoryGroups[cat]) categoryGroups[cat] = []
    categoryGroups[cat].push(req)
  })

  // Also collect categories from answered questions
  answeredQuestions.forEach((q: any) => {
    const cat = q.category
    if (cat && !categoryGroups[cat]) {
      categoryGroups[cat] = [] // Initialize empty array if no requirements
    }
  })

  const decisions: Decision[] = []

  // Map categories to security questions
  const categoryQuestions: { [key: string]: string } = {
    'Auth': 'Does this system require user authentication?',
    'Authentication': 'Does this system require user authentication?',
    'Data': 'Does this system handle sensitive data?',
    'Data Protection': 'Does this system handle sensitive data?',
    'Network': 'Is this system exposed to untrusted networks?',
    'IAM': 'Does this system require access control?',
    'Logging': 'Does this system need audit logging?',
    'Secrets': 'Does this system manage sensitive credentials?',
    'Infra': 'Does this infrastructure need hardening?'
  }

  for (const [category, reqs] of Object.entries(categoryGroups)) {
    // Find answered questions related to this category
    const relatedAnsweredQuestions = answeredQuestions.filter(
      (q: any) => q.category?.toLowerCase() === category.toLowerCase()
    )

    // Skip if no requirements AND no answered questions
    if (reqs.length === 0 && relatedAnsweredQuestions.length === 0) continue

    const highRiskCount = reqs.filter((r: any) => r.risk_ranking === 'high').length
    const criticalRiskCount = reqs.filter((r: any) => r.risk_ranking === 'critical').length

    const evidence: string[] = []
    
    if (reqs.length > 0) {
      evidence.push(`User accepted ${reqs.length} ${category} requirement${reqs.length > 1 ? 's' : ''}`)
      if (highRiskCount > 0) evidence.push(`${highRiskCount} high-risk control${highRiskCount > 1 ? 's' : ''} approved`)
      if (criticalRiskCount > 0) evidence.push(`${criticalRiskCount} critical control${criticalRiskCount > 1 ? 's' : ''} approved`)
    }
    
    if (relatedAnsweredQuestions.length > 0) {
      evidence.push(`User answered ${relatedAnsweredQuestions.length} validation question${relatedAnsweredQuestions.length > 1 ? 's' : ''}`)
    }

    decisions.push({
      category,
      question: categoryQuestions[category] || `Does this system need ${category} controls?`,
      answer: 'YES (User Validated)',
      evidence: evidence,
      answeredQuestions: relatedAnsweredQuestions.map((q: any) => ({
        question: q.question,
        answer: q.userAnswer || q.answer || ''
      })),
      riskContext: {
        whyNow: reqs[0]?.context || relatedAnsweredQuestions[0]?.context || `${category} controls are essential for this system's security posture`,
        whatBreaks: reqs[0]?.threat || `Without ${category} controls, system is vulnerable to attacks`,
        riskReduced: reqs[0]?.remediation || `Implementing ${category} controls mitigates identified threats`
      },
      requirements: reqs.slice(0, 3).map((r: any) => ({
        title: r.title,
        risk: r.risk_ranking || 'medium',
        reasoning: r.identified_gap || r.context || 'Security control required'
      }))
    })
  }

  return decisions.slice(0, 10) // Show top 10 decision categories (increased to show more)
}

function DecisionCard({ decision, onNavigate }: { decision: Decision; onNavigate: (tab: string) => void }) {
  const [expanded, setExpanded] = React.useState(false)

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition"
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-left">
            <div className="text-sm font-medium">{decision.question}</div>
            <div className="text-xs text-green-600 font-semibold mt-0.5">{decision.answer}</div>
          </div>
        </div>
        <Badge variant="secondary">{decision.category}</Badge>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="p-4 space-y-4 bg-background">
          {/* Evidence */}
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-2">USER ACTIONS TAKEN:</div>
            <ul className="space-y-1">
              {decision.evidence.map((ev, i) => (
                <li key={i} className="text-xs flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>{ev}</span>
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          {/* Answered Validation Questions */}
          {decision.answeredQuestions.length > 0 && (
            <>
              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-2">
                  VALIDATION QUESTIONS ANSWERED ({decision.answeredQuestions.length}):
                </div>
                <div className="space-y-2">
                  {decision.answeredQuestions.map((qa, i) => (
                    <div key={i} className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                      <div className="font-medium text-blue-900 mb-1">{qa.question}</div>
                      <div className="text-blue-800 italic">"{qa.answer.substring(0, 100)}{qa.answer.length > 100 ? '...' : ''}"</div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* Risk Context */}
          <div className="space-y-3">
            <div>
              <div className="text-xs font-semibold text-blue-600 mb-1">🎯 WHY IT MATTERS NOW:</div>
              <div className="text-xs text-muted-foreground pl-4">{decision.riskContext.whyNow}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-red-600 mb-1">⚠️ WHAT BREAKS IF DELAYED:</div>
              <div className="text-xs text-muted-foreground pl-4">{decision.riskContext.whatBreaks}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-green-600 mb-1">🛡️ RISK REDUCED:</div>
              <div className="text-xs text-muted-foreground pl-4">{decision.riskContext.riskReduced}</div>
            </div>
          </div>

          <Separator />

          {/* Requirements Generated */}
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-2">
              ACCEPTED REQUIREMENTS ({decision.requirements.length}):
            </div>
            <div className="space-y-2">
              {decision.requirements.map((req, i) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-muted/50 rounded text-xs">
                  <span className={`font-semibold ${getRiskColor(req.risk)}`}>
                    {req.risk.toUpperCase()}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium">{req.title}</div>
                    <div className="text-muted-foreground mt-0.5">→ {req.reasoning}</div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => onNavigate('requirements')}
              className="mt-2 text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              View all {decision.category} requirements
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
