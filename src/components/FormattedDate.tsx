'use client'

import { useState, useEffect } from 'react'

export default function FormattedDate({
  date,
  fallback = 'Not Contacted Yet',
  options = { dateStyle: 'medium', timeStyle: 'short' },
}: {
  date?: string | Date | null
  fallback?: string
  options?: Intl.DateTimeFormatOptions
}) {
  const [formatted, setFormatted] = useState<string>('')

  useEffect(() => {
    if (!date) return
    try {
      const d = typeof date === 'string' ? new Date(date) : date
      setFormatted(d.toLocaleString('en-US', options))
    } catch (e) {
      setFormatted('')
    }
  }, [date, options])

  if (!date) return <>{fallback}</>

  return <>{formatted || fallback}</>
}
