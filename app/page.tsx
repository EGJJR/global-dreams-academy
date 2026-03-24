'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import {
  Target,
  Users,
  Trophy,
  Film,
  GraduationCap,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react'
import { LogoInline } from './components/Logo'
import { JoinProgramForm } from './components/JoinProgramForm'
import { GdaPublicFooter } from './components/GdaPublicNav'

// Program Feature Card
const ProgramFeatureCard = ({
  icon: Icon,
  label,
  title,
  description,
}: {
  icon: typeof Target
  label: string
  title: string
  description: string
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="group"
  >
    <div className="flex items-center gap-2 mb-4">
      <div className="w-2 h-2 bg-orange-500" />
      <span className="label text-white/60">{label}</span>
    </div>
    <h3 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight text-white mb-4">
      {title}
    </h3>
    <p className="font-body text-white/50 text-lg leading-relaxed">{description}</p>
  </motion.div>
)

export default function GlobalDreamsAcademyLanding() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinkClass =
    'px-3 py-2 label text-white/60 hover:text-white border border-transparent hover:border-white/20 transition-all text-xs lg:text-sm'

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans relative overflow-x-hidden">
      {/* NAVIGATION */}
      <nav
        className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 pt-[env(safe-area-inset-top,0px)] ${
          scrolled ? 'bg-black/90 backdrop-blur-md border-b border-white/10' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 min-h-14 sm:min-h-16 flex items-center justify-between gap-2">
          <a href="/">
            <LogoInline />
          </a>
          <div className="hidden lg:flex items-center gap-0 flex-wrap justify-end">
            {[
              { name: 'PROGRAM', href: '/program' },
              { name: 'ABOUT', href: '/about' },
              { name: 'LEADERSHIP', href: '/leadership' },
              { name: 'CONTACT', href: '/contact' },
            ].map((item) => (
              <a key={item.name} href={item.href} className={navLinkClass}>
                {item.name}
              </a>
            ))}
            <a href="/contact?topic=donate" className={`${navLinkClass} text-white/45`}>
              DONATE
            </a>
            <a href="/contact?topic=partner" className={`${navLinkClass} text-white/45`}>
              PARTNER
            </a>
            <a
              href="/#join-program"
              className="ml-1 bg-white text-black px-4 py-2.5 font-display text-xs lg:text-sm font-semibold tracking-wide hover:bg-white/90 transition-colors"
            >
              JOIN WAITLIST
            </a>
          </div>
          <div className="hidden sm:flex lg:hidden items-center gap-2">
            <a href="/contact?topic=donate" className="label text-white/45 text-xs">
              DONATE
            </a>
            <a
              href="/#join-program"
              className="bg-white text-black px-3 py-2 font-display text-xs font-semibold"
            >
              JOIN
            </a>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 -mr-2"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="sm:hidden bg-[#0a0a0a] border-t border-white/5 px-4 py-6 space-y-3"
          >
            <a href="/program" className="block label text-white/60 py-2">
              PROGRAM
            </a>
            <a href="/about" className="block label text-white/60 py-2">
              ABOUT
            </a>
            <a href="/leadership" className="block label text-white/60 py-2">
              LEADERSHIP
            </a>
            <a href="/contact" className="block label text-white/60 py-2">
              CONTACT
            </a>
            <a href="/contact?topic=donate" className="block label text-white/60 py-2">
              DONATE
            </a>
            <a href="/contact?topic=partner" className="block label text-white/60 py-2">
              PARTNER
            </a>
            <a
              href="/#join-program"
              className="block bg-white text-black px-5 py-3 font-display text-sm font-semibold tracking-wide text-center mt-4"
            >
              JOIN WAITLIST
            </a>
          </motion.div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-end pb-20 sm:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/5e230a67-c846-40ca-bed6-15210793902d.jpeg"
            alt="Basketball team training"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/50" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/80 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <p className="label text-white/45 mb-3 sm:mb-4">
              A program by Luo Lakeside Group LLC
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold uppercase tracking-tight mb-4 sm:mb-6 leading-[0.9]">
              Global Dreams<br />
              <span className="text-white/40">Academy.</span>
            </h1>
            {/* Mobile: concise */}
            <p className="font-body text-white/55 text-base leading-relaxed mb-3 max-w-xl md:hidden">
              Performance basketball for grades 8–12: training, league play, and mentorship—skills,
              discipline, and basketball IQ for the next level.
            </p>
            <p className="font-body text-white/45 text-sm leading-relaxed mb-8 max-w-xl md:hidden">
              Academics, leadership, and community. Berrien Springs — now enrolling{' '}
              <span className="text-white/70">Spring 2026</span>.
            </p>
            {/* Tablet/desktop: full */}
            <p className="hidden md:block font-body text-white/55 text-lg sm:text-xl mb-4 max-w-xl leading-relaxed">
              Global Dreams Academy is a performance basketball development program for motivated
              8th–12th grade student-athletes who want to elevate their game and future. Through
              high-level training, competitive play, and mentorship, athletes develop the skills,
              discipline, and basketball IQ needed to succeed at the next level.
            </p>
            <p className="hidden md:block font-body text-white/45 text-base sm:text-lg mb-8 sm:mb-10 max-w-xl">
              Our program values academic excellence, leadership, and community impact. Based in
              Berrien Springs with a global vision — now accepting applications for the{' '}
              <span className="text-white/70">Spring 2026</span> session.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <a
                href="#join-program"
                className="bg-white text-black px-8 py-4 font-display text-sm font-bold uppercase tracking-wide hover:bg-white/90 transition-colors text-center"
              >
                Join Our Program
              </a>
              <a
                href="/contact"
                className="label text-white/60 hover:text-white transition-colors text-center py-4 sm:py-0"
              >
                Contact Us
              </a>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="w-6 h-6 text-white/30 animate-bounce" />
        </motion.div>
      </section>

      {/* PROGRAM OVERVIEW — full width */}
      <section className="py-16 sm:py-24 bg-[#0a0a0a]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <ProgramFeatureCard
            icon={Target}
            label="PROGRAM OVERVIEW"
            title="Development-first basketball."
            description="Global Dreams Academy is a youth basketball training and league program designed to prioritize player development, exposure, and mentorship over short-term results. We combine weekly small-group skill training with structured league play in a positive, teaching-focused environment."
          />
        </div>
      </section>

      {/* PROGRAM ELEMENTS */}
      <section className="py-16 sm:py-24 border-y border-white/10 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <div className="label text-orange-500 mb-4">PROGRAM ELEMENTS</div>
            <h2 className="font-display text-4xl sm:text-5xl font-bold uppercase tracking-tight text-white mb-6">
              Comprehensive Development
            </h2>
            <p className="font-body text-white/50 text-lg max-w-2xl mx-auto">
              Our program combines skill training, competitive play, and mentorship to create a
              holistic development experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: 'Weekly Skill Training',
                description:
                  'Small-group sessions (4-5 athletes) focusing on ball handling, shooting mechanics, finishing, defense, and decision-making with game-like situations.',
              },
              {
                icon: Trophy,
                title: 'Structured League Play',
                description:
                  'Sunday games with balanced round-robin schedule, guaranteed playing time, and teaching-focused environment with in-game coaching.',
              },
              {
                icon: Film,
                title: 'Player Exposure & Film',
                description:
                  'Games filmed consistently with individual player clips for skill review, highlight reels, and sharing with future coaches.',
              },
              {
                icon: Users,
                title: 'Mentorship Program',
                description:
                  'Guest coaches, trainers, and mentors including local high school/college coaches and former players focusing on work habits and leadership.',
              },
              {
                icon: GraduationCap,
                title: 'Leadership Development',
                description:
                  'Focus on coachability, discipline, and long-term athletic and personal development both on and off the court.',
              },
              {
                icon: Target,
                title: 'Global Perspective',
                description:
                  "Influenced by Berrien Springs' international community and Andrews University, honoring diverse backgrounds through basketball.",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 flex items-center justify-center bg-orange-500/20 rounded-sm">
                    <feature.icon className="w-4 h-4 text-orange-500" />
                  </div>
                  <h3 className="font-display text-xl font-bold uppercase tracking-tight text-white">
                    {feature.title}
                  </h3>
                </div>
                <p className="font-body text-white/50">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* LEADERSHIP */}
      <section className="py-16 sm:py-24 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-10 sm:gap-16 items-center">
            <ProgramFeatureCard
              icon={Users}
              label="LEADERSHIP"
              title="Ian Ochieng."
              description="Founder & Program Director — experience across elite collegiate basketball, coaching, and community sport development. University of Michigan Men's Basketball; Kenya National Basketball Program (Morans)."
            />
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative aspect-[4/3] rounded-sm overflow-hidden bg-black">
                <Image
                  src="/images/ian.jpg"
                  alt="Ian Ochieng, Founder & Program Director"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-top grayscale-[30%] opacity-90 scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 z-10" />
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-2 z-20">
                  <span className="font-mono text-xs text-white/80 tracking-wider">
                    Program Leadership
                  </span>
                </div>
              </div>
              <a
                href="/leadership"
                className="inline-block mt-6 label text-orange-500 hover:text-orange-400 transition-colors"
              >
                Read full bio →
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* JOIN OUR PROGRAM */}
      <section
        id="join-program"
        className="py-20 sm:py-28 px-4 sm:px-6 border-t border-white/10 bg-[#0a0a0a] scroll-mt-24"
      >
        <div className="max-w-xl mx-auto">
          <JoinProgramForm />
        </div>
      </section>

      <GdaPublicFooter />
    </div>
  )
}
