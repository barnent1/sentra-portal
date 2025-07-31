import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/auth/new-user",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user.password) {
          throw new Error("Invalid credentials")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error("Invalid credentials")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
        
        // Generate custom JWT tokens
        const { generateTokens } = await import("@/lib/jwt")
        const tokens = await generateTokens(user.id, user.email!)
        token.accessToken = tokens.accessToken
        token.refreshToken = tokens.refreshToken
      }
      
      if (account) {
        token.provider = account.provider
        token.providerAccountId = account.providerAccountId
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.picture as string
      }
      
      // Add JWT tokens to session
      session.accessToken = token.accessToken as string
      session.refreshToken = token.refreshToken as string
      
      return session
    },
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log("User signed in:", user.email)
      
      // Create session in Redis for session management
      const { SessionManager } = await import("@/lib/session-manager")
      const metadata = {
        ip: undefined, // Would need to be passed from request context
        userAgent: undefined, // Would need to be passed from request context
      }
      
      await SessionManager.createSession(user.id, user.email!, metadata)
    },
    async signOut({ session, token }) {
      console.log("User signed out")
      
      // Clean up sessions
      if (token?.id) {
        const { SessionManager } = await import("@/lib/session-manager")
        await SessionManager.deleteAllUserSessions(token.id as string)
      }
    },
  },
  debug: process.env.NODE_ENV === "development",
}