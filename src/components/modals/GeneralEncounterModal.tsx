import React from 'react';

export interface GeneralEncounterModalProps {
  isOpen: boolean;
  round: number;
  onConfirm: () => void;
}

export const GeneralEncounterModal: React.FC<GeneralEncounterModalProps> = ({
  isOpen,
  round,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-lg sm:max-w-xl bg-gradient-to-b from-[#2a1010] via-[#1a0808] to-[#0c0404] border-2 border-red-600/90 rounded-2xl p-7 sm:p-9 shadow-[0_0_50px_rgba(239,68,68,0.4)] flex flex-col items-center text-center gap-5 sm:gap-6">
        <div className="w-full flex items-center justify-between border-b border-red-900/60 pb-2.5">
          <span className="text-sm sm:text-base text-amber-400 font-mono tracking-widest uppercase font-bold flex items-center gap-1.5">
            <span>✦</span>
            <span>決戰時刻降臨</span>
            <span>✦</span>
          </span>
          <span className="text-xs sm:text-sm text-stone-400 font-mono">
            {`第 ${round} 回合 決戰降臨`}
          </span>
        </div>

        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-red-950/60 border border-red-500/80 flex items-center justify-center text-4xl sm:text-5xl shadow-[0_0_30px_rgba(239,68,68,0.4)] my-1">
          <span>⚔️</span>
        </div>

        <div>
          <h3 className="text-2xl sm:text-3xl font-black text-amber-100 font-serif tracking-wide">
            {`來到第 ${round} 回合・將軍與您決戰！`}
          </h3>
          <p className="text-sm sm:text-base text-red-300 font-serif mt-1.5 italic">
            「時間的箭頭 指向最後的戰役」
          </p>
        </div>

        <div className="w-full bg-black/60 border border-red-900/50 rounded-xl p-5 sm:p-6 text-sm sm:text-base text-stone-100 leading-relaxed text-left space-y-3 font-sans">
          <p>
            決戰終局吹響號角！統帥【將軍】親臨戰場與你一決勝負！
          </p>
          <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800 text-amber-200 text-xs sm:text-sm font-sans">
            ⚠️ <span className="font-bold text-amber-100">決戰規則提醒</span>：你只有 <span className="font-bold text-red-300">8 回合</span>的機會！若未能在此限期內破除將軍防線並予以擊潰，氣力耗竭將全盤皆輸！
          </div>
        </div>

        <button
          id="confirm-general-encounter-btn"
          onClick={onConfirm}
          className="w-full py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-amber-700 hover:brightness-110 text-white font-black text-base sm:text-lg tracking-wider shadow-[0_0_25px_rgba(239,68,68,0.4)] transition-all cursor-pointer active:scale-98"
        >
          應戰將軍・進入決戰（限8回合）
        </button>
      </div>
    </div>
  );
};
