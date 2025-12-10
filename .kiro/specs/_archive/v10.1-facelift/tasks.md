# Implementation Plan

## Phase 1: Landing Page Redesign

- [x] 1. Update landing page with glassmorphism theme
  - [x] 1.1 Refactor `src/app/page.tsx` with Medical Glass theme
    - Set page background to `bg-slate-50`
    - Add gradient blob component with blue/purple and teal/blue gradients
    - Position blobs with absolute positioning and blur-3xl
    - _Requirements: 1.1_
  - [x] 1.2 Create Hero Section with ResidencyOS branding
    - Add headline: "ResidencyOS: The Operating System for Medical Specialists"
    - Add subheadline: "AI-Powered Study Platform for Board Exam Success"
    - Center text with responsive sizing (text-4xl md:text-5xl)
    - _Requirements: 1.2, 1.4_
  - [x] 1.3 Create glassmorphic feature cards
    - Apply `bg-white/70 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg`
    - Ensure cards have proper z-index to appear above gradient blobs
    - _Requirements: 1.3_
  - [x] 1.4 Write property test for glassmorphic card styling
    - **Property 1: Glassmorphic Card Styling**
    - **Validates: Requirements 1.3**

## Phase 2: Google Login Fix

- [x] 2. Fix Google authentication on login page
  - [x] 2.1 Update `src/app/(auth)/login/page.tsx` with Google button
    - Add prominent "Continue with Google" button
    - Style: white background, Google "G" icon, shadow-sm, centered
    - Add loading state with spinner
    - _Requirements: 2.1, 2.2_
  - [x] 2.2 Create Google icon component
    - Create SVG Google "G" icon or use inline SVG
    - Size: w-5 h-5
    - _Requirements: 2.2_
  - [x] 2.3 Implement Google OAuth handler
    - Call `supabase.auth.signInWithOAuth({ provider: 'google' })`
    - Set `redirectTo` to `${window.location.origin}/auth/callback`
    - Handle and display errors with user-friendly message
    - _Requirements: 2.3, 2.4, 2.5_
  - [x] 2.4 Verify auth callback route handles Google OAuth
    - Ensure `src/app/auth/callback/route.ts` exchanges code for session
    - Redirect to `/dashboard` on success
    - _Requirements: 2.4_

## Phase 3: Onboarding Wizard

- [x] 3. Create OnboardingModal component
  - [x] 3.1 Create `src/components/onboarding/OnboardingModal.tsx`
    - Create modal with glassmorphic styling (bg-white/80 backdrop-blur-lg)
    - Add backdrop overlay with bg-slate-900/50 backdrop-blur-sm
    - Implement step state management (1, 2, 3)
    - _Requirements: 3.2_
  - [x] 3.2 Implement Slide 1: Specialty Selection
    - Display "Welcome, Dr. [Name]. What is your specialty?"
    - Add dropdown with options: OBGYN, Surgery, Internal Medicine, Pediatrics, Family Medicine, Emergency Medicine, Psychiatry, Other
    - Add Continue button (disabled until selection made)
    - _Requirements: 3.3_
  - [x] 3.3 Implement Slide 2: Exam Date Picker
    - Display "When is your exam?"
    - Add date input with proper formatting
    - Add Back and Continue buttons
    - _Requirements: 3.4_
  - [x] 3.4 Implement Slide 3: Completion
    - Display celebration emoji and "You're all set!"
    - Add "Go to Library" button
    - _Requirements: 3.5_
  - [x] 3.5 Implement onboarding completion handler
    - Call `supabase.auth.updateUser()` with metadata: onboarded, specialty, examDate
    - Redirect to `/library` on success
    - Handle errors with toast notification
    - _Requirements: 3.5, 3.6_
  - [x] 3.6 Write property test for onboarding modal visibility
    - **Property 2: Onboarding Modal Visibility**
    - **Validates: Requirements 3.1**
  - [x] 3.7 Write property test for onboarding metadata persistence
    - **Property 3: Onboarding Metadata Persistence**
    - **Validates: Requirements 3.6**

- [x] 4. Integrate OnboardingModal into app
  - [x] 4.1 Add OnboardingModal to dashboard layout
    - Check `user.user_metadata.onboarded` on dashboard load
    - Show OnboardingModal if onboarded is false or undefined
    - Pass user name from session to modal
    - _Requirements: 3.1_

## Phase 4: Navigation Polish

- [x] 5. Update navigation with glassmorphism
  - [x] 5.1 Update `src/components/navigation/MobileNavBar.tsx`
    - Change background to `bg-white/80 backdrop-blur-lg`
    - Update border to `border-t border-white/20`
    - Ensure z-index allows content to scroll behind
    - _Requirements: 4.1, 4.3, 4.4_
  - [x] 5.2 Update Sidebar in `src/app/(app)/layout.tsx`
    - Change background to `bg-white/80 backdrop-blur-lg`
    - Update border to `border-r border-white/20`
    - Ensure z-index allows content to scroll behind
    - _Requirements: 4.2, 4.3, 4.4_
  - [x] 5.3 Verify navigation functionality preserved
    - Test all navigation links work correctly
    - Verify active state highlighting still works
    - _Requirements: 4.5_
  - [x] 5.4 Write property test for navigation glassmorphism styling
    - **Property 4: Navigation Glassmorphism Styling**
    - **Validates: Requirements 4.1, 4.2, 4.3**
  - [x] 5.5 Write property test for navigation functionality
    - **Property 5: Navigation Functionality Preservation**
    - **Validates: Requirements 4.5**

## Phase 5: Final Checkpoint

- [x] 6. Final verification
  - [x] 6.1 Checkpoint - Ensure all tests pass
    - Ensure all tests pass, ask the user if questions arise.
  - [x] 6.2 Manual testing checklist
    - Test landing page glassmorphism on mobile (375px)
    - Test Google login flow end-to-end
    - Test onboarding wizard all 3 slides
    - Verify navigation blur effect with scrolling content
    - Test on iOS Safari and Android Chrome
