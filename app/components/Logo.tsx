import React from 'react';

interface LogoProps {
  variant?: 'full' | 'mark' | 'icon';
  className?: string;
  color?: 'white' | 'black';
  size?: 'sm' | 'md' | 'lg';
}

// Full logo with wordmark
export const Logo = ({ 
  variant = 'full', 
  className = '', 
  color = 'white',
  size = 'md' 
}: LogoProps) => {
  const strokeColor = color === 'white' ? '#ffffff' : '#0a0a0a';
  const textColor = color === 'white' ? '#ffffff' : '#0a0a0a';
  const accentColor = '#FF6B00';

  const sizes = {
    sm: { full: { w: 180, h: 24 }, mark: { w: 32, h: 32 }, icon: { w: 20, h: 20 } },
    md: { full: { w: 240, h: 32 }, mark: { w: 48, h: 48 }, icon: { w: 28, h: 28 } },
    lg: { full: { w: 300, h: 40 }, mark: { w: 64, h: 64 }, icon: { w: 36, h: 36 } },
  };

  if (variant === 'icon') {
    const { w, h } = sizes[size].icon;
    return (
      <svg 
        width={w} 
        height={h} 
        viewBox="0 0 32 32" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path 
          d="M4 6L16 28L28 6" 
          stroke={strokeColor} 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          fill="none"
        />
        <circle cx="16" cy="14" r="3" fill={accentColor}/>
      </svg>
    );
  }

  if (variant === 'mark') {
    const { w, h } = sizes[size].mark;
    return (
      <svg 
        width={w} 
        height={h} 
        viewBox="0 0 48 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* V Mark - Vision cone */}
        <path 
          d="M8 12L24 40L40 12" 
          stroke={strokeColor} 
          strokeWidth="3" 
          fill="none"
        />
        
        {/* Center targeting dot */}
        <circle cx="24" cy="24" r="5" fill={accentColor}/>
        
        {/* Outer ring */}
        <circle 
          cx="24" 
          cy="24" 
          r="8" 
          stroke={strokeColor} 
          strokeWidth="1.5" 
          fill="none" 
          opacity="0.4"
        />
        
        {/* Crosshair lines */}
        <line x1="24" y1="14" x2="24" y2="18" stroke={strokeColor} strokeWidth="1.5" opacity="0.4"/>
        <line x1="24" y1="30" x2="24" y2="34" stroke={strokeColor} strokeWidth="1.5" opacity="0.4"/>
        <line x1="14" y1="24" x2="18" y2="24" stroke={strokeColor} strokeWidth="1.5" opacity="0.4"/>
        <line x1="30" y1="24" x2="34" y2="24" stroke={strokeColor} strokeWidth="1.5" opacity="0.4"/>
      </svg>
    );
  }

  // Full logo with wordmark - Simplified for Global Dreams Academy
  const { w, h } = sizes[size].full;
  return (
    <svg 
      width={w} 
      height={h} 
      viewBox="0 0 300 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Basketball icon */}
      <circle cx="20" cy="20" r="12" stroke={strokeColor} strokeWidth="2" fill="none"/>
      <line x1="20" y1="8" x2="20" y2="32" stroke={strokeColor} strokeWidth="2"/>
      <line x1="8" y1="20" x2="32" y2="20" stroke={strokeColor} strokeWidth="2"/>
      <path d="M8 8L32 32" stroke={strokeColor} strokeWidth="2"/>
      <path d="M32 8L8 32" stroke={strokeColor} strokeWidth="2"/>
      
      {/* Global Dreams Academy Text */}
      <g fill={textColor} fontFamily="Arial, sans-serif" fontSize="20" fontWeight="bold">
        <text x="50" y="28">Global Dreams Academy</text>
      </g>
    </svg>
  );
};

// Wordmark only for navigation (no mark/icon beside the name)
export const LogoInline = ({
  className = '',
  showText = true,
}: {
  className?: string
  showText?: boolean
}) => (
  <div className={`flex items-center ${className}`}>
    {showText && (
      <span className="font-display text-xs sm:text-lg font-bold tracking-tight leading-tight max-[380px]:max-w-[11rem] max-[380px]:truncate sm:max-w-none sm:whitespace-normal">
        Global Dreams Academy
      </span>
    )}
  </div>
);

export default Logo;
