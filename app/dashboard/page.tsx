import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/signin?callbackUrl=/dashboard")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome back, {user.name || user.email}!</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-violet-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-violet-900">Profile Status</h3>
            <p className="text-violet-700 mt-2">
              Email: {user.email}
              <br />
              Verified: {user.emailVerified ? "Yes" : "No"}
            </p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900">Account Info</h3>
            <p className="text-blue-700 mt-2">
              ID: {user.id}
              <br />
              Name: {user.name || "Not set"}
            </p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900">Session Active</h3>
            <p className="text-green-700 mt-2">
              You are successfully logged in
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}