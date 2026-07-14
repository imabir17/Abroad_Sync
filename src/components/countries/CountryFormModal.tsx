'use client'

import { useState, useTransition } from 'react'
import { X, Save, Plus, Trash2 } from 'lucide-react'
import { createCountry, updateCountry } from '@/app/actions/countries'

interface CountryFormModalProps {
  country?: any
  onClose: () => void
  onSuccess: () => void
}

const InputField = ({ name, label, defaultValue }: { name: string, label: string, defaultValue?: string }) => (
  <div className="space-y-1">
    <label className="text-xs font-bold text-gray-600 uppercase">{label}</label>
    <input
      type="text"
      name={name}
      defaultValue={defaultValue || ''}
      className="w-full px-4 py-2.5 bg-white border-2 border-white rounded-xl text-sm focus:outline-none focus:border-blue-200 shadow-sm text-gray-900 transition-all"
    />
  </div>
)

const DynamicList = ({ title, items, setItems, placeholder = "Add item..." }: { title: string, items: string[], setItems: (items: string[]) => void, placeholder?: string }) => (
  <div className="mb-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-bold text-[#4855E4]">{title}</h3>
      <button
        type="button"
        onClick={() => setItems([...items, ''])}
        className="p-1.5 rounded-lg bg-white text-blue-600 border border-gray-200 hover:bg-gray-50"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-2">
          <input
            type="text"
            value={item}
            onChange={(e) => {
              const newItems = [...items]
              newItems[idx] = e.target.value
              setItems(newItems)
            }}
            className="flex-1 px-4 py-2 bg-white border-2 border-white rounded-xl text-sm focus:outline-none focus:border-blue-200 shadow-sm text-gray-900"
            placeholder={placeholder}
          />
          <button
            type="button"
            onClick={() => setItems(items.filter((_, i) => i !== idx))}
            className="p-2 rounded-xl bg-white text-red-500 border border-gray-200 hover:bg-gray-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      {items.length === 0 && <p className="text-xs text-gray-400">No items added.</p>}
    </div>
  </div>
)

const UniversitiesList = ({ universities, setUniversities }: { universities: {name: string, location: string}[], setUniversities: (unis: any) => void }) => (
  <div className="mb-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-bold text-[#4855E4]">Universities</h3>
      <button
        type="button"
        onClick={() => setUniversities([...universities, { name: '', location: '' }])}
        className="p-1.5 rounded-lg bg-white text-blue-600 border border-gray-200 hover:bg-gray-50"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
    <div className="space-y-4">
      {universities.map((uni, idx) => (
        <div key={idx} className="flex gap-3 items-start p-4 rounded-xl bg-white border border-gray-300 shadow-sm">
          <div className="flex-1 space-y-3">
            <input
              type="text"
              value={uni.name}
              onChange={(e) => {
                const newUnis = [...universities]
                newUnis[idx].name = e.target.value
                setUniversities(newUnis)
              }}
              className="w-full px-4 py-2 bg-transparent border-b border-gray-200 text-sm focus:outline-none focus:border-[#4855E4] text-gray-900"
              placeholder="University Name"
            />
            <input
              type="text"
              value={uni.location}
              onChange={(e) => {
                const newUnis = [...universities]
                newUnis[idx].location = e.target.value
                setUniversities(newUnis)
              }}
              className="w-full px-4 py-2 bg-transparent border-b border-gray-200 text-sm focus:outline-none focus:border-[#4855E4] text-gray-900"
              placeholder="Location (e.g. Pafos, Cyprus)"
            />
          </div>
          <button
            type="button"
            onClick={() => setUniversities(universities.filter((_, i) => i !== idx))}
            className="p-2 rounded-xl bg-white text-red-500 border border-gray-200 hover:bg-gray-50 mt-2"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      {universities.length === 0 && <p className="text-xs text-gray-400">No universities added.</p>}
    </div>
  </div>
)

export default function CountryFormModal({ country, onClose, onSuccess }: CountryFormModalProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('general')
  
  const [steps, setSteps] = useState<string[]>(
    country?.steps && Array.isArray(country.steps) ? country.steps : []
  )
  const [visaChecklist, setVisaChecklist] = useState<string[]>(
    country?.visaChecklist && Array.isArray(country.visaChecklist) ? country.visaChecklist : []
  )
  const [keySellingPoints, setKeySellingPoints] = useState<string[]>(
    country?.keySellingPoints && Array.isArray(country.keySellingPoints) ? country.keySellingPoints : []
  )
  const [universityChecklist, setUniversityChecklist] = useState<string[]>(
    country?.universityChecklist && Array.isArray(country.universityChecklist) ? country.universityChecklist : []
  )
  const [universities, setUniversities] = useState<{name: string, location: string}[]>(
    country?.universities && Array.isArray(country.universities) ? country.universities : []
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
    formData.append('keySellingPoints', JSON.stringify(keySellingPoints))
    formData.append('universityChecklist', JSON.stringify(universityChecklist))
    formData.append('universities', JSON.stringify(universities))

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

  const tabs = [
    { id: 'general', label: 'General Info' },
    { id: 'requirements', label: 'Requirements' },
    { id: 'financials', label: 'Financials' },
    { id: 'visa', label: 'Visa & Life' },
    { id: 'lists', label: 'Lists & Univ.' }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl bg-slate-50 border-4 border-white rounded-[2rem] shadow-[8px_8px_16px_rgba(0,0,0,0.05),inset_2px_2px_4px_rgba(255,255,255,0.7),inset_-2px_-2px_4px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 shrink-0">
          <h2 className="text-xl font-bold text-gray-900 font-display">
            {country ? 'Edit Country Guide' : 'Add New Country Guide'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-gray-50 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Custom Tabs */}
        <div className="px-6 pt-4 flex gap-2 overflow-x-auto custom-scrollbar shrink-0 border-b border-gray-200 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 border-2 border-white shadow-sm'
                  : 'bg-transparent text-gray-600 hover:text-gray-900 border-2 border-transparent hover:bg-white/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form id="country-form" onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-100 text-red-600 rounded-xl text-sm font-semibold">
                {error}
              </div>
            )}

            <div className={activeTab === 'general' ? 'block' : 'hidden'}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="col-span-full">
                  <InputField name="name" label="Name of Country *" defaultValue={country?.name} />
                </div>
                <InputField name="continent" label="Continent" defaultValue={country?.continent} />
                <InputField name="capitals" label="Capitals" defaultValue={country?.capitals} />
                <InputField name="majorCities" label="Major Cities" defaultValue={country?.majorCities} />
                <InputField name="countryCode" label="Country Code (e.g. +357)" defaultValue={country?.countryCode} />
                <InputField name="currency" label="Currency" defaultValue={country?.currency} />
              </div>
            </div>

            <div className={activeTab === 'requirements' ? 'block' : 'hidden'}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InputField name="academicRequirement" label="Academic Result (GPA/CGPA) req." defaultValue={country?.academicRequirement} />
                <InputField name="studyGapAcceptance" label="Study Gap Acceptance" defaultValue={country?.studyGapAcceptance} />
                <InputField name="intakes" label="Intakes" defaultValue={country?.intakes} />
                <InputField name="courseDurationUg" label="Course Duration UG" defaultValue={country?.courseDurationUg} />
                <InputField name="courseDurationPg" label="Course Duration PG" defaultValue={country?.courseDurationPg} />
                <InputField name="processingDuration" label="Processing Duration" defaultValue={country?.processingDuration} />
                
                <div className="col-span-full border-b border-gray-200 pb-2 mt-4">
                  <h3 className="font-bold text-[#4855E4]">English Language Tests</h3>
                </div>
                <InputField name="ieltsRequirement" label="IELTS Requirement" defaultValue={country?.ieltsRequirement} />
                <InputField name="pteRequirement" label="PTE Requirement" defaultValue={country?.pteRequirement} />
                <InputField name="toeflRequirement" label="TOEFL Requirement" defaultValue={country?.toeflRequirement} />
                <InputField name="duolingoRequirement" label="Duolingo Requirement" defaultValue={country?.duolingoRequirement} />
              </div>
            </div>

            <div className={activeTab === 'financials' ? 'block' : 'hidden'}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InputField name="applicationFee" label="Application Fee" defaultValue={country?.applicationFee} />
                <InputField name="tuitionFees" label="Tuition Fees" defaultValue={country?.tuitionFees} />
                <InputField name="tuitionType" label="Tuition Type (Before/After Visa)" defaultValue={country?.tuitionType} />
                <InputField name="scholarship" label="Scholarship" defaultValue={country?.scholarship} />
                <InputField name="sponsorBankStatement" label="Sponsor Bank Statement" defaultValue={country?.sponsorBankStatement} />
                <InputField name="livingCost" label="Living Cost" defaultValue={country?.livingCost} />
                <InputField name="serviceCharge" label="Service Charge" defaultValue={country?.serviceCharge} />
                <div className="col-span-full">
                  <InputField name="totalCost" label="Total Cost with breakdown" defaultValue={country?.totalCost} />
                </div>
              </div>
            </div>

            <div className={activeTab === 'visa' ? 'block' : 'hidden'}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InputField name="policeClearance" label="Police Clearance" defaultValue={country?.policeClearance} />
                <InputField name="insurance" label="Insurance" defaultValue={country?.insurance} />
                <InputField name="medical" label="Medical" defaultValue={country?.medical} />
                <InputField name="embassyFees" label="Embassy Fees" defaultValue={country?.embassyFees} />
                <InputField name="biometricFee" label="Biometric Fee" defaultValue={country?.biometricFee} />
                <InputField name="visaInterview" label="Visa Interview" defaultValue={country?.visaInterview} />
                <InputField name="embassyFace" label="Embassy Face (Bangladesh/Other)" defaultValue={country?.embassyFace} />
                <InputField name="residencePermit" label="Residence Permit (PR)" defaultValue={country?.residencePermit} />
                <InputField name="workPermit" label="Work Permit" defaultValue={country?.workPermit} />
                <InputField name="jobOpportunity" label="Job Opportunity" defaultValue={country?.jobOpportunity} />
                <InputField name="spouseAndKids" label="Spouse & Kids" defaultValue={country?.spouseAndKids} />
                <InputField name="accommodation" label="Accommodation" defaultValue={country?.accommodation} />
              </div>
            </div>

            <div className={activeTab === 'lists' ? 'block' : 'hidden'}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <DynamicList title="Key Selling Points (KSP)" items={keySellingPoints} setItems={setKeySellingPoints} placeholder="e.g. Offer Letter in 3 Days" />
                  <DynamicList title="Processing Guidance (Steps)" items={steps} setItems={setSteps} placeholder="Step description" />
                </div>
                <div>
                  <DynamicList title="University Checklist" items={universityChecklist} setItems={setUniversityChecklist} placeholder="Required document" />
                  <DynamicList title="Visa/Embassy Checklist" items={visaChecklist} setItems={setVisaChecklist} placeholder="Required document" />
                  <UniversitiesList universities={universities} setUniversities={setUniversities} />
                </div>
              </div>
            </div>

          </form>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3 shrink-0 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-gray-600 bg-white shadow-[4px_4px_10px_rgba(0,0,0,0.03),inset_1px_1px_2px_rgba(255,255,255,0.8)] border-2 border-white hover:bg-gray-50 active:scale-95 transition-all"
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="country-form"
            disabled={isPending}
            className="flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold text-white bg-blue-600 shadow-[4px_4px_10px_rgba(0,0,0,0.05),inset_1px_1px_2px_rgba(255,255,255,0.3)] border-2 border-blue-500 hover:brightness-110 active:scale-95 transition-all disabled:opacity-70"
          >
            <Save className="w-4 h-4" />
            {isPending ? 'Saving...' : 'Save Guide'}
          </button>
        </div>
      </div>
    </div>
  )
}
