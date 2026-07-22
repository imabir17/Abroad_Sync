import { getUserSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function SaasAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUserSession()

  // Restrict access strictly to Platform Admin email
  const platformAdminEmail = 'sheikhabirrahaman@gmail.com'
  if (!user || user.email?.toLowerCase() !== platformAdminEmail) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#202638] font-sans">
      <header className="bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-[#6B7280] hover:text-[#374151] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6E79F2] to-[#333FC2] flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path d="M2 12L22 4L14 22L11 14L2 12Z" fill="white"/>
              </svg>
            </div>
            <h1 className="font-bold text-lg tracking-tight">SaaS Admin Center</h1>
          </div>
        </div>
      </header>
      <main className="p-6 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  )
}
