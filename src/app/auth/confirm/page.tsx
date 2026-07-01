'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react'

export default function AuthConfirmPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const verify = async () => {
      const token_hash = searchParams.get('token_hash')
      const type = searchParams.get('type')
      const next = searchParams.get('next') ?? '/update-password'

      if (!token_hash || !type) {
        setStatus('error')
        setErrorMessage('Invalid verification link')
        return
      }

      const supabase = createClient()
      
      const { error } = await supabase.auth.verifyOtp({
        type: type as any,
        token_hash,
      })

      if (error) {
        console.error('Verification error:', error)
        setStatus('error')
        setErrorMessage(error.message)
      } else {
        setStatus('success')
        // Short delay for visual feedback, then redirect
        setTimeout(() => {
          router.replace(next)
        }, 1000)
      }
    }

    verify()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center p-4 text-neutral-100">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-xl p-8 shadow-2xl text-center space-y-6">
        {status === 'verifying' && (
          <>
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-white">Verifying Link</h2>
            <p className="text-neutral-400 text-sm">Please wait while we secure your session...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <ShieldCheck className="h-12 w-12 text-emerald-500 mx-auto" />
            <h2 className="text-xl font-bold text-white">Verified Successfully</h2>
            <p className="text-neutral-400 text-sm">Redirecting you to your destination...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <ShieldAlert className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold text-white">Verification Failed</h2>
            <p className="text-red-400 text-sm">{errorMessage || 'The link is invalid or has expired.'}</p>
            <button 
              onClick={() => router.replace('/login')}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
            >
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  )
}
