import { LucideIcon } from "lucide-react"

interface StatsCard {
  title: string
  value: string | number
  icon: LucideIcon
  danger?: boolean
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  danger,
}: StatsCard) {
  return (
    <div className="rounded-lg border bg-background p-4 flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">
          {title}
        </p>
        <p className="text-2xl font-bold">
          {Number.isFinite(value) ? value : 0}
        </p>
      </div>

      <div
        className={`p-2 rounded-md ${
          danger
            ? "bg-red-100 text-red-600"
            : "bg-muted"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
    </div>
  )
}
