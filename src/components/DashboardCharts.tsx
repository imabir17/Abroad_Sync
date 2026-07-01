'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function DashboardCharts({ ratingsData, stagesData }: { ratingsData: any[], stagesData: any[] }) {
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-neutral-900 border border-neutral-700 p-3 rounded-lg shadow-lg z-50">
          <p className="text-white font-medium flex items-center">
            <span 
              className="w-3 h-3 rounded-full mr-2 inline-block" 
              style={{ backgroundColor: payload[0].payload.fill }}
            ></span>
            {payload[0].name}
          </p>
          <p className="text-sm text-neutral-400 mt-1">
            Count: <span className="text-white font-semibold ml-1">{payload[0].value}</span>
          </p>
        </div>
      )
    }
    return null
  }

  // Define a custom label for the pie chart to show percentages
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    if (percent < 0.05) return null; // Don't show label for very small slices

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm shadow-black/20 hover:border-neutral-700 transition-colors">
        <h3 className="text-lg font-semibold text-white mb-6">Lead Ratings Breakdown</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={ratingsData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
                labelLine={false}
                label={renderCustomizedLabel}
              >
                {ratingsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#a3a3a3' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm shadow-black/20 hover:border-neutral-700 transition-colors">
        <h3 className="text-lg font-semibold text-white mb-6">Pipeline Stages Breakdown</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stagesData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
                labelLine={false}
              >
                {stagesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
