import React from 'react';

interface NunchakuIconProps {
  className?: string;
}

export const NunchakuIcon: React.FC<NunchakuIconProps> = ({ className = 'w-6 h-6 inline-block' }) => (
  <svg
    className={className}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ verticalAlign: '-0.15em' }}
  >
    {/* Left Baton */}
    <g transform="rotate(-20 8 18)">
      <rect x="6" y="9" width="4.5" height="18" rx="1.5" fill="#d97706" stroke="#78350f" strokeWidth="1.2" />
      <rect x="6" y="8" width="4.5" height="3" rx="0.8" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
    </g>

    {/* Right Baton */}
    <g transform="rotate(20 24 18)">
      <rect x="21.5" y="9" width="4.5" height="18" rx="1.5" fill="#d97706" stroke="#78350f" strokeWidth="1.2" />
      <rect x="21.5" y="8" width="4.5" height="3" rx="0.8" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
    </g>

    {/* Connecting Chain Link */}
    <path
      d="M10 8 C 12 2, 20 2, 22 8"
      stroke="#e2e8f0"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="2.5 1.5"
      fill="none"
    />
  </svg>
);
