import { Sidebar } from "@/components/dashboard/sidebar"
import { getCurrentUser } from "@/lib/getcurrentuser"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
    const user = await getCurrentUser()

  if (!user) {
    redirect("/auth")
  }

  return (
    // Prevent page scroll
    <div className="h-screen overflow-hidden bg-muted">
      <div className="flex h-full">
        {/* Sidebar (fixed, no scroll) */}
        <aside className="w-64 shrink-0 border-r bg-background">
          <Sidebar user={user} />
        </aside>

        {/* Main column */}
        <div className="flex flex-1 flex-col">
          {/* Scrollable content ONLY */}
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}