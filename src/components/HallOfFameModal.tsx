import React, { useState } from 'react';
import { MetaProgress, GameState, SettlementRecord, RouteVictoryRecord } from '../types';
import { CharacterAvatarIcon } from './CharacterAvatarIcon';
import { downloadSettlementImage, generateSettlementText, getSettlementGrade } from '../utils/exportSettlement';

interface HallOfFameModalProps {
  isOpen: boolean;
  onClose: () => void;
  meta: MetaProgress;
  gameState: GameState;
}

export const HallOfFameModal: React.FC<HallOfFameModalProps> = ({
  isOpen,
  onClose,
  meta,
  gameState,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Compile records: only show full grand slam settlement rating cards
  const historyRecords: SettlementRecord[] = (meta.settlementHistory || []).filter(
    (r) => r.isAllCompleted
  );

  // If settlementHistory has no grand slam card yet but current routeVictoryRecords has 3 routes completed
  if (
    historyRecords.length === 0 &&
    meta.routeVictoryRecords &&
    Object.keys(meta.routeVictoryRecords).length >= 3
  ) {
    const recordsList: RouteVictoryRecord[] = Object.values(meta.routeVictoryRecords || {});
    const bestGame = Math.max(
      ...(recordsList.length > 0 ? recordsList.map((r) => r.gameNumber) : [1]),
      meta.pastGamesCount || 1
    );
    const gradeInfo = getSettlementGrade(bestGame);

    historyRecords.push({
      id: 'legacy_grand_record',
      gameNumber: meta.pastGamesCount || 1,
      round: gameState.round,
      totalRounds: meta.totalRoundsPlayed || gameState.round,
      outcomeType: 'VICTORY',
      route: '全路線大滿貫',
      characterName: gameState.character?.name || '命運探索者',
      characterTitle: gameState.character?.title,
      characterIcon: gameState.character?.avatarIcon || '🪵',
      timestamp: new Date().toLocaleDateString('zh-TW'),
      isAllCompleted: true,
      grade: gradeInfo.grade as any,
      gradeTitle: gradeInfo.title,
      gradeColor: gradeInfo.color,
      itemsCount: (Object.values(gameState.inventory) as number[]).reduce((a, b) => a + Number(b), 0),
      allRecords: meta.routeVictoryRecords,
    });
  }

  const handleCopy = (rec: SettlementRecord) => {
    const settlementData = {
      route: rec.route,
      gameNumber: rec.gameNumber,
      round: rec.round,
      totalRounds: rec.totalRounds,
      characterName: rec.characterName,
      characterTitle: rec.characterTitle,
      characterIcon: rec.characterIcon,
      timestamp: rec.timestamp,
      allRecords: rec.allRecords || meta.routeVictoryRecords,
      isAllCompleted: rec.isAllCompleted,
    };
    const text = generateSettlementText(settlementData);
    navigator.clipboard.writeText(text);
    setCopiedId(rec.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDownload = (rec: SettlementRecord) => {
    const settlementData = {
      route: rec.route,
      gameNumber: rec.gameNumber,
      round: rec.round,
      totalRounds: rec.totalRounds,
      characterName: rec.characterName,
      characterTitle: rec.characterTitle,
      characterIcon: rec.characterIcon,
      timestamp: rec.timestamp,
      allRecords: rec.allRecords || meta.routeVictoryRecords,
      isAllCompleted: rec.isAllCompleted,
    };
    downloadSettlementImage(settlementData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[90vh] bg-gradient-to-b from-[#1c1822] via-[#14121a] to-[#0c0a10] border-2 border-[#d4af37]/80 rounded-2xl p-4 sm:p-6 shadow-[0_0_50px_rgba(212,175,55,0.25)] flex flex-col text-stone-200 my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-amber-900/60 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl filter drop-shadow">🏛️</span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-200 font-serif flex items-center gap-2">
                <span>傳奇殿堂・歷次結算戰績卡</span>
                <span className="text-xs font-mono font-normal text-amber-400/80 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                  共 {historyRecords.length} 張戰績卡
                </span>
              </h2>
              <p className="text-xs text-stone-400 font-sans">
                每一次向宿命挑戰的樂章戰績皆刻印於此，隨時可回顧與匯出高畫質戰報圖卡
              </p>
            </div>
          </div>

          <button
            id="close-hall-of-fame-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white border border-stone-800 transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Cards Container */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4">
          {historyRecords.length === 0 ? (
            <div className="py-16 px-4 flex flex-col items-center justify-center text-center gap-3 bg-black/40 border border-stone-800/80 rounded-2xl">
              <span className="text-4xl text-stone-600">📜</span>
              <p className="text-stone-300 font-serif font-bold text-sm">
                傳奇殿堂尚無結算戰績卡
              </p>
              <p className="text-xs text-stone-500 max-w-md">
                每一次全通關的評級圖卡都將自動刻錄於此殿堂之中！
              </p>
            </div>
          ) : (
            historyRecords.map((rec, index) => {
              const isVic = rec.outcomeType === 'VICTORY';
              const isGrand = rec.isAllCompleted;

              return (
                <div
                  key={rec.id || index}
                  className={`w-full rounded-2xl border-2 p-4 sm:p-5 flex flex-col gap-3.5 transition-all shadow-lg ${
                    isGrand
                      ? 'bg-gradient-to-r from-[#221808] via-[#171207] to-[#0c0904] border-amber-400/80 shadow-[0_0_20px_rgba(251,191,36,0.2)]'
                      : isVic
                      ? 'bg-gradient-to-r from-[#1c170d] via-[#141009] to-[#0a0805] border-amber-600/70'
                      : 'bg-[#120e14] border-stone-800/90'
                  }`}
                >
                  {/* Top Bar: Outcome Badge & Date */}
                  <div className="flex items-center justify-between border-b border-stone-800/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {isGrand ? '👑' : isVic ? '🏆' : '⚔'}
                      </span>
                      <span
                        className={`text-xs sm:text-sm font-black font-serif tracking-wider ${
                          isGrand
                            ? 'text-amber-300'
                            : isVic
                            ? 'text-yellow-200'
                            : 'text-stone-300'
                        }`}
                      >
                        {isGrand
                          ? '👑 全路線大滿貫・傳奇結算'
                          : isVic
                          ? `🏆 傳奇通關：【${rec.route}】`
                          : `⚔ 冒險結算：【${rec.route}】`}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-stone-400">
                      {rec.timestamp}
                    </span>
                  </div>

                  {/* Middle Content Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    {/* Character Identity */}
                    <div className="sm:col-span-4 flex items-center gap-3 bg-black/40 p-2.5 rounded-xl border border-stone-800/80">
                      <div className="w-10 h-10 rounded-xl bg-amber-950/40 border border-amber-700/50 flex items-center justify-center shrink-0">
                        <CharacterAvatarIcon
                          icon={rec.characterIcon}
                          name={rec.characterName}
                          size="md"
                        />
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="text-xs font-bold text-stone-200 font-serif truncate">
                          {rec.characterName}
                        </span>
                        <span className="text-[10px] text-amber-400/80 truncate font-sans">
                          {rec.characterTitle || '命運旅人'}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="sm:col-span-4 grid grid-cols-3 gap-1.5 text-center bg-black/40 p-2.5 rounded-xl border border-stone-800/80 font-mono text-xs">
                      <div>
                        <div className="text-[10px] text-stone-400">局數</div>
                        <div className="font-bold text-amber-300">
                          第 {rec.gameNumber} 局
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-stone-400">回合</div>
                        <div className="font-bold text-amber-300">
                          {rec.round} / 30
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-stone-400">累計消耗</div>
                        <div className="font-bold text-stone-200">
                          {rec.totalRounds} 回合
                        </div>
                      </div>
                    </div>

                    {/* Rating or Status Badge */}
                    <div className="sm:col-span-4 flex items-center justify-end">
                      {isGrand ? (
                        <div
                          className="w-full px-3 py-2 rounded-xl border-2 flex items-center justify-center gap-2 shadow-md"
                          style={{
                            borderColor: rec.gradeColor || '#fbbf24',
                            backgroundColor: 'rgba(26, 20, 10, 0.9)',
                          }}
                        >
                          <span className="text-xl">🏆</span>
                          <div className="flex flex-col items-center">
                            <span
                              className="font-black text-base leading-tight font-mono"
                              style={{ color: rec.gradeColor || '#fbbf24' }}
                            >
                              {rec.grade} 級
                            </span>
                            <span
                              className="font-serif font-bold text-[11px] tracking-wider"
                              style={{ color: rec.gradeColor || '#fbbf24' }}
                            >
                              {rec.gradeTitle}
                            </span>
                          </div>
                        </div>
                      ) : isVic ? (
                        <div className="w-full px-3 py-2 rounded-xl bg-amber-950/40 border border-amber-700/60 text-center">
                          <div className="text-[10px] text-amber-400/80 font-mono">
                            主線達成
                          </div>
                          <div className="text-xs font-bold text-amber-200 font-serif">
                            ★ 通關登錄
                          </div>
                        </div>
                      ) : (
                        <div className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-center">
                          <div className="text-[10px] text-stone-500 font-mono">
                            探索存活
                          </div>
                          <div className="text-xs font-medium text-stone-400">
                            {rec.round} 回合力竭
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Route Records Preview (if Grand Slam or has records) */}
                  {rec.allRecords && Object.keys(rec.allRecords).length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-sans">
                      {[
                        { key: '太陽之子', title: '☀️ 太陽之子' },
                        { key: '最偉大的作品', title: '🎨 最偉大的作品' },
                        { key: '周杰倫家庭', title: '🏠 周杰倫家庭' },
                      ].map((route) => {
                        const rRec = rec.allRecords?.[route.key];
                        return (
                          <div
                            key={route.key}
                            className={`p-2 rounded-lg border text-[11px] flex items-center justify-between ${
                              rRec
                                ? 'bg-amber-950/20 border-amber-800/60 text-amber-200'
                                : 'bg-black/30 border-stone-800/60 text-stone-500'
                            }`}
                          >
                            <span>
                              {rRec ? (
                                route.title
                              ) : (
                                <span className="text-stone-300 font-mono">
                                  <span className="text-white font-bold">？</span> ？？？？？？？？
                                </span>
                              )}
                            </span>
                            <span className="font-mono font-bold">
                              {rRec
                                ? `第 ${rRec.gameNumber} 局 (${rRec.round}R)`
                                : '未通關'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Card Bottom Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800/70">
                    <button
                      onClick={() => handleDownload(rec)}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 via-[#d4af37] to-amber-500 text-stone-950 font-bold text-xs hover:brightness-110 shadow-sm cursor-pointer transition-all flex items-center gap-1 active:scale-98"
                      title="下載此戰績的高畫質 PNG 圖卡"
                    >
                      <span>📷</span>
                      <span>另存戰績圖卡 (PNG)</span>
                    </button>

                    <button
                      onClick={() => handleCopy(rec)}
                      className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 font-bold text-xs border border-stone-700 shadow-sm cursor-pointer transition-all flex items-center gap-1 active:scale-98"
                      title="複製此戰報文字"
                    >
                      <span>{copiedId === rec.id ? '✅' : '📋'}</span>
                      <span>{copiedId === rec.id ? '已複製！' : '複製戰報'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
