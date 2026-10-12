import React from 'react';

export interface ApExhaustedModalProps {
  isOpen: boolean;
  gameNumber: number;
  onConfirm: () => void;
}

export const ApExhaustedModal: React.FC<ApExhaustedModalProps> = ({
  isOpen,
  gameNumber,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-lg sm:max-w-xl bg-gradient-to-b from-[#240e0e] via-[#170a0a] to-[#0d0505] border-2 border-red-700/80 rounded-2xl p-7 sm:p-9 shadow-2xl flex flex-col items-center text-center gap-5 sm:gap-6">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-950/60 border-2 border-red-600 flex items-center justify-center text-4xl sm:text-5xl shadow-[0_0_25px_rgba(239,68,68,0.35)]">
          ⚡
        </div>

        <div>
          <h3 className="text-2xl sm:text-3xl font-black text-white font-serif tracking-wider">
            行動力耗盡・冒險失敗重生
          </h3>
          <p className="text-xs sm:text-sm text-red-300/80 font-mono mt-1 uppercase">
            ACTION POINTS DEPLETED・FAILURE PENALTY APPLIED
          </p>
        </div>

        <div className="text-sm sm:text-base text-stone-200 leading-relaxed font-sans bg-black/50 border border-stone-800 rounded-xl p-5 sm:p-6 text-left space-y-3">
          <p>
            此局行動力已耗盡！你的身體已達極限，不得不就地重整。請重生進入下一局（<span className="text-amber-300 font-bold">行囊物品清空</span>，但<span className="text-amber-300 font-bold">全域歌曲圖鑑與歷史成就將永久保留</span>）。
          </p>
          <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-900/60 text-red-200 text-xs sm:text-sm font-sans">
            ⚠️ <span className="font-bold">失敗處罰機制</span>：本次行動力耗盡導致重生，使你的【總結算局數 +1】。局數越少代表最終通關成績越好；若頻繁耗盡行動力，累積過多局數將嚴重拉低最終通關評級！
          </div>
        </div>

        <div className="w-full grid grid-cols-2 gap-3 text-xs sm:text-sm font-mono bg-black/40 border border-stone-800 rounded-xl p-3.5 sm:p-4">
          <div className="text-stone-400">力竭局數：<span className="text-stone-200 font-bold">第 {gameNumber} 局</span></div>
          <div className="text-stone-400">處罰後局數：<span className="text-red-400 font-bold">第 {gameNumber + 1} 局</span></div>
        </div>

        <button
          id="confirm-ap-depleted-btn"
          onClick={onConfirm}
          className="w-full py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-amber-700 text-white font-black text-base sm:text-lg tracking-wider hover:brightness-110 transition-all shadow-[0_4px_18px_rgba(239,68,68,0.35)] cursor-pointer active:scale-98"
        >
          確認重生・進入第 {gameNumber + 1} 局
        </button>
      </div>
    </div>
  );
};
