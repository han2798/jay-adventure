import React from 'react';

export interface HeardRainNoticeModalProps {
  isOpen: boolean;
  onConfirm: () => void;
}

export const HeardRainNoticeModal: React.FC<HeardRainNoticeModalProps> = ({
  isOpen,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-gradient-to-b from-[#121924] via-[#0c1219] to-[#080d12] border-2 border-sky-500/80 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(56,189,248,0.35)] flex flex-col items-center text-center gap-4">
        <div className="w-14 h-14 rounded-full bg-sky-950/70 border border-sky-400 flex items-center justify-center text-3xl shadow-inner animate-pulse">
          <span>🌧️</span>
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-black text-sky-200 font-serif">
            雨的聲音
          </h3>
          <p className="text-base text-sky-100 font-serif leading-relaxed mt-2 font-bold">
            「在下雨天許久，你聽見了下雨的聲音...」
          </p>
        </div>
        <p className="text-xs text-stone-300 leading-relaxed font-sans">
          細竹籬上、玻璃瓶裡、百葉窗折射的光影折，雨聲在雨幕中悄然浮現。
        </p>
        <button
          id="confirm-heard-rain-notice-btn"
          onClick={onConfirm}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-600 via-blue-500 to-sky-500 text-stone-950 font-black text-base shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:brightness-110 active:scale-98 transition-all cursor-pointer mt-2"
        >
          聆聽細雨・翻開卡牌
        </button>
      </div>
    </div>
  );
};
