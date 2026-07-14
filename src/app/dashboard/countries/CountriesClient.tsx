'use client'

import { useState } from 'react'
import { Plus, Search, Edit2, Trash2, Globe, FileText, CheckSquare, DollarSign } from 'lucide-react'
import CountryFormModal from '@/components/countries/CountryFormModal'
import { deleteCountry } from '@/app/actions/countries'
import { useRouter } from 'next/navigation'

export default function CountriesClient({ 
  initialCountries, 
  isAdminOrManager 
}: { 
  initialCountries: any[]
  isAdminOrManager: boolean 
}) {
  const [countries, setCountries] = useState(initialCountries)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCountry, setEditingCountry] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const router = useRouter()

  const CARD_COLORS = [
    'bg-blue-50', 'bg-emerald-50', 'bg-purple-50', 'bg-orange-50', 'bg-rose-50', 'bg-indigo-50'
  ]

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleEdit = (country: any) => {
    setEditingCountry(country)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this country guide?')) return
    
    setIsDeleting(id)
    try {
      await deleteCountry(id)
      setCountries(countries.filter(c => c.id !== id))
      router.refresh()
    } catch (error) {
      alert('Failed to delete country')
    } finally {
      setIsDeleting(null)
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingCountry(null)
  }

  const handleSaveSuccess = () => {
    handleModalClose()
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search countries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4855E4]/50 border border-gray-300 shadow-sm text-gray-900 placeholder:text-gray-400 transition-all"
          />
        </div>
        
        {isAdminOrManager && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-sm border border-gray-200 hover:shadow-inner active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Country
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCountries.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-200 border-dashed">
            <Globe className="w-12 h-12 mx-auto mb-3 text-[#AEB9C9]" />
            <p className="text-lg font-bold">No countries found</p>
            <p className="text-sm">Try adjusting your search or add a new country.</p>
          </div>
        ) : (
          filteredCountries.map((country, idx) => (
            <div 
              key={country.id} 
              onClick={() => router.push(`/dashboard/countries/${country.id}`)}
              className={`${CARD_COLORS[idx % CARD_COLORS.length]} rounded-[2rem] p-6 border-4 border-white shadow-[8px_8px_16px_rgba(0,0,0,0.05),inset_2px_2px_4px_rgba(255,255,255,0.7),inset_-2px_-2px_4px_rgba(0,0,0,0.05)] flex flex-col cursor-pointer hover:scale-[1.02] transition-transform`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shadow-inner">
                    <Globe className="w-5 h-5 text-[#4855E4]" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900">{country.name}</h3>
                </div>
                
                {isAdminOrManager && (
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(country);
                      }}
                      className="p-2 rounded-lg bg-white text-gray-600 hover:text-blue-600 border border-gray-200 hover:bg-blue-50 transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(country.id);
                      }}
                      disabled={isDeleting === country.id}
                      className="p-2 rounded-lg bg-white text-gray-600 hover:text-red-600 border border-gray-200 hover:bg-red-50 transition-all disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-2xl bg-white/60 border border-white shadow-sm">
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Academic Req</p>
                    <p className="font-semibold text-gray-900 truncate">{country.academicRequirement || 'N/A'}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/60 border border-white shadow-sm">
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Study Gap</p>
                    <p className="font-semibold text-gray-900 truncate">{country.studyGapAcceptance || 'N/A'}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/60 border border-white shadow-sm">
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Total Cost</p>
                    <p className="font-semibold text-gray-900 truncate">{country.totalCost || 'N/A'}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/60 border border-white shadow-sm">
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Intakes</p>
                    <p className="font-semibold text-gray-900 truncate">{country.intakes || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold text-gray-600 pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    {Array.isArray(country.steps) ? country.steps.length : 0} Steps
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5" />
                    {Array.isArray(country.visaChecklist) ? country.visaChecklist.length : 0} Docs
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <CountryFormModal
          country={editingCountry}
          onClose={handleModalClose}
          onSuccess={handleSaveSuccess}
        />
      )}
    </div>
  )
}
