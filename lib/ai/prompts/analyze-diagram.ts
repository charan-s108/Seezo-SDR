export function diagramAnalysisPrompt(input: {
  assessmentName: string
  fileName?: string
}) {
  return `
You are a senior application security architect.

An architecture diagram ${
    input.fileName ? `(${input.fileName})` : ""
  } is provided.

Analyze the diagram and return STRICT JSON ONLY in the following format:

{
  "components": [
    {
      "name": string,
      "type": string,
      "description": string,
      "trustLevel": "trusted" | "untrusted"
    }
  ],
  "dataFlows": [
    {
      "from": string,
      "to": string,
      "data": string,
      "protocol": string,
      "encrypted": boolean
    }
  ],
  "trustBoundaries": string[],
  "externalExposures": string[],
  "assumptions": string[]
}

Rules:
- Do NOT include markdown
- Do NOT include explanations
- Return valid JSON only
`
}
