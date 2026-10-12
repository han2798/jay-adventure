import React from 'react';

interface ShovelIconProps {
  className?: string;
}

export const ShovelIcon: React.FC<ShovelIconProps> = ({ className = 'w-4 h-4 inline-block' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ verticalAlign: '-0.15em' }}
  >
    {/* Handle / Shaft */}
    <path d="M19 5 L11 13" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" />
    {/* Grip */}
    <path d="M17 3 L21 7" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
    {/* Spade Head */}
    <path
      d="M11 13 L13 15 L8 20 C 6 21, 4 20, 3 18 C 2 16, 3 14, 5 12 Z"
      fill="#94a3b8"
      stroke="#475569"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);
