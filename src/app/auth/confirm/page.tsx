'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ShieldCheck, ShieldAlert, Loader2, RefreshCw } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

function ConfirmPageContent() {
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
        }, 1200)
      }
    }

    verify()
  }, [searchParams, router])

  return (
    <div className="w-full max-w-[420px] bg-[#E7ECF3] shadow-[24px_24px_50px_#AEB9C9,-18px_-18px_40px_#FFFFFF] rounded-[32px] p-8 md:p-10 text-center space-y-6 animate-in fade-in duration-300 relative z-10">
      {status === 'verifying' && (
        <div className="space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-[#E7ECF3] shadow-[6px_6px_12px_#AEB9C9,-6px_-6px_12px_#FFFFFF] flex items-center justify-center mx-auto text-[#4855E4]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-[#202638] font-display">Verifying Link</h2>
          <p className="text-[#5C6478] text-xs font-semibold leading-relaxed">
            Please wait a moment while we verify your secure access token...
          </p>
        </div>
      )}

      {status === 'success' && (
        <div className="space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-[#E7ECF3] shadow-[6px_6px_12px_#AEB9C9,-6px_-6px_12px_#FFFFFF] flex items-center justify-center mx-auto text-[#12A8B5]">
            <ShieldCheck className="h-8 w-8 animate-bounce" />
          </div>
          <h2 className="text-xl font-bold text-[#202638] font-display">Verified Successfully</h2>
          <p className="text-[#5C6478] text-xs font-semibold leading-relaxed">
            Secure session established. Redirecting you to your workspace destination...
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-[#E7ECF3] shadow-[6px_6px_12px_#AEB9C9,-6px_-6px_12px_#FFFFFF] flex items-center justify-center mx-auto text-[#E5484D]">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-[#202638] font-display">Verification Failed</h2>
          <p className="text-[#E5484D] text-xs font-bold leading-relaxed">
            {errorMessage || 'The verification link is invalid or has expired.'}
          </p>
          <button 
            onClick={() => router.replace('/login')}
            className="w-full py-4 bg-gradient-to-br from-[#6E79F2] to-[#333FC2] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg active:translate-y-0.5 transition-all"
          >
            Go to Login
          </button>
        </div>
      )}
    </div>
  )
}

export default function AuthConfirmPage() {
  return (
    <div className="min-h-screen bg-[#E7ECF3] flex flex-col justify-center items-center p-6 text-[#202638] relative overflow-hidden font-sans">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        :root {
          --bg: #E7ECF3;
          --shadow-dark: #AEB9C9;
          --shadow-light: #FFFFFF;
          --text-1: #202638;
          --text-2: #5C6478;
          --accent: #4855E4;
          --teal: #12A8B5;
        }

        body {
          background: var(--bg);
          color: var(--text-1);
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        h2 { 
          font-family: 'Space Grotesk', sans-serif; 
          letter-spacing: -0.02em; 
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          opacity: .35;
          z-index: 0;
        }

        .orb1 {
          width: 350px;
          height: 350px;
          background: var(--accent);
          top: -100px;
          left: -80px;
          animation: drift 15s ease-in-out infinite;
        }

        .orb2 {
          width: 300px;
          height: 300px;
          background: var(--teal);
          bottom: -100px;
          right: -80px;
          animation: drift 18s ease-in-out infinite reverse;
        }

        @keyframes drift {
          0%, 100% { transform: translate(0,0); }
          50% { transform: translate(25px,-20px); }
        }
      `}</style>

      {/* Orbs */}
      <div className="orb orb1 pointer-events-none"></div>
      <div className="orb orb2 pointer-events-none"></div>

      {/* Theme Toggle Button */}
      <div className="absolute top-6 right-6 z-30">
        <ThemeToggle />
      </div>

      <Suspense fallback={
        <div className="w-full max-w-[420px] bg-[#E7ECF3] shadow-[24px_24px_50px_#AEB9C9,-18px_-18px_40px_#FFFFFF] rounded-[32px] p-8 md:p-10 text-center space-y-5 animate-in fade-in duration-200 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-[#E7ECF3] shadow-[6px_6px_12px_#AEB9C9,-6px_-6px_12px_#FFFFFF] flex items-center justify-center mx-auto text-[#4855E4]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-[#202638] font-display">Loading Verification...</h2>
        </div>
      }>
        <ConfirmPageContent />
      </Suspense>
    </div>
  )
}
