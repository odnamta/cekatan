import { createSupabaseServerClient, getUser } from '@/lib/supabase/server'
import { CreateDeckForm } from '@/components/decks/CreateDeckForm'
import { DeckCard } from '@/components/decks/DeckCard'
import { calculateDueCount } from '@/lib/due-count'
import type { DeckWithDueCount } from '@/types/database'

/**
 * Dashboard Page - React Server Component
 * Displays user's decks with due card counts.
 * Requirements: 2.2, 6.1, 6.2, 6.4
 */
export default async function DashboardPage() {
  const user = await getUser()
  
  if (!user) {
    return null // Layout handles redirect
  }

  const supabase = await createSupabaseServerClient()
  const now = new Date().toISOString()

  // Fetch user's decks with due counts (Requirement 6.1, 6.2)
  // RLS ensures only user's own decks are returned (Requirement 2.2)
  const { data: decks, error } = await supabase
    .from('decks')
    .select(`
      id,
      user_id,
      title,
      created_at,
      cards!left(id, next_review)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-red-400">Error loading decks: {error.message}</p>
      </div>
    )
  }

  // Calculate due counts for each deck using the tested utility function
  const decksWithDueCounts: DeckWithDueCount[] = (decks || []).map((deck) => {
    const cards = (deck.cards || []) as { next_review: string }[]
    const dueCount = calculateDueCount(cards, now)
    
    return {
      id: deck.id,
      user_id: deck.user_id,
      title: deck.title,
      created_at: deck.created_at,
      due_count: dueCount,
    }
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100 mb-2">Your Decks</h1>
        <p className="text-slate-400">
          Create and manage your flashcard decks for OBGYN exam preparation.
        </p>
      </div>

      {/* Create Deck Form */}
      <div className="mb-8 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
        <CreateDeckForm />
      </div>

      {/* Deck List */}
      {decksWithDueCounts.length === 0 ? (
        // Empty state (Requirement 6.4)
        <div className="text-center py-12 bg-slate-800/30 border border-slate-700 rounded-lg">
          <p className="text-slate-400 mb-2">No decks yet</p>
          <p className="text-slate-500 text-sm">
            Create your first deck above to start studying!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {decksWithDueCounts.map((deck) => (
            <DeckCard key={deck.id} deck={deck} />
          ))}
        </div>
      )}
    </div>
  )
}
