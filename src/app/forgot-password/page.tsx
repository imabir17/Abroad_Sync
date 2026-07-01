'use client'

import { resetPassword } from '@/app/actions/auth'
import { useActionState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [state, formAction] = useActionState(resetPassword, { error: '' } as any)

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-neutral-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-white">
          Reset Password
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-400">
          Enter your email to receive a password reset link
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-neutral-900 py-8 px-4 shadow-xl shadow-black/50 sm:rounded-xl sm:px-10 border border-neutral-800">
          <form className="space-y-6" action={formAction}>
            {state?.error && <div className="text-red-400 text-sm mb-4 text-center">{state.error}</div>}
            {state?.success && <div className="text-green-400 text-sm mb-4 text-center">{state.success}</div>}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-300">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-neutral-700 rounded-md shadow-sm bg-neutral-950 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-neutral-900 transition-colors duration-200"
              >
                Send Reset Link
              </button>
            </div>
            
            <div className="text-center mt-4">
              <Link href="/login" className="text-sm text-blue-500 hover:text-blue-400">
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
