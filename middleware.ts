import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Add custom middleware logic here if needed
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Paths that require authentication
        const protectedPaths = ["/dashboard", "/profile", "/settings"]
        const pathname = req.nextUrl.pathname
        
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
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
}