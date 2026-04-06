export function HeroIllustration({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 600 500" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background soft shapes */}
      <circle cx="300" cy="250" r="200" fill="#ecfdf5" opacity="0.7" />
      <circle cx="420" cy="180" r="80" fill="#d1fae5" opacity="0.5" />
      <circle cx="180" cy="320" r="60" fill="#a7f3d0" opacity="0.4" />

      {/* Shield body */}
      <path d="M300 80 L420 140 L420 280 C420 360 300 420 300 420 C300 420 180 360 180 280 L180 140 Z"
        fill="url(#heroShieldGrad)" stroke="#059669" strokeWidth="3" />
      <defs>
        <linearGradient id="heroShieldGrad" x1="180" y1="80" x2="420" y2="420">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      {/* Shield check mark */}
      <path d="M260 250 L290 280 L350 210" stroke="white" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* Floating heart (left) */}
      <g transform="translate(110, 150)" opacity="0.9">
        <path d="M20 8 C20 3, 12 0, 12 6 C12 0, 4 3, 4 8 C4 15, 12 22, 12 22 C12 22, 20 15, 20 8Z" fill="#f43f5e" />
      </g>

      {/* Floating heart (right) */}
      <g transform="translate(450, 120)" opacity="0.8">
        <path d="M16 6 C16 2, 10 0, 10 5 C10 0, 4 2, 4 6 C4 12, 10 17, 10 17 C10 17, 16 12, 16 6Z" fill="#fb7185" />
      </g>

      {/* Floating coin (top-right) */}
      <g transform="translate(460, 250)">
        <circle cx="20" cy="20" r="20" fill="#fbbf24" opacity="0.9" />
        <text x="20" y="26" textAnchor="middle" fill="#92400e" fontSize="18" fontWeight="bold" fontFamily="system-ui">&#x20B9;</text>
      </g>

      {/* Floating document (bottom-left) */}
      <g transform="translate(120, 280)" opacity="0.85">
        <rect x="0" y="0" width="32" height="40" rx="4" fill="white" stroke="#6ee7b7" strokeWidth="2" />
        <line x1="7" y1="10" x2="25" y2="10" stroke="#a7f3d0" strokeWidth="2" strokeLinecap="round" />
        <line x1="7" y1="17" x2="20" y2="17" stroke="#a7f3d0" strokeWidth="2" strokeLinecap="round" />
        <line x1="7" y1="24" x2="22" y2="24" stroke="#a7f3d0" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 30 L15 33 L22 27" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>

      {/* People silhouettes (bottom) */}
      <g transform="translate(200, 370)" opacity="0.6">
        <circle cx="20" cy="6" r="6" fill="#6b7280" />
        <path d="M8 30 C8 20, 14 16, 20 16 C26 16, 32 20, 32 30" fill="#9ca3af" />
      </g>
      <g transform="translate(250, 365)" opacity="0.6">
        <circle cx="20" cy="6" r="7" fill="#6b7280" />
        <path d="M7 32 C7 21, 13 16, 20 16 C27 16, 33 21, 33 32" fill="#9ca3af" />
      </g>
      <g transform="translate(310, 370)" opacity="0.6">
        <circle cx="20" cy="6" r="6" fill="#6b7280" />
        <path d="M8 30 C8 20, 14 16, 20 16 C26 16, 32 20, 32 30" fill="#9ca3af" />
      </g>

      {/* Connection lines */}
      <path d="M230 390 C260 360, 280 370, 300 350" stroke="#d1fae5" strokeWidth="2" strokeDasharray="4 4" fill="none" />
      <path d="M340 390 C320 370, 310 375, 300 350" stroke="#d1fae5" strokeWidth="2" strokeDasharray="4 4" fill="none" />
    </svg>
  );
}

export function AuthIllustration({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="200" cy="200" r="160" fill="#ecfdf5" opacity="0.6" />
      <circle cx="280" cy="130" r="50" fill="#d1fae5" opacity="0.5" />
      <circle cx="130" cy="280" r="40" fill="#a7f3d0" opacity="0.4" />

      {/* Card shape */}
      <rect x="100" y="110" width="200" height="180" rx="16" fill="white" stroke="#d1fae5" strokeWidth="2" filter="url(#authShadow)" />
      <defs>
        <filter id="authShadow" x="90" y="104" width="220" height="200" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#059669" floodOpacity="0.1" />
        </filter>
      </defs>

      {/* Avatar circle */}
      <circle cx="200" cy="165" r="28" fill="#d1fae5" />
      <circle cx="200" cy="158" r="12" fill="#059669" />
      <path d="M178 182 C178 170, 188 164, 200 164 C212 164, 222 170, 222 182" fill="#059669" />

      {/* Lock icon */}
      <g transform="translate(182, 205)">
        <rect x="0" y="10" width="36" height="28" rx="4" fill="#059669" />
        <path d="M8 10 V6 C8 -2, 28 -2, 28 6 V10" stroke="#059669" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="18" cy="24" r="4" fill="white" />
        <line x1="18" y1="28" x2="18" y2="32" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Floating check badges */}
      <g transform="translate(310, 150)">
        <circle cx="16" cy="16" r="16" fill="#10b981" />
        <path d="M9 16 L14 21 L23 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>

      <g transform="translate(70, 200)">
        <circle cx="14" cy="14" r="14" fill="#34d399" opacity="0.8" />
        <path d="M8 14 L12 18 L20 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>

      {/* Sparkles */}
      <g transform="translate(320, 240)" opacity="0.6">
        <path d="M8 0 L10 6 L16 8 L10 10 L8 16 L6 10 L0 8 L6 6 Z" fill="#fbbf24" />
      </g>
      <g transform="translate(90, 130)" opacity="0.5">
        <path d="M6 0 L7.5 4.5 L12 6 L7.5 7.5 L6 12 L4.5 7.5 L0 6 L4.5 4.5 Z" fill="#fbbf24" />
      </g>
    </svg>
  );
}

export function EmptyDonationsIllustration({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="80" r="60" fill="#ecfdf5" opacity="0.6" />
      <g transform="translate(70, 35)">
        <path d="M30 10 C30 4, 20 0, 20 8 C20 0, 10 4, 10 10 C10 20, 20 30, 20 30 C20 30, 30 20, 30 10Z" fill="#d1fae5" stroke="#059669" strokeWidth="2" />
        <path d="M56 18 C56 12, 46 8, 46 16 C46 8, 36 12, 36 18 C36 28, 46 38, 46 38 C46 38, 56 28, 56 18Z" fill="#a7f3d0" stroke="#10b981" strokeWidth="1.5" opacity="0.7" />
      </g>
      <g transform="translate(60, 80)">
        <rect x="0" y="0" width="80" height="50" rx="8" fill="white" stroke="#d1fae5" strokeWidth="2" />
        <text x="40" y="22" textAnchor="middle" fill="#9ca3af" fontSize="10" fontFamily="system-ui">No donations</text>
        <text x="40" y="38" textAnchor="middle" fill="#d1d5db" fontSize="9" fontFamily="system-ui">yet</text>
      </g>
    </svg>
  );
}

export function EmptyCasesIllustration({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="80" r="60" fill="#ecfdf5" opacity="0.6" />
      <g transform="translate(60, 30)">
        <rect x="0" y="0" width="80" height="100" rx="8" fill="white" stroke="#d1fae5" strokeWidth="2" />
        <line x1="15" y1="25" x2="65" y2="25" stroke="#e5e7eb" strokeWidth="2" strokeLinecap="round" />
        <line x1="15" y1="38" x2="55" y2="38" stroke="#e5e7eb" strokeWidth="2" strokeLinecap="round" />
        <line x1="15" y1="51" x2="60" y2="51" stroke="#e5e7eb" strokeWidth="2" strokeLinecap="round" />
        <line x1="15" y1="64" x2="45" y2="64" stroke="#e5e7eb" strokeWidth="2" strokeLinecap="round" />
        <circle cx="40" cy="15" r="6" fill="#d1fae5" />
        <path d="M37 15 L39 17 L44 12" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <g transform="translate(20, 72)">
          <circle cx="20" cy="10" r="10" fill="#f3f4f6" />
          <line x1="14" y1="10" x2="26" y2="10" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" />
          <line x1="20" y1="4" x2="20" y2="16" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}

export function TransparencyIllustration({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="50" fill="#ecfdf5" />
      {/* Eye with shield pupil */}
      <path d="M20 60 C20 60, 40 35, 60 35 C80 35, 100 60, 100 60 C100 60, 80 85, 60 85 C40 85, 20 60, 20 60Z" fill="white" stroke="#059669" strokeWidth="2.5" />
      <circle cx="60" cy="60" r="18" fill="#d1fae5" stroke="#059669" strokeWidth="2" />
      <circle cx="60" cy="60" r="8" fill="#059669" />
      <circle cx="56" cy="56" r="3" fill="white" opacity="0.8" />
    </svg>
  );
}

export function VerifiedIllustration({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="50" fill="#ecfdf5" />
      {/* Shield */}
      <path d="M60 18 L92 36 L92 66 C92 86 60 102 60 102 C60 102 28 86 28 66 L28 36 Z" fill="#d1fae5" stroke="#059669" strokeWidth="2.5" />
      {/* Check */}
      <path d="M44 60 L55 71 L76 48" stroke="#059669" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function TrackingIllustration({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="50" fill="#eff6ff" />
      {/* Chart bars */}
      <rect x="25" y="70" width="14" height="30" rx="3" fill="#93c5fd" />
      <rect x="44" y="50" width="14" height="50" rx="3" fill="#60a5fa" />
      <rect x="63" y="35" width="14" height="65" rx="3" fill="#3b82f6" />
      <rect x="82" y="55" width="14" height="45" rx="3" fill="#93c5fd" />
      {/* Trend line */}
      <path d="M32 65 L51 45 L70 30 L89 50" stroke="#1d4ed8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Dot highlights */}
      <circle cx="32" cy="65" r="3" fill="#1d4ed8" />
      <circle cx="51" cy="45" r="3" fill="#1d4ed8" />
      <circle cx="70" cy="30" r="4" fill="#1d4ed8" />
      <circle cx="89" cy="50" r="3" fill="#1d4ed8" />
    </svg>
  );
}

export function CommunityIllustration({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="50" fill="#faf5ff" />
      {/* Center person */}
      <circle cx="60" cy="42" r="10" fill="#c084fc" />
      <path d="M42 72 C42 58, 50 52, 60 52 C70 52, 78 58, 78 72" fill="#c084fc" />
      {/* Left person */}
      <circle cx="30" cy="55" r="8" fill="#e9d5ff" />
      <path d="M16 78 C16 67, 22 62, 30 62 C38 62, 44 67, 44 78" fill="#e9d5ff" />
      {/* Right person */}
      <circle cx="90" cy="55" r="8" fill="#e9d5ff" />
      <path d="M76 78 C76 67, 82 62, 90 62 C98 62, 104 67, 104 78" fill="#e9d5ff" />
      {/* Connection arcs */}
      <path d="M40 50 C45 40, 55 38, 55 42" stroke="#d8b4fe" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
      <path d="M80 50 C75 40, 65 38, 65 42" stroke="#d8b4fe" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
    </svg>
  );
}
