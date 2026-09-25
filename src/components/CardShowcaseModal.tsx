import React from 'react';
import { CardDefinition } from '../types';
import { ALBUMS } from '../data/albums';

interface CardShowcaseModalProps {
  card: CardDefinition;
  acquisitionSource?: string; // 例如：「小鐵匠精心熬製」、「隱藏配方合成」
  sourceText?: string;
  badgeTitle?: string; // 例如：「✦ 恭喜合成 ✦」、「✦ 秘寶現世 ✦」
  onClose: () => void;
}

export const CardShowcaseModal: React.FC<CardShowcaseModalProps> = ({
  card,
  acquisitionSource,
  sourceText,
  badgeTitle,
  onClose,
}) => {
  if (!card) return null;

  const displaySource = sourceText || card.acquisitionSource || acquisitionSource || '特殊機制獲得';
  const displayBadgeTitle =
    badgeTitle ||
    (displaySource.includes('合成') || displaySource.includes('熬製')
      ? '✦ 恭喜合成 ✦'
      : '✦ 獲得卡牌 ✦');

  const displayHintText =
    card.hintText ||
    (card.options && card.options.length > 0 && card.options[0]?.resultText
      ? card.options[0].resultText
      : undefined);

  const albumMeta = ALBUMS[card.album] || {
    name: card.album,
    year: card.year,
    themeColor: 'from-stone-900 to-black',
    accentColor: '#d4af37',
    badgeColor: 'bg-stone-800 text-stone-300 border-stone-600',
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg sm:max-w-xl flex flex-col items-center gap-4 text-stone-200 font-sans">
        {/* Top Context Badge */}
        <div className="flex items-center justify-center">
          <span className="text-sm sm:text-base font-black tracking-widest px-6 py-2 rounded-full border border-amber-500/80 bg-amber-950/90 text-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.35)] animate-pulse">
            {displayBadgeTitle}
          </span>
        </div>

        {/* Main Card Body */}
        <div
          id={`showcase-card-${card.id}`}
          className="w-full flex flex-col bg-gradient-to-b from-[#1c1b1f] via-[#141416] to-[#0c0c0e] border-2 border-amber-600/70 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden"
        >
          {/* Album Artwork & Song Hero Header */}
          <div
            className={`relative w-full h-44 bg-gradient-to-br ${albumMeta.themeColor} flex items-center justify-between px-7 border-b border-stone-800 overflow-hidden`}
          >
            {/* Vinyl record or cover */}
            {card.coverImage ? (
              <div className="absolute right-4 top-4 bottom-4 w-32 h-32 rounded-xl overflow-hidden border-2 border-amber-500/50 shadow-2xl shrink-0 z-0">
                <img
                  src={card.coverImage}
                  alt={card.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="absolute -right-6 -bottom-6 w-44 h-44 rounded-full border-4 border-black/80 bg-zinc-950/90 shadow-2xl flex items-center justify-center opacity-85">
                <div className="w-28 h-28 rounded-full border border-zinc-700/60 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
                    <span className="text-[10px] text-[#d4af37] font-mono font-bold">JAY</span>
                  </div>
                </div>
              </div>
            )}

            {/* Song Title & Metadata */}
            <div className="relative z-10 flex flex-col pr-16">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold text-amber-200 bg-black/70 border border-amber-800/80 px-2.5 py-0.5 rounded-md shadow-sm">
                  {card.id}
                </span>
                <span className="text-xs font-bold text-amber-300 bg-amber-950/90 border border-amber-600/80 px-2 py-0.5 rounded-md shadow-sm">
                  【{card.type}】
                </span>
                <span className="text-[11px] font-mono text-emerald-300 bg-emerald-950/80 border border-emerald-700/70 px-2 py-0.5 rounded-md shadow-sm">
                  {displaySource}
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-amber-100 drop-shadow font-serif tracking-wide mt-2">
                {card.name}
              </h2>

              <p className="text-xs sm:text-sm text-stone-300/90 font-medium tracking-wide mt-1 drop-shadow-sm font-sans">
                {card.track === 'SS'
                  ? `收錄於 ${card.year}年《${card.album}》【傳奇神專卡】`
                  : `收錄於 ${card.year}年《${card.album}》 第 ${card.track} 首`}
              </p>
            </div>
          </div>

          {/* Card Content Stack: Flavor Text -> Hint Text -> Acquisition Note */}
          <div className="p-6 flex flex-col gap-3.5">
            {/* 1. 經典旋律・回憶銘刻 (歌詞/背景) */}
            <div className="bg-[#121215] p-4 sm:p-5 rounded-xl border border-stone-800/80 text-sm sm:text-base text-amber-100/90 leading-relaxed font-sans shadow-inner">
              <div className="text-xs text-stone-400 mb-1 font-mono">✦ 經典旋律・回憶銘刻 ✦</div>
              {card.flavorText}
            </div>

            {/* 2. 提示說明欄位 (重要功能與機制說明，位於取得說明上方) */}
            {displayHintText && (
              <div className="bg-[#16141d] p-4 sm:p-5 rounded-xl border border-amber-500/40 text-xs sm:text-sm text-stone-200 leading-relaxed font-sans shadow-inner">
                <div className="text-lg font-bold text-amber-300 mb-1.5 flex items-center gap-1.5 font-mono">
                  <span className="text-stone-100 font-sans leading-relaxed"> 📜 {displayHintText} </span>
                  </div>
              </div>
            )}

            {/* 3. 取得說明 */}
            <div className="bg-amber-950/20 border border-amber-600/30 rounded-xl p-3.5 sm:p-4 text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
              💡 <span className="font-bold text-amber-200">取得說明：</span>
              {card.specialAcquisitionNote ||
                `此卡牌為專屬特殊機制卡牌，在常規抽卡池中無法抽卡獲得。已成功獲得並永久記錄至你的冒險手冊與音樂圖鑑！`}
            </div>
          </div>

          {/* Bottom Button */}
          <div className="px-6 pb-6 pt-1">
            <button
              onClick={onClose}
              className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-amber-600 via-[#d4af37] to-amber-500 hover:brightness-110 text-stone-950 font-black text-base sm:text-lg tracking-wider rounded-xl shadow-[0_4px_18px_rgba(212,175,55,0.35)] cursor-pointer active:scale-98 transition-all"
            >
              ✦ 收入行囊・繼續冒險 ✦
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
