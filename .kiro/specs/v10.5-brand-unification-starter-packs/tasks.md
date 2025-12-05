# Implementation Plan

## Feature 1: Brand Unification

- [x] 1. Update landing page branding
  - [x] 1.1 Replace "ResidencyOS" with "Specialize" in `src/app/page.tsx`
    - Update the `<h1>` element text
    - Update the tagline to "Medical Board Prep"
    - _Requirements: 1.1, 1.3_
  - [x] 1.2 Update stats page metadata in `src/app/(app)/stats/page.tsx`
    - Change title from "Stats | ResidencyOS" to "Stats | Specialize"
    - _Requirements: 1.2, 1.3_

- [x] 2. Verify PWA build configuration
  - [x] 2.1 Audit `next.config.ts` for required PWA settings
    - Confirm `buildExcludes: [/middleware-manifest\.json$/]` is present
    - Confirm `disable: process.env.NODE_ENV === 'development'` is present
    - _Requirements: 2.1, 2.2_

## Feature 2: Starter Pack Auto-Enrollment

- [x] 3. Create enrollInStarterPack server action
  - [x] 3.1 Create `src/actions/onboarding-actions.ts` with enrollInStarterPack function
    - Define STARTER_PACKS configuration with OBGYN deck IDs
    - Implement upsert logic for user_decks records
    - Add path revalidation for dashboard and library
    - _Requirements: 4.1, 4.2, 4.4, 4.5_
  - [x] 3.2 Write property test for starter pack enrollment
    - **Property 4: Starter Pack Enrollment Creates Active Subscriptions**
    - **Validates: Requirements 4.1, 4.2**
  - [x] 3.3 Write property test for enrollment idempotence
    - **Property 5: Starter Pack Enrollment Idempotence**
    - **Validates: Requirements 4.4**

- [x] 4. Enhance OnboardingModal for mandatory specialty selection
  - [x] 4.1 Update OnboardingModal to remove skip/close on specialty step
    - Remove any close button or skip link on step 1
    - Ensure continue button remains disabled until specialty selected
    - _Requirements: 3.3, 3.4_
  - [x] 4.2 Write property test for specialty selection requirement
    - **Property 2: Specialty Selection Required for Progression**
    - **Validates: Requirements 3.3**

- [x] 5. Integrate auto-enrollment into onboarding flow
  - [x] 5.1 Update OnboardingModal completion handler
    - Import and call enrollInStarterPack with selected specialty
    - Change redirect from /library to /dashboard after enrollment
    - Handle enrollment errors gracefully (log and continue)
    - _Requirements: 4.1, 4.3_
  - [x] 5.2 Write property test for specialty persistence
    - **Property 3: Specialty Persistence Round-Trip**
    - **Validates: Requirements 3.5**

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Feature 3: Testing & Verification

- [x] 7. Write remaining property tests
  - [x] 7.1 Write property test for onboarding modal visibility
    - **Property 1: Onboarding Modal Visibility Logic**
    - **Validates: Requirements 3.1**
  - [x] 7.2 Write unit tests for brand unification
    - Test landing page contains "Specialize" text
    - Test stats page metadata title
    - _Requirements: 1.1, 1.2_

- [x] 8. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

