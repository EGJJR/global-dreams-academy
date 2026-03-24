'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'
import { CustomSelect } from './Select'

const InputField = ({
  label,
  type = 'text',
  name,
  placeholder,
  required = false,
  value,
  onChange,
}: {
  label: string
  type?: string
  name: string
  placeholder: string
  required?: boolean
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
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
      className="w-full bg-transparent border-b-2 border-white/20 px-0 py-3 sm:py-4 text-white font-body text-base sm:text-lg focus:outline-none focus:border-white transition-colors placeholder:text-white/20"
      placeholder={placeholder}
    />
  </div>
)

const teamLevelOptions = [
  { value: 'grade-8', label: 'Grade 8' },
  { value: 'grade-9', label: 'Grade 9' },
  { value: 'grade-10', label: 'Grade 10' },
  { value: 'grade-11', label: 'Grade 11' },
  { value: 'parent', label: 'Parent/Guardian' },
  { value: 'coach', label: 'Coach' },
]

export function JoinProgramForm({
  className = '',
  id = 'join-program',
}: {
  className?: string
  id?: string
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    teamLevel: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, teamLevel: value })
  }

  if (submitted) {
    return (
      <motion.div
        id={id}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`text-center py-8 ${className}`}
      >
        <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h3 className="font-display text-3xl font-bold uppercase tracking-tight mb-4">
          You&apos;re In
        </h3>
        <p className="font-body text-white/50 max-w-md mx-auto">
          Thanks for joining the Global Dreams Academy waitlist. We&apos;ll be in touch soon with
          program details.
        </p>
      </motion.div>
    )
  }

  return (
    <div id={id} className={className}>
      <div className="label text-orange-500 mb-3 sm:mb-4">JOIN OUR PROGRAM</div>
      <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4 sm:mb-6 leading-[0.95]">
        Join The <span className="text-white/40">Dream Team.</span>
      </h2>
      <p className="font-body text-white/50 text-base sm:text-lg mb-8 sm:mb-10 max-w-xl leading-relaxed">
        Limited spots available for our Spring session. Apply now to develop your skills with
        intentional coaching and a development-first environment.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 text-left">
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
            placeholder="you@email.com"
            required
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <InputField
          label="ORGANIZATION"
          name="organization"
          placeholder="Team or school name"
          required
          value={formData.organization}
          onChange={handleChange}
        />

        <CustomSelect
          label="TEAM LEVEL"
          name="teamLevel"
          options={teamLevelOptions}
          value={formData.teamLevel}
          onChange={handleSelectChange}
          required
          placeholder="Select team level"
        />

        <button
          type="submit"
          className="w-full bg-white text-black py-4 sm:py-5 font-display text-base sm:text-lg font-bold uppercase tracking-wide hover:bg-white/90 transition-colors mt-4"
        >
          Join Waitlist
        </button>

        <p className="font-body text-white/30 text-xs sm:text-sm text-center">
          By joining, you agree to receive updates about Global Dreams Academy.
        </p>
      </form>
    </div>
  )
}
