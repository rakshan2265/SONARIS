import React from 'react';

// SONARIS Logo Icon
export const SonarisLogo: React.FC<{ className?: string }> = ({ className = "w-9 h-9" }) => (
  <div className={`relative flex items-center justify-center rounded-full bg-gradient-to-tr from-[#0284c7] via-[#0284c7] to-[#38bdf8] p-1 shadow-md shadow-sky-500/20 ${className}`}>
    <svg viewBox="0 0 36 36" fill="none" className="w-full h-full text-white" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Wave crests */}
      <path d="M4 22c3.5 0 5-4 9-4s5.5 4 9 4 5.5-4 10-4" />
      <path d="M4 27c3.5 0 5-3.5 9-3.5s5.5 3.5 9 3.5 5.5-3.5 10-3.5" opacity="0.7" />
      <path d="M7 16c2.5-3 5-5 11-5 4.5 0 8 2.5 10 6" opacity="0.8" />
    </svg>
  </div>
);

export const OceanGuardLogo = SonarisLogo;

// Bottle outline icon for Marine Debris model
export const PlasticBottleIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10 2h4" />
    <path d="M10 2v3h4V2" />
    <path d="M9 7l-2 3v10a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V10l-2-3H9z" />
    <path d="M8 14h8" strokeDasharray="1 2" />
    <path d="M8 17h8" strokeDasharray="1 2" />
  </svg>
);

// Shipwreck outline icon
export const ShipwreckIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 17.5c2 0 3-1 5-1s3 1 5 1 3-1 5-1 3 1 5 1" />
    <path d="M3 14l3.5-5.5h11l3.5 5.5-1.5 3H4.5L3 14z" />
    <path d="M12 4v4.5" />
    <path d="M9 6h6" />
    <path d="M10 11.5h4" />
    <path d="M7 11.5h1" />
    <path d="M16 11.5h1" />
  </svg>
);

// Multi-class connected nodes icon
export const MultiClassIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="5" r="2.5" />
    <circle cx="5" cy="18" r="2.5" />
    <circle cx="19" cy="18" r="2.5" />
    <line x1="12" y1="7.5" x2="5" y2="15.5" />
    <line x1="12" y1="7.5" x2="19" y2="15.5" />
    <line x1="7.5" y1="18" x2="16.5" y2="18" />
  </svg>
);

// Turtle line doodle for "Less Plastic More Life"
export const TurtleDoodle: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Shell */}
    <ellipse cx="32" cy="32" rx="14" ry="18" />
    <path d="M26 24h12" />
    <path d="M23 32h18" />
    <path d="M26 40h12" />
    <path d="M32 14v36" />
    {/* Head */}
    <ellipse cx="32" cy="10" rx="5" ry="6" />
    {/* Flippers */}
    <path d="M21 21C14 17 9 19 6 25c5 2 11 0 14-3" />
    <path d="M43 21c7-4 12-2 15 4-5 2-11 0-15-4" />
    {/* Rear flippers */}
    <path d="M22 44c-5 4-8 8-8 12 4-1 8-5 9-10" />
    <path d="M42 44c5 4 8 8 8 12-4-1-8-5-9-10" />
    {/* Tail */}
    <path d="M32 50v5" />
  </svg>
);

// Ocean wave flourishes
export const WaveDoodle: React.FC<{ className?: string }> = ({ className = "w-16 h-4" }) => (
  <svg viewBox="0 0 100 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={className}>
    <path d="M5 14c12-8 22 4 35-2 10-5 18 2 28-2 12-4 20 2 27-2" />
  </svg>
);
