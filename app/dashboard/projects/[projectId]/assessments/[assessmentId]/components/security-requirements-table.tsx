import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

/* ================= Types ================= */

export type SecurityRequirement = {
  id: string
  title: string
  category: string
  risk_ranking: "low" | "medium" | "high" | "critical"
  status?: RequirementReviewStatus 
  context?: string
  identified_gap?: string
  threat?: string
  remediation?: string
  applicable_standards?: string[]
  asvs?: string[]
  stride?: string[]
  iso27001?: string[]
  soc2?: string[]
  pciDss?: string[]
  gdpr?: string[]
  standards?: Record<string, string[] | string>
  applicableStandards?: Record<string, string[] | string>
  standards_mapping?: {
    asvs?: string[]
    stride?: string[]
    iso27001?: string[]
    soc2?: string[]
    pciDss?: string[]
    gdpr?: string[]
  }
}

/* User decision layer */
export type RequirementReviewStatus =
  | "open"
  | "accepted"
  | "mitigated"
  | "not_applicable"

export type SecurityRequirementReview = {
  requirementId: string
  status: RequirementReviewStatus
}

/* ================= Props ================= */

export function SecurityRequirementsTable({
  securityRequirements,
  reviews,
  onStatusChange,
}: {
  securityRequirements: SecurityRequirement[]
  reviews: SecurityRequirementReview[]
  onStatusChange: (
    requirementId: string,
    status: RequirementReviewStatus
  ) => void
}) {
  if (!securityRequirements?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No security requirements found.
      </p>
    )
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border">
    <Table className="w-full table-fixed full-border-table border-gray-200">
        {/* ================= Header ================= */}
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30px] border text-center">#</TableHead>
            <TableHead className="w-[140px] border text-center">Title</TableHead>
            <TableHead className="w-[80px] border text-center">Category</TableHead>
            <TableHead className="w-[80px] border text-center">Ranking</TableHead>
            <TableHead className="w-[270px] border text-center">Description</TableHead>
            <TableHead className="w-[190px] border text-center">Remediation</TableHead>
            <TableHead className="w-[140px] border text-center">Status</TableHead>
          </TableRow>
        </TableHeader>

        {/* ================= Body ================= */}
        <TableBody>
        {securityRequirements.map((req, idx) => {
        const requirementId = req.id ?? (req as any)._id

        const review =
            reviews.find(
            (r) => r.requirementId === requirementId
            ) ?? { status: req.status ?? "open" }

            return (
            <TableRow key={requirementId} className="align-top">
                <TableCell className="text-sm border text-center">
                  {idx + 1}
                </TableCell>

                {/* -------- Title + Standards -------- */}
                <TableCell className="space-y-2 break-words whitespace-normal border">
                  <div className="font-medium text-sm text-center">
                    {req.title}
                  </div>

                  {getRequirementStandards(req).length ? (
                    <div className="flex flex-wrap gap-1 justify-center">
                      {Array.from(
                        new Set(
                          getRequirementStandards(req).map(
                            normalizeStandard
                          )
                        )
                      ).map((std) => (
                        <Badge
                          key={`${req.id}-${std}`}
                          variant="secondary"
                          className="text-[10px] px-2 py-0.5"
                        >
                          {std}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </TableCell>

                <TableCell className="text-sm text-center break-words whitespace-normal border">
                  {req.category}
                </TableCell>

                {/* -------- Risk -------- */}
                <TableCell className="text-center border">
                  <Badge
                    className={getRiskBadgeClass(
                      req.risk_ranking
                    )}
                  >
                    {req.risk_ranking.toUpperCase()}
                  </Badge>
                </TableCell>

                {/* -------- Description -------- */}
                <TableCell className="text-xs break-words whitespace-normal border">
                  <div className="space-y-2">
                    {req.context && (
                      <p>
                        <span className="font-semibold">
                          Context:
                        </span>{" "}
                        {req.context}
                      </p>
                    )}
                    {req.identified_gap && (
                      <p>
                        <span className="font-semibold">
                          Gap:
                        </span>{" "}
                        {req.identified_gap}
                      </p>
                    )}
                    {req.threat && (
                      <p>
                        <span className="font-semibold">
                          Threat:
                        </span>{" "}
                        {req.threat}
                      </p>
                    )}
                  </div>
                </TableCell>

                {/* -------- Remediation -------- */}
                <TableCell className="text-xs break-words whitespace-normal border">
                  {req.remediation ?? "-"}
                </TableCell>

                {/* -------- Status (Editable) -------- */}
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Select
                      value={review.status}
                      onValueChange={(value) =>
                        onStatusChange(
                          requirementId,
                          value as RequirementReviewStatus
                        )
                      }
                    >
                      <SelectTrigger
                        className={`h-8 text-xs capitalize ${getStatusSelectClass(
                          review.status
                        )}`}
                      >
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="mitigated">Mitigated</SelectItem>
                        <SelectItem value="not_applicable">
                          Not Applicable
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

/* ================= Helpers ================= */

function normalizeStandard(std: string): string {
  const s = std.toUpperCase()
  if (s.includes("ISO27001")) return "ISO27001"
  if (s.includes("STRIDE")) return "STRIDE"
  if (s.includes("ASVS")) return "ASVS"
  if (s.includes("GDPR")) return "GDPR"
  if (s.includes("SOC2")) return "SOC2"
  if (s.includes("PCI")) return "PCI-DSS"
  return std.split(" ")[0]
}

function getRequirementStandards(req: SecurityRequirement): string[] {
  if (req.applicable_standards?.length) return req.applicable_standards

  const standards: string[] = []
  
  // Check root-level arrays
  if (req.asvs?.length) standards.push("ASVS")
  if (req.stride?.length) standards.push("STRIDE")
  if (req.iso27001?.length) standards.push("ISO27001")
  if (req.soc2?.length) standards.push("SOC2")
  if (req.pciDss?.length) standards.push("PCI-DSS")
  if (req.gdpr?.length) standards.push("GDPR")

  // Check standards_mapping object
  if (req.standards_mapping) {
    if (req.standards_mapping.asvs?.length) standards.push("ASVS")
    if (req.standards_mapping.stride?.length) standards.push("STRIDE")
    if (req.standards_mapping.iso27001?.length) standards.push("ISO27001")
    if (req.standards_mapping.soc2?.length) standards.push("SOC2")
    if (req.standards_mapping.pciDss?.length) standards.push("PCI-DSS")
    if (req.standards_mapping.gdpr?.length) standards.push("GDPR")
  }

  // Check generic standards/applicableStandards containers
  const container = req.standards || req.applicableStandards
  if (container && typeof container === "object" && !standards.length) {
    const keys = Object.keys(container)
    if (keys.some((k) => k.toLowerCase().includes("asvs"))) standards.push("ASVS")
    if (keys.some((k) => k.toLowerCase().includes("stride"))) standards.push("STRIDE")
    if (keys.some((k) => k.toLowerCase().includes("iso"))) standards.push("ISO27001")
    if (keys.some((k) => k.toLowerCase().includes("soc"))) standards.push("SOC2")
    if (keys.some((k) => k.toLowerCase().includes("pci"))) standards.push("PCI-DSS")
    if (keys.some((k) => k.toLowerCase().includes("gdpr"))) standards.push("GDPR")
  }

  return [...new Set(standards)]
}

function getRiskBadgeClass(
  risk: SecurityRequirement["risk_ranking"]
) {
  switch (risk) {
    case "critical":
      return "bg-red-100 text-red-700"
    case "high":
      return "bg-orange-100 text-orange-700"
    case "medium":
      return "bg-yellow-100 text-yellow-700"
    default:
      return "bg-green-100 text-green-700"
  }
}

function getStatusSelectClass(
  status: RequirementReviewStatus
) {
  const base =
    "border font-medium focus:ring-0 focus:ring-offset-0"

  switch (status) {
    case "accepted":
      return `${base} bg-blue-100 text-blue-700 border-blue-200`
    case "mitigated":
      return `${base} bg-green-100 text-green-700 border-green-200`
    case "not_applicable":
      return `${base} bg-gray-100 text-gray-600 border-gray-200`
    default:
      return `${base} bg-yellow-100 text-yellow-700 border-yellow-200`
  }
}
