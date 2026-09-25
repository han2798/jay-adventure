import React from 'react';

interface RewindNotificationModalProps {
  currentRound: number;
  targetRound: number;
  remainingUses: number;
  isAmbushBattle: boolean;
  onConfirm: () => void;
}

export const RewindNotificationModal: React.FC<RewindNotificationModalProps> = ({
  currentRound,
  targetRound,
  remainingUses,
  isAmbushBattle,
  onConfirm,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 lg:p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-gradient-to-b from-[#1a1333] via-[#100c24] to-[#0a0717] border-2 border-purple-500/80 rounded-2xl p-7 lg:p-8 shadow-[0_0_70px_rgba(168,85,247,0.45)] flex flex-col items-center text-center gap-5 relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-12 -left-12 w-44 h-44 bg-purple-600/25 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-cyan-600/25 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="w-full flex items-center justify-between border-b border-purple-800/60 pb-3 z-10">
          <span className="text-xs sm:text-sm text-purple-300 font-mono tracking-widest uppercase font-bold flex items-center gap-2">
            <span>✦</span>
            <span>時空逆流・因果重塑</span>
            <span>✦</span>
          </span>
          <span className="text-xs sm:text-sm text-purple-200 font-mono font-bold bg-purple-950/90 px-3 py-1 rounded-md border border-purple-600/80 shadow-sm">
            剩餘 {remainingUses} 次機會
          </span>
        </div>

        {/* Spinning Clock Icon */}
        <div className="relative my-1.5 z-10">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-900/95 to-indigo-950/95 border-2 border-purple-400/90 flex items-center justify-center text-5xl shadow-[0_0_35px_rgba(168,85,247,0.6)] animate-pulse">
            ⏳
          </div>
          <div className="absolute -inset-1.5 rounded-full border border-purple-400/40 animate-ping pointer-events-none" />
        </div>

        {/* Narrative & Cause */}
        <div className="space-y-3 z-10">
          <h3 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-purple-100 to-cyan-200 font-serif tracking-wide">
            【反方向的鐘】發動！
          </h3>
          <p className="text-sm sm:text-base text-purple-200/95 leading-relaxed font-sans px-3">
            「穿梭時間的畫面的鐘，從反方向開始移動……」
            <br />
            決戰將軍雖陷死局，但你懷中所攜帶的<span className="text-amber-300 font-bold">【反方向的鐘】</span>劇烈共鳴！秒針逆時針瘋狂飛轉，從將軍的最後一擊之前逆轉光陰！
          </p>
        </div>

        {/* Badges / Round Difference */}
        <div className="w-full grid grid-cols-2 gap-3 text-sm font-mono bg-black/55 border border-purple-900/70 rounded-xl p-4 z-10 shadow-inner">
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-stone-400 text-xs sm:text-sm">原本受創時空</span>
            <span className="text-red-400 font-black text-base sm:text-lg">第 {currentRound} 回合</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-purple-300 text-xs sm:text-sm">逆流返回時空</span>
            <span className="text-cyan-300 font-black text-base sm:text-lg">第 {targetRound} 回合</span>
          </div>
        </div>

        {/* Ambush details */}
        {isAmbushBattle && (
          <div className="w-full p-3 rounded-xl bg-purple-950/50 border border-purple-700/70 text-purple-200 text-xs sm:text-sm font-sans text-left z-10 leading-relaxed shadow-sm">
            💡 <span className="text-purple-100 font-bold">突襲回溯修復</span>：已從行囊收回「最後的戰役」密信，你將返回抽信前的自由時空，重整旗鼓！
          </div>
        )}

        {/* Confirm Button */}
        <button
          id="confirm-rewind-clock-btn"
          onClick={onConfirm}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 text-white font-black text-base sm:text-lg tracking-wider hover:brightness-110 active:scale-98 transition-all shadow-[0_4px_24px_rgba(147,51,234,0.5)] cursor-pointer mt-1 z-10"
        >
          時空變化・重返第 {targetRound} 回合（Enter）
        </button>
      </div>
    </div>
  );
};
