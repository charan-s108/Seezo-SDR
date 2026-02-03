"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  projectName?: string
  assessmentName?: string
  isNew?: boolean
}

export default function ProjectBreadcrumb({ projectName, assessmentName, isNew }: Props) {
  const params = useParams()
  const projectId = params.projectId as string

  return (
    <div className="flex items-center text-sm text-muted-foreground gap-1">
      <Link href="/dashboard/projects" className="hover:text-foreground transition-colors">
        Projects
      </Link>

      <ChevronRight className="h-4 w-4 shrink-0" />

      {/* This link goes to the Project's Assessments list */}
      <Link 
        href={`/dashboard/projects/${projectId}/assessments`}
        className="hover:text-foreground transition-colors max-w-[150px] truncate"
      >
        {projectName || "Loading..."}
      </Link>

      <ChevronRight className="h-4 w-4 shrink-0" />

      {/* If we are on the 'New' or 'Detail' page, this should be a link back to the list */}
      <Link 
        href={`/dashboard/projects/${projectId}/assessments`}
        className={cn(
          "hover:text-foreground transition-colors",
          (!assessmentName && !isNew) && "text-foreground font-medium"
        )}
      >
        Assessments
      </Link>

      {/* Show the final segment only if we are creating or viewing a specific one */}
      {(isNew || assessmentName) && (
        <>
          <ChevronRight className="h-4 w-4 shrink-0" />
          <span className="text-foreground font-medium">
            {isNew ? "New Assessment" : assessmentName}
          </span>
        </>
      )}
    </div>
  )
}