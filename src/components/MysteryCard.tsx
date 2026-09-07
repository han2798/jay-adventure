import React from 'react';

interface MysteryCardProps {
  index: number;
  onClick: () => void;
  isMagicVision?: boolean; // 魔術先生能力：可隱約看透事件卡
  cardHintType?: string;
}

export const MysteryCard: React.FC<MysteryCardProps> = ({
  index,
  onClick,
  isMagicVision,
  cardHintType,
}) => {
  return (
    <button
      id={`mystery-card-${index}`}
      onClick={onClick}
      className="group relative flex flex-col items-center justify-center cursor-pointer transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 active:scale-95 focus:outline-none"
      style={{
        aspectRatio: '2 / 3',
        width: '100%',
        maxWidth: '190px',
      }}
    >
      {/* Outer Golden Border & Shadow */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-[#d4af37] via-[#8c7322] to-[#2a240c] p-[2px] shadow-[0_10px_25px_rgba(0,0,0,0.85)] group-hover:shadow-[0_0_30px_rgba(212,175,55,0.45)] transition-shadow">
        {/* Card Face / Texture */}
        <div className="w-full h-full rounded-[10px] bg-gradient-to-b from-[#141416] via-[#1c1b1f] to-[#0a0a0c] flex flex-col items-center justify-between p-4 relative overflow-hidden">
          
          {/* Subtle Tarot-like Geometric / Lyric Pattern Overlay */}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/30 via-transparent to-transparent" />
          
          {/* Top Corner Ornament */}
          <div className="w-full flex justify-between items-center text-[#d4af37]/60 text-xs font-mono">
            <span>◆</span>
            <span>JAY CHOU</span>
            <span>◆</span>
          </div>

          {/* Magic Vision Hint if character is 魔術先生: Placed under JAY CHOU as requested */}
          {isMagicVision && cardHintType === '事件' && (
            <div className="absolute top-9 left-1/2 -translate-x-1/2 z-20 bg-blue-600/90 text-white border border-blue-400 text-[11px] font-bold px-3 py-0.5 rounded-full shadow-[0_0_12px_rgba(37,99,235,0.7)] animate-pulse tracking-wider whitespace-nowrap">
              事件
            </div>
          )}

          {/* Central Embellishment */}
          <div className="relative my-auto flex flex-col items-center justify-center">
            {/* Compass / Vinyl / Magical Halo */}
            <div className="w-20 h-20 rounded-full border border-[#d4af37]/40 flex items-center justify-center relative group-hover:border-[#d4af37] transition-colors">
              <div className="w-14 h-14 rounded-full border border-dashed border-[#d4af37]/50 animate-[spin_20s_linear_infinite]" />
              <div className="absolute w-8 h-8 rounded-full bg-[#d4af37]/10 flex items-center justify-center">
                <span className="text-sm font-serif text-[#d4af37]">♫</span>
              </div>
            </div>

            {/* Prominent Card Draw Text strictly as demanded in Turn 20-21 */}
            <span className="mt-4 text-xl font-bold tracking-[0.3em] text-[#d4af37] drop-shadow-[0_2px_8px_rgba(212,175,55,0.6)] font-serif pl-[0.3em]">
              抽卡
            </span>
          </div>

          {/* Bottom Corner Ornament */}
          <div className="w-full flex justify-between items-center text-[#d4af37]/60 text-xs font-mono">
            <span>◆</span>
            <span className="text-[10px] tracking-widest text-stone-500">命運之選</span>
            <span>◆</span>
          </div>
        </div>
      </div>
    </button>
  );
};
