export function openQuestionsPrompt(input: {
  assessmentName: string
  mode: "quick" | "full" | "compliance"
}) {
  return `
You are performing a Security Design Review for:
"${input.assessmentName}"

Your task is to generate OPEN QUESTIONS that must be answered by the system owner
to correctly assess security risks and compliance requirements.

Guidelines:
- Ask only questions that materially affect security decisions
- Avoid implementation-level questions
- Focus on business context, data sensitivity, trust boundaries, and regulatory scope
- Questions should be answerable by a developer or architect

Examples of good questions:
- "Does this system process regulated personal or financial data?"
- "Are any components exposed to the public internet?"
- "Is this system subject to PCI-DSS, SOC2, HIPAA, or GDPR?"

Return a JSON array with this structure ONLY:
[
  {
    "category": "Data Protection | Authentication | Network | Compliance | Operations",
    "question": "string",
    "tags": ["Automated"],
    "status": "open"
  }
]

Do NOT include answers.
Do NOT include markdown.
All questions are AI-generated, so tag should always be "Automated".
`
}
