'use client'

import { useState, useEffect } from 'react'
import { createLeadForm, updateLeadForm, deleteLeadForm } from '@/app/actions/forms'
import QRCode from 'qrcode'
import { 
  Plus, 
  QrCode, 
  Copy, 
  Check, 
  ExternalLink, 
  Download, 
  Trash2, 
  Edit3, 
  Users, 
  Tag, 
  Sparkles, 
  FileText, 
  X, 
  Loader2 
} from 'lucide-react'

export default function FormsClient({
  forms: initialForms,
  counselors,
}: {
  forms: any[]
  counselors: any[]
}) {
  const [forms, setForms] = useState(initialForms)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingForm, setEditingForm] = useState<any>(null)
  const [qrModalForm, setQrModalForm] = useState<any>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [copiedFormId, setCopiedFormId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form builder state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventTag: '',
    assignedCounselorId: '',
    fieldsConfig: {
      phone: true,
      phoneReq: true,
      email: true,
      emailReq: false,
      preferredCountry: true,
      preferredCourse: true,
      preferredStudyLevel: true,
      preferredIntake: true,
      englishTest: true,
      initialNote: true,
    },
  })

  // Generate QR code data URL whenever QR modal opens
  useEffect(() => {
    if (qrModalForm) {
      const shareUrl = `${window.location.origin}/f/${qrModalForm.id}`
      QRCode.toDataURL(shareUrl, { width: 320, margin: 2 }, (err, url) => {
        if (!err && url) {
          setQrDataUrl(url)
        }
      })
    } else {
      setQrDataUrl('')
    }
  }, [qrModalForm])

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const res = await createLeadForm(formData)
    setIsSubmitting(false)

    if (res.error) {
      alert(res.error)
    } else {
      setIsCreateModalOpen(false)
      setFormData({
        title: '',
        description: '',
        eventTag: '',
        assignedCounselorId: '',
        fieldsConfig: {
          phone: true,
          phoneReq: true,
          email: true,
          emailReq: false,
          preferredCountry: true,
          preferredCourse: true,
          preferredStudyLevel: true,
          preferredIntake: true,
          englishTest: true,
          initialNote: true,
        },
      })
      window.location.reload()
    }
  }

  const handleUpdateForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingForm) return
    setIsSubmitting(true)

    const res = await updateLeadForm(editingForm.id, {
      title: editingForm.title,
      description: editingForm.description,
      eventTag: editingForm.eventTag,
      assignedCounselorId: editingForm.assignedCounselorId,
      fieldsConfig: editingForm.fieldsConfig,
      isActive: editingForm.isActive,
    })
    setIsSubmitting(false)

    if (res.error) {
      alert(res.error)
    } else {
      setEditingForm(null)
      window.location.reload()
    }
  }

  const handleDeleteForm = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this lead form? Existing leads will remain intact.')) return

    const res = await deleteLeadForm(formId)
    if (res.error) {
      alert(res.error)
    } else {
      setForms(forms.filter((f) => f.id !== formId))
    }
  }

  const copyShareLink = (formId: string) => {
    const shareUrl = `${window.location.origin}/f/${formId}`
    navigator.clipboard.writeText(shareUrl)
    setCopiedFormId(formId)
    setTimeout(() => setCopiedFormId(null), 2000)
  }

  const totalSubmissions = forms.reduce((sum, f) => sum + (f.submissionsCount || 0), 0)

  return (
    <div className="space-y-8 font-sans text-[#202638]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-[#202638]">
            QR Lead Forms & Event Analytics
          </h1>
          <p className="text-xs md:text-sm text-[#5C6478] mt-1 font-medium">
            Generate customizable lead capture forms, QR codes, and event tags to track student traffic from expos, fairs, and social ads.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-6 py-3 rounded-full bg-gradient-to-br from-[#6E79F2] to-[#333FC2] text-white text-xs font-bold shadow-md hover:shadow-lg active:translate-y-0.5 transition-all flex items-center justify-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Lead Form & QR
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="neo-raised p-6 rounded-2xl border border-white/60">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-[#8891A3] uppercase font-mono">ACTIVE LEAD FORMS</span>
            <FileText className="w-5 h-5 text-[#4855E4]" />
          </div>
          <div className="text-3xl font-bold font-display text-[#202638]">
            {forms.filter((f) => f.isActive).length}
          </div>
          <span className="text-[11px] text-[#5C6478]">Public inquiry forms online</span>
        </div>

        <div className="neo-raised p-6 rounded-2xl border border-white/60">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-[#8891A3] uppercase font-mono">TOTAL FORM SUBMISSIONS</span>
            <Sparkles className="w-5 h-5 text-[#12A8B5]" />
          </div>
          <div className="text-3xl font-bold font-display text-[#202638]">
            {totalSubmissions}
          </div>
          <span className="text-[11px] text-[#5C6478]">Leads generated via QR & Links</span>
        </div>

        <div className="neo-raised p-6 rounded-2xl border border-white/60">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-[#8891A3] uppercase font-mono">EVENT CAMPAIGNS</span>
            <Tag className="w-5 h-5 text-[#FF7A52]" />
          </div>
          <div className="text-3xl font-bold font-display text-[#202638]">
            {new Set(forms.map((f) => f.eventTag).filter(Boolean)).size}
          </div>
          <span className="text-[11px] text-[#5C6478]">Unique event tags tracked</span>
        </div>
      </div>

      {/* Forms Grid */}
      {forms.length === 0 ? (
        <div className="neo-pressed p-12 text-center rounded-3xl border border-[#AEB9C9]/20">
          <QrCode className="w-12 h-12 text-[#8891A3] mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[#202638] mb-1">No Lead Forms Created Yet</h3>
          <p className="text-xs text-[#5C6478] max-w-sm mx-auto mb-6">
            Build your first customizable inquiry form with a printable QR code for education fairs, posters, or social media ads.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-2.5 rounded-full bg-gradient-to-br from-[#6E79F2] to-[#333FC2] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Lead Form
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <div
              key={form.id}
              className="neo-raised p-6 rounded-3xl border border-white/70 flex flex-col justify-between relative overflow-hidden"
            >
              <div>
                {/* Status & Event Badge */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      form.isActive
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {form.isActive ? 'Active' : 'Inactive'}
                  </span>

                  {form.eventTag && (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#333FC2]/10 text-[#333FC2] flex items-center gap-1">
                      <Tag className="w-3 h-3" /> {form.eventTag}
                    </span>
                  )}
                </div>

                {/* Form Title & Description */}
                <h3 className="text-lg font-bold text-[#202638] font-display mb-1.5 line-clamp-1">
                  {form.title}
                </h3>
                <p className="text-xs text-[#5C6478] leading-relaxed mb-4 line-clamp-2">
                  {form.description || 'No description provided.'}
                </p>

                {/* Info Metadata */}
                <div className="space-y-2 pt-4 border-t border-[#AEB9C9]/20 text-xs text-[#5C6478] mb-6">
                  <div className="flex justify-between items-center">
                    <span>Submissions:</span>
                    <span className="font-bold text-[#202638] text-sm font-display">
                      {form.submissionsCount || 0} Leads
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Auto-Assign:</span>
                    <span className="font-semibold text-[#202638] flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#6E79F2]" />
                      {form.counselor?.fullName || 'Unassigned'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => setQrModalForm(form)}
                  className="w-full py-2.5 rounded-2xl bg-gradient-to-br from-[#6E79F2] to-[#333FC2] text-white font-bold text-xs shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4" /> View QR Code & Share Link
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setEditingForm(form)}
                    className="py-2 rounded-xl neo-flat text-[#202638] text-xs font-semibold hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#5C6478]" /> Edit
                  </button>

                  <button
                    onClick={() => handleDeleteForm(form.id)}
                    className="py-2 rounded-xl neo-flat text-red-600 text-xs font-semibold hover:bg-red-50 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Code & Share Modal */}
      {qrModalForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 relative shadow-2xl border border-white/80 text-center font-sans">
            <button
              onClick={() => setQrModalForm(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-[#5C6478]"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] font-bold text-[#4855E4] uppercase tracking-wider block mb-1 font-mono">PRINT & SHARE QR</span>
            <h3 className="text-xl font-bold text-[#202638] font-display mb-1">{qrModalForm.title}</h3>
            {qrModalForm.eventTag && (
              <span className="text-xs font-semibold text-[#12A8B5] bg-[#12A8B5]/10 px-3 py-1 rounded-full inline-block mb-4">
                Event Tag: {qrModalForm.eventTag}
              </span>
            )}

            {/* QR Image Container */}
            <div className="my-6 p-4 rounded-2xl bg-gradient-to-br from-[#F8F9FA] to-[#E7ECF3] inline-block shadow-inner border border-[#AEB9C9]/30">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Form QR Code" className="w-64 h-64 mx-auto rounded-lg shadow-sm" />
              ) : (
                <div className="w-64 h-64 flex items-center justify-center text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin text-[#4855E4]" />
                </div>
              )}
            </div>

            {/* Share URL Input & Actions */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB]">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/f/${qrModalForm.id}`}
                  className="w-full text-xs font-mono bg-transparent text-[#374151] px-2 focus:outline-none"
                />
                <button
                  onClick={() => copyShareLink(qrModalForm.id)}
                  className="px-3 py-1.5 rounded-lg bg-[#4855E4] text-white text-xs font-bold hover:bg-[#333FC2] transition-all shrink-0 flex items-center gap-1"
                >
                  {copiedFormId === qrModalForm.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedFormId === qrModalForm.id ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {qrDataUrl && (
                  <a
                    href={qrDataUrl}
                    download={`QR_${qrModalForm.title.replace(/[^a-zA-Z0-9]/g, '_')}.png`}
                    className="py-2.5 rounded-xl bg-gradient-to-br from-[#6E79F2] to-[#333FC2] text-white font-bold text-xs shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download QR
                  </a>
                )}
                <a
                  href={`/f/${qrModalForm.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 rounded-xl border border-[#D1D5DB] text-[#374151] font-bold text-xs hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" /> Open Form
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Lead Form Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 relative shadow-2xl border border-white/80 my-8">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-[#5C6478]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-[#202638] font-display mb-1">Create Lead Form & Event QR</h3>
            <p className="text-xs text-[#5C6478] mb-6">Build a public inquiry form with custom fields and an event tracking tag.</p>

            <form onSubmit={handleCreateForm} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#374151] mb-1">Form Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dhaka Education Expo 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1D5DB] text-xs focus:ring-2 focus:ring-[#4855E4] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#374151] mb-1">Event Tag / Campaign</label>
                  <input
                    type="text"
                    placeholder="e.g. DhakaExpo2026"
                    value={formData.eventTag}
                    onChange={(e) => setFormData({ ...formData, eventTag: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1D5DB] text-xs focus:ring-2 focus:ring-[#4855E4] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#374151] mb-1">Auto-Assign Counselor</label>
                  <select
                    value={formData.assignedCounselorId}
                    onChange={(e) => setFormData({ ...formData, assignedCounselorId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1D5DB] text-xs bg-white focus:ring-2 focus:ring-[#4855E4] focus:outline-none"
                  >
                    <option value="">Unassigned (Round-Robin)</option>
                    {counselors.map((c) => (
                      <option key={c.id} value={c.id}>{c.fullName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#374151] mb-1">Form Description</label>
                <textarea
                  rows={2}
                  placeholder="Welcome message or instructions for students..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1D5DB] text-xs focus:ring-2 focus:ring-[#4855E4] focus:outline-none resize-none"
                />
              </div>

              {/* Field Enable Toggles */}
              <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-3">
                <span className="font-bold text-[#374151] uppercase tracking-wider text-[10px] block">ENABLED FORM FIELDS</span>

                <div className="grid grid-cols-2 gap-2 text-xs text-[#374151]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.fieldsConfig.phone}
                      onChange={(e) => setFormData({
                        ...formData,
                        fieldsConfig: { ...formData.fieldsConfig, phone: e.target.checked }
                      })}
                      className="rounded text-[#4855E4] focus:ring-[#4855E4]"
                    />
                    <span>Phone Number</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.fieldsConfig.email}
                      onChange={(e) => setFormData({
                        ...formData,
                        fieldsConfig: { ...formData.fieldsConfig, email: e.target.checked }
                      })}
                      className="rounded text-[#4855E4] focus:ring-[#4855E4]"
                    />
                    <span>Email Address</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.fieldsConfig.preferredCountry}
                      onChange={(e) => setFormData({
                        ...formData,
                        fieldsConfig: { ...formData.fieldsConfig, preferredCountry: e.target.checked }
                      })}
                      className="rounded text-[#4855E4] focus:ring-[#4855E4]"
                    />
                    <span>Preferred Country</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.fieldsConfig.preferredCourse}
                      onChange={(e) => setFormData({
                        ...formData,
                        fieldsConfig: { ...formData.fieldsConfig, preferredCourse: e.target.checked }
                      })}
                      className="rounded text-[#4855E4] focus:ring-[#4855E4]"
                    />
                    <span>Preferred Course</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.fieldsConfig.englishTest}
                      onChange={(e) => setFormData({
                        ...formData,
                        fieldsConfig: { ...formData.fieldsConfig, englishTest: e.target.checked }
                      })}
                      className="rounded text-[#4855E4] focus:ring-[#4855E4]"
                    />
                    <span>English Proficiency</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.fieldsConfig.initialNote}
                      onChange={(e) => setFormData({
                        ...formData,
                        fieldsConfig: { ...formData.fieldsConfig, initialNote: e.target.checked }
                      })}
                      className="rounded text-[#4855E4] focus:ring-[#4855E4]"
                    />
                    <span>Student Query Note</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="w-full py-3 rounded-full border border-[#D1D5DB] text-[#374151] font-bold text-xs hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-full bg-gradient-to-br from-[#6E79F2] to-[#333FC2] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Form & Generate QR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
