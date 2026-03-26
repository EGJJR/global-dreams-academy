'use client'

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Eye,
  ArrowLeft,
  ArrowUpRight,
  Scan,
  Clock,
  Cpu,
  Search,
  Zap,
  Menu,
  X
} from 'lucide-react';
import { LogoInline } from '../components/Logo';

// Feature Block Component
const FeatureBlock = ({ 
  number, 
  title, 
  quote,
  description,
  icon: Icon,
  delay = 0 
}: { 
  number: string;
  title: string;
  quote: string;
  description: string;
  icon: typeof Scan;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.7, delay }}
    className="group relative"
  >
    {/* Large background number */}
    <div className="absolute -left-2 sm:-left-4 md:-left-8 -top-4 sm:-top-8 font-display text-[100px] sm:text-[180px] md:text-[240px] font-bold text-white/[0.02] leading-none select-none pointer-events-none">
      {number}
    </div>
    
    <div className="relative border-l-2 border-white/10 group-hover:border-white/30 pl-5 sm:pl-8 md:pl-12 py-6 sm:py-8 transition-colors">
      {/* Icon + Number */}
      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white/60" />
        </div>
        <span className="label text-white/30">0{number} — CAPABILITY</span>
      </div>
      
      {/* Title */}
      <h3 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-tight text-white mb-3 sm:mb-4">
        {title}
      </h3>
      
      {/* Quote */}
      <p className="font-body text-base sm:text-xl md:text-2xl text-white/70 italic mb-4 sm:mb-6">
        &ldquo;{quote}&rdquo;
      </p>
      
      {/* Description */}
      <p className="font-body text-white/40 text-sm sm:text-lg leading-relaxed max-w-2xl">
        {description}
      </p>
    </div>
  </motion.div>
);

export default function FeaturesPage() {
  const features = [
    {
      number: "1",
      title: "Forensic Scouting",
      quote: "The truth is in the frame.",
      description: "We don't just count stats; we deconstruct movement. Upload your opponent's last 3 games, and our engine creates a biometric map of every player. We detect the tendencies, the weaknesses, and the fatigue thresholds that the human eye misses.",
      icon: Scan,
    },
    {
      number: "2",
      title: "The Morning Briefing",
      quote: "Wake up to the answer.",
      description: "While your team sleeps, Vantage processes the film. By 7:00 AM, the winning strategy is pushed to every player's phone. No PDFs. No long meetings. Just the mission.",
      icon: Clock,
    },
    {
      number: "3",
      title: "Simulation Engine",
      quote: "10,000 games played.",
      description: "Don't guess which play will work. We simulate your plays against your opponent's specific defensive scheme to find the ones that hold up under pressure.",
      icon: Cpu,
    },
    {
      number: "4",
      title: "Archive Query",
      quote: "Instant recall.",
      description: "Talk to your film. Ask the system: \"Show me every inbound play they ran in the 4th Quarter.\" Vantage retrieves the clips instantly from the processed data.",
      icon: Search,
    },
    {
      number: "5",
      title: "Deep Compute",
      quote: "Speed is cheap. Depth is expensive.",
      description: "We don't settle for shallow real-time analytics. VANTAGE uses artificial intelligence overnight to uncover the complex patterns that simple live-tracking misses. The game is won in the preparation, not the reaction.",
      icon: Zap,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-x-hidden">
      
      {/* NAVIGATION */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/">
            <LogoInline />
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {[
              { name: 'FEATURES', href: '/features' },
              { name: 'CONTACT', href: '/contact' },
            ].map((item) => (
              <a 
                key={item.name} 
                href={item.href} 
                className={`px-4 py-2 label border border-transparent transition-all ${
                  item.name === 'FEATURES' ? 'text-white border-white/20' : 'text-white/60 hover:text-white hover:border-white/20'
                }`}
              >
                {item.name}
              </a>
            ))}
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <Link href="/contact" className="label text-white/60 hover:text-white transition-colors">
              CONTACT
            </Link>
            <Link href="/waitlist" className="bg-white text-black px-5 py-2.5 font-display text-sm font-semibold tracking-wide hover:bg-white/90 transition-colors">
              JOIN WAITLIST
            </Link>
          </div>
          
          {/* Mobile: Just show Join Waitlist button */}
          <Link href="/waitlist" className="sm:hidden bg-white text-black px-4 py-2 font-display text-xs font-semibold tracking-wide">
            WAITLIST
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative min-h-[70vh] sm:min-h-[80vh] flex items-end pb-16 sm:pb-24 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/5e230a67-c846-40ca-bed6-15210793902d.jpeg"
            alt="Background"
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/60 to-[#0a0a0a]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-[#0a0a0a]/50" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full pt-24 sm:pt-32">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-white/40 hover:text-white label mb-8 sm:mb-12 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            BACK TO HOME
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="label text-orange-500 mb-4 sm:mb-6 text-[10px] sm:text-xs">SYSTEM CAPABILITIES // ASYNC PROCESSING</div>
            
            <h1 className="font-display text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-bold uppercase tracking-tight mb-5 sm:mb-8 leading-[0.85]">
              Win Before<br />
              <span className="text-white/30">The Tip-Off.</span>
            </h1>
            
            <p className="font-body text-white/50 text-base sm:text-xl md:text-2xl max-w-2xl leading-relaxed">
              Real-time is reactive. VANTAGE is predictive. We use deep computation 
              to solve the game while you sleep.
            </p>
          </motion.div>
        </div>

        {/* Scroll line */}
        <motion.div 
          initial={{ height: 0 }}
          animate={{ height: 80 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="absolute bottom-0 left-1/2 w-px bg-gradient-to-b from-white/30 to-transparent"
        />
      </section>

      {/* FEATURES GRID */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <div className="label text-white/30 mb-4">THE CAPABILITIES</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight">
              What The System<br />
              <span className="text-white/30">Does For You</span>
            </h2>
          </motion.div>

          <div className="space-y-16 md:space-y-24">
            {features.map((feature, i) => (
              <FeatureBlock
                key={feature.number}
                {...feature}
                delay={i * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="label text-orange-500 mb-4 sm:mb-6">EARLY ACCESS</div>
            
            <h2 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold uppercase tracking-tight mb-6 sm:mb-8 leading-[0.9]">
              See What<br />
              <span className="text-white/30">They Can&apos;t.</span>
            </h2>
            
            <p className="font-body text-white/50 text-base sm:text-xl mb-8 sm:mb-12 max-w-xl mx-auto px-4">
              Get early access to VANTAGE.
            </p>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0">
              <Link 
                href="/waitlist" 
                className="bg-white text-black px-8 sm:px-10 py-4 sm:py-5 font-display text-sm font-bold uppercase tracking-wide hover:bg-white/90 transition-colors inline-flex items-center justify-center gap-2"
              >
                Join Waitlist
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/contact" 
                className="border-2 border-white/20 text-white px-8 sm:px-10 py-4 sm:py-5 font-display text-sm font-bold uppercase tracking-wide hover:bg-white hover:text-black transition-all text-center"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <Link href="/" className="opacity-40 hover:opacity-60 transition-opacity">
            <LogoInline />
          </Link>
          <div className="flex items-center gap-6 sm:gap-8">
            {[
              { name: 'Features', href: '/features' },
              { name: 'Contact', href: '/contact' },
              { name: 'Waitlist', href: '/waitlist' },
            ].map((item) => (
              <a key={item.name} href={item.href} className="label text-white/30 hover:text-white transition-colors">
                {item.name}
              </a>
            ))}
          </div>
          <div className="label text-white/20">
            © 2025 Global Dreams Academy
          </div>
        </div>
      </footer>
    </div>
  );
}

