import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cekatan — Asesmen Online',
}

export default function PublicTestLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {children}
    </div>
  )
}
