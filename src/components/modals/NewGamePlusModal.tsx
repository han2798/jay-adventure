import React from 'react';

interface NewGamePlusModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

export function NewGamePlusModal({ onClose, onConfirm }: NewGamePlusModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg sm:max-w-xl bg-gradient-to-b from-[#1c1414] via-[#140e0e] to-[#0a0707] border-2 border-red-700/80 rounded-2xl p-7 sm:p-9 shadow-[0_0_40px_rgba(220,38,38,0.3)] flex flex-col gap-5 text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-950/60 border border-red-600 flex items-center justify-center mx-auto text-3xl sm:text-4xl text-red-400 shadow-inner">
          🔄
        </div>

        <div>
          <h3 className="text-2xl sm:text-3xl font-black text-red-300 font-serif">
            開啟新周目・重新挑戰
          </h3>
          <p className="text-sm sm:text-base text-stone-300 mt-2.5 font-sans leading-relaxed">
            確定要開啟新周目重新挑戰嗎？
            <br />
            <span className="text-amber-300 font-bold">
              為確保挑戰的純粹性與成績的公平真實，開啟新周目將會【全數清空】所有紀錄！
            </span>
          </p>
        </div>

        <div className="bg-black/60 border border-stone-800 rounded-xl p-4 sm:p-5 text-left text-xs sm:text-sm text-stone-300 space-y-2.5 font-sans">
          <div className="flex items-center gap-2 text-amber-300 font-bold bg-amber-950/40 p-2.5 rounded-lg border border-amber-700/60">
            <span className="text-lg text-amber-400">🛡️</span>
            <span>【傳奇殿堂戰績卡永久保存】已獲得的全通關結算評級將完整珍藏，不會丟失！</span>
          </div>
          <div className="flex items-center gap-2 text-stone-300">
            <span className="text-red-400 font-bold">✕</span>
            <span>全域圖鑑中已解鎖歌曲圖鑑、成就技能、冒險日誌全數清除</span>
          </div>
          <div className="flex items-center gap-2 text-stone-300">
            <span className="text-red-400 font-bold">✕</span>
            <span>各通關路線進度重新開始</span>
          </div>
          <div className="flex items-center gap-2 text-stone-300">
            <span className="text-red-400 font-bold">✕</span>
            <span>局數與回合數歸零重新挑戰</span>
          </div>
          <div className="flex items-center gap-2 text-stone-300">
            <span className="text-red-400 font-bold">✕</span>
            <span>當前行囊道具與跨局攜帶物品清空</span>
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-stone-800 text-amber-300/90 font-sans">
            <span>✦</span>
            <span>重返第 1 局最初起點，以更少局數衝刺更高的綜合評級！</span>
          </div>
        </div>

        <div className="flex gap-3.5 mt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-sm sm:text-base font-bold transition-all cursor-pointer"
          >
            取消保留
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3.5 rounded-xl bg-red-900/90 hover:bg-red-700 text-white text-sm sm:text-base font-black border border-red-600 transition-all cursor-pointer shadow-md active:scale-98"
          >
            確認開啟新周目
          </button>
        </div>
      </div>
    </div>
  );
}
