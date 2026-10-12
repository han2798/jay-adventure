import React from 'react';

interface NewGamePlusModalProps {
  onClose: () => void;
  onConfirm: () => void;
  gameNumber: number;
  unlockedIronBoxSlot: boolean;
}

export function NewGamePlusModal({ onClose, onConfirm, gameNumber, unlockedIronBoxSlot }: NewGamePlusModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg sm:max-w-xl bg-gradient-to-b from-[#1c1414] via-[#141418] to-[#0d0d10] border-2 border-red-900/60 rounded-2xl p-6 sm:p-8 text-stone-200 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col items-center text-center gap-4 relative z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-950/60 border border-red-800/80 flex items-center justify-center text-3xl sm:text-4xl shadow-inner text-red-400 animate-pulse">
            ⏳
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-200 to-red-400 tracking-wide">
              開啟全新周目 (NG+{gameNumber})
            </h3>
            <p className="text-xs sm:text-sm text-stone-400 mt-1">
              準備好重置冒險並帶著鐵盒傳承物品開啟下一輪輪迴了嗎？
            </p>
          </div>

          <div className="bg-black/60 border border-stone-800 rounded-xl p-4 sm:p-5 text-left w-full flex flex-col gap-2.5 text-xs sm:text-sm my-1">
            <div className="flex items-center gap-2 text-amber-300 font-bold bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-800/40 mb-1">
              ✨ 本次繼承說明：
            </div>
            <div className="flex items-center gap-2 text-stone-300">
              <span className="text-amber-400 font-bold">•</span>
              已解鎖之「角色的化身」、「歌曲圖鑑」與「成就」將永久保留。
            </div>
            <div className="flex items-center gap-2 text-stone-300">
              <span className="text-amber-400 font-bold">•</span>
              冒險天數 (Round)、當前手牌、目前能力數值將重新重置。
            </div>
            {unlockedIronBoxSlot && (
              <div className="flex items-center gap-2 text-emerald-300 font-semibold bg-emerald-950/30 px-2.5 py-1 rounded border border-emerald-800/30">
                <span>📦</span> 已升級鐵盒容量，可勾選更多攜帶道具進入下一周目！
              </div>
            )}
          </div>

          <div className="flex gap-3.5 mt-2 w-full">
            <button
              onClick={onClose}
              className="flex-1 bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium py-3 rounded-xl transition-colors text-sm border border-stone-700"
            >
              稍後再說
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-gradient-to-r from-red-700 via-amber-600 to-red-700 hover:from-red-600 hover:to-red-600 text-stone-100 font-bold py-3 rounded-xl transition-all shadow-lg text-sm border border-red-500/40 animate-pulse"
            >
              確認開啟 NG+{gameNumber}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
