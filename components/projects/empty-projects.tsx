import { Button } from "@/components/ui/button"
import { FolderPlus, Plus } from "lucide-react"

type EmptyProjectsProps = {
  onCreate: () => void
}

export default function EmptyProjects({ onCreate }: EmptyProjectsProps) {
  return (
    <div className="border rounded-lg p-10 flex flex-col items-center text-center bg-muted/30">
      <FolderPlus className="h-10 w-10 text-muted-foreground mb-4" />

      <h2 className="text-lg font-semibold">
        No projects yet
      </h2>

      <p className="text-sm text-muted-foreground max-w-md mb-6">
        Create your first project to start a Security Design Review
        and let Seezo analyze your architecture.
      </p>

      <Button onClick={onCreate} className="cursor-pointer">
        <Plus className="h-4 w-4 mr-2" />
        Create Project
      </Button>
    </div>
  )
}
