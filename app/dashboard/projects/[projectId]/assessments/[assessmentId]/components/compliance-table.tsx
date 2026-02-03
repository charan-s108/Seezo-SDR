"use client"

import React, { useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select"
import { Filter } from "lucide-react"

type ComplianceFinding = {
  _id?: string
  standard: string
  controlId: string
  controlTitle?: string
  status: "covered" | "partial" | "not_covered"
  confidence: number
  justification?: string
  gap?: string
  linkedRequirementTitles?: string[]
  linkedRequirements?: Array<{
    id: string
    title: string
    status: string
    risk_ranking: string
  }>
}

export function ComplianceTable({
  complianceFindings,
  securityRequirements,
  onNavigateToRequirements,
}: {
  complianceFindings: ComplianceFinding[]
  securityRequirements?: any[]
  onNavigateToRequirements?: () => void
}) {
  const [filterStandard, setFilterStandard] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("standard")

  const normalize = (value: string) => value.toLowerCase().replace(/\s+/g, " ").trim()
  const normalizeId = (value: string) => normalize(value).replace(/[^a-z0-9.]/g, "")
  const stripStandardPrefix = (value: string) =>
    value.replace(/^(pci[-\s]?dss|pcidss|pci|iso\s?27001|iso|soc\s?2|soc2|gdpr|asvs|stride)\s*/i, "")

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
    if (!value) return []
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

  const matchesControlId = (controlId: string, items?: string[]) => {
    if (!items || items.length === 0) return false
    const controlIdNorm = normalize(controlId)
    const controlIdNormId = normalizeId(controlIdNorm)
    const controlIdBareId = normalizeId(stripStandardPrefix(controlIdNorm))
    if (!controlIdNormId) return false

    return items.some(item => {
      const itemNorm = normalize(item)
      const itemNormId = normalizeId(itemNorm)
      if (!itemNormId) return false
      return itemNormId === controlIdNormId ||
        itemNormId === controlIdBareId ||
        itemNormId.includes(controlIdBareId) ||
        controlIdBareId.includes(itemNormId) ||
        itemNorm.includes(controlIdNorm) ||
        controlIdNorm.includes(itemNorm)
    })
  }

  const getStandardLinkedRequirements = (finding: ComplianceFinding, reqs: any[]) => {
    const standardNormalized = normalize(finding.standard)
    return reqs.filter(req => {
      const r: any = req
      const standards: any = r.standards || r.applicableStandards || r.standardMappings || r.compliance || {}

      if (standardNormalized === "asvs") {
        const items = [
          ...extractStandardItems(r.asvs, "asvs"),
          ...extractStandardItems(standards, "asvs"),
          ...extractStandardItems(r.applicableStandards, "asvs"),
        ]
        return matchesControlId(finding.controlId, items)
      }
      if (standardNormalized === "stride") {
        const items = [
          ...extractStandardItems(r.stride, "stride"),
          ...extractStandardItems(standards, "stride"),
          ...extractStandardItems(r.applicableStandards, "stride"),
        ]
        return matchesControlId(finding.controlId, items)
      }
      if (standardNormalized === "iso27001" || standardNormalized === "iso 27001" || standardNormalized === "iso") {
        const items = [
          ...extractStandardItems(r.iso27001, "iso"),
          ...extractStandardItems(standards, "iso"),
          ...extractStandardItems(r.applicableStandards, "iso"),
        ]
        return matchesControlId(finding.controlId, items)
      }
      if (standardNormalized === "soc2" || standardNormalized === "soc 2") {
        const items = [
          ...extractStandardItems(r.soc2, "soc2"),
          ...extractStandardItems(standards, "soc2"),
          ...extractStandardItems(r.applicableStandards, "soc2"),
        ]
        return matchesControlId(finding.controlId, items)
      }
      if (standardNormalized === "pci-dss" || standardNormalized === "pci dss" || standardNormalized === "pci") {
        const items = [
          ...extractStandardItems(r.pciDss || r.pci, "pci"),
          ...extractStandardItems(standards, "pci"),
          ...extractStandardItems(r.applicableStandards, "pci"),
        ]
        return matchesControlId(finding.controlId, items)
      }
      if (standardNormalized === "gdpr") {
        const items = [
          ...extractStandardItems(r.gdpr, "gdpr"),
          ...extractStandardItems(standards, "gdpr"),
          ...extractStandardItems(r.applicableStandards, "gdpr"),
        ]
        return matchesControlId(finding.controlId, items)
      }
      return false
    })
  }

  // Match requirements to compliance findings
  const enrichedFindings = useMemo(() => {
    return complianceFindings.map(finding => {
      if (!securityRequirements) {
        return { ...finding, linkedRequirements: [] }
      }

      let linked: any[] = []

      // Strategy 1: Use linkedRequirementTitles if available
      if (finding.linkedRequirementTitles && finding.linkedRequirementTitles.length > 0) {
        linked = securityRequirements.filter(req => 
          finding.linkedRequirementTitles?.some(title => 
            req.title?.toLowerCase().includes(title.toLowerCase()) ||
            title.toLowerCase().includes(req.title?.toLowerCase())
          )
        )
      }

      // Strategy 2: Match by explicit standard mappings
      if (linked.length === 0) {
        linked = getStandardLinkedRequirements(finding, securityRequirements)
      }

      return {
        ...finding,
        linkedRequirements: linked.map(req => ({
          id: req._id || req.id,
          title: req.title,
          status: req.status || 'open',
          risk_ranking: req.risk_ranking || 'unknown'
        }))
      }
    })
  }, [complianceFindings, securityRequirements])

  // Filter and sort
  const filteredAndSorted = useMemo(() => {
    let results = enrichedFindings

    // Filter by standard
    if (filterStandard !== "all") {
      results = results.filter(f => f.standard === filterStandard)
    }

    // Filter by status
    if (filterStatus !== "all") {
      results = results.filter(f => f.status === filterStatus)
    }

    // Sort
    results = [...results].sort((a, b) => {
      switch (sortBy) {
        case "standard":
          return a.standard.localeCompare(b.standard)
        case "status":
          return a.status.localeCompare(b.status)
        case "confidence":
          return b.confidence - a.confidence
        default:
          return 0
      }
    })

    return results
  }, [enrichedFindings, filterStandard, filterStatus, sortBy])

  // Get unique standards
  const standards = useMemo(() => {
    return Array.from(new Set(complianceFindings.map(f => f.standard)))
  }, [complianceFindings])

  if (!complianceFindings?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No compliance data available.
      </p>
    )
  }

  return (
    <div className="w-full space-y-4">
      {/* Compliance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(() => {
          const byStandard = enrichedFindings.reduce((acc, f) => {
            if (!acc[f.standard]) {
              acc[f.standard] = { covered: 0, partial: 0, not_covered: 0, total: 0 }
            }
            acc[f.standard][f.status]++
            acc[f.standard].total++
            return acc
          }, {} as Record<string, any>)

          return Object.entries(byStandard).map(([standard, stats]) => {
            const coverage = Math.round((stats.covered / stats.total) * 100)
            return (
              <div key={standard} className="rounded-lg border bg-background p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">{standard}</h3>
                  <span className="text-2xl font-bold text-primary">{coverage}%</span>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Covered:</span>
                    <span className="text-green-600 font-medium">{stats.covered}/{stats.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Partial:</span>
                    <span className="text-yellow-600 font-medium">{stats.partial}/{stats.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Not Covered:</span>
                    <span className="text-red-600 font-medium">{stats.not_covered}/{stats.total}</span>
                  </div>
                </div>
                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500"
                    style={{ width: `${coverage}%` }}
                  />
                </div>
              </div>
            )
          })
        })()}
      </div>

      {/* Filters & Sort */}
      <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/30">
        <Filter className="h-4 w-4 text-muted-foreground" />
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Standard:</label>
          <Select value={filterStandard} onValueChange={setFilterStandard}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Standards</SelectItem>
              {standards.map(std => (
                <SelectItem key={std} value={std}>{std}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Status:</label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="covered">Covered</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="not_covered">Not Covered</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Sort by:</label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="confidence">Confidence</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto text-sm text-muted-foreground">
          Showing {filteredAndSorted.length} of {enrichedFindings.length} controls
        </div>
      </div>

      {/* Compliance Table */}
      <div className="w-full overflow-x-auto rounded-lg border">
      <Table className="w-full table-fixed full-border-table border-gray-200">
        {/* ================= Header ================= */}
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px] border text-center">Standard</TableHead>
            <TableHead className="w-[110px] border text-center">Control</TableHead>
            <TableHead className="w-[100px] border text-center">Status</TableHead>
            <TableHead className="w-[80px] border text-center">Confidence</TableHead>
            <TableHead className="w-[380px] border text-center">Details</TableHead>
          </TableRow>
        </TableHeader>

        {/* ================= Body ================= */}
        <TableBody>
          {filteredAndSorted.map((c, idx) => {
            const hasLinkedReqs = (c.linkedRequirements?.length || 0) > 0
            // Create unique key from control data
            const uniqueKey = `${c.standard}-${c.controlId}-${idx}`

            return (
              <React.Fragment key={uniqueKey}>
                {/* Main Row */}
                <TableRow className="align-top">
              {/* Standard */}
              <TableCell className="text-sm font-medium text-center whitespace-normal break-words border">
                {c.standard}
              </TableCell>

              {/* Control */}
              <TableCell className="text-sm text-center whitespace-normal break-words border">
                <div>{c.controlId}</div>
                {c.controlTitle && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {c.controlTitle}
                  </div>
                )}
              </TableCell>

              {/* Status */}
              <TableCell className="text-center border">
                <Badge
                  className={
                    c.status === "covered"
                      ? "bg-green-100 text-green-700"
                      : c.status === "partial"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }
                >
                  {c.status.replace("_", " ").toUpperCase()}
                </Badge>
              </TableCell>

              {/* Confidence */}
              <TableCell className="text-sm text-center border">
                <div className={
                  c.confidence >= 80 ? "text-green-600 font-medium" :
                  c.confidence >= 50 ? "text-yellow-600 font-medium" :
                  "text-red-600 font-medium"
                }>
                  {c.confidence}%
                </div>
              </TableCell>

              {/* Details */}
              <TableCell className="text-xs whitespace-normal break-words border">
                <div className="space-y-1">
                  {c.justification ? (
                    <p>
                      <span className="font-semibold">Justification:</span>{" "}
                      {c.justification}
                    </p>
                  ) : c.gap ? (
                    <p>
                      <span className="font-semibold">Gap:</span>{" "}
                      {c.gap}
                    </p>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                  {hasLinkedReqs && (
                    <div className="mt-2 pt-2 border-t">
                      <div className="text-xs font-semibold mb-1">Linked Requirements:</div>
                      <div className="space-y-1">
                        {c.linkedRequirements!.map((req, reqIdx) => (
                          <div key={reqIdx} className="text-xs">
                            • {req.title} <span className="text-muted-foreground">({req.status})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TableCell>
            </TableRow>
              </React.Fragment>
          )
        })}
        </TableBody>
      </Table>
    </div>
    </div>
  )
}
