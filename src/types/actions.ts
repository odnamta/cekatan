import type { Card } from './database';

export type ActionResult =
  | { success: true; data?: unknown }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export type NextCardResult =
  | { success: true; nextCard: Card | null; remainingCount: number }
  | { success: false; error: string };
