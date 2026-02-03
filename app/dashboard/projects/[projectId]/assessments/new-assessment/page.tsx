"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  Upload,
  X,
  Play,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Type,
  Cloud,
  AlertTriangle,
  Github,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ProjectBreadcrumb from "@/components/navigation/project-breadcrumb"
import { cn } from "@/lib/utils"

type SourceType =
  | "file"
  | "diagram"
  | "text"
  | "jira"
  | "confluence"
  | "gdocs"
  | "github"

const SOURCE_OPTIONS: { id: SourceType; label: string; icon: any }[] = [
  { id: "file", label: "Files", icon: FileText },
  { id: "diagram", label: "Architecture Diagram", icon: ImageIcon },
  { id: "github", label: "GitHub Repo", icon: Github },
  { id: "text", label: "Text", icon: Type },
  { id: "jira", label: "Jira", icon: LinkIcon },
  { id: "confluence", label: "Confluence", icon: LinkIcon },
  { id: "gdocs", label: "Google Docs", icon: Cloud },
]

const ACCEPTED_TYPES = [".pdf", ".png", ".jpg", ".jpeg"]

export default function NewAssessmentPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.projectId as string

  const [projectName, setProjectName] = useState("")
  const [name, setName] = useState("")
  const [sourceType, setSourceType] = useState<SourceType>("file")
  const [files, setFiles] = useState<File[]>([])
  const [repoUrl, setRepoUrl] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!projectId) return
    fetch(`/api/projects/${projectId}`)
      .then((res) => res.json())
      .then((data) => setProjectName(data.project?.name ?? ""))
  }, [projectId])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return

    const selected = Array.from(e.target.files).filter((file) =>
      ACCEPTED_TYPES.some((ext) => file.name.toLowerCase().endsWith(ext))
    )

    setFiles((prev) => [...prev, ...selected])
  }

  const removeFile = (index: number) =>
    setFiles(files.filter((_, i) => i !== index))

    {/* Handle Form Submission */}
    async function handleStartAssessment() {
    if (!name || files.length === 0) return

    setLoading(true)

    try {
        const formData = new FormData()
        formData.append("projectId", projectId)
        formData.append("name", name)
        formData.append("sourceType", sourceType)

        files.forEach((file) => {
        formData.append("files", file)
        })

        const res = await fetch("/api/assessments", {
        method: "POST",
        body: formData,
        })

        if (!res.ok) {
        throw new Error("Failed to create assessment")
        }

        const data = await res.json()

        // Option 1: go back to assessments list
        router.push(`/dashboard/projects/${projectId}/assessments`)

        // Option 2 (better later): go to assessment detail
        // router.push(
        //   `/dashboard/projects/${projectId}/assessments/${data.assessmentId}`
        // )
    } catch (err) {
        console.error(err)
    } finally {
        setLoading(false)
    }
    }

  return (
    <div className="min-h-full rounded-xl border bg-background p-6 flex flex-col gap-8">
      <ProjectBreadcrumb projectName={projectName} isNew />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">New Assessment</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button disabled={!name || loading} onClick={handleStartAssessment}>
            <Play className="h-4 w-4 mr-2" />
            {loading ? "Starting..." : "Start Assessment"}
          </Button>
        </div>
      </div>

      {/* Main card */}
      <div className="border rounded-xl bg-background p-6 space-y-10 max-w-3xl">
        {/* Assessment name */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Assessment Name</label>
          <Input
            placeholder="e.g. Payments API – Security Design Review"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Source selector */}
        <div className="mt-4 space-y-2">
          <label className="text-sm font-medium">Source Type</label>
          <div className="flex flex-wrap gap-2">
            {SOURCE_OPTIONS.map((item) => {
              const active = sourceType === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSourceType(item.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition",
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* GitHub Repo */}
        {sourceType === "github" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">GitHub repository URL</label>
            <Input
              placeholder="https://github.com/org/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Repository will be analyzed in read-only mode.
            </p>
          </div>
        )}

        {/* File upload */}
        {(sourceType === "file" || sourceType === "diagram") && (
          <div className="mt-4 space-y-4">
            <label className="text-sm font-medium">Upload files</label>

            {/* Security warning */}
            <div className="mt-1 flex items-start gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 text-amber-600" />
            <p>
                Avoid uploading secrets, credentials, production keys or customer PII.
                Files are used only for security analysis.
            </p>
            </div>

            {/* Dropzone */}
            <label className="border border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer text-center bg-muted transition group">
            {/* Icon container */}
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center group-hover:scale-105 transition-transform">
                <Upload className="h-7 w-7 text-muted-foreground" />
            </div>

            <span className="text-sm font-medium">
                Drag & drop or click to upload
            </span>

            <span className="text-xs text-muted-foreground">
                Only PDF, PNG, JPG files allowed
            </span>

            <input
                type="file"
                hidden
                multiple
                accept={ACCEPTED_TYPES.join(",")}
                onChange={handleFileUpload}
            />
            </label>

            {/* Preview Grid */}
            {files.length > 0 && (
            <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">Uploaded files</p>

                <div className="space-y-2">
                {files.map((file, i) => {
                    const isPdf = file.type === "application/pdf"
                    const isImage = file.type.startsWith("image/")

                    return (
                    <div
                        key={i}
                        className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                    >
                        <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{file.name}</span>

                        <span className="ml-2 rounded bg-muted px-2 py-0.5 text-[10px] uppercase text-muted-foreground">
                            {isPdf ? "PDF" : isImage ? "Image" : "File"}
                        </span>
                        </div>

                        <X
                        className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"
                        onClick={() => removeFile(i)}
                        />
                    </div>
                    )
                })}
                </div>
            </div>
            )}
          </div>
        )}

        {/* View All files Modal */}
        {files.some((f) => f.type.startsWith("image/")) && (
        <div className="mt-8 space-y-3">
            <h3 className="text-sm font-semibold">Diagrams</h3>

        <div className="flex flex-wrap gap-3 max-w-xs">
            {files
                .filter((f) => f.type.startsWith("image/"))
                .map((file, i) => (
                <div key={i} className="place-self-start">
                    <div className="h-20 w-24 rounded-md border bg-muted overflow-hidden">
                    <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="h-full w-full object-cover"
                    />
                    </div>

                    <p className="mt-1 text-xs truncate text-center w-24">
                    {file.name}
                    </p>
                </div>
                ))}
            </div>
        </div>
        )}
      </div>
    </div>
  )
}
