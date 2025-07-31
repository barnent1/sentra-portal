"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function NewUserPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        
        <h2 className="text-3xl font-bold">Welcome to Sentra Portal!</h2>
        
        <p className="text-gray-600">
          Your account has been created successfully. You can now access all features of the portal.
        </p>
        
        <div className="space-y-4 pt-4">
          <Button
            onClick={() => router.push("/dashboard")}
            className="w-full"
          >
            Go to Dashboard
          </Button>
          
          <Button
            variant="outline"
            onClick={() => router.push("/profile")}
            className="w-full"
          >
            Complete Your Profile
          </Button>
        </div>
      </div>
    </div>
  )
}