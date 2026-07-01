'use client'

import { Clock } from 'lucide-react'
import { updateTaskStatus } from '@/app/actions/tasks'
import Link from 'next/link'

export default function DashboardTasks({ tasks }: { tasks: any[] }) {
  if (tasks.length === 0) {
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
      {tasks.map(task => (
        <div key={task.id} className="flex items-start space-x-3 group">
          <input 
            type="checkbox" 
            onChange={() => handleTaskStatus(task.id)}
            className="mt-1 h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-blue-600 focus:ring-blue-500 cursor-pointer opacity-70 group-hover:opacity-100 transition-opacity" 
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-neutral-200">
              <Link href={`/dashboard/leads/${task.leadId}`} className="hover:text-blue-400">
                {task.description}
              </Link>
            </p>
            <p className="text-xs text-neutral-500 mt-1 flex items-center">
              <Clock className="h-3 w-3 mr-1 text-amber-500/70" /> {new Date(task.dueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {task.lead.fullName}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
