"use client"

import { useState, useEffect } from "react"
import { useApiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"

interface UserProfile {
  id: string
  email: string
  name: string | null
  image: string | null
  emailVerified: Date | null
  createdAt: Date
  updatedAt: Date
}

export function ProfileForm() {
  const apiClient = useApiClient()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get("/api/user/profile")
      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
      } else {
        setError("Failed to load profile")
      }
    } catch (err) {
      setError("An error occurred loading profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    setError("")
    setSuccess("")

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string

    try {
      const response = await apiClient.put("/api/user/profile", { name })
      
      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
        setSuccess("Profile updated successfully")
      } else {
        setError("Failed to update profile")
      }
    } catch (err) {
      setError("An error occurred updating profile")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">{error || "Failed to load profile"}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          value={profile.email}
          disabled
          className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2"
        />
        {!profile.emailVerified && (
          <p className="mt-1 text-sm text-amber-600">Email not verified</p>
        )}
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={profile.name || ""}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-violet-500 focus:outline-none focus:ring-violet-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Member Since
        </label>
        <p className="mt-1 text-sm text-gray-600">
          {new Date(profile.createdAt).toLocaleDateString()}
        </p>
      </div>

      <Button
        type="submit"
        disabled={isSaving}
        className="w-full"
      >
        {isSaving ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  )
}