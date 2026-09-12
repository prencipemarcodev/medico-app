import React from 'react'

interface AppLogoProps {
  className?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number
  showText?: boolean
  textColor?: string
}

export function AppLogo({
  className = '',
  size = 'md',
  showText = false,
  textColor = 'text-slate-900',
}: AppLogoProps) {
  let pixelSize = 40
  if (typeof size === 'number') {
    pixelSize = size
  } else {
    switch (size) {
      case 'xs':
        pixelSize = 24
        break
      case 'sm':
        pixelSize = 32
        break
      case 'md':
        pixelSize = 40
        break
      case 'lg':
        pixelSize = 52
        break
      case 'xl':
        pixelSize = 68
        break
    }
  }

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 drop-shadow-md transition-transform hover:scale-105"
      >
        <defs>
          <linearGradient id="appBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0b1329" />
            <stop offset="50%" stopColor="#111c38" />
            <stop offset="100%" stopColor="#070c18" />
          </linearGradient>
          <linearGradient id="appCrossGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id="appPulseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <filter id="appGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="12" floodColor="#0284c7" floodOpacity="0.5" />
          </filter>
        </defs>

        <rect x="12" y="12" width="488" height="488" rx="116" fill="url(#appBgGrad)" stroke="#1e293b" strokeWidth="6" />
        <circle cx="256" cy="256" r="176" fill="none" stroke="#1e293b" strokeWidth="6" opacity="0.6" />

        <g filter="url(#appGlow)">
          <rect x="216" y="112" width="80" height="288" rx="28" fill="url(#appCrossGrad)" />
          <rect x="112" y="216" width="288" height="80" rx="28" fill="url(#appCrossGrad)" />
        </g>

        <path
          d="M 112 256 L 190 256 L 212 200 L 244 320 L 272 160 L 302 336 L 322 256 L 400 256"
          fill="none"
          stroke="url(#appPulseGrad)"
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="272" cy="160" r="10" fill="#ffffff" filter="url(#appGlow)" />
      </svg>

      {showText && (
        <div className="leading-tight">
          <span className={`block font-black tracking-tight text-base ${textColor}`}>
            Studio Medico
          </span>
          <span className="block text-[10px] font-bold text-blue-500 uppercase tracking-wider">
            Piattaforma Sanitaria
          </span>
        </div>
      )}
    </div>
  )
}
