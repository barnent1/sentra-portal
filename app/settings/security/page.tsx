import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import { SessionsList } from "@/components/auth/sessions-list"

export default async function SecuritySettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/signin?callbackUrl=/settings/security")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Security Settings</h1>
      
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Password Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Password</h2>
          <p className="text-gray-600 mb-4">
            Ensure your account stays secure by using a strong password.
          </p>
          <a
            href="/auth/forgot-password"
            className="inline-flex items-center justify-center rounded-md bg-violet-600 px-4 py-2 text-white font-medium hover:bg-violet-700 transition-colors"
          >
            Change Password
          </a>
        </div>

        {/* Sessions Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Sessions</h2>
          <p className="text-gray-600 mb-6">
            Manage your active sessions and see where you're signed in.
          </p>
          <SessionsList />
        </div>

        {/* Two-Factor Authentication (Future Implementation) */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Two-Factor Authentication</h2>
          <p className="text-gray-600 mb-4">
            Add an extra layer of security to your account with two-factor authentication.
          </p>
          <button
            disabled
            className="inline-flex items-center justify-center rounded-md bg-gray-200 px-4 py-2 text-gray-500 font-medium cursor-not-allowed"
          >
            Coming Soon
          </button>
        </div>

        {/* Account Activity (Future Implementation) */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Account Activity</h2>
          <p className="text-gray-600 mb-4">
            Review recent activity and get alerts about unusual account access.
          </p>
          <button
            disabled
            className="inline-flex items-center justify-center rounded-md bg-gray-200 px-4 py-2 text-gray-500 font-medium cursor-not-allowed"
          >
            View Activity Log
          </button>
        </div>
      </div>
    </div>
  )
}