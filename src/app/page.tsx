'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Logo } from '@/components/ui/Logo'
import { DashboardMockup, AssessmentMockup } from '@/components/landing/Mockups'
import {
  Brain, Shield, TrendingUp, BookOpen,
  ArrowRight, ChevronDown, Check, Sparkles, Award, Lock,
} from 'lucide-react'

/* ─── Animation variants ─── */

const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

const spring = { type: 'spring' as const, stiffness: 80, damping: 20 }

/* ─── Glass Navbar ─── */

function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-slate-950/70 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <span className="dark">
          <Logo variant="full" size="md" />
        </span>
        <Link
          href="/login"
          className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-5 py-2 rounded-xl hover:bg-white/[0.08] border border-transparent hover:border-white/10"
        >
          Masuk
        </Link>
      </div>
    </nav>
  )
}

/* ─── Hero ─── */

function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const mockupY = useTransform(scrollYProgress, [0, 1], [0, -80])
  const mockupRotate = useTransform(scrollYProgress, [0, 1], [0, -3])

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 text-white min-h-screen flex items-center"
    >
      {/* Animated gradient mesh */}
      <div className="absolute inset-0 animate-gradient-shift opacity-40" style={{
        background: 'radial-gradient(ellipse 80% 60% at 20% 60%, rgba(0,102,255,0.08) 0%, transparent 70%), radial-gradient(ellipse 60% 80% at 80% 20%, rgba(77,148,255,0.06) 0%, transparent 70%)',
      }} />
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }} />

      <Navbar />

      <div className="relative max-w-6xl mx-auto px-6 pt-28 pb-20 md:pt-36 md:pb-28 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text column */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="text-center lg:text-left"
          >
            {/* Status badge */}
            <motion.div variants={fadeIn} transition={spring} className="mb-8 lg:mb-10">
              <span className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/[0.06] backdrop-blur-sm border border-white/10 text-sm text-blue-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                </span>
                Aktif untuk organisasi di Indonesia
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeIn}
              transition={spring}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.5rem] xl:text-6xl font-bold tracking-tight mb-6 leading-[1.1]"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Asesmen yang{' '}
              <span className="bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
                benar-benar
              </span>
              <br />
              mengukur kompetensi
            </motion.h1>

            <motion.p
              variants={fadeIn}
              transition={spring}
              className="text-lg md:text-xl text-slate-400 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed"
            >
              Platform asesmen &amp; pemetaan kompetensi untuk organisasi yang serius
              mengembangkan talenta terbaik mereka.
            </motion.p>

            {/* CTA */}
            <motion.div variants={fadeIn} transition={spring} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
              <Link
                href="/login"
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold rounded-2xl bg-blue-600 text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 active:scale-[0.98] overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/10 to-blue-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative flex items-center gap-2">
                  Mulai Sekarang
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
              <a
                href="#fitur"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-2xl border border-white/15 text-white hover:bg-white/[0.07] transition-all active:scale-[0.98]"
              >
                Pelajari Lebih Lanjut
              </a>
            </motion.div>

            {/* Trust signals */}
            <motion.div variants={fadeIn} transition={spring} className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 text-sm text-slate-500">
              {['Gratis untuk memulai', 'Setup dalam 5 menit', 'Tanpa kartu kredit'].map((text) => (
                <span key={text} className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-blue-400/80" />
                  {text}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Mockup column */}
          <motion.div
            initial={{ opacity: 0, y: 40, rotateY: -8 }}
            animate={{ opacity: 1, y: 0, rotateY: 0 }}
            transition={{ ...spring, delay: 0.5 }}
            style={{ y: mockupY, rotate: mockupRotate }}
            className="hidden lg:block perspective-[1200px]"
          >
            <DashboardMockup />
          </motion.div>
        </div>

        {/* Mobile mockup (below text on small screens) */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.6 }}
          className="lg:hidden mt-12 max-w-md mx-auto"
        >
          <DashboardMockup />
        </motion.div>
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
    <section className="py-14 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
      <div className="max-w-5xl mx-auto px-6">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs font-semibold text-slate-400 uppercase tracking-[0.15em] mb-8"
        >
          Dipercaya oleh
        </motion.p>
        <div className="flex flex-wrap justify-center gap-12 md:gap-20">
          {orgs.map((org, i) => (
            <motion.div
              key={org.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...spring, delay: i * 0.15 }}
              className="text-center"
            >
              <p className="font-semibold text-slate-700 dark:text-slate-200">{org.name}</p>
              <p className="text-sm text-slate-400">{org.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Feature Spotlight ─── */

function FeatureSpotlight() {
  return (
    <section id="fitur" className="py-24 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 space-y-32">
        {/* Spotlight 1: Assessment */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={spring}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-4">
              <Shield className="h-3.5 w-3.5" />
              ASESMEN
            </div>
            <h2
              className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 leading-tight"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Ujian yang aman, penilaian yang instan
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              Buat ujian berjangka waktu dengan pengawasan otomatis. Kandidat mengerjakan langsung dari browser —
              skor keluar begitu selesai, lengkap dengan sertifikat digital.
            </p>
            <ul className="space-y-3">
              {[
                'Timer otomatis & auto-submit',
                'Penilaian instan dengan passing grade',
                'Sertifikat digital dengan kode verifikasi',
                'Link publik — tanpa install aplikasi',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
                  <Check className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ ...spring, delay: 0.2 }}
          >
            <AssessmentMockup />
          </motion.div>
        </div>

        {/* Spotlight 2: Analytics (reversed) */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ ...spring, delay: 0.2 }}
            className="order-2 lg:order-1"
          >
            <DashboardMockup />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={spring}
            className="order-1 lg:order-2"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-semibold mb-4">
              <TrendingUp className="h-3.5 w-3.5" />
              ANALITIK
            </div>
            <h2
              className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 leading-tight"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Lihat gap kompetensi sebelum jadi masalah
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              Dashboard analitik real-time menampilkan radar skill, heatmap aktivitas, dan tren skor.
              Identifikasi area yang perlu ditingkatkan — per individu maupun per tim.
            </p>
            <ul className="space-y-3">
              {[
                'Radar kompetensi per individu & tim',
                'Heatmap aktivitas belajar',
                'Tren skor dan progress tracking',
                'Gap analysis untuk keputusan data-driven',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ─── Feature Bento Grid ─── */

function FeatureGrid() {
  const features = [
    {
      icon: <Brain className="h-5 w-5" />,
      title: 'Belajar Lebih Cerdas',
      description: 'Algoritma SM-2 mengoptimalkan waktu review. Belajar lebih sedikit, ingat lebih lama.',
      iconBg: 'bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400',
      border: 'hover:border-purple-200 dark:hover:border-purple-500/20',
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: 'Konten AI-Powered',
      description: 'Buat soal dari PDF dalam hitungan menit. AI mengekstrak dan memvalidasi kualitas.',
      iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
      border: 'hover:border-amber-200 dark:hover:border-amber-500/20',
    },
    {
      icon: <Award className="h-5 w-5" />,
      title: 'Sertifikasi Digital',
      description: 'Sertifikat otomatis dengan kode unik. Verifikasi publik untuk validitas.',
      iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
      border: 'hover:border-blue-200 dark:hover:border-blue-500/20',
    },
    {
      icon: <Lock className="h-5 w-5" />,
      title: 'Multi-Tenant Aman',
      description: 'Setiap organisasi terisolasi penuh. Row Level Security di setiap query.',
      iconBg: 'bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400',
      border: 'hover:border-slate-300 dark:hover:border-slate-500/20',
    },
  ]

  return (
    <section className="py-24 bg-white dark:bg-slate-900">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={spring}
          className="text-center mb-14"
        >
          <h2
            className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Dan masih banyak lagi
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Dari AI generation hingga keamanan enterprise — semuanya built-in.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
          className="grid sm:grid-cols-2 gap-4"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeIn}
              transition={spring}
              className={`group p-6 rounded-2xl border border-slate-200 dark:border-slate-800 ${f.border} bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-800/30 dark:to-slate-900/30 hover:shadow-lg transition-all duration-300`}
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${f.iconBg} mb-4 transition-transform duration-300 group-hover:scale-110`}>
                {f.icon}
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1.5">{f.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ─── How It Works ─── */

function HowItWorks() {
  const steps = [
    { step: '1', title: 'Buat Organisasi', description: 'Setup organisasi, undang anggota tim, dan atur peran akses.' },
    { step: '2', title: 'Bangun Asesmen', description: 'Buat bank soal manual, gunakan AI, atau upload dari PDF. Publikasikan ujian.' },
    { step: '3', title: 'Ukur & Tingkatkan', description: 'Pantau skor real-time, identifikasi gap skill, dan keluarkan sertifikasi.' },
  ]

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={spring}
          className="text-center mb-16"
        >
          <h2
            className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Cara kerja
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400">
            Tiga langkah menuju tim yang lebih kompeten.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-7 left-[calc(16.67%+28px)] right-[calc(16.67%+28px)] h-[2px] bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 dark:from-blue-800 dark:via-blue-600 dark:to-blue-800" />

          {steps.map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...spring, delay: i * 0.15 }}
              className="text-center relative"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white text-xl font-bold mb-5 relative z-[1] ring-4 ring-slate-50 dark:ring-slate-950">
                {item.step}
              </div>
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">{item.title}</h3>
              <p className="text-slate-500 dark:text-slate-400">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── FAQ ─── */

function FAQ() {
  const faqs = [
    { q: 'Apa itu Cekatan?', a: 'Cekatan adalah platform asesmen dan pemetaan kompetensi berbasis web. Organisasi dapat membuat ujian, mengelola bank soal, dan melacak perkembangan kompetensi anggota tim — semua dalam satu platform.' },
    { q: 'Apakah Cekatan gratis?', a: 'Ya, Anda bisa memulai secara gratis. Buat organisasi, undang anggota, dan jalankan asesmen pertama tanpa biaya.' },
    { q: 'Bagaimana cara kerja fitur AI?', a: 'AI Cekatan dapat mengekstrak konten dari PDF dan menghasilkan soal pilihan ganda secara otomatis. Cukup upload materi, dan AI akan membuat soal berkualitas yang siap digunakan dalam hitungan menit.' },
    { q: 'Apakah data asesmen aman?', a: 'Ya. Semua data disimpan dengan enkripsi dan Row Level Security (RLS) di database. Setiap organisasi terisolasi penuh — tidak ada akses lintas organisasi.' },
    { q: 'Berapa jumlah peserta yang bisa diuji?', a: 'Tidak ada batasan jumlah peserta. Kirimkan link asesmen publik, dan kandidat dapat mendaftar serta mengerjakan ujian langsung dari browser — tanpa perlu install aplikasi.' },
    { q: 'Bagaimana sistem sertifikasi bekerja?', a: 'Setelah kandidat lulus asesmen, sertifikat digital otomatis dibuat dengan kode verifikasi unik. Sertifikat dapat diverifikasi oleh siapa saja melalui halaman verifikasi publik.' },
  ]

  return (
    <section className="py-24 bg-white dark:bg-slate-900">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={spring}
          className="text-center mb-14"
        >
          <h2
            className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Pertanyaan umum
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={spring}
          className="divide-y divide-slate-200 dark:divide-slate-800 border-y border-slate-200 dark:border-slate-800"
        >
          {faqs.map((faq) => (
            <details key={faq.q} className="group">
              <summary className="flex items-center justify-between py-5 cursor-pointer text-left font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors list-none [&::-webkit-details-marker]:hidden">
                {faq.q}
                <ChevronDown className="h-5 w-5 text-slate-400 transition-transform duration-200 group-open:rotate-180 shrink-0 ml-4" />
              </summary>
              <div className="pb-5 text-slate-600 dark:text-slate-400 leading-relaxed pr-8">
                {faq.a}
              </div>
            </details>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ─── CTA Banner ─── */

function CTABanner() {
  return (
    <section className="relative py-28 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700" />
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 opacity-30 animate-gradient-shift" style={{
        background: 'radial-gradient(ellipse 50% 80% at 20% 40%, rgba(255,255,255,0.15), transparent), radial-gradient(ellipse 50% 80% at 80% 60%, rgba(77,148,255,0.2), transparent)',
      }} />
      {/* Dot pattern */}
      <div className="absolute inset-0 opacity-[0.06]" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)',
        backgroundSize: '32px 32px',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={spring}
        className="relative max-w-3xl mx-auto px-6 text-center text-white"
      >
        <h2
          className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          Siap mengukur kompetensi tim Anda?
        </h2>
        <p className="text-lg text-blue-100 mb-10 max-w-lg mx-auto">
          Mulai dalam 5 menit. Gratis, tanpa kartu kredit. Tanpa batas peserta.
        </p>
        <Link
          href="/login"
          className="group relative inline-flex items-center justify-center gap-2 px-10 py-4 text-lg font-semibold rounded-2xl bg-white text-blue-700 hover:bg-blue-50 transition-all shadow-xl shadow-blue-900/20 active:scale-[0.98] overflow-hidden"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <span className="relative flex items-center gap-2">
            Mulai Sekarang — Gratis
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </motion.div>
    </section>
  )
}

/* ─── Footer ─── */

function Footer() {
  return (
    <footer className="py-12 bg-slate-950 text-slate-400">
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
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'IDR' },
            publisher: { '@type': 'Organization', name: 'Cekatan', url: 'https://cekatan.com' },
          }),
        }}
      />
      <div className="min-h-screen">
        <Hero />
        <TrustedBy />
        <FeatureSpotlight />
        <FeatureGrid />
        <HowItWorks />
        <FAQ />
        <CTABanner />
        <Footer />
      </div>
    </>
  )
}
