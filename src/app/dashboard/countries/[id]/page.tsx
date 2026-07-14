import { getCountryById } from '@/app/actions/countries'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Globe, MapPin, Building2, CheckCircle2, ChevronRight, GraduationCap, Plane, Wallet, Briefcase, FileText } from 'lucide-react'

export default async function CountryDetailsPage({ params }: { params: { id: string } }) {
  const country = await getCountryById(params.id)
  
  if (!country) {
    notFound()
  }

  // Helper component for info cards
  const InfoCard = ({ icon: Icon, title, value }: { icon: any, title: string, value: string }) => (
    <div className="bg-[#E7ECF3] rounded-2xl p-4 shadow-[8px_8px_16px_#AEB9C9,-8px_-8px_16px_#FFFFFF] flex flex-col gap-2">
      <div className="flex items-center gap-2 text-[#4855E4]">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wider text-[#5C6478]">{title}</span>
      </div>
      <span className="font-semibold text-[#202638]">{value || 'N/A'}</span>
    </div>
  )

  const Section = ({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) => (
    <div className="bg-[#E7ECF3] rounded-3xl p-6 md:p-8 shadow-[8px_8px_16px_#AEB9C9,-8px_-8px_16px_#FFFFFF]">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#AEB9C9]/30">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6E79F2]/20 to-[#4855E4]/20 flex items-center justify-center shadow-inner text-[#4855E4]">
          <Icon className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-[#202638]">{title}</h2>
      </div>
      {children}
    </div>
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/countries" 
          className="p-3 rounded-xl bg-[#E7ECF3] text-[#5C6478] hover:text-[#4855E4] shadow-[4px_4px_8px_#AEB9C9,-4px_-4px_8px_#FFFFFF] active:shadow-[inset_2px_2px_4px_#AEB9C9,inset_-2px_-2px_4px_#FFFFFF] transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[#202638] font-display">{country.name}</h1>
          <div className="flex items-center gap-2 text-[#5C6478] mt-1 text-sm font-semibold">
            {country.continent && <span>{country.continent}</span>}
            {country.continent && country.capitals && <span>•</span>}
            {country.capitals && <span>Capital: {country.capitals}</span>}
          </div>
        </div>
      </div>

      {/* Grid of basic info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <InfoCard icon={Globe} title="Country Code" value={country.countryCode} />
        <InfoCard icon={Wallet} title="Currency" value={country.currency} />
        <InfoCard icon={GraduationCap} title="Intakes" value={country.intakes} />
        <InfoCard icon={Plane} title="Processing" value={country.processingDuration} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Section title="Academic & Language Requirements" icon={GraduationCap}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-[#8891A3] uppercase font-bold block mb-1">Academic Result</span>
                  <span className="font-semibold text-[#202638]">{country.academicRequirement || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-xs text-[#8891A3] uppercase font-bold block mb-1">Study Gap</span>
                  <span className="font-semibold text-[#202638]">{country.studyGapAcceptance || 'N/A'}</span>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-[#E7ECF3] shadow-[inset_3px_3px_6px_#AEB9C9,inset_-3px_-3px_6px_#FFFFFF] space-y-2">
                <h4 className="font-bold text-[#4855E4] text-sm mb-3">Language Tests</h4>
                <div className="flex justify-between text-sm"><span className="text-[#5C6478]">IELTS</span><span className="font-semibold text-[#202638]">{country.ieltsRequirement || 'N/A'}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[#5C6478]">PTE</span><span className="font-semibold text-[#202638]">{country.pteRequirement || 'N/A'}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[#5C6478]">TOEFL</span><span className="font-semibold text-[#202638]">{country.toeflRequirement || 'N/A'}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[#5C6478]">Duolingo</span><span className="font-semibold text-[#202638]">{country.duolingoRequirement || 'N/A'}</span></div>
              </div>
            </div>
          </Section>

          <Section title="Financials & Fees" icon={Wallet}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div><span className="text-xs text-[#8891A3] uppercase font-bold block">Tuition Fees</span><span className="font-semibold text-[#202638]">{country.tuitionFees || 'N/A'}</span></div>
                <div><span className="text-xs text-[#8891A3] uppercase font-bold block">Tuition Type</span><span className="font-semibold text-[#202638]">{country.tuitionType || 'N/A'}</span></div>
                <div><span className="text-xs text-[#8891A3] uppercase font-bold block">Application Fee</span><span className="font-semibold text-[#202638]">{country.applicationFee || 'N/A'}</span></div>
              </div>
              <div className="space-y-3">
                <div><span className="text-xs text-[#8891A3] uppercase font-bold block">Scholarship</span><span className="font-semibold text-[#202638]">{country.scholarship || 'N/A'}</span></div>
                <div><span className="text-xs text-[#8891A3] uppercase font-bold block">Sponsor Bank Statement</span><span className="font-semibold text-[#202638]">{country.sponsorBankStatement || 'N/A'}</span></div>
                <div><span className="text-xs text-[#8891A3] uppercase font-bold block">Living Cost</span><span className="font-semibold text-[#202638]">{country.livingCost || 'N/A'}</span></div>
              </div>
            </div>
            {country.totalCost && (
              <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-[#6E79F2]/10 to-[#4855E4]/10 border border-[#4855E4]/20">
                <span className="text-xs text-[#4855E4] uppercase font-bold block mb-1">Total Cost Breakdown</span>
                <span className="font-semibold text-[#202638]">{country.totalCost}</span>
              </div>
            )}
          </Section>

          <Section title="Visa, Embassy & Life" icon={Plane}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div><span className="text-xs text-[#8891A3] uppercase font-bold block">Embassy Fees</span><span className="font-semibold text-[#202638]">{country.embassyFees || 'N/A'}</span></div>
                <div><span className="text-xs text-[#8891A3] uppercase font-bold block">Biometric Fee</span><span className="font-semibold text-[#202638]">{country.biometricFee || 'N/A'}</span></div>
                <div><span className="text-xs text-[#8891A3] uppercase font-bold block">Visa Interview</span><span className="font-semibold text-[#202638]">{country.visaInterview || 'N/A'}</span></div>
                <div><span className="text-xs text-[#8891A3] uppercase font-bold block">Embassy Face</span><span className="font-semibold text-[#202638]">{country.embassyFace || 'N/A'}</span></div>
              </div>
              <div className="space-y-3">
                <div><span className="text-xs text-[#8891A3] uppercase font-bold block">Work Permit</span><span className="font-semibold text-[#202638]">{country.workPermit || 'N/A'}</span></div>
                <div><span className="text-xs text-[#8891A3] uppercase font-bold block">Job Opportunity</span><span className="font-semibold text-[#202638]">{country.jobOpportunity || 'N/A'}</span></div>
                <div><span className="text-xs text-[#8891A3] uppercase font-bold block">Residence Permit (PR)</span><span className="font-semibold text-[#202638]">{country.residencePermit || 'N/A'}</span></div>
                <div><span className="text-xs text-[#8891A3] uppercase font-bold block">Spouse & Kids</span><span className="font-semibold text-[#202638]">{country.spouseAndKids || 'N/A'}</span></div>
              </div>
            </div>
          </Section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {country.keySellingPoints && Array.isArray(country.keySellingPoints) && country.keySellingPoints.length > 0 && (
            <Section title="Key Selling Points" icon={CheckCircle2}>
              <ul className="space-y-3">
                {country.keySellingPoints.map((ksp: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#4855E4] shrink-0 mt-0.5" />
                    <span className="text-[#202638] text-sm font-semibold leading-relaxed">{ksp}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {country.steps && Array.isArray(country.steps) && country.steps.length > 0 && (
            <Section title="Processing Steps" icon={Briefcase}>
              <div className="relative border-l-2 border-[#4855E4]/20 ml-3 space-y-6">
                {country.steps.map((step: string, idx: number) => (
                  <div key={idx} className="relative pl-6">
                    <div className="absolute w-6 h-6 rounded-full bg-[#4855E4] text-white flex items-center justify-center text-xs font-bold -left-[13px] -top-1 shadow-lg ring-4 ring-[#E7ECF3]">
                      {idx + 1}
                    </div>
                    <p className="text-sm font-semibold text-[#202638] leading-relaxed pt-0.5">{step}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}
          
          {country.universityChecklist && Array.isArray(country.universityChecklist) && country.universityChecklist.length > 0 && (
            <Section title="University Checklist" icon={FileText}>
              <ul className="space-y-2">
                {country.universityChecklist.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 p-3 rounded-xl bg-[#E7ECF3] shadow-[inset_2px_2px_4px_#AEB9C9,inset_-2px_-2px_4px_#FFFFFF] text-sm font-semibold text-[#202638]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#4855E4]" />
                    {item}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {country.visaChecklist && Array.isArray(country.visaChecklist) && country.visaChecklist.length > 0 && (
            <Section title="Visa Checklist" icon={FileText}>
              <ul className="space-y-2">
                {country.visaChecklist.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 p-3 rounded-xl bg-[#E7ECF3] shadow-[inset_2px_2px_4px_#AEB9C9,inset_-2px_-2px_4px_#FFFFFF] text-sm font-semibold text-[#202638]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#4855E4]" />
                    {item}
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      </div>

      {country.universities && Array.isArray(country.universities) && country.universities.length > 0 && (
        <Section title="Top Universities" icon={Building2}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {country.universities.map((uni: any, idx: number) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#E7ECF3] shadow-[5px_5px_10px_#AEB9C9,-5px_-5px_10px_#FFFFFF] flex gap-4 items-center">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-[#6E79F2]/20 to-[#4855E4]/20 flex items-center justify-center text-[#4855E4]">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-[#202638] text-sm leading-tight mb-1">{uni.name}</h4>
                  <p className="text-xs font-semibold text-[#5C6478] flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {uni.location || 'Location TBA'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}
