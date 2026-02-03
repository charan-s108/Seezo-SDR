"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"

export default function NewProjectModal({
  open,
  onClose,
  onCreated,
  editingProject,
}: any) {
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (editingProject) {
      setName(editingProject.name || "")
      setCode(editingProject.code || "")
      setDescription(editingProject.description || "")
    } else {
      setName("")
      setCode("")
      setDescription("")
    }
  }, [editingProject, open])

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const method = editingProject ? "PUT" : "POST"
      const url = editingProject ? `/api/projects/${editingProject._id}` : "/api/projects"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, code, description }),
      })

      if (res.ok) {
        onCreated()
        onClose()
      } else {
        const data = await res.json()
        alert(data.error || "Failed to save project")
      }
    } catch (error) {
      alert("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingProject ? "Edit Project" : "Create Project"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            placeholder="Project name"
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={isLoading}
          />
          <Input
            placeholder="Project code (e.g. PAYMENTS)"
            value={code}
            onChange={e => setCode(e.target.value)}
            disabled={isLoading}
          />
          <Input
            placeholder="Description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            disabled={isLoading}
          />

          <Button className="w-full cursor-pointer" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Saving..." : editingProject ? "Update Project" : "Create Project"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
