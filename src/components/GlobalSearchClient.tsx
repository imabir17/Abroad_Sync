'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function GlobalSearchClient() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/dashboard/leads?q=${encodeURIComponent(query.trim())}`)
      setQuery('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="hidden sm:flex relative items-center max-w-sm w-full mx-4">
      <Search className="w-4 h-4 text-gray-500 absolute left-3" />
      <input
        type="text"
        placeholder="Search leads..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-[#252526] border border-[#3C3C3C] text-sm text-white rounded-xl pl-9 pr-4 py-1.5 focus:border-[#007ACC] outline-none transition-colors"
      />
    </form>
  )
}
