import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // If user is already authenticated, redirect to dashboard
  const user = await getUser()
  
  if (user) {
    redirect('/dashboard')
  }

  return <>{children}</>
}
