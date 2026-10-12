import React from 'react';
import { CharacterDefinition } from '../../types';
import { CharacterAvatarIcon } from '../CharacterAvatarIcon';

export interface CharConfirmModalProps {
  isOpen: boolean;
  character: CharacterDefinition | null;
  onConfirm: (character: CharacterDefinition) => void;
}

export const CharConfirmModal: React.FC<CharConfirmModalProps> = ({
  isOpen,
  character,
  onConfirm,
}) => {
  if (!isOpen || !character) return null;

  const isChopin = character.id === 'char_chopin';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg sm:max-w-xl">
        {isChopin && (
          <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 opacity-75 blur-xl animate-pulse pointer-events-none" />
        )}

        <div
          className={`relative w-full bg-gradient-to-b ${
            isChopin
              ? 'from-[#2e240e] via-[#1a150b] to-[#0d0a06] border-2 border-amber-400 shadow-[0_0_50px_rgba(245,158,11,0.6)]'
              : 'from-[#1b1a20] via-[#141318] to-[#0c0c10] border-2 border-[#d4af37]/80 shadow-2xl'
          } rounded-2xl p-7 sm:p-9 flex flex-col items-center text-center gap-5 sm:gap-6`}
        >
          <div className="w-full flex items-center justify-between border-b border-stone-800 pb-2.5">
            <span className="text-sm sm:text-base text-[#d4af37] font-mono tracking-widest uppercase font-bold flex items-center gap-2">
              {isChopin ? (
                <>
                  <span className="animate-spin text-amber-300">✨</span>
                  <span>✦ 極稀有 SS 角色降臨 ✦</span>
                  <span className="animate-spin text-amber-300">✨</span>
                </>
              ) : (
                '✦ 命運之簽覺醒 ✦'
              )}
            </span>
            <span className="text-xs text-stone-500 font-mono">
              {isChopin ? 'SS RANK UNLOCKED' : 'CHARACTER CONFIRMATION'}
            </span>
          </div>

          {isChopin && (
            <div className="flex items-center gap-2 text-amber-300 text-sm sm:text-base font-bold font-serif animate-bounce">
              <span>🎹</span>
              <span>夜曲奏鳴・十一月的浪漫琴音穿透時空！</span>
              <span>🎵</span>
            </div>
          )}

          <div
            className={`${
              isChopin
                ? 'w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 ring-4 ring-amber-400/50 shadow-[0_0_35px_rgba(251,191,36,0.9)] animate-pulse'
                : 'w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br ' + character.avatarColor + ' shadow-xl'
            } flex items-center justify-center border border-white/30 my-1`}
          >
            <CharacterAvatarIcon
              character={character}
              size={isChopin ? 'xl' : 'lg'}
            />
          </div>

          <div>
            <div className="flex items-center justify-center gap-2">
              <h3
                className={`text-2xl sm:text-3xl font-black font-serif ${
                  isChopin
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-amber-300 to-yellow-200'
                    : 'text-amber-100'
                }`}
              >
                {character.name}
              </h3>
              {isChopin && (
                <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-950 text-xs font-black px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                  SS RANK
                </span>
              )}
            </div>
            <p className="text-base sm:text-[17px] text-[#d4af37] mt-1 font-sans font-medium">
              {character.title}
            </p>
          </div>

          <div className="w-full bg-black/40 border border-stone-800 rounded-xl p-5 sm:p-6 text-base sm:text-[17px] text-stone-300 leading-relaxed text-left font-sans">
            {character.description}
          </div>

          <button
            id="confirm-start-adventure-btn"
            onClick={() => onConfirm(character)}
            className={`w-full py-3.5 sm:py-4 rounded-xl ${
              isChopin
                ? 'bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 text-stone-950 font-black shadow-[0_0_25px_rgba(251,191,36,0.7)] animate-pulse'
                : 'bg-gradient-to-r from-amber-600 via-[#d4af37] to-amber-500 text-stone-950 font-black shadow-[0_4px_18px_rgba(212,175,55,0.35)]'
            } text-base sm:text-lg tracking-wider hover:brightness-110 transition-all cursor-pointer mt-2 active:scale-98`}
          >
            {isChopin
              ? '奏響琴弦・傳奇啟程！'
              : '確認化身・冒險開始！'}
          </button>
        </div>
      </div>
    </div>
  );
};
