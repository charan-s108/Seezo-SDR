import "server-only"
import { cookies } from "next/headers"
import { verifyUserToken } from "@/lib/jwt"

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get("seezo_token")?.value

  if (!token) return null

  const payload = verifyUserToken(token)
  if (!payload) {
    return null
  }

  return {
    id: payload.sub,
    name: payload.name,
    email: payload.email,
    company: payload.company,
  }
}
