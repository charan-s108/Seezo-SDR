"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import type { Assessment, SourceType } from "@/types/assessment"

type AssessmentRow = Assessment & {
  securityRequirementsCount: number
  openQuestionsCount: number
  sourceTypes: SourceType[]
}

type Props = {
  assessments: AssessmentRow[]
  onAssessmentsChange?: (assessments: AssessmentRow[]) => void
}

function formatSource(type: SourceType) {
  switch (type) {
    case "file":
      return "File Upload"
    case "diagram":
      return "Diagram"
    case "text":
      return "Text"
    case "github":
      return "GitHub"
    case "jira":
      return "Jira"
    case "confluence":
      return "Confluence"
    case "gdocs":
      return "Google Docs"
    default:
      return type
  }
}

export default function AssessmentsTable({ assessments, onAssessmentsChange }: Props) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [displayedAssessments, setDisplayedAssessments] = useState<AssessmentRow[]>(assessments)

  useEffect(() => {
    setDisplayedAssessments(assessments)
  }, [assessments])

  const allSelected = selectedIds.size === displayedAssessments.length && displayedAssessments.length > 0
  const someSelected = selectedIds.size > 0 && selectedIds.size < displayedAssessments.length

  const handleSelectAll = (checked: boolean | "indeterminate") => {
    if (checked === true) {
      setSelectedIds(new Set(displayedAssessments.map(a => String(a._id))))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectOne = (id: string, checked: boolean | "indeterminate") => {
    if (checked === "indeterminate") return
    const newSelected = new Set(selectedIds)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedIds(newSelected)
  }

  const handleDeleteSelected = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch("/api/assessments/bulk-delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assessmentIds: Array.from(selectedIds),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to delete assessments")
      }

      // Update displayed assessments immediately
      const updatedAssessments = displayedAssessments.filter(
        a => !selectedIds.has(String(a._id))
      )
      setDisplayedAssessments(updatedAssessments)
      
      // Notify parent component
      onAssessmentsChange?.(updatedAssessments)

      setSelectedIds(new Set())
      setShowDeleteDialog(false)
      router.refresh()
    } catch (error) {
      console.error("Delete error:", error)
      alert("Failed to delete assessments")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Delete toolbar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
          <span className="text-sm text-red-900">
            {selectedIds.size} assessment{selectedIds.size > 1 ? "s" : ""} selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </Button>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="w-12 text-center">
              <div className="flex justify-center">
                <Checkbox 
                  id="select-all"
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                />
              </div>
            </TableHead>
            <TableHead className="text-sm font-normal text-center">
              Assessment Name
            </TableHead>
            <TableHead className="text-sm font-normal text-center">
              Risk
            </TableHead>
            <TableHead className="text-sm font-normal text-center">
              Security Requirements
            </TableHead>
            <TableHead className="text-sm font-normal text-center">
              Open Questions
            </TableHead>
            <TableHead className="text-sm font-normal text-center">
              Sources
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {displayedAssessments.map((assessment) => (
            <TableRow
              key={assessment._id}
              className="cursor-pointer hover:bg-muted/40 transition"
              onClick={() =>
                router.push(
                  `/dashboard/projects/${assessment.projectId}/assessments/${assessment._id}`
                )
              }
            >
              {/* Checkbox */}
              <TableCell
                className="text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-center">
                  <Checkbox
                    id={`select-${assessment._id}`}
                    checked={selectedIds.has(String(assessment._id))}
                    onCheckedChange={(checked) =>
                      handleSelectOne(String(assessment._id), checked)
                    }
                  />
                </div>
              </TableCell>

              {/* Name */}
              <TableCell className="text-sm text-center">
                {assessment.name}
              </TableCell>

              {/* Risk */}
              <TableCell className="text-center">
                <Badge
                  variant="secondary"
                  className="text-xs font-normal capitalize"
                >
                  {assessment.risk ?? "unknown"}
                </Badge>
              </TableCell>

              {/* Security Requirements */}
              <TableCell className="text-sm text-muted-foreground text-center">
                {assessment.securityRequirementsCount}
              </TableCell>

              {/* Open Questions */}
              <TableCell className="text-sm text-muted-foreground text-center">
                {assessment.openQuestionsCount}
              </TableCell>

              {/* Sources */}
              <TableCell className="text-sm text-muted-foreground text-center">
                {assessment.sourceTypes.length > 0
                  ? assessment.sourceTypes
                      .map(formatSource)
                      .join(", ")
                  : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete Assessment{selectedIds.size > 1 ? "s" : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedIds.size} assessment{selectedIds.size > 1 ? "s" : ""} and all associated data (security requirements, open questions, compliance findings, sources) from the system. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSelected}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
