'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MyDeckCard } from './MyDeckCard'
import type { MyDeckItem } from '@/types/database'

interface MyLibraryGridProps {
  decks: MyDeckItem[]
}

export function MyLibraryGrid({ decks }: MyLibraryGridProps) {
  const router = useRouter()

  const handleUnsubscribeSuccess = () => {
    router.refresh()
  }

  if (decks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 dark:text-slate-500 mb-2">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">
          No decks in your library yet
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Browse the library to find study materials.
        </p>
        <Link
          href="/library"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Browse Library
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {decks.map((deck) => (
        <MyDeckCard
          key={deck.id}
          deck={deck}
          onUnsubscribeSuccess={handleUnsubscribeSuccess}
        />
      ))}
    </div>
  )
}
