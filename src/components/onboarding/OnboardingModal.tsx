'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { enrollInStarterPack } from '@/actions/onboarding-actions';

/**
 * Specialty options for onboarding
 */
export const SPECIALTIES = [
  'General',
  'Surgery',
  'Internal Medicine',
  'Pediatrics',
  'Family Medicine',
  'Emergency Medicine',
  'Psychiatry',
  'Other',
] as const;

export type Specialty = typeof SPECIALTIES[number];

export interface OnboardingData {
  specialty: string;
  examDate: string | null;
}

export interface OnboardingModalProps {
  isOpen: boolean;
  userName?: string;
  onComplete?: () => void;
}

type OnboardingStep = 1 | 2 | 3;

/**
 * Determines if onboarding modal should be visible based on user metadata
 * Used for property testing
 */
export function shouldShowOnboardingModal(
  userMetadata: { onboarded?: boolean } | null | undefined
): boolean {
  if (!userMetadata) return true;
  return userMetadata.onboarded !== true;
}

/**
 * OnboardingModal - Multi-step wizard for new user personalization
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */
export function OnboardingModal({ isOpen, userName, onComplete }: OnboardingModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>(1);
  const [specialty, setSpecialty] = useState('');
  const [examDate, setExamDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const displayName = userName?.split(' ')[0] || 'Doctor';

  async function handleComplete() {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      
      // Save user preferences to metadata
      // Requirements: 3.5 - Persist specialty to user_metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          onboarded: true,
          specialty,
          examDate: examDate || null,
        },
      });

      if (updateError) {
        setError(updateError.message);
        setIsLoading(false);
        return;
      }

      // Auto-enroll in starter pack based on specialty
      // Requirements: 4.1, 4.3 - Create subscriptions and redirect to dashboard
      const enrollResult = await enrollInStarterPack(specialty);
      if (!enrollResult.success) {
        // Log error but continue - graceful degradation
        console.error('Starter pack enrollment failed:', enrollResult.error);
      }

      onComplete?.();
      router.push('/dashboard');
    } catch {
      setError('Failed to save preferences. Please try again.');
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop - Requirements 3.2 */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
      
      {/* Modal - Glassmorphic styling */}
      <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Slide 1: Specialty Selection - Requirements 3.3 */}
        {step === 1 && (
          <div className="text-center">
            <div className="text-5xl mb-4">👋</div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">
              Welcome, Dr. {displayName}
            </h2>
            <p className="text-slate-600 mb-6">What is your specialty?</p>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-lg mb-6 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select specialty...</option>
              {SPECIALTIES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <Button 
              onClick={() => setStep(2)} 
              disabled={!specialty}
              className="w-full"
            >
              Continue
            </Button>
          </div>
        )}

        {/* Slide 2: Exam Date - Requirements 3.4 */}
        {step === 2 && (
          <div className="text-center">
            <div className="text-5xl mb-4">📅</div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">
              When is your exam?
            </h2>
            <p className="text-slate-600 mb-6">We&apos;ll help you stay on track</p>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-lg mb-6 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={() => setStep(3)}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="mt-4 text-sm text-slate-500 hover:text-slate-700"
            >
              Skip for now
            </button>
          </div>
        )}

        {/* Slide 3: Completion - Requirements 3.5, 4.1, 4.3 */}
        {step === 3 && (
          <div className="text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">
              You&apos;re all set!
            </h2>
            <p className="text-slate-600 mb-6">We&apos;ve added starter decks to get you going</p>
            <Button 
              onClick={handleComplete}
              loading={isLoading}
              className="w-full"
            >
              Start Studying
            </Button>
          </div>
        )}

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full transition-colors ${
                s === step ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default OnboardingModal;
