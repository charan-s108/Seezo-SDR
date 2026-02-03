export function securityRequirementsPrompt(isReevaluation: boolean = false) {
  const basePrompt = `
Based on the analyzed system design, generate security requirements.

Each requirement MUST include:
- title
- category (Auth, Network, Data, IAM, Logging, Secrets, Infra)
- risk ranking (low|medium|high)
- context
- identified gap
- threat
- remediation
- standards mapping fields as arrays of strings:
  - asvs: ["V2", "V3.4", ...]
  - stride: ["Spoofing", "Tampering", "Repudiation", "Information Disclosure", "Denial of Service", "Elevation of Privilege"]
  - iso27001: ["A.9.2.3", ...]
  - soc2: ["CC6.1", ...]
  - pciDss: ["3.2.1", ...]
  - gdpr: ["Art.32", ...]

Respond ONLY as JSON array.
`

  if (isReevaluation) {
    return `${basePrompt}

IMPORTANT: This is a RE-EVALUATION. Consider the user's answers and decisions in your analysis:
- User has answered questions about the system
- User has reviewed and changed status of requirements (open/accepted/mitigated/not_applicable)
- Provide refined and more detailed requirements based on this additional context
- If a requirement was previously identified and user marked it as mitigated, still include it but note the mitigation status
- Add any new requirements that become apparent from the user's answers`
  }

  return basePrompt
}
