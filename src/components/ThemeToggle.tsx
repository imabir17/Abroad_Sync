'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Read theme on mount
    const savedTheme = localStorage.getItem('theme')
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const currentTheme = (savedTheme as 'light' | 'dark') || systemTheme
    setTheme(currentTheme)
    document.documentElement.setAttribute('data-theme', currentTheme)
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    localStorage.setItem('theme', nextTheme)
    document.documentElement.setAttribute('data-theme', nextTheme)
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-[#E7ECF3] shadow-[3px_3px_6px_#AEB9C9,-3px_-3px_6px_#FFFFFF] active:shadow-[inset_2px_2px_4px_#AEB9C9,inset_-2px_-2px_4px_#FFFFFF] text-[#5C6478] hover:text-[#202638] transition-all flex items-center justify-center cursor-pointer shrink-0"
      aria-label={`Toggle to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4 text-[#4855E4] shrink-0" />
      ) : (
        <Sun className="w-4 h-4 text-[#FF7A52] shrink-0" />
      )}
    </button>
  )
}
