import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string | null
      image: string | null
    } & DefaultSession["user"]
    accessToken: string
    refreshToken: string
  }

  interface User extends DefaultUser {
    id: string
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string
    email: string
    name: string | null
    picture: string | null
    accessToken?: string
    refreshToken?: string
    provider?: string
    providerAccountId?: string
  }
}