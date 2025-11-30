'use client'

import { useRouter } from 'next/navigation'
import { DeckBrowseCard } from './DeckBrowseCard'
import type { BrowseDeckItem } from '@/types/database'

interface LibraryGridProps {
  decks: BrowseDeckItem[]
}

export function LibraryGrid({ decks }: LibraryGridProps) {
  const router = useRouter()

  const handleSubscribeSuccess = () => {
    router.refresh()
  }

  if (decks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 dark:text-slate-500 mb-2">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">
          No decks available yet
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Check back later for new study materials.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {decks.map((deck) => (
        <DeckBrowseCard
          key={deck.id}
          deck={deck}
          onSubscribeSuccess={handleSubscribeSuccess}
        />
      ))}
    </div>
  )
}
