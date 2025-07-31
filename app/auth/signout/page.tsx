"use client"

import { useEffect } from "react"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function SignOutPage() {
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push("/")
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <h2 className="text-3xl font-bold">Sign out</h2>
        <p className="text-gray-600">Are you sure you want to sign out?</p>
        
        <div className="space-y-4">
          <Button
            onClick={handleSignOut}
            className="w-full"
          >
            Yes, sign me out
          </Button>
          
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}