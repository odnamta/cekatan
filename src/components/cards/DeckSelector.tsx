'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

interface Deck {
  id: string
  title: string
}

interface DeckSelectorProps {
  currentDeckId: string
  onSelect: (deckId: string, deckTitle: string) => void
  onCancel: () => void
}

/**
 * DeckSelector - Modal for selecting target deck for bulk move
 * Requirements: C.6
 */
export function DeckSelector({ currentDeckId, onSelect, onCancel }: DeckSelectorProps) {
  const [decks, setDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDecks() {
      const supabase = createSupabaseBrowserClient()
      const { data } = await supabase
        .from('decks')
        .select('id, title')
        .neq('id', currentDeckId)
        .order('title')

      setDecks(data || [])
      setLoading(false)
    }
    fetchDecks()
  }, [currentDeckId])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Move cards to...
          </h3>
          <button
            onClick={onCancel}
            className="p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 max-h-80 overflow-y-auto">
          {loading ? (
            <p className="text-center text-slate-500 py-4">Loading decks...</p>
          ) : decks.length === 0 ? (
            <p className="text-center text-slate-500 py-4">No other decks available</p>
          ) : (
            <div className="space-y-2">
              {decks.map((deck) => (
                <button
                  key={deck.id}
                  onClick={() => onSelect(deck.id, deck.title)}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-900 dark:text-slate-100"
                >
                  {deck.title}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
