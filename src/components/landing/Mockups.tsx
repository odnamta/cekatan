/**
 * Stylized product mockups for the landing page.
 * These are abstract representations of the Cekatan UI — NOT screenshots.
 * Uses colored rectangles + SVG charts to suggest product features.
 */

/* ─── Dashboard Mockup ─── */

export function DashboardMockup({ className = '' }: { className?: string }) {
  return (
    <div className={`relative group ${className}`}>
      {/* Glow behind */}
      <div className="absolute -inset-1 bg-gradient-to-b from-blue-500/20 via-blue-400/10 to-transparent rounded-2xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-700" />

      {/* Browser chrome */}
      <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-slate-900 shadow-2xl shadow-black/60">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 h-9 bg-slate-800/80 border-b border-white/5">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
          </div>
          <div className="flex-1 mx-6">
            <div className="h-5 bg-slate-700/40 rounded-md text-[10px] text-slate-500 flex items-center justify-center font-mono">
              cekatan.com/dashboard
            </div>
          </div>
        </div>

        {/* App layout */}
        <div className="flex min-h-[260px]">
          {/* Sidebar */}
          <div className="w-32 p-2.5 space-y-0.5 border-r border-white/5 bg-slate-800/30 shrink-0">
            <SidebarItem active label={56} />
            <SidebarItem label={44} />
            <SidebarItem label={52} />
            <SidebarItem label={36} />
            <SidebarItem label={48} />
          </div>

          {/* Main content */}
          <div className="flex-1 p-4 space-y-3 overflow-hidden">
            {/* Title row */}
            <div>
              <div className="w-20 h-3 rounded bg-white/90 mb-1" />
              <div className="w-40 h-1.5 rounded-full bg-slate-600/30" />
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-2.5">
              <StatCard color="blue" pct={65} />
              <StatCard color="green" pct={82} />
              <StatCard color="purple" pct={48} />
            </div>

            {/* Area chart */}
            <div className="rounded-lg bg-slate-800/50 p-3 border border-white/[0.04]">
              <div className="w-16 h-1.5 rounded-full bg-slate-600/30 mb-2" />
              <svg className="w-full h-16" viewBox="0 0 300 64" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4D94FF" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#4D94FF" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,48 C40,44 60,32 100,36 C140,40 160,16 200,20 C240,24 260,8 300,6 L300,64 L0,64Z"
                  fill="url(#areaFill)"
                />
                <path
                  d="M0,48 C40,44 60,32 100,36 C140,40 160,16 200,20 C240,24 260,8 300,6"
                  stroke="#4D94FF"
                  strokeWidth="2"
                  fill="none"
                />
                <circle cx="200" cy="20" r="3" fill="#4D94FF" />
                <circle cx="200" cy="20" r="6" fill="#4D94FF" opacity="0.2" />
              </svg>
            </div>

            {/* Bottom row: mini radar + table */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Radar chart */}
              <div className="rounded-lg bg-slate-800/50 p-3 border border-white/[0.04]">
                <div className="w-14 h-1.5 rounded-full bg-slate-600/30 mb-2" />
                <svg className="w-full h-20" viewBox="0 0 100 80">
                  <polygon points="50,10 85,35 73,70 27,70 15,35" stroke="#334155" strokeWidth="0.5" fill="none" />
                  <polygon points="50,22 72,38 64,62 36,62 28,38" stroke="#334155" strokeWidth="0.5" fill="none" />
                  <polygon points="50,34 60,42 56,54 44,54 40,42" stroke="#334155" strokeWidth="0.5" fill="none" />
                  <polygon points="50,16 80,34 68,67 32,67 20,34" stroke="#4D94FF" strokeWidth="1.5" fill="#4D94FF" fillOpacity="0.15" />
                  {/* Data points */}
                  <circle cx="50" cy="16" r="2" fill="#4D94FF" />
                  <circle cx="80" cy="34" r="2" fill="#4D94FF" />
                  <circle cx="68" cy="67" r="2" fill="#4D94FF" />
                  <circle cx="32" cy="67" r="2" fill="#4D94FF" />
                  <circle cx="20" cy="34" r="2" fill="#4D94FF" />
                </svg>
              </div>
              {/* Table */}
              <div className="rounded-lg bg-slate-800/50 p-3 border border-white/[0.04] space-y-2">
                <div className="w-14 h-1.5 rounded-full bg-slate-600/30" />
                {[72, 56, 64, 44].map((w, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-slate-700/60 shrink-0" />
                    <div className="flex-1">
                      <div className="h-1.5 rounded-full bg-slate-600/30 mb-1" style={{ width: w }} />
                      <div className="h-1 rounded-full bg-slate-700/30 w-10" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Assessment Mockup ─── */

export function AssessmentMockup({ className = '' }: { className?: string }) {
  return (
    <div className={`relative group ${className}`}>
      <div className="absolute -inset-1 bg-gradient-to-b from-green-500/15 via-blue-400/10 to-transparent rounded-2xl blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-700" />

      <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-slate-900 shadow-2xl shadow-black/60">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 h-9 bg-slate-800/80 border-b border-white/5">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
          </div>
          <div className="flex-1 mx-6">
            <div className="h-5 bg-slate-700/40 rounded-md text-[10px] text-slate-500 flex items-center justify-center font-mono">
              cekatan.com/t/abc123/exam
            </div>
          </div>
        </div>

        {/* Exam content */}
        <div className="p-5 space-y-4 min-h-[260px]">
          {/* Header: title + timer */}
          <div className="flex items-center justify-between">
            <div>
              <div className="w-36 h-3 rounded bg-white/80 mb-1" />
              <div className="w-24 h-1.5 rounded-full bg-slate-600/30" />
            </div>
            {/* Timer badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/20">
              <div className="w-3 h-3 rounded-full border-2 border-amber-400/60" />
              <div className="w-10 h-2 rounded bg-amber-400/70" />
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400" style={{ width: '60%' }} />
          </div>
          <div className="flex justify-between text-[9px] text-slate-500">
            <span>Soal 12 dari 20</span>
            <span>60%</span>
          </div>

          {/* Question */}
          <div className="rounded-xl bg-slate-800/50 border border-white/[0.04] p-4 space-y-3">
            <div className="space-y-1.5">
              <div className="w-full h-2 rounded-full bg-slate-600/40" />
              <div className="w-4/5 h-2 rounded-full bg-slate-600/40" />
              <div className="w-2/3 h-2 rounded-full bg-slate-600/30" />
            </div>

            {/* Answer options */}
            <div className="space-y-2 pt-2">
              <AnswerOption width="82%" />
              <AnswerOption selected width="68%" />
              <AnswerOption width="75%" />
              <AnswerOption width="90%" />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-1">
            <div className="w-20 h-8 rounded-lg bg-slate-800/60 border border-white/[0.06]" />
            <div className="w-28 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <div className="w-16 h-2 rounded bg-white/80" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Helper sub-components ─── */

function SidebarItem({ active, label }: { active?: boolean; label: number }) {
  return (
    <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${active ? 'bg-blue-500/15 border border-blue-500/20' : ''}`}>
      <div className={`w-3 h-3 rounded ${active ? 'bg-blue-400/60' : 'bg-slate-600/30'}`} />
      <div className={`h-1.5 rounded-full ${active ? 'bg-blue-300' : 'bg-slate-600/30'}`} style={{ width: label }} />
    </div>
  )
}

function StatCard({ color, pct }: { color: 'blue' | 'green' | 'purple'; pct: number }) {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
  }
  return (
    <div className="rounded-lg bg-slate-800/50 p-2.5 space-y-1.5 border border-white/[0.04]">
      <div className="w-10 h-1.5 rounded-full bg-slate-600/30" />
      <div className="w-6 h-2.5 rounded bg-white/80" />
      <div className="h-1 rounded-full bg-slate-700">
        <div className={`h-full rounded-full ${colors[color]}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function AnswerOption({ selected, width = '75%' }: { selected?: boolean; width?: string }) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
      selected
        ? 'bg-blue-500/10 border-blue-500/30'
        : 'bg-slate-800/30 border-white/[0.04]'
    }`}>
      <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${
        selected ? 'border-blue-400 bg-blue-400' : 'border-slate-600'
      }`}>
        {selected && (
          <svg viewBox="0 0 16 16" className="w-full h-full text-white">
            <path d="M4 8l3 3 5-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <div className={`h-1.5 rounded-full ${selected ? 'bg-blue-300/60' : 'bg-slate-600/30'}`} style={{ width }} />
    </div>
  )
}
