'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  GraduationCap, 
  Globe, 
  CheckCircle2, 
  Activity, 
  Users, 
  BarChart3, 
  FileText, 
  Mail, 
  ArrowRight, 
  Menu, 
  X, 
  ShieldCheck, 
  FileSpreadsheet, 
  Plus, 
  MessageSquare, 
  Check 
} from 'lucide-react'

export default function LandingPageClient({
  isLoggedIn,
  plans = [],
}: {
  isLoggedIn: boolean
  plans?: any[]
}) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [landingCycle, setLandingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  // Track window scroll for nav shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Reveal elements on scroll
  useEffect(() => {
    const revealEls = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            observer.unobserve(e.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    revealEls.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // 3D card tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    // Scale rotation angles
    setTilt({ x: x * 18, y: -y * 18 })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
  }

  return (
    <div className="min-h-screen font-sans selection:bg-blue-200 selection:text-blue-900 overflow-x-hidden antialiased">
      {/* CSS Styles Integration */}
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
          --radius-lg: 28px;
          --radius-md: 18px;
          --radius-sm: 12px;
          --dist: 9px;
          --blur: 18px;
        }

        body {
          background: var(--bg);
          color: var(--text-1);
          font-family: 'Plus Jakarta Sans', sans-serif;
          line-height: 1.5;
        }

        h1, h2, h3, .display { 
          font-family: 'Space Grotesk', sans-serif; 
          letter-spacing: -0.02em; 
        }
        
        .mono { 
          font-family: 'JetBrains Mono', monospace; 
          letter-spacing: 0.04em; 
        }

        /* Neomorphic Primitives */
        .neo-raised {
          background: var(--bg);
          border-radius: var(--radius-lg);
          box-shadow:
            var(--dist) var(--dist) var(--blur) var(--shadow-dark),
            calc(var(--dist) * -1) calc(var(--dist) * -1) var(--blur) var(--shadow-light);
        }

        .neo-pressed {
          background: var(--bg);
          border-radius: var(--radius-md);
          box-shadow:
            inset 6px 6px 12px var(--shadow-dark),
            inset -6px -6px 12px var(--shadow-light);
        }

        .neo-flat {
          background: var(--bg);
          border-radius: var(--radius-md);
          box-shadow:
            6px 6px 12px var(--shadow-dark),
            -6px -6px 12px var(--shadow-light);
        }

        .neo-inline {
          background: var(--bg);
          border-radius: 999px;
          box-shadow:
            4px 4px 8px var(--shadow-dark),
            -4px -4px 8px var(--shadow-light);
        }

        /* Reveal on scroll */
        .reveal { 
          opacity: 0; 
          transform: translateY(28px); 
          transition: opacity .8s cubic-bezier(.16,.84,.44,1), transform .8s cubic-bezier(.16,.84,.44,1); 
        }
        
        .reveal.in { 
          opacity: 1; 
          transform: translateY(0); 
        }
        
        .reveal.d1 { transition-delay: .08s; }
        .reveal.d2 { transition-delay: .16s; }
        .reveal.d3 { transition-delay: .24s; }
        .reveal.d4 { transition-delay: .32s; }
        .reveal.d5 { transition-delay: .4s; }

        /* Animation utilities */
        @keyframes bob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }

        .animate-bob-1 { animation: bob 5s ease-in-out infinite; }
        .animate-bob-2 { animation: bob 5s ease-in-out infinite 1.4s; }
        .animate-bob-3 { animation: bob 5s ease-in-out infinite 2.6s; }
      `}</style>

      {/* Header / Navigation */}
      <nav className={`fixed top-0 left-0 w-full z-50 py-4 transition-all duration-300 ${
        isScrolled ? 'bg-[#E7ECF3]/75 backdrop-blur-md shadow-[0_8px_24px_-12px_rgba(32,38,56,0.18)]' : ''
      }`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 font-bold text-lg text-[#202638]">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6E79F2] to-[#333FC2] shadow-[5px_5px_10px_#AEB9C9,-5px_5px_10px_#FFFFFF] flex items-center justify-center">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M2 12L22 4L14 22L11 14L2 12Z" fill="white"/>
              </svg>
            </div>
            <span className="font-bold tracking-tight text-xl font-display text-[#202638]">AbroadSync</span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex gap-1 p-1.5 neo-pressed items-center">
            <a href="#product" className="px-5 py-2 rounded-full text-sm font-semibold text-[#5C6478] hover:text-[#202638] hover:shadow-[inset_3px_3px_7px_#AEB9C9,inset_-3px_-3px_7px_#FFFFFF] transition-all duration-200">Product</a>
            <a href="#pipeline" className="px-5 py-2 rounded-full text-sm font-semibold text-[#5C6478] hover:text-[#202638] hover:shadow-[inset_3px_3px_7px_#AEB9C9,inset_-3px_-3px_7px_#FFFFFF] transition-all duration-200">Pipeline</a>
            <a href="#access" className="px-5 py-2 rounded-full text-sm font-semibold text-[#5C6478] hover:text-[#202638] hover:shadow-[inset_3px_3px_7px_#AEB9C9,inset_-3px_-3px_7px_#FFFFFF] transition-all duration-200">Access</a>
            <a href="#pricing" className="px-5 py-2 rounded-full text-sm font-semibold text-[#5C6478] hover:text-[#202638] hover:shadow-[inset_3px_3px_7px_#AEB9C9,inset_-3px_-3px_7px_#FFFFFF] transition-all duration-200">Pricing</a>
          </div>

          <div className="hidden md:flex gap-4 items-center">
            {isLoggedIn ? (
              <Link href="/dashboard" className="px-5 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-br from-[#6E79F2] to-[#333FC2] hover:shadow-[9px_9px_20px_rgba(51,63,194,0.4),-7px_-7px_16px_rgba(255,255,255,0.8)] active:translate-y-0.5 transition-all duration-150">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="px-5 py-2.5 rounded-full text-sm font-bold text-[#202638] bg-[#E7ECF3] shadow-[6px_6px_12px_#AEB9C9,-6px_-6px_12px_#FFFFFF] hover:shadow-[8px_8px_16px_#AEB9C9,-8px_-8px_16px_#FFFFFF] transition-all duration-200">
                  Sign In
                </Link>
                <Link href="/signup" className="px-5 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-br from-[#6E79F2] to-[#333FC2] hover:shadow-[9px_9px_20px_rgba(51,63,194,0.4),-7px_-7px_16px_rgba(255,255,255,0.8)] active:translate-y-0.5 transition-all duration-150">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl bg-[#E7ECF3] shadow-[4px_4px_8px_#AEB9C9,-4px_-4px_8px_#FFFFFF] active:shadow-[inset_2px_2px_4px_#AEB9C9,inset_-2px_-2px_4px_#FFFFFF] text-[#202638] transition-all duration-200"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-[#E7ECF3] border-b border-[#AEB9C9]/30 p-6 flex flex-col gap-4 shadow-xl z-40">
            <a 
              href="#product" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-3 px-4 rounded-xl text-[#5C6478] hover:text-[#202638] active:shadow-[inset_3px_3px_6px_#AEB9C9,inset_-3px_-3px_6px_#FFFFFF] transition-all font-semibold"
            >
              Product
            </a>
            <a 
              href="#pipeline" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-3 px-4 rounded-xl text-[#5C6478] hover:text-[#202638] active:shadow-[inset_3px_3px_6px_#AEB9C9,inset_-3px_-3px_6px_#FFFFFF] transition-all font-semibold"
            >
              Pipeline
            </a>
            <a 
              href="#access" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-3 px-4 rounded-xl text-[#5C6478] hover:text-[#202638] active:shadow-[inset_3px_3px_6px_#AEB9C9,inset_-3px_-3px_6px_#FFFFFF] transition-all font-semibold"
            >
              Access
            </a>
            <a 
              href="#pricing" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-3 px-4 rounded-xl text-[#5C6478] hover:text-[#202638] active:shadow-[inset_3px_3px_6px_#AEB9C9,inset_-3px_-3px_6px_#FFFFFF] transition-all font-semibold"
            >
              Pricing
            </a>
            <div className="h-[1px] bg-[#AEB9C9]/30 my-2"></div>
            {isLoggedIn ? (
              <Link 
                href="/dashboard" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-3.5 px-5 text-center rounded-full font-bold text-white bg-gradient-to-br from-[#6E79F2] to-[#333FC2]"
              >
                Go to Dashboard
              </Link>
            ) : (
              <div className="flex flex-col gap-3">
                <Link 
                  href="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-3 text-center rounded-full font-bold text-[#202638] bg-[#E7ECF3] shadow-[4px_4px_8px_#AEB9C9,-4px_-4px_8px_#FFFFFF]"
                >
                  Sign In
                </Link>
                <Link 
                  href="/signup" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-3.5 text-center rounded-full font-bold text-white bg-gradient-to-br from-[#6E79F2] to-[#333FC2]"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="pt-32 pb-20 px-6 relative">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="eyebrow inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#333FC2] neo-inline mb-6">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF7A52] shadow-[0_0_0_4px_rgba(255,122,82,0.18)]"></span>
              BUILT FOR STUDY ABROAD CONSULTANCIES
            </span>
            <h1 className="reveal in text-4xl md:text-6xl font-bold font-display leading-[1.08] text-[#202638] mb-6">
              Every application,<br />tracked from inquiry<br />to <span className="text-[#4855E4]">visa stamp.</span>
            </h1>
            <p className="reveal in d1 text-[#5C6478] text-base md:text-lg max-w-lg mb-8">
              AbroadSync replaces the spreadsheet chaos of student recruitment with one pipeline — academic history, test scores, university applications, and counselor follow-ups, all in sync.
            </p>
            <div className="hero-actions reveal in d2 flex flex-wrap gap-4 items-center mb-10">
              <Link href="/signup" className="px-7 py-3.5 rounded-full text-base font-bold text-white bg-gradient-to-br from-[#6E79F2] to-[#333FC2] hover:shadow-[9px_9px_20px_rgba(51,63,194,0.4),-7px_-7px_16px_rgba(255,255,255,0.8)] active:translate-y-0.5 transition-all duration-150">
                Start free trial
              </Link>
              <a href="#pipeline" className="px-7 py-3.5 rounded-full text-base font-bold text-[#202638] bg-[#E7ECF3] shadow-[6px_6px_12px_#AEB9C9,-6px_-6px_12px_#FFFFFF] hover:shadow-[8px_8px_16px_#AEB9C9,-8px_-8px_16px_#FFFFFF] transition-all duration-200">
                See the pipeline ↓
              </a>
            </div>
            <div className="trust-row reveal in d3 flex gap-8 flex-wrap pt-4 border-t border-[#AEB9C9]/20">
              <div className="flex flex-col">
                <span className="font-display text-2xl font-bold text-[#202638]">12,400+</span>
                <span className="text-xs text-[#8891A3]">Students tracked</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display text-2xl font-bold text-[#202638]">340</span>
                <span className="text-xs text-[#8891A3]">Partner universities</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display text-2xl font-bold text-[#202638]">98%</span>
                <span className="text-xs text-[#8891A3]">On-time follow-ups</span>
              </div>
            </div>
          </div>

          {/* Interactive 3D Card Stage */}
          <div className="stage reveal in d2 relative h-[450px] w-full flex items-center justify-center perspective-[1400px]">
            <div 
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="card3d w-80 h-[390px] rounded-[26px] bg-[#E7ECF3] relative transform-style-preserve-3d shadow-[22px_22px_44px_#AEB9C9,-18px_-18px_40px_#FFFFFF] transition-transform duration-100 ease-out p-6"
              style={{
                transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) translateZ(0)`
              }}
            >
              {/* Inner container with inner-shadow styling */}
              <div className="absolute inset-3.5 rounded-[18px] bg-gradient-to-br from-[#EEF2F7] to-[#DEE5EF] shadow-[inset_4px_4px_10px_#AEB9C9,inset_-4px_-4px_10px_#FFFFFF] pointer-events-none"></div>
              
              <div className="relative z-10 h-full flex flex-col transform translate-z-[30px]">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-semibold text-[#8891A3] tracking-wider font-mono">STUDENT FILE · #A2291</span>
                  <span className="text-[9px] font-bold px-2 py-1 rounded-full text-white bg-gradient-to-br from-[#21C285] to-[#159a68] shadow-[3px_3px_8px_rgba(21,154,104,.4)] rotate-[6deg]">
                    OFFER RECEIVED
                  </span>
                </div>
                
                <div className="w-16 h-16 rounded-2xl margin mt-5 mb-3 bg-gradient-to-br from-[#6E79F2] to-[#333FC2] shadow-[6px_6px_14px_#AEB9C9,-6px_-6px_14px_#FFFFFF] flex items-center justify-center text-white font-display font-bold text-2xl">
                  FR
                </div>
                
                <div className="font-display font-bold text-lg text-[#202638]">Farhan Rahman</div>
                <div className="text-xs text-[#8891A3] mt-0.5">B.Sc → M.Sc Computer Science</div>
                
                <div className="h-[1px] bg-gradient-to-r from-transparent via-[#AEB9C9] to-transparent my-4"></div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#8891A3]">Destination</span>
                    <span className="text-[#202638] font-bold">Toronto, CA</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#8891A3]">IELTS</span>
                    <span className="text-[#202638] font-bold">7.5 Overall</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#8891A3]">Counselor</span>
                    <span className="text-[#202638] font-bold">S. Chowdhury</span>
                  </div>
                </div>
                
                <div className="mt-auto flex gap-2">
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full text-[#5C6478] bg-[#E7ECF3] shadow-[3px_3px_7px_#AEB9C9,-3px_-3px_7px_#FFFFFF]">Fall 2027</span>
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full text-[#5C6478] bg-[#E7ECF3] shadow-[3px_3px_7px_#AEB9C9,-3px_-3px_7px_#FFFFFF]">3 Applications</span>
                </div>
              </div>
            </div>

            {/* Floating Badges */}
            <div className="absolute top-6 left-0 bg-[#E7ECF3] px-3.5 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-bold text-[#202638] shadow-[10px_10px_22px_#AEB9C9,-8px_-8px_20px_#FFFFFF] animate-bob-1">
              <Check className="w-4 h-4 text-[#12A8B5]" /> Test verified
            </div>
            <div className="absolute bottom-10 right-0 bg-[#E7ECF3] px-3.5 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-bold text-[#202638] shadow-[10px_10px_22px_#AEB9C9,-8px_-8px_20px_#FFFFFF] animate-bob-2">
              <Activity className="w-4 h-4 text-[#FF7A52]" /> Next task in 2d
            </div>
            <div className="absolute top-1/2 -right-6 bg-[#E7ECF3] px-3.5 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-bold text-[#202638] shadow-[10px_10px_22px_#AEB9C9,-8px_-8px_20px_#FFFFFF] animate-bob-3">
              <GraduationCap className="w-4 h-4 text-[#4855E4]" /> 3 unis compared
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="max-w-6xl mx-auto mt-16 stats-strip reveal">
          <div className="stats-panel neo-pressed grid grid-cols-2 md:grid-cols-4 gap-6 p-8">
            <div className="text-center p-3">
              <div className="font-display text-2xl md:text-3xl font-bold text-[#333FC2]">360°</div>
              <div className="text-xs text-[#8891A3] mt-1.5">Student profile per lead</div>
            </div>
            <div className="text-center p-3 border-l border-[#AEB9C9]/20">
              <div className="font-display text-2xl md:text-3xl font-bold text-[#333FC2]">Multi-uni</div>
              <div className="text-xs text-[#8891A3] mt-1.5">Application tracking</div>
            </div>
            <div className="text-center p-3 border-l border-[#AEB9C9]/20">
              <div className="font-display text-2xl md:text-3xl font-bold text-[#333FC2]">Row-level</div>
              <div className="text-xs text-[#8891A3] mt-1.5">Security by role</div>
            </div>
            <div className="text-center p-3 border-l border-[#AEB9C9]/20">
              <div className="font-display text-2xl md:text-3xl font-bold text-[#333FC2]">1-click</div>
              <div className="text-xs text-[#8891A3] mt-1.5">Branded PDF export</div>
            </div>
          </div>
        </div>
      </header>

      {/* Pipeline Section */}
      <section id="pipeline" className="py-20 px-6">
        <div className="max-w-6xl mx-auto bg-[#DCE3ED] rounded-[48px] p-8 md:p-14 shadow-[var(--dist)_var(--dist)_var(--blur)_#AEB9C9,calc(var(--dist)*-1)_calc(var(--dist)*-1)_var(--blur)_#FFFFFF]">
          <div className="max-w-xl mb-12 reveal">
            <span className="text-[11px] font-bold font-mono text-[#12A8B5] tracking-widest block mb-3">THE PIPELINE</span>
            <h2 className="text-2xl md:text-4xl font-bold text-[#202638] mb-4">From first inquiry to boarding pass.</h2>
            <p className="text-[#5C6478] text-sm md:text-base">
              Every lead moves through five real stages. Counselors always know exactly where a student stands — and what to do next.
            </p>
          </div>

          <div className="relative mt-12 reveal overflow-hidden">
            {/* SVG Flight Path Line */}
            <svg className="w-full h-auto min-h-[60px]" viewBox="0 0 1000 120" preserveAspectRatio="none">
              <path 
                id="flightPath" 
                d="M 60 60 Q 250 10, 500 60 T 940 60" 
                fill="none" 
                stroke="#B7C1D2" 
                strokeWidth="2" 
                strokeDasharray="2 10" 
                strokeLinecap="round" 
              />
              <circle r="6" fill="#4855E4">
                <animateMotion dur="7s" repeatCount="indefinite" rotate="auto">
                  <mpath href="#flightPath"/>
                </animateMotion>
              </circle>
            </svg>

            {/* Nodes Row */}
            <div className="grid grid-cols-5 gap-3 -mt-10">
              <div className="text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6E79F2] to-[#333FC2] shadow-[7px_7px_15px_#AEB9C9,-7px_-7px_15px_#FFFFFF] flex items-center justify-center text-white">
                  <Plus className="w-5 h-5" />
                </div>
                <div className="font-bold text-xs md:text-sm text-[#202638] mt-3">New</div>
                <div className="text-[10px] text-[#8891A3] hidden md:block mt-1">Lead captured</div>
              </div>

              <div className="text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-[#DCE3ED] shadow-[6px_6px_12px_#AEB9C9,-6px_-6px_12px_#FFFFFF] flex items-center justify-center text-[#5C6478]">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="font-bold text-xs md:text-sm text-[#202638] mt-3">Contacted</div>
                <div className="text-[10px] text-[#8891A3] hidden md:block mt-1">First response logged</div>
              </div>

              <div className="text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-[#DCE3ED] shadow-[6px_6px_12px_#AEB9C9,-6px_-6px_12px_#FFFFFF] flex items-center justify-center text-[#5C6478]">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="font-bold text-xs md:text-sm text-[#202638] mt-3">Applied</div>
                <div className="text-[10px] text-[#8891A3] hidden md:block mt-1">Sent to universities</div>
              </div>

              <div className="text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-[#DCE3ED] shadow-[6px_6px_12px_#AEB9C9,-6px_-6px_12px_#FFFFFF] flex items-center justify-center text-[#5C6478]">
                  <Check className="w-5 h-5" />
                </div>
                <div className="font-bold text-xs md:text-sm text-[#202638] mt-3">Offer</div>
                <div className="text-[10px] text-[#8891A3] hidden md:block mt-1">Admission received</div>
              </div>

              <div className="text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-[#DCE3ED] shadow-[6px_6px_12px_#AEB9C9,-6px_-6px_12px_#FFFFFF] flex items-center justify-center text-[#5C6478]">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 12L22 4L14 22L11 14L2 12Z" />
                  </svg>
                </div>
                <div className="font-bold text-xs md:text-sm text-[#202638] mt-3">Visa</div>
                <div className="text-[10px] text-[#8891A3] hidden md:block mt-1">Departure ready</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="product" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-xl mb-12 reveal">
            <span className="text-[11px] font-bold font-mono text-[#teal] tracking-widest block mb-3">PRODUCT</span>
            <h2 className="text-2xl md:text-4xl font-bold text-[#202638] mb-4">Built around how counselors actually work.</h2>
            <p className="text-[#5C6478] text-sm md:text-base">
              Not a generic sales CRM with fields renamed. Every screen matches the shape of a study-abroad application.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="feat-card neo-flat p-8 hover:-translate-y-1.5 transition-all duration-300 reveal">
              <div className="w-12 h-12 rounded-2xl bg-[#E7ECF3] shadow-[inset_4px_4px_8px_#AEB9C9,inset_-4px_-4px_8px_#FFFFFF] flex items-center justify-center text-[#4855E4] mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-[#202638] font-bold text-lg mb-2">360° student profiles</h3>
              <p className="text-xs text-[#5C6478] leading-relaxed">
                SSC/HSC grades, degrees, IELTS/PTE/TOEFL/Duolingo scores, budget, and destination preferences in one file.
              </p>
            </div>

            <div className="feat-card neo-flat p-8 hover:-translate-y-1.5 transition-all duration-300 reveal d1">
              <div className="w-12 h-12 rounded-2xl bg-[#E7ECF3] shadow-[inset_4px_4px_8px_#AEB9C9,inset_-4px_-4px_8px_#FFFFFF] flex items-center justify-center text-[#12A8B5] mb-6">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-[#202638] font-bold text-lg mb-2">Multi-university tracking</h3>
              <p className="text-xs text-[#5C6478] leading-relaxed">
                Run several live applications per student side by side, each with its own status and requirements.
              </p>
            </div>

            <div className="feat-card neo-flat p-8 hover:-translate-y-1.5 transition-all duration-300 reveal d2">
              <div className="w-12 h-12 rounded-2xl bg-[#E7ECF3] shadow-[inset_4px_4px_8px_#AEB9C9,inset_-4px_-4px_8px_#FFFFFF] flex items-center justify-center text-[#FF7A52] mb-6">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-[#202638] font-bold text-lg mb-2">Shared timeline</h3>
              <p className="text-xs text-[#5C6478] leading-relaxed">
                A chronological feed of counselor notes, comments, and file changes — nothing gets lost in someone's inbox.
              </p>
            </div>

            <div className="feat-card neo-flat p-8 hover:-translate-y-1.5 transition-all duration-300 reveal">
              <div className="w-12 h-12 rounded-2xl bg-[#E7ECF3] shadow-[inset_4px_4px_8px_#AEB9C9,inset_-4px_-4px_8px_#FFFFFF] flex items-center justify-center text-[#4855E4] mb-6">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-[#202638] font-bold text-lg mb-2">Timezone-aware tasks</h3>
              <p className="text-xs text-[#5C6478] leading-relaxed">
                Follow-up agendas and tasks that respect where your counselors and students actually are.
              </p>
            </div>

            <div className="feat-card neo-flat p-8 hover:-translate-y-1.5 transition-all duration-300 reveal d1">
              <div className="w-12 h-12 rounded-2xl bg-[#E7ECF3] shadow-[inset_4px_4px_8px_#AEB9C9,inset_-4px_-4px_8px_#FFFFFF] flex items-center justify-center text-[#12A8B5] mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-[#202638] font-bold text-lg mb-2">Role-based permissions</h3>
              <p className="text-xs text-[#5C6478] leading-relaxed">
                Super Admin, Manager, and Counselor roles with row-level database access — people only see what's theirs.
              </p>
            </div>

            <div className="feat-card neo-flat p-8 hover:-translate-y-1.5 transition-all duration-300 reveal d2">
              <div className="w-12 h-12 rounded-2xl bg-[#E7ECF3] shadow-[inset_4px_4px_8px_#AEB9C9,inset_-4px_-4px_8px_#FFFFFF] flex items-center justify-center text-[#FF7A52] mb-6">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-[#202638] font-bold text-lg mb-2">Branded PDF export</h3>
              <p className="text-xs text-[#5C6478] leading-relaxed">
                One click turns a student file into a clean, submission-ready profile for partner universities or reviews.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Access Control section */}
      <section id="access" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-xl mb-12 reveal">
            <span className="text-[11px] font-bold font-mono text-[#333FC2] tracking-widest block mb-3">ACCESS CONTROL</span>
            <h2 className="text-2xl md:text-4xl font-bold text-[#202638] mb-4">Everyone sees exactly their lane.</h2>
            <p className="text-[#5C6478] text-sm md:text-base">
              Three roles, scoped by company and by ownership — designed so counselors can move fast without stepping on each other's work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="role-card neo-flat p-8 reveal">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6E79F2] to-[#333FC2] flex items-center justify-center text-white shrink-0 shadow-md">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#202638]">Super Admin</h3>
                  <div className="text-[11px] text-[#8891A3] mt-0.5">Owns company workspace</div>
                </div>
              </div>
              <div className="space-y-3.5">
                <div className="flex items-start gap-2.5 text-xs text-[#5C6478]">
                  <Check className="w-4 h-4 text-[#12A8B5] mt-0.5 shrink-0" />
                  <span>Invite and manage staff members</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-[#5C6478]">
                  <Check className="w-4 h-4 text-[#12A8B5] mt-0.5 shrink-0" />
                  <span>View every student lead company-wide</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-[#5C6478]">
                  <Check className="w-4 h-4 text-[#12A8B5] mt-0.5 shrink-0" />
                  <span>Perform bulk transfers & reassignments</span>
                </div>
              </div>
            </div>

            <div className="role-card neo-flat p-8 reveal d1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#3FC7CE] to-[#0F8A94] flex items-center justify-center text-white shrink-0 shadow-md">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#202638]">Manager</h3>
                  <div className="text-[11px] text-[#8891A3] mt-0.5">Runs counselor team</div>
                </div>
              </div>
              <div className="space-y-3.5">
                <div className="flex items-start gap-2.5 text-xs text-[#5C6478]">
                  <Check className="w-4 h-4 text-[#12A8B5] mt-0.5 shrink-0" />
                  <span>Build team conversion and performance reports</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-[#5C6478]">
                  <Check className="w-4 h-4 text-[#12A8B5] mt-0.5 shrink-0" />
                  <span>Transfer leads between assigned counselors</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-[#5C6478]">
                  <Check className="w-4 h-4 text-[#12A8B5] mt-0.5 shrink-0" />
                  <span>Monitor lead activities and pipelines</span>
                </div>
              </div>
            </div>

            <div className="role-card neo-flat p-8 reveal d2">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF9B78] to-[#E85C33] flex items-center justify-center text-white shrink-0 shadow-md">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#202638]">Counselor</h3>
                  <div className="text-[11px] text-[#8891A3] mt-0.5">Works assigned students</div>
                </div>
              </div>
              <div className="space-y-3.5">
                <div className="flex items-start gap-2.5 text-xs text-[#5C6478]">
                  <Check className="w-4 h-4 text-[#12A8B5] mt-0.5 shrink-0" />
                  <span>Manage and update their own lead files</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-[#5C6478]">
                  <Check className="w-4 h-4 text-[#12A8B5] mt-0.5 shrink-0" />
                  <span>Log interaction notes and upcoming tasks</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-[#5C6478]">
                  <Check className="w-4 h-4 text-[#12A8B5] mt-0.5 shrink-0" />
                  <span>Export student files to branded PDFs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing and CTA section */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 reveal">
            <span className="text-[11px] font-bold font-mono text-[#333FC2] tracking-widest block mb-3">PRICING PLANS</span>
            <h2 className="text-3xl md:text-5xl font-bold text-[#202638] font-display">Simple, transparent pricing.</h2>
            <p className="text-[#5C6478] text-sm md:text-base mt-3 max-w-xl mx-auto font-medium">
              Start free with no credit card required. Upgrade anytime as your agency grows.
            </p>

            {/* Monthly / Yearly Toggle */}
            <div className="mt-8 inline-flex p-1.5 neo-pressed items-center gap-2">
              <button
                onClick={() => setLandingCycle('monthly')}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                  landingCycle === 'monthly'
                    ? 'bg-gradient-to-br from-[#6E79F2] to-[#333FC2] text-white shadow-md'
                    : 'text-[#5C6478] hover:text-[#202638]'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setLandingCycle('yearly')}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  landingCycle === 'yearly'
                    ? 'bg-gradient-to-br from-[#6E79F2] to-[#333FC2] text-white shadow-md'
                    : 'text-[#5C6478] hover:text-[#202638]'
                }`}
              >
                <span>Yearly Billing</span>
                <span className="px-2 py-0.5 bg-[#12A8B5] text-white text-[9px] font-extrabold rounded-full">Save & Free Setup</span>
              </button>
            </div>
          </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch reveal">
            {plans && plans.length > 0 ? (
              plans
                .filter((p) => p.isPublic && (p.billingCycle === landingCycle || p.billingCycle === 'free'))
                .map((plan) => {
                  const isPopular = plan.name.toLowerCase().includes('basic') || plan.name.toLowerCase().includes('pro')
                  return (
                    <div
                      key={plan.id}
                      className={`neo-raised p-8 rounded-[2rem] flex flex-col justify-between relative border ${
                        isPopular
                          ? 'border-[#6E79F2]/30 shadow-[14px_14px_30px_#AEB9C9,-12px_-12px_26px_#FFFFFF]'
                          : 'border-white/40'
                      }`}
                    >
                      {isPopular && (
                        <div className="absolute top-0 right-0 bg-[#4855E4] text-white text-[9px] font-bold tracking-wider py-1 px-3 rounded-bl-xl">
                          POPULAR
                        </div>
                      )}
                      <div>
                        <span className="text-xs font-bold text-[#4855E4] uppercase tracking-wider block mb-2 font-mono">
                          {plan.billingCycle.toUpperCase()}
                        </span>
                        <h3 className="text-2xl font-bold text-[#202638] mb-2 font-display">{plan.name}</h3>
                        <div className="flex items-baseline gap-1 mb-2">
                          <span className="text-4xl font-black text-[#4855E4] font-display">${plan.priceUsd}</span>
                          <span className="text-[#5C6478] font-medium text-xs">
                            / {plan.billingCycle === 'free' ? 'lifetime' : plan.billingCycle}
                          </span>
                        </div>
                        {plan.billingCycle === 'monthly' && plan.setupFeeUsd > 0 ? (
                          <p className="text-[10px] text-[#FF7A52] font-semibold mb-4">
                            + ${plan.setupFeeUsd} one-time setup fee (new customers only)
                          </p>
                        ) : (
                          <p className="text-[10px] text-[#12A8B5] font-semibold mb-4">No setup fee</p>
                        )}
                        <div className="space-y-3 pt-4 border-t border-[#AEB9C9]/20 mb-8 text-xs text-[#5C6478]">
                          <div className="flex items-center gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-[#12A8B5] shrink-0" />
                            <span>{plan.userLimit === null ? 'Unlimited seats' : `${plan.userLimit} Team Seats`}</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-[#12A8B5] shrink-0" />
                            <span>
                              {plan.leadLimitPerMonth === null
                                ? 'Unlimited Leads / month'
                                : `${plan.leadLimitPerMonth} Leads / month`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-[#12A8B5] shrink-0" />
                            <span>Full CRM & Matrix Features</span>
                          </div>
                        </div>
                      </div>
                      <Link
                        href="/signup"
                        className={`w-full py-3.5 rounded-full font-bold text-center text-xs transition-all ${
                          isPopular
                            ? 'bg-gradient-to-br from-[#6E79F2] to-[#333FC2] text-white hover:shadow-[7px_7px_16px_rgba(51,63,194,0.35)]'
                            : 'bg-[#E7ECF3] shadow-[6px_6px_12px_#AEB9C9,-6px_-6px_12px_#FFFFFF] text-[#202638] hover:shadow-[8px_8px_16px_#AEB9C9,-8px_-8px_16px_#FFFFFF]'
                        }`}
                      >
                        Get Started with {plan.name}
                      </Link>
                    </div>
                  )
                })
            ) : (
              /* Fallback Static Cards */
              <>
                <div className="neo-raised p-8 rounded-[2rem] flex flex-col justify-between relative border border-white/40">
                  <div>
                    <span className="text-xs font-bold text-[#12A8B5] uppercase tracking-wider block mb-2 font-mono">STARTER</span>
                    <h3 className="text-2xl font-bold text-[#202638] mb-2 font-display">Free</h3>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-4xl font-black text-[#202638] font-display">$0</span>
                      <span className="text-[#5C6478] font-medium text-xs">/ lifetime</span>
                    </div>
                    <p className="text-xs text-[#5C6478] mb-6 leading-relaxed">Perfect for new agencies getting started with student recruitment.</p>
                    <div className="space-y-3 pt-4 border-t border-[#AEB9C9]/20 mb-8 text-xs text-[#5C6478]">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#12A8B5] shrink-0" />
                        <span>2 Team Seats (1 Manager + 1 Counselor)</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#12A8B5] shrink-0" />
                        <span>100 Student Leads / month</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#12A8B5] shrink-0" />
                        <span>Full Application & Lead Pipeline</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/signup"
                    className="w-full py-3.5 rounded-full bg-[#E7ECF3] shadow-[6px_6px_12px_#AEB9C9,-6px_-6px_12px_#FFFFFF] text-[#202638] font-bold text-center text-xs hover:shadow-[8px_8px_16px_#AEB9C9,-8px_-8px_16px_#FFFFFF] transition-all"
                  >
                    Sign Up Free
                  </Link>
                </div>

                <div className="neo-raised p-8 rounded-[2rem] flex flex-col justify-between relative border border-[#6E79F2]/30 shadow-[14px_14px_30px_#AEB9C9,-12px_-12px_26px_#FFFFFF]">
                  <div className="absolute top-0 right-0 bg-[#4855E4] text-white text-[9px] font-bold tracking-wider py-1 px-3 rounded-bl-xl">
                    POPULAR
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#4855E4] uppercase tracking-wider block mb-2 font-mono">GROWING AGENCIES</span>
                    <h3 className="text-2xl font-bold text-[#202638] mb-2 font-display">Basic</h3>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-4xl font-black text-[#4855E4] font-display">
                        {landingCycle === 'monthly' ? '$35' : '$399'}
                      </span>
                      <span className="text-[#5C6478] font-medium text-xs">
                        / {landingCycle === 'monthly' ? 'month' : 'year'}
                      </span>
                    </div>
                    {landingCycle === 'monthly' ? (
                      <p className="text-[10px] text-[#FF7A52] font-semibold mb-4">+ $20 setup fee (new customers only)</p>
                    ) : (
                      <p className="text-[10px] text-[#12A8B5] font-semibold mb-4">Setup fee waived for yearly</p>
                    )}
                    <p className="text-xs text-[#5C6478] mb-6 leading-relaxed">Ideal for established consultancy teams expanding counselor operations.</p>
                    <div className="space-y-3 pt-4 border-t border-[#AEB9C9]/20 mb-8 text-xs text-[#5C6478]">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#12A8B5] shrink-0" />
                        <span>20 Team Seats</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#12A8B5] shrink-0" />
                        <span>Unlimited Leads</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/signup"
                    className="w-full py-3.5 rounded-full bg-gradient-to-br from-[#6E79F2] to-[#333FC2] text-white font-bold text-center text-xs hover:shadow-[7px_7px_16px_rgba(51,63,194,0.35)] transition-all"
                  >
                    Get Started with Basic
                  </Link>
                </div>

                <div className="neo-raised p-8 rounded-[2rem] flex flex-col justify-between relative border border-white/40">
                  <div>
                    <span className="text-xs font-bold text-[#FF7A52] uppercase tracking-wider block mb-2 font-mono">ENTERPRISE SCALE</span>
                    <h3 className="text-2xl font-bold text-[#202638] mb-2 font-display">Pro</h3>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-4xl font-black text-[#202638] font-display">
                        {landingCycle === 'monthly' ? '$70' : '$799'}
                      </span>
                      <span className="text-[#5C6478] font-medium text-xs">
                        / {landingCycle === 'monthly' ? 'month' : 'year'}
                      </span>
                    </div>
                    {landingCycle === 'monthly' ? (
                      <p className="text-[10px] text-[#FF7A52] font-semibold mb-4">+ $20 setup fee (new customers only)</p>
                    ) : (
                      <p className="text-[10px] text-[#12A8B5] font-semibold mb-4">Setup fee waived for yearly</p>
                    )}
                    <p className="text-xs text-[#5C6478] mb-6 leading-relaxed">Built for high-volume consultancies with multi-counselor branches.</p>
                    <div className="space-y-3 pt-4 border-t border-[#AEB9C9]/20 mb-8 text-xs text-[#5C6478]">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#12A8B5] shrink-0" />
                        <span>100 Team Seats</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#12A8B5] shrink-0" />
                        <span className="font-bold text-[#202638]">Unlimited Leads / month</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/signup"
                    className="w-full py-3.5 rounded-full bg-[#E7ECF3] shadow-[6px_6px_12px_#AEB9C9,-6px_-6px_12px_#FFFFFF] text-[#202638] font-bold text-center text-xs hover:shadow-[8px_8px_16px_#AEB9C9,-8px_-8px_16px_#FFFFFF] transition-all"
                  >
                    Get Started with Pro
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* CTA Box Section */}
      <section className="pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="cta-panel neo-raised p-8 md:p-16 text-center relative overflow-hidden reveal">
            {/* Blurred background Orbs */}
            <div className="absolute w-72 h-72 rounded-full filter blur-[60px] opacity-[0.25] bg-[#4855E4] -top-24 -left-20 pointer-events-none"></div>
            <div className="absolute w-72 h-72 rounded-full filter blur-[60px] opacity-[0.25] bg-[#12A8B5] -bottom-24 -right-20 pointer-events-none"></div>
            
            <h2 className="text-2xl md:text-4xl font-bold text-[#202638] mb-4 font-display">Stop tracking students in spreadsheets.</h2>
            <p className="text-[#5C6478] text-sm md:text-base max-w-md mx-auto mb-8 font-medium">
              Set up your workspace in a few minutes and move your first lead through the pipeline today.
            </p>
            <Link 
              href="/signup" 
              className="px-8 py-3.5 rounded-full font-bold text-white bg-gradient-to-br from-[#6E79F2] to-[#333FC2] inline-flex items-center gap-2 hover:shadow-[9px_9px_20px_rgba(51,63,194,0.4),-7px_-7px_16px_rgba(255,255,255,0.8)] active:translate-y-0.5 transition-all duration-150"
            >
              Start free trial <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[#AEB9C9]/20 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6E79F2] to-[#333FC2] flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path d="M2 12L22 4L14 22L11 14L2 12Z" fill="white"/>
              </svg>
            </div>
            <span className="font-bold text-[#202638] tracking-tight">AbroadSync</span>
          </div>

          <div className="flex gap-6 text-xs text-[#8891A3]">
            <a href="#product" className="hover:text-[#202638] transition-colors">Product</a>
            <a href="#pipeline" className="hover:text-[#202638] transition-colors">Pipeline</a>
            <a href="#access" className="hover:text-[#202638] transition-colors">Access</a>
            <a href="mailto:abroadsync@gmail.com" className="hover:text-[#202638] transition-colors">abroadsync@gmail.com</a>
          </div>

          <div className="text-xs text-[#8891A3]">
            © {new Date().getFullYear()} AbroadSync. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
