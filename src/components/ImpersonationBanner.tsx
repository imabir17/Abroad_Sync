'use client'

import { useState } from 'react'
import { stopImpersonation } from '@/app/actions/saas-admin'
import { ShieldAlert, LogOut, Loader2 } from 'lucide-react'

interface ImpersonationBannerProps {
  companyName: string
}

export default function ImpersonationBanner({ companyName }: ImpersonationBannerProps) {
  const [loading, setLoading] = useState(false)

  const handleExit = async () => {
    setLoading(true)
    await stopImpersonation()
    window.location.href = '/saas-admin'
  }

  return (
    <div className="bg-amber-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md z-50 sticky top-0">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-200 animate-pulse" />
        <span>
          <strong>Platform Admin Mode:</strong> Impersonating tenant <strong>&quot;{companyName}&quot;</strong>. All actions are audit logged.
        </span>
      </div>
      <button
        onClick={handleExit}
        disabled={loading}
        className="bg-white text-amber-900 hover:bg-amber-50 px-3 py-1 rounded font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
        <span>Exit Impersonation</span>
      </button>
    </div>
  )
}
