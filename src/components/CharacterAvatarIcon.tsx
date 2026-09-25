import React from 'react';
import { FlameKindling, Logs } from 'lucide-react';
import { CharacterDefinition } from '../types';

interface CharacterAvatarIconProps {
  character?: CharacterDefinition | null;
  icon?: string;
  name?: string;
  id?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const CharacterAvatarIcon: React.FC<CharacterAvatarIconProps> = ({
  character,
  icon,
  name,
  id,
  className = '',
  size = 'md',
}) => {
  const charId = character?.id || id || '';
  const charName = character?.name || name || '';
  const charIcon = character?.avatarIcon || icon || '';

  // Check if it represents "愛情廢柴" or wood/logs
  const isWoodChar =
    charId === 'char_loser' ||
    charName.includes('廢柴') ||
    charIcon === '🪵' ||
    charIcon === '木柴' ||
    charIcon === 'wood';

  // Check if it represents "龍" (化身為龍)
  const isDragonChar =
    charId === 'char_dragon' ||
    charName === '龍' ||
    charIcon === '🐉' ||
    charIcon.includes('龍');

  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
  };

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  if (isWoodChar) {
    return (
      <span
        className={`inline-flex items-center justify-center text-amber-200 select-none ${className}`}
        title="木柴・平淡無奇"
      >
        <FlameKindling className={`${sizeClasses[size]} drop-shadow stroke-[2.2] text-amber-300`} />
      </span>
    );
  }

  if (isDragonChar) {
    return (
      <span
        className={`inline-flex items-center justify-center select-none filter drop-shadow-[0_0_12px_rgba(245,158,11,0.8)] text-amber-300 animate-pulse ${textSizes[size]} ${className}`}
        title="化身為龍・右拳打開了天"
      >
        🐉
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center select-none filter drop-shadow ${textSizes[size]} ${className}`}
    >
      {charIcon || '🎵'}
    </span>
  );
};
