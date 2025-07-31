"use client"

import { useSession } from "next-auth/react"

interface ApiClientOptions extends RequestInit {
  includeAuth?: boolean
}

export function useApiClient() {
  const { data: session } = useSession()

  const apiCall = async (url: string, options: ApiClientOptions = {}) => {
    const { includeAuth = true, ...fetchOptions } = options
    
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    }

    // Add JWT token if available and requested
    if (includeAuth && session?.accessToken) {
      headers["Authorization"] = `Bearer ${session.accessToken}`
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    })

    // Handle token refresh if needed
    if (response.status === 401 && session?.refreshToken) {
      // Attempt to refresh token
      const refreshResponse = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken: session.refreshToken,
        }),
      })

      if (refreshResponse.ok) {
        const { accessToken } = await refreshResponse.json()
        
        // Retry original request with new token
        headers["Authorization"] = `Bearer ${accessToken}`
        return fetch(url, {
          ...fetchOptions,
          headers,
        })
      }
    }

    return response
  }

  return {
    get: (url: string, options?: ApiClientOptions) => 
      apiCall(url, { ...options, method: "GET" }),
    
    post: (url: string, data?: any, options?: ApiClientOptions) => 
      apiCall(url, { 
        ...options, 
        method: "POST", 
        body: data ? JSON.stringify(data) : undefined 
      }),
    
    put: (url: string, data?: any, options?: ApiClientOptions) => 
      apiCall(url, { 
        ...options, 
        method: "PUT", 
        body: data ? JSON.stringify(data) : undefined 
      }),
    
    delete: (url: string, options?: ApiClientOptions) => 
      apiCall(url, { ...options, method: "DELETE" }),
    
    patch: (url: string, data?: any, options?: ApiClientOptions) => 
      apiCall(url, { 
        ...options, 
        method: "PATCH", 
        body: data ? JSON.stringify(data) : undefined 
      }),
  }
}