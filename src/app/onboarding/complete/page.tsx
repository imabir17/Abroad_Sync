'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { provisionCompany } from '@/app/actions/auth'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export default function OnboardingCompletePage() {
  const router = useRouter()
  const [status, setStatus] = useState<'provisioning' | 'success' | 'error'>('provisioning')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function initOnboarding() {
      try {
        const res = await provisionCompany()
        if (res?.companyId || res?.alreadyProvisioned) {
          setStatus('success')
          setTimeout(() => {
            router.replace('/dashboard')
          }, 1200)
        }
      } catch (err: any) {
        console.error('Onboarding provisioning error:', err)
        setStatus('error')
        setErrorMessage(err.message || 'Failed to complete company setup.')
      }
    }

    initOnboarding()
  }, [router])

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
          --error: #E5484D;
        }

        body {
          background: var(--bg);
          color: var(--text-1);
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        h2 {
          font-family: 'Space Grotesk', sans-serif;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          opacity: .3;
          z-index: 0;
        }

        .orb1 {
          width: 380px;
          height: 380px;
          background: var(--accent);
          top: -120px;
          left: -100px;
        }

        .orb2 {
          width: 320px;
          height: 320px;
          background: var(--teal);
          bottom: -100px;
          right: -80px;
        }
      `}</style>

      <div className="orb orb1" />
      <div className="orb orb2" />

      <div className="w-full max-w-[420px] bg-[#E7ECF3] shadow-[24px_24px_50px_#AEB9C9,-18px_-18px_40px_#FFFFFF] rounded-[32px] p-8 md:p-10 text-center space-y-6 relative z-10 border border-white/50">
        {status === 'provisioning' && (
          <div className="space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-[#E7ECF3] shadow-[6px_6px_12px_#AEB9C9,-6px_-6px_12px_#FFFFFF] flex items-center justify-center mx-auto text-[#4855E4]">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-[#202638]">Setting Up Your Workspace</h2>
            <p className="text-[#5C6478] text-xs font-semibold leading-relaxed">
              We are provisioning your company workspace and preparing your admin environment...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-[#E7ECF3] shadow-[6px_6px_12px_#AEB9C9,-6px_-6px_12px_#FFFFFF] flex items-center justify-center mx-auto text-[#12A8B5]">
              <CheckCircle2 className="h-8 w-8 animate-bounce" />
            </div>
            <h2 className="text-xl font-bold text-[#202638]">Workspace Ready!</h2>
            <p className="text-[#5C6478] text-xs font-semibold leading-relaxed">
              Your company account has been created. Redirecting to your dashboard...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-[#E7ECF3] shadow-[6px_6px_12px_#AEB9C9,-6px_-6px_12px_#FFFFFF] flex items-center justify-center mx-auto text-[#E5484D]">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-[#202638]">Setup Issue</h2>
            <p className="text-[#E5484D] text-xs font-bold leading-relaxed">
              {errorMessage || 'Failed to provision company workspace.'}
            </p>
            <button
              onClick={() => router.replace('/login')}
              className="w-full py-4 bg-gradient-to-br from-[#6E79F2] to-[#333FC2] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
