'use client'

import { updatePassword } from '@/app/actions/auth'
import { useActionState, useState } from 'react'
import { ShieldAlert, ShieldCheck, Shield } from 'lucide-react'

export default function UpdatePasswordPage() {
  const [state, formAction] = useActionState(updatePassword, { error: '' })
  const [password, setPassword] = useState('')

  const getPasswordStrength = () => {
    if (password.length === 0) return { label: 'None', color: 'text-neutral-500', icon: <Shield className="w-4 h-4" /> }
    if (password.length < 6) return { label: 'Weak', color: 'text-red-500', icon: <ShieldAlert className="w-4 h-4" /> }
    if (password.length < 10) return { label: 'Fair', color: 'text-yellow-500', icon: <Shield className="w-4 h-4" /> }
    
    // Check for mix of chars
    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecial = /[^A-Za-z0-9]/.test(password)
    
    const criteriaCount = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length
    
    if (criteriaCount >= 3) return { label: 'Strong', color: 'text-green-500', icon: <ShieldCheck className="w-4 h-4" /> }
    return { label: 'Good', color: 'text-blue-500', icon: <Shield className="w-4 h-4" /> }
  }

  const strength = getPasswordStrength()

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-neutral-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-white">
          Set New Password
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-400">
          Please enter a secure password for your account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-neutral-900 py-8 px-4 shadow-xl shadow-black/50 sm:rounded-xl sm:px-10 border border-neutral-800">
          <form className="space-y-6" action={formAction}>
            {state?.error && <div className="text-red-400 text-sm mb-4 text-center">{state.error}</div>}
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-300">
                New Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-neutral-700 rounded-md shadow-sm bg-neutral-950 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
                />
              </div>
              
              <div className="mt-2 flex items-center justify-between text-xs">
                <div className={`flex items-center gap-1 font-medium ${strength.color}`}>
                  {strength.icon} {strength.label} Password
                </div>
                {password.length > 0 && password.length < 6 && (
                  <span className="text-red-400">At least 6 characters required</span>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-300">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
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
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
