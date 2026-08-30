'use client'

import { useState } from 'react'
import { Mail, Phone, Pencil, Check, X, Plus, Trash2 } from 'lucide-react'
import { updateLeadDetails } from '@/app/actions/leads'
import { useRouter } from 'next/navigation'

export default function EditableContactInfo({
  leadId,
  initialEmail,
  initialPhone,
  canEdit
}: {
  leadId: string
  initialEmail: string
  initialPhone: string
  canEdit: boolean
}) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [email, setEmail] = useState(initialEmail || '')
  
  // Parse comma separated phones
  const parsePhones = (str: string) => {
    if (!str) return ['']
    const parts = str.split(',').map(p => p.trim()).filter(Boolean)
    return parts.length > 0 ? parts : ['']
  }
  
  const [phones, setPhones] = useState<string[]>(parsePhones(initialPhone))
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    const validPhones = phones.map(p => p.trim()).filter(Boolean)
    const phoneString = validPhones.join(', ')
    
    try {
      await updateLeadDetails(leadId, {
        email: email.trim(),
        phone: phoneString
      })
      setIsEditing(false)
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Failed to update contact info')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEmail(initialEmail || '')
    setPhones(parsePhones(initialPhone))
    setIsEditing(false)
  }

  const renderWhatsAppIcon = (phoneNum: string) => {
    if (!phoneNum) return null
    let clean = phoneNum.replace(/\D/g, '')
    if (clean.startsWith('01') && clean.length === 11) {
      clean = '880' + clean.slice(1)
    }
    return (
      <a 
        href={`https://wa.me/${clean}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="ml-1.5 p-1 bg-[#1E1E1E] border border-[#3C3C3C] hover:bg-[#333333] rounded-lg text-[#25D366] transition-all inline-flex items-center justify-center shrink-0"
        title="Message on WhatsApp"
        onClick={(e) => e.stopPropagation()}
      >
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    )
  }

  if (isEditing) {
    return (
      <div className="flex flex-col gap-3 bg-[#1E1E1E] p-4 rounded-xl border border-[#3C3C3C] shadow-sm max-w-md">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-[#4855E4]" />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email address"
            className="flex-1 bg-[#252526] border border-[#3C3C3C] rounded p-1.5 text-xs text-white outline-none focus:border-[#007ACC]"
          />
        </div>
        
        <div className="flex flex-col gap-2">
          {phones.map((phone, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#12A8B5]" />
              <input
                type="text"
                value={phone}
                onChange={e => {
                  const newPhones = [...phones]
                  newPhones[idx] = e.target.value
                  setPhones(newPhones)
                }}
                placeholder="Phone number"
                className="flex-1 bg-[#252526] border border-[#3C3C3C] rounded p-1.5 text-xs text-white outline-none focus:border-[#007ACC]"
              />
              <button 
                onClick={() => {
                  if (phones.length > 1) {
                    setPhones(phones.filter((_, i) => i !== idx))
                  }
                }}
                className="p-1 text-gray-500 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <button 
          onClick={() => setPhones([...phones, ''])}
          className="text-xs text-[#007ACC] hover:text-[#1177BB] font-bold flex items-center gap-1 self-start"
        >
          <Plus className="w-3.5 h-3.5" /> Add another phone
        </button>

        <div className="flex justify-end gap-2 mt-2">
          <button 
            onClick={handleCancel}
            disabled={isSaving}
            className="px-3 py-1.5 rounded-lg bg-[#333333] border border-[#3C3C3C] text-xs text-gray-400 hover:text-white transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#007ACC] text-xs text-white font-bold hover:bg-[#1177BB] transition-all disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" /> {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    )
  }

  const displayPhones = parsePhones(initialPhone)

  return (
    <div 
      className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-gray-400 font-semibold group ${canEdit ? 'cursor-pointer' : ''}`}
      onClick={() => canEdit && setIsEditing(true)}
    >
      <span className="flex items-center gap-1.5">
        <Mail className="h-4 w-4 text-[#4855E4]" /> {initialEmail || 'N/A'}
      </span>
      <span className="opacity-40">•</span>
      <span className="flex items-center flex-wrap gap-x-3 gap-y-1.5">
        <Phone className="h-4 w-4 text-[#12A8B5]" />
        {displayPhones.length === 0 || displayPhones[0] === '' ? (
          <span>N/A</span>
        ) : (
          displayPhones.map((p, idx) => (
            <span key={idx} className="flex items-center">
              {p}
              {renderWhatsAppIcon(p)}
              {idx < displayPhones.length - 1 && <span className="opacity-40 ml-3">,</span>}
            </span>
          ))
        )}
      </span>
      
      {canEdit && (
        <button className="opacity-0 group-hover:opacity-100 p-1 ml-2 text-gray-400 hover:text-white transition-all rounded bg-[#333333] border border-[#3C3C3C]">
          <Pencil className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}
