export interface Deck {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface Card {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  image_url: string | null;
  interval: number;
  ease_factor: number;
  next_review: string;
  created_at: string;
}

export interface DeckWithDueCount extends Deck {
  due_count: number;
}
