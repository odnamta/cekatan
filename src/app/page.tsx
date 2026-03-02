'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import {
  Brain, Shield, TrendingUp, BookOpen,
  ArrowRight, ChevronDown, Check,
} from 'lucide-react'

/* ─── Scroll-reveal primitives ─── */

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useInView()
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

/* ─── Navbar ─── */

function Navbar() {
  return (
    <nav className="absolute top-0 left-0 right-0 z-10">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <span className="dark">
          <Logo variant="full" size="md" />
        </span>
        <Link
          href="/login"
          className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-5 py-2.5 rounded-xl hover:bg-white/[0.08] border border-transparent hover:border-white/10"
        >
          Masuk
        </Link>
      </div>
    </nav>
  )
}

/* ─── Hero ─── */

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 text-white min-h-[90vh] flex items-center">
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.2) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />
      {/* Glow orbs */}
      <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-blue-500/[0.07] rounded-full blur-[120px]" />
      <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-blue-400/[0.05] rounded-full blur-[100px]" />

      <Navbar />

      <div className="relative max-w-6xl mx-auto px-6 py-32 md:py-40 text-center w-full">
        {/* Status badge */}
        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/[0.06] backdrop-blur-sm border border-white/10 text-sm text-blue-200 mb-10 animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
          </span>
          Aktif untuk organisasi di Indonesia
        </div>

        {/* Animated checkmark */}
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <svg width="72" height="72" viewBox="0 0 40 40" fill="none" className="mx-auto" aria-hidden="true">
            <path
              d="M6 21L15 30L34 10"
              stroke="#4D94FF"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-draw-check"
            />
          </svg>
        </div>

        {/* Headline */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up leading-[1.1]"
          style={{ fontFamily: 'var(--font-space-grotesk)', animationDelay: '300ms' }}
        >
          Asesmen yang{' '}
          <span className="bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
            benar-benar
          </span>
          <br className="hidden sm:block" />
          mengukur kompetensi
        </h1>

        <p
          className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up"
          style={{ animationDelay: '450ms' }}
        >
          Platform asesmen &amp; pemetaan kompetensi untuk organisasi yang serius
          mengembangkan talenta terbaik mereka.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          <Link
            href="/login"
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold rounded-2xl bg-blue-600 text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 active:scale-[0.98]"
          >
            Mulai Sekarang
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#fitur"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-2xl border border-white/15 text-white hover:bg-white/[0.07] transition-all active:scale-[0.98]"
          >
            Pelajari Lebih Lanjut
          </a>
        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-slate-500 animate-fade-in-up" style={{ animationDelay: '750ms' }}>
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-4 w-4 text-blue-400" />
            Gratis untuk memulai
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-4 w-4 text-blue-400" />
            Setup dalam 5 menit
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-4 w-4 text-blue-400" />
            Tanpa kartu kredit
          </span>
        </div>
      </div>
    </section>
  )
}

/* ─── Trusted By ─── */

function TrustedBy() {
  const orgs = [
    { name: 'PT. Gama Intisamudera', desc: 'Heavy Lift & Project Logistics' },
    { name: 'PT. Gama Lintas Samudera', desc: 'International Freight Agency' },
  ]

  return (
    <section className="py-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
      <div className="max-w-5xl mx-auto px-6">
        <Reveal>
          <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-[0.15em] mb-8">
            Dipercaya oleh
          </p>
        </Reveal>
        <div className="flex flex-wrap justify-center gap-12 md:gap-20">
          {orgs.map((org, i) => (
            <Reveal key={org.name} delay={i * 150}>
              <div className="text-center">
                <p className="font-semibold text-slate-700 dark:text-slate-200">{org.name}</p>
                <p className="text-sm text-slate-400">{org.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Features ─── */

function Features() {
  const features = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: 'Belajar Lebih Cerdas',
      description: 'Algoritma SM-2 mengoptimalkan waktu review. Belajar lebih sedikit, ingat lebih lama.',
      gradient: 'from-purple-500/10 to-purple-500/5',
      iconBg: 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Asesmen Aman & Terukur',
      description: 'Ujian berjangka waktu dengan pengawasan otomatis, penilaian instan, dan sertifikasi.',
      gradient: 'from-blue-500/10 to-blue-500/5',
      iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'Analitik Mendalam',
      description: 'Identifikasi gap kompetensi sebelum jadi masalah. Radar skill, heatmap, dan tren skor.',
      gradient: 'from-green-500/10 to-green-500/5',
      iconBg: 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400',
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: 'Konten AI-Powered',
      description: 'Buat soal dari PDF dalam hitungan menit. AI mengekstrak konten dan memvalidasi kualitas.',
      gradient: 'from-amber-500/10 to-amber-500/5',
      iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
    },
  ]

  return (
    <section id="fitur" className="py-24 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-5xl mx-auto px-6">
        <Reveal>
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Semua yang Anda butuhkan
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Dari pembuatan konten hingga sertifikasi — satu platform, tanpa kerumitan.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 100}>
              <div className={`group p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br ${f.gradient} hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg transition-all duration-300 h-full`}>
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${f.iconBg} mb-5 transition-transform duration-300 group-hover:scale-110`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{f.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── How It Works ─── */

function HowItWorks() {
  const steps = [
    {
      step: '1',
      title: 'Buat Organisasi',
      description: 'Setup organisasi, undang anggota tim, dan atur peran akses.',
    },
    {
      step: '2',
      title: 'Bangun Asesmen',
      description: 'Buat bank soal manual, gunakan AI, atau upload dari PDF. Publikasikan ujian.',
    },
    {
      step: '3',
      title: 'Ukur & Tingkatkan',
      description: 'Pantau skor real-time, identifikasi gap skill, dan keluarkan sertifikasi.',
    },
  ]

  return (
    <section className="py-24 bg-white dark:bg-slate-900">
      <div className="max-w-5xl mx-auto px-6">
        <Reveal>
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Cara kerja
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400">
              Tiga langkah menuju tim yang lebih kompeten.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop only) */}
          <div className="hidden md:block absolute top-7 left-[calc(16.67%+28px)] right-[calc(16.67%+28px)] h-[2px] bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 dark:from-blue-800 dark:via-blue-600 dark:to-blue-800" />

          {steps.map((item, i) => (
            <Reveal key={item.step} delay={i * 150}>
              <div className="text-center relative">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white text-xl font-bold mb-5 relative z-[1] ring-4 ring-white dark:ring-slate-900">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-slate-500 dark:text-slate-400">{item.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── FAQ ─── */

function FAQ() {
  const faqs = [
    {
      q: 'Apa itu Cekatan?',
      a: 'Cekatan adalah platform asesmen dan pemetaan kompetensi berbasis web. Organisasi dapat membuat ujian, mengelola bank soal, dan melacak perkembangan kompetensi anggota tim — semua dalam satu platform.',
    },
    {
      q: 'Apakah Cekatan gratis?',
      a: 'Ya, Anda bisa memulai secara gratis. Buat organisasi, undang anggota, dan jalankan asesmen pertama tanpa biaya.',
    },
    {
      q: 'Bagaimana cara kerja fitur AI?',
      a: 'AI Cekatan dapat mengekstrak konten dari PDF dan menghasilkan soal pilihan ganda secara otomatis. Cukup upload materi, dan AI akan membuat soal berkualitas yang siap digunakan dalam hitungan menit.',
    },
    {
      q: 'Apakah data asesmen aman?',
      a: 'Ya. Semua data disimpan dengan enkripsi dan Row Level Security (RLS) di database. Setiap organisasi terisolasi penuh — tidak ada akses lintas organisasi.',
    },
    {
      q: 'Berapa jumlah peserta yang bisa diuji?',
      a: 'Tidak ada batasan jumlah peserta. Kirimkan link asesmen publik, dan kandidat dapat mendaftar serta mengerjakan ujian langsung dari browser — tanpa perlu install aplikasi.',
    },
    {
      q: 'Bagaimana sistem sertifikasi bekerja?',
      a: 'Setelah kandidat lulus asesmen, sertifikat digital otomatis dibuat dengan kode verifikasi unik. Sertifikat dapat diverifikasi oleh siapa saja melalui halaman verifikasi publik.',
    },
  ]

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-3xl mx-auto px-6">
        <Reveal>
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Pertanyaan umum
            </h2>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="divide-y divide-slate-200 dark:divide-slate-800 border-y border-slate-200 dark:border-slate-800">
            {faqs.map((faq) => (
              <details key={faq.q} className="group">
                <summary className="flex items-center justify-between py-5 cursor-pointer text-left font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors list-none [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <ChevronDown className="h-5 w-5 text-slate-400 transition-transform duration-200 group-open:rotate-180 shrink-0 ml-4" />
                </summary>
                <p className="pb-5 text-slate-600 dark:text-slate-400 leading-relaxed pr-8">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ─── CTA Banner ─── */

function CTABanner() {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 text-white relative overflow-hidden">
      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <Reveal>
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Siap mengukur kompetensi tim Anda?
          </h2>
          <p className="text-lg text-blue-100 mb-10">
            Mulai dalam 5 menit. Gratis, tanpa kartu kredit.
          </p>
          <Link
            href="/login"
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold rounded-2xl bg-white text-blue-700 hover:bg-blue-50 transition-all shadow-lg active:scale-[0.98]"
          >
            Mulai Sekarang — Gratis
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

/* ─── Footer ─── */

function Footer() {
  return (
    <footer className="py-10 bg-slate-950 text-slate-400">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <span className="dark">
            <Logo variant="full" size="sm" />
          </span>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/login" className="hover:text-white transition-colors">Masuk</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Syarat &amp; Ketentuan</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privasi</Link>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} Cekatan. Hak cipta dilindungi.
        </div>
      </div>
    </footer>
  )
}

/* ─── Page ─── */

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Cekatan',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            description: 'Platform asesmen & pemetaan kompetensi untuk organisasi',
            url: 'https://cekatan.com',
            inLanguage: 'id',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'IDR',
            },
            publisher: {
              '@type': 'Organization',
              name: 'Cekatan',
              url: 'https://cekatan.com',
            },
          }),
        }}
      />
      <div className="min-h-screen">
        <Hero />
        <TrustedBy />
        <Features />
        <HowItWorks />
        <FAQ />
        <CTABanner />
        <Footer />
      </div>
    </>
  )
}
