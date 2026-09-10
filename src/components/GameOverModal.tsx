import React, { useState } from 'react';
import { GameState, MetaProgress } from '../types';
import {
  downloadSettlementImage,
  copySettlementToClipboard,
  getSettlementGrade,
  SettlementData,
} from '../utils/exportSettlement';

interface GameOverModalProps {
  gameState: GameState;
  meta?: MetaProgress;
  onRestartNewGame: () => void;
  onRewindWithClock?: () => void;
  onTriggerJayQuote?: (quote?: string) => void;
}

const ALL_VICTORY_ROUTES = ['太陽之子', '最偉大的作品', '周杰倫家庭'];

export const GameOverModal: React.FC<GameOverModalProps> = ({
  gameState,
  meta,
  onRestartNewGame,
  onRewindWithClock,
  onTriggerJayQuote,
}) => {
  const isVictory = Boolean(gameState.victoryType);
  const victoryRoute = gameState.victoryType || '';
  const hasClock = Boolean(
    gameState.inventory['反方向的鐘'] && gameState.reversedClockUsesRemaining > 0
  );

  const [copied, setCopied] = useState<boolean>(false);

  // Determine all unlocked routes including current one
  const currentVictories = Array.from(
    new Set([...(meta?.victories || []), ...(victoryRoute ? [victoryRoute] : [])])
  );
  const isAllCompleted =
    ALL_VICTORY_ROUTES.every((r) => currentVictories.includes(r)) && isVictory;

  const totalRoundsPlayed = (meta?.totalRoundsPlayed || 0) + gameState.round;

  const allRecords = { ...(meta?.routeVictoryRecords || {}) };
  if (victoryRoute && !allRecords[victoryRoute]) {
    allRecords[victoryRoute] = {
      route: victoryRoute,
      gameNumber: gameState.gameNumber,
      round: gameState.round,
      totalRounds: totalRoundsPlayed,
      timestamp: new Date().toLocaleDateString('zh-TW', {
        month: '2-digit',
        day: '2-digit',
      }),
      characterName: gameState.character?.name || '未知',
    };
  }

  const settlementPayload: SettlementData = {
    route: victoryRoute || '冒險結算',
    gameNumber: gameState.gameNumber,
    round: gameState.round,
    totalRounds: totalRoundsPlayed,
    characterName: gameState.character?.name || '未知',
    allRecords,
    isAllCompleted,
  };

  const gradeInfo = getSettlementGrade(gameState.gameNumber);

  React.useEffect(() => {
    if (isAllCompleted && gradeInfo.grade === 'S') {
      onTriggerJayQuote?.('「哎呦，不錯喔！大滿貫 S 級太屌了！」');
    }
  }, [isAllCompleted, gradeInfo.grade, onTriggerJayQuote]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        onRestartNewGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRestartNewGame]);

  const handleCopy = async () => {
    const success = await copySettlementToClipboard(settlementPayload);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownload = () => {
    downloadSettlementImage(settlementPayload);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-300">
      <div
        className={`w-full max-w-2xl p-6 sm:p-8 rounded-2xl flex flex-col items-center text-center shadow-2xl border-2 my-auto ${
          isVictory
            ? 'bg-gradient-to-b from-[#211b0e] via-[#151208] to-[#0c0a05] border-[#d4af37]'
            : 'bg-gradient-to-b from-[#220d0d] via-[#140808] to-[#0a0505] border-red-800'
        }`}
      >
        {/* Crest */}
        <div
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-3xl sm:text-4xl mb-3 border ${
            isVictory
              ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37] shadow-[0_0_30px_rgba(212,175,55,0.4)]'
              : 'bg-red-950/40 border-red-600 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]'
          }`}
        >
          {isVictory ? (isAllCompleted ? '👑' : '🏆') : '⚔'}
        </div>

        {/* Status Tag */}
        <div className="text-[11px] font-mono uppercase tracking-widest px-3 py-1 rounded-full mb-2 bg-black/60 border border-stone-800 text-stone-400">
          {isVictory
            ? isAllCompleted
              ? '✦ GRAND SLAM ALL ROUTES CLEARED ✦'
              : '✦ ROUTE VICTORY SETTLEMENT ✦'
            : '✦ JOURNEY CONCLUDED ✦'}
        </div>

        {/* Main Victory Statement */}
        {isVictory ? (
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-serif text-white tracking-wide leading-snug">
              {victoryRoute === '太陽之子' ? (
                <>
                  恭喜你 經歷{' '}
                  <span className="text-[#d4af37] text-2xl sm:text-3xl font-mono mx-1">
                    {gameState.gameNumber}
                  </span>{' '}
                  局{' '}
                  <span className="text-[#d4af37] text-2xl sm:text-3xl font-mono mx-1">
                    {gameState.round}
                  </span>{' '}
                  回合後
                  <br />
                  成為了【太陽之子】！
                </>
              ) : (
                <>
                  恭喜你 經歷{' '}
                  <span className="text-[#d4af37] text-2xl sm:text-3xl font-mono mx-1">
                    {gameState.gameNumber}
                  </span>{' '}
                  局{' '}
                  <span className="text-[#d4af37] text-2xl sm:text-3xl font-mono mx-1">
                    {gameState.round}
                  </span>{' '}
                  回合後
                  <br />
                  達成了【{victoryRoute}】傳奇！
                </>
              )}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-stone-300 font-sans max-w-lg mx-auto">
              此通關成就與所費局數回合已存入
              <span className="text-amber-300 font-bold">【全域圖鑑】</span>
              。局數消耗越少，成績越卓越！
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-serif text-white tracking-wider">
              冒險在此止步
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-stone-300 font-sans max-w-lg mx-auto leading-relaxed">
              {gameState.defeatReason ||
                '30 回合光陰已盡，未能達成通關條件。所有的遺憾與試煉都將累積至全域圖鑑中！'}
            </p>
          </div>
        )}

        {/* Settlement Metrics Card */}
        <div className="my-4 w-full bg-black/50 border border-stone-800 rounded-xl p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs font-mono">
          <div className="flex flex-col bg-stone-900/60 p-2.5 rounded-lg border border-stone-800">
            <span className="text-stone-400 text-[11px]">達成局數</span>
            <span className="text-amber-300 font-black text-base mt-0.5">
              第 {gameState.gameNumber} 局
            </span>
          </div>
          <div className="flex flex-col bg-stone-900/60 p-2.5 rounded-lg border border-stone-800">
            <span className="text-stone-400 text-[11px]">當局回合</span>
            <span className="text-amber-300 font-black text-base mt-0.5">
              {gameState.round} / 30
            </span>
          </div>
          <div className="flex flex-col bg-stone-900/60 p-2.5 rounded-lg border border-stone-800">
            <span className="text-stone-400 text-[11px]">
              {isAllCompleted ? '全通關評級' : isVictory ? '主線進度' : '探索存活'}
            </span>
            {isAllCompleted ? (
              <div className="flex flex-col items-center justify-center mt-0.5">
                <span
                  className="font-black text-lg leading-tight"
                  style={{ color: gradeInfo.color }}
                >
                  {gradeInfo.grade} 級
                </span>
                <span
                  className="font-serif font-bold text-xs tracking-wider mt-0.5"
                  style={{ color: gradeInfo.color }}
                >
                  {gradeInfo.title}
                </span>
              </div>
            ) : isVictory ? (
              <span className="text-sky-300 font-black text-base mt-0.5">
                {Object.keys(allRecords).length} / 3 條
              </span>
            ) : (
              <span className="text-stone-300 font-bold text-base mt-0.5">
                {gameState.round} / 30 回合
              </span>
            )}
          </div>
          <div className="flex flex-col bg-stone-900/60 p-2.5 rounded-lg border border-stone-800">
            <span className="text-stone-400 text-[11px]">收集行囊</span>
            <span className="text-stone-200 font-bold text-base mt-0.5">
              {Object.values(gameState.inventory).reduce(
                (a, b) => Number(a) + Number(b),
                0
              )}{' '}
              件
            </span>
          </div>
        </div>

        {/* Milestone Note if single route victory */}
        {isVictory && !isAllCompleted && (
          <div className="mb-4 w-full text-xs text-stone-400 bg-black/40 border border-stone-800 px-3.5 py-2.5 rounded-xl text-center leading-relaxed">
            💡 恭喜攻克此傳奇路線！此路線成就已記入全域圖鑑，將在 3 條主線全數通關達成大滿貫後正式結算全路線綜合評級（目前進度：{Object.keys(allRecords).length} / 3）！
          </div>
        )}

        {/* Grand Slam Box if ALL routes completed */}
        {isVictory && isAllCompleted && (
          <div className="w-full my-2 bg-gradient-to-r from-amber-950/40 via-yellow-950/30 to-amber-950/40 border-2 border-amber-500/70 rounded-xl p-4 text-left shadow-lg">
            <div className="flex items-center justify-between border-b border-amber-800/60 pb-2 mb-3">
              <span className="text-sm font-black text-amber-200 font-serif flex items-center gap-1.5">
                <span>👑</span>
                <span>全路線大滿貫・總結算明細</span>
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                ALL 3 ROUTES CLEARED
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="bg-black/60 border border-stone-800 rounded-lg p-2.5">
                <div className="text-stone-400 text-[11px] font-serif">☀️ 太陽之子路線</div>
                <div className="text-amber-300 font-bold mt-1">
                  {allRecords['太陽之子']
                    ? `經歷 ${allRecords['太陽之子'].gameNumber} 局 ${allRecords['太陽之子'].round} 回合`
                    : '已達成'}
                </div>
              </div>

              <div className="bg-black/60 border border-stone-800 rounded-lg p-2.5">
                <div className="text-stone-400 text-[11px] font-serif">🎨 最偉大的作品路線</div>
                <div className="text-amber-300 font-bold mt-1">
                  {allRecords['最偉大的作品']
                    ? `經歷 ${allRecords['最偉大的作品'].gameNumber} 局 ${allRecords['最偉大的作品'].round} 回合`
                    : '已達成'}
                </div>
              </div>

              <div className="bg-black/60 border border-stone-800 rounded-lg p-2.5">
                <div className="text-stone-400 text-[11px] font-serif">🏠 周杰倫家庭路線</div>
                <div className="text-amber-300 font-bold mt-1">
                  {allRecords['周杰倫家庭']
                    ? `經歷 ${allRecords['周杰倫家庭'].gameNumber} 局 ${allRecords['周杰倫家庭'].round} 回合`
                    : '已達成'}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-amber-900/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-stone-300 flex items-center gap-2">
                <span className="text-amber-400 text-sm">✦</span>
                <span>
                  共經歷 <span className="text-amber-300 font-black text-sm">{gameState.gameNumber} 局</span>、累計消耗 <span className="text-amber-300 font-black text-sm">{totalRoundsPlayed} 回合</span> 奏響傳奇！
                </span>
              </div>

              {/* Magnificent Grand Rating Showcase */}
              <div
                className="relative px-5 py-2.5 rounded-2xl border-2 flex items-center gap-3 shadow-xl overflow-hidden animate-pulse"
                style={{
                  borderColor: gradeInfo.color,
                  backgroundColor: 'rgba(26, 20, 10, 0.85)',
                  boxShadow: `0 0 25px ${gradeInfo.color}55`,
                }}
              >
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle, ${gradeInfo.color} 0%, transparent 70%)`,
                  }}
                />
                <span className="text-2xl filter drop-shadow">🏆</span>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-amber-200/80 font-bold">
                    GRAND RATING
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className="font-black text-xl font-mono tracking-tight"
                      style={{ color: gradeInfo.color }}
                    >
                      {gradeInfo.grade} 級
                    </span>
                    <span
                      className="font-serif font-black text-sm tracking-wider"
                      style={{ color: gradeInfo.color }}
                    >
                      {gradeInfo.title}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Milestone Route Hint when not all completed */}
        {isVictory && !isAllCompleted && (
          <div className="w-full my-2 bg-stone-900/70 border border-stone-800 rounded-xl p-3 text-left text-xs">
            <div className="text-stone-300 font-sans flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>🧭</span>
                <span>
                  你已攻克{' '}
                  <span className="text-amber-300 font-bold">
                    {currentVictories.length} / {ALL_VICTORY_ROUTES.length}
                  </span>{' '}
                  條通關路線
                </span>
              </span>
              <span className="text-stone-500 font-mono text-[11px]">
                尚有其他主線等待探索
              </span>
            </div>
          </div>
        )}

        {/* Export & Save Action Bar (另存或匯出結算畫面) */}
        {isVictory && (
          <div className="flex flex-wrap items-center justify-center gap-2.5 my-2 w-full">
            <button
              id="download-settlement-img-btn"
              onClick={handleDownload}
              className="flex-1 min-w-[140px] py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-600 text-stone-950 font-bold text-xs hover:brightness-110 shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5 active:scale-98"
              title="生成高畫質戰報圖卡並下載為 PNG"
            >
              <span>📷</span>
              <span>另存戰績圖卡 (PNG)</span>
            </button>

            <button
              id="copy-settlement-text-btn"
              onClick={handleCopy}
              className="flex-1 min-w-[140px] py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs border border-stone-700 shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5 active:scale-98"
              title="複製結算戰報文字至剪貼簿"
            >
              <span>{copied ? '✅' : '📋'}</span>
              <span>{copied ? '戰報已複製！' : '複製結算戰報'}</span>
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full mt-3">
          {!isVictory && hasClock && (
            <button
              id="rewind-clock-btn"
              onClick={onRewindWithClock}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-800 to-indigo-700 text-white font-bold text-xs hover:brightness-110 shadow-lg cursor-pointer transition-all"
            >
              發動【反方向的鐘】（倒流至第29回合）
            </button>
          )}

          <button
            id="confirm-settlement-btn"
            onClick={onRestartNewGame}
            className={`flex-1 py-3 px-4 rounded-xl font-black text-xs shadow-lg cursor-pointer transition-all active:scale-98 ${
              isVictory
                ? 'bg-[#d4af37] hover:bg-amber-300 text-stone-950 shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-700'
            }`}
          >
            {isVictory
              ? isAllCompleted
                ? '確認（完成大滿貫結算）'
                : '確認（完成結算並繼續探索）'
              : '確認（結束當前局）'}
          </button>
        </div>
      </div>
    </div>
  );
};
