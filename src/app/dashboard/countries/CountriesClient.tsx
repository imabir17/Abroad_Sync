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
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8891A3]" />
          <input
            type="text"
            placeholder="Search countries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#E7ECF3] border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4855E4]/50 shadow-[inset_3px_3px_6px_#AEB9C9,inset_-3px_-3px_6px_#FFFFFF] text-[#202638] placeholder:text-[#8891A3] transition-all"
          />
        </div>
        
        {isAdminOrManager && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6E79F2] to-[#4855E4] text-white text-sm font-bold rounded-xl shadow-[4px_4px_8px_#AEB9C9,-4px_-4px_8px_#FFFFFF] hover:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.2)] active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Country
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCountries.length === 0 ? (
          <div className="col-span-full py-12 text-center text-[#5C6478] bg-[#E7ECF3] rounded-2xl shadow-[inset_4px_4px_8px_#AEB9C9,inset_-4px_-4px_8px_#FFFFFF]">
            <Globe className="w-12 h-12 mx-auto mb-3 text-[#AEB9C9]" />
            <p className="text-lg font-bold">No countries found</p>
            <p className="text-sm">Try adjusting your search or add a new country.</p>
          </div>
        ) : (
          filteredCountries.map(country => (
            <div 
              key={country.id} 
              onClick={() => router.push(`/dashboard/countries/${country.id}`)}
              className="bg-[#E7ECF3] rounded-2xl p-6 shadow-[8px_8px_16px_#AEB9C9,-8px_-8px_16px_#FFFFFF] flex flex-col cursor-pointer hover:scale-[1.02] transition-transform"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6E79F2]/20 to-[#4855E4]/20 flex items-center justify-center shadow-inner">
                    <Globe className="w-5 h-5 text-[#4855E4]" />
                  </div>
                  <h3 className="font-bold text-lg text-[#202638]">{country.name}</h3>
                </div>
                
                {isAdminOrManager && (
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(country);
                      }}
                      className="p-2 rounded-lg bg-[#E7ECF3] text-[#5C6478] hover:text-[#4855E4] shadow-[2px_2px_4px_#AEB9C9,-2px_-2px_4px_#FFFFFF] active:shadow-[inset_2px_2px_4px_#AEB9C9,inset_-2px_-2px_4px_#FFFFFF] transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(country.id);
                      }}
                      disabled={isDeleting === country.id}
                      className="p-2 rounded-lg bg-[#E7ECF3] text-[#5C6478] hover:text-red-500 shadow-[2px_2px_4px_#AEB9C9,-2px_-2px_4px_#FFFFFF] active:shadow-[inset_2px_2px_4px_#AEB9C9,inset_-2px_-2px_4px_#FFFFFF] transition-all disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-[#E7ECF3] rounded-xl shadow-[inset_2px_2px_5px_#AEB9C9,inset_-2px_-2px_5px_#FFFFFF]">
                    <p className="text-[10px] uppercase font-bold text-[#8891A3] mb-1">Academic Req</p>
                    <p className="font-semibold text-[#202638] truncate">{country.academicRequirement || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-[#E7ECF3] rounded-xl shadow-[inset_2px_2px_5px_#AEB9C9,inset_-2px_-2px_5px_#FFFFFF]">
                    <p className="text-[10px] uppercase font-bold text-[#8891A3] mb-1">Study Gap</p>
                    <p className="font-semibold text-[#202638] truncate">{country.studyGapAcceptance || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-[#E7ECF3] rounded-xl shadow-[inset_2px_2px_5px_#AEB9C9,inset_-2px_-2px_5px_#FFFFFF]">
                    <p className="text-[10px] uppercase font-bold text-[#8891A3] mb-1">Total Cost</p>
                    <p className="font-semibold text-[#202638] truncate">{country.totalCost || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-[#E7ECF3] rounded-xl shadow-[inset_2px_2px_5px_#AEB9C9,inset_-2px_-2px_5px_#FFFFFF]">
                    <p className="text-[10px] uppercase font-bold text-[#8891A3] mb-1">Intakes</p>
                    <p className="font-semibold text-[#202638] truncate">{country.intakes || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold text-[#5C6478] pt-2 border-t border-[#AEB9C9]/30">
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
