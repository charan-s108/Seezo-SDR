import { Button } from "@/components/ui/button"
import { Chrome, Mail } from "lucide-react"

export default function SocialButtons() {
  return (
    <div className="mt-6 space-y-3">
      <div className="relative text-center">
        <span className="text-xs text-muted-foreground bg-background px-2">
          OR
        </span>
      </div>

      <Button
        variant="outline"
        className="w-full gap-2"
      >
        <Chrome className="h-4 w-4" />
        Continue with Google
      </Button>

      <Button
        variant="outline"
        className="w-full gap-2"
      >
        <Mail className="h-4 w-4" />
        Continue with Microsoft
      </Button>
    </div>
  )
}
