import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import { ProfileForm } from "@/components/profile/profile-form"

export default async function ProfilePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/signin?callbackUrl=/profile")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
          <ProfileForm />
        </div>

        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">JWT Token Information</h3>
          <p className="text-blue-700">
            Your session includes JWT tokens for API access. These tokens are automatically
            included in API requests and refreshed when needed.
          </p>
        </div>
      </div>
    </div>
  )
}