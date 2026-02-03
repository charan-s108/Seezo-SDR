import { getCurrentUser } from "@/lib/getcurrentuser"
import { redirect } from "next/navigation"
import AuthClient from "./auth-client"

export default async function AuthPage() {
  const user = await getCurrentUser()

  if (user) {
    redirect("/dashboard")
  }

  return <AuthClient />
}
