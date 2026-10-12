import React from 'react';

interface GoldCoinIconProps {
  className?: string;
  size?: number;
}

export const GoldCoinIcon: React.FC<GoldCoinIconProps> = ({
  className = 'w-4 h-4',
  size,
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] ${className}`}
    >
      <circle cx="12" cy="12" r="10" fill="url(#gc-gold-grad)" stroke="#d97706" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="7.5" stroke="#fef08a" strokeWidth="1" strokeDasharray="1.5 1.5" opacity="0.8" />
      {/* 經典方孔金幣中心刻紋 */}
      <rect x="9.5" y="9.5" width="5" height="5" rx="0.8" fill="#b45309" stroke="#78350f" strokeWidth="1" />
      <defs>
        <linearGradient id="gc-gold-grad" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fef08a" />
          <stop offset="0.3" stopColor="#facc15" />
          <stop offset="0.75" stopColor="#eab308" />
          <stop offset="1" stopColor="#ca8a04" />
        </linearGradient>
      </defs>
    </svg>
  );
};
