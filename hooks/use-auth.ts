"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useCallback } from "react"

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      if (result?.ok) {
        router.refresh()
        return result
      }
    },
    [router]
  )

  const logout = useCallback(async () => {
    await signOut({ redirect: false })
    router.push("/")
    router.refresh()
  }, [router])

  const loginWithOAuth = useCallback(
    async (provider: "google" | "github") => {
      await signIn(provider, { callbackUrl: "/dashboard" })
    },
    []
  )

  return {
    user: session?.user,
    session,
    status,
    isAuthenticated: !!session,
    isLoading: status === "loading",
    login,
    logout,
    loginWithOAuth,
  }
}