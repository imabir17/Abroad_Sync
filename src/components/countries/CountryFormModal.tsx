'use client'

import { useState, useTransition } from 'react'
import { X, Save, Plus, Trash2 } from 'lucide-react'
import { createCountry, updateCountry } from '@/app/actions/countries'

interface CountryFormModalProps {
  country?: any
  onClose: () => void
  onSuccess: () => void
}

export default function CountryFormModal({ country, onClose, onSuccess }: CountryFormModalProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  const [steps, setSteps] = useState<string[]>(
    country?.steps && Array.isArray(country.steps) ? country.steps : []
  )
  const [visaChecklist, setVisaChecklist] = useState<string[]>(
    country?.visaChecklist && Array.isArray(country.visaChecklist) ? country.visaChecklist : []
  )

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    if (country?.id) {
      formData.append('id', country.id)
    }
    
    formData.append('steps', JSON.stringify(steps))
    formData.append('visaChecklist', JSON.stringify(visaChecklist))

    startTransition(async () => {
      const result = country
        ? await updateCountry(null, formData)
        : await createCountry(null, formData)
        
      if (result.error) {
        setError(result.error)
      } else {
        onSuccess()
      }
    })
  }

  const InputField = ({ name, label, defaultValue }: { name: string, label: string, defaultValue?: string }) => (
    <div className="space-y-1">
      <label className="text-xs font-bold text-[#5C6478] uppercase">{label}</label>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue || ''}
        className="w-full px-4 py-2.5 bg-[#E7ECF3] border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4855E4]/50 shadow-[inset_3px_3px_6px_#AEB9C9,inset_-3px_-3px_6px_#FFFFFF] text-[#202638] transition-all"
      />
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl bg-[#E7ECF3] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-[#AEB9C9]/20 shrink-0">
          <h2 className="text-xl font-bold text-[#202638] font-display">
            {country ? 'Edit Country Guide' : 'Add New Country Guide'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#E7ECF3] text-[#5C6478] hover:text-[#202638] shadow-[3px_3px_6px_#AEB9C9,-3px_-3px_6px_#FFFFFF] active:shadow-[inset_2px_2px_4px_#AEB9C9,inset_-2px_-2px_4px_#FFFFFF] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form id="country-form" onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-4 bg-red-100 text-red-600 rounded-xl text-sm font-semibold">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="col-span-full">
                <InputField name="name" label="Name of Country *" defaultValue={country?.name} />
              </div>
              
              <div className="col-span-full border-b border-[#AEB9C9]/30 pb-2 mt-4">
                <h3 className="font-bold text-[#4855E4]">Academic & General Info</h3>
              </div>
              <InputField name="academicRequirement" label="Academic Result (GPA/CGPA) req." defaultValue={country?.academicRequirement} />
              <InputField name="studyGapAcceptance" label="Study Gap Acceptance" defaultValue={country?.studyGapAcceptance} />
              <InputField name="intakes" label="Intakes" defaultValue={country?.intakes} />
              <InputField name="courseDurationUg" label="Course Duration UG" defaultValue={country?.courseDurationUg} />
              <InputField name="courseDurationPg" label="Course Duration PG" defaultValue={country?.courseDurationPg} />
              
              <div className="col-span-full border-b border-[#AEB9C9]/30 pb-2 mt-4">
                <h3 className="font-bold text-[#4855E4]">Fees & Costs</h3>
              </div>
              <InputField name="applicationFee" label="Application Fee" defaultValue={country?.applicationFee} />
              <InputField name="tuitionFees" label="Tuition Fees" defaultValue={country?.tuitionFees} />
              <InputField name="tuitionType" label="Tuition Type (Before/After Visa)" defaultValue={country?.tuitionType} />
              <InputField name="scholarship" label="Scholarship" defaultValue={country?.scholarship} />
              <InputField name="livingCost" label="Living Cost" defaultValue={country?.livingCost} />
              <InputField name="totalCost" label="Total Cost with breakdown" defaultValue={country?.totalCost} />
              
              <div className="col-span-full border-b border-[#AEB9C9]/30 pb-2 mt-4">
                <h3 className="font-bold text-[#4855E4]">Visa & Embassy</h3>
              </div>
              <InputField name="sponsorBankStatement" label="Sponsor Bank Statement" defaultValue={country?.sponsorBankStatement} />
              <InputField name="policeClearance" label="Police Clearance" defaultValue={country?.policeClearance} />
              <InputField name="insurance" label="Insurance" defaultValue={country?.insurance} />
              <InputField name="medical" label="Medical" defaultValue={country?.medical} />
              <InputField name="embassyFees" label="Embassy Fees" defaultValue={country?.embassyFees} />
              <InputField name="biometricFee" label="Biometric Fee" defaultValue={country?.biometricFee} />
              <InputField name="visaInterview" label="Visa Interview" defaultValue={country?.visaInterview} />
              <InputField name="embassyFace" label="Embassy Face (Bangladesh/Other)" defaultValue={country?.embassyFace} />
              <InputField name="residencePermit" label="Residence Permit (PR)" defaultValue={country?.residencePermit} />
              
              <div className="col-span-full border-b border-[#AEB9C9]/30 pb-2 mt-4">
                <h3 className="font-bold text-[#4855E4]">Life & Employment</h3>
              </div>
              <InputField name="workPermit" label="Work Permit" defaultValue={country?.workPermit} />
              <InputField name="jobOpportunity" label="Job Opportunity" defaultValue={country?.jobOpportunity} />
              <InputField name="spouseAndKids" label="Spouse & Kids" defaultValue={country?.spouseAndKids} />
              <InputField name="accommodation" label="Accommodation" defaultValue={country?.accommodation} />
              <InputField name="processingDuration" label="Processing Duration" defaultValue={country?.processingDuration} />
              <InputField name="serviceCharge" label="Service Charge" defaultValue={country?.serviceCharge} />
            </div>

            {/* Dynamic Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 border-t border-[#AEB9C9]/30 pt-8">
              {/* Steps */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#4855E4]">Processing Steps</h3>
                  <button
                    type="button"
                    onClick={() => setSteps([...steps, ''])}
                    className="p-1.5 rounded-lg bg-[#E7ECF3] text-[#4855E4] shadow-[2px_2px_4px_#AEB9C9,-2px_-2px_4px_#FFFFFF] hover:shadow-[inset_2px_2px_4px_#AEB9C9,inset_-2px_-2px_4px_#FFFFFF]"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  {steps.map((step, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={step}
                        onChange={(e) => {
                          const newSteps = [...steps]
                          newSteps[idx] = e.target.value
                          setSteps(newSteps)
                        }}
                        className="flex-1 px-4 py-2 bg-[#E7ECF3] border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4855E4]/50 shadow-[inset_3px_3px_6px_#AEB9C9,inset_-3px_-3px_6px_#FFFFFF] text-[#202638]"
                        placeholder={`Step ${idx + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => setSteps(steps.filter((_, i) => i !== idx))}
                        className="p-2 rounded-xl bg-[#E7ECF3] text-red-500 shadow-[2px_2px_4px_#AEB9C9,-2px_-2px_4px_#FFFFFF] hover:shadow-[inset_2px_2px_4px_#AEB9C9,inset_-2px_-2px_4px_#FFFFFF]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {steps.length === 0 && <p className="text-xs text-[#8891A3]">No steps added.</p>}
                </div>
              </div>

              {/* Visa Checklist */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#4855E4]">Visa Checklist</h3>
                  <button
                    type="button"
                    onClick={() => setVisaChecklist([...visaChecklist, ''])}
                    className="p-1.5 rounded-lg bg-[#E7ECF3] text-[#4855E4] shadow-[2px_2px_4px_#AEB9C9,-2px_-2px_4px_#FFFFFF] hover:shadow-[inset_2px_2px_4px_#AEB9C9,inset_-2px_-2px_4px_#FFFFFF]"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  {visaChecklist.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const newList = [...visaChecklist]
                          newList[idx] = e.target.value
                          setVisaChecklist(newList)
                        }}
                        className="flex-1 px-4 py-2 bg-[#E7ECF3] border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4855E4]/50 shadow-[inset_3px_3px_6px_#AEB9C9,inset_-3px_-3px_6px_#FFFFFF] text-[#202638]"
                        placeholder={`Document ${idx + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => setVisaChecklist(visaChecklist.filter((_, i) => i !== idx))}
                        className="p-2 rounded-xl bg-[#E7ECF3] text-red-500 shadow-[2px_2px_4px_#AEB9C9,-2px_-2px_4px_#FFFFFF] hover:shadow-[inset_2px_2px_4px_#AEB9C9,inset_-2px_-2px_4px_#FFFFFF]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {visaChecklist.length === 0 && <p className="text-xs text-[#8891A3]">No checklist items added.</p>}
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-[#AEB9C9]/20 flex justify-end gap-3 shrink-0 bg-[#E7ECF3]">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-[#5C6478] bg-[#E7ECF3] shadow-[4px_4px_8px_#AEB9C9,-4px_-4px_8px_#FFFFFF] hover:shadow-[inset_2px_2px_4px_#AEB9C9,inset_-2px_-2px_4px_#FFFFFF] active:scale-95 transition-all"
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="country-form"
            disabled={isPending}
            className="flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#6E79F2] to-[#4855E4] shadow-[4px_4px_8px_#AEB9C9,-4px_-4px_8px_#FFFFFF] hover:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.2)] active:scale-95 transition-all disabled:opacity-70"
          >
            <Save className="w-4 h-4" />
            {isPending ? 'Saving...' : 'Save Guide'}
          </button>
        </div>
      </div>
    </div>
  )
}
