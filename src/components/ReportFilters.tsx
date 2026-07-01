'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export function ReportFilters({ counselors, isAdmin }: { counselors: { id: string, fullName: string }[], isAdmin: boolean }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [dateRange, setDateRange] = useState(searchParams.get('range') || 'thisMonth')
  const [customStart, setCustomStart] = useState(searchParams.get('start') || '')
  const [customEnd, setCustomEnd] = useState(searchParams.get('end') || '')
  const [selectedCounselor, setSelectedCounselor] = useState(searchParams.get('counselorId') || '')

  const applyFilters = () => {
    const params = new URLSearchParams()
    
    params.set('range', dateRange)
    
    if (dateRange === 'custom') {
      if (customStart) params.set('start', customStart)
      if (customEnd) params.set('end', customEnd)
    }

    if (selectedCounselor) {
      params.set('counselorId', selectedCounselor)
    }

    router.push(`/dashboard/reports?${params.toString()}`)
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-end">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-neutral-400">Time Range</label>
        <select 
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="bg-neutral-950 border border-neutral-800 text-sm text-white rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="thisWeek">This Week</option>
          <option value="thisMonth">This Month</option>
          <option value="lastMonth">Last Month</option>
          <option value="custom">Custom Date Range</option>
        </select>
      </div>

      {dateRange === 'custom' && (
        <>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-neutral-400">Start Date</label>
            <input 
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 text-sm text-white rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-neutral-400">End Date</label>
            <input 
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 text-sm text-white rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </>
      )}

      {isAdmin && (
        <div className="flex flex-col gap-1.5 min-w-[200px]">
          <label className="text-sm text-neutral-400">Counselor</label>
          <select 
            value={selectedCounselor}
            onChange={(e) => setSelectedCounselor(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 text-sm text-white rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Counselors</option>
            {counselors.map(c => (
              <option key={c.id} value={c.id}>{c.fullName}</option>
            ))}
          </select>
        </div>
      )}

      <button 
        onClick={applyFilters}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
      >
        Apply Filters
      </button>
    </div>
  )
}
