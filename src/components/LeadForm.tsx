'use client'

import { useState, useEffect, useActionState } from 'react'
import Link from 'next/link'
import { User, GraduationCap, FileText, Briefcase, AlertTriangle, Save, Loader2 } from 'lucide-react'
import { createLead, checkLeadDuplicate } from '@/app/actions/leads'
import { COUNTRIES } from '@/lib/countries'
import { LEAD_STAGES, LEAD_RATINGS } from '@/lib/constants'
import { StarRating } from '@/components/StarRating'

type Counselor = { id: string; fullName: string }

export function LeadForm({ counselors, isAdminOrManager, stages = [] }: { counselors: Counselor[], isAdminOrManager: boolean, stages?: any[] }) {
  const [lastCompletedStage, setLastCompletedStage] = useState<string>('')
  const [sourceType, setSourceType] = useState<string>('')
  
  // English Test State
  const [englishTestStatus, setEnglishTestStatus] = useState<string>('')
  
  // Duplicate Check State
  // Debounced duplicate check input state
  const [email, setEmail] = useState('')
  const [countryCode, setCountryCode] = useState('+880')
  const [localPhone, setLocalPhone] = useState('')
  const combinedPhone = `${countryCode}${localPhone.replace(/^0/, '')}`
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null)
  
  // Rating State
  const [rating, setRating] = useState('Unrated')

  // Debounced duplicate check
  useEffect(() => {
    const checkDuplicate = async () => {
      if (email.length > 3 || localPhone.length > 4) {
        const result = await checkLeadDuplicate(email, combinedPhone)
        if (result.duplicate) {
          setDuplicateWarning(result.message || 'Duplicate found')
        } else {
          setDuplicateWarning(null)
        }
      } else {
        setDuplicateWarning(null)
      }
    }
    
    const timeoutId = setTimeout(checkDuplicate, 500)
    return () => clearTimeout(timeoutId)
  }, [email, combinedPhone, localPhone])

  const [state, formAction, isPending] = useActionState(createLead, { error: '' })

  const inputClass = "w-full bg-[#E7ECF3] shadow-[inset_2.5px_2.5px_5px_#AEB9C9,inset_-2.5px_-2.5px_5px_#FFFFFF] border-none rounded-xl py-2.5 px-4 text-base font-semibold text-[#202638] placeholder-[#8891A3] focus:outline-none transition-all"
  const selectClass = "w-full bg-[#E7ECF3] shadow-[3px_3px_6px_#AEB9C9,-3px_-3px_6px_#FFFFFF] text-base font-bold text-[#5C6478] rounded-xl py-2.5 px-4 outline-none focus:shadow-[inset_2px_2px_4px_#AEB9C9,inset_-2px_-2px_4px_#FFFFFF] transition-all cursor-pointer"

  return (
    <form action={formAction} className="space-y-8">
      {state?.error && (
        <div className="flex items-center gap-2.5 text-xs text-[#E5484D] bg-[#E5484D]/8 p-4 rounded-xl shadow-sm border border-[#E5484D]/10">
          <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}
      
      {/* Personal Info */}
      <div className="neo-raised p-6 relative">
        <h3 className="text-base font-bold text-[#202638] mb-5 flex items-center gap-2">
          <User className="h-5 w-5 text-[#4855E4]" /> Personal Information
        </h3>
        
        {duplicateWarning && (
          <div className="absolute top-4 right-4 bg-[#FF7A52]/10 border border-[#FF7A52]/20 text-[#FF7A52] px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {duplicateWarning}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="fullName" className="block text-[10px] font-bold text-[#5C6478] uppercase tracking-wider mb-2">Full Name *</label>
            <input 
              type="text" 
              name="fullName" 
              id="fullName" 
              required
              className={inputClass}
              placeholder="e.g. Jane Doe" 
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-[10px] font-bold text-[#5C6478] uppercase tracking-wider mb-2">Email Address</label>
            <input 
              type="email" 
              name="email" 
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="jane@example.com" 
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-[10px] font-bold text-[#5C6478] uppercase tracking-wider mb-2">Phone Number *</label>
            <div className="flex gap-2.5">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-[110px] bg-[#E7ECF3] shadow-[3px_3px_6px_#AEB9C9,-3px_-3px_6px_#FFFFFF] text-xs font-bold text-[#5C6478] rounded-xl py-2.5 px-3 outline-none focus:shadow-[inset_2px_2px_4px_#AEB9C9,inset_-2px_-2px_4px_#FFFFFF] transition-all cursor-pointer shrink-0"
              >
                <option value="+880">BD (+880)</option>
                <option value="+91">IN (+91)</option>
                <option value="+1">US/CA (+1)</option>
                <option value="+44">UK (+44)</option>
                <option value="+61">AU (+61)</option>
                <option value="+92">PK (+92)</option>
                <option value="+977">NP (+977)</option>
                <option value="+94">LK (+94)</option>
                <option value="+971">AE (+971)</option>
                <option value="+60">MY (+60)</option>
                <option value="+39">IT (+39)</option>
                <option value="+49">DE (+49)</option>
                <option value="+33">FR (+33)</option>
              </select>

              <input 
                required
                type="tel" 
                id="localPhone"
                value={localPhone}
                onChange={(e) => setLocalPhone(e.target.value)}
                className={`${inputClass} flex-1`}
                placeholder="e.g. 1966427333" 
              />
            </div>
            
            <input type="hidden" name="phone" value={combinedPhone} />
          </div>
        </div>
      </div>

      {/* Main Academic Setup */}
      <div className="neo-raised p-6">
        <h3 className="text-base font-bold text-[#202638] mb-5 flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-[#12A8B5]" /> Academic & Language Setup
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="lastStudyLevel" className="block text-[10px] font-bold text-[#5C6478] uppercase tracking-wider mb-2">Last Completed Level</label>
            <select 
              name="lastStudyLevel" 
              id="lastStudyLevel"
              value={lastCompletedStage}
              onChange={(e) => setLastCompletedStage(e.target.value)}
              className={selectClass}
            >
              <option value="">Select Level</option>
              <option value="SSC">SSC / O-Levels</option>
              <option value="HSC">HSC / A-Levels</option>
              <option value="Bachelors">Bachelor's Degree</option>
              <option value="Masters">Master's Degree</option>
            </select>
          </div>
          <div>
            <label htmlFor="preferredStudyLevel" className="block text-[10px] font-bold text-[#5C6478] uppercase tracking-wider mb-2">Preferred Study Level</label>
            <select 
              name="preferredStudyLevel" 
              id="preferredStudyLevel"
              className={selectClass}
            >
              <option value="">Select Level</option>
              <option value="Language Course">Language Course</option>
              <option value="Language Program">Language Program</option>
              <option value="Bachelors">Bachelor's Degree</option>
              <option value="Masters">Master's Degree</option>
              <option value="PhD">PhD</option>
            </select>
          </div>
          <div>
            <label htmlFor="preferredCountry" className="block text-[10px] font-bold text-[#5C6478] uppercase tracking-wider mb-2">Preferred Country</label>
            <select 
              name="preferredCountry" 
              id="preferredCountry"
              className={selectClass}
            >
              <option value="">Select Country</option>
              {COUNTRIES.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="preferredCourse" className="block text-[10px] font-bold text-[#5C6478] uppercase tracking-wider mb-2">Preferred Course</label>
            <input 
              type="text" 
              name="preferredCourse" 
              id="preferredCourse"
              className={inputClass}
              placeholder="e.g. Computer Science" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#5C6478] uppercase tracking-wider mb-2">Preferred Intake</label>
            <div className="flex gap-3">
              <select 
                name="preferredIntakeMonth" 
                id="preferredIntakeMonth"
                className="w-1/2 bg-[#E7ECF3] shadow-[3px_3px_6px_#AEB9C9,-3px_-3px_6px_#FFFFFF] text-xs font-bold text-[#5C6478] rounded-xl py-2.5 px-4 outline-none focus:shadow-[inset_2px_2px_4px_#AEB9C9,inset_-2px_-2px_4px_#FFFFFF] transition-all cursor-pointer"
              >
                <option value="">Month</option>
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select 
                name="preferredIntakeYear" 
                id="preferredIntakeYear"
                className="w-1/2 bg-[#E7ECF3] shadow-[3px_3px_6px_#AEB9C9,-3px_-3px_6px_#FFFFFF] text-xs font-bold text-[#5C6478] rounded-xl py-2.5 px-4 outline-none focus:shadow-[inset_2px_2px_4px_#AEB9C9,inset_-2px_-2px_4px_#FFFFFF] transition-all cursor-pointer"
              >
                <option value="">Year</option>
                {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() + i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* English Proficiency */}
          <div className="md:col-span-2 border-t border-[#AEB9C9]/20 pt-5 mt-3">
            <h4 className="text-xs font-bold text-[#202638] mb-4">English Proficiency Test</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="englishTestStatus" className="block text-[10px] font-bold text-[#8891A3] uppercase tracking-wider mb-2">Test Status</label>
                <select 
                  name="englishTestStatus" 
                  id="englishTestStatus"
                  value={englishTestStatus}
                  onChange={(e) => setEnglishTestStatus(e.target.value)}
                  className={selectClass}
                >
                  <option value="">Select Status</option>
                  <option value="Appeared">Appeared</option>
                  <option value="Planning to Appear">Planning to Appear</option>
                  <option value="Not Required">Not Required</option>
                </select>
              </div>

              {englishTestStatus === 'Appeared' && (
                <>
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <label htmlFor="englishTestType" className="block text-[10px] font-bold text-[#8891A3] uppercase tracking-wider mb-2">Test Type</label>
                    <select 
                      name="englishTestType" 
                      id="englishTestType"
                      className={selectClass}
                    >
                      <option value="">Select Test</option>
                      <option value="IELTS">IELTS</option>
                      <option value="PTE">PTE</option>
                      <option value="TOEFL">TOEFL</option>
                      <option value="Duolingo">Duolingo</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <label htmlFor="englishTestScore" className="block text-[10px] font-bold text-[#8891A3] uppercase tracking-wider mb-2">Overall Score</label>
                    <input 
                      type="text" 
                      name="englishTestScore" 
                      id="englishTestScore"
                      className={inputClass}
                      placeholder="e.g. 7.5 or 110" 
                    />
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Dynamic Academic Details */}
      {(lastCompletedStage === 'SSC' || lastCompletedStage === 'HSC' || lastCompletedStage === 'Bachelors' || lastCompletedStage === 'Masters') && (
        <div className="neo-raised p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h3 className="text-base font-bold text-[#202638] mb-6 border-b border-[#AEB9C9]/20 pb-2">Detailed Academic History</h3>
          
          <div className="space-y-8">
            {/* SSC Details */}
            <div>
              <h4 className="text-xs font-bold text-[#202638] mb-3">SSC / O-Levels</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#8891A3] uppercase tracking-wider mb-2">Group/Background</label>
                  <input type="text" name="sscGroup" className={inputClass} placeholder="Science, Arts..." />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#8891A3] uppercase tracking-wider mb-2">Passing Year</label>
                  <input type="text" name="sscYear" className={inputClass} placeholder="e.g. 2018" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#8891A3] uppercase tracking-wider mb-2">Result (GPA)</label>
                  <input type="text" name="sscResult" className={inputClass} placeholder="e.g. 5.00" />
                </div>
              </div>
            </div>

            {/* HSC Details */}
            {(lastCompletedStage === 'HSC' || lastCompletedStage === 'Bachelors' || lastCompletedStage === 'Masters') && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h4 className="text-xs font-bold text-[#202638] mb-3">HSC / A-Levels</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#8891A3] uppercase tracking-wider mb-2">Group/Background</label>
                    <input type="text" name="hscGroup" className={inputClass} placeholder="Science, Arts..." />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#8891A3] uppercase tracking-wider mb-2">Passing Year</label>
                    <input type="text" name="hscYear" className={inputClass} placeholder="e.g. 2020" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#8891A3] uppercase tracking-wider mb-2">Result (GPA)</label>
                    <input type="text" name="hscResult" className={inputClass} placeholder="e.g. 4.80" />
                  </div>
                </div>
              </div>
            )}

            {/* Bachelors Details */}
            {(lastCompletedStage === 'Bachelors' || lastCompletedStage === 'Masters') && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h4 className="text-xs font-bold text-[#202638] mb-3">Bachelor's Degree</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#8891A3] uppercase tracking-wider mb-2">Major/Subject</label>
                    <input type="text" name="bachelorsMajor" className={inputClass} placeholder="e.g. BBA, CSE" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#8891A3] uppercase tracking-wider mb-2">Graduation Year</label>
                    <input type="text" name="bachelorsYear" className={inputClass} placeholder="e.g. 2024" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#8891A3] uppercase tracking-wider mb-2">CGPA</label>
                    <input type="text" name="bachelorsCgpa" className={inputClass} placeholder="e.g. 3.50" />
                  </div>
                </div>
              </div>
            )}

            {/* Masters Details */}
            {(lastCompletedStage === 'Masters') && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h4 className="text-xs font-bold text-[#202638] mb-3">Master's Degree</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#8891A3] uppercase tracking-wider mb-2">Major/Subject</label>
                    <input type="text" name="mastersMajor" className={inputClass} placeholder="e.g. MBA, MSc" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#8891A3] uppercase tracking-wider mb-2">Graduation Year</label>
                    <input type="text" name="mastersYear" className={inputClass} placeholder="e.g. 2026" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#8891A3] uppercase tracking-wider mb-2">CGPA</label>
                    <input type="text" name="mastersCgpa" className={inputClass} placeholder="e.g. 3.80" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Work Experience */}
      <div className="neo-raised p-6">
        <h3 className="text-base font-bold text-[#202638] mb-5 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-[#FF7A52]" /> Professional Experience
        </h3>
        <div>
          <label htmlFor="workExperience" className="block text-[10px] font-bold text-[#5C6478] uppercase tracking-wider mb-2">Work Experience Details</label>
          <textarea 
            name="workExperience" 
            id="workExperience" 
            rows={3}
            className={`${inputClass} resize-none`}
            placeholder="e.g. 2 years at TechCorp as a Software Engineer..."
          ></textarea>
        </div>
      </div>

      {/* Operational Details */}
      <div className="neo-raised p-6">
        <h3 className="text-base font-bold text-[#202638] mb-5 flex items-center gap-2">
          <FileText className="h-5 w-5 text-[#21C285]" /> Operational Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="sourceType" className="block text-[10px] font-bold text-[#5C6478] uppercase tracking-wider mb-2">Lead Source</label>
            <select 
              name="sourceType" 
              id="sourceType"
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              className={selectClass}
            >
              <option value="">Select Source</option>
              <option value="Facebook">Facebook</option>
              <option value="Google">Google</option>
              <option value="Instagram">Instagram</option>
              <option value="Word of Mouth">Word of Mouth</option>
              <option value="Walk-in">Walk-in</option>
              <option value="Agent">Agent</option>
              <option value="Event/Seminar">Event/Seminar</option>
              <option value="Other">Other</option>
            </select>
          </div>
          {sourceType === 'Other' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label htmlFor="customSource" className="block text-[10px] font-bold text-[#5C6478] uppercase tracking-wider mb-2">Specify Other Source</label>
              <input 
                type="text" 
                name="customSource" 
                id="customSource"
                className={inputClass}
                placeholder="e.g. Newspaper Ad" 
              />
            </div>
          )}
          <div>
            <label htmlFor="budget" className="block text-[10px] font-bold text-[#5C6478] uppercase tracking-wider mb-2">Estimated Budget</label>
            <input 
              type="text" 
              name="budget" 
              id="budget"
              className={inputClass}
              placeholder="e.g. $20,000/year" 
            />
          </div>
          <div>
            <label htmlFor="stage" className="block text-[10px] font-bold text-[#5C6478] uppercase tracking-wider mb-2">Pipeline Stage</label>
            <select 
              name="stage" 
              id="stage"
              className={selectClass}
            >
              {stages.length > 0 ? (
                stages.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))
              ) : (
                LEAD_STAGES.map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))
              )}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#5C6478] uppercase tracking-wider mb-2">Lead Rating</label>
            <div className="py-2.5 px-3 flex items-center bg-[#E7ECF3] shadow-[inset_2.5px_2.5px_5px_#AEB9C9,inset_-2.5px_-2.5px_5px_#FFFFFF] rounded-xl h-[38px]">
              <StarRating rating={rating} onChange={(val) => setRating(val)} size={20} />
            </div>
            <input type="hidden" name="rating" value={rating} />
          </div>
          {isAdminOrManager && (
            <div className="md:col-span-2">
              <label htmlFor="assignedCounselorId" className="block text-[10px] font-bold text-[#5C6478] uppercase tracking-wider mb-2">Assign to Counselor</label>
              <select 
                name="assignedCounselorId" 
                id="assignedCounselorId"
                className={selectClass}
              >
                <option value="">Unassigned</option>
                {counselors.map(c => (
                  <option key={c.id} value={c.id}>{c.fullName}</option>
                ))}
              </select>
            </div>
          )}
          <div className="md:col-span-2">
            <label htmlFor="initialNote" className="block text-[10px] font-bold text-[#5C6478] uppercase tracking-wider mb-2">Initial Note</label>
            <textarea 
              name="initialNote" 
              id="initialNote" 
              rows={4}
              className={`${inputClass} resize-none`}
              placeholder="Enter context for the first inquiry..."
            ></textarea>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-5 border-t border-[#AEB9C9]/20">
        <Link 
          href="/dashboard/leads" 
          className="px-6 py-3 bg-[#E7ECF3] shadow-[3px_3px_6px_#AEB9C9,-3px_-3px_6px_#FFFFFF] text-xs font-bold text-[#5C6478] hover:shadow-[inset_2px_2px_4px_#AEB9C9,inset_-2px_-2px_4px_#FFFFFF] transition-all rounded-xl"
        >
          Cancel
        </Link>
        <button 
          type="submit" 
          disabled={!!duplicateWarning || isPending} 
          className={`px-6 py-3 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 ${
            duplicateWarning 
              ? 'bg-neutral-300 shadow-none cursor-not-allowed text-[#8891A3]' 
              : 'bg-gradient-to-br from-[#6E79F2] to-[#333FC2] hover:shadow-[5px_5px_12px_rgba(51,63,194,0.35)] active:translate-y-0.5'
          }`}
        >
          {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>{isPending ? 'Saving...' : 'Save Lead'}</span>
        </button>
      </div>

    </form>
  )
}
