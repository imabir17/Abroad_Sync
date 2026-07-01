import { getUserSession } from '@/lib/auth'
import Link from 'next/link'
import { ArrowRight, Check, Users, BarChart3, Target, Activity, FileText, CheckCircle2 } from 'lucide-react'

export default async function LandingPage() {
  const user = await getUserSession()
  const isLoggedIn = !!user

  return (
    <div className="min-h-screen bg-[#060608] text-neutral-100 selection:bg-blue-600 selection:text-white overflow-x-hidden font-sans">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-[-10%] left-[20%] w-[50%] aspect-square rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 blur-[120px]"></div>
        <div className="absolute top-[10%] right-[15%] w-[40%] aspect-square rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 blur-[130px]"></div>
      </div>

      {/* Header */}
      <header className="border-b border-neutral-900/80 bg-[#060608]/70 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="font-bold text-white text-lg tracking-wider">A</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-neutral-200 to-neutral-400">AbroadSync</span>
          </div>

          <nav className="flex items-center space-x-4">
            {isLoggedIn ? (
              <Link 
                href="/dashboard" 
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium text-sm hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link 
                href="/login" 
                className="px-5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-200 font-medium text-sm hover:bg-neutral-800 hover:text-white transition-all duration-200"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 relative z-10 text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8 animate-in fade-in duration-700">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-blue-400 tracking-wide uppercase">All-in-One Student Recruitment CRM</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15] mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          Supercharge Your Agency’s <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500">Student Pipeline</span>
        </h1>

        <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          Manage prospective student leads, track university applications, delegate tasks to counselors, and monitor your agency's performance—all in one place.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          {isLoggedIn ? (
            <Link 
              href="/dashboard" 
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold flex items-center justify-center hover:shadow-xl hover:shadow-blue-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 group"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <Link 
              href="/login" 
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold flex items-center justify-center hover:shadow-xl hover:shadow-blue-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 group"
            >
              Access CRM
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
          <a 
            href="#pricing" 
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 font-semibold flex items-center justify-center hover:bg-neutral-900 hover:text-white transition-all duration-200"
          >
            View Pricing
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-neutral-900/60 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Built Specifically for Education Agents</h2>
          <p className="text-neutral-400 max-w-xl mx-auto">Simplify lead tracking, secure communications, and accelerate offer letter confirmations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="p-8 rounded-2xl bg-neutral-950 border border-neutral-900 hover:border-neutral-800/80 hover:-translate-y-1 transition-all duration-300 shadow-sm relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:bg-blue-600/10 transition-colors">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Lead Pipeline</h3>
            <p className="text-neutral-400 leading-relaxed text-sm">
              Seamlessly track student profiles, academic metrics, English test scores (IELTS/PTE), and preferred countries.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-8 rounded-2xl bg-neutral-950 border border-neutral-900 hover:border-neutral-800/80 hover:-translate-y-1 transition-all duration-300 shadow-sm relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:bg-indigo-600/10 transition-colors">
              <BarChart3 className="w-6 h-6 text-indigo-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Counselor Analytics</h3>
            <p className="text-neutral-400 leading-relaxed text-sm">
              Generate detailed performance logs for managers and counselors. Monitor files opened, stage conversions, and active workflows.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-8 rounded-2xl bg-neutral-950 border border-neutral-900 hover:border-neutral-800/80 hover:-translate-y-1 transition-all duration-300 shadow-sm relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:bg-purple-600/10 transition-colors">
              <Target className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Task Management</h3>
            <p className="text-neutral-400 leading-relaxed text-sm">
              Delegate critical intake tasks, track due dates, and update statuses to keep every student application moving forward.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-8 rounded-2xl bg-neutral-950 border border-neutral-900 hover:border-neutral-800/80 hover:-translate-y-1 transition-all duration-300 shadow-sm relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center mb-6 group-hover:bg-teal-600/10 transition-colors">
              <Activity className="w-6 h-6 text-teal-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Multi-Tenant Isolation</h3>
            <p className="text-neutral-400 leading-relaxed text-sm">
              Strict workspace isolation. Every company's student database, staff records, and notes are securely segregated at the database layer.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-8 rounded-2xl bg-neutral-950 border border-neutral-900 hover:border-neutral-800/80 hover:-translate-y-1 transition-all duration-300 shadow-sm relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-6 group-hover:bg-amber-600/10 transition-colors">
              <FileText className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Application Pipeline</h3>
            <p className="text-neutral-400 leading-relaxed text-sm">
              Track course offers, tuition fee deposits, visa applications, and approvals with real-time status updates.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-8 rounded-2xl bg-neutral-950 border border-neutral-900 hover:border-neutral-800/80 hover:-translate-y-1 transition-all duration-300 shadow-sm relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center mb-6 group-hover:bg-rose-600/10 transition-colors">
              <CheckCircle2 className="w-6 h-6 text-rose-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Clean User Experience</h3>
            <p className="text-neutral-400 leading-relaxed text-sm">
              A minimalist, premium interface designed for maximum productivity and lightning-fast navigations.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-24 border-t border-neutral-900/60 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Simple, Predictable Pricing</h2>
          <p className="text-neutral-400 max-w-lg mx-auto">No hidden fees, no per-user charges. Scale your recruitment agency boundlessly.</p>
        </div>

        <div className="max-w-lg mx-auto rounded-3xl bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 shadow-2xl shadow-black/80 p-8 md:p-12 relative">
          <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs uppercase tracking-widest shadow-md">
            Full Access Pass
          </div>

          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Annual License</h3>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-black text-white">$349</span>
              <span className="text-neutral-400 font-medium">USD / year</span>
            </div>
            <p className="text-neutral-400 text-sm mt-3">Billed annually. Cancel anytime.</p>
          </div>

          <div className="space-y-4 mb-10">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center mt-0.5">
                <Check className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <span className="text-sm text-neutral-300">**Unlimited users** (add as many counselors & managers as you need)</span>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center mt-0.5">
                <Check className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <span className="text-sm text-neutral-300">Complete CRM pipeline access</span>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center mt-0.5">
                <Check className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <span className="text-sm text-neutral-300">Automated PDF report exports</span>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center mt-0.5">
                <Check className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <span className="text-sm text-neutral-300">Counselor delegation & performance tracking</span>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center mt-0.5">
                <Check className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <span className="text-sm text-neutral-300">Strict database level privacy & security</span>
            </div>
          </div>

          {isLoggedIn ? (
            <Link 
              href="/dashboard" 
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link 
              href="/login" 
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              Sign In to CRM
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-[#040405] relative z-10 text-neutral-500">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
              <span className="font-bold text-white text-xs">A</span>
            </div>
            <span className="font-semibold text-neutral-300">AbroadSync</span>
          </div>

          <p>© {new Date().getFullYear()} AbroadSync. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
