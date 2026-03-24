'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Target, Trophy, Film, Users, GraduationCap } from 'lucide-react'
import { GdaPublicFooter, GdaPublicNav } from '../components/GdaPublicNav'

const elements = [
  {
    icon: Target,
    title: 'Weekly Skill Training',
    body: 'Small-group sessions (4–5 athletes) focusing on ball handling, shooting mechanics, finishing, defense, and decision-making in game-like situations.',
  },
  {
    icon: Trophy,
    title: 'Structured League Play',
    body: 'Sunday games with a balanced round-robin schedule, guaranteed playing time, and a teaching-focused environment with in-game coaching.',
  },
  {
    icon: Film,
    title: 'Exposure & Player Visibility',
    body: 'Games filmed consistently; footage edited into individual player clips for review, highlights, and sharing with future coaches or programs.',
  },
  {
    icon: Users,
    title: 'Mentorship & Guest Voices',
    body: 'Guest coaches, trainers, and mentors including local high school and college coaches, skill trainers, and former players.',
  },
  {
    icon: GraduationCap,
    title: 'Leadership Development',
    body: 'Emphasis on coachability, discipline, and long-term athletic and personal development on and off the court.',
  },
]

export default function ProgramPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <GdaPublicNav />

      <main className="pt-24 sm:pt-28 pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white label mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            BACK TO HOME
          </Link>

          <div className="label text-orange-500 mb-4">PROGRAM</div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold uppercase tracking-tight mb-6 leading-[0.95]">
            Development-first<br />
            <span className="text-white/40">Basketball</span>
          </h1>
          <p className="font-body text-white/55 text-lg leading-relaxed mb-12 max-w-2xl">
            Global Dreams Academy is a performance basketball development program for motivated
            8th–12th grade student-athletes. Through high-level training, competitive play, and
            mentorship, athletes build skills, discipline, and basketball IQ—grounded in academic
            excellence, leadership, and community impact. Based in Berrien Springs with a global
            vision.
          </p>

          <div className="grid sm:grid-cols-2 gap-6 mb-16">
            <div className="border border-white/10 p-6 bg-white/[0.02]">
              <div className="label text-white/40 mb-2">SESSION</div>
              <p className="font-body text-white/80">Spring program — enrollment opening soon</p>
            </div>
            <div className="border border-white/10 p-6 bg-white/[0.02]">
              <div className="label text-white/40 mb-2">LOCATION</div>
              <p className="font-body text-white/80">Andrews Academy Gym · Berrien Springs, MI</p>
            </div>
          </div>

          <h2 className="font-display text-2xl font-bold uppercase tracking-tight mb-8">
            Program elements
          </h2>
          <div className="space-y-8">
            {elements.map((el, i) => (
              <motion.div
                key={el.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-4 border-b border-white/10 pb-8"
              >
                <div className="w-10 h-10 flex items-center justify-center bg-orange-500/15 rounded-sm shrink-0">
                  <el.icon className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold uppercase tracking-tight text-white mb-2">
                    {el.title}
                  </h3>
                  <p className="font-body text-white/50 leading-relaxed">{el.body}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 flex flex-col sm:flex-row gap-4">
            <Link
              href="/#join-program"
              className="inline-flex justify-center bg-white text-black px-8 py-4 font-display text-sm font-bold uppercase tracking-wide hover:bg-white/90 transition-colors"
            >
              Join our program
            </Link>
            <Link
              href="/about"
              className="inline-flex justify-center border-2 border-white/20 text-white px-8 py-4 font-display text-sm font-bold uppercase tracking-wide hover:bg-white hover:text-black transition-all"
            >
              Mission &amp; vision
            </Link>
          </div>
        </div>
      </main>

      <GdaPublicFooter />
    </div>
  )
}
