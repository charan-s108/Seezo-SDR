"use client"

import * as React from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ExportMenuProps {
  assessmentId: string
  assessmentName: string
  onExportStart?: () => void
  onExportComplete?: () => void
  onExportError?: (error: Error) => void
  projectId: string
}

export function ExportMenu({
  assessmentId,
  assessmentName,
  onExportStart,
  onExportComplete,
  onExportError,
}: ExportMenuProps) {
  const [isExporting, setIsExporting] = React.useState(false)

  const handleExportPDF = async () => {
    try {
      setIsExporting(true)
      onExportStart?.()

      const response = await fetch(`/api/assessments/${assessmentId}/export`)

      if (!response.ok) {
        throw new Error("Failed to export PDF")
      }

      // Create download link
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${assessmentName.replace(/\s+/g, "_")}_Security_Assessment.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      onExportComplete?.()
    } catch (error) {
      console.error("Export failed:", error)
      onExportError?.(error as Error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button onClick={handleExportPDF} disabled={isExporting}>
      <Download className="mr-2 h-4 w-4" />
      {isExporting ? "Exporting..." : "Export PDF"}
    </Button>
  )
}
