import React from 'react';

export interface UnopenedLetterAmbushModalProps {
  isOpen: boolean;
  round: number;
  onConfirm: () => void;
}

export const UnopenedLetterAmbushModal: React.FC<UnopenedLetterAmbushModalProps> = ({
  isOpen,
  round,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg sm:max-w-xl bg-gradient-to-b from-[#2a0e0e] via-[#1a0707] to-[#0c0303] border-2 border-red-600 rounded-2xl p-7 sm:p-9 shadow-[0_0_50px_rgba(239,68,68,0.5)] flex flex-col items-center text-center gap-5 sm:gap-6">
        <div className="w-full flex items-center justify-between border-b border-red-900/60 pb-2.5">
          <span className="text-sm sm:text-base text-amber-400 font-mono tracking-widest uppercase font-bold flex items-center gap-1.5">
            <span>✦</span>
            <span>強襲突圍・無法抽卡</span>
            <span>✦</span>
          </span>
          <span className="text-xs sm:text-sm text-red-400 font-mono font-bold">
            第 {round} 回合
          </span>
        </div>

        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-950/80 border border-red-600/80 flex items-center justify-center text-4xl sm:text-5xl shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse">
          ⚔️
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl sm:text-3xl font-black text-red-100 font-serif tracking-wide">
            戰書未啟・大軍壓境
          </h3>
          <p className="text-sm sm:text-base text-red-200 font-sans leading-relaxed font-semibold">
            因為你不拆信，將軍親臨現場決戰，所以這回合無法抽卡。
          </p>
        </div>

        <button
          id="confirm-ambush-boss-battle"
          onClick={onConfirm}
          className="w-full py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-amber-700 hover:brightness-110 text-white font-black text-base sm:text-lg tracking-wider shadow-[0_0_25px_rgba(239,68,68,0.4)] transition-all cursor-pointer active:scale-98"
        >
          應戰將軍・進入決戰
        </button>
      </div>
    </div>
  );
};
