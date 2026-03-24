'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { GdaPublicFooter, GdaPublicNav } from '../components/GdaPublicNav'

export default function LeadershipPage() {
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

          <div className="label text-orange-500 mb-4">LEADERSHIP</div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold uppercase tracking-tight mb-10 leading-[0.95]">
            Founder &amp;<br />
            <span className="text-white/40">Program Director</span>
          </h1>

          <div className="grid md:grid-cols-2 gap-10 sm:gap-16 items-start mb-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative aspect-[4/5] rounded-sm overflow-hidden bg-black max-w-md mx-auto md:mx-0"
            >
              <Image
                src="/images/ian.jpg"
                alt="Ian Ochieng, Founder & Program Director"
                fill
                className="object-cover object-top"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="font-display text-xl font-bold text-white">Ian Ochieng</p>
                <p className="label text-white/60">Founder &amp; Program Director</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6 font-body text-white/60 leading-relaxed"
            >
              <p>
                Global Dreams Academy was founded and led by Ian Ochieng, a basketball professional
                and youth development leader with experience across elite collegiate basketball
                environments, coaching, and community-based sport development. He brings a strong
                foundation of basketball expertise shaped by experience across elite competitive,
                operational, and developmental environments.
              </p>
              <p>
                His background includes working within high-level Division I basketball operations at
                the University of Michigan Men&apos;s Basketball program, where he supported player
                development, daily team operations, and performance standards, as well as hands-on
                coaching experience with youth and student-athletes. In addition to collegiate
                experience, Ian has competed at the international level, having participated in
                training camp preparation with the Kenya National Basketball Program (Morans) in
                advance of the 2025 FIBA AfroBasket Qualifiers.
              </p>
              <p>
                Complementing his on-court background, Ian&apos;s academic studies in sport management,
                leadership development, and community engagement inform a holistic,
                development-first approach. His leadership philosophy blends elite basketball
                standards with intentional mentorship, emphasizing fundamentals, discipline,
                character, and confidence as the foundation for long-term athlete growth.
              </p>
            </motion.div>
          </div>

          <div className="border border-white/10 border-dashed p-8 mt-12 bg-white/[0.02] text-center">
            <p className="label text-white/35 mb-2">Additional staff &amp; mentors</p>
            <p className="font-body text-white/45 text-sm max-w-lg mx-auto">
              More profiles and photos will be added here as the team grows.
            </p>
          </div>

          <div className="mt-12 flex flex-wrap gap-4">
            <Link
              href="/#join-program"
              className="inline-flex justify-center bg-white text-black px-8 py-4 font-display text-sm font-bold uppercase tracking-wide hover:bg-white/90 transition-colors"
            >
              Join our program
            </Link>
            <Link
              href="/contact"
              className="inline-flex justify-center border-2 border-white/20 text-white px-8 py-4 font-display text-sm font-bold uppercase tracking-wide hover:bg-white hover:text-black transition-all"
            >
              Contact
            </Link>
          </div>
        </div>
      </main>

      <GdaPublicFooter />
    </div>
  )
}
