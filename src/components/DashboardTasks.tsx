'use client'

import { useState, useEffect } from 'react'
import { Clock, AlertCircle } from 'lucide-react'
import { updateTaskStatus } from '@/app/actions/tasks'
import Link from 'next/link'

export default function DashboardTasks({ tasks }: { tasks: any[] }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="text-sm text-neutral-500 py-4 animate-pulse">
        Loading agenda...
      </div>
    )
  }

  // Filter tasks due today or overdue in the user's browser local time
  const localEndOfToday = new Date()
  localEndOfToday.setHours(23, 59, 59, 999)

  const agendaTasks = tasks
    .filter(t => t.status === 'Pending' && new Date(t.dueDate) <= localEndOfToday)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

  if (agendaTasks.length === 0) {
    return (
      <div className="text-sm text-neutral-500 py-4">
        No pending tasks for today.
      </div>
    )
  }

  const handleTaskStatus = async (taskId: string) => {
    await updateTaskStatus(taskId, 'Completed')
  }

  return (
    <div className="space-y-4">
      {agendaTasks.map(task => (
        <div key={task.id} className="flex items-start space-x-3 group">
          <input 
            type="checkbox" 
            onChange={() => handleTaskStatus(task.id)}
            className="mt-1 h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-blue-600 focus:ring-blue-500 cursor-pointer opacity-70 group-hover:opacity-100 transition-opacity" 
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-neutral-200">
              {task.leadId ? (
                <Link href={`/dashboard/leads/${task.leadId}`} className="hover:text-blue-400">
                  {task.description}
                </Link>
              ) : (
                <span>{task.description}</span>
              )}
            </p>
            <p className="text-xs text-neutral-500 mt-1 flex items-center">
              <Clock className="h-3 w-3 mr-1 text-amber-500/70" /> 
              {new Date(task.dueDate).toLocaleString()} 
              {task.lead ? ` - ${task.lead.fullName}` : ''}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
