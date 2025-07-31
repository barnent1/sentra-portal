"use client"

import { useState, useEffect } from "react"
import { useApiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"

interface Session {
  userId: string
  email: string
  ip?: string
  userAgent?: string
  createdAt: string
  lastActivity: string
}

interface SessionStats {
  totalSessions: number
  activeSessions: number
  devices: string[]
  locations: string[]
}

export function SessionsList() {
  const apiClient = useApiClient()
  const [sessions, setSessions] = useState<Session[]>([])
  const [stats, setStats] = useState<SessionStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeletingOthers, setIsDeletingOthers] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await apiClient.get("/api/auth/sessions")
      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions)
        setStats(data.stats)
      } else {
        setError("Failed to load sessions")
      }
    } catch (err) {
      setError("An error occurred loading sessions")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteOtherSessions = async () => {
    setIsDeletingOthers(true)
    setError("")

    try {
      const response = await apiClient.delete("/api/auth/sessions")
      
      if (response.ok) {
        const data = await response.json()
        // Refresh sessions list
        await fetchSessions()
      } else {
        setError("Failed to delete other sessions")
      }
    } catch (err) {
      setError("An error occurred deleting sessions")
    } finally {
      setIsDeletingOthers(false)
    }
  }

  const parseUserAgent = (userAgent?: string) => {
    if (!userAgent) return "Unknown device"
    
    // Simple parsing - in production, use a proper user-agent parser
    if (userAgent.includes("Mobile")) return "Mobile device"
    if (userAgent.includes("Tablet")) return "Tablet"
    if (userAgent.includes("Chrome")) return "Chrome browser"
    if (userAgent.includes("Firefox")) return "Firefox browser"
    if (userAgent.includes("Safari")) return "Safari browser"
    
    return "Web browser"
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Sessions</p>
            <p className="text-2xl font-semibold">{stats.totalSessions}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Active Sessions</p>
            <p className="text-2xl font-semibold">{stats.activeSessions}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Devices</p>
            <p className="text-2xl font-semibold">{stats.devices.length}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Locations</p>
            <p className="text-2xl font-semibold">{stats.locations.length}</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Active Sessions</h3>
        {sessions.length > 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteOtherSessions}
            disabled={isDeletingOthers}
          >
            {isDeletingOthers ? "Signing out..." : "Sign out other sessions"}
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {sessions.map((session, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 space-y-2"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{parseUserAgent(session.userAgent)}</p>
                <p className="text-sm text-gray-600">
                  {session.ip || "Unknown location"}
                </p>
              </div>
              {index === 0 && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Current session
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">
              <p>
                Created: {formatDistanceToNow(new Date(session.createdAt))} ago
              </p>
              <p>
                Last active: {formatDistanceToNow(new Date(session.lastActivity))} ago
              </p>
            </div>
          </div>
        ))}
      </div>

      {sessions.length === 0 && (
        <p className="text-center text-gray-500 py-8">
          No active sessions found
        </p>
      )}
    </div>
  )
}