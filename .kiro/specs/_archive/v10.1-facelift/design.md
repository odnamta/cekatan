# Design Document: V10.1 - The Facelift

## Overview

V10.1 transforms the visual identity of Specialize into ResidencyOS with an Apple-inspired Glassmorphism aesthetic. The release delivers:

1. **Landing Page Redesign**: "Medical Glass" theme with frosted glass cards and gradient accents
2. **Google Login Fix**: Prominent, properly styled OAuth button
3. **Onboarding Wizard**: 3-step glassmorphic modal for new user personalization
4. **Navigation Polish**: Glassmorphic MobileNavBar and Sidebar with backdrop blur

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js App                            │
├─────────────────────────────────────────────────────────────┤
│  Landing Page (app/page.tsx)                                │
│  ├── Hero Section (ResidencyOS branding)                    │
│  ├── Gradient Blob Background                               │
│  └── Glassmorphic Feature Cards                             │
├─────────────────────────────────────────────────────────────┤
│  Auth Flow                                                  │
│  ├── LoginPage (Google OAuth button + glassmorphic card)    │
│  └── Supabase Auth (handles OAuth redirect)                 │
├─────────────────────────────────────────────────────────────┤
│  Onboarding                                                 │
│  ├── OnboardingModal (glassmorphic multi-step wizard)       │
│  │   ├── Slide 1: Specialty Selection                       │
│  │   ├── Slide 2: Exam Date Picker                          │
│  │   └── Slide 3: Completion & Redirect                     │
│  └── User Metadata (onboarded flag)                         │
├─────────────────────────────────────────────────────────────┤
│  Navigation (Glassmorphic)                                  │
│  ├── MobileNavBar (bg-white/80 + backdrop-blur-lg)          │
│  └── Sidebar (bg-white/80 + backdrop-blur-lg)               │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Landing Page Redesign

**File: `src/app/page.tsx`**

```typescript
// Page structure
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Gradient Blob Background */}
      <GradientBlob />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Feature Cards */}
      <FeatureCards />
    </div>
  );
}
```

**Gradient Blob Component:**
```typescript
function GradientBlob() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-teal-400/30 to-blue-400/30 rounded-full blur-3xl" />
    </div>
  );
}
```

**Hero Section:**
```typescript
function HeroSection() {
  return (
    <section className="relative z-10 pt-20 pb-16 px-4 text-center">
      <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
        ResidencyOS
      </h1>
      <p className="text-xl md:text-2xl text-slate-600 mb-2">
        The Operating System for Medical Specialists
      </p>
      <p className="text-lg text-slate-500 mb-8">
        AI-Powered Study Platform for Board Exam Success
      </p>
      {/* CTA buttons */}
    </section>
  );
}
```

**Glassmorphic Card Styles:**
```typescript
const glassCardStyles = `
  bg-white/70 
  backdrop-blur-md 
  border border-white/20 
  rounded-2xl 
  shadow-lg 
  shadow-slate-200/50
`;
```

### 2. Google Login Button

**File: `src/app/(auth)/login/page.tsx`**

```typescript
interface GoogleButtonProps {
  onClick: () => void;
  loading?: boolean;
}

function GoogleLoginButton({ onClick, loading }: GoogleButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="
        w-full flex items-center justify-center gap-3
        bg-white text-slate-700 
        border border-slate-200 
        rounded-lg px-4 py-3
        shadow-sm hover:shadow-md
        transition-shadow
        disabled:opacity-50
      "
    >
      <GoogleIcon className="w-5 h-5" />
      <span>Continue with Google</span>
    </button>
  );
}
```

**OAuth Handler:**
```typescript
async function handleGoogleSignIn() {
  setLoading(true);
  const supabase = createSupabaseBrowserClient();
  
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  
  if (error) {
    setError(error.message);
    setLoading(false);
  }
}
```

### 3. Onboarding Modal

**File: `src/components/onboarding/OnboardingModal.tsx`**

```typescript
interface OnboardingModalProps {
  isOpen: boolean;
  userName: string;
  onComplete: (data: OnboardingData) => void;
}

interface OnboardingData {
  specialty: string;
  examDate: Date | null;
}

type OnboardingStep = 1 | 2 | 3;

const SPECIALTIES = [
  'OBGYN',
  'Surgery',
  'Internal Medicine',
  'Pediatrics',
  'Family Medicine',
  'Emergency Medicine',
  'Psychiatry',
  'Other',
] as const;
```

**Modal Structure:**
```typescript
function OnboardingModal({ isOpen, userName, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState<OnboardingStep>(1);
  const [specialty, setSpecialty] = useState('');
  const [examDate, setExamDate] = useState<Date | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="
        relative z-10 w-full max-w-md
        bg-white/80 backdrop-blur-lg
        border border-white/20
        rounded-2xl shadow-xl
        p-6
      ">
        {step === 1 && <SpecialtySlide />}
        {step === 2 && <ExamDateSlide />}
        {step === 3 && <CompletionSlide />}
      </div>
    </div>
  );
}
```

**Slide 1 - Specialty Selection:**
```typescript
function SpecialtySlide() {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold text-slate-900 mb-2">
        Welcome, Dr. {userName}
      </h2>
      <p className="text-slate-600 mb-6">What is your specialty?</p>
      <select
        value={specialty}
        onChange={(e) => setSpecialty(e.target.value)}
        className="w-full p-3 border border-slate-200 rounded-lg mb-4"
      >
        <option value="">Select specialty...</option>
        {SPECIALTIES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <Button onClick={() => setStep(2)} disabled={!specialty}>
        Continue
      </Button>
    </div>
  );
}
```

**Slide 2 - Exam Date:**
```typescript
function ExamDateSlide() {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold text-slate-900 mb-2">
        When is your exam?
      </h2>
      <p className="text-slate-600 mb-6">We'll help you stay on track</p>
      <input
        type="date"
        value={examDate ? examDate.toISOString().split('T')[0] : ''}
        onChange={(e) => setExamDate(new Date(e.target.value))}
        className="w-full p-3 border border-slate-200 rounded-lg mb-4"
      />
      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
        <Button onClick={() => setStep(3)}>Continue</Button>
      </div>
    </div>
  );
}
```

**Slide 3 - Completion:**
```typescript
function CompletionSlide() {
  return (
    <div className="text-center">
      <div className="text-5xl mb-4">🎉</div>
      <h2 className="text-2xl font-semibold text-slate-900 mb-2">
        You're all set!
      </h2>
      <p className="text-slate-600 mb-6">Let's find your first study deck</p>
      <Button onClick={handleComplete}>
        Go to Library
      </Button>
    </div>
  );
}
```

### 4. Glassmorphic Navigation

**File: `src/components/navigation/MobileNavBar.tsx`**

```typescript
// Updated styles for glassmorphism
const navBarStyles = `
  fixed bottom-0 left-0 right-0 z-40
  bg-white/80 backdrop-blur-lg
  border-t border-white/20
  pb-safe
`;
```

**File: `src/app/(app)/layout.tsx` - Sidebar**

```typescript
// Updated sidebar styles
const sidebarStyles = `
  hidden md:flex flex-col
  w-64 h-screen fixed left-0 top-0
  bg-white/80 backdrop-blur-lg
  border-r border-white/20
`;
```

## Data Models

### User Metadata Extension

```typescript
interface UserMetadata {
  onboarded?: boolean;
  specialty?: string;
  examDate?: string; // ISO date string
}
```

**Supabase User Metadata Update:**
```typescript
async function completeOnboarding(data: OnboardingData) {
  const supabase = createSupabaseBrowserClient();
  
  const { error } = await supabase.auth.updateUser({
    data: {
      onboarded: true,
      specialty: data.specialty,
      examDate: data.examDate?.toISOString(),
    },
  });
  
  return { success: !error, error: error?.message };
}
```

### LocalStorage Keys

- None required for this feature (using Supabase user metadata)

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Glassmorphic Card Styling
*For any* content card rendered on the landing page, the component should include backdrop-blur-md and bg-white/70 (or equivalent semi-transparent white) classes.
**Validates: Requirements 1.3**

### Property 2: Onboarding Modal Visibility
*For any* user where `user.metadata.onboarded` is false or undefined, the OnboardingModal should be displayed. For any user where `user.metadata.onboarded` is true, the modal should not be displayed.
**Validates: Requirements 3.1**

### Property 3: Onboarding Metadata Persistence
*For any* completed onboarding flow, the user metadata should contain `onboarded: true`, the selected specialty, and the exam date (if provided).
**Validates: Requirements 3.6**

### Property 4: Navigation Glassmorphism Styling
*For any* rendered MobileNavBar or Sidebar, the component should include bg-white/80, backdrop-blur-lg, and border-white/20 classes.
**Validates: Requirements 4.1, 4.2, 4.3**

### Property 5: Navigation Functionality Preservation
*For any* navigation item in MobileNavBar or Sidebar, clicking the item should navigate to the correct route (Home → /dashboard, Library → /library, Profile → /profile).
**Validates: Requirements 4.5**

## Error Handling

| Scenario | Handling |
|----------|----------|
| Google OAuth fails | Display error message on login page, allow retry |
| User metadata update fails | Show toast error, allow retry of onboarding completion |
| Backdrop blur not supported | Graceful degradation to solid bg-white background |
| Date picker not supported | Fallback to text input with date format hint |

## Testing Strategy

### Property-Based Testing (fast-check)

Properties to test with fast-check:

1. **Onboarding Visibility**: Generate various user metadata states (onboarded: true/false/undefined), verify modal visibility logic
2. **Navigation Styling**: Render navigation components, verify glassmorphic classes are present
3. **Navigation Functionality**: Generate navigation item clicks, verify correct route navigation

### Unit Tests

- Landing page renders with correct headline text
- Google button renders with correct styling classes
- OnboardingModal renders correct slide based on step state
- Specialty dropdown contains all expected options
- Date picker accepts and formats dates correctly

### Integration Tests

- Google OAuth flow initiates correctly
- Onboarding completion updates user metadata
- Modal closes and redirects after completion
