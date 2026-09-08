import React, { useState, useMemo } from 'react';
import { CARD_DATABASE } from '../data/cards';
import { ALL_CHARACTERS } from '../data/characters';
import { CardDefinition } from '../types';
import { CharacterAvatarIcon } from './CharacterAvatarIcon';

interface DevModalProps {
  currentRound: number;
  currentGameNumber: number;
  currentAp: number;
  onClose: () => void;
  onForceDrawCard: (card: CardDefinition) => void;
  onAddItem: (itemName: string) => void;
  onAddMultipleItems: (items: string[]) => void;
  onClearInventory: () => void;
  onChangeCharacter: (characterId: string) => void;
  onSetRoundAndGame: (round: number, gameNumber: number) => void;
  onSetAp: (ap: number) => void;
  onTriggerBoss: () => void;
  onTriggerVictory: (type: '太陽之子' | '最偉大的作品' | '周杰倫家庭') => void;
  onTriggerGrandSlam: () => void;
  onUnlockAllSongs: () => void;
  onUnlockAllAchievements: () => void;
  onClearHallOfFame?: () => void;
  onTestDrawChopin?: () => void;
}

export const DevModal: React.FC<DevModalProps> = ({
  currentRound,
  currentGameNumber,
  currentAp,
  onClose,
  onForceDrawCard,
  onAddItem,
  onAddMultipleItems,
  onClearInventory,
  onChangeCharacter,
  onSetRoundAndGame,
  onSetAp,
  onTriggerBoss,
  onTriggerVictory,
  onTriggerGrandSlam,
  onUnlockAllSongs,
  onUnlockAllAchievements,
  onClearHallOfFame,
  onTestDrawChopin,
}) => {
  const [filterType, setFilterType] = useState<string>('全部');
  const [search, setSearch] = useState<string>('');
  const [roundInput, setRoundInput] = useState<number>(currentRound);
  const [gameInput, setGameInput] = useState<number>(currentGameNumber);
  const [confirmClearHall, setConfirmClearHall] = useState<boolean>(false);

  // 1. 嚴格按照「發行年份 (Year) ➔ 曲目 (Track) ➔ 卡牌編號 (ID)」進行排序
  const sortedCards = useMemo(() => {
    return [...CARD_DATABASE].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      const trackA = Number(a.track) || 0;
      const trackB = Number(b.track) || 0;
      if (trackA !== trackB) return trackA - trackB;
      return a.id.localeCompare(b.id, undefined, { numeric: true });
    });
  }, []);

  const filteredCards = useMemo(() => {
    return sortedCards.filter((card) => {
      if (filterType !== '全部' && card.type !== filterType) return false;
      if (search && !card.name.includes(search) && !card.album.includes(search) && !card.id.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [sortedCards, filterType, search]);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#141214] border-2 border-red-800/80 rounded-2xl p-4 sm:p-5 shadow-[0_0_50px_rgba(220,38,38,0.25)] flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-red-900/60 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-red-400 font-mono tracking-wider flex items-center gap-1.5">
              <span>🔧</span>
              <span>開發者測試控制台 (DEV MODE)</span>
            </span>
            <span className="hidden sm:inline text-xs text-stone-400">
              專為測試任意卡牌效果、跳選數值、評級與分歧而設
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 cursor-pointer font-bold"
          >
            關閉 ✕
          </button>
        </div>

        {/* Top Scrollable Controls Area */}
        <div className="overflow-y-auto max-h-[46vh] pr-1 flex flex-col gap-3 py-3 border-b border-stone-800">
          {/* Section 0: 全通關評級門檻指標 */}
          <div className="bg-amber-950/25 border border-amber-500/40 rounded-xl p-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-amber-300 font-bold font-serif">
              <span>📊</span>
              <span>全路線大滿貫・綜合評級門檻標準：</span>
            </div>
            <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
              <span className="bg-amber-500 text-stone-950 px-2 py-0.5 rounded font-black shadow-sm">
                S 級 ≤ 6 局
              </span>
              <span className="bg-amber-900/60 text-amber-200 border border-amber-700/60 px-2 py-0.5 rounded font-bold">
                A 級 7~10 局
              </span>
              <span className="bg-stone-900 text-stone-300 border border-stone-700 px-2 py-0.5 rounded">
                B 級 11~15 局
              </span>
              <span className="bg-stone-900 text-stone-400 border border-stone-800 px-2 py-0.5 rounded">
                C 級 16~20 局
              </span>
              <span className="bg-stone-900 text-stone-500 border border-stone-800 px-2 py-0.5 rounded">
                D 級 ≥ 21 局
              </span>
            </div>
          </div>

          {/* Section 1: 直接通關與決戰捷徑 */}
          <div className="bg-black/50 border border-stone-800/90 rounded-xl p-3 flex flex-col gap-2">
            <div className="text-[11px] font-bold text-amber-300/90 flex items-center justify-between">
              <span>🏆 傳奇主線與大滿貫捷徑（點擊直接觸發結算並關閉）</span>
              <span className="text-[10px] text-stone-500 font-mono">觸發後即自動關閉控制台</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  onClose();
                  onTriggerGrandSlam();
                }}
                className="text-xs bg-gradient-to-r from-amber-600 via-[#d4af37] to-amber-500 hover:brightness-110 text-stone-950 px-3 py-1.5 rounded-lg cursor-pointer font-black shadow-md flex items-center gap-1"
                title="立即將三條主線寫入通關紀錄並直接展示全路線大滿貫結算！"
              >
                <span>👑</span>
                <span>直接達成【全路線大滿貫】終極結算</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  onTriggerBoss();
                }}
                className="text-xs bg-red-950 hover:bg-red-800 text-red-200 border border-red-700 px-3 py-1.5 rounded-lg cursor-pointer font-bold flex items-center gap-1"
              >
                <span>⚡</span>
                <span>直跳第30回合決戰【將軍】</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  onTriggerVictory('太陽之子');
                }}
                className="text-xs bg-amber-950 hover:bg-amber-800 text-amber-200 border border-amber-700 px-3 py-1.5 rounded-lg cursor-pointer font-bold"
              >
                ☀️ 達成《太陽之子》通關
              </button>
              <button
                onClick={() => {
                  onClose();
                  onTriggerVictory('最偉大的作品');
                }}
                className="text-xs bg-purple-950 hover:bg-purple-800 text-purple-200 border border-purple-700 px-3 py-1.5 rounded-lg cursor-pointer font-bold"
              >
                🎨 達成《最偉大的作品》通關
              </button>
              <button
                onClick={() => {
                  onClose();
                  onTriggerVictory('周杰倫家庭');
                }}
                className="text-xs bg-rose-950 hover:bg-rose-800 text-rose-200 border border-rose-700 px-3 py-1.5 rounded-lg cursor-pointer font-bold"
              >
                🏠 達成《周杰倫家庭》通關
              </button>
              {onTestDrawChopin && (
                <button
                  onClick={() => {
                    onClose();
                    onTestDrawChopin();
                  }}
                  className="text-xs bg-yellow-950/80 hover:bg-yellow-800 text-yellow-200 border border-yellow-600 px-3 py-1.5 rounded-lg cursor-pointer font-bold flex items-center gap-1 shadow-sm"
                >
                  <span>✨</span>
                  <span>測試抽中【11月的蕭邦】(SS特效)</span>
                </button>
              )}
            </div>
          </div>

          {/* Section 2: 回合與局數跳選（方便測試大滿貫評級與回合跳轉） */}
          <div className="bg-black/50 border border-stone-800/90 rounded-xl p-3 flex flex-col gap-2.5">
            <div className="text-[11px] font-bold text-sky-300 flex items-center justify-between">
              <span>⏳ 回合與局數自訂跳選（用以測試 S/A/B/C/D 評級與特定回合事件）</span>
              <span className="text-[10px] text-stone-400 font-mono">
                當前狀態：第 {currentRound} 回合 / 第 {currentGameNumber} 局
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Input: Round */}
              <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-800 px-2.5 py-1.5 rounded-lg text-xs">
                <span className="text-stone-400 font-bold">跳轉回合:</span>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={roundInput}
                  onChange={(e) => setRoundInput(Math.min(30, Math.max(1, Number(e.target.value) || 1)))}
                  className="w-14 bg-black border border-stone-700 text-amber-300 font-mono font-bold px-1.5 py-0.5 rounded text-center focus:outline-none focus:border-amber-500"
                />
                <span className="text-stone-500 text-[10px]">/ 30</span>
              </div>

              {/* Input: Game Number */}
              <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-800 px-2.5 py-1.5 rounded-lg text-xs">
                <span className="text-stone-400 font-bold">設定局數:</span>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={gameInput}
                  onChange={(e) => setGameInput(Math.min(99, Math.max(1, Number(e.target.value) || 1)))}
                  className="w-14 bg-black border border-stone-700 text-amber-300 font-mono font-bold px-1.5 py-0.5 rounded text-center focus:outline-none focus:border-amber-500"
                />
                <span className="text-stone-500 text-[10px]">局</span>
              </div>

              {/* Apply Button */}
              <button
                onClick={() => {
                  onSetRoundAndGame(roundInput, gameInput);
                }}
                className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs cursor-pointer shadow-md flex items-center gap-1 active:scale-95 transition-all"
                title="套用當前輸入的回合與局數（不關閉控制台）"
              >
                <span>⚡</span>
                <span>套用</span>
              </button>
            </div>
          </div>

          {/* Section 3: 角色切換（改為清晰排版，不再被截斷） */}
          <div className="bg-black/50 border border-stone-800/90 rounded-xl p-3 flex flex-col gap-2">
            <div className="text-[11px] font-bold text-stone-300 flex items-center justify-between">
              <span>👤 角色化身切換（點擊直接切換並關閉）</span>
              <span className="text-[10px] text-stone-500 font-mono">共 {ALL_CHARACTERS.length} 位化身可選</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {ALL_CHARACTERS.map((char) => (
                <button
                  key={char.id}
                  onClick={() => {
                    onClose();
                    onChangeCharacter(char.id);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 hover:border-amber-500/70 text-xs font-sans cursor-pointer flex items-center gap-1.5 transition-all text-left truncate"
                >
                  <div className="shrink-0 flex items-center justify-center">
                    <CharacterAvatarIcon character={char} size="sm" />
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="font-bold truncate">{char.name}</span>
                    <span className="text-[10px] text-stone-400 truncate">{char.title.split('・')[0]}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: 體力 AP 調控 & 全域成就/圖鑑一鍵解鎖 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* AP 體力調控 */}
            <div className="bg-black/50 border border-stone-800/90 rounded-xl p-3 flex flex-col gap-2">
              <div className="text-[11px] font-bold text-rose-300 flex items-center justify-between">
                <span>❤️ AP 體力調控 (當前: {currentAp})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => {
                    onClose();
                    onSetAp(30);
                  }}
                  className="px-2.5 py-1 rounded bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-700 text-xs font-bold cursor-pointer"
                >
                  滿血 (AP 30)
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onSetAp(1);
                  }}
                  className="px-2.5 py-1 rounded bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-700 text-xs font-bold cursor-pointer"
                >
                  瀕死 (AP 1)
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onSetAp(0);
                  }}
                  className="px-2.5 py-1 rounded bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-700 text-xs font-bold cursor-pointer"
                  title="觸發體力耗盡重開局罰則"
                >
                  力竭 (AP 0)
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onSetAp(Math.min(30, currentAp + 10));
                  }}
                  className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs cursor-pointer"
                >
                  +10 AP
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onSetAp(Math.max(0, currentAp - 5));
                  }}
                  className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs cursor-pointer"
                >
                  -5 AP
                </button>
              </div>
            </div>

            {/* 一鍵解鎖圖鑑與成就 */}
            <div className="bg-black/50 border border-stone-800/90 rounded-xl p-3 flex flex-col gap-2">
              <div className="text-[11px] font-bold text-amber-300 flex items-center justify-between">
                <span>📚 全域進度輔助</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => {
                    onClose();
                    onUnlockAllSongs();
                  }}
                  className="px-2.5 py-1 rounded bg-amber-950/60 hover:bg-amber-900 text-amber-200 border border-amber-800 text-xs font-bold cursor-pointer flex items-center gap-1"
                >
                  <span>🎵</span>
                  <span>全解鎖 63 首歌曲圖鑑</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onUnlockAllAchievements();
                  }}
                  className="px-2.5 py-1 rounded bg-purple-950/60 hover:bg-purple-900 text-purple-200 border border-purple-800 text-xs font-bold cursor-pointer flex items-center gap-1"
                >
                  <span>🏅</span>
                  <span>全解鎖 9 大傳奇成就</span>
                </button>

                {onClearHallOfFame && (
                  confirmClearHall ? (
                    <div className="flex items-center gap-1 bg-red-950/80 border border-red-600 px-2 py-0.5 rounded">
                      <span className="text-[11px] text-red-200 font-bold">確定清空殿堂？</span>
                      <button
                        onClick={() => {
                          setConfirmClearHall(false);
                          onClearHallOfFame();
                        }}
                        className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] cursor-pointer"
                      >
                        確定清空
                      </button>
                      <button
                        onClick={() => setConfirmClearHall(false)}
                        className="px-1.5 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] cursor-pointer"
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmClearHall(true)}
                      className="px-2.5 py-1 rounded bg-red-950/50 hover:bg-red-900/80 text-red-300 border border-red-800 text-xs font-bold cursor-pointer flex items-center gap-1"
                      title="僅供開發者測試使用：清空傳奇殿堂的所有歷史評級戰績卡"
                    >
                      <span>🏛️</span>
                      <span>清空傳奇殿堂戰績卡</span>
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Section 5: 關鍵物套裝一鍵注入 */}
          <div className="bg-black/50 border border-stone-800/90 rounded-xl p-3 flex flex-col gap-2">
            <div className="text-[11px] font-bold text-stone-300 flex items-center justify-between">
              <span>🎒 快速獲取關鍵套裝與道具</span>
              <button
                onClick={() => {
                  onClose();
                  onClearInventory();
                }}
                className="text-[10px] text-red-400 hover:text-red-300 underline cursor-pointer"
              >
                清空背包物品
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => {
                  onClose();
                  onAddMultipleItems(['杰倫', '范特西', '葉惠美', '跨時代']);
                }}
                className="px-2 py-1 rounded bg-yellow-950/50 hover:bg-yellow-900/70 text-yellow-200 border border-yellow-800/70 text-xs font-bold cursor-pointer"
                title="獲取四大SS黃金專輯卡"
              >
                +【四大黃金專輯全套】
              </button>
              <button
                onClick={() => {
                  onClose();
                  onAddMultipleItems(['外婆', '聽媽媽的話', '爸我回來了', '爺爺泡的茶', '女兒殿下']);
                }}
                className="px-2 py-1 rounded bg-rose-950/50 hover:bg-rose-900/70 text-rose-200 border border-rose-800/70 text-xs font-bold cursor-pointer"
                title="獲取親情路線全套樂章"
              >
                +【親情全員樂章套裝】
              </button>
              <button
                onClick={() => {
                  onClose();
                  onAddMultipleItems(['半島鐵盒', '時光機', '反方向的鐘']);
                }}
                className="px-2 py-1 rounded bg-purple-950/50 hover:bg-purple-900/70 text-purple-200 border border-purple-800/70 text-xs font-bold cursor-pointer"
                title="獲取時空神具套裝"
              >
                +【時空神器三件套】
              </button>
              {['雙刀', '雙截棍', '無雙', '鞋子特大號', '療傷燒肉粽', '紅模仿'].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    onClose();
                    onAddItem(item);
                  }}
                  className="px-2 py-1 rounded bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs cursor-pointer"
                >
                  +{item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section: 卡片強制翻開（依發行年分與曲目序嚴格排序） */}
        <div className="flex flex-col flex-1 overflow-hidden pt-3 gap-2">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="搜尋曲名、專輯或編號 (如 C2000-01)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-red-600"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1.5 text-stone-400 hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex gap-1 text-xs shrink-0 overflow-x-auto">
              {['全部', '遭遇', '物品', '事件', '線索', '日記'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                    filterType === t
                      ? 'bg-red-700 text-white font-bold'
                      : 'bg-stone-900 text-stone-400 hover:bg-stone-800'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-stone-400 flex items-center justify-between px-1">
            <span>
              已按「發行年份 ➔ 曲目順序」排序（共 {filteredCards.length} / {CARD_DATABASE.length} 張卡牌）
            </span>
            <span className="text-amber-400/90 font-mono text-[10px]">
              點擊直接於當前局翻開並執行
            </span>
          </div>

          {/* Cards Grid */}
          <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
            {filteredCards.map((card) => (
              <div
                key={card.id}
                className="p-2.5 rounded-xl bg-[#0f0e11] border border-stone-800 hover:border-red-700/60 flex flex-col justify-between transition-colors shadow-sm"
              >
                <div>
                  <div className="flex justify-between items-start gap-1">
                    <span className="font-bold text-stone-200 truncate">{card.name}</span>
                    <span className="text-[10px] text-amber-400 font-mono px-1 rounded bg-stone-900 shrink-0">
                      {card.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-stone-500 font-mono mt-1">
                    <span className="truncate">{card.album}</span>
                    <span className="text-stone-400 font-bold ml-1">{card.id}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onForceDrawCard(card);
                  }}
                  className="mt-2 w-full py-1 bg-red-950/80 hover:bg-red-800 text-red-200 border border-red-800/80 rounded text-[11px] font-bold cursor-pointer transition-colors"
                >
                  ⚡ 強制翻開抽取此卡
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
