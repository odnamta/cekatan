'use client'

export interface GlassCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

export function GlassCard({ icon, title, description }: GlassCardProps) {
  return (
    <div className="bg-white/70 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg shadow-slate-200/50 p-6 hover:bg-white/80 transition-colors">
      <div className="text-blue-600 mb-4">{icon}</div>
      <h3 className="font-semibold text-lg text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
    </div>
  )
}
