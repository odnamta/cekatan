import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const createDeckSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
});

export const createCardSchema = z.object({
  deckId: z.string().uuid('Invalid deck ID'),
  front: z.string().min(1, 'Front content is required'),
  back: z.string().min(1, 'Back content is required'),
  imageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export const ratingSchema = z.object({
  cardId: z.string().uuid('Invalid card ID'),
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
});

// Export types inferred from schemas
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateDeckInput = z.infer<typeof createDeckSchema>;
export type CreateCardInput = z.infer<typeof createCardSchema>;
export type RatingInput = z.infer<typeof ratingSchema>;
