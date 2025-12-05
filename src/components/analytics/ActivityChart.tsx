'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { DailyActivity } from '@/types/database'

interface ActivityChartProps {
  data: DailyActivity[]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    payload: DailyActivity
  }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  const data = payload[0].payload
  
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 p-3">
      <p className="font-medium text-slate-900">{data.dayName}</p>
      <p className="text-sm text-slate-600">
        <span className="font-semibold text-blue-600">{data.cardsReviewed}</span> cards reviewed
      </p>
    </div>
  )
}

/**
 * ActivityChart component for visualizing weekly study activity.
 * Uses recharts BarChart with glassmorphic styling.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */
export function ActivityChart({ data }: ActivityChartProps) {
  const maxCards = Math.max(...data.map(d => d.cardsReviewed), 1)
  const today = new Date().toISOString().split('T')[0]

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: -10 }}>
        <XAxis 
          dataKey="dayName" 
          tick={{ fill: '#64748b', fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: '#e2e8f0' }}
        />
        <YAxis 
          tick={{ fill: '#94a3b8', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          domain={[0, Math.ceil(maxCards * 1.1)]}
          width={30}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
        <Bar 
          dataKey="cardsReviewed" 
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        >
          {data.map((entry) => (
            <Cell 
              key={entry.date}
              fill={entry.date === today ? '#3b82f6' : '#93c5fd'}
              fillOpacity={entry.cardsReviewed === 0 ? 0.3 : 0.8}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default ActivityChart
