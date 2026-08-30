'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Pencil, Check, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function EditableLeadName({ 
  leadId, 
  initialName, 
  canEdit 
}: { 
  leadId: string
  initialName: string
  canEdit: boolean 
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(initialName)
  const [isSaving, setIsSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const handleSave = async () => {
    if (!name.trim() || name === initialName) {
      setIsEditing(false)
      setName(initialName)
      return
    }

    setIsSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('Lead')
      .update({ fullName: name.trim() })
      .eq('id', leadId)

    setIsSaving(false)
    if (!error) {
      setIsEditing(false)
      router.refresh()
    } else {
      console.error('Failed to update lead name', error)
      setName(initialName)
      setIsEditing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setName(initialName)
    }
  }

  if (!canEdit) {
    return <h2 className="text-2xl font-bold text-white font-display">{name}</h2>
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSaving}
          className="text-2xl font-bold text-white font-display bg-[#1E1E1E] border border-[#007ACC] rounded px-2 py-1 outline-none w-full max-w-sm disabled:opacity-50"
        />
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="p-1.5 bg-[#007ACC] text-white rounded hover:bg-[#1177BB] transition-colors disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
        </button>
        <button 
          onClick={() => {
            setIsEditing(false)
            setName(initialName)
          }}
          disabled={isSaving}
          className="p-1.5 bg-[#333333] text-gray-400 rounded hover:text-white transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="group flex items-center gap-2 cursor-pointer" onClick={() => setIsEditing(true)}>
      <h2 className="text-2xl font-bold text-white font-display">{name}</h2>
      <button className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-white transition-all rounded bg-[#333333] border border-[#3C3C3C]">
        <Pencil className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
