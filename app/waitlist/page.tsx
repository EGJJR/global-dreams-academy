'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { JoinProgramForm } from '../components/JoinProgramForm'
import { GdaPublicFooter, GdaPublicNav } from '../components/GdaPublicNav'

export default function WaitlistPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-x-hidden">
      <GdaPublicNav />

      <div className="min-h-screen pt-14 sm:pt-16">
        <section className="relative py-12 sm:py-20 md:py-24 px-4 sm:px-6 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/5e230a67-c846-40ca-bed6-15210793902d.jpeg"
              alt=""
              fill
              className="object-cover opacity-20"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/85 to-[#0a0a0a]" />
          </div>

          <div className="relative z-10 max-w-xl mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/40 hover:text-white label mb-8 sm:mb-12 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              BACK TO HOME
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <JoinProgramForm id="waitlist-form" />
            </motion.div>
          </div>
        </section>
      </div>

      <GdaPublicFooter />
    </div>
  )
}
