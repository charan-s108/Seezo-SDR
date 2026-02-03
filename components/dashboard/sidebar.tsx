"use client"

import {
  LayoutDashboard,
  Folder,
  Settings,
  Users,
  Bell,
  Search,
  LogOut,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function Sidebar({
  user,
}: {
  user: { name: string; email: string; company: string } | null
}) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/") 
    router.refresh() 
  }

  return (
    <aside className="h-screen bg-white border-r flex flex-col">
      {/* Logo */}
      <div className="p-6 flex items-center gap-2">
        <Image src="/seezo-logo.png" alt="Seezo" width={32} height={32} />
        <span className="font-bold text-lg">Seezo</span>
      </div>

      {/* Search */}
      <div className="px-4">
        <div className="flex items-center gap-2 px-3 py-2 border rounded-md">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            placeholder="Search"
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2 text-sm">
        <SidebarItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
        <SidebarItem href="/dashboard/projects" icon={Folder} label="Projects" />
        <SidebarItem href="/dashboard/config" icon={Settings} label="Config" />
        <SidebarItem href="/dashboard/users" icon={Users} label="User Management" />
        <SidebarItem href="/dashboard/notifications" icon={Bell} label="Notifications" />
      </nav>

      {/* Profile */}
      <div className="border-t p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>
              {user?.name?.[0] ?? "U"}
            </AvatarFallback>
          </Avatar>

          <div>
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.company}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 rounded-md hover:bg-muted"
          aria-label="Logout"
        >
          <LogOut className="h-4 w-4 text-muted-foreground cursor-pointer" />
        </button>
      </div>
    </aside>
  )
}

function SidebarItem({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: any
  label: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition"
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  )
}
