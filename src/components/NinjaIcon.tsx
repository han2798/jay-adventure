import React from 'react';

interface NinjaIconProps {
  className?: string;
  size?: number;
}

export const NinjaIcon: React.FC<NinjaIconProps> = ({
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
      className={`inline-block shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] ${className}`}
    >
      {/* 忍者頭部外罩 (黑夜兜帽) */}
      <path
        d="M12 2.2C6.8 2.2 3.8 5.6 3.8 10.5C3.8 14.5 5.3 18.2 7.7 20.7C9 22 10.4 22.6 12 22.6C13.6 22.6 15 22 16.3 20.7C18.7 18.2 20.2 14.5 20.2 10.5C20.2 5.6 17.2 2.2 12 2.2Z"
        fill="#1c1917"
        stroke="#57534e"
        strokeWidth="1.2"
      />
      {/* 頭帶護額 */}
      <path
        d="M4.6 8.5C6.9 7.7 9.4 7.2 12 7.2C14.6 7.2 17.1 7.7 19.4 8.5V11.2C17.1 10.4 14.6 9.9 12 9.9C9.4 9.9 6.9 10.4 4.6 11.2V8.5Z"
        fill="#292524"
        stroke="#78716c"
        strokeWidth="0.8"
      />
      {/* 護額金屬銘牌 */}
      <rect
        x="9"
        y="8.3"
        width="6"
        height="2.5"
        rx="0.6"
        fill="#a8a29e"
        stroke="#e7e5e4"
        strokeWidth="0.5"
      />
      {/* 金屬銘牌中心十字飛鏢刻紋 */}
      <path
        d="M12 8.7L12.3 9.3L12.9 9.5L12.3 9.7L12 10.3L11.7 9.7L11.1 9.5L11.7 9.3Z"
        fill="#292524"
      />
      {/* 面罩眼睛開口 (黃膚透光) */}
      <path
        d="M6.2 12C7.9 11.4 9.9 11 12 11C14.1 11 16.1 11.4 17.8 12C17.8 13.3 17.4 14.4 16.6 14.9C15.3 14.2 13.7 13.8 12 13.8C10.3 13.8 8.7 14.2 7.4 14.9C6.6 14.4 6.2 13.3 6.2 12Z"
        fill="#fed7aa"
      />
      {/* 左眼 (犀利眼神) */}
      <path
        d="M8 12.8C8.7 12.5 9.6 12.6 10.1 13.1C9.4 13.3 8.6 13.2 8 12.8Z"
        fill="#1c1917"
      />
      <circle cx="9.2" cy="13" r="0.55" fill="#1c1917" />
      {/* 右眼 (犀利眼神) */}
      <path
        d="M16 12.8C15.3 12.5 14.4 12.6 13.9 13.1C14.6 13.3 15.4 13.2 16 12.8Z"
        fill="#1c1917"
      />
      <circle cx="14.8" cy="13" r="0.55" fill="#1c1917" />
      {/* 忍術面罩下緣摺線 */}
      <path
        d="M7 16C8.5 15.2 10.2 14.8 12 14.8C13.8 14.8 15.5 15.2 17 16"
        stroke="#44403c"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
      {/* 面罩中心立體摺線 */}
      <path
        d="M12 15.5V19.8"
        stroke="#292524"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
    </svg>
  );
};
