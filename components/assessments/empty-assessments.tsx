import { Button } from "@/components/ui/button"
import { FileSearch, Plus } from "lucide-react"

type EmptyAssessmentProps = {
  onCreate: () => void
}

export default function EmptyAssessment({
  onCreate,
}: EmptyAssessmentProps) {
  return (
    <div className="border rounded-lg p-10 flex flex-col items-center text-center bg-muted/30">
      <FileSearch className="h-10 w-10 text-muted-foreground mb-4" />

      <h2 className="text-lg font-semibold">
        No assessments yet
      </h2>

      <p className="text-sm text-muted-foreground max-w-md mb-6">
        Create your first security design review to analyze
        architecture, documents, or integrations using AI.
      </p>

      <Button onClick={onCreate} className="cursor-pointer">
        <Plus className="h-4 w-4 mr-2" />
        Create Assessment
      </Button>
    </div>
  )
}
