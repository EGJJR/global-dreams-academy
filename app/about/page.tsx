'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { GdaPublicFooter, GdaPublicNav } from '../components/GdaPublicNav'

const subNav = [
  { label: 'About', href: '#about' },
  { label: 'Vision', href: '#vision' },
  { label: 'The Three Pillars', href: '#pillars' },
  { label: 'Future Developments', href: '#future' },
] as const

function Section({
  id,
  children,
  className = '',
}: {
  id: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section id={id} className={`scroll-mt-36 ${className}`}>
      {children}
    </section>
  )
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <GdaPublicNav />

      {/* Sub-navigation (anchor links) */}
      <div className="fixed top-14 sm:top-16 left-0 right-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 overflow-x-auto">
          <div className="flex items-center gap-2 sm:gap-4 min-w-max">
            {subNav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="label text-[10px] sm:text-xs text-white/50 hover:text-white border border-white/10 hover:border-white/30 px-3 py-2 transition-colors whitespace-nowrap"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <main className="pt-28 sm:pt-32 pb-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white label mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            BACK TO HOME
          </Link>

          <div className="label text-orange-500 mb-4">ABOUT</div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold uppercase tracking-tight mb-10 leading-[0.95]">
            Global Dreams<br />
            <span className="text-white/40">Academy</span>
          </h1>

          <Section id="about">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-none mb-20 space-y-6"
            >
              <p className="font-body text-white/60 leading-relaxed">
                Global Dreams Academy is a student-athlete development program for 8th-12th grade
                athletes dedicated to excellence on the court, in the classroom, and in their
                communities. Through high-level basketball training, competitive league play,
                mentorship, and academic preparation, athletes develop the discipline, leadership,
                and basketball IQ needed to compete at the varsity and collegiate levels.
              </p>
              <p className="font-body text-white/60 leading-relaxed">
                Our mission is to build complete student-athletes — individuals who pursue athletic
                excellence while prioritizing academic achievement and character development. From
                preparation for high school competition and standardized testing to guidance toward
                future college opportunities, Global Dreams Academy supports youth in building a
                strong foundation for their future.
              </p>
              <p className="font-body text-white/60 leading-relaxed">
                Rooted in the community of Berrien Springs with a vision that reaches globally,
                Global Dreams Academy aims to develop young leaders who carry their talent,
                education, and character into communities around the world.
              </p>
            </motion.div>
          </Section>

          <Section id="vision">
            <div className="label text-orange-500 mb-4">VISION</div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight mb-6">
              Where we&apos;re headed
            </h2>
            <p className="font-body text-white/60 leading-relaxed mb-8">
              The vision of Global Dreams Academy is to become a premier student-athlete development
              academy that prepares young athletes for success in athletics, academics, and
              leadership. By building a culture of discipline, mentorship, and opportunity, Global
              Dreams Academy aims to create pathways for athletes to pursue athletic and collegiate
              opportunities, while developing leaders who positively impact their community locally
              and around the world.
            </p>
            <div className="border border-white/10 p-6 bg-white/[0.02] mb-20">
              <div className="label text-white/40 mb-1">OUR PILLARS</div>
              <ul className="font-display text-lg sm:text-xl text-white/90 space-y-2 mt-4">
                <li>Athletic Development</li>
                <li>Academic Excellence</li>
                <li>Leadership &amp; Community</li>
              </ul>
            </div>
          </Section>

          <Section id="pillars">
            <div className="label text-orange-500 mb-4">THE THREE PILLARS</div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight mb-12">
              Train the Athlete · Build the Scholar · Develop the Leader
            </h2>

            <div className="space-y-16 mb-20">
              <motion.article
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-2">
                  Train the Athlete
                </h3>
                <p className="label text-white/35 mb-4">Athletic Development</p>
                <p className="font-body text-white/55 leading-relaxed">
                  Global Dreams Academy provides structured basketball training designed to help
                  athletes improve their skills, decision-making, and understanding of the game.
                  Through focused drills, competitive play, and consistent feedback, athletes are
                  challenged to grow, compete with confidence, and reach their highest level of
                  performance.
                </p>
              </motion.article>

              <motion.article
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-2">
                  Build the Scholar
                </h3>
                <p className="label text-white/35 mb-4">Academic Excellence</p>
                <p className="font-body text-white/55 leading-relaxed">
                  Success as a student-athlete requires commitment both on the court and in the
                  classroom. Global Dreams Academy encourages athletes to take their education
                  seriously by emphasizing discipline, strong study habits, and preparation for
                  future academic opportunities, including college readiness.
                </p>
              </motion.article>

              <motion.article
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-2">
                  Develop the Leader
                </h3>
                <p className="label text-white/35 mb-4">Leadership &amp; Community</p>
                <p className="font-body text-white/55 leading-relaxed">
                  Global Dreams Academy believes leadership is built through accountability, teamwork,
                  and supporting those around you. Athletes are encouraged to take ownership of their
                  development, represent their communities with character, and create a positive
                  culture that strengthens both their teams and the people around them.
                </p>
              </motion.article>
            </div>
          </Section>

          <Section id="future">
            <div className="label text-orange-500 mb-4">FUTURE DEVELOPMENTS</div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight mb-6">
              Growing beyond one program
            </h2>
            <p className="font-body text-white/60 leading-relaxed mb-10">
              Global Dreams Academy is designed to grow beyond a single training program. As the
              academy develops, future initiatives will expand opportunities for student-athletes
              through additional training programs, academic support resources, and international
              partnerships. These developments aim to create new pathways for athletes to pursue
              higher education, compete at higher levels, and connect with opportunities that extend
              beyond their local community. With a vision that reaches beyond Berrien Springs, GDA
              aims to reach local and international youth while continuing to grow a culture of
              leadership, opportunity, and community impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact?topic=partner"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/20 text-white px-8 py-4 font-display text-sm font-bold uppercase tracking-wide hover:bg-white hover:text-black transition-all"
              >
                Partner with us
              </Link>
              <Link
                href="/#join-program"
                className="inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-4 font-display text-sm font-bold uppercase tracking-wide hover:bg-white/90 transition-colors"
              >
                Join the program
              </Link>
            </div>
          </Section>
        </div>
      </main>

      <div className="flex justify-center pb-8">
        <ChevronDown className="w-5 h-5 text-white/20" aria-hidden />
      </div>

      <GdaPublicFooter />
    </div>
  )
}
