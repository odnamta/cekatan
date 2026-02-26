'use client';

import { useState } from 'react';
import { OnboardingModal, shouldShowOnboardingModal } from './OnboardingModal';

export interface OnboardingWrapperProps {
  userMetadata: { onboarded?: boolean } | null;
  userName?: string;
}

/**
 * Client-side wrapper for OnboardingModal
 * Handles the visibility logic based on user metadata
 * Requirements: 3.1 - Show modal if onboarded is false or undefined
 */
export function OnboardingWrapper({ userMetadata, userName }: OnboardingWrapperProps) {
  // Compute initial open state from props (avoids useEffect + setState)
  const [isOpen, setIsOpen] = useState(() => shouldShowOnboardingModal(userMetadata));

  function handleComplete() {
    setIsOpen(false);
  }

  return (
    <OnboardingModal
      isOpen={isOpen}
      userName={userName}
      onComplete={handleComplete}
    />
  );
}

export default OnboardingWrapper;
