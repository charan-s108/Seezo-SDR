"use client"

import { useEffect, useState } from "react"
import { Folder, Plus, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { StatsCard } from "@/components/projects/stats-card"
import NewProjectModal from "@/components/projects/new-project-modal"
import EmptyProjects from "@/components/projects/empty-projects"
import ProjectCard from "@/components/projects/projects-card"

import type { Project } from "@/types/project"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    setLoading(true)

    try {
      const res = await fetch("/api/projects")
      if (!res.ok) throw new Error("Failed to fetch projects")

      const data = await res.json()
      setProjects(data.projects ?? [])
    } finally {
      setLoading(false)
    }
  }

  const handleProjectDeleted = (deletedProjectId: string) => {
    setProjects(projects.filter(p => String(p._id) !== deletedProjectId))
  }

  const handleProjectUpdated = (updatedProject: Project) => {
    setProjects(projects.map(p => String(p._id) === String(updatedProject._id) ? updatedProject : p))
  }

  const handleOpenModal = (project?: Project) => {
    if (project) {
      setEditingProject(project)
    } else {
      setEditingProject(null)
    }
    setOpen(true)
  }

  const handleCloseModal = () => {
    setOpen(false)
    setEditingProject(null)
  }

  const handleCreatedOrUpdated = () => {
    fetchProjects()
  }

  const totalAssessments = projects.reduce(
    (sum, p) => sum + p.assessmentCount,
    0
  )

  return (
    <div className="min-h-full rounded-xl border bg-background p-6 flex flex-col gap-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-muted-foreground gap-1">
        <span>Projects</span>
        <ChevronRight className="h-4 w-4" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>

        <Button className="cursor-pointer" onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Create Project
        </Button>
      </div>

      {/* Stats */}
      {projects.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <StatsCard
            title="Total Projects"
            value={projects.length}
            icon={Folder}
          />
          <StatsCard
            title="Total Assessments"
            value={totalAssessments}
            icon={Folder}
          />
        </div>
      )}

      {/* Content */}
      <div className="border rounded-xl bg-background p-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading projects...</p>
        ) : projects.length === 0 ? (
          <EmptyProjects onCreate={() => setOpen(true)} />
        ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onEdit={() => handleOpenModal(project)}
              onDeleted={handleProjectDeleted}
              onUpdated={handleProjectUpdated}
            />
          ))}
        </div>
        )}
      </div>

      {/* Create/Edit Project Modal */}
      <NewProjectModal
        open={open}
        onClose={handleCloseModal}
        onCreated={handleCreatedOrUpdated}
        editingProject={editingProject}
      />
    </div>
  )
}

