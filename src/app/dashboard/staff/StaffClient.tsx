'use client'

import { useState } from 'react'
import { createStaff, updateStaff, deleteStaff } from '@/app/actions/staff'
import { Plus, Edit2, Trash2, X } from 'lucide-react'

export default function StaffClient({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [formData, setFormData] = useState({ fullName: '', email: '', role: 'Counselor' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const openModal = (user?: any) => {
    setError('')
    if (user) {
      setEditingUser(user)
      setFormData({ fullName: user.fullName, email: user.email, role: user.role })
    } else {
      setEditingUser(null)
      setFormData({ fullName: '', email: '', role: 'Counselor' })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    const data = new FormData()
    data.append('fullName', formData.fullName)
    data.append('email', formData.email)
    data.append('role', formData.role)

    let res
    if (editingUser) {
      res = await updateStaff(editingUser.id, data)
    } else {
      res = await createStaff(data)
    }

    if (res.error) {
      setError(res.error)
      setIsLoading(false)
    } else {
      window.location.reload()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    const res = await deleteStaff(id)
    if (res.error) {
      alert(res.error)
    } else {
      window.location.reload()
    }
  }

  const inputClass = "w-full bg-[#1E1E1E] border border-[#3C3C3C] rounded-xl py-2.5 px-3 text-xs font-semibold text-white placeholder-gray-500 focus:outline-none focus:border-[#007ACC] transition-all"
  const selectClass = "w-full bg-[#1E1E1E] border border-[#3C3C3C] text-xs font-bold text-white rounded-xl py-2.5 px-3 outline-none focus:border-[#007ACC] transition-all cursor-pointer"

  return (
    <>
      <div className="space-y-8 pb-12">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white font-display">Staff Management</h2>
            <p className="text-xs text-gray-400">Manage counselor accounts, administrative permissions, and roles.</p>
          </div>
          <button 
            onClick={() => openModal()} 
            className="flex items-center gap-1.5 px-5 py-3 bg-[#0E639C] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#1177BB] active:translate-y-0.5 transition-all duration-150"
          >
            <Plus className="h-4.5 w-4.5" /> Add Staff
          </button>
        </div>

        {/* Staff Table Container */}
        <div className="bg-[#252526] border border-[#3C3C3C] rounded-2xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#3C3C3C]">
              <thead className="bg-[#1E1E1E]">
                <tr className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4 text-left">Name</th>
                  <th className="px-6 py-4 text-left">Email</th>
                  <th className="px-6 py-4 text-left">Role</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3C3C3C] bg-[#252526]">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-[#333333] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-white">{user.fullName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-gray-400">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold">
                      <span className={`px-2.5 py-0.5 inline-flex text-[10px] font-bold leading-5 rounded-full border ${
                        user.role === 'Super Admin' 
                          ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                          : user.role === 'Manager' 
                            ? 'bg-[#007ACC]/10 text-[#007ACC] border-[#007ACC]/20' 
                            : 'bg-[#21C285]/10 text-[#21C285] border-[#21C285]/20'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-bold space-x-2">
                      <button 
                        onClick={() => openModal(user)} 
                        className="inline-flex p-2 rounded-xl bg-[#333333] border border-[#3C3C3C] text-[#007ACC] hover:bg-[#2A2D2E] transition-all"
                        aria-label="Edit staff member details"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)} 
                        className="inline-flex p-2 rounded-xl bg-[#333333] border border-[#3C3C3C] text-[#E5484D] hover:bg-[#2A2D2E] transition-all"
                        aria-label="Delete staff member"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Staff Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#252526] border border-[#3C3C3C] rounded-2xl shadow-md max-w-md w-full p-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-white">{editingUser ? 'Edit Staff Details' : 'Add New Counselor'}</h3>
              <button 
                onClick={closeModal} 
                className="p-1.5 rounded-xl bg-[#333333] border border-[#3C3C3C] hover:bg-[#2A2D2E] text-gray-400 transition-all"
                aria-label="Close editing details dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-bold rounded-xl shadow-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2">Full Name</label>
                <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className={inputClass} placeholder="E.g. Tanvir Ahmed" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2">Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputClass} placeholder="tanvir@agency.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2">Role</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className={selectClass}>
                  <option value="Counselor">Counselor</option>
                  <option value="Manager">Manager</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={closeModal} 
                  className="px-5 py-2.5 rounded-xl bg-[#333333] border border-[#3C3C3C] text-xs font-bold text-gray-300 hover:bg-[#2A2D2E] transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading} 
                  className="px-5 py-2.5 rounded-xl bg-[#0E639C] text-white text-xs font-bold shadow-md hover:bg-[#1177BB] disabled:opacity-50 transition-all"
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
