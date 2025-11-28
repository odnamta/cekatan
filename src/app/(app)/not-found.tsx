import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Home, Search } from 'lucide-react'

/**
 * Not Found page for the app route group.
 * Displays when a user navigates to a non-existent page.
 */
export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <Card variant="elevated" padding="lg" className="text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-6">
          <Search className="w-8 h-8 text-slate-400 dark:text-slate-500" />
        </div>
        
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Page not found
        </h1>
        
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <Link href="/dashboard">
          <Button variant="primary">
            <Home className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </Card>
    </div>
  )
}
