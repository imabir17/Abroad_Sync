'use client'

import { useState } from 'react'
import { submitPublicLeadForm } from '@/app/actions/forms'
import { GraduationCap, CheckCircle2, Loader2, Send } from 'lucide-react'

export default function PublicFormClient({ form }: { form: any }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    lastStudyLevel: 'HSC / A-Levels',
    preferredStudyLevel: "Bachelor's",
    preferredCountry: 'United Kingdom',
    preferredCourse: '',
    preferredIntake: 'Fall 2026',
    englishTestStatus: 'Planning',
    englishTestType: 'IELTS',
    englishTestScore: '',
    initialNote: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const fc = form.fieldsConfig || {}

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg(null)

    const res = await submitPublicLeadForm(form.id, formData)
    setIsSubmitting(false)

    if (res.error) {
      setErrorMsg(res.error)
    } else {
      setIsSubmitted(true)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-[#E7ECF3] flex items-center justify-center p-6 text-center font-sans">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-xl border border-white/60">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-6 shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[#111827] mb-3">Submission Received!</h2>
          <p className="text-sm text-[#4B5563] leading-relaxed mb-6">
            Thank you for reaching out to <span className="font-semibold text-[#111827]">{form.company?.name || 'our agency'}</span>. One of our senior education counselors will contact you shortly.
          </p>
          <button
            onClick={() => {
              setIsSubmitted(false)
              setFormData({
                fullName: '',
                email: '',
                phone: '',
                lastStudyLevel: 'HSC / A-Levels',
                preferredStudyLevel: "Bachelor's",
                preferredCountry: 'United Kingdom',
                preferredCourse: '',
                preferredIntake: 'Fall 2026',
                englishTestStatus: 'Planning',
                englishTestType: 'IELTS',
                englishTestScore: '',
                initialNote: '',
              })
            }}
            className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#374151] transition-all"
          >
            Submit Another Response
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] via-[#EEF2F7] to-[#E7ECF3] py-12 px-4 font-sans text-[#111827] flex justify-center items-center">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-white/80 overflow-hidden">
        {/* Form Header */}
        <div className="bg-gradient-to-br from-[#4855E4] to-[#333FC2] p-8 text-white relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-bold tracking-wider uppercase opacity-90">{form.company?.name || 'AbroadSync'}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-display mb-2">{form.title}</h1>
          {form.description && (
            <p className="text-xs md:text-sm text-white/80 leading-relaxed font-medium">{form.description}</p>
          )}
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600">
              {errorMsg}
            </div>
          )}

          {/* Full Name (Required) */}
          <div>
            <label className="block text-xs font-bold text-[#374151] uppercase tracking-wider mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Tanvir Hossain"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-[#D1D5DB] text-sm focus:outline-none focus:ring-2 focus:ring-[#4855E4] focus:border-transparent transition-all"
            />
          </div>

          {/* Phone & Email Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fc.phone !== false && (
              <div>
                <label className="block text-xs font-bold text-[#374151] uppercase tracking-wider mb-1.5">
                  Phone Number {fc.phoneReq && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="tel"
                  required={fc.phoneReq}
                  placeholder="+880 1700 000000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#D1D5DB] text-sm focus:outline-none focus:ring-2 focus:ring-[#4855E4] focus:border-transparent transition-all"
                />
              </div>
            )}

            {fc.email !== false && (
              <div>
                <label className="block text-xs font-bold text-[#374151] uppercase tracking-wider mb-1.5">
                  Email Address {fc.emailReq && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="email"
                  required={fc.emailReq}
                  placeholder="student@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#D1D5DB] text-sm focus:outline-none focus:ring-2 focus:ring-[#4855E4] focus:border-transparent transition-all"
                />
              </div>
            )}
          </div>

          {/* Target Country & Preferred Course */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fc.preferredCountry !== false && (
              <div>
                <label className="block text-xs font-bold text-[#374151] uppercase tracking-wider mb-1.5">
                  Preferred Country
                </label>
                <select
                  value={formData.preferredCountry}
                  onChange={(e) => setFormData({ ...formData, preferredCountry: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#D1D5DB] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4855E4] focus:border-transparent transition-all"
                >
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="Japan">Japan</option>
                  <option value="Malaysia">Malaysia</option>
                  <option value="China">China</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}

            {fc.preferredCourse !== false && (
              <div>
                <label className="block text-xs font-bold text-[#374151] uppercase tracking-wider mb-1.5">
                  Preferred Course / Major
                </label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science / MBA"
                  value={formData.preferredCourse}
                  onChange={(e) => setFormData({ ...formData, preferredCourse: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#D1D5DB] text-sm focus:outline-none focus:ring-2 focus:ring-[#4855E4] focus:border-transparent transition-all"
                />
              </div>
            )}
          </div>

          {/* Study Levels & Intakes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fc.preferredStudyLevel !== false && (
              <div>
                <label className="block text-xs font-bold text-[#374151] uppercase tracking-wider mb-1.5">
                  Target Degree Level
                </label>
                <select
                  value={formData.preferredStudyLevel}
                  onChange={(e) => setFormData({ ...formData, preferredStudyLevel: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#D1D5DB] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4855E4] focus:border-transparent transition-all"
                >
                  <option value="Bachelor's">Bachelor's Degree</option>
                  <option value="Master's">Master's Degree</option>
                  <option value="PhD">PhD / Doctorate</option>
                  <option value="Diploma">Diploma / Advanced Diploma</option>
                  <option value="Foundation">Foundation Program</option>
                </select>
              </div>
            )}

            {fc.preferredIntake !== false && (
              <div>
                <label className="block text-xs font-bold text-[#374151] uppercase tracking-wider mb-1.5">
                  Target Intake
                </label>
                <select
                  value={formData.preferredIntake}
                  onChange={(e) => setFormData({ ...formData, preferredIntake: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#D1D5DB] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4855E4] focus:border-transparent transition-all"
                >
                  <option value="Fall 2026">Fall 2026</option>
                  <option value="Spring 2027">Spring 2027</option>
                  <option value="Summer 2026">Summer 2026</option>
                  <option value="Fall 2027">Fall 2027</option>
                </select>
              </div>
            )}
          </div>

          {/* English Proficiency */}
          {fc.englishTest !== false && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB]">
              <div>
                <label className="block text-[11px] font-bold text-[#4B5563] uppercase mb-1">Status</label>
                <select
                  value={formData.englishTestStatus}
                  onChange={(e) => setFormData({ ...formData, englishTestStatus: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#4855E4]"
                >
                  <option value="Appeared">Appeared / Passed</option>
                  <option value="Planning">Planning to take</option>
                  <option value="Not Required">Not Required</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#4B5563] uppercase mb-1">Test Type</label>
                <select
                  value={formData.englishTestType}
                  onChange={(e) => setFormData({ ...formData, englishTestType: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#4855E4]"
                >
                  <option value="IELTS">IELTS</option>
                  <option value="PTE">PTE Academic</option>
                  <option value="Duolingo">Duolingo DET</option>
                  <option value="TOEFL">TOEFL</option>
                  <option value="MOI">MOI (Medium of Instruction)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#4B5563] uppercase mb-1">Score (If any)</label>
                <input
                  type="text"
                  placeholder="e.g. 6.5"
                  value={formData.englishTestScore}
                  onChange={(e) => setFormData({ ...formData, englishTestScore: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] text-xs focus:outline-none focus:ring-2 focus:ring-[#4855E4]"
                />
              </div>
            </div>
          )}

          {/* Initial Note / Message */}
          {fc.initialNote !== false && (
            <div>
              <label className="block text-xs font-bold text-[#374151] uppercase tracking-wider mb-1.5">
                Message / Specific Query
              </label>
              <textarea
                rows={3}
                placeholder="Ask us anything about entry requirements, scholarships, or visa procedures..."
                value={formData.initialNote}
                onChange={(e) => setFormData({ ...formData, initialNote: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#D1D5DB] text-sm focus:outline-none focus:ring-2 focus:ring-[#4855E4] focus:border-transparent transition-all resize-none"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-full bg-gradient-to-br from-[#4855E4] to-[#333FC2] text-white font-bold text-sm shadow-md hover:shadow-lg active:translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting Profile...
              </>
            ) : (
              <>
                Submit Inquiry <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
