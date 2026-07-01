'use client'

import { useState } from 'react'
import { Clock, AlertCircle, CheckCircle, X } from 'lucide-react'
import Link from 'next/link'
import { updateTaskStatus } from '@/app/actions/tasks'

export default function TasksModalClient({ tasks, pendingCount }: { tasks: any[], pendingCount: number }) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending')
  const [localTasks, setLocalTasks] = useState(tasks)

  const pendingTasks = localTasks.filter(t => t.status === 'Pending')
  const completedTasks = localTasks.filter(t => t.status === 'Completed').sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  const handleTaskComplete = async (taskId: string) => {
    // Optimistic UI update
    setLocalTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'Completed', updatedAt: new Date().toISOString() } : t))
    await updateTaskStatus(taskId, 'Completed')
  }

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm shadow-black/20 hover:border-neutral-700 transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-neutral-400 font-medium">Pending Tasks</h3>
          <Clock className="text-amber-500 h-5 w-5" />
        </div>
        <p className="text-3xl font-bold text-white mt-4">{pendingCount}</p>
        <p className="text-xs text-amber-500 mt-1 flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" /> Click to view details
        </p>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-800">
              <h2 className="text-xl font-bold text-white">Task Management</h2>
              <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-white transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-neutral-800 px-6 pt-4 space-x-6">
              <button 
                onClick={() => setActiveTab('pending')}
                className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'pending' ? 'text-blue-400 border-blue-400' : 'text-neutral-500 border-transparent hover:text-neutral-300'}`}
              >
                Pending ({pendingTasks.length})
              </button>
              <button 
                onClick={() => setActiveTab('completed')}
                className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'completed' ? 'text-emerald-400 border-emerald-400' : 'text-neutral-500 border-transparent hover:text-neutral-300'}`}
              >
                History ({completedTasks.length})
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-6 flex-1">
              {activeTab === 'pending' && (
                <div className="space-y-3">
                  {pendingTasks.length === 0 ? (
                    <p className="text-neutral-500 text-center py-8">No pending tasks!</p>
                  ) : (
                    pendingTasks.map(task => (
                      <div key={task.id} className="flex items-start space-x-3 bg-neutral-950 p-4 rounded-xl border border-neutral-800 group hover:border-neutral-700 transition-colors">
                        <input 
                          type="checkbox" 
                          onChange={() => handleTaskComplete(task.id)}
                          className="mt-1 h-5 w-5 rounded border-neutral-700 bg-neutral-900 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-neutral-200">
                            <Link href={`/dashboard/leads/${task.leadId}`} onClick={() => setIsOpen(false)} className="hover:text-blue-400">
                              {task.description}
                            </Link>
                          </p>
                          <p className="text-xs text-amber-500 mt-1 flex items-center">
                            <Clock className="h-3 w-3 mr-1" /> Due: {new Date(task.dueDate).toLocaleString()} - {task.lead.fullName}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'completed' && (
                <div className="space-y-3">
                  {completedTasks.length === 0 ? (
                    <p className="text-neutral-500 text-center py-8">No task history yet.</p>
                  ) : (
                    completedTasks.map(task => (
                      <div key={task.id} className="flex items-start space-x-3 bg-neutral-950 p-4 rounded-xl border border-neutral-800/50 opacity-75">
                        <CheckCircle className="mt-0.5 h-5 w-5 text-emerald-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-neutral-400 line-through">
                            <Link href={`/dashboard/leads/${task.leadId}`} onClick={() => setIsOpen(false)} className="hover:text-emerald-400">
                              {task.description}
                            </Link>
                          </p>
                          <p className="text-xs text-neutral-500 mt-1">
                            Completed: {new Date(task.updatedAt).toLocaleString()} - {task.lead.fullName}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
