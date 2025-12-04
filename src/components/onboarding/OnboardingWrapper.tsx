'use client';

import { useState, useEffect } from 'react';
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
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if we should show the onboarding modal
    const shouldShow = shouldShowOnboardingModal(userMetadata);
    setIsOpen(shouldShow);
  }, [userMetadata]);

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
