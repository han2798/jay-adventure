import React, { useState, useMemo } from 'react';
import { MetaProgress, GameState, RouteVictoryRecord } from '../types';
import { CARD_DATABASE } from '../data/cards';
import { ALL_ACHIEVEMENTS } from '../data/achievements';
import { ALBUM_LIST } from '../data/albums';
import {
  downloadSettlementImage,
  copySettlementToClipboard,
  getSettlementGrade,
  SettlementData,
} from '../utils/exportSettlement';

interface CompendiumModalProps {
  meta: MetaProgress;
  gameState: GameState;
  onClose: () => void;
  onStoreInIronBox?: (itemName: string) => void;
  onTakeFromIronBox?: (itemName: string) => void;
  onToggleSkill?: (skillId: string) => void;
}

export const CompendiumModal: React.FC<CompendiumModalProps> = ({
  meta,
  gameState,
  onClose,
  onStoreInIronBox,
  onTakeFromIronBox,
  onToggleSkill,
}) => {
  // Sort songs strictly by Album chronological release year and Track number
  const albumOrderMap = useMemo(() => {
    const map = new Map<string, number>();
    ALBUM_LIST.forEach((a, idx) => {
      map.set(a.name, idx);
    });
    return map;
  }, []);

  const sortedCards = useMemo(() => {
    return [...CARD_DATABASE].sort((a, b) => {
      const albumAIdx = albumOrderMap.get(a.album) ?? 999;
      const albumBIdx = albumOrderMap.get(b.album) ?? 999;
      if (albumAIdx !== albumBIdx) {
        return albumAIdx - albumBIdx;
      }
      const trackA = typeof a.track === 'number' ? a.track : 999;
      const trackB = typeof b.track === 'number' ? b.track : 999;
      if (trackA !== trackB) {
        return trackA - trackB;
      }
      return a.id.localeCompare(b.id);
    });
  }, [albumOrderMap]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const [activeTab, setActiveTab] = useState<
    'cards' | 'achievements' | 'diaries' | 'history' | 'settlement'
  >('cards');
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const activeSkills = meta.activeSkills || [];
  const histories = meta.gameHistories || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-6 animate-in fade-in duration-200">
      {/* Enlarged / Widened Modal (max-w-7xl, h-[92vh]) to drastically minimize scrollbar necessity */}
      <div className="w-full max-w-7xl h-[92vh] bg-[#131317] border-2 border-[#d4af37]/50 rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xl sm:text-2xl font-black text-amber-200 font-serif tracking-wider">
              全域圖鑑與回憶紀事
            </span>
            <span className="text-xs text-stone-400 font-mono bg-stone-900 px-2.5 py-1 rounded border border-stone-800">
              歷經 {meta.pastGamesCount} 局探索
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-stone-300 hover:text-white text-sm px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 cursor-pointer font-bold transition-colors"
            >
              關閉 ✕
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mt-4 border-b border-stone-800 pb-3 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('cards')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'cards'
                ? 'bg-[#d4af37] text-black font-black shadow-md'
                : 'text-stone-400 hover:text-stone-200 bg-stone-900/80 border border-stone-800'
            }`}
          >
            歌曲圖鑑 ({meta.unlockedCardIds.length}/{CARD_DATABASE.length})
          </button>

          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'achievements'
                ? 'bg-[#d4af37] text-black font-black shadow-md'
                : 'text-stone-400 hover:text-stone-200 bg-stone-900/80 border border-stone-800'
            }`}
          >
            傳奇成就與技能 ({meta.unlockedAchievements.length}/{ALL_ACHIEVEMENTS.length})
          </button>

          <button
            onClick={() => setActiveTab('diaries')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'diaries'
                ? 'bg-[#d4af37] text-black font-black shadow-md'
                : 'text-stone-400 hover:text-stone-200 bg-stone-900/80 border border-stone-800'
            }`}
          >
            劇情日記 ({meta.unlockedDiaries.length})
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#d4af37] text-black font-black shadow-md'
                : 'text-stone-400 hover:text-stone-200 bg-stone-900/80 border border-stone-800'
            }`}
          >
            歷代冒險日誌 ({histories.length})
          </button>

          {/* 通關結算 */}
          <button
            id="tab-settlement-btn"
            onClick={() => setActiveTab('settlement')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'settlement'
                ? 'bg-gradient-to-r from-amber-600 via-[#d4af37] to-amber-500 text-stone-950 font-black shadow-md'
                : 'text-amber-300 hover:text-amber-100 bg-amber-950/40 border border-amber-800/60'
            }`}
          >
            <span>🏆</span>
            <span>
              通關結算 (
              {Object.keys(meta.routeVictoryRecords || {}).length}/3)
            </span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto mt-4 pr-1">
          {/* TAB 1: 歌曲圖鑑 (嚴格依照專輯發行順序與曲目順序排列，加大欄位為 6~7 欄) */}
          {activeTab === 'cards' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2.5">
              {sortedCards.map((card) => {
                const unlocked = meta.unlockedCardIds.includes(card.id);
                return (
                  <div
                    key={card.id}
                    className={`p-3 rounded-xl border flex flex-col justify-between min-h-[100px] transition-all ${
                      unlocked
                        ? 'bg-[#18171d] border-amber-900/60 text-stone-200 shadow-sm'
                        : 'bg-[#0d0d10] border-stone-900/90 text-stone-600'
                    }`}
                  >
                    {/* Top: Card Name (full width, prominent) */}
                    <div className="w-full">
                      <span
                        className={`text-xs font-bold font-serif leading-snug block truncate ${
                          unlocked ? 'text-amber-100' : 'text-stone-600'
                        }`}
                        title={unlocked ? card.name : undefined}
                      >
                        {unlocked ? card.name : '？？？？'}
                      </span>
                      {/* Album Name moved below card name so it never squeezes or truncates the title */}
                      <span className="text-[10px] text-stone-400 font-sans block truncate mt-1">
                        {card.album}
                      </span>
                    </div>

                    {/* Bottom: Card ID & Track Number */}
                    <div className="flex justify-between items-end text-[10px] text-stone-500 font-mono pt-1.5 border-t border-stone-800/50 mt-1">
                      <span>{card.id}</span>
                      <span className={unlocked ? 'text-amber-400/90 font-bold' : 'text-stone-600'}>
                        {unlocked ? `第${card.track}首` : '未解鎖'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: 傳奇成就與技能 (未解鎖前完全顯示為 "???" 保留解謎探索感，可做為技能啟動) */}
          {activeTab === 'achievements' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {ALL_ACHIEVEMENTS.map((ach) => {
                const isUnlocked = meta.unlockedAchievements.includes(ach.id);
                const isSkillActive = activeSkills.includes(ach.id);

                return (
                  <div
                    key={ach.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                      isUnlocked
                        ? 'bg-[#1a1713] border-[#d4af37]/60 shadow-[0_0_15px_rgba(212,175,55,0.1)]'
                        : 'bg-[#0f0f12] border-stone-900 text-stone-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-bold font-serif ${
                            isUnlocked ? 'text-[#d4af37]' : 'text-stone-500'
                          }`}
                        >
                          {isUnlocked ? `【${ach.title}】` : '【？？？？？】'}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                            isUnlocked
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-stone-900 text-stone-600'
                          }`}
                        >
                          {isUnlocked ? '已解鎖' : '未解鎖'}
                        </span>
                      </div>

                      {/* Description / Condition: Unrevealed before unlocked */}
                      <p className="text-xs text-stone-300 mt-2 leading-relaxed font-sans">
                        {isUnlocked ? ach.description : '解鎖條件：？？？？？？？？？？'}
                      </p>

                      {/* Reward / Skill Effect: Unrevealed before unlocked */}
                      <div className="mt-2.5 text-xs text-amber-300/90 bg-black/40 p-2.5 rounded-lg border border-stone-800/80">
                        <span className="font-bold text-amber-400 mr-1">技能效果：</span>
                        {isUnlocked ? ach.rewardDescription : '？？？？？？？？'}
                      </div>
                    </div>

                    {/* Skill Activation Toggle (成就可作為技能選擇是否啟動) */}
                    {isUnlocked && (
                      <div className="mt-3 pt-2.5 border-t border-stone-800/80 flex items-center justify-between">
                        <span className="text-[11px] text-stone-400 font-sans">
                          當前技能狀態：
                          <span className={isSkillActive ? 'text-emerald-400 font-bold ml-1' : 'text-stone-500 ml-1'}>
                            {isSkillActive ? '生效中' : '未啟動'}
                          </span>
                        </span>
                        <button
                          onClick={() => onToggleSkill?.(ach.id)}
                          className={`text-xs px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                            isSkillActive
                              ? 'bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-700'
                              : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700'
                          }`}
                        >
                          {isSkillActive ? '關閉技能' : '啟動技能'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: 劇情日記 */}
          {activeTab === 'diaries' && (
            <div className="flex flex-col gap-3 max-w-3xl mx-auto">
              <div className="text-xs text-stone-400 bg-stone-900/70 p-3.5 rounded-xl border border-stone-800 leading-relaxed">
                劇情日記脫離於主線通關之外，是專屬於你在周杰倫音樂時空中探詢並拼湊出的動人回憶。
              </div>

              {meta.unlockedDiaries.includes('上海一九四三') ? (
                <div className="p-4 rounded-xl bg-[#1a1714] border border-amber-900/60 shadow-md">
                  <span className="text-sm font-bold text-amber-300 font-serif">【篇章：上海一九四三】</span>
                  <p className="text-xs text-stone-300 mt-2 leading-relaxed font-serif">
                    泛黃的黑白照片裡，青石磚牆爬著青苔，那是泛舊的記憶信封。郵差按響了車鈴，時光倒流一甲子，留存著戰火年代下最溫柔的約定。
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-900 text-stone-600 text-xs italic">
                  未解鎖日記：？？？？？？？？？？？？
                </div>
              )}

              {meta.unlockedDiaries.includes('琴傷') ? (
                <div className="p-4 rounded-xl bg-[#1a1714] border border-amber-900/60 shadow-md">
                  <span className="text-sm font-bold text-amber-300 font-serif">【篇章：琴傷】</span>
                  <p className="text-xs text-stone-300 mt-2 leading-relaxed font-serif">
                    豬管家品嚐著燒肉粽，淚水落在了琴譜上。那是在威廉古堡歲月之前的故事，古典的柴可夫斯基旋律，在波浪翻滾中訴說著無盡的遺憾。
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-900 text-stone-600 text-xs italic">
                  未解鎖日記：？？？？？？？？？？？？
                </div>
              )}
            </div>
          )}

          {/* TAB: 歷代冒險日誌 */}
          {activeTab === 'history' && (
            <div className="flex flex-col lg:flex-row gap-4 h-full">
              {histories.length === 0 ? (
                <div className="w-full flex flex-col items-center justify-center p-12 text-center text-stone-500 gap-3 border border-dashed border-stone-800 rounded-2xl">
                  <span className="text-3xl">📜</span>
                  <span className="text-sm font-serif">尚無已完成的歷代冒險記錄</span>
                  <span className="text-xs text-stone-600">當前局結束（通關、行動力耗盡或決戰落敗）後，冒險日誌將自動歸檔於此。</span>
                </div>
              ) : (
                <>
                  {/* Left list of games */}
                  <div className="w-full lg:w-72 shrink-0 flex flex-col gap-2 max-h-[68vh] overflow-y-auto pr-2 border-b lg:border-b-0 lg:border-r border-stone-800 pb-3 lg:pb-0">
                    <span className="text-xs font-bold text-stone-400 font-mono">
                      遊玩紀錄（共 {histories.length} 局）
                    </span>
                    {histories.map((hist, idx) => {
                      const isSelected = idx === selectedHistoryIndex;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedHistoryIndex(idx)}
                          className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                            isSelected
                              ? 'bg-[#252219] border-amber-500/80 shadow-md text-amber-100'
                              : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:bg-stone-800/80'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm font-serif">
                              第 {hist.gameNumber} 局
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                                hist.outcomeType === 'VICTORY'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : hist.outcomeType === 'AP_DEPLETED'
                                  ? 'bg-rose-950/60 text-rose-300 border border-rose-800/40'
                                  : 'bg-stone-800 text-stone-400'
                              }`}
                            >
                              {hist.outcomeTitle}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-stone-400">
                            <span>{hist.characterIcon}</span>
                            <span>{hist.characterName}</span>
                            <span className="text-stone-600">・</span>
                            <span>至第 {hist.endRound} 回合</span>
                          </div>
                          <div className="text-[10px] text-stone-500 font-mono">
                            {hist.timestamp}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Right: Detailed Logs Viewer */}
                  {histories[selectedHistoryIndex] && (
                    <div className="flex-1 flex flex-col gap-3 min-w-0 h-full max-h-[68vh]">
                      <div className="bg-[#18181d] p-3.5 rounded-xl border border-stone-800 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{histories[selectedHistoryIndex].characterIcon}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-base font-black text-stone-100 font-serif">
                                第 {histories[selectedHistoryIndex].gameNumber} 局回顧：化身【{histories[selectedHistoryIndex].characterName}】
                              </span>
                            </div>
                            <span className="text-xs text-amber-400/80 font-sans">
                              {histories[selectedHistoryIndex].characterTitle}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-mono text-stone-400 bg-stone-900 px-3 py-1 rounded border border-stone-800">
                          結局：{histories[selectedHistoryIndex].outcomeTitle}
                        </span>
                      </div>

                      {/* Log stream */}
                      <div className="flex-1 overflow-y-auto bg-black/50 border border-stone-800/80 rounded-xl p-4 flex flex-col gap-2 font-sans text-xs">
                        {histories[selectedHistoryIndex].logs.map((log, lIdx) => (
                          <div
                            key={lIdx}
                            className={`p-2.5 rounded-lg border leading-relaxed flex items-start gap-2.5 ${
                              log.type === 'milestone'
                                ? 'bg-amber-950/25 border-amber-900/50 text-amber-200 font-medium'
                                : log.type === 'warning'
                                ? 'bg-red-950/25 border-red-900/50 text-red-300'
                                : log.type === 'draw'
                                ? 'bg-stone-900/70 border-stone-800 text-stone-300'
                                : 'bg-[#151518]/60 border-stone-800/50 text-stone-300'
                            }`}
                          >
                            <span className="text-stone-500 font-mono text-[10px] shrink-0 pt-0.5">
                              {log.round > 0 ? `第${log.round}回合` : '序章'}
                            </span>
                            <span className="flex-1">{log.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB 6: 傳奇通關殿堂與戰績結算 (記錄各路線花費局數回合，大滿貫結算與匯出) */}
          {activeTab === 'settlement' && (
            <div className="flex flex-col gap-4">
              {/* Macro Objective Banner */}
              <div className="bg-gradient-to-r from-[#1c170c] via-[#151209] to-[#0c0a06] border border-amber-600/50 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg sm:text-xl font-black text-amber-200 font-serif">
                      🏆 歷代主線通關戰績結算
                    </span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-mono font-bold">
                      PERFORMANCE METRICS
                    </span>
                  </div>
                  <p className="text-xs text-stone-300 font-sans leading-relaxed max-w-2xl">
                    在隨機抽卡與多周目輪迴中，<span className="text-amber-300 font-bold">「所花費的局數與回合」</span>是最終的核心成績依據！局數越少代表成績越好。請盡量避免行動力歸 0 導致失敗重生增加局數，在有限的歲月裡貫通所有樂章！
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="bg-black/60 border border-stone-800 rounded-xl p-3 text-center min-w-[90px]">
                    <div className="text-[10px] text-stone-400 font-mono">已通關路線</div>
                    <div className="text-lg font-black text-amber-300 font-mono mt-0.5">
                      {Object.keys(meta.routeVictoryRecords || {}).length} / 3
                    </div>
                  </div>
                  <div className="bg-black/60 border border-stone-800 rounded-xl p-3 text-center min-w-[90px]">
                    <div className="text-[10px] text-stone-400 font-mono">累計總局數</div>
                    <div className="text-lg font-black text-stone-200 font-mono mt-0.5">
                      {meta.pastGamesCount} 局
                    </div>
                  </div>
                </div>
              </div>

              {/* Three Core Routes Detailed Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {[
                  {
                    key: '太陽之子',
                    title: '☀️《太陽之子》路線',
                    desc: '於第 30 回合將軍宿命決戰中取得勝利，成為被光芒照耀的太陽之子。',
                    conditionHint: '將軍大決戰勝利',
                    badgeColor: 'border-amber-600/70 bg-amber-950/20',
                  },
                  {
                    key: '最偉大的作品',
                    title: '🎨《最偉大的作品》路線',
                    desc: '跨越時空狂瀾，集齊《杰倫》《范特西》《葉惠美》《跨時代》四大神級黃金專輯。',
                    conditionHint: '集齊四大黃金專輯',
                    badgeColor: 'border-yellow-600/70 bg-yellow-950/20',
                  },
                  {
                    key: '周杰倫家庭',
                    title: '🏠《周杰倫家庭》路線',
                    desc: '感應深厚的親情羈絆，集齊外婆、媽媽、爸爸、女兒殿下等全家族主題經典樂章。',
                    conditionHint: '全員親情樂章相聚',
                    badgeColor: 'border-rose-600/70 bg-rose-950/20',
                  },
                ].map((route) => {
                  const rec = meta.routeVictoryRecords?.[route.key];

                  return (
                    <div
                      key={route.key}
                      className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 shadow-md transition-all ${
                        rec
                          ? `${route.badgeColor} border-amber-500/70`
                          : 'bg-[#101014] border-stone-800/80 text-stone-500'
                      }`}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black font-serif text-white">
                            {rec ? (
                              route.title
                            ) : (
                              <span className="text-stone-300">
                                <span className="text-white font-black">？</span> ？？？？？？？？
                              </span>
                            )}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                              rec
                                ? 'bg-amber-500 text-stone-950 font-black'
                                : 'bg-stone-900 text-stone-500 border border-stone-800'
                            }`}
                          >
                            {rec ? '★ 已通關' : '未解鎖'}
                          </span>
                        </div>

                        <p className="text-xs text-stone-300/80 font-sans leading-relaxed">
                          {rec ? route.desc : '？？？？？？？？？？？？？？？？？？？？？？？？'}
                        </p>
                      </div>

                      {/* Record Details or Locked Prompt */}
                      {rec ? (
                        <div className="bg-black/60 border border-amber-900/60 rounded-xl p-3 flex flex-col gap-1.5 text-xs font-mono">
                          <div className="flex items-center justify-between text-stone-300">
                            <span>命運結算：</span>
                            <span className="text-amber-300 font-bold">
                              經歷 {rec.gameNumber} 局 {rec.round} 回合
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-stone-400 text-[11px]">
                            <span>累計總耗時：</span>
                            <span>{rec.totalRounds} 總消耗回合</span>
                          </div>
                          <div className="flex items-center justify-between text-stone-400 text-[11px]">
                            <span>通關化身：</span>
                            <span className="text-stone-200">{rec.characterName}</span>
                          </div>
                          <div className="flex items-center justify-between text-stone-400 text-[11px] pt-1 border-t border-stone-800">
                            <span>通關日期：</span>
                            <span>{rec.timestamp}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-black/30 border border-stone-800/60 rounded-xl p-3 text-center text-xs text-stone-500 font-sans font-mono tracking-wider">
                          ✦ 尚未通關此路線（條件：？？？？）
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Grand Slam Section & Export Bar */}
              {(() => {
                const totalCleared = Object.keys(meta.routeVictoryRecords || {}).length;
                const isGrandSlam = totalCleared >= 3;
                const recordsList: RouteVictoryRecord[] = Object.values(
                  meta.routeVictoryRecords || {}
                );
                const bestGame = Math.max(
                  ...(recordsList.length > 0 ? recordsList.map((r) => r.gameNumber) : [1]),
                  meta.pastGamesCount || 1
                );
                const grade = getSettlementGrade(bestGame);

                const currentSettlementData: SettlementData = {
                  route: isGrandSlam ? '全路線大滿貫' : (Object.keys(meta.routeVictoryRecords || {})[0] || '冒險結算'),
                  gameNumber: meta.pastGamesCount || 1,
                  round: gameState.round,
                  totalRounds: meta.totalRoundsPlayed || gameState.round,
                  characterName: gameState.character?.name || '未知',
                  allRecords: meta.routeVictoryRecords,
                  isAllCompleted: isGrandSlam,
                };

                return (
                  <div className="w-full bg-[#15141b] border-2 border-[#d4af37]/60 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
                      <div>
                        <h3 className="text-base font-black text-amber-200 font-serif flex items-center gap-2">
                          <span>{isGrandSlam ? '👑' : '📜'}</span>
                          <span>
                            {isGrandSlam
                              ? '周杰倫音樂宇宙・全路線大滿貫總結算'
                              : '當前冒險戰績與通關進度'}
                          </span>
                        </h3>
                        <p className="text-xs text-stone-400 mt-1 font-sans">
                          {isGrandSlam
                            ? '恭喜你！已解開周杰倫宇宙的全部通關路線，隨時可匯出專屬傳奇戰報圖卡！'
                            : `目前已完成 ${totalCleared} / 3 條主線，繼續探索解鎖全通關大滿貫！`}
                        </p>
                      </div>

                      {/* Export Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          id="export-hall-img-btn"
                          disabled={totalCleared === 0}
                          onClick={() => downloadSettlementImage(currentSettlementData)}
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 via-[#d4af37] to-amber-500 text-stone-950 font-bold text-xs hover:brightness-110 shadow-md cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 active:scale-98"
                          title="另存或匯出高畫質戰報圖卡 (PNG)"
                        >
                          <span>📷</span>
                          <span>{isGrandSlam ? '另存大滿貫圖卡 (PNG)' : '另存戰績圖卡 (PNG)'}</span>
                        </button>

                        <button
                          id="export-hall-text-btn"
                          disabled={totalCleared === 0}
                          onClick={async () => {
                            const success = await copySettlementToClipboard(currentSettlementData);
                            if (success) {
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2500);
                            }
                          }}
                          className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs border border-stone-700 shadow-md cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 active:scale-98"
                          title="複製結算戰報文字"
                        >
                          <span>{copied ? '✅' : '📋'}</span>
                          <span>{copied ? '戰報已複製！' : '複製結算戰報'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Grand Slam Detailed Breakdown with Overall Grade */}
                    {isGrandSlam ? (
                      <div className="flex flex-col gap-3">
                        {/* Overall Grand Slam Grade Box */}
                        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/50 via-black/70 to-amber-950/50 border border-amber-500/60 flex flex-col sm:flex-row items-center gap-4">
                          <div className="flex flex-col items-center justify-center px-4 py-2 bg-black/80 rounded-xl border border-amber-500/50 shrink-0 min-w-[96px]">
                            <span className="text-3xl font-black" style={{ color: grade.color }}>
                              {grade.grade}
                            </span>
                            <span className="text-[10px] text-stone-400 font-mono">全通關總評級</span>
                          </div>
                          <div className="flex-1 text-center sm:text-left">
                            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                              <span className="text-base font-black font-serif" style={{ color: grade.color }}>
                                【{grade.title}】
                              </span>
                              <span className="text-[11px] font-mono text-amber-300 font-bold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60">
                                共花費 {bestGame} 局・累計 {meta.totalRoundsPlayed || gameState.round} 回合
                              </span>
                            </div>
                            <p className="text-xs text-stone-300 mt-1">{grade.desc}</p>
                          </div>
                        </div>

                        {/* Three Route Cards Summary */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                          <div className="bg-black/50 border border-stone-800 p-3 rounded-xl">
                            <span className="text-stone-400">☀️ 太陽之子主線</span>
                            <div className="text-amber-300 font-bold mt-1 text-sm">
                              經歷 {meta.routeVictoryRecords?.['太陽之子']?.gameNumber} 局 {meta.routeVictoryRecords?.['太陽之子']?.round} 回合
                            </div>
                          </div>
                          <div className="bg-black/50 border border-stone-800 p-3 rounded-xl">
                            <span className="text-stone-400">🎨 最偉大的作品主線</span>
                            <div className="text-amber-300 font-bold mt-1 text-sm">
                              經歷 {meta.routeVictoryRecords?.['最偉大的作品']?.gameNumber} 局 {meta.routeVictoryRecords?.['最偉大的作品']?.round} 回合
                            </div>
                          </div>
                          <div className="bg-black/50 border border-stone-800 p-3 rounded-xl">
                            <span className="text-stone-400">🏠 周杰倫家庭主線</span>
                            <div className="text-amber-300 font-bold mt-1 text-sm">
                              經歷 {meta.routeVictoryRecords?.['周杰倫家庭']?.gameNumber} 局 {meta.routeVictoryRecords?.['周杰倫家庭']?.round} 回合
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-stone-400 bg-black/40 border border-stone-800 p-3.5 rounded-xl leading-relaxed">
                        <div>💡 提示：本遊戲設定為隨機抽卡探索，難以單局一次完成所有主線。請善用<span className="text-amber-300 font-bold">"道具"</span>封存關鍵物品、並利用<span className="text-amber-300 font-bold">成就能力</span>，在每局中維持行動力、慎選卡牌。</div>
                        <div className="mt-1 text-stone-400">
                          <span className="text-amber-300 font-bold">
                            【全路線綜合評級門檻：S 級（≤ 6 局）、A 級（7~10 局）、B 級（11~15 局）、C 級（16~20 局）、D 級（≥ 21 局）】
                          </span>
                          將在 3 條主線全數通關達成大滿貫後正式結算評定（目前進度：{totalCleared} / 3）！
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
