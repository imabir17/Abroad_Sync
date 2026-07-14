'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export function ReportFilters({ 
  counselors, 
  isAdmin 
}: { 
  counselors: { id: string, fullName: string }[]
  isAdmin: boolean 
}) {
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

  const selectClass = "px-3 py-2.5 bg-white border border-gray-200 text-xs font-bold text-gray-600 hover:text-gray-900 rounded-xl outline-none focus:bg-gray-50 border border-gray-200 transition-all cursor-pointer"
  const inputClass = "px-3 py-2 bg-white bg-gray-50 border border-gray-200 border-none rounded-xl text-xs font-semibold text-gray-900 placeholder-[#8891A3] focus:outline-none transition-all"

  return (
    <div className="neo-raised p-5 mb-8 flex flex-wrap gap-5 items-end">
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Time Range</label>
        <select 
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className={selectClass}
        >
          <option value="thisWeek">This Week</option>
          <option value="thisMonth">This Month</option>
          <option value="lastMonth">Last Month</option>
          <option value="custom">Custom Date Range</option>
        </select>
      </div>

      {dateRange === 'custom' && (
        <>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Start Date</label>
            <input 
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">End Date</label>
            <input 
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className={inputClass}
            />
          </div>
        </>
      )}

      {isAdmin && (
        <div className="flex flex-col gap-2 min-w-[200px]">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Counselor</label>
          <select 
            value={selectedCounselor}
            onChange={(e) => setSelectedCounselor(e.target.value)}
            className={selectClass}
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
        className="px-5 py-3 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-[5px_5px_12px_rgba(51,63,194,0.35)] active:translate-y-0.5 transition-all duration-150 cursor-pointer"
      >
        Apply Filters
      </button>
    </div>
  )
}
