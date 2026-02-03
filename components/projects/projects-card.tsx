import Link from "next/link"
import { useState } from "react"
import { Trash2, Edit2, MoreVertical } from "lucide-react"
import type { Project } from "@/types/project"
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type ProjectWithStats = Project & {
  assessmentCount: number
  ownerName: string
}

export default function ProjectCard({
  project,
  onEdit,
  onDeleted,
  onUpdated,
}: {
  project: ProjectWithStats
  onEdit?: (project: Project) => void
  onDeleted?: (projectId: string) => void
  onUpdated?: (project: Project) => void
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const ownerInitial =
    project.ownerName?.charAt(0).toUpperCase() ?? "?"

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/projects/${project._id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete project")
      }

      onDeleted?.(String(project._id))
      setShowDeleteDialog(false)
    } catch (error) {
      console.error("Delete error:", error)
      alert("Failed to delete project")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div 
        className="rounded-lg border p-4 hover:shadow-sm transition flex flex-col cursor-pointer relative"
        onClick={() => window.location.href = `/dashboard/projects/${project._id}/assessments`}
      >
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-semibold flex-1">{project.name}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation()
                onEdit?.(project)
              }}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation()
                  setShowDeleteDialog(true)
                }}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-sm text-muted-foreground mb-auto flex-1">
          {project.description || "No description"}
        </p>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
          {/* Assessments */}
          <span>
            {project.assessmentCount} assessments
          </span>

          {/* Owner */}
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs font-medium">
                {ownerInitial}
              </AvatarFallback>
            </Avatar>
            <span>{project.ownerName}</span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the project "{project.name}" and all associated assessments, security requirements, and compliance data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
