'use client'

import { useActionState, useState } from 'react'
import { resetPassword } from '@/app/actions/auth'
import Link from 'next/link'
import { Mail, ArrowLeft, Check, AlertCircle } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(resetPassword, { error: '', success: '' } as any)
  const [email, setEmail] = useState('')

  return (
    <div className="min-h-screen bg-[#E7ECF3] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        :root {
          --bg: #E7ECF3;
          --shadow-dark: #AEB9C9;
          --shadow-light: #FFFFFF;
          --text-1: #202638;
          --text-2: #5C6478;
          --text-3: #8891A3;
          --accent: #4855E4;
          --accent-light: #6E79F2;
          --accent-dark: #333FC2;
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

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .animate-spin-custom {
          animation: spin .7s linear infinite;
        }
      `}</style>

      {/* Orbs */}
      <div className="orb orb1 pointer-events-none"></div>
      <div className="orb orb2 pointer-events-none"></div>

      {/* Theme Toggle Button */}
      <div className="absolute top-6 right-6 z-30">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-[460px] rounded-[32px] bg-[#E7ECF3] shadow-[24px_24px_50px_#AEB9C9,-18px_-18px_40px_#FFFFFF] p-8 md:p-10 animate-in fade-in slide-in-from-bottom-6 duration-500">
        
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6E79F2] to-[#333FC2] shadow-[4px_4px_10px_#AEB9C9,-4px_4px_10px_#FFFFFF] flex items-center justify-center">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path d="M2 12L22 4L14 22L11 14L2 12Z" fill="white"/>
            </svg>
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#202638] mb-2">Forgot Password</h2>
          <p className="text-xs text-[#5C6478]">
            Enter your email to receive a secure password recovery link.
          </p>
        </div>

        <form action={formAction} className="space-y-5">
          {/* Error Message */}
          {state?.error && (
            <div className="flex items-center gap-2 text-xs text-[#E5484D] bg-[#E5484D]/8 p-3.5 rounded-xl shadow-sm border border-[#E5484D]/10">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          {/* Success Message */}
          {state?.success && (
            <div className="flex items-center gap-2 text-xs text-[#12A8B5] bg-[#12A8B5]/8 p-3.5 rounded-xl shadow-sm border border-[#12A8B5]/10">
              <Check className="w-4.5 h-4.5 shrink-0" />
              <span>{state.success}</span>
            </div>
          )}

          {/* Email input field */}
          <div>
            <label htmlFor="email" className="block text-[10px] font-bold text-[#5C6478] uppercase tracking-wider mb-2">
              Email address
            </label>
            <div className="rounded-xl p-1 pr-4 pl-4 bg-[#E7ECF3] shadow-[inset_5px_5px_10px_#AEB9C9,inset_-5px_-5px_10px_#FFFFFF] flex items-center gap-3 focus-within:shadow-[inset_6px_6px_12px_#AEB9C9,inset_-6px_-6px_12px_#FFFFFF] transition-all">
              <Mail className="w-4 h-4 text-[#8891A3] shrink-0" />
              <input 
                type="email" 
                id="email" 
                name="email"
                placeholder="you@agency.com" 
                autoComplete="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-none bg-transparent outline-none w-full py-3.5 text-xs text-[#202638]"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className={`w-full py-4 rounded-xl font-bold text-xs text-white bg-gradient-to-br from-[#6E79F2] to-[#333FC2] shadow-[7px_7px_16px_rgba(51,63,194,0.28),-6px_-6px_14px_rgba(255,255,255,0.7)] hover:shadow-[9px_9px_20px_rgba(51,63,194,0.34),-7px_-7px_16px_rgba(255,255,255,0.8)] active:translate-y-0.5 transition-all duration-150 flex items-center justify-center gap-2 ${
              isPending ? 'opacity-85 pointer-events-none' : ''
            }`}
          >
            {isPending && <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin-custom"></span>}
            <span>{isPending ? 'Sending...' : 'Send Recovery Link'}</span>
          </button>
        </form>

        <div className="text-center mt-8">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4855E4] hover:text-[#333FC2] group transition-all">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to Login
          </Link>
        </div>

      </div>
    </div>
  )
}
