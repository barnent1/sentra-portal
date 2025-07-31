import { UserNav } from "@/components/auth/user-nav";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b bg-white">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-xl font-bold text-violet-600">
              Sentra Portal
            </Link>
            <UserNav />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            Welcome to Sentra Portal
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            A secure authentication system built with Next.js and NextAuth.js
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center rounded-md bg-violet-600 px-6 py-3 text-white font-medium hover:bg-violet-700 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-3 font-medium hover:bg-gray-50 transition-colors"
            >
              View Dashboard
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="h-12 w-12 bg-violet-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Secure Authentication</h3>
            <p className="text-gray-600">Email/password and OAuth authentication with industry-standard security</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">JWT Tokens</h3>
            <p className="text-gray-600">Secure token-based authentication with refresh token support</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Session Management</h3>
            <p className="text-gray-600">Redis-backed sessions with automatic expiration and renewal</p>
          </div>
        </div>
      </main>
    </div>
  );
}
