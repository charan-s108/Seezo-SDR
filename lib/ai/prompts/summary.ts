type SecuritySummaryPromptInput = {
  assessmentName: string
  architecture: any
  securityRequirements: any[]
  openQuestions: any[]
  complianceFindings: any[]
}

export function securitySummaryPrompt({
  assessmentName,
  architecture,
  securityRequirements,
  openQuestions,
  complianceFindings,
}: SecuritySummaryPromptInput) {
  return `
You are a senior security architect.

Return ONLY a valid JSON object with EXACTLY these fields:

{
  "riskSummary": string,
  "executiveSummary": string
}

STRICT RULES (DO NOT VIOLATE):

riskSummary:
- EXACTLY ONE sentence
- Max 25 words
- Describe the MAIN risk scenario (what can go wrong + why)
- NO commas lists, NO explanations, NO recommendations
- Plain English, no jargon

executiveSummary:
- Detailed executive-level explanation
- Can be long and descriptive
- Multiple paragraphs allowed

DO NOT:
- Add headings
- Add markdown
- Add extra fields
- Return anything outside JSON

========================
CONTEXT
========================

Assessment Name:
${assessmentName}

Architecture:
${JSON.stringify(architecture, null, 2)}

Security Requirements:
${JSON.stringify(securityRequirements, null, 2)}

Open Questions:
${JSON.stringify(openQuestions, null, 2)}

Compliance Findings:
${JSON.stringify(complianceFindings, null, 2)}

RETURN ONLY JSON.
`
}
