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
    } else {
      window.location.reload()
    }
    setIsLoading(false)
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

  return (
    <>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Staff Management</h2>
          <button 
            onClick={() => openModal()} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Staff
          </button>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-neutral-800">
            <thead className="bg-neutral-950/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{user.fullName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'Super Admin' ? 'bg-red-500/10 text-red-400' : user.role === 'Manager' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => openModal(user)} className="text-blue-400 hover:text-blue-300 mr-4">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(user.id)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-neutral-800 shrink-0">
              <h3 className="text-lg font-bold text-white">{editingUser ? 'Edit Staff' : 'Add Staff'}</h3>
              <button onClick={closeModal} className="text-neutral-400 hover:text-white transition-colors"><X className="h-5 w-5" /></button>
            </div>
            
            <div className="overflow-y-auto p-6 flex-1">
              {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">{error}</div>}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Full Name</label>
                  <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Email</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Role</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                    <option value="Counselor">Counselor</option>
                    <option value="Manager">Manager</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>
                
                <div className="pt-4 flex justify-end space-x-3">
                  <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors">Cancel</button>
                  <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50">
                    {isLoading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
