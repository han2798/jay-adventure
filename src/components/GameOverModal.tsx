import React from 'react';
import { GameState } from '../types';

interface GameOverModalProps {
  gameState: GameState;
  onRestartNewGame: () => void;
  onRewindWithClock?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  gameState,
  onRestartNewGame,
  onRewindWithClock,
}) => {
  const isVictory = Boolean(gameState.victoryType);
  const hasClock = Boolean(
    gameState.inventory['反方向的鐘'] && gameState.reversedClockUsesRemaining > 0
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div
        className={`w-full max-w-lg p-8 rounded-2xl flex flex-col items-center text-center shadow-2xl border-2 ${
          isVictory
            ? 'bg-gradient-to-b from-[#211b0e] via-[#151208] to-[#0c0a05] border-[#d4af37]'
            : 'bg-gradient-to-b from-[#220d0d] via-[#140808] to-[#0a0505] border-red-800'
        }`}
      >
        {/* Crest */}
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl mb-4 border ${
            isVictory
              ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37] shadow-[0_0_30px_rgba(212,175,55,0.4)]'
              : 'bg-red-950/40 border-red-600 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]'
          }`}
        >
          {isVictory ? '👑' : '⚔'}
        </div>

        {/* Headline */}
        <h2 className="text-2xl font-black font-serif text-white tracking-wider">
          {isVictory ? `成功達成【${gameState.victoryType}】傳奇！` : '冒險在此止步'}
        </h2>

        {/* Subtitle / Reason */}
        <p className="mt-3 text-sm text-stone-300 leading-relaxed font-sans max-w-md">
          {isVictory
            ? '你以無與倫比的智勇雙全與對周杰倫音樂世界的深刻理解，成功在 30 回合內解開了命運所有羈絆！'
            : gameState.defeatReason || '30 回合光陰已盡，未能達成通關條件。所有的遺憾都將化為下一局的閱歷！'}
        </p>

        {/* Stats summary */}
        <div className="my-6 w-full bg-black/50 border border-stone-800 rounded-xl p-4 grid grid-cols-3 gap-2 text-xs font-mono">
          <div className="flex flex-col">
            <span className="text-stone-500">歷經局數</span>
            <span className="text-stone-200 font-bold text-sm mt-0.5">第 {gameState.gameNumber} 局</span>
          </div>
          <div className="flex flex-col">
            <span className="text-stone-500">生存回合</span>
            <span className="text-stone-200 font-bold text-sm mt-0.5">{gameState.round} / 30</span>
          </div>
          <div className="flex flex-col">
            <span className="text-stone-500">持有物品</span>
            <span className="text-stone-200 font-bold text-sm mt-0.5">
              {Object.values(gameState.inventory).reduce((a, b) => Number(a) + Number(b), 0)} 件
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          {!isVictory && hasClock && (
            <button
              onClick={onRewindWithClock}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-800 to-indigo-700 text-white font-bold text-xs hover:brightness-110 shadow-lg cursor-pointer transition-all"
            >
              發動【反方向的鐘】（倒流至第29回合）
            </button>
          )}

          <button
            onClick={onRestartNewGame}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs shadow-lg cursor-pointer transition-all ${
              isVictory
                ? 'bg-[#d4af37] hover:bg-amber-300 text-black shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-700'
            }`}
          >
            開啟新一局探索（累積全域圖鑑）
          </button>
        </div>
      </div>
    </div>
  );
};
