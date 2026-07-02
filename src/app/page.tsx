import { getUserSession } from '@/lib/auth'
import Link from 'next/link'
import { ArrowRight, Check, Users, BarChart3, Target, Activity, FileText, CheckCircle2, Mail, TrendingUp, Globe, Calendar, GraduationCap } from 'lucide-react'

export default async function LandingPage() {
  const user = await getUserSession()
  const isLoggedIn = !!user

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-200 selection:text-blue-900 overflow-x-hidden font-sans">
      {/* Background Gradients - Light & Punchy */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[800px] pointer-events-none overflow-hidden opacity-60">
        <div className="absolute top-[-10%] left-[10%] w-[50%] aspect-square rounded-full bg-gradient-to-br from-blue-400/40 to-sky-400/40 blur-[100px]"></div>
        <div className="absolute top-[20%] right-[10%] w-[40%] aspect-square rounded-full bg-gradient-to-br from-blue-400/40 to-cyan-400/40 blur-[120px]"></div>
      </div>

      {/* Header */}
      <header className="border-b border-slate-200/60 bg-white/70 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src="/logo.jpg" alt="AbroadSync Logo" className="w-10 h-10 rounded-xl shadow-lg shadow-blue-500/20 object-cover" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-sky-700 ml-1">AbroadSync</span>
          </div>

          <nav className="flex items-center space-x-4">
            <a href="mailto:sales@abroadsync.com" className="hidden md:flex items-center text-slate-600 hover:text-blue-600 font-medium text-sm transition-colors mr-4">
              <Mail className="w-4 h-4 mr-2" />
              Contact Sales
            </a>
            {isLoggedIn ? (
              <Link 
                href="/dashboard" 
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 text-white font-medium text-sm hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                Dashboard
              </Link>
            ) : (
              <Link 
                href="/login" 
                className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium text-sm hover:border-blue-300 hover:text-blue-700 hover:shadow-sm transition-all duration-200"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 relative z-10 text-center">
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-100 border border-blue-200 mb-8 animate-in fade-in duration-700 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="text-xs font-bold text-blue-700 tracking-wide uppercase">The CRM for Educational Consultancies</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.15] mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          Stop Losing Students to <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-sky-600">Messy Spreadsheets</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          From the first inquiry to final visa approval, centralize your entire study abroad agency. Let your counselors focus on what they do best: placing students.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <a 
            href="mailto:sales@abroadsync.com" 
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 text-white font-semibold flex items-center justify-center hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 group"
          >
            Book a Demo
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </a>
          <a 
            href="#features" 
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold flex items-center justify-center hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm"
          >
            See How It Works
          </a>
        </div>
      </section>

      {/* The Problem & What Makes Us Different */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-blue-600 font-bold tracking-wider uppercase text-sm mb-3">The Reality</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">Generic CRMs don't work for education.</h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-6">
              Juggling data across Excel, WhatsApp, and generic "sales" CRMs leads to lost follow-ups, scattered documents, and reporting blind spots. You spend hours trying to force a sales pipeline to track "IELTS Scores" or "Bachelor's CGPA."
            </p>
            <div className="space-y-4">
              <div className="flex items-start">
                <CheckCircle2 className="w-6 h-6 text-blue-500 mr-3 shrink-0 mt-0.5" />
                <p className="text-slate-700"><strong>Built Specifically for Education:</strong> Native tracking for academic history, English tests (IELTS/PTE), and study preferences.</p>
              </div>
              <div className="flex items-start">
                <CheckCircle2 className="w-6 h-6 text-blue-500 mr-3 shrink-0 mt-0.5" />
                <p className="text-slate-700"><strong>True Application Tracking:</strong> Manage multiple university applications for a single student, not just generic "Deals."</p>
              </div>
              <div className="flex items-start">
                <CheckCircle2 className="w-6 h-6 text-blue-500 mr-3 shrink-0 mt-0.5" />
                <p className="text-slate-700"><strong>"File Opened" Metrics:</strong> Native tracking for the most critical conversion metric in your industry.</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-sky-100 rounded-3xl transform rotate-3 scale-105 -z-10"></div>
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl">
              <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">The AbroadSync Advantage</h3>
              <ul className="space-y-5">
                <li className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Setup Time</span>
                  <span className="text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full text-sm">Instant (Day 1)</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Customization Costs</span>
                  <span className="text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full text-sm">$0</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Student Profiling</span>
                  <span className="text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full text-sm">360° Comprehensive</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Application Tracking</span>
                  <span className="text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full text-sm">Multi-University</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="bg-white border-y border-slate-200 py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Core Features Designed for Your Agency</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">Everything you need to capture leads, counsel students, and process applications efficiently.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">360° Student Profiles</h3>
              <p className="text-slate-600 leading-relaxed">
                Capture everything in one place: academic history, IELTS/PTE scores, target countries, and budget constraints.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-6 text-sky-600 group-hover:scale-110 transition-transform">
                <Activity className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Streamlined Workflow</h3>
              <p className="text-slate-600 leading-relaxed">
                Centralized interaction logs, automated task management, and effortless lead assignment among counselors.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-6 text-indigo-600 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Powerful Reporting</h3>
              <p className="text-slate-600 leading-relaxed">
                Visual dashboards for conversion tracking. See exactly which counselors are opening the most files in real-time.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-6 text-amber-500 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Multi-University Apps</h3>
              <p className="text-slate-600 leading-relaxed">
                Seamlessly track multiple applications per student to different universities and countries simultaneously.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-6 text-rose-500 group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">One-Click PDF Exports</h3>
              <p className="text-slate-600 leading-relaxed">
                Generate clean, branded PDF summaries of student profiles for partner universities or internal reviews instantly.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-6 text-emerald-500 group-hover:scale-110 transition-transform">
                <Globe className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Enterprise Security</h3>
              <p className="text-slate-600 leading-relaxed">
                Multi-tenant architecture supports multiple branches. Strict data isolation ensures complete privacy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">A Day in the Life</h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">How AbroadSync transforms your daily operations step-by-step.</p>
        </div>

        <div className="space-y-12 max-w-4xl mx-auto relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
          
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-slate-50 bg-blue-100 text-blue-600 font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">1</div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="text-xl font-bold text-slate-900 mb-2">Capture & Assign</h4>
              <p className="text-slate-600">A new inquiry comes in. They are instantly added and assigned to a Senior Counselor.</p>
            </div>
          </div>

          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-slate-50 bg-sky-100 text-sky-600 font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">2</div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="text-xl font-bold text-slate-900 mb-2">Counsel & Gather</h4>
              <p className="text-slate-600">The counselor adds IELTS scores, previous CGPA, and budget directly into the profile, logging interaction notes.</p>
            </div>
          </div>

          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-slate-50 bg-blue-100 text-blue-600 font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">3</div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="text-xl font-bold text-slate-900 mb-2">Commit (File Opened)</h4>
              <p className="text-slate-600">The student agrees to proceed. The file is marked as "Opened" and automated tasks are created for document collection.</p>
            </div>
          </div>

          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-slate-50 bg-amber-100 text-amber-600 font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">4</div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="text-xl font-bold text-slate-900 mb-2">Apply & Track</h4>
              <p className="text-slate-600">Applications are sent to multiple universities. Statuses are updated in real-time as universities respond.</p>
            </div>
          </div>

          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-slate-50 bg-emerald-100 text-emerald-600 font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">5</div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="text-xl font-bold text-slate-900 mb-2">Analyze Performance</h4>
              <p className="text-slate-600">You review the dashboard, seeing a clear overview of converted leads, pending applications, and counselor ROI.</p>
            </div>
          </div>

        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-slate-600 max-w-xl mx-auto text-lg">One flat rate for full access. No hidden fees or per-user pricing.</p>
        </div>

        <div className="max-w-lg mx-auto rounded-[2.5rem] bg-white border border-slate-200 shadow-xl p-10 relative overflow-hidden">
          {/* Limited Offer Badge */}
          <div className="absolute top-0 right-0 bg-rose-500 text-white text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-bl-xl shadow-sm">
            Short Term Offer
          </div>

          <div className="text-center mb-8 pt-4">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Full Access License</h3>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-slate-400 font-bold text-2xl line-through">$449</span>
              <span className="text-5xl font-black text-blue-600">$349</span>
              <span className="text-slate-500 font-medium">USD / year</span>
            </div>
            <p className="text-emerald-600 font-medium text-sm bg-emerald-50 inline-block px-3 py-1 rounded-full">Save $100 annually</p>
          </div>

          <div className="space-y-4 mb-10">
            <div className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-blue-500 mr-3 shrink-0 mt-0.5" />
              <span className="text-slate-700">Unlimited users (Counselors & Managers)</span>
            </div>
            <div className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-blue-500 mr-3 shrink-0 mt-0.5" />
              <span className="text-slate-700">Complete CRM & Application Tracking</span>
            </div>
            <div className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-blue-500 mr-3 shrink-0 mt-0.5" />
              <span className="text-slate-700">Automated PDF Report Exports</span>
            </div>
            <div className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-blue-500 mr-3 shrink-0 mt-0.5" />
              <span className="text-slate-700">Counselor Performance Analytics</span>
            </div>
          </div>

          <a 
            href="mailto:sales@abroadsync.com" 
            className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 text-white font-bold text-lg flex items-center justify-center hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-1 transition-all duration-300"
          >
            <Mail className="w-5 h-5 mr-2" />
            Contact Sales to Claim Offer
          </a>
        </div>
      </section>

      {/* ROI Section */}
      <section className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
        <div className="rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-800 p-10 md:p-16 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-500/20 blur-[100px] rounded-full pointer-events-none"></div>
          
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 relative z-10">A Revenue Multiplier, Not an Expense</h2>
          <p className="text-slate-300 text-lg md:text-xl max-w-3xl mx-auto relative z-10">
            Save 10+ hours a week on data entry. Prevent leads from slipping through the cracks. Scale your agency faster with standardized processes.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 relative z-10 text-slate-500">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
          <div className="flex items-center space-x-2">
            <img src="/logo.jpg" alt="AbroadSync Logo" className="w-8 h-8 rounded-lg shadow-md object-cover" />
            <span className="font-bold text-slate-900 text-lg ml-1">AbroadSync</span>
          </div>

          <div className="flex items-center space-x-6">
            <a href="mailto:sales@abroadsync.com" className="hover:text-blue-600 transition-colors">sales@abroadsync.com</a>
            <span>© {new Date().getFullYear()} AbroadSync. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
