'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { LogoInline } from './Logo'

const links = [
  { name: 'PROGRAM', href: '/program' },
  { name: 'ABOUT', href: '/about' },
  { name: 'LEADERSHIP', href: '/leadership' },
  { name: 'CONTACT', href: '/contact' },
] as const

export function GdaPublicNav() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 w-full z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5 pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 min-h-14 sm:min-h-16 flex items-center justify-between gap-2">
        <Link href="/" className="shrink-0">
          <LogoInline />
        </Link>

        <div className="hidden lg:flex items-center gap-0.5 flex-wrap justify-end">
          {links.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="px-2 py-1.5 label text-[10px] tracking-[0.14em] text-white/60 hover:text-white border border-transparent hover:border-white/20 transition-all"
            >
              {item.name}
            </Link>
          ))}
          <Link
            href="/contact?topic=donate"
            className="px-2 py-1.5 label text-[10px] tracking-[0.14em] text-white/50 hover:text-white transition-colors"
          >
            DONATE
          </Link>
          <Link
            href="/contact?topic=partner"
            className="px-2 py-1.5 label text-[10px] tracking-[0.14em] text-white/50 hover:text-white transition-colors"
          >
            PARTNER
          </Link>
          <Link
            href="/#join-program"
            className="ml-0.5 bg-white text-black px-3 py-1.5 font-display text-[10px] font-semibold tracking-[0.12em] hover:bg-white/90 transition-colors"
          >
            JOIN WAITLIST
          </Link>
        </div>

        <div className="hidden md:flex lg:hidden items-center gap-2">
          <Link
            href="/contact?topic=donate"
            className="label text-white/50 text-xs"
          >
            DONATE
          </Link>
          <Link href="/#join-program" className="bg-white text-black px-3 py-2 font-display text-xs font-semibold">
            JOIN
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="lg:hidden p-2 -mr-2"
          aria-label="Menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden bg-[#0a0a0a] border-t border-white/5 px-4 py-6 space-y-3"
        >
          {links.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block label text-white/60 py-2"
              onClick={() => setOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <Link
            href="/contact?topic=donate"
            className="block label text-white/60 py-2"
            onClick={() => setOpen(false)}
          >
            DONATE
          </Link>
          <Link
            href="/contact?topic=partner"
            className="block label text-white/60 py-2"
            onClick={() => setOpen(false)}
          >
            PARTNER
          </Link>
          <Link
            href="/#join-program"
            className="block bg-white text-black px-5 py-3 font-display text-sm font-semibold tracking-wide text-center mt-2"
            onClick={() => setOpen(false)}
          >
            JOIN WAITLIST
          </Link>
        </motion.div>
      )}
    </nav>
  )
}

export function GdaPublicFooter() {
  return (
    <footer className="border-t border-white/5 py-8 sm:py-12 px-4 sm:px-6 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          <Link href="/" className="opacity-40 hover:opacity-60 transition-opacity">
            <LogoInline />
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            {[
              { name: 'Program', href: '/program' },
              { name: 'About', href: '/about' },
              { name: 'Leadership', href: '/leadership' },
              { name: 'Contact', href: '/contact' },
              { name: 'Waitlist', href: '/waitlist' },
            ].map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="label text-white/30 hover:text-white transition-colors"
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
        <div className="text-center sm:text-left text-white/35 text-xs font-body space-y-1">
          <p>A program by <span className="text-white/55">Luo Lakeside Group LLC</span></p>
          <p className="font-mono text-white/25">© {new Date().getFullYear()} Global Dreams Academy</p>
        </div>
      </div>
    </footer>
  )
}
