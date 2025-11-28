'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight, Library, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CourseCard } from '@/components/course/CourseCard'
import { DeckCard } from '@/components/decks/DeckCard'
import { CreateDeckForm } from '@/components/decks/CreateDeckForm'
import { CreateCourseForm } from '@/components/course/CreateCourseForm'
import type { CourseWithProgress } from '@/components/course/CourseCard'
import type { DeckWithDueCount } from '@/types/database'

export interface LibrarySectionProps {
  courses: CourseWithProgress[]
  decks: DeckWithDueCount[]
  defaultExpanded?: boolean
}

/**
 * LibrarySection Component
 * 
 * Collapsible section containing courses and decks listings.
 * Defaults to collapsed state to keep dashboard focused on studying.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */
export function LibrarySection({
  courses,
  decks,
  defaultExpanded = false,
}: LibrarySectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
      {/* Collapsible Header - Requirement 3.1 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-expanded={isExpanded}
        aria-controls="library-content"
      >
        <div className="flex items-center gap-2">
          <Library className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <span className="font-medium text-slate-900 dark:text-slate-100">
            Library &amp; Content
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            ({courses.length} courses, {decks.length} decks)
          </span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-slate-500 dark:text-slate-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-slate-500 dark:text-slate-400" />
        )}
      </button>

      {/* Collapsible Content - Requirements 3.2, 3.3 */}
      {isExpanded && (
        <div id="library-content" className="p-4 space-y-8 bg-white dark:bg-slate-900/50">
          {/* Courses Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Courses
              </h3>
            </div>
            
            {/* Create Course Form */}
            <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Create New Course
              </h4>
              <CreateCourseForm />
            </div>

            {courses.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-sm py-4 text-center">
                No courses yet. Create your first course above!
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </div>

          {/* Decks Section - Requirement 3.4 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Decks
              </h3>
              {/* Add Deck Button - Requirement 3.4 */}
              <Link href="#add-deck-form">
                <Button variant="secondary" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Deck
                </Button>
              </Link>
            </div>

            {/* Create Deck Form */}
            <div 
              id="add-deck-form" 
              className="mb-4 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg"
            >
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Create New Deck
              </h4>
              <CreateDeckForm />
            </div>

            {decks.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-sm py-4 text-center">
                No decks yet. Create your first deck above!
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {decks.map((deck) => (
                  <DeckCard key={deck.id} deck={deck} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
