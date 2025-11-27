import Link from 'next/link';
import TestConnection from '@/components/TestConnection';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Connection Test */}
      <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto">
        <TestConnection />
      </div>
      
      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          {/* Logo/Brand */}
          <div className="mb-8">
            <span className="text-5xl">🩺</span>
          </div>
          
          {/* Hero Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Celline&apos;s OBGYN Prep
          </h1>
          
          {/* Hero Description */}
          <p className="text-lg sm:text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Master your medical entrance exams with intelligent spaced repetition. 
            Our SM-2 algorithm schedules your reviews at optimal intervals for maximum retention.
          </p>
          
          {/* Features List */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 text-left">
            <div className="bg-slate-800 rounded-lg p-6">
              <div className="text-2xl mb-3">📚</div>
              <h3 className="font-semibold text-lg mb-2">Organize by Deck</h3>
              <p className="text-slate-400 text-sm">
                Create custom flashcard decks for each topic you need to study.
              </p>
            </div>
            <div className="bg-slate-800 rounded-lg p-6">
              <div className="text-2xl mb-3">🧠</div>
              <h3 className="font-semibold text-lg mb-2">Smart Scheduling</h3>
              <p className="text-slate-400 text-sm">
                SM-2 algorithm optimizes review timing based on your performance.
              </p>
            </div>
            <div className="bg-slate-800 rounded-lg p-6">
              <div className="text-2xl mb-3">📈</div>
              <h3 className="font-semibold text-lg mb-2">Track Progress</h3>
              <p className="text-slate-400 text-sm">
                See due cards at a glance and prioritize your study sessions.
              </p>
            </div>
          </div>
          
          {/* Login Button */}
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500"
          >
            Get Started
          </Link>
          
          <p className="mt-4 text-slate-500 text-sm">
            Already have an account? <Link href="/login" className="text-blue-400 hover:text-blue-300">Login here</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
