import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import { logoutAction } from '@/actions/auth-actions'
import { Button } from '@/components/ui/Button'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-700 bg-slate-800/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/dashboard" className="text-xl font-semibold text-slate-100">
            Celline&apos;s OBGYN Prep
          </a>
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" size="sm">
              Logout
            </Button>
          </form>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
