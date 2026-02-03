import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET!

export type UserTokenPayload = {
  sub: string
  name: string
  email: string
  company: string
}

export function signUserToken(user: {
  _id: string
  name: string
  email: string
  company: string
}) {
  return jwt.sign(
    {
      sub: user._id,
      name: user.name,
      email: user.email,
      company: user.company,
    },
    JWT_SECRET,
    {
      expiresIn: "1h",
    }
  )
}

export function verifyUserToken(
  token: string
): UserTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserTokenPayload
  } catch {
    return null
  }
}
