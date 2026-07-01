'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { LEAD_STAGES } from '@/lib/constants'

interface ReportChartsProps {
  data: { stage: string; count: number }[];
}

export function ReportCharts({ data }: ReportChartsProps) {
  // Ensure all stages are present even if count is 0, so the chart looks consistent
  const fullData = LEAD_STAGES.map(stage => {
    const found = data.find(d => d.stage === stage)
    return {
      stage,
      count: found ? found.count : 0
    }
  })

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={fullData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <XAxis 
            dataKey="stage" 
            tick={{ fill: '#888', fontSize: 12 }} 
            angle={-45}
            textAnchor="end"
            height={80}
            stroke="#555"
          />
          <YAxis 
            tick={{ fill: '#888' }} 
            stroke="#555"
            allowDecimals={false}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#171717', borderColor: '#333', color: '#fff', borderRadius: '8px' }}
            itemStyle={{ color: '#60A5FA' }}
            cursor={{ fill: '#222' }}
          />
          <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
