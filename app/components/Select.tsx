'use client'

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  label: string;
  name: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}

export const CustomSelect = ({
  label,
  name,
  options,
  value,
  onChange,
  required = false,
  placeholder = 'Select'
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
      
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev < options.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : options.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0) {
            onChange(options[highlightedIndex].value);
            setIsOpen(false);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, highlightedIndex, options, onChange]);

  // Reset highlighted index when opening
  useEffect(() => {
    if (isOpen) {
      const currentIndex = options.findIndex(opt => opt.value === value);
      setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
    }
  }, [isOpen, options, value]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={value} required={required} />
      
      {/* Label */}
      <label className="label text-white/40 mb-2 block">
        {label} {required && <span className="text-orange-500">*</span>}
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between
          bg-transparent border-b-2 px-0 py-4
          text-left font-body text-base sm:text-lg
          transition-colors cursor-pointer
          focus:outline-none
          ${isOpen ? 'border-white' : 'border-white/20'}
          ${value ? 'text-white' : 'text-white/30'}
        `}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="truncate pr-4">{selectedOption?.label || placeholder}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-5 h-5 text-white/40" />
        </motion.div>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile: Full screen overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown panel */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className={`
                z-50 bg-[#141414] border border-white/10 overflow-hidden
                md:absolute md:w-full md:mt-2
                fixed bottom-0 left-0 right-0 md:bottom-auto md:left-auto md:right-auto
                rounded-t-2xl md:rounded-none
              `}
              role="listbox"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                <span className="label text-white/40">{label}</span>
                <button 
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="md:hidden label text-white/60"
                >
                  DONE
                </button>
              </div>

              {/* Options */}
              <div className="max-h-[50vh] md:max-h-64 overflow-y-auto overscroll-contain">
                {options.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`
                      w-full flex items-center justify-between
                      px-5 py-4 md:py-3 text-left
                      transition-colors active:bg-white/10
                      ${highlightedIndex === index ? 'bg-white/5' : ''}
                      ${option.value === value ? 'text-white' : 'text-white/60'}
                    `}
                    role="option"
                    aria-selected={option.value === value}
                  >
                    <span className="font-body text-base">{option.label}</span>
                    {option.value === value && (
                      <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {/* Footer accent */}
              <div className="h-1 bg-gradient-to-r from-orange-500/50 via-orange-500 to-orange-500/50" />
              
              {/* Safe area for mobile */}
              <div className="h-6 md:hidden bg-[#141414]" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomSelect;
