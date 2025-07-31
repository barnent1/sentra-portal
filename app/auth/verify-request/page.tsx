import Link from "next/link"

export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-violet-100">
          <svg
            className="h-8 w-8 text-violet-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        
        <h2 className="text-3xl font-bold">Check your email</h2>
        
        <p className="text-gray-600">
          A sign in link has been sent to your email address. Please check your inbox and click the link to sign in.
        </p>
        
        <div className="pt-4">
          <Link
            href="/auth/signin"
            className="text-violet-600 hover:text-violet-500"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}