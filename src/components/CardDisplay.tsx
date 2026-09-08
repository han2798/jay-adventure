import React from 'react';
import { CardDefinition, GameState } from '../types';
import { ALBUMS } from '../data/albums';

interface CardDisplayProps {
  card: CardDefinition;
  gameState: GameState;
  onSelectOption: (optionIndex: number) => void;
  onClose?: () => void;
}

export const CardDisplay: React.FC<CardDisplayProps> = ({
  card,
  gameState,
  onSelectOption,
}) => {
  const albumMeta = ALBUMS[card.album] || {
    name: card.album,
    year: card.year,
    themeColor: 'from-stone-900 to-black',
    accentColor: '#d4af37',
    badgeColor: 'bg-stone-800 text-stone-300 border-stone-600',
  };

  // Determine top context badge as strictly defined in Turns 12-13
  const getContextTitle = () => {
    switch (card.type) {
      case '遭遇':
        return { text: '遭遇到！', color: 'text-red-400 border-red-500/50 bg-red-950/80 shadow-[0_0_15px_rgba(239,68,68,0.2)]' };
      case '物品':
        return { text: '獲得了！', color: 'text-amber-300 border-amber-500/50 bg-amber-950/80 shadow-[0_0_15px_rgba(245,158,11,0.2)]' };
      case '事件':
        return { text: '發生了！', color: 'text-sky-300 border-sky-500/50 bg-sky-950/80 shadow-[0_0_15px_rgba(14,165,233,0.2)]' };
      case '日記':
        return { text: '解鎖日記！', color: 'text-emerald-300 border-emerald-500/50 bg-emerald-950/80 shadow-[0_0_15px_rgba(16,185,129,0.2)]' };
      case '線索':
        return { text: '拾獲線索！', color: 'text-purple-300 border-purple-500/50 bg-purple-950/80 shadow-[0_0_15px_rgba(168,85,247,0.2)]' };
      default:
        return { text: '顯現了！', color: 'text-stone-200 border-stone-600 bg-stone-900/80' };
    }
  };

  const contextTitle = getContextTitle();

  // Check if option is available
  const checkOptionAvailable = (option: CardDefinition['options'] extends (infer U)[] ? U : never) => {
    if (!option.require) return { available: true };
    const r = option.require;

    if (r.character && gameState.character?.name !== r.character) {
      return { available: false, reason: `需化身為【${r.character}】` };
    }
    if (r.notCharacter && gameState.character?.name === r.notCharacter) {
      return { available: false, reason: `【${r.notCharacter}】無法選擇此項` };
    }
    if (r.item) {
      const currentCount = gameState.inventory[r.item] || 0;
      const neededCount = r.itemCount || 1;
      if (currentCount < neededCount) {
        return { available: false, reason: `缺少道具【${r.item}】` };
      }
    }
    if (r.items && r.items.length > 0) {
      const missing = r.items.filter((item) => !(gameState.inventory[item] > 0));
      if (missing.length > 0) {
        return { available: false, reason: `缺少素材【${missing.join('、')}】` };
      }
    }
    if (r.flag) {
      const flagVal = gameState.flags[r.flag];
      const requiredVal = r.flagValue !== undefined ? r.flagValue : true;
      if (flagVal !== requiredVal) {
        return { available: false, reason: '未滿足特定前置劇情條件' };
      }
    }

    return { available: true };
  };

  return (
    <div className="w-full flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
      {/* 1. Context Badge MOVED OUTSIDE THE CARD (as specifically noted in red pen: 移出圖卡) */}
      <div className="flex items-center justify-center">
        <span
          className={`text-sm lg:text-base font-black tracking-widest px-4 py-1 rounded-full border ${contextTitle.color}`}
        >
          ✦ {contextTitle.text} ✦
        </span>
      </div>

      {/* 2. Main Card Body */}
      <div
        id="revealed-card-display"
        className="w-full max-w-xl flex flex-col bg-gradient-to-b from-[#1c1b1f] via-[#141416] to-[#0c0c0e] border-2 border-[#4a4026] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden transition-all"
      >
        {/* Album Artwork & Song Hero Header */}
        <div
          className={`relative w-full h-40 bg-gradient-to-br ${albumMeta.themeColor} flex items-center justify-between px-7 border-b border-stone-800 overflow-hidden`}
        >
          {/* Decorative Vinyl Disc Graphic */}
          <div className="absolute -right-6 -bottom-6 w-44 h-44 rounded-full border-4 border-black/80 bg-zinc-950/90 shadow-2xl flex items-center justify-center opacity-85">
            <div className="w-28 h-28 rounded-full border border-zinc-700/60 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
                <span className="text-[10px] text-[#d4af37] font-mono font-bold">JAY</span>
              </div>
            </div>
          </div>

          {/* Hero Song Title & Album Info */}
          <div className="relative z-10 flex flex-col pr-16">
            {/* Card ID on top-left as requested (replacing redundant album badge) */}
            <div className="flex items-center">
              <span className="text-xs font-mono font-bold text-amber-200 bg-black/70 border border-amber-800/80 px-2.5 py-0.5 rounded-md shadow-sm">
                {card.id}
              </span>
            </div>

            {/* Song Title as the Hero Focus */}
            <h2 className="text-2xl sm:text-3xl font-black text-amber-100 drop-shadow font-serif tracking-wide mt-2">
              {card.name}
            </h2>

            {/* Reference Info */}
            <p className="text-xs text-stone-300/90 font-medium tracking-wide mt-1 drop-shadow-sm font-sans">
              收錄於 {card.year}年《{card.album}》 第 {card.track} 首
            </p>
          </div>
        </div>

        {/* 3. Flavor Text / Story Lyrics Box */}
        <div className="p-5">
          <div className="bg-[#121215] p-4 rounded-xl border border-stone-800/80 text-sm text-stone-300 leading-relaxed font-sans shadow-inner">
            {card.flavorText}
          </div>
        </div>

        {/* 4. Interactive Options Area - strictly filter out unavailable requirement options to prevent spoilers */}
        <div className="px-5 pb-5 flex flex-col gap-2.5">
          {(() => {
            const availableOptions = (card.options || [])
              .map((opt, originalIdx) => ({
                opt,
                originalIdx,
                check: checkOptionAvailable(opt),
              }))
              .filter((item) => item.check.available);

            if (availableOptions.length > 0) {
              return availableOptions.map(({ opt, originalIdx }) => (
                <button
                  key={originalIdx}
                  id={`card-option-${originalIdx}`}
                  onClick={() => onSelectOption(originalIdx)}
                  className="w-full text-left px-4 py-3 rounded-xl border font-medium text-sm transition-all duration-200 flex flex-col gap-1 bg-[#1d1c1a] hover:bg-[#2c281d] text-amber-100 border-[#6b5820] hover:border-[#d4af37] shadow-sm hover:shadow-[0_0_15px_rgba(212,175,55,0.2)] active:scale-[0.99] cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold text-sm font-sans text-stone-200">
                      {opt.text}
                    </span>
                  </div>
                </button>
              ));
            }

            return (
              <button
                id="card-option-default"
                onClick={() => onSelectOption(-1)}
                className="w-full py-3 rounded-xl bg-[#d4af37] text-stone-950 font-bold text-sm hover:bg-amber-300 transition-colors shadow-[0_4px_12px_rgba(212,175,55,0.3)] cursor-pointer text-center font-serif"
              >
                收入行囊，繼續前進
              </button>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
