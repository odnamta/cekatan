# Requirements Document

## Introduction

V10.5 "Brand Unification & Starter Packs" addresses two key areas for the Specialize application:

1. **Brand Unification**: Complete the rebranding from legacy names ("ResidencyOS", "Celline's Prep") to "Specialize" across all user-facing surfaces, and ensure the Vercel build configuration is hardened against PWA-related crashes.

2. **Starter Packs (Auto-Enrollment)**: Streamline onboarding by automatically subscribing new users to curated deck collections based on their selected specialty, eliminating the need for manual library browsing on first use.

## Glossary

- **Specialize**: The new brand name for the medical exam preparation application
- **Starter_Pack**: A curated collection of deck templates automatically assigned to new users based on their specialty
- **Specialty**: The medical field a user is studying for (e.g., OBGYN, Surgery, Internal Medicine)
- **OnboardingModal**: The multi-step wizard shown to new users after authentication
- **user_metadata**: Supabase Auth user metadata object storing preferences like specialty and onboarded status
- **user_decks**: Database table tracking user subscriptions to deck templates
- **deck_templates**: Database table containing shared deck content

## Requirements

### Requirement 1: Brand Name Replacement

**User Story:** As a user, I want to see consistent "Specialize" branding throughout the application, so that I have a cohesive product experience.

#### Acceptance Criteria

1. WHEN a user views the landing page THEN the System SHALL display "Specialize" as the application title
2. WHEN a user views the stats page browser tab THEN the System SHALL display "Stats | Specialize" as the page title
3. WHEN a user views any page THEN the System SHALL NOT display "ResidencyOS" or "Celline's Prep" text

### Requirement 2: Build Configuration Hardening

**User Story:** As a developer, I want the PWA build configuration to be robust, so that Vercel deployments complete without crashes.

#### Acceptance Criteria

1. WHEN the application builds for production THEN the PWA configuration SHALL include `buildExcludes: [/middleware-manifest\.json$/]`
2. WHEN the application runs in development mode THEN the PWA service worker SHALL be disabled via `disable: process.env.NODE_ENV === 'development'`

### Requirement 3: Specialty Selection Enforcement

**User Story:** As a new user, I want to select my medical specialty during onboarding, so that I receive relevant study content.

#### Acceptance Criteria

1. WHEN a user completes authentication without a specialty in user_metadata THEN the OnboardingModal SHALL display the specialty selection step
2. WHEN the OnboardingModal displays the specialty selection step THEN the System SHALL present "Obstetrics & Gynecology" as a selectable option
3. WHEN a user attempts to proceed without selecting a specialty THEN the OnboardingModal SHALL disable the continue button
4. WHEN the OnboardingModal is open THEN the System SHALL NOT provide a close button or skip option for the specialty step
5. WHEN a user selects a specialty and completes onboarding THEN the System SHALL persist the specialty value to user_metadata

### Requirement 4: Starter Pack Auto-Enrollment

**User Story:** As a new user, I want to be automatically subscribed to relevant study decks after selecting my specialty, so that I can start studying immediately without browsing the library.

#### Acceptance Criteria

1. WHEN a user completes onboarding with the OBGYN specialty THEN the System SHALL create user_decks subscription records for the OBGYN starter pack decks
2. WHEN the System creates starter pack subscriptions THEN each user_decks record SHALL have is_active set to true
3. WHEN a user lands on the dashboard after onboarding THEN the System SHALL display the auto-enrolled decks in the user's deck list
4. WHEN the enrollInStarterPack action executes THEN the System SHALL use upsert logic to prevent duplicate subscriptions
5. WHEN the enrollInStarterPack action completes THEN the System SHALL revalidate the dashboard and library paths

