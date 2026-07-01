'use client'

import { useState } from 'react'
import { createTask, updateTaskStatus, deleteTask } from '@/app/actions/tasks'
import { CheckSquare, Clock, Plus, Trash2, X } from 'lucide-react'
import Link from 'next/link'

export default function TasksClient({ tasks, counselors, isAdminOrManager, currentUser }: { tasks: any[], counselors: any[], isAdminOrManager: boolean, currentUser: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ description: '', dueDate: '', counselorId: currentUser.id })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const data = new FormData()
    data.append('description', formData.description)
    data.append('dueDate', formData.dueDate)
    data.append('counselorId', formData.counselorId)

    await createTask(data)
    
    setFormData({ description: '', dueDate: '', counselorId: currentUser.id })
    setIsModalOpen(false)
    setIsSubmitting(false)
  }

  const handleStatusChange = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending'
    await updateTaskStatus(taskId, newStatus)
  }

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return
    await deleteTask(taskId)
  }

  const pendingTasks = tasks.filter(t => t.status === 'Pending')
  const completedTasks = tasks.filter(t => t.status === 'Completed')

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Tasks & Reminders</h2>
          <p className="text-neutral-400">Manage your follow-ups and assignments.</p>
        </div>
        {isAdminOrManager && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Assign Task
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending Tasks */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm shadow-black/20">
          <h3 className="text-lg font-semibold text-white flex items-center mb-4">
            <Clock className="h-5 w-5 mr-2 text-amber-400" /> Pending ({pendingTasks.length})
          </h3>
          
          <div className="space-y-3">
            {pendingTasks.length === 0 ? (
              <p className="text-neutral-500 text-sm text-center py-4">No pending tasks.</p>
            ) : (
              pendingTasks.map(task => (
                <div key={task.id} className="bg-neutral-950 p-4 rounded-lg border border-neutral-800 group transition-colors hover:border-neutral-700">
                  <div className="flex items-start">
                    <input 
                      type="checkbox" 
                      checked={false}
                      onChange={() => handleStatusChange(task.id, task.status)}
                      disabled={!isAdminOrManager && currentUser.id !== task.counselorId}
                      className="mt-1 h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-blue-600 cursor-pointer disabled:opacity-50"
                    />
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-white mb-1">{task.description}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
                        <span className="flex items-center text-amber-400">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(task.dueDate).toLocaleString()}
                        </span>
                        {isAdminOrManager && (
                          <span>• Assigned to: {task.counselor?.fullName}</span>
                        )}
                        {task.lead && (
                          <span>• Lead: <Link href={`/dashboard/leads/${task.lead.id}`} className="text-blue-400 hover:underline">{task.lead.fullName}</Link></span>
                        )}
                      </div>
                    </div>
                    {isAdminOrManager && (
                      <button onClick={() => handleDelete(task.id)} className="text-neutral-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm shadow-black/20 opacity-75">
          <h3 className="text-lg font-semibold text-white flex items-center mb-4">
            <CheckSquare className="h-5 w-5 mr-2 text-emerald-400" /> Completed ({completedTasks.length})
          </h3>
          
          <div className="space-y-3">
            {completedTasks.length === 0 ? (
              <p className="text-neutral-500 text-sm text-center py-4">No completed tasks yet.</p>
            ) : (
              completedTasks.map(task => (
                <div key={task.id} className="bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                  <div className="flex items-start">
                    <input 
                      type="checkbox" 
                      checked={true}
                      onChange={() => handleStatusChange(task.id, task.status)}
                      disabled={!isAdminOrManager && currentUser.id !== task.counselorId}
                      className="mt-1 h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-blue-600 cursor-pointer disabled:opacity-50"
                    />
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-neutral-400 line-through mb-1">{task.description}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                        <span className="flex items-center">
                          <CheckSquare className="h-3 w-3 mr-1" />
                          Done
                        </span>
                        {isAdminOrManager && (
                          <span>• By: {task.counselor?.fullName}</span>
                        )}
                        {task.lead && (
                          <span>• Lead: <Link href={`/dashboard/leads/${task.lead.id}`} className="text-blue-400 hover:underline">{task.lead.fullName}</Link></span>
                        )}
                      </div>
                    </div>
                    {isAdminOrManager && (
                      <button onClick={() => handleDelete(task.id)} className="text-neutral-500 hover:text-red-400 ml-2">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Assign Task</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Description</label>
                <input required type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500" placeholder="E.g. Prepare weekly report" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Due Date</label>
                <input required type="datetime-local" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Assign To</label>
                <select value={formData.counselorId} onChange={e => setFormData({...formData, counselorId: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                  {counselors.map(c => (
                    <option key={c.id} value={c.id}>{c.fullName}</option>
                  ))}
                </select>
              </div>
              
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : 'Assign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
