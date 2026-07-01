'use client'

import { Search, Filter, Users } from 'lucide-react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition } from 'react'
import { LEAD_STAGES, LEAD_RATINGS } from '@/lib/constants'
import { COUNTRIES } from '@/lib/countries'

type Counselor = { id: string; fullName: string }

export function LeadFilters({ isAdminOrManager, counselors, sources = [] }: { isAdminOrManager: boolean, counselors: Counselor[], sources?: string[] }) {
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

  return (
    <div className="p-4 border-b border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-900/50">
      <div className="relative w-full md:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          defaultValue={searchParams.get('q') || ''}
          onChange={handleSearch}
          className="w-full pl-9 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
        />
      </div>
      <div className="flex items-center space-x-2">
        {isAdminOrManager && (
          <div className="flex items-center space-x-2 mr-2">
            <Users className="h-4 w-4 text-neutral-500" />
            <select 
              onChange={handleCounselorFilter}
              defaultValue={searchParams.get('counselorId') || ''}
              className="px-3 py-2 bg-neutral-950 border border-neutral-800 text-neutral-300 hover:text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:border-blue-500"
            >
              <option value="">All Counselors</option>
              {counselors.map(c => (
                <option key={c.id} value={c.id}>{c.fullName}</option>
              ))}
            </select>
          </div>
        )}
        <Filter className="h-4 w-4 text-neutral-500" />
        <select 
          onChange={handleStageFilter}
          defaultValue={searchParams.get('stage') || ''}
          className="px-3 py-2 bg-neutral-950 border border-neutral-800 text-neutral-300 hover:text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:border-blue-500"
        >
          <option value="">All Stages</option>
          {LEAD_STAGES.map(stage => (
            <option key={stage} value={stage}>{stage}</option>
          ))}
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
          className="px-3 py-2 bg-neutral-950 border border-neutral-800 text-neutral-300 hover:text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:border-blue-500"
        >
          <option value="">All Ratings</option>
          {LEAD_RATINGS.map(rating => (
            <option key={rating} value={rating}>{rating}</option>
          ))}
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
          className="px-3 py-2 bg-neutral-950 border border-neutral-800 text-neutral-300 hover:text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:border-blue-500 max-w-[150px] truncate"
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
          className="px-3 py-2 bg-neutral-950 border border-neutral-800 text-neutral-300 hover:text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:border-blue-500"
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
          className="px-3 py-2 bg-neutral-950 border border-neutral-800 text-neutral-300 hover:text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:border-blue-500"
        >
          <option value="">All Sources</option>
          {sources.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      {isPending && <span className="absolute right-4 text-xs text-neutral-500">Updating...</span>}
    </div>
  )
}
