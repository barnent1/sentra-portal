"use client"

import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function UserNav() {
  const { user, isAuthenticated, logout } = useAuth()

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-4">
        <Link href="/auth/signin">
          <Button variant="ghost">Sign in</Button>
        </Link>
        <Link href="/auth/register">
          <Button>Sign up</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        {user?.image ? (
          <img
            src={user.image}
            alt={user.name || "User"}
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-white">
            {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
          </div>
        )}
        <span className="text-sm font-medium">{user?.name || user?.email}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">Dashboard</Button>
        </Link>
        <Link href="/profile">
          <Button variant="ghost" size="sm">Profile</Button>
        </Link>
        <Button variant="ghost" size="sm" onClick={logout}>
          Sign out
        </Button>
      </div>
    </div>
  )
}