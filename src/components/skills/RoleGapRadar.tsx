'use client'

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { SkillPriority } from '@/types/database'

interface RoleRequirement {
  skill_name: string
  skill_color: string
  target_score: number
  priority: SkillPriority
  actual_score: number | null
}

interface RoleGapRadarProps {
  roleName: string
  requirements: RoleRequirement[]
  size?: number
}

interface GapDataPoint {
  skill: string
  target: number
  actual: number
  priority: SkillPriority
  gap: number
}

interface GapTooltipProps {
  active?: boolean
  payload?: Array<{
    dataKey: string
    value: number
    payload: GapDataPoint
  }>
}

function GapTooltip({ active, payload }: GapTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  const data = payload[0].payload
  const gap = data.actual - data.target
  const priorityLabel = { required: 'Wajib', recommended: 'Disarankan', optional: 'Opsional' }

  return (
    <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-3">
      <p className="font-medium text-slate-900 dark:text-slate-100">{data.skill}</p>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Target: <span className="font-semibold">{data.target}%</span>
      </p>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Aktual: <span className={`font-semibold ${data.actual >= data.target ? 'text-green-600' : 'text-red-500'}`}>
          {data.actual}%
        </span>
      </p>
      {gap !== 0 && (
        <p className={`text-xs font-medium mt-1 ${gap >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {gap >= 0 ? `+${gap.toFixed(0)}` : gap.toFixed(0)} poin
        </p>
      )}
      <p className="text-xs text-slate-400 mt-1">{priorityLabel[data.priority]}</p>
    </div>
  )
}

export function RoleGapRadar({ roleName, requirements, size = 350 }: RoleGapRadarProps) {
  const chartData: GapDataPoint[] = requirements.map((r) => ({
    skill: r.skill_name,
    target: r.target_score,
    actual: r.actual_score ?? 0,
    priority: r.priority,
    gap: (r.actual_score ?? 0) - r.target_score,
  }))

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center text-slate-500 dark:text-slate-400 py-8">
        Belum ada skill requirement untuk role ini
      </div>
    )
  }

  // For fewer than 3 skills, show gap bars
  if (chartData.length < 3) {
    return (
      <div className="space-y-4">
        {chartData.map((item) => {
          const meetsTarget = item.actual >= item.target
          return (
            <div key={item.skill}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.skill}</span>
                <span className={`text-sm font-semibold ${meetsTarget ? 'text-green-600' : 'text-red-500'}`}>
                  {item.actual}% / {item.target}%
                </span>
              </div>
              <div className="relative w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="absolute h-full rounded-full opacity-30 bg-blue-500"
                  style={{ width: `${item.target}%` }}
                />
                <div
                  className={`absolute h-full rounded-full ${meetsTarget ? 'bg-green-500' : 'bg-red-400'}`}
                  style={{ width: `${item.actual}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={size}>
        <RadarChart data={chartData} margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="skill"
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickLine={false}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            tickCount={5}
          />
          <Radar
            name="Target"
            dataKey="target"
            stroke="#94a3b8"
            fill="#94a3b8"
            fillOpacity={0.15}
            strokeWidth={2}
            strokeDasharray="5 5"
          />
          <Radar
            name="Aktual"
            dataKey="actual"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.3}
            strokeWidth={2}
            dot={{ r: 4, fill: '#3b82f6', stroke: '#3b82f6', strokeWidth: 2 }}
          />
          <Tooltip content={<GapTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            iconType="line"
          />
        </RadarChart>
      </ResponsiveContainer>
      {/* Gap summary below chart */}
      <div className="mt-2 flex flex-wrap gap-2 justify-center">
        {chartData.map((item) => {
          const meetsTarget = item.actual >= item.target
          return (
            <span
              key={item.skill}
              className={`text-xs px-2 py-1 rounded-full ${
                meetsTarget
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}
            >
              {item.skill}: {meetsTarget ? '✓' : `−${Math.abs(item.gap).toFixed(0)}`}
            </span>
          )
        })}
      </div>
    </div>
  )
}
