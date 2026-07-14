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
    'bg-[#252526]'
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
            className="w-full pl-11 pr-4 py-3 bg-[#252526] border border-[#3C3C3C] rounded-xl text-sm focus:outline-none focus:border-[#007ACC] text-white placeholder:text-gray-400 shadow-md transition-all"
          />
        </div>
        
        {isAdminOrManager && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0E639C] hover:bg-[#1177BB] text-white text-sm font-bold rounded-xl shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Country
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCountries.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-400 bg-[#252526] rounded-2xl border border-[#3C3C3C] border-dashed">
            <Globe className="w-12 h-12 mx-auto mb-3 text-gray-500" />
            <p className="text-lg font-bold text-white">No countries found</p>
            <p className="text-sm">Try adjusting your search or add a new country.</p>
          </div>
        ) : (
          filteredCountries.map((country, idx) => (
            <div 
              key={country.id} 
              onClick={() => router.push(`/dashboard/countries/${country.id}`)}
              className="bg-[#252526] rounded-2xl p-6 border border-[#3C3C3C] hover:border-[#555555] shadow-md flex flex-col cursor-pointer hover:-translate-y-1 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#007ACC] flex items-center justify-center">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-white">{country.name}</h3>
                </div>
                
                {isAdminOrManager && (
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(country);
                      }}
                      className="p-2 rounded-lg bg-[#333333] text-gray-400 hover:text-white border border-[#3C3C3C] hover:bg-[#2A2D2E] transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(country.id);
                      }}
                      disabled={isDeleting === country.id}
                      className="p-2 rounded-lg bg-[#333333] text-gray-400 hover:text-red-400 border border-[#3C3C3C] hover:bg-[#2A2D2E] transition-all disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-xl bg-[#1E1E1E] border border-[#3C3C3C]">
                    <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Academic Req</p>
                    <p className="font-semibold text-gray-300 truncate">{country.academicRequirement || 'N/A'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#1E1E1E] border border-[#3C3C3C]">
                    <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Study Gap</p>
                    <p className="font-semibold text-gray-300 truncate">{country.studyGapAcceptance || 'N/A'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#1E1E1E] border border-[#3C3C3C]">
                    <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Total Cost</p>
                    <p className="font-semibold text-gray-300 truncate">{country.totalCost || 'N/A'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#1E1E1E] border border-[#3C3C3C]">
                    <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Intakes</p>
                    <p className="font-semibold text-gray-300 truncate">{country.intakes || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold text-gray-400 pt-2 border-t border-[#3C3C3C]">
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
