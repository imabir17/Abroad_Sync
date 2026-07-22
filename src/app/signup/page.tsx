'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { Building2, User, Mail, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react'

export default function SignupPage() {
  const [companyName, setCompanyName] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // 3D card tilt effect
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: x * 16, y: -y * 16 })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!companyName || !fullName || !email || !password) {
      setError('Please fill in all fields.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setIsPending(true)
    try {
      const supabase = createClient()
      
      let siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
      siteUrl = siteUrl.includes('http') ? siteUrl : `https://${siteUrl}`
      siteUrl = siteUrl.replace(/\/$/, '')

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${siteUrl}/onboarding/complete`,
          data: {
            fullName,
            pendingCompanyName: companyName,
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        setIsPending(false)
        return
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#E7ECF3] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

        :root {
          --bg: #E7ECF3;
          --bg-deep: #DCE3ED;
          --shadow-dark: #AEB9C9;
          --shadow-light: #FFFFFF;
          --text-1: #202638;
          --text-2: #5C6478;
          --text-3: #8891A3;
          --accent: #4855E4;
          --accent-light: #6E79F2;
          --accent-dark: #333FC2;
          --teal: #12A8B5;
          --coral: #FF7A52;
          --error: #E5484D;
        }

        body {
          background: var(--bg);
          color: var(--text-1);
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        h1, h2, h3 { 
          font-family: 'Space Grotesk', sans-serif; 
          letter-spacing: -0.02em; 
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
          animation: drift 14s ease-in-out infinite;
        }

        .orb2 {
          width: 320px;
          height: 320px;
          background: var(--teal);
          bottom: -100px;
          right: -80px;
          animation: drift 16s ease-in-out infinite reverse;
        }

        @keyframes drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, 30px) scale(1.08); }
        }
      `}</style>

      {/* Ambient Light Orbs */}
      <div className="orb orb1" />
      <div className="orb orb2" />

      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
          transition: 'transform 0.15s cubic-bezier(0.2, 0, 0.4, 1)',
        }}
        className="w-full max-w-[460px] bg-[#E7ECF3] shadow-[24px_24px_50px_#AEB9C9,-18px_-18px_40px_#FFFFFF] rounded-[32px] p-8 md:p-10 relative z-10 border border-white/50"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#E7ECF3] shadow-[6px_6px_12px_#AEB9C9,-6px_-6px_12px_#FFFFFF] flex items-center justify-center mx-auto mb-4 text-[#4855E4]">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-[#202638] tracking-tight">Create Company Account</h1>
          <p className="text-sm text-[#5C6478] mt-1 font-medium">Start managing your coaching workspace</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-[#FFEBEB] text-[#E5484D] text-xs font-semibold flex items-center gap-3 border border-[#E5484D]/20 animate-in fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center space-y-5 animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-[#E7ECF3] shadow-[6px_6px_12px_#AEB9C9,-6px_-6px_12px_#FFFFFF] flex items-center justify-center mx-auto text-[#12A8B5]">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h2 className="text-xl font-bold text-[#202638]">Check Your Email</h2>
            <p className="text-xs text-[#5C6478] leading-relaxed font-medium">
              We sent a verification link to <strong className="text-[#202638]">{email}</strong>.<br />
              Click the link in your email to activate your workspace.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-br from-[#6E79F2] to-[#333FC2] text-white text-xs font-bold rounded-2xl shadow-md hover:shadow-lg transition-all"
              >
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Company Name */}
            <div>
              <label className="block text-xs font-bold text-[#5C6478] uppercase tracking-wider mb-2">
                Company / Agency Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8891A3]" />
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Overseas Education"
                  className="w-full pl-11 pr-4 py-3.5 bg-[#E7ECF3] shadow-[inset_4px_4px_8px_#AEB9C9,inset_-4px_-4px_8px_#FFFFFF] rounded-2xl text-xs text-[#202638] placeholder-[#8891A3] font-medium outline-none focus:ring-2 focus:ring-[#4855E4]/40 transition-all"
                />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-[#5C6478] uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8891A3]" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full pl-11 pr-4 py-3.5 bg-[#E7ECF3] shadow-[inset_4px_4px_8px_#AEB9C9,inset_-4px_-4px_8px_#FFFFFF] rounded-2xl text-xs text-[#202638] placeholder-[#8891A3] font-medium outline-none focus:ring-2 focus:ring-[#4855E4]/40 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-[#5C6478] uppercase tracking-wider mb-2">
                Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8891A3]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@company.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-[#E7ECF3] shadow-[inset_4px_4px_8px_#AEB9C9,inset_-4px_-4px_8px_#FFFFFF] rounded-2xl text-xs text-[#202638] placeholder-[#8891A3] font-medium outline-none focus:ring-2 focus:ring-[#4855E4]/40 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-[#5C6478] uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8891A3]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-11 py-3.5 bg-[#E7ECF3] shadow-[inset_4px_4px_8px_#AEB9C9,inset_-4px_-4px_8px_#FFFFFF] rounded-2xl text-xs text-[#202638] placeholder-[#8891A3] font-medium outline-none focus:ring-2 focus:ring-[#4855E4]/40 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8891A3] hover:text-[#202638] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-4 bg-gradient-to-br from-[#6E79F2] to-[#333FC2] text-white text-xs font-bold rounded-2xl shadow-[6px_6px_14px_#AEB9C9,-6px_-6px_14px_#FFFFFF] hover:shadow-lg active:translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Workspace...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-[#DCE3ED] text-center">
          <p className="text-xs text-[#5C6478] font-medium">
            Already have an account?{' '}
            <Link href="/login" className="text-[#4855E4] font-bold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
