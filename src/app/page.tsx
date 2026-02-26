'use client'

import Link from 'next/link'
import { Brain, BookOpen, TrendingUp, Shield, Building2, Users, BarChart3, ArrowRight } from 'lucide-react'

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />
      {/* Glow accent */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[300px] bg-blue-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-5xl mx-auto px-4 py-24 md:py-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-sm text-blue-200 mb-8">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Now live for Indonesian organizations
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4">
          Cekatan
        </h1>
        <p className="text-xl md:text-2xl text-blue-100 font-medium mb-2">
          Assessment. Competency. Certification.
        </p>
        <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
          The assessment and competency mapping platform built for organizations that take talent development seriously.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/25 active:scale-95"
          >
            Get Started
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl border border-white/20 text-white hover:bg-white/10 transition-colors active:scale-95"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  )
}

function TrustedBy() {
  const orgs = [
    { name: 'PT. Gama Intisamudera', industry: 'Heavy Lift & Project Logistics' },
    { name: 'PT. Gama Lintas Samudera', industry: 'International Freight Agency' },
  ]

  return (
    <section className="py-12 bg-slate-50 border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4">
        <p className="text-center text-sm font-medium text-slate-400 uppercase tracking-wider mb-6">
          Trusted by
        </p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          {orgs.map((org) => (
            <div key={org.name} className="text-center">
              <p className="font-semibold text-slate-700">{org.name}</p>
              <p className="text-sm text-slate-400">{org.industry}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Features() {
  const features = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: 'Smart Study',
      description: 'SM-2 spaced repetition optimizes review timing for maximum knowledge retention.',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Secure Assessment',
      description: 'Timed, proctored tests with auto-grading, scoring, and pass/fail determination.',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'Analytics',
      description: 'Track progress with skill gap analysis, mastery radar, and activity heatmaps.',
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: 'AI-Powered Content',
      description: 'Generate questions from PDFs and study materials with AI extraction and quality scanning.',
      color: 'bg-amber-100 text-amber-600',
    },
  ]

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Everything you need to assess your team
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            From content creation to certification — one platform, zero complexity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.color} mb-4`}>
                {feature.icon}
              </div>
              <h3 className="font-semibold text-lg text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    {
      step: '1',
      icon: <Building2 className="h-6 w-6" />,
      title: 'Create Organization',
      description: 'Set up your org, invite team members, configure roles.',
    },
    {
      step: '2',
      icon: <Users className="h-6 w-6" />,
      title: 'Build Assessments',
      description: 'Create decks, add questions (or let AI generate them), publish tests.',
    },
    {
      step: '3',
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Measure & Improve',
      description: 'Track scores, identify skill gaps, issue certifications.',
    },
  ]

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            How it works
          </h2>
          <p className="text-lg text-slate-500">
            Three steps to a smarter workforce.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((item) => (
            <div key={item.step} className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white text-xl font-bold mb-4">
                {item.step}
              </div>
              <h3 className="font-semibold text-lg text-slate-900 mb-2">{item.title}</h3>
              <p className="text-slate-500">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTABanner() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to assess your team?
        </h2>
        <p className="text-lg text-blue-100 mb-8">
          Join organizations already using Cekatan to build stronger, smarter teams.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold rounded-xl bg-white text-blue-700 hover:bg-blue-50 transition-colors shadow-lg active:scale-95"
        >
          Get Started Free
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="py-8 bg-slate-900 text-slate-400">
      <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-white">Cekatan</span>
        </div>
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Cekatan. All rights reserved.
        </p>
        <Link
          href="/login"
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          Sign In
        </Link>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <TrustedBy />
      <Features />
      <HowItWorks />
      <CTABanner />
      <Footer />
    </div>
  )
}
