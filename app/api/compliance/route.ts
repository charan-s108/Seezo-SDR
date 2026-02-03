import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import type { ComplianceFinding } from "@/db/collections/compliance"

/**
 * Calculate compliance coverage status based on linked requirements
 * covered: All linked requirements are accepted or mitigated
 * partial: Some linked requirements are accepted/mitigated
 * not_covered: No linked requirements are accepted/mitigated
 * 
 * Matching is based only on linkedRequirementTitles or explicit standards mappings.
 */
function calculateComplianceStatus(
  complianceFinding: any,
  requirements: Array<{ title: string; status: string }>
): "covered" | "partial" | "not_covered" {
  const linkedRequirementTitles = complianceFinding.linkedRequirementTitles || []
  const controlId = complianceFinding.controlId || ""
  const standard = complianceFinding.standard || ""

  let relevantReqs: Array<{ title: string; status: string }> = []

  const normalize = (value: string) => value.toLowerCase().replace(/\s+/g, " ").trim()
  const normalizeId = (value: string) => normalize(value).replace(/[^a-z0-9.]/g, "")
  const stripStandardPrefix = (value: string) =>
    value.replace(/^(pci[-\s]?dss|pcidss|pci|iso\s?27001|iso|soc\s?2|soc2|gdpr|asvs|stride)\s*/i, "")

  const controlIdNormalized = normalize(controlId)
  const controlIdNormalizedId = normalizeId(controlIdNormalized)
  const controlIdBareId = normalizeId(stripStandardPrefix(controlIdNormalized))
  const standardNormalized = normalize(standard)

  const matchesControlId = (items?: string[]) => {
    if (!items || items.length === 0 || !controlIdNormalizedId) return false
    return items.some(item => {
      const itemNorm = normalize(item)
      const itemNormId = normalizeId(itemNorm)
      if (!itemNormId) return false
      return itemNormId === controlIdNormalizedId ||
        itemNormId === controlIdBareId ||
        itemNormId.includes(controlIdBareId) ||
        controlIdBareId.includes(itemNormId) ||
        itemNorm.includes(controlIdNormalized) ||
        controlIdNormalized.includes(itemNorm)
    })
  }

  // Special matcher for STRIDE threat names (semantic, not ID-based)
  const matchesStrideThreat = (items?: string[]) => {
    if (!items || items.length === 0) return false
    const controlNorm = normalize(controlId)
    return items.some(item => {
      const itemNorm = normalize(item)
      // Direct threat name match (case-insensitive)
      return itemNorm === controlNorm || itemNorm.includes(controlNorm) || controlNorm.includes(itemNorm)
    })
  }

  const extractStandardItemsFromText = (text: string, standardKey: string): string[] => {
    const t = text.toLowerCase()
    if (!t) return []

    if (standardKey === "stride") {
      const items = [
        "spoofing",
        "tampering",
        "repudiation",
        "information disclosure",
        "denial of service",
        "elevation of privilege",
      ]
      return items.filter(item => t.includes(item))
    }

    if (standardKey === "asvs") {
      const matches = t.match(/v\d+(?:\.\d+)*/g) || []
      return matches.map(m => m.startsWith("v") ? m : `v${m}`)
    }

    if (standardKey === "pci") {
      if (!t.includes("pci")) return []
      return (t.match(/\d+(?:\.\d+)+/g) || [])
    }

    if (standardKey === "iso") {
      if (!t.includes("iso")) return []
      return (t.match(/a\.?\d+(?:\.\d+)*/gi) || []).map(m => m.replace(/\s+/g, ""))
    }

    if (standardKey === "soc2") {
      if (!t.includes("soc")) return []
      return (t.match(/cc\d+(?:\.\d+)*/gi) || []).map(m => m.replace(/\s+/g, ""))
    }

    if (standardKey === "gdpr") {
      if (!t.includes("gdpr") && !t.includes("article") && !t.includes("art")) return []
      return (t.match(/art\.?\s*\d+/gi) || []).map(m => m.replace(/\s+/g, ""))
    }

    return []
  }

  const extractStandardItems = (value: any, standardKey: string): string[] => {
    if (!value) {
      return []
    }
    if (Array.isArray(value)) {
      return value.flatMap(item => extractStandardItems(item, standardKey))
    }
    if (typeof value === "string") {
      return extractStandardItemsFromText(value, standardKey)
    }
    if (typeof value === "object") {
      const items: string[] = []
      for (const [key, val] of Object.entries(value)) {
        const keyNorm = normalize(key)
        if (
          (standardKey === "asvs" && keyNorm.includes("asvs")) ||
          (standardKey === "stride" && keyNorm.includes("stride")) ||
          (standardKey === "iso" && keyNorm.includes("iso")) ||
          (standardKey === "soc2" && keyNorm.includes("soc")) ||
          (standardKey === "pci" && keyNorm.includes("pci")) ||
          (standardKey === "gdpr" && keyNorm.includes("gdpr"))
        ) {
          items.push(...extractStandardItems(val, standardKey))
        }
      }
      return items
    }
    return []
  }

  // Strategy 1: Use linkedRequirementTitles if available
  if (linkedRequirementTitles.length > 0) {
    relevantReqs = requirements.filter(req =>
      linkedRequirementTitles.some((title: string) =>
        req.title?.toLowerCase().includes(title.toLowerCase()) ||
        title.toLowerCase().includes(req.title?.toLowerCase())
      )
    )
  } 

  // Strategy 1.5: Match by explicit standard mappings on requirements
  if (relevantReqs.length === 0 && controlIdNormalized && standardNormalized) {
    const isStrideControl = standardNormalized === "stride"
    
    relevantReqs = requirements.filter(req => {
      const r: any = req
      const standards: any = r.standards || r.applicableStandards || r.standardMappings || r.compliance || {}

      if (standardNormalized === "asvs") {
        const items = [
          ...extractStandardItems(r.asvs, "asvs"),
          ...extractStandardItems(standards, "asvs"),
          ...extractStandardItems(r.applicableStandards, "asvs"),
        ]
        return matchesControlId(items)
      }
      if (standardNormalized === "stride") {
        const items = [
          ...extractStandardItems(r.stride, "stride"),
          ...extractStandardItems(standards, "stride"),
          ...extractStandardItems(r.applicableStandards, "stride"),
          ...extractStandardItems(r.standards_mapping?.stride, "stride"),
        ]
        return matchesStrideThreat(items)
      }
      if (standardNormalized === "iso27001" || standardNormalized === "iso 27001" || standardNormalized === "iso") {
        const items = [
          ...extractStandardItems(r.iso27001, "iso"),
          ...extractStandardItems(standards, "iso"),
          ...extractStandardItems(r.applicableStandards, "iso"),
          ...extractStandardItems(r.standards_mapping?.iso27001, "iso"),
        ]
        return matchesControlId(items)
      }
      if (standardNormalized === "soc2" || standardNormalized === "soc 2") {
        const items = [
          ...extractStandardItems(r.soc2, "soc2"),
          ...extractStandardItems(standards, "soc2"),
          ...extractStandardItems(r.applicableStandards, "soc2"),
          ...extractStandardItems(r.standards_mapping?.soc2, "soc2"),
        ]
        return matchesControlId(items)
      }
      if (standardNormalized === "pci-dss" || standardNormalized === "pci dss" || standardNormalized === "pci") {
        const items = [
          ...extractStandardItems(r.pciDss || r.pci, "pci"),
          ...extractStandardItems(standards, "pci"),
          ...extractStandardItems(r.applicableStandards, "pci"),
          ...extractStandardItems(r.standards_mapping?.pciDss, "pci"),
        ]
        return matchesControlId(items)
      }
      if (standardNormalized === "gdpr") {
        const items = [
          ...extractStandardItems(r.gdpr, "gdpr"),
          ...extractStandardItems(standards, "gdpr"),
          ...extractStandardItems(r.applicableStandards, "gdpr"),
          ...extractStandardItems(r.standards_mapping?.gdpr, "gdpr"),
        ]
        return matchesControlId(items)
      }
      return false
    })
  }

  if (relevantReqs.length === 0) {
    return "not_covered"
  }

  // Filter out "not_applicable" requirements - they don't count toward coverage
  const applicableReqs = relevantReqs.filter(req => req.status !== "not_applicable")
  
  // If all matched requirements are "not_applicable", mark as covered
  if (applicableReqs.length === 0) {
    return "covered"
  }

  // Calculate coverage based on applicable requirements only
  const acceptedApplicable = applicableReqs.filter(
    req => req.status === "accepted" || req.status === "mitigated"
  ).length

  const acceptanceRate = applicableReqs.length > 0 ? acceptedApplicable / applicableReqs.length : 0

  // If 75% or more of relevant requirements are accepted, consider it covered
  if (acceptanceRate >= 0.75) {
    return "covered"
  } else if (acceptanceRate > 0) {
    return "partial"
  } else {
    return "not_covered"
  }
}

export async function GET(req: Request) {
  const client = await clientPromise
  const db = client.db()

  const { searchParams } = new URL(req.url)
  const assessmentId = searchParams.get("assessmentId")

  if (!assessmentId) {
    return NextResponse.json([], { status: 400 })
  }

  // Fetch assessment to get applicable standards
  const assessment = await db.collection("assessments").findOne({
    _id: new ObjectId(assessmentId)
  })

  let findings = await db
    .collection("compliance_findings")
    .find({ assessmentId: new ObjectId(assessmentId) })
    .sort({ createdAt: 1 })
    .toArray()

  // Filter by applicable standards if defined
  if (assessment?.applicableStandards && assessment.applicableStandards.length > 0) {
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "")
    const applicableNorm = assessment.applicableStandards.map((s: string) => normalize(s))
    
    findings = findings.filter((f: any) => {
      const standardNorm = normalize(f.standard || f.framework || "")
      return applicableNorm.some((norm: string) => norm === standardNorm || norm.includes(standardNorm) || standardNorm.includes(norm))
    })
  }

  return NextResponse.json(findings)
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { assessmentId, securityRequirements } = body

    if (!assessmentId || !securityRequirements) {
      return NextResponse.json(
        { error: "Missing assessmentId or securityRequirements" },
        { status: 400 }
      )
    }

    if (!ObjectId.isValid(assessmentId)) {
      return NextResponse.json(
        { error: "Invalid assessment ID" },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()
    const assessmentObjId = new ObjectId(assessmentId)

    // Fetch all compliance findings for this assessment
    const complianceFindings = await db
      .collection("compliance_findings")
      .find({ assessmentId: assessmentObjId })
      .toArray()

    if (complianceFindings.length === 0) {
      return NextResponse.json(
        { success: true, updated: 0 }
      )
    }

    // Update each compliance finding based on linked requirements
    let updatedCount = 0

    for (const finding of complianceFindings) {
      const newStatus = calculateComplianceStatus(
        finding,
        securityRequirements
      )

      if (newStatus !== finding.status) {
        await db
          .collection("compliance_findings")
          .updateOne(
            { _id: finding._id },
            {
              $set: {
                status: newStatus,
                updatedAt: new Date(),
              },
            }
          )
        updatedCount++
      }
    }

    return NextResponse.json({
      success: true,
      updated: updatedCount,
      total: complianceFindings.length,
    })
  } catch (error) {
    console.error("❌ Failed to update compliance findings:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
