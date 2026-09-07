import React, { useState, useMemo } from 'react';
import { MetaProgress, GameState } from '../types';
import { CARD_DATABASE } from '../data/cards';
import { ALL_ACHIEVEMENTS } from '../data/achievements';
import { ALBUM_LIST } from '../data/albums';

interface CompendiumModalProps {
  meta: MetaProgress;
  gameState: GameState;
  onClose: () => void;
  onStoreInIronBox?: (itemName: string) => void;
  onTakeFromIronBox?: (itemName: string) => void;
  onToggleSkill?: (skillId: string) => void;
  onResetMeta?: () => void;
}

export const CompendiumModal: React.FC<CompendiumModalProps> = ({
  meta,
  gameState,
  onClose,
  onStoreInIronBox,
  onTakeFromIronBox,
  onToggleSkill,
  onResetMeta,
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
      return trackA - trackB;
    });
  }, [albumOrderMap]);

  // Check if player has ever unlocked Peninsula Iron Box (strictly hide tab if not yet unlocked)
  const isIronBoxUnlocked = Boolean(
    meta.ironBoxUnlocked ||
    meta.unlockedCardIds.includes('C2002-02') ||
    Boolean(gameState.inventory['半島鐵盒']) ||
    meta.ironBoxItems.length > 0
  );

  const [activeTab, setActiveTab] = useState<'cards' | 'achievements' | 'diaries' | 'ironbox'>('cards');

  const activeSkills = meta.activeSkills || [];

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
            {onResetMeta && (
              <button
                onClick={() => {
                  if (window.confirm('確定要清空全域圖鑑與成就進度（重置回 0 張）嗎？此動作無法復原。')) {
                    onResetMeta();
                  }
                }}
                className="text-stone-400 hover:text-red-300 text-xs px-2.5 py-1.5 rounded-lg bg-stone-900/90 hover:bg-red-950/30 border border-stone-800 hover:border-red-900/60 cursor-pointer transition-colors"
                title="重置全域存檔為0"
              >
                重置圖鑑(歸零)
              </button>
            )}
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

          {/* 半島鐵盒：取得前絕對隱藏，取得後才顯現 */}
          {isIronBoxUnlocked && (
            <button
              onClick={() => setActiveTab('ironbox')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'ironbox'
                  ? 'bg-purple-700 text-white font-black shadow-md'
                  : 'text-purple-300 hover:text-white bg-purple-950/40 border border-purple-900/60'
              }`}
            >
              半島鐵盒 ({meta.ironBoxItems.length}/3)
            </button>
          )}
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
                    className={`p-3 rounded-xl border flex flex-col justify-between h-24 transition-all ${
                      unlocked
                        ? 'bg-[#18171d] border-amber-900/60 text-stone-200 shadow-sm'
                        : 'bg-[#0d0d10] border-stone-900/90 text-stone-600'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-1">
                      <span className="text-xs font-bold truncate font-serif">
                        {unlocked ? card.name : '？？？？'}
                      </span>
                      <span className="text-[9px] font-mono px-1 rounded bg-black/40 text-stone-400 shrink-0">
                        {card.album}
                      </span>
                    </div>

                    <div className="flex justify-between items-end text-[10px] text-stone-500 font-mono">
                      <span>{card.id}</span>
                      <span className={unlocked ? 'text-amber-400/90' : 'text-stone-600'}>
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
                  未解鎖日記：尋找《范特西》中的泛黃記憶（上海一九四三）
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
                  未解鎖日記：威廉古堡豬管家的前世心結（給予療傷燒肉粽解鎖《琴傷》）
                </div>
              )}
            </div>
          )}

          {/* TAB 4: 半島鐵盒 (僅在取得後可見) */}
          {activeTab === 'ironbox' && isIronBoxUnlocked && (
            <div className="flex flex-col gap-4 max-w-3xl mx-auto">
              <div className="text-xs text-purple-200 bg-purple-950/40 p-3.5 rounded-xl border border-purple-900/60 leading-relaxed">
                【半島鐵盒跨局保險箱】：放入此鐵盒的物品，在局數重開或結算時絕不遺失，將在下一局（NG）開局時直接放入行囊繼承（最多封存 3 件）。
              </div>

              {/* Stored Items in Iron Box */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-stone-300">鐵盒已存放物品（{meta.ironBoxItems.length} / 3）：</span>
                {meta.ironBoxItems.length === 0 ? (
                  <div className="text-xs text-stone-600 italic p-4 border border-dashed border-stone-800 rounded-lg">
                    鐵盒內尚無封存物品，可從當前行囊放入。
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {meta.ironBoxItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-purple-950/60 border border-purple-700/80 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs text-purple-100 font-bold"
                      >
                        <span>📦 {item}</span>
                        <button
                          onClick={() => onTakeFromIronBox?.(item)}
                          className="text-[10px] text-stone-400 hover:text-red-400 cursor-pointer ml-1"
                        >
                          取出
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Store from current inventory */}
              <div className="mt-3 flex flex-col gap-2 border-t border-stone-800 pt-3">
                <span className="text-xs font-bold text-stone-300">從當前行囊放入鐵盒：</span>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(gameState.inventory)
                    .filter(([_, count]) => Number(count) > 0)
                    .map(([name]) => (
                      <button
                        key={name}
                        disabled={meta.ironBoxItems.length >= 3}
                        onClick={() => onStoreInIronBox?.(name)}
                        className="text-xs bg-stone-900 hover:bg-purple-900 text-stone-300 hover:text-white border border-stone-800 hover:border-purple-600 px-3 py-1.5 rounded-lg transition-all cursor-pointer disabled:opacity-40"
                      >
                        + 放入【{name}】
                      </button>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
