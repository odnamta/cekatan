'use client'

import Link from 'next/link'
import { useTransition, useState } from 'react'
import { unsubscribeFromDeck } from '@/actions/library-actions'
import { Button } from '@/components/ui/Button'
import type { MyDeckItem } from '@/types/database'

interface MyDeckCardProps {
  deck: MyDeckItem
  onUnsubscribeSuccess?: () => void
}

export function MyDeckCard({ deck, onUnsubscribeSuccess }: MyDeckCardProps) {
  const [isPending, startTransition] = useTransition()
  const [showConfirm, setShowConfirm] = useState(false)

  const handleUnsubscribe = () => {
    startTransition(async () => {
      const result = await unsubscribeFromDeck(deck.id)
      if (result.success && onUnsubscribeSuccess) {
        onUnsubscribeSuccess()
      }
      setShowConfirm(false)
    })
  }

  const totalDue = deck.due_count + deck.new_count

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-sm dark:shadow-none">
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 line-clamp-2">
            {deck.title}
          </h3>
          {deck.isAuthor && (
            <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400">
              Your deck
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {deck.card_count} {deck.card_count === 1 ? 'card' : 'cards'}
          </span>
          {totalDue > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400">
              {totalDue} due
            </span>
          )}
          {deck.new_count > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400">
              {deck.new_count} new
            </span>
          )}
        </div>

        <div className="mt-auto pt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-700">
          {showConfirm ? (
            <div className="flex items-center gap-2 w-full">
              <span className="text-sm text-slate-600 dark:text-slate-400">Unsubscribe?</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirm(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUnsubscribe}
                disabled={isPending}
                className="text-red-600 dark:text-red-400"
              >
                {isPending ? '...' : 'Yes'}
              </Button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setShowConfirm(true)}
                className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                Unsubscribe
              </button>
              <Link href={`/study/global`}>
                <Button variant="primary" size="sm">
                  {totalDue > 0 ? 'Continue Study' : 'Start Today'}
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
