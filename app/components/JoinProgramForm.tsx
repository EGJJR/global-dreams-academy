'use client'

import React from 'react'
import { ArrowUpRight } from 'lucide-react'

/** Spring registration — official Google Form */
export const SPRING_REGISTRATION_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSeBXOAacRxHA00_85rPlaZUUnMIWArgl1a_Lkw37c95TcB17Q/viewform?usp=header'

export function JoinProgramForm({
  className = '',
  id = 'join-program',
}: {
  className?: string
  id?: string
}) {
  return (
    <div id={id} className={className}>
      <div className="label text-orange-500 mb-3 sm:mb-4">SPRING REGISTRATION</div>
      <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4 sm:mb-6 leading-[0.95]">
        Global Dreams Academy — <span className="text-white/40">Spring</span>
      </h2>
      <p className="font-body text-white/50 text-base sm:text-lg mb-8 sm:mb-10 max-w-2xl leading-relaxed">
        Complete the official Spring registration form (parent or guardian must submit). Questions? Reach
        Ian Ochieng at{' '}
        <a
          href="mailto:globaldreamshoops@gmail.com"
          className="text-orange-400 hover:text-orange-300 underline underline-offset-2"
        >
          globaldreamshoops@gmail.com
        </a>{' '}
        or{' '}
        <a href="tel:+12699214924" className="text-orange-400 hover:text-orange-300">
          (269) 921-4924
        </a>
        .
      </p>

      <a
        href={SPRING_REGISTRATION_FORM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-3 w-full sm:w-auto min-h-[52px] px-8 py-4 bg-white text-black font-display text-base sm:text-lg font-bold uppercase tracking-wide hover:bg-white/90 transition-colors"
      >
        Open registration
        <ArrowUpRight className="w-5 h-5 shrink-0" />
      </a>
    </div>
  )
}
