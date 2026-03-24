'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Mail,
  MapPin,
  Send,
  ArrowLeft,
  CheckCircle,
  ArrowUpRight,
} from 'lucide-react';
import { CustomSelect } from '../components/Select';
import { GdaPublicFooter, GdaPublicNav } from '../components/GdaPublicNav';

// Input Field Component
const InputField = ({ 
  label, 
  type = 'text', 
  name, 
  placeholder, 
  required = false,
  value,
  onChange 
}: { 
  label: string;
  type?: string;
  name: string;
  placeholder: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div>
    <label className="label text-white/40 mb-2 block">
      {label} {required && <span className="text-orange-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      required={required}
      value={value}
      onChange={onChange}
      className="w-full bg-transparent border-b-2 border-white/20 px-0 py-4 text-white font-body text-base sm:text-lg focus:outline-none focus:border-white transition-colors placeholder:text-white/20"
      placeholder={placeholder}
    />
  </div>
);

// Textarea Field Component
const TextareaField = ({ 
  label, 
  name, 
  placeholder, 
  required = false,
  value,
  onChange,
  rows = 4
}: { 
  label: string;
  name: string;
  placeholder: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
}) => (
  <div>
    <label className="label text-white/40 mb-2 block">
      {label} {required && <span className="text-orange-500">*</span>}
    </label>
    <textarea
      name={name}
      required={required}
      value={value}
      onChange={onChange}
      rows={rows}
      className="w-full bg-transparent border-b-2 border-white/20 px-0 py-4 text-white font-body text-base sm:text-lg focus:outline-none focus:border-white transition-colors placeholder:text-white/20 resize-none"
      placeholder={placeholder}
    />
  </div>
);

// Info Card Component
const InfoCard = ({ 
  icon: Icon, 
  label, 
  value, 
  href 
}: { 
  icon: typeof Mail;
  label: string;
  value: string;
  href?: string;
}) => (
  <div className="flex items-start gap-4 py-5 sm:py-6 border-b border-white/10">
    <Icon className="w-5 h-5 text-white/40 mt-0.5 flex-shrink-0" />
    <div className="min-w-0">
      <div className="label text-white/40 mb-1">{label}</div>
      {href ? (
        <a href={href} className="font-body text-white hover:text-white/80 transition-colors break-all">
          {value}
        </a>
      ) : (
        <div className="font-body text-white">{value}</div>
      )}
    </div>
  </div>
);

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    role: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [topicBanner, setTopicBanner] = useState<'donate' | 'partner' | null>(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const t = p.get('topic');
    if (t === 'donate') setTopicBanner('donate');
    else if (t === 'partner') setTopicBanner('partner');
    else setTopicBanner(null);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, role: value });
  };

  const roleOptions = [
    { value: 'parent', label: 'Parent' },
    { value: 'athlete', label: 'Athlete (Grades 8-11)' },
    { value: 'coach', label: 'Coach' },
    { value: 'school-staff', label: 'School Staff' },
    { value: 'community-member', label: 'Community Member' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-x-hidden">
      <GdaPublicNav />

      {/* MAIN CONTENT */}
      <section className="pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-white/40 hover:text-white label mb-8 sm:mb-12 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            BACK TO HOME
          </Link>

          {topicBanner && (
            <div className="mb-8 sm:mb-10 p-4 sm:p-6 border border-orange-500/30 bg-orange-500/10 rounded-sm">
              <p className="font-body text-white/80 text-sm sm:text-base leading-relaxed">
                {topicBanner === 'donate' ? (
                  <>
                    <span className="label text-orange-400 block mb-2">SUPPORT</span>
                    Online donation options are coming soon. For now, please use the form below or
                    email us — we&apos;ll connect you with ways to support the local program and
                    international initiatives.
                  </>
                ) : (
                  <>
                    <span className="label text-orange-400 block mb-2">PARTNER</span>
                    Interested in partnering with Global Dreams Academy? Tell us a bit about your
                    organization in the message field and we&apos;ll follow up.
                  </>
                )}
              </p>
            </div>
          )}
          
          {!submitted ? (
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-24">
              
              {/* Left Column - Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="label text-orange-500 mb-3 sm:mb-4">GET IN TOUCH</div>
                <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold uppercase tracking-tight mb-4 sm:mb-6 leading-[0.9]">
                  Contact<br />
                  <span className="text-white/40">Us</span>
                </h1>
                <p className="font-body text-white/50 text-base sm:text-lg mb-8 sm:mb-12 max-w-md leading-relaxed">
                  Have questions about Global Dreams Academy? Want to learn more about our youth basketball development program?
                  We'd love to hear from you.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                  <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
                    <InputField
                      label="NAME"
                      name="name"
                      placeholder="Your name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                    />
                    <InputField
                      label="EMAIL"
                      type="email"
                      name="email"
                      placeholder="you@team.com"
                      required
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
                    <InputField
                      label="ORGANIZATION"
                      name="organization"
                      placeholder="Team or school"
                      value={formData.organization}
                      onChange={handleChange}
                    />
                    <CustomSelect
                      label="ROLE"
                      name="role"
                      options={roleOptions}
                      value={formData.role}
                      onChange={handleSelectChange}
                      placeholder="Select role"
                    />
                  </div>

                  <TextareaField
                    label="MESSAGE"
                    name="message"
                    placeholder="Tell us about your interest in our youth basketball development program..."
                    required
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                  />

                  <button
                    type="submit"
                    className="w-full bg-white text-black py-4 sm:py-5 font-display text-base sm:text-lg font-bold uppercase tracking-wide hover:bg-white/90 transition-colors flex items-center justify-center gap-3"
                  >
                    <Send className="w-5 h-5" />
                    Send Message
                  </button>
                </form>
              </motion.div>

              {/* Right Column - Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="lg:pt-32"
              >
                <div className="bg-white/[0.02] border border-white/5 p-5 sm:p-8 mb-6 sm:mb-8">
                  <h3 className="label text-white/40 mb-4 sm:mb-6">CONTACT INFORMATION</h3>
                  
                  <InfoCard 
                    icon={Mail}
                    label="EMAIL"
                    value="info@globaldreamsacademy.org"
                    href="mailto:info@globaldreamsacademy.org"
                  />
                  
                  <InfoCard 
                    icon={MapPin}
                    label="LOCATION"
                    value="Berrien Springs, MI"
                  />
                </div>

                <div className="bg-white/[0.02] border border-white/5 p-5 sm:p-8 mb-6 sm:mb-8">
                  <h3 className="label text-white/40 mb-3 sm:mb-4">RESPONSE TIME</h3>
                  <div className="flex items-baseline gap-2 sm:gap-3">
                    <span className="font-display text-4xl sm:text-5xl font-bold tracking-tight">3h</span>
                    <span className="font-body text-white/40 text-sm sm:text-base">average response</span>
                  </div>
                </div>

                <div className="bg-orange-500/10 border border-orange-500/20 p-5 sm:p-8">
                  <h3 className="label text-orange-500 mb-3 sm:mb-4">INTERESTED IN OUR PROGRAM?</h3>
                  <p className="font-body text-white/60 mb-5 sm:mb-6 leading-relaxed text-sm sm:text-base">
                    Learn more about our 10-week youth basketball development program and join our waitlist.
                  </p>
                  <Link 
                    href="/#join-program"
                    className="inline-flex items-center gap-2 bg-orange-500 text-black px-5 sm:px-6 py-3 font-display text-sm font-bold uppercase tracking-wide hover:bg-orange-400 transition-colors"
                  >
                    Join Waitlist
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>

            </div>
          ) : (
            /* Success State */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto text-center py-12 sm:py-20"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 sm:mb-8">
                <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-500" />
              </div>
              
              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold uppercase tracking-tight mb-4 sm:mb-6">
                Message Sent
              </h2>
              
              <p className="font-body text-white/50 text-base sm:text-lg mb-8 sm:mb-12 px-4">
                Thanks for reaching out. We'll get back to you shortly.
              </p>
              
              <Link 
                href="/"
                className="inline-block border-2 border-white/20 px-8 sm:px-10 py-3 sm:py-4 font-display text-sm font-bold uppercase tracking-wide hover:bg-white hover:text-black transition-all"
              >
                Back to Home
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      <GdaPublicFooter />
    </div>
  );
}
