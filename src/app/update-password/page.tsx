'use client'

import { useActionState, useState } from 'react'
import { updatePassword } from '@/app/actions/auth'
import { ShieldAlert, ShieldCheck, Shield, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'

export default function UpdatePasswordPage() {
  const [state, formAction, isPending] = useActionState(updatePassword, { error: '' })
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const getPasswordStrength = () => {
    if (password.length === 0) return { label: 'None', color: 'text-[#8891A3]', icon: <Shield className="w-4 h-4" /> }
    if (password.length < 6) return { label: 'Weak', color: 'text-[#E5484D]', icon: <ShieldAlert className="w-4 h-4" /> }
    if (password.length < 10) return { label: 'Fair', color: 'text-[#FF7A52]', icon: <Shield className="w-4 h-4" /> }
    
    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecial = /[^A-Za-z0-9]/.test(password)
    
    const criteriaCount = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length
    
    if (criteriaCount >= 3) return { label: 'Strong', color: 'text-[#12A8B5]', icon: <ShieldCheck className="w-4 h-4" /> }
    return { label: 'Good', color: 'text-[#4855E4]', icon: <Shield className="w-4 h-4" /> }
  }

  const strength = getPasswordStrength()

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
          <h2 className="text-2xl font-bold text-[#202638] mb-2">Set New Password</h2>
          <p className="text-xs text-[#5C6478]">
            Please enter a secure, strong password for your user account.
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

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-[10px] font-bold text-[#5C6478] uppercase tracking-wider mb-2">
              New Password
            </label>
            <div className="rounded-xl p-1 pr-3 pl-4 bg-[#E7ECF3] shadow-[inset_5px_5px_10px_#AEB9C9,inset_-5px_-5px_10px_#FFFFFF] flex items-center gap-3 focus-within:shadow-[inset_6px_6px_12px_#AEB9C9,inset_-6px_-6px_12px_#FFFFFF] transition-all">
              <Lock className="w-4 h-4 text-[#8891A3] shrink-0" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                id="password" 
                name="password"
                placeholder="••••••••" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-none bg-transparent outline-none w-full py-3.5 text-xs text-[#202638]"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-[#8891A3] hover:text-[#202638] transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            {/* Password strength indicators */}
            <div className="mt-2.5 flex items-center justify-between text-[10px] font-bold">
              <div className={`flex items-center gap-1.5 ${strength.color}`}>
                {strength.icon} {strength.label} Strength
              </div>
              {password.length > 0 && password.length < 6 && (
                <span className="text-[#E5484D]">At least 6 characters required</span>
              )}
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-[10px] font-bold text-[#5C6478] uppercase tracking-wider mb-2">
              Confirm Password
            </label>
            <div className="rounded-xl p-1 pr-3 pl-4 bg-[#E7ECF3] shadow-[inset_5px_5px_10px_#AEB9C9,inset_-5px_-5px_10px_#FFFFFF] flex items-center gap-3 focus-within:shadow-[inset_6px_6px_12px_#AEB9C9,inset_-6px_-6px_12px_#FFFFFF] transition-all">
              <Lock className="w-4 h-4 text-[#8891A3] shrink-0" />
              <input 
                type={showConfirmPassword ? 'text' : 'password'} 
                id="confirmPassword" 
                name="confirmPassword"
                placeholder="••••••••" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border-none bg-transparent outline-none w-full py-3.5 text-xs text-[#202638]"
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="p-1 text-[#8891A3] hover:text-[#202638] transition-colors"
                aria-label={showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
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
            <span>{isPending ? 'Updating...' : 'Update Password'}</span>
          </button>
        </form>

      </div>
    </div>
  )
}
