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

import type { AssessmentSource } from "@/types/assessment"

export function AssetsTable({
  sources,
}: {
  sources: AssessmentSource[]
}) {
  if (!sources?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No assets uploaded for this assessment.
      </p>
    )
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border">
      <Table className="w-full table-fixed full-border-table border-gray-200">
        {/* ================= Header ================= */}
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px] border text-center">#</TableHead>
            <TableHead className="w-[240px] border text-center">Name</TableHead>
            <TableHead className="w-[120px] border text-center">Type</TableHead>
            <TableHead className="w-[140px] border text-center">Storage</TableHead>
            <TableHead className="w-[160px] border text-center">Uploaded</TableHead>
            <TableHead className="w-[120px] border text-center">Action</TableHead>
          </TableRow>
        </TableHeader>

        {/* ================= Body ================= */}
        <TableBody>
          {sources.map((asset, idx) => (
            <TableRow key={asset._id} className="align-top">
              <TableCell className="text-sm border text-center">
                {idx + 1}
              </TableCell>

              <TableCell className="text-sm border break-words whitespace-normal">
                {asset.name}
              </TableCell>

              <TableCell className="text-center border">
                <Badge variant="secondary" className="capitalize">
                  {asset.type}
                </Badge>
              </TableCell>

              <TableCell className="text-center text-xs border">
                {asset.storage.kind}
              </TableCell>

              <TableCell className="text-center text-xs text-muted-foreground border">
                {formatDate(asset.uploadedAt)}
              </TableCell>

              <TableCell className="text-center border">
                {asset.storage.path ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      window.open(asset.storage.path, "_blank")
                    }
                    className="text-xs h-7"
                  >
                    View
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

/* ================= Helpers ================= */

function formatDate(date: string) {
  try {
    return new Date(date).toLocaleDateString()
  } catch {
    return "-"
  }
}
