'use client'

import { Search } from 'lucide-react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition } from 'react'
import { LEAD_STAGES, LEAD_RATINGS } from '@/lib/constants'
import { COUNTRIES } from '@/lib/countries'

type Counselor = { id: string; fullName: string }

export function LeadFilters({ 
  isAdminOrManager, 
  counselors, 
  sources = [],
  stages = []
}: { 
  isAdminOrManager: boolean
  counselors: Counselor[]
  sources?: string[] 
  stages?: any[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    const params = new URLSearchParams(searchParams.toString())
    if (term) {
      params.set('q', term)
    } else {
      params.delete('q')
    }
    
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`)
    })
  }

  const handleStageFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stage = e.target.value
    const params = new URLSearchParams(searchParams.toString())
    if (stage) {
      params.set('stage', stage)
    } else {
      params.delete('stage')
    }
    
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`)
    })
  }

  const handleCounselorFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const counselorId = e.target.value
    const params = new URLSearchParams(searchParams.toString())
    if (counselorId) {
      params.set('counselorId', counselorId)
    } else {
      params.delete('counselorId')
    }
    
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`)
    })
  }

  const selectClass = "w-full px-3 py-2.5 bg-[#1E1E1E] border border-[#3C3C3C] text-xs font-bold text-white hover:border-[#555555] rounded-xl outline-none focus:border-[#007ACC] transition-all cursor-pointer truncate"

  return (
    <div className="bg-[#252526] border border-[#3C3C3C] rounded-2xl shadow-md p-5 flex flex-col gap-4 relative">
      {isPending && (
        <span className="absolute top-3 right-4 text-[10px] font-bold text-[#12A8B5] bg-[#12A8B5]/10 px-2 py-0.5 rounded-full z-10">
          Updating...
        </span>
      )}
      
      {/* Top Row: Search Input */}
      <div className="relative w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          defaultValue={searchParams.get('q') || ''}
          onChange={handleSearch}
          className="w-full pl-10 pr-4 py-2.5 bg-[#1E1E1E] border border-[#3C3C3C] shadow-sm rounded-xl text-xs font-semibold text-white placeholder-gray-500 focus:outline-none focus:border-[#007ACC] transition-all"
        />
      </div>

      {/* Bottom Row: Filters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {isAdminOrManager && (
          <select 
            onChange={handleCounselorFilter}
            defaultValue={searchParams.get('counselorId') || ''}
            className={selectClass}
          >
            <option value="">All Counselors</option>
            <option value="unassigned">Unassigned</option>
            {counselors.map(c => (
              <option key={c.id} value={c.id}>{c.fullName}</option>
            ))}
          </select>
        )}

        <select 
          onChange={handleStageFilter}
          defaultValue={searchParams.get('stage') || ''}
          className={selectClass}
        >
          <option value="">All Stages</option>
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

        <select 
          onChange={(e) => {
            const rating = e.target.value
            const params = new URLSearchParams(searchParams.toString())
            if (rating) {
              params.set('rating', rating)
            } else {
              params.delete('rating')
            }
            startTransition(() => {
              router.replace(`${pathname}?${params.toString()}`)
            })
          }}
          defaultValue={searchParams.get('rating') || ''}
          className={selectClass}
        >
          <option value="">All Ratings</option>
          <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
          <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
          <option value="3">⭐⭐⭐ (3 Stars)</option>
          <option value="2">⭐⭐ (2 Stars)</option>
          <option value="1">⭐ (1 Star)</option>
          <option value="Unrated">Unrated</option>
        </select>

        <select 
          onChange={(e) => {
            const country = e.target.value
            const params = new URLSearchParams(searchParams.toString())
            if (country) {
              params.set('country', country)
            } else {
              params.delete('country')
            }
            startTransition(() => {
              router.replace(`${pathname}?${params.toString()}`)
            })
          }}
          defaultValue={searchParams.get('country') || ''}
          className={selectClass}
        >
          <option value="">All Countries</option>
          {COUNTRIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select 
          onChange={(e) => {
            const test = e.target.value
            const params = new URLSearchParams(searchParams.toString())
            if (test) {
              params.set('englishTest', test)
            } else {
              params.delete('englishTest')
            }
            startTransition(() => {
              router.replace(`${pathname}?${params.toString()}`)
            })
          }}
          defaultValue={searchParams.get('englishTest') || ''}
          className={selectClass}
        >
          <option value="">All English Tests</option>
          <option value="IELTS">IELTS</option>
          <option value="PTE">PTE</option>
          <option value="TOEFL">TOEFL</option>
          <option value="Duolingo">Duolingo</option>
          <option value="Other">Other</option>
        </select>

        <select 
          onChange={(e) => {
            const source = e.target.value
            const params = new URLSearchParams(searchParams.toString())
            if (source) {
              params.set('source', source)
            } else {
              params.delete('source')
            }
            startTransition(() => {
              router.replace(`${pathname}?${params.toString()}`)
            })
          }}
          defaultValue={searchParams.get('source') || ''}
          className={selectClass}
        >
          <option value="">All Sources</option>
          {sources.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
