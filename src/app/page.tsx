import Link from 'next/link'
import { ArrowRight, CheckCircle2, Globe2, LineChart, Users, Mail, GraduationCap } from 'lucide-react'

export default function LandingPage() {
  const salesEmail = "sales@abroadsync.com"

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Navigation */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Globe2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
              AbroadSync
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href={`mailto:${salesEmail}`}
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Contact Sales
            </a>
            <Link 
              href="/login" 
              className="text-sm font-medium px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full hover:bg-indigo-100 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        {/* Background Decorative Blob */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-medium mb-8 animate-in slide-in-from-bottom-4 duration-500">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600"></span>
            The #1 CRM for Study Abroad Agencies
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 animate-in slide-in-from-bottom-4 duration-700">
            Scale your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">consultancy</span> <br className="hidden md:block" /> with precision.
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg text-slate-600 mb-10 animate-in slide-in-from-bottom-4 duration-1000">
            Manage leads, track pipeline stages, coordinate your counselors, and generate beautiful analytics reports—all in one unified platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in duration-1000 delay-300">
            <a 
              href={`mailto:${salesEmail}?subject=Inquiry about AbroadSync SaaS`}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <Mail className="w-5 h-5" />
              Contact Sales to Buy
            </a>
            <a 
              href="#features"
              className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 rounded-full font-semibold transition-all flex items-center justify-center gap-2"
            >
              Explore Features
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need to succeed</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Built from the ground up specifically for education consultants and study abroad agencies.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 text-indigo-600">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Multi-Tenant Counselor Management</h3>
              <p className="text-slate-600">Easily invite staff, assign roles, and distribute leads. Each counselor gets a personalized dashboard for their pipeline.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 text-indigo-600">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Student Pipeline Tracking</h3>
              <p className="text-slate-600">Track students from "New Lead" all the way to "Visa Approved". Detailed profiles for English proficiency, academics, and notes.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 text-indigo-600">
                <LineChart className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Beautiful PDF Reports</h3>
              <p className="text-slate-600">Generate high-quality vector PDF reports instantly. Track leads handed, active pipeline, and file open rates by counselor.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Simple, transparent pricing</h2>
              <p className="text-slate-600">One package. Every feature. Unmatched value for your agency.</p>
            </div>

            <div className="bg-white rounded-3xl border border-indigo-100 shadow-2xl shadow-indigo-100/50 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-3 bg-indigo-600 text-white text-xs font-bold uppercase tracking-wide rounded-bl-xl">
                All-Inclusive SaaS
              </div>
              
              <div className="p-8 sm:p-12 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-8">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Agency Premium</h3>
                  <p className="text-slate-600">Everything required to manage a modern study abroad consultancy.</p>
                </div>
                <div className="text-center sm:text-right">
                  <div className="flex items-end justify-center sm:justify-end gap-1">
                    <span className="text-5xl font-extrabold text-slate-900">$340</span>
                    <span className="text-slate-500 font-medium mb-1">/ year</span>
                  </div>
                </div>
              </div>

              <div className="p-8 sm:p-12 bg-slate-50">
                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 mb-10">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    <span className="text-slate-700 font-medium">Unlimited Counselors</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    <span className="text-slate-700 font-medium">Unlimited Leads & Applications</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    <span className="text-slate-700 font-medium">Vector PDF Reporting</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    <span className="text-slate-700 font-medium">Advanced Task Management</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    <span className="text-slate-700 font-medium">Automated Pipeline Tracking</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    <span className="text-slate-700 font-medium">Priority Email Support</span>
                  </div>
                </div>

                <a 
                  href={`mailto:${salesEmail}?subject=Sign me up for Agency Premium ($340/yr)`}
                  className="block w-full py-4 px-8 text-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md transition-all hover:-translate-y-1"
                >
                  Contact Sales to Buy Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Globe2 className="w-6 h-6 text-indigo-600" />
            <span className="text-xl font-bold text-slate-900">AbroadSync</span>
          </div>
          <p className="text-slate-500 mb-6">Empowering study abroad agencies worldwide.</p>
          <div className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} AbroadSync. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
