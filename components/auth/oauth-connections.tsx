"use client"

import { useState, useEffect } from "react"
import { useSession, signIn } from "next-auth/react"
import { useApiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"

interface OAuthAccount {
  provider: string
  providerAccountId: string
  createdAt: string
}

const providers = [
  {
    id: "google",
    name: "Google",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
    ),
  },
  {
    id: "github",
    name: "GitHub",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
]

export function OAuthConnections() {
  const { data: session } = useSession()
  const apiClient = useApiClient()
  const [accounts, setAccounts] = useState<OAuthAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isConnecting, setIsConnecting] = useState<string | null>(null)

  useEffect(() => {
    fetchConnectedAccounts()
  }, [])

  const fetchConnectedAccounts = async () => {
    try {
      const response = await apiClient.get("/api/auth/accounts")
      if (response.ok) {
        const data = await response.json()
        setAccounts(data.accounts)
      }
    } catch (err) {
      console.error("Failed to fetch connected accounts:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = async (providerId: string) => {
    setIsConnecting(providerId)
    try {
      await signIn(providerId, { callbackUrl: "/settings/security" })
    } catch (err) {
      console.error("Failed to connect account:", err)
      setIsConnecting(null)
    }
  }

  const handleDisconnect = async (provider: string) => {
    try {
      const response = await apiClient.delete(`/api/auth/accounts/${provider}`)
      if (response.ok) {
        setAccounts(accounts.filter(acc => acc.provider !== provider))
      }
    } catch (err) {
      console.error("Failed to disconnect account:", err)
    }
  }

  const isConnected = (providerId: string) => {
    return accounts.some(acc => acc.provider === providerId)
  }

  const canDisconnect = () => {
    // User must have either a password or at least one OAuth account to sign in
    return accounts.length > 1 || session?.user?.email
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Connected Accounts</h3>
      <p className="text-sm text-gray-600">
        Connect your social accounts for easy sign-in
      </p>

      <div className="space-y-3">
        {providers.map((provider) => {
          const connected = isConnected(provider.id)
          const account = accounts.find(acc => acc.provider === provider.id)

          return (
            <div
              key={provider.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  {provider.icon}
                </div>
                <div>
                  <p className="font-medium">{provider.name}</p>
                  {connected && account ? (
                    <p className="text-sm text-gray-600">
                      Connected • ID: {account.providerAccountId}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600">Not connected</p>
                  )}
                </div>
              </div>

              <div>
                {connected ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDisconnect(provider.id)}
                    disabled={!canDisconnect()}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleConnect(provider.id)}
                    disabled={isConnecting === provider.id}
                  >
                    {isConnecting === provider.id ? "Connecting..." : "Connect"}
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {!canDisconnect() && accounts.length > 0 && (
        <p className="text-sm text-amber-600">
          You must have at least one sign-in method. Set a password before disconnecting all accounts.
        </p>
      )}
    </div>
  )
}