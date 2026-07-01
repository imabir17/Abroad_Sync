'use client'

import { useState, useEffect, useActionState } from 'react'
import Link from 'next/link'
import { User, GraduationCap, FileText, Briefcase, AlertTriangle } from 'lucide-react'
import { createLead, checkLeadDuplicate } from '@/app/actions/leads'
import { COUNTRIES } from '@/lib/countries'
import { LEAD_STAGES, LEAD_RATINGS } from '@/lib/constants'

type Counselor = { id: string; fullName: string }

export function LeadForm({ counselors, isAdminOrManager }: { counselors: Counselor[], isAdminOrManager: boolean }) {
  const [lastCompletedStage, setLastCompletedStage] = useState<string>('')
  const [sourceType, setSourceType] = useState<string>('')
  
  // English Test State
  const [englishTestStatus, setEnglishTestStatus] = useState<string>('')
  
  // Duplicate Check State
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null)

  // Debounced duplicate check
  useEffect(() => {
    const checkDuplicate = async () => {
      if (email.length > 3 || phone.length > 5) {
        const result = await checkLeadDuplicate(email, phone)
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
  }, [email, phone])

  const [state, formAction] = useActionState(createLead, { error: '' })

  return (
    <form action={formAction} className="space-y-8">
      {state?.error && <div className="text-red-400 bg-red-500/10 p-4 rounded-lg">{state.error}</div>}
      
      {/* Personal Info */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm shadow-black/20 relative">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <User className="h-5 w-5 mr-2 text-blue-400" /> Personal Information
        </h3>
        
        {duplicateWarning && (
          <div className="absolute top-4 right-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1.5 rounded-lg text-sm flex items-center animate-in fade-in slide-in-from-top-2">
            <AlertTriangle className="h-4 w-4 mr-2" />
            {duplicateWarning}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-neutral-300 mb-1">Full Name *</label>
            <input type="text" name="fullName" id="fullName" required
              className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="e.g. Jane Doe" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-1">Email Address</label>
            <input type="email" name="email" id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="jane@example.com" />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-neutral-300 mb-1">Phone Number</label>
            <input type="tel" name="phone" id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="+1 (555) 000-0000" />
          </div>
        </div>
      </div>

      {/* Main Academic Setup */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm shadow-black/20">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <GraduationCap className="h-5 w-5 mr-2 text-indigo-400" /> Academic & Language Setup
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="lastStudyLevel" className="block text-sm font-medium text-neutral-300 mb-1">Last Completed Level</label>
            <select name="lastStudyLevel" id="lastStudyLevel"
              value={lastCompletedStage}
              onChange={(e) => setLastCompletedStage(e.target.value)}
              className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors">
              <option value="">Select Level</option>
              <option value="SSC">SSC / O-Levels</option>
              <option value="HSC">HSC / A-Levels</option>
              <option value="Bachelors">Bachelor's Degree</option>
              <option value="Masters">Master's Degree</option>
            </select>
          </div>
          <div>
            <label htmlFor="preferredStudyLevel" className="block text-sm font-medium text-neutral-300 mb-1">Preferred Study Level</label>
            <select name="preferredStudyLevel" id="preferredStudyLevel"
              className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors">
              <option value="">Select Level</option>
              <option value="Language Course">Language Course</option>
              <option value="Language Program">Language Program</option>
              <option value="Bachelors">Bachelor's Degree</option>
              <option value="Masters">Master's Degree</option>
              <option value="PhD">PhD</option>
            </select>
          </div>
          <div>
            <label htmlFor="preferredCountry" className="block text-sm font-medium text-neutral-300 mb-1">Preferred Country</label>
            <select name="preferredCountry" id="preferredCountry"
              className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors">
              <option value="">Select Country</option>
              {COUNTRIES.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="preferredCourse" className="block text-sm font-medium text-neutral-300 mb-1">Preferred Course</label>
            <input type="text" name="preferredCourse" id="preferredCourse"
              className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="e.g. Computer Science" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Preferred Intake</label>
            <div className="flex space-x-2">
              <select name="preferredIntakeMonth" id="preferredIntakeMonth"
                className="w-1/2 px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors">
                <option value="">Month</option>
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select name="preferredIntakeYear" id="preferredIntakeYear"
                className="w-1/2 px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors">
                <option value="">Year</option>
                {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() + i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>


          {/* English Proficiency */}
          <div className="md:col-span-2 border-t border-neutral-800 pt-4 mt-2">
            <h4 className="text-sm font-medium text-neutral-200 mb-4">English Proficiency Test</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="englishTestStatus" className="block text-xs text-neutral-400 mb-1">Test Status</label>
                <select name="englishTestStatus" id="englishTestStatus"
                  value={englishTestStatus}
                  onChange={(e) => setEnglishTestStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                  <option value="">Select Status</option>
                  <option value="Appeared">Appeared</option>
                  <option value="Planning to Appear">Planning to Appear</option>
                  <option value="Not Required">Not Required</option>
                </select>
              </div>

              {englishTestStatus === 'Appeared' && (
                <>
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <label htmlFor="englishTestType" className="block text-xs text-neutral-400 mb-1">Test Type</label>
                    <select name="englishTestType" id="englishTestType"
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                      <option value="">Select Test</option>
                      <option value="IELTS">IELTS</option>
                      <option value="PTE">PTE</option>
                      <option value="TOEFL">TOEFL</option>
                      <option value="Duolingo">Duolingo</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <label htmlFor="englishTestScore" className="block text-xs text-neutral-400 mb-1">Overall Score</label>
                    <input type="text" name="englishTestScore" id="englishTestScore"
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="e.g. 7.5 or 110" />
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Dynamic Academic Details */}
      {(lastCompletedStage === 'SSC' || lastCompletedStage === 'HSC' || lastCompletedStage === 'Bachelors' || lastCompletedStage === 'Masters') && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm shadow-black/20 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h3 className="text-lg font-semibold text-white mb-6 border-b border-neutral-800 pb-2">Detailed Academic History</h3>
          
          <div className="space-y-8">
            {/* SSC Details */}
            <div>
              <h4 className="text-md font-medium text-neutral-200 mb-3">SSC / O-Levels</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Group/Background</label>
                  <input type="text" name="sscGroup" className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white" placeholder="Science, Arts..." />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Passing Year</label>
                  <input type="text" name="sscYear" className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white" placeholder="e.g. 2018" />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Result (GPA)</label>
                  <input type="text" name="sscResult" className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white" placeholder="e.g. 5.00" />
                </div>
              </div>
            </div>

            {/* HSC Details */}
            {(lastCompletedStage === 'HSC' || lastCompletedStage === 'Bachelors' || lastCompletedStage === 'Masters') && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h4 className="text-md font-medium text-neutral-200 mb-3">HSC / A-Levels</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Group/Background</label>
                    <input type="text" name="hscGroup" className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white" placeholder="Science, Arts..." />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Passing Year</label>
                    <input type="text" name="hscYear" className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white" placeholder="e.g. 2020" />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Result (GPA)</label>
                    <input type="text" name="hscResult" className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white" placeholder="e.g. 4.80" />
                  </div>
                </div>
              </div>
            )}

            {/* Bachelors Details */}
            {(lastCompletedStage === 'Bachelors' || lastCompletedStage === 'Masters') && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h4 className="text-md font-medium text-neutral-200 mb-3">Bachelor's Degree</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Major/Subject</label>
                    <input type="text" name="bachelorsMajor" className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white" placeholder="e.g. BBA, CSE" />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Graduation Year</label>
                    <input type="text" name="bachelorsYear" className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white" placeholder="e.g. 2024" />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">CGPA</label>
                    <input type="text" name="bachelorsCgpa" className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white" placeholder="e.g. 3.50" />
                  </div>
                </div>
              </div>
            )}

            {/* Masters Details */}
            {(lastCompletedStage === 'Masters') && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h4 className="text-md font-medium text-neutral-200 mb-3">Master's Degree</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Major/Subject</label>
                    <input type="text" name="mastersMajor" className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white" placeholder="e.g. MBA, MSc" />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Graduation Year</label>
                    <input type="text" name="mastersYear" className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white" placeholder="e.g. 2026" />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">CGPA</label>
                    <input type="text" name="mastersCgpa" className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white" placeholder="e.g. 3.80" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Work Experience */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm shadow-black/20">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Briefcase className="h-5 w-5 mr-2 text-yellow-500" /> Professional Experience
        </h3>
        <div>
          <label htmlFor="workExperience" className="block text-sm font-medium text-neutral-300 mb-1">Work Experience Details</label>
          <textarea name="workExperience" id="workExperience" rows={3}
            className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
            placeholder="e.g. 2 years at TechCorp as a Software Engineer..."></textarea>
        </div>
      </div>

      {/* Operational Details */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm shadow-black/20">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-emerald-400" /> Operational Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="sourceType" className="block text-sm font-medium text-neutral-300 mb-1">Lead Source</label>
            <select name="sourceType" id="sourceType"
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors">
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
              <label htmlFor="customSource" className="block text-sm font-medium text-neutral-300 mb-1">Specify Other Source</label>
              <input type="text" name="customSource" id="customSource"
                className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="e.g. Newspaper Ad" />
            </div>
          )}
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-neutral-300 mb-1">Estimated Budget</label>
            <input type="text" name="budget" id="budget"
              className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="e.g. $20,000/year" />
          </div>
          <div>
            <label htmlFor="stage" className="block text-sm font-medium text-neutral-300 mb-1">Pipeline Stage</label>
            <select name="stage" id="stage"
              className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors">
              {LEAD_STAGES.map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="rating" className="block text-sm font-medium text-neutral-300 mb-1">Lead Rating</label>
            <select name="rating" id="rating"
              className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors">
              {LEAD_RATINGS.map(rating => (
                <option key={rating} value={rating}>{rating}</option>
              ))}
            </select>
          </div>
          {isAdminOrManager && (
            <div className="md:col-span-2">
              <label htmlFor="assignedCounselorId" className="block text-sm font-medium text-neutral-300 mb-1">Assign to Counselor</label>
              <select name="assignedCounselorId" id="assignedCounselorId"
                className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors">
                <option value="">Unassigned</option>
                {counselors.map(c => (
                  <option key={c.id} value={c.id}>{c.fullName}</option>
                ))}
              </select>
            </div>
          )}
          <div className="md:col-span-2">
            <label htmlFor="initialNote" className="block text-sm font-medium text-neutral-300 mb-1">Initial Note</label>
            <textarea name="initialNote" id="initialNote" rows={4}
              className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
              placeholder="Enter context for the first inquiry..."></textarea>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4 border-t border-neutral-800">
        <Link href="/dashboard/leads" className="px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium rounded-lg transition-colors">
          Cancel
        </Link>
        <button type="submit" disabled={!!duplicateWarning} className={`px-6 py-2.5 text-white text-sm font-medium rounded-lg transition-colors shadow-sm ${duplicateWarning ? 'bg-neutral-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
          Save Lead
        </button>
      </div>

    </form>
  )
}
