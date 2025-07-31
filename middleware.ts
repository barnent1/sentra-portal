import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getCorsConfig, setCorsHeaders } from "@/lib/middleware/cors"

export default withAuth(
  function middleware(req: NextRequest) {
    const response = NextResponse.next()
    
    // Apply CORS headers to API routes
    if (req.nextUrl.pathname.startsWith('/api/')) {
      const corsConfig = getCorsConfig()
      const origin = req.headers.get('origin')
      
      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        const preflightResponse = new NextResponse(null, { status: 204 })
        setCorsHeaders(preflightResponse, origin, corsConfig)
        return preflightResponse
      }
      
      // Add CORS headers to response
      setCorsHeaders(response, origin, corsConfig)
    }
    
    return response
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const pathname = req.nextUrl.pathname
        
        // API routes have their own auth handling
        if (pathname.startsWith('/api/')) {
          return true
        }
        
        // Paths that require authentication
        const protectedPaths = ["/dashboard", "/profile", "/settings"]
        
        // Check if the current path requires authentication
        const isProtectedPath = protectedPaths.some(path => 
          pathname.startsWith(path)
        )
        
        // Allow access to protected paths only if authenticated
        if (isProtectedPath) {
          return !!token
        }
        
        // Allow access to all other paths
        return true
      }
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}