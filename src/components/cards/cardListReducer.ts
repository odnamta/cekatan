/**
 * CardList reducer and types.
 * Extracted from CardList.tsx for maintainability (#174).
 *
 * V20.2: Refactored 18 useState calls to single useReducer
 */

import type { StatusFilter } from './StatusFilterChips'

export interface CardListState {
  selectedIds: Set<string>
  showDeckSelector: boolean
  filterTagIds: string[]
  searchQuery: string
  showNeedsReviewOnly: boolean
  showBulkTagModal: boolean
  isSelectingAll: boolean
  showUntaggedOnly: boolean
  showAutoTagModal: boolean
  filterSourceIds: string[]
  statusFilter: StatusFilter
  showPublishAllDialog: boolean
  isPublishing: boolean
  isAllSelected: boolean
  showEditorPanel: boolean
  deleteConfirm: { cardId: string; preview: string; type: string } | null
  bulkDeleteConfirm: boolean
  editingCardIndex: number
}

export type CardListAction =
  | { type: 'TOGGLE_SELECTION'; id: string }
  | { type: 'SELECT_ALL'; ids: string[] }
  | { type: 'SELECT_ALL_IN_DECK_START' }
  | { type: 'SELECT_ALL_IN_DECK_DONE'; ids: string[] }
  | { type: 'SELECT_ALL_IN_DECK_FAIL' }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_FILTER_TAG_IDS'; ids: string[] }
  | { type: 'SET_SEARCH_QUERY'; query: string }
  | { type: 'SET_SHOW_NEEDS_REVIEW_ONLY'; show: boolean }
  | { type: 'SET_SHOW_UNTAGGED_ONLY'; show: boolean }
  | { type: 'SET_FILTER_SOURCE_IDS'; ids: string[] }
  | { type: 'SET_STATUS_FILTER'; filter: StatusFilter }
  | { type: 'SHOW_DECK_SELECTOR'; show: boolean }
  | { type: 'SHOW_BULK_TAG_MODAL'; show: boolean }
  | { type: 'SHOW_AUTO_TAG_MODAL'; show: boolean }
  | { type: 'SHOW_PUBLISH_ALL_DIALOG'; show: boolean }
  | { type: 'SET_IS_PUBLISHING'; publishing: boolean }
  | { type: 'OPEN_EDITOR'; index: number }
  | { type: 'CLOSE_EDITOR' }
  | { type: 'NAVIGATE_EDITOR'; index: number }
  | { type: 'SET_DELETE_CONFIRM'; confirm: { cardId: string; preview: string; type: string } | null }
  | { type: 'SET_BULK_DELETE_CONFIRM'; show: boolean }
  | { type: 'CLEAR_FILTERS' }

export const initialCardListState: CardListState = {
  selectedIds: new Set(),
  showDeckSelector: false,
  filterTagIds: [],
  searchQuery: '',
  showNeedsReviewOnly: false,
  showBulkTagModal: false,
  isSelectingAll: false,
  showUntaggedOnly: false,
  showAutoTagModal: false,
  filterSourceIds: [],
  statusFilter: 'all',
  showPublishAllDialog: false,
  isPublishing: false,
  isAllSelected: false,
  showEditorPanel: false,
  deleteConfirm: null,
  bulkDeleteConfirm: false,
  editingCardIndex: 0,
}

export function cardListReducer(state: CardListState, action: CardListAction): CardListState {
  switch (action.type) {
    case 'TOGGLE_SELECTION': {
      const next = new Set(state.selectedIds)
      if (next.has(action.id)) next.delete(action.id)
      else next.add(action.id)
      return { ...state, selectedIds: next }
    }
    case 'SELECT_ALL':
      return { ...state, selectedIds: new Set(action.ids) }
    case 'SELECT_ALL_IN_DECK_START':
      return { ...state, isSelectingAll: true }
    case 'SELECT_ALL_IN_DECK_DONE':
      return { ...state, isSelectingAll: false, selectedIds: new Set(action.ids) }
    case 'SELECT_ALL_IN_DECK_FAIL':
      return { ...state, isSelectingAll: false }
    case 'CLEAR_SELECTION':
      return { ...state, selectedIds: new Set(), isAllSelected: false }
    case 'SET_FILTER_TAG_IDS':
      return { ...state, filterTagIds: action.ids }
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.query }
    case 'SET_SHOW_NEEDS_REVIEW_ONLY':
      return { ...state, showNeedsReviewOnly: action.show }
    case 'SET_SHOW_UNTAGGED_ONLY':
      return { ...state, showUntaggedOnly: action.show }
    case 'SET_FILTER_SOURCE_IDS':
      return { ...state, filterSourceIds: action.ids }
    case 'SET_STATUS_FILTER':
      // Reset selection when status filter changes
      return { ...state, statusFilter: action.filter, selectedIds: new Set(), isAllSelected: false }
    case 'SHOW_DECK_SELECTOR':
      return { ...state, showDeckSelector: action.show }
    case 'SHOW_BULK_TAG_MODAL':
      return { ...state, showBulkTagModal: action.show }
    case 'SHOW_AUTO_TAG_MODAL':
      return { ...state, showAutoTagModal: action.show }
    case 'SHOW_PUBLISH_ALL_DIALOG':
      return { ...state, showPublishAllDialog: action.show }
    case 'SET_IS_PUBLISHING':
      return { ...state, isPublishing: action.publishing }
    case 'OPEN_EDITOR':
      return { ...state, showEditorPanel: true, editingCardIndex: action.index }
    case 'CLOSE_EDITOR':
      return { ...state, showEditorPanel: false }
    case 'NAVIGATE_EDITOR':
      return { ...state, editingCardIndex: action.index }
    case 'SET_DELETE_CONFIRM':
      return { ...state, deleteConfirm: action.confirm }
    case 'SET_BULK_DELETE_CONFIRM':
      return { ...state, bulkDeleteConfirm: action.show }
    case 'CLEAR_FILTERS':
      return { ...state, filterTagIds: [], searchQuery: '' }
    default:
      return state
  }
}
