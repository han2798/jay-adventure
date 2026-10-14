import React, { useState, useMemo } from 'react';
import { CARD_DATABASE } from '../data/cards';
import { ALL_CHARACTERS } from '../data/characters';
import { CardDefinition } from '../types';
import { CharacterAvatarIcon } from './CharacterAvatarIcon';
import { GoldCoinIcon } from './GoldCoinIcon';
import { NinjaIcon } from './NinjaIcon';
import { ShovelIcon } from './ShovelIcon';
import { NunchakuIcon } from './NunchakuIcon';

interface DevModalProps {
  currentRound: number;
  currentGameNumber: number;
  currentAp: number;
  currentCharacterId?: string;
  inventory?: Record<string, number>;
  onClose: () => void;
  onForceDrawCard: (card: CardDefinition) => void;
  onAddItem: (itemName: string) => void;
  onRemoveItem?: (itemName: string) => void;
  onToggleItem?: (itemName: string, defaultCount?: number) => void;
  onSetItemCount?: (itemName: string, count: number) => void;
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
  isChaosEraActive?: boolean;
  onToggleChaosEra?: (active: boolean) => void;
  isNinjaChasing?: boolean;
  onToggleNinjaChase?: (active: boolean) => void;
  isFireworksBurning?: boolean;
  onToggleFireworks?: (active: boolean) => void;
  isBlacksmithUnlocked?: boolean;
  onToggleBlacksmith?: (active: boolean) => void;
  isGoldTownUnlocked?: boolean;
  onToggleGoldTown?: (active: boolean) => void;
  isTerraceUnlocked?: boolean;
  onToggleTerrace?: (active: boolean) => void;
  onFastMatureTerrace?: (crop?: 'tea' | 'flower_sea') => void;
  isRomanticPhoneUnlocked?: boolean;
  onToggleRomanticPhone?: (active: boolean) => void;
  isHeadacheActive?: boolean;
  onToggleHeadache?: (active: boolean) => void;
  isRainyWeatherActive?: boolean;
  onToggleRainyWeather?: (active: boolean) => void;
  onFastForwardRainRounds?: () => void;
  onFastForwardRainNight?: () => void;
  currentCoins?: number;
  onSetCoins?: (coins: number) => void;
}

export const DevModal: React.FC<DevModalProps> = ({
  currentRound,
  currentGameNumber,
  currentAp,
  currentCharacterId,
  inventory = {},
  onClose,
  onForceDrawCard,
  onAddItem,
  onRemoveItem,
  onToggleItem,
  onSetItemCount,
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
  isChaosEraActive = false,
  onToggleChaosEra,
  isNinjaChasing = false,
  onToggleNinjaChase,
  isFireworksBurning = false,
  onToggleFireworks,
  isBlacksmithUnlocked = false,
  onToggleBlacksmith,
  isGoldTownUnlocked = false,
  onToggleGoldTown,
  isTerraceUnlocked = false,
  onToggleTerrace,
  onFastMatureTerrace,
  isRomanticPhoneUnlocked = false,
  onToggleRomanticPhone,
  isHeadacheActive = false,
  onToggleHeadache,
  isRainyWeatherActive = false,
  onToggleRainyWeather,
  onFastForwardRainRounds,
  onFastForwardRainNight,
  currentCoins = 0,
  onSetCoins,
}) => {
  const [filterType, setFilterType] = useState<string>('全部');
  const [search, setSearch] = useState<string>('');

  const RECENT_SEARCHES_KEY = 'jay_chou_rpg_dev_recent_searches';
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.slice(0, 5);
      }
    } catch {
      // fallback
    }
    return ['米蘭的小鐵匠', '印地安老斑鳩', '麥芽糖', '甜甜的', '稻香'];
  });

  const addRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const next = [trimmed, ...prev.filter((item) => item !== trimmed)].slice(0, 5);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const [roundInput, setRoundInput] = useState<number>(currentRound);
  const [gameInput, setGameInput] = useState<number>(currentGameNumber);
  const [confirmClearHall, setConfirmClearHall] = useState<boolean>(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // 提示訊息計時器
  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => {
      setActionFeedback((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  // 檢查物品是否持有與數量
  const isHeld = (item: string) => Boolean(inventory[item] && inventory[item] > 0);
  const getCount = (item: string) => inventory[item] || 0;

  const toggleItem = (item: string, defaultCount: number = 1) => {
    if (onToggleItem) {
      onToggleItem(item, defaultCount);
      const willBeActive = !isHeld(item);
      showFeedback(willBeActive ? `已開啟【${item}】${defaultCount > 1 ? ` (x${defaultCount})` : ''}` : `已關閉/移除【${item}】`);
    } else if (isHeld(item)) {
      if (onRemoveItem) onRemoveItem(item);
      else if (onSetItemCount) onSetItemCount(item, 0);
      showFeedback(`已關閉/移除【${item}】`);
    } else {
      onAddItem(item);
      showFeedback(`已開啟【${item}】`);
    }
  };

  const adjustItemCount = (item: string, delta: number) => {
    const current = getCount(item);
    const nextCount = Math.max(0, current + delta);
    if (onSetItemCount) {
      onSetItemCount(item, nextCount);
      showFeedback(`【${item}】數量調整為 ${nextCount}`);
    } else if (delta > 0) {
      onAddItem(item);
      showFeedback(`【${item}】增加至 ${current + 1}`);
    } else if (delta < 0 && onRemoveItem && nextCount === 0) {
      onRemoveItem(item);
      showFeedback(`已清空【${item}】`);
    }
  };

  // 套裝開關判定
  const isAlbumHeld = (name: string) => Boolean(inventory[name] || inventory[name.replace(/[《》]/g, '')]);
  const hasAllAlbums = ['《杰倫》', '《范特西》', '《葉惠美》', '《跨時代》'].every(isAlbumHeld);
  const toggleAlbumsSet = () => {
    if (hasAllAlbums) {
      ['《杰倫》', '《范特西》', '《葉惠美》', '《跨時代》', '杰倫', '范特西', '葉惠美', '跨時代'].forEach((it) => {
        if (inventory[it]) {
          onRemoveItem ? onRemoveItem(it) : onSetItemCount ? onSetItemCount(it, 0) : null;
        }
      });
      showFeedback('已關閉/卸除【四大黃金專輯全套】');
    } else {
      onAddMultipleItems(['《杰倫》', '《范特西》', '《葉惠美》', '《跨時代》', '杰倫', '范特西', '葉惠美', '跨時代']);
      showFeedback('已開啟【四大黃金專輯全套】（達成《最偉大的作品》必備）');
    }
  };

  const familyList = ['以父之名', '《葉惠美》', '外婆', '爺爺泡的茶', '前世情人', '粉色海洋', '娘子', 'I Do'];
  const hasAllFamily = familyList.every((it) => isHeld(it));
  const toggleFamilySet = () => {
    if (hasAllFamily) {
      familyList.forEach((it) => {
        if (inventory[it]) {
          onRemoveItem ? onRemoveItem(it) : onSetItemCount ? onSetItemCount(it, 0) : null;
        }
      });
      showFeedback('已關閉/卸除【親情全員樂章套裝】');
    } else {
      onAddMultipleItems(familyList);
      showFeedback('已開啟【親情全員樂章套裝】（達成《周杰倫家庭》必備）');
    }
  };

  const timeList = ['半島鐵盒', '飛行時光機', '反方向的鐘'];
  const hasAllTime = timeList.every((it) => isHeld(it));
  const toggleTimeSet = () => {
    if (hasAllTime) {
      timeList.forEach((it) => {
        if (inventory[it]) {
          onRemoveItem ? onRemoveItem(it) : onSetItemCount ? onSetItemCount(it, 0) : null;
        }
      });
      showFeedback('已關閉/卸除【時空神器三件套】');
    } else {
      onAddMultipleItems(timeList);
      showFeedback('已開啟【時空神器三件套】（半島鐵盒＋飛行時光機＋反方向的鐘）');
    }
  };

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
      if (
        search &&
        !card.name.includes(search) &&
        !card.album.includes(search) &&
        !card.id.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [sortedCards, filterType, search]);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-[#141214] border-2 border-red-800/80 rounded-2xl p-4 sm:p-5 shadow-[0_0_50px_rgba(220,38,38,0.25)] flex flex-col h-[94vh] max-h-[94vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-red-900/60 pb-2.5 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm sm:text-base font-black text-red-400 font-mono tracking-wider flex items-center gap-1.5">
              <span>🔧</span>
              <span>開發者測試控制台 (DEV MODE)</span>
            </span>
            <span className="hidden md:inline text-xs text-stone-400">
              點擊選項即時生效且不關閉視窗，完成全部設定後再關閉返回遊戲
            </span>
          </div>

          <div className="flex items-center gap-2">
            {actionFeedback && (
              <span className="text-xs bg-emerald-950/90 text-emerald-300 border border-emerald-600 px-2.5 py-1 rounded-lg font-bold animate-pulse shadow-sm flex items-center gap-1">
                <span>✅</span>
                <span>{actionFeedback}</span>
              </span>
            )}
            <button
              onClick={onClose}
              className="text-stone-300 hover:text-white text-xs px-3 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-700/80 cursor-pointer font-bold transition-all"
            >
              ✕ 關閉控制台・返回遊戲
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* UPPER SECTION: 控制區 (版面放大，佔據主要空間 flex-1) */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-y-auto pr-1.5 flex flex-col gap-3 py-3 border-b border-stone-800">
          {/* Section 0: 全通關評級門檻指標 */}
          <div className="bg-amber-950/25 border border-amber-500/40 rounded-xl p-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs shrink-0">
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

          {/* Section 1: 回合與局數跳選 */}
          <div className="bg-black/50 border border-stone-800/90 rounded-xl p-3 flex flex-col gap-2.5 shrink-0">
            <div className="text-xs font-bold text-sky-300 flex items-center justify-between">
              <span>⏳ 回合與局數自訂跳選（用以測試 S/A/B/C/D 評級與特定回合事件）</span>
              <span className="text-[11px] text-stone-400 font-mono">
                當前狀態：第 {currentRound} 回合 / 第 {currentGameNumber} 局
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Input: Round */}
              <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-800 px-3 py-1.5 rounded-lg text-xs">
                <span className="text-stone-400 font-bold">跳轉回合:</span>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={roundInput}
                  onChange={(e) => setRoundInput(Math.min(30, Math.max(1, Number(e.target.value) || 1)))}
                  className="w-16 bg-black border border-stone-700 text-amber-300 font-mono font-bold px-2 py-0.5 rounded text-center focus:outline-none focus:border-amber-500"
                />
                <span className="text-stone-500 text-xs">/ 30</span>
              </div>

              {/* Input: Game Number */}
              <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-800 px-3 py-1.5 rounded-lg text-xs">
                <span className="text-stone-400 font-bold">設定局數:</span>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={gameInput}
                  onChange={(e) => setGameInput(Math.min(99, Math.max(1, Number(e.target.value) || 1)))}
                  className="w-16 bg-black border border-stone-700 text-amber-300 font-mono font-bold px-2 py-0.5 rounded text-center focus:outline-none focus:border-amber-500"
                />
                <span className="text-stone-500 text-xs">局</span>
              </div>

              {/* Apply Button - 不關閉控制台 */}
              <button
                onClick={() => {
                  onSetRoundAndGame(roundInput, gameInput);
                  showFeedback(`進度已設定為：第 ${gameInput} 局 / 第 ${roundInput} 回合`);
                }}
                className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs cursor-pointer shadow-md flex items-center gap-1 active:scale-95 transition-all"
                title="套用當前輸入的回合與局數（不關閉控制台）"
              >
                <span>⚡</span>
                <span>套用進度</span>
              </button>

              {/* 快捷按鈕 */}
              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  onClick={() => {
                    setRoundInput(15);
                    onSetRoundAndGame(15, gameInput);
                    showFeedback(`已跳轉至第 ${gameInput} 局 / 第 15 回合`);
                  }}
                  className="px-2.5 py-1 rounded bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs cursor-pointer border border-stone-800"
                >
                  跳至第 15 回合
                </button>
                <button
                  onClick={() => {
                    setRoundInput(29);
                    onSetRoundAndGame(29, gameInput);
                    showFeedback(`已跳轉至第 ${gameInput} 局 / 第 29 回合`);
                  }}
                  className="px-2.5 py-1 rounded bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs cursor-pointer border border-stone-800"
                >
                  跳至第 29 回合
                </button>
                <button
                  onClick={() => {
                    setRoundInput(30);
                    onSetRoundAndGame(30, gameInput);
                    showFeedback(`已跳轉至第 ${gameInput} 局 / 第 30 回合`);
                  }}
                  className="px-2.5 py-1 rounded bg-red-950/80 hover:bg-red-900 text-red-200 text-xs font-bold cursor-pointer border border-red-800"
                >
                  跳至第 30 回合 (決戰前)
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: 角色切換（清晰排版，點選不離開） */}
          <div className="bg-black/50 border border-stone-800/90 rounded-xl p-3 flex flex-col gap-2 shrink-0">
            <div className="text-xs font-bold text-stone-300 flex items-center justify-between">
              <span>👤 角色化身切換（點選直接更換當前化身，不關閉控制台）</span>
              <span className="text-[11px] text-stone-500 font-mono">共 {ALL_CHARACTERS.length} 位化身可選</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {ALL_CHARACTERS.map((char) => {
                const isCurrent = char.id === currentCharacterId;
                return (
                  <button
                    key={char.id}
                    onClick={() => {
                      onChangeCharacter(char.id);
                      showFeedback(`化身已切換為【${char.name}】`);
                    }}
                    className={`px-2.5 py-2 rounded-lg border text-xs font-sans cursor-pointer flex items-center gap-2 transition-all text-left truncate ${
                      isCurrent
                        ? 'bg-amber-950/80 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.3)] ring-1 ring-amber-400/50'
                        : 'bg-stone-900 hover:bg-stone-800 text-stone-200 border-stone-700 hover:border-amber-500/70'
                    }`}
                  >
                    <div className="shrink-0 flex items-center justify-center">
                      <CharacterAvatarIcon character={char} size="sm" />
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="font-bold truncate">{char.name}</span>
                      <span className="text-[10px] text-stone-400 truncate">{char.title.split('・')[0]}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: 冒險資源與全域進度調控（3 欄對稱排版） */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 shrink-0">
            {/* 行動力調控 */}
            <div className="bg-black/50 border border-stone-800/90 rounded-xl p-3 flex flex-col justify-between gap-2.5">
              <div className="text-xs font-bold text-rose-300 flex items-center justify-between border-b border-stone-800/60 pb-1.5">
                <span className="flex items-center gap-1.5">
                  <span>⚡</span>
                  <span>行動力調控</span>
                </span>
                <span className="text-[11px] text-rose-400 font-mono font-bold">
                  當前：{currentAp} / 30
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-1.5">
                <button
                  onClick={() => {
                    onSetAp(30);
                    showFeedback('行動力已恢復至 30');
                  }}
                  className="px-2 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-700 text-xs font-bold cursor-pointer transition-colors text-center"
                >
                  滿額 (30)
                </button>
                <button
                  onClick={() => {
                    onSetAp(1);
                    showFeedback('行動力已調至瀕危 1');
                  }}
                  className="px-2 py-1.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-700 text-xs font-bold cursor-pointer transition-colors text-center"
                >
                  瀕危 (1)
                </button>
                <button
                  onClick={() => {
                    onSetAp(0);
                    showFeedback('行動力已調至 0');
                  }}
                  className="px-2 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-700 text-xs font-bold cursor-pointer transition-colors text-center"
                >
                  力竭 (0)
                </button>
                <button
                  onClick={() => {
                    const newAp = Math.min(30, currentAp + 10);
                    onSetAp(newAp);
                    showFeedback(`行動力 +10 (當前: ${newAp})`);
                  }}
                  className="px-2 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold cursor-pointer border border-stone-700 transition-colors text-center"
                >
                  +10 點
                </button>
              </div>
            </div>

            {/* 金幣調控 */}
            <div className="bg-black/50 border border-stone-800/90 rounded-xl p-3 flex flex-col justify-between gap-2.5">
              <div className="text-xs font-bold text-yellow-300 flex items-center justify-between border-b border-stone-800/60 pb-1.5">
                <span className="flex items-center gap-1.5">
                  <GoldCoinIcon className="w-3.5 h-3.5" />
                  <span>金幣調控</span>
                </span>
                <span className="text-[11px] text-yellow-400 font-mono font-bold">
                  當前：{currentCoins} 枚
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {onSetCoins && (
                  <>
                    <button
                      onClick={() => {
                        onSetCoins(currentCoins + 5);
                        showFeedback(`金幣 +5 (當前: ${currentCoins + 5})`);
                      }}
                      className="px-2 py-1.5 rounded-lg bg-yellow-950/80 hover:bg-yellow-900 text-yellow-200 border border-yellow-700 text-xs font-bold cursor-pointer transition-colors text-center"
                    >
                      +5 金幣
                    </button>
                    <button
                      onClick={() => {
                        onSetCoins(currentCoins + 10);
                        showFeedback(`金幣 +10 (當前: ${currentCoins + 10})`);
                      }}
                      className="px-2 py-1.5 rounded-lg bg-yellow-950/80 hover:bg-yellow-900 text-yellow-200 border border-yellow-700 text-xs font-bold cursor-pointer transition-colors text-center"
                    >
                      +10 金幣
                    </button>
                    <button
                      onClick={() => {
                        onSetCoins(0);
                        showFeedback('金幣已歸零');
                      }}
                      className="px-2 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 text-xs font-bold cursor-pointer transition-colors text-center"
                    >
                      金幣歸零
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* 一鍵解鎖圖鑑與成就 */}
            <div className="bg-black/50 border border-stone-800/90 rounded-xl p-3 flex flex-col justify-between gap-2.5">
              <div className="text-xs font-bold text-purple-300 flex items-center justify-between border-b border-stone-800/60 pb-1.5">
                <span className="flex items-center gap-1.5">
                  <span>📚</span>
                  <span>全域進度輔助</span>
                </span>
                <span className="text-[11px] text-stone-400 font-mono">點選立即生效</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => {
                    onUnlockAllSongs();
                    showFeedback(`已全數解鎖 ${CARD_DATABASE.length} 首歌曲圖鑑！`);
                  }}
                  className="px-2 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900 text-amber-200 border border-amber-800 text-xs font-bold cursor-pointer flex items-center justify-center gap-1 transition-colors text-center"
                  title={`全數解鎖 ${CARD_DATABASE.length} 首歌曲圖鑑`}
                >
                  <span>🎵</span>
                  <span className="truncate">解鎖圖鑑</span>
                </button>

                <button
                  onClick={() => {
                    onUnlockAllAchievements();
                    showFeedback('已全數解鎖 9 大傳奇成就！');
                  }}
                  className="px-2 py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900 text-purple-200 border border-purple-800 text-xs font-bold cursor-pointer flex items-center justify-center gap-1 transition-colors text-center"
                  title="全數解鎖 9 大傳奇成就"
                >
                  <span>🏅</span>
                  <span className="truncate">解鎖成就</span>
                </button>

                {onClearHallOfFame &&
                  (confirmClearHall ? (
                    <div className="flex items-center justify-center gap-1 bg-red-950/80 border border-red-600 px-1 py-1 rounded-lg">
                      <button
                        onClick={() => {
                          setConfirmClearHall(false);
                          onClearHallOfFame();
                          showFeedback('已清空傳奇殿堂戰績卡！');
                        }}
                        className="px-1.5 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer"
                      >
                        確定
                      </button>
                      <button
                        onClick={() => setConfirmClearHall(false)}
                        className="px-1 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs cursor-pointer"
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmClearHall(true)}
                      className="px-2 py-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/80 text-red-300 border border-red-800 text-xs font-bold cursor-pointer flex items-center justify-center gap-1 transition-colors text-center"
                      title="清空傳奇殿堂的所有歷史評級戰績卡"
                    >
                      <span>🏛️</span>
                      <span className="truncate">清空殿堂</span>
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Section: 環境變化狀態與常駐設施調控 */}
          <div className="w-full bg-black/50 border border-stone-800/90 rounded-xl p-3 flex flex-col gap-2.5 shrink-0">
            <div className="text-xs font-bold text-red-300 flex items-center justify-between border-b border-stone-800/60 pb-1.5">
              <span className="flex items-center gap-1.5">
                <span>🌐</span>
                <span>環境變化狀態開關（環境狀態類 / 常駐設施類）</span>
              </span>
              <span className="text-[11px] text-stone-500 font-mono">點選按鈕即時切換狀態</span>
            </div>
            
            {/* 第一行：環境狀態類（亂舞春秋 / 追逐忍者 / 煙火燃燒 / 偏頭痛 / 下雨） */}
            <div className="flex flex-col gap-1">
              <div className="text-[11px] font-bold text-stone-400">⚡ 環境狀態類</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {/* 1. 亂舞春秋時代 */}
                <div className="flex flex-col justify-between bg-stone-900/90 border border-stone-800 p-2.5 rounded-lg gap-2">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs text-stone-200 font-bold truncate flex items-center gap-1">
                      <span>⚔️</span>
                      <span>亂舞春秋</span>
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        isChaosEraActive
                          ? 'bg-red-950 text-red-300 border border-red-800 animate-pulse'
                          : 'bg-stone-800 text-stone-500'
                      }`}
                    >
                      {isChaosEraActive ? '作用中' : '未開啟'}
                    </span>
                  </div>
                  {onToggleChaosEra && (
                    <button
                      onClick={() => {
                        onToggleChaosEra(!isChaosEraActive);
                        showFeedback(!isChaosEraActive ? '已開啟【亂舞春秋時代】' : '已解除【亂舞春秋時代】');
                      }}
                      className={`w-full text-xs py-1.5 rounded-lg font-bold cursor-pointer transition-colors border ${
                        isChaosEraActive
                          ? 'bg-red-950/80 hover:bg-red-900 text-red-200 border-red-700'
                          : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'
                      }`}
                    >
                      {isChaosEraActive ? '關閉時代' : '開啟時代'}
                    </button>
                  )}
                </div>

                {/* 2. 追逐忍者 */}
                <div className="flex flex-col justify-between bg-stone-900/90 border border-stone-800 p-2.5 rounded-lg gap-2">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs text-stone-200 font-bold truncate flex items-center gap-1.5">
                      <NinjaIcon className="w-3.5 h-3.5" />
                      <span>追逐忍者</span>
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        isNinjaChasing
                          ? 'bg-red-950 text-red-300 border border-red-800 animate-pulse'
                          : 'bg-stone-800 text-stone-500'
                      }`}
                    >
                      {isNinjaChasing ? '追逐中' : '未開啟'}
                    </span>
                  </div>
                  {onToggleNinjaChase && (
                    <button
                      onClick={() => {
                        onToggleNinjaChase(!isNinjaChasing);
                        showFeedback(!isNinjaChasing ? '已開啟【追逐忍者】狀態' : '已解除【追逐忍者】狀態');
                      }}
                      className={`w-full text-xs py-1.5 rounded-lg font-bold cursor-pointer transition-colors border ${
                        isNinjaChasing
                          ? 'bg-red-950/80 hover:bg-red-900 text-red-200 border-red-700'
                          : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'
                      }`}
                    >
                      {isNinjaChasing ? '解除追逐' : '開啟追逐'}
                    </button>
                  )}
                </div>

                {/* 3. 煙火燃燒 */}
                <div className="flex flex-col justify-between bg-stone-900/90 border border-stone-800 p-2.5 rounded-lg gap-2">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs text-stone-200 font-bold truncate flex items-center gap-1">
                      <span>🎆</span>
                      <span>煙火燃燒</span>
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        isFireworksBurning
                          ? 'bg-red-950 text-red-300 border border-red-800 animate-pulse'
                          : 'bg-stone-800 text-stone-500'
                      }`}
                    >
                      {isFireworksBurning ? '燃燒中' : '未開啟'}
                    </span>
                  </div>
                  {onToggleFireworks && (
                    <button
                      onClick={() => {
                        onToggleFireworks(!isFireworksBurning);
                        showFeedback(!isFireworksBurning ? '已開啟【煙火燃燒】狀態' : '已解除【煙火燃燒】狀態');
                      }}
                      className={`w-full text-xs py-1.5 rounded-lg font-bold cursor-pointer transition-colors border ${
                        isFireworksBurning
                          ? 'bg-red-950/80 hover:bg-red-900 text-red-200 border-red-700'
                          : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'
                      }`}
                    >
                      {isFireworksBurning ? '熄滅火勢' : '點燃煙火'}
                    </button>
                  )}
                </div>

                {/* 4. 偏頭痛環境狀態 */}
                <div className="flex flex-col justify-between bg-stone-900/90 border border-stone-800 p-2.5 rounded-lg gap-2">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs text-stone-200 font-bold truncate flex items-center gap-1">
                      <span>🤕</span>
                      <span>偏頭痛</span>
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        isHeadacheActive
                          ? 'bg-red-950 text-red-300 border border-red-800 animate-pulse'
                          : 'bg-stone-800 text-stone-500'
                      }`}
                    >
                      {isHeadacheActive ? '發作中' : '未發作'}
                    </span>
                  </div>
                  {onToggleHeadache && (
                    <button
                      onClick={() => {
                        onToggleHeadache(!isHeadacheActive);
                        showFeedback(!isHeadacheActive ? '已開啟【偏頭痛】狀態（每回合行動力 -2）' : '已解除【偏頭痛】狀態');
                      }}
                      className={`w-full text-xs py-1.5 rounded-lg font-bold cursor-pointer transition-colors border ${
                        isHeadacheActive
                          ? 'bg-red-950/80 hover:bg-red-900 text-red-200 border-red-700'
                          : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'
                      }`}
                    >
                      {isHeadacheActive ? '解除頭痛' : '引起偏頭痛'}
                    </button>
                  )}
                </div>

                {/* 5. 下雨環境狀態 */}
                <div className="flex flex-col justify-between bg-stone-900/90 border border-stone-800 p-2.5 rounded-lg gap-2">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs text-stone-200 font-bold truncate flex items-center gap-1">
                      <span>🌧️</span>
                      <span>下雨</span>
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        isRainyWeatherActive
                          ? 'bg-sky-950 text-sky-300 border border-sky-700 animate-pulse'
                          : 'bg-stone-800 text-stone-500'
                      }`}
                    >
                      {isRainyWeatherActive ? '下雨中' : '放晴'}
                    </span>
                  </div>
                  {onToggleRainyWeather && (
                    <button
                      onClick={() => {
                        onToggleRainyWeather(!isRainyWeatherActive);
                        showFeedback(!isRainyWeatherActive ? '已開啟【那天下雨了】下雨天狀態！' : '已解除【下雨天】狀態，天空放晴！');
                      }}
                      className={`w-full text-xs py-1.5 rounded-lg font-bold cursor-pointer transition-colors border ${
                        isRainyWeatherActive
                          ? 'bg-sky-950/80 hover:bg-sky-900 text-sky-200 border-sky-700'
                          : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'
                      }`}
                      title="切換【那天下雨了】下雨天環境狀態"
                    >
                      {isRainyWeatherActive ? '解除下雨' : '降下豪雨'}
                    </button>
                  )}
                  {onFastForwardRainRounds && isRainyWeatherActive && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          onFastForwardRainRounds();
                          showFeedback('已連動觸發下雨天滿 5 回合！立即觸發居中《聽見下雨的聲音》！');
                        }}
                        className="flex-1 text-[10px] py-1 rounded bg-sky-900/60 hover:bg-sky-800 text-sky-200 border border-sky-600 font-bold cursor-pointer transition-colors"
                        title="快進下雨經歷滿 5 回合以觸發聽見下雨的聲音連動（支援重複使用測試）"
                      >
                        ⚡ 滿5回 (聽雨)
                      </button>
                      {onFastForwardRainNight && (
                        <button
                          onClick={() => {
                            onFastForwardRainNight();
                            showFeedback('已快進經歷雨天滿 8 回合！晝夜雨夜計量條達到滿額！');
                          }}
                          className="flex-1 text-[10px] py-1 rounded bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 border border-indigo-600 font-bold cursor-pointer transition-colors"
                          title="快進下雨經歷滿 8 回合以測試晝夜雨夜計量條蓄滿效果"
                        >
                          🌙 滿8回 (夜雨)
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 第二行：常駐設施類（米蘭小鐵鋪 / 淘金小鎮 / 梯田 / 浪漫手機） */}
            <div className="flex flex-col gap-1 pt-1.5 border-t border-stone-800/60">
              <div className="text-[11px] font-bold text-stone-400">🏛️ 常駐設施與功能類</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {/* 1. 米蘭小鐵鋪常駐 */}
                <div className="flex flex-col justify-between bg-stone-900/90 border border-stone-800 p-2.5 rounded-lg gap-2">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs text-stone-200 font-bold truncate flex items-center gap-1">
                      <span>🔨</span>
                      <span>米蘭小鐵鋪</span>
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        isBlacksmithUnlocked
                          ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                          : 'bg-stone-800 text-stone-500'
                      }`}
                    >
                      {isBlacksmithUnlocked ? '常駐中' : '未開啟'}
                    </span>
                  </div>
                  {onToggleBlacksmith && (
                    <button
                      onClick={() => {
                        onToggleBlacksmith(!isBlacksmithUnlocked);
                        showFeedback(!isBlacksmithUnlocked ? '已開啟【米蘭小鐵鋪常駐】' : '已關閉【米蘭小鐵鋪常駐】');
                      }}
                      className={`w-full text-xs py-1.5 rounded-lg font-bold cursor-pointer transition-colors border ${
                        isBlacksmithUnlocked
                          ? 'bg-amber-950/80 hover:bg-amber-900 text-amber-200 border-amber-700'
                          : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'
                      }`}
                    >
                      {isBlacksmithUnlocked ? '關閉常駐' : '開啟常駐'}
                    </button>
                  )}
                </div>

                {/* 2. 淘金小鎮常駐 */}
                <div className="flex flex-col justify-between bg-stone-900/90 border border-stone-800 p-2.5 rounded-lg gap-2">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs text-stone-200 font-bold truncate flex items-center gap-1">
                      <span>⛏️</span>
                      <span>淘金小鎮</span>
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        isGoldTownUnlocked
                          ? 'bg-yellow-950 text-yellow-300 border border-yellow-800 animate-pulse'
                          : 'bg-stone-800 text-stone-500'
                      }`}
                    >
                      {isGoldTownUnlocked ? '常駐中' : '未開啟'}
                    </span>
                  </div>
                  {onToggleGoldTown && (
                    <button
                      onClick={() => {
                        onToggleGoldTown(!isGoldTownUnlocked);
                        showFeedback(!isGoldTownUnlocked ? '已開啟【淘金小鎮常駐】' : '已關閉【淘金小鎮常駐】');
                      }}
                      className={`w-full text-xs py-1.5 rounded-lg font-bold cursor-pointer transition-colors border ${
                        isGoldTownUnlocked
                          ? 'bg-yellow-950/80 hover:bg-yellow-900 text-yellow-200 border-yellow-700'
                          : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'
                      }`}
                    >
                      {isGoldTownUnlocked ? '關閉常駐' : '開啟常駐'}
                    </button>
                  )}
                </div>

                {/* 3. 梯田常駐 */}
                <div className="flex flex-col justify-between bg-stone-900/90 border border-stone-800 p-2.5 rounded-lg gap-2">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs text-stone-200 font-bold truncate flex items-center gap-1">
                      <span>🌾</span>
                      <span>梯田</span>
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        isTerraceUnlocked
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700 animate-pulse'
                          : 'bg-stone-800 text-stone-500'
                      }`}
                    >
                      {isTerraceUnlocked ? '常駐中' : '未開啟'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {onToggleTerrace && (
                      <button
                        onClick={() => {
                          onToggleTerrace(!isTerraceUnlocked);
                          showFeedback(!isTerraceUnlocked ? '已開啟【梯田常駐】' : '已關閉【梯田常駐】');
                        }}
                        className={`w-full text-xs py-1.5 rounded-lg font-bold cursor-pointer transition-colors border ${
                          isTerraceUnlocked
                            ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border-emerald-700'
                            : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'
                        }`}
                      >
                        {isTerraceUnlocked ? '關閉常駐' : '開啟常駐'}
                      </button>
                    )}
                    {onFastMatureTerrace && isTerraceUnlocked && (
                      <div className="grid grid-cols-2 gap-1">
                        <button
                          onClick={() => {
                            onFastMatureTerrace('tea');
                            showFeedback('已使梯田【茶葉】直接進入可收成成熟狀態！');
                          }}
                          className="text-[10px] py-1 rounded font-bold cursor-pointer transition-colors border bg-emerald-900/50 hover:bg-emerald-800/70 text-emerald-300 border-emerald-600/60 truncate"
                          title="使梯田直接熟成茶葉（可收成茶葉1份）"
                        >
                          ⚡ 茶葉成熟
                        </button>
                        <button
                          onClick={() => {
                            onFastMatureTerrace('flower_sea');
                            showFeedback('已使梯田【花海】直接進入可收成盛放狀態！');
                          }}
                          className="text-[10px] py-1 rounded font-bold cursor-pointer transition-colors border bg-purple-900/50 hover:bg-purple-800/70 text-purple-300 border-purple-600/60 truncate"
                          title="使梯田直接熟成花海（可收成《花海》卡牌）"
                        >
                          🌸 花海成熟
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. 浪漫手機常駐 */}
                <div className="flex flex-col justify-between bg-stone-900/90 border border-stone-800 p-2.5 rounded-lg gap-2">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs text-stone-200 font-bold truncate flex items-center gap-1">
                      <span>📱</span>
                      <span>浪漫手機</span>
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        isRomanticPhoneUnlocked
                          ? 'bg-rose-950 text-rose-300 border border-rose-700 animate-pulse'
                          : 'bg-stone-800 text-stone-500'
                      }`}
                    >
                      {isRomanticPhoneUnlocked ? '常駐中' : '未開啟'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {onToggleRomanticPhone && (
                      <button
                        onClick={() => {
                          onToggleRomanticPhone(!isRomanticPhoneUnlocked);
                          showFeedback(!isRomanticPhoneUnlocked ? '已開啟【浪漫手機常駐】' : '已關閉【浪漫手機常駐】');
                        }}
                        className={`w-full text-xs py-1.5 rounded-lg font-bold cursor-pointer transition-colors border ${
                          isRomanticPhoneUnlocked
                            ? 'bg-rose-950/80 hover:bg-rose-900 text-rose-200 border-rose-700'
                            : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'
                        }`}
                      >
                        {isRomanticPhoneUnlocked ? '關閉常駐' : '開啟常駐'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: 連動作用物品與套裝開關控制台 */}
          <div className="bg-black/50 border border-stone-800/90 rounded-xl p-3 flex flex-col gap-3 shrink-0">
            <div className="text-xs font-bold text-stone-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-amber-200">
                <span>🎒</span>
                <span>連動作用物品與關鍵套裝開關（即時開關/卸除，無縫聯調機制）</span>
              </span>
              <button
                onClick={() => {
                  onClearInventory();
                  showFeedback('已清空行囊內所有物品！');
                }}
                className="text-xs text-red-400 hover:text-red-300 underline cursor-pointer transition-colors"
              >
                清空背包物品
              </button>
            </div>

            {/* 1. 三大關鍵套裝一鍵開關 */}
            <div className="bg-stone-950/70 border border-stone-800/80 rounded-lg p-2.5 flex flex-col gap-1.5">
              <div className="text-[11px] font-bold text-stone-400">✨ 三大核心路線套裝（點擊一鍵裝備 / 全數卸除）</div>
              <div className="flex flex-wrap items-center gap-2">
                {/* 四大黃金專輯 */}
                <button
                  onClick={toggleAlbumsSet}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                    hasAllAlbums
                      ? 'bg-yellow-950/80 hover:bg-yellow-900 text-yellow-200 border-yellow-600 shadow-[0_0_10px_rgba(234,179,8,0.25)]'
                      : 'bg-stone-900 hover:bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200'
                  }`}
                  title="《最偉大的作品》勝利條件全套專輯"
                >
                  <span>{hasAllAlbums ? '✓' : '+'}</span>
                  <span>四大黃金專輯全套</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-yellow-300 font-normal">
                    {hasAllAlbums ? '已齊聚 (點擊關閉)' : '未齊全 (點擊開啟)'}
                  </span>
                </button>

                {/* 親情全員樂章 */}
                <button
                  onClick={toggleFamilySet}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                    hasAllFamily
                      ? 'bg-rose-950/80 hover:bg-rose-900 text-rose-200 border-rose-600 shadow-[0_0_10px_rgba(244,63,94,0.25)]'
                      : 'bg-stone-900 hover:bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200'
                  }`}
                  title="《周杰倫家庭》親情路線全員"
                >
                  <span>{hasAllFamily ? '✓' : '+'}</span>
                  <span>親情全員樂章套裝</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-rose-300 font-normal">
                    {hasAllFamily ? '已齊聚 (點擊關閉)' : '未齊全 (點擊開啟)'}
                  </span>
                </button>

                {/* 時空神器三件套 */}
                <button
                  onClick={toggleTimeSet}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                    hasAllTime
                      ? 'bg-purple-950/80 hover:bg-purple-900 text-purple-200 border-purple-600 shadow-[0_0_10px_rgba(168,85,247,0.25)]'
                      : 'bg-stone-900 hover:bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200'
                  }`}
                  title="半島鐵盒、飛行時光機、反方向的鐘"
                >
                  <span>{hasAllTime ? '✓' : '+'}</span>
                  <span>時空神器三件套</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-purple-300 font-normal">
                    {hasAllTime ? '已齊聚 (點擊關閉)' : '未齊全 (點擊開啟)'}
                  </span>
                </button>
              </div>
            </div>

            {/* 2. 兵器與戰鬥天賦連動道具 */}
            <div className="flex flex-col gap-1.5">
              <div className="text-[11px] font-bold text-amber-300/90 flex items-center gap-1">
                <span>⚔️</span>
                <span>兵器與天賦連動（半獸人需要2支雙截棍或1把雙刀；英雄錄影帶天賦可免兵刃突圍）</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {/* 雙截棍：支援 0 / 1 / 2 數量調節與開關 */}
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition-all ${
                    isHeld('雙截棍')
                      ? 'bg-emerald-950/70 border-emerald-500/80 text-emerald-200 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                      : 'bg-stone-900/80 border-stone-800 text-stone-400'
                  }`}
                >
                  <button
                    onClick={() => toggleItem('雙截棍', 2)}
                    className="flex items-center gap-1 font-bold cursor-pointer hover:underline"
                    title="點擊切換開關（開啟時預設給予 2 支，滿足半獸人消耗需求）"
                  >
                    <span>{isHeld('雙截棍') ? '✓' : '○'}</span>
                    <NunchakuIcon className="w-3.5 h-3.5 shrink-0" />
                    <span>雙截棍</span>
                    {isHeld('雙截棍') && (
                      <span className="text-[11px] text-emerald-300 font-mono">x{getCount('雙截棍')}</span>
                    )}
                  </button>
                  {isHeld('雙截棍') ? (
                    <div className="flex items-center gap-0.5 ml-1">
                      <button
                        onClick={() => adjustItemCount('雙截棍', -1)}
                        className="px-1.5 py-0.2 text-[10px] bg-stone-800 hover:bg-stone-700 text-stone-200 rounded border border-stone-600 cursor-pointer"
                        title="減少 1 支（測試只持有 1 支時半獸人提示缺少成雙兵刃）"
                      >
                        -
                      </button>
                      <button
                        onClick={() => adjustItemCount('雙截棍', 1)}
                        className="px-1.5 py-0.2 text-[10px] bg-stone-800 hover:bg-stone-700 text-stone-200 rounded border border-stone-600 cursor-pointer"
                        title="增加 1 支"
                      >
                        +
                      </button>
                      <button
                        onClick={() => toggleItem('雙截棍')}
                        className="ml-1 text-[10px] px-1.5 py-0.2 bg-red-950 hover:bg-red-900 text-red-300 rounded border border-red-800 cursor-pointer"
                      >
                        關閉
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => toggleItem('雙截棍', 2)}
                      className="ml-1 text-[10px] px-1.5 py-0.2 bg-stone-800 hover:bg-stone-700 text-amber-200 rounded border border-stone-700 cursor-pointer"
                    >
                      開啟(x2)
                    </button>
                  )}
                </div>

                {/* 雙刀：支援數量調節與開關 */}
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition-all ${
                    isHeld('雙刀')
                      ? 'bg-emerald-950/70 border-emerald-500/80 text-emerald-200 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                      : 'bg-stone-900/80 border-stone-800 text-stone-400'
                  }`}
                >
                  <button
                    onClick={() => toggleItem('雙刀', 1)}
                    className="flex items-center gap-1 font-bold cursor-pointer hover:underline"
                  >
                    <span>{isHeld('雙刀') ? '✓' : '○'}</span>
                    <span>雙刀</span>
                    {isHeld('雙刀') && (
                      <span className="text-[11px] text-emerald-300 font-mono">x{getCount('雙刀')}</span>
                    )}
                  </button>
                  {isHeld('雙刀') ? (
                    <div className="flex items-center gap-0.5 ml-1">
                      <button
                        onClick={() => adjustItemCount('雙刀', -1)}
                        className="px-1.5 py-0.2 text-[10px] bg-stone-800 hover:bg-stone-700 text-stone-200 rounded border border-stone-600 cursor-pointer"
                      >
                        -
                      </button>
                      <button
                        onClick={() => adjustItemCount('雙刀', 1)}
                        className="px-1.5 py-0.2 text-[10px] bg-stone-800 hover:bg-stone-700 text-stone-200 rounded border border-stone-600 cursor-pointer"
                      >
                        +
                      </button>
                      <button
                        onClick={() => toggleItem('雙刀')}
                        className="ml-1 text-[10px] px-1.5 py-0.2 bg-red-950 hover:bg-red-900 text-red-300 rounded border border-red-800 cursor-pointer"
                      >
                        關閉
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => toggleItem('雙刀', 1)}
                      className="ml-1 text-[10px] px-1.5 py-0.2 bg-stone-800 hover:bg-stone-700 text-amber-200 rounded border border-stone-700 cursor-pointer"
                    >
                      開啟
                    </button>
                  )}
                </div>

                {/* 無雙 */}
                <button
                  onClick={() => toggleItem('無雙')}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                    isHeld('無雙')
                      ? 'bg-emerald-950/70 border-emerald-500/80 text-emerald-200 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                      : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                  title="英雄戰鬥必殺無雙秘技"
                >
                  <span>{isHeld('無雙') ? '✓' : '○'}</span>
                  <span>無雙</span>
                  <span className="text-[10px] text-stone-400 font-normal">
                    {isHeld('無雙') ? '(點擊關閉)' : '(點擊開啟)'}
                  </span>
                </button>

                {/* 免費教學錄影帶 */}
                <button
                  onClick={() => toggleItem('免費教學錄影帶')}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                    isHeld('免費教學錄影帶')
                      ? 'bg-amber-950/80 border-amber-500/80 text-amber-200 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                      : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                  title="英雄持有時解鎖赤手空拳天賦並揭示特質"
                >
                  <span>{isHeld('免費教學錄影帶') ? '✓' : '○'}</span>
                  <span>📼 免費教學錄影帶</span>
                  <span className="text-[10px] text-amber-300 font-normal">
                    {isHeld('免費教學錄影帶') ? '(英雄天賦生效中)' : '(點擊開啟)'}
                  </span>
                </button>

                {/* 黑色毛衣：抵禦強敵攻擊 */}
                <button
                  onClick={() => toggleItem('黑色毛衣')}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                    isHeld('黑色毛衣')
                      ? 'bg-emerald-950/70 border-emerald-500/80 text-emerald-200 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                      : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                  title="抵禦強敵攻擊（如半獸人反擊、龍戰騎士猛攻，消耗1件免受傷害）"
                >
                  <span>{isHeld('黑色毛衣') ? '✓' : '○'}</span>
                  <span>🧥 黑色毛衣</span>
                  <span className="text-[10px] text-stone-400 font-normal">
                    {isHeld('黑色毛衣') ? '(抵禦生效中)' : '(點擊開啟)'}
                  </span>
                </button>
              </div>
            </div>

            {/* 3. 遭遇信物與戰役連動 */}
            <div className="flex flex-col gap-1.5">
              <div className="text-[11px] font-bold text-cyan-300/90 flex items-center gap-1">
                <span>📜</span>
                <span>《太陽之子》遭遇信物與終局戰役連動（四對手信物集齊啟動【亂舞春秋】；最後的戰役導引決戰將軍）</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { name: '超跑女神指引的賽道', label: '超跑女神指引的賽道', emoji: '🏎️' },
                  { name: '印地安老斑鳩', label: '印地安老斑鳩', emoji: '🐦' },
                  { name: '忍者', label: '忍者', isNinja: true },
                  { name: '半獸人', label: '半獸人', emoji: '👹' },
                  { name: '龍戰騎士的遺言', label: '龍戰騎士的遺言', emoji: '📜' },
                  { name: '最後的戰役', label: '最後的戰役', emoji: '🎖️' },
                ].map((item) => (
                  <button
                    key={item.name}
                    onClick={() => toggleItem(item.name)}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                      isHeld(item.name)
                        ? 'bg-cyan-950/70 border-cyan-500/80 text-cyan-200 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                        : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <span>{isHeld(item.name) ? '✓' : '○'}</span>
                    <span className="flex items-center gap-1">
                      {item.isNinja ? <NinjaIcon className="w-3.5 h-3.5" /> : <span>{item.emoji}</span>}
                      <span>{item.label}</span>
                    </span>
                    <span className="text-[10px] font-normal opacity-70">
                      {isHeld(item.name) ? '持有' : '開啟'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. 基礎素材區 */}
            <div className="flex flex-col gap-2">
              <div className="text-[11px] font-bold text-emerald-300/90 flex items-center gap-1">
                <span>🌱</span>
                <span>基礎素材區（點擊切換開啟 / 關閉持有狀態）</span>
              </div>

              {/* 第一行：卡牌但可以做出別的東西 */}
              <div className="flex flex-col gap-1">
                <div className="text-[10px] text-stone-400 font-mono">卡牌但可轉化其他物品（甜甜的 / 稻香 / 青花瓷 / 蘭亭序 / 菊花台 / 迷迭香）</div>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { name: '甜甜的', label: '🍯 甜甜的', desc: '麥芽糖原料' },
                    { name: '稻香', label: '🌾 稻香', desc: '麥芽糖原料' },
                    { name: '青花瓷', label: '🏺 青花瓷', desc: '淘金小鎮出土文物（可焚燒成泥土）' },
                    { name: '蘭亭序', label: '📜 蘭亭序', desc: '淘金小鎮出土墨寶（可焚燒得手寫的從前）' },
                    { name: '菊花台', label: '👑 菊花台', desc: '抽卡翻出（可焚燒得菊花）' },
                    { name: '迷迭香', label: '🌿 迷迭香', desc: '抽卡翻出（梯田培育花海原料）' },
                  ].map((item) => (
                    <button
                      key={item.name}
                      onClick={() => toggleItem(item.name)}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                        isHeld(item.name)
                          ? 'bg-emerald-950/70 border-emerald-500/80 text-emerald-200 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                          : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                      title={item.desc}
                    >
                      <span>{isHeld(item.name) ? '✓' : '○'}</span>
                      <span>{item.label}</span>
                      <span className="text-[10px] font-normal opacity-70">
                        {isHeld(item.name) ? '持有' : '開啟'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 第二行：遊戲道具 */}
              <div className="flex flex-col gap-1 pt-1 border-t border-stone-800/40">
                <div className="text-[10px] text-stone-400 font-mono">遊戲道具（泥土 / 鐵鏟 / 水 / 空瓶 / 菊花 / 茶葉 / 熱水 / 廢紙）</div>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { name: '泥土', label: '🌱 泥土', desc: '茶苗播種原料（青花瓷焚燒獲得）' },
                    { name: '鐵鏟', label: '鐵鏟', desc: '雙截棍小鐵匠重鑄改造（梯田翻土農具）', isShovel: true },
                    { name: '水', label: '💧 水', desc: '可灌溉梯田' },
                    { name: '空瓶', label: '🍾 空瓶', desc: '淘金小鎮發掘（用於裝水）' },
                    { name: '菊花', label: '🌼 菊花', desc: '菊花台烈焰焚歌化菊（植於梯田培育花海）' },
                    { name: '茶葉', label: '🍵 茶葉', desc: '梯田耕種收成（爺爺泡的茶關鍵名物）' },
                    { name: '熱水', label: '♨️ 熱水', desc: '水經煙火煮沸（爺爺泡的茶沖泡必備）' },
                    { name: '廢紙', label: '📄 廢紙', desc: '淘金小鎮發掘（下雨天損毀替死消耗）' },
                  ].map((item) => (
                    <button
                      key={item.name}
                      onClick={() => toggleItem(item.name)}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                        isHeld(item.name)
                          ? 'bg-emerald-950/70 border-emerald-500/80 text-emerald-200 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                          : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                      title={item.desc}
                    >
                      <span>{isHeld(item.name) ? '✓' : '○'}</span>
                      {item.isShovel ? <ShovelIcon className="w-3.5 h-3.5 shrink-0" /> : null}
                      <span>{item.label}</span>
                      <span className="text-[10px] font-normal opacity-70">
                        {isHeld(item.name) ? '持有' : '開啟'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 第三行：其他系統排在一起，交換類 */}
              <div className="flex flex-col gap-1 pt-1 border-t border-stone-800/40">
                <div className="text-[10px] text-stone-400 font-mono">其他系統交換與信物類（星晴 / 伊斯坦堡 / 鄉間的路 / 土耳其冰淇淋 / 白色風車 / 烏克麗麗 / 療傷燒肉粽 / 床邊故事）</div>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { name: '鄉間的路', label: '🌾 鄉間的路', desc: '上限1/持有此卡抽到小鐵匠可指引常駐' },
                    { name: '土耳其冰淇淋', label: '🍦 土耳其冰淇淋', desc: '園遊會購買：滿足小男孩心願' },
                    { name: '白色風車', label: '🎡 白色風車', desc: '園遊會購買：給予小男孩的玩具' },
                    { name: '烏克麗麗', label: '🎸 烏克麗麗', desc: '給小男孩後獲得粉色海洋/取得療傷燒肉粽' },
                    { name: '療傷燒肉粽', label: '🍙 療傷燒肉粽', desc: '以烏克麗麗向小鐵匠交換（感化豬管家）' },
                    { name: '床邊故事', label: '📖 床邊故事', desc: '古堡任務道具' },
                    { name: '星晴', label: '✨ 星晴', desc: '前世情人考驗：第一欄「星空上的銀海」' },
                    { name: '伊斯坦堡', label: '🏰 伊斯坦堡', desc: '前世情人考驗：第二欄「約定造城堡」' },
                    { name: '暗號', label: '🔢 暗號', desc: '撥往前世情人的號碼' },
                  ].map((item) => (
                    <button
                      key={item.name}
                      onClick={() => toggleItem(item.name)}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                        isHeld(item.name)
                          ? 'bg-emerald-950/70 border-emerald-500/80 text-emerald-200 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                          : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                      title={item.desc}
                    >
                      <span>{isHeld(item.name) ? '✓' : '○'}</span>
                      <span>{item.label}</span>
                      <span className="text-[10px] font-normal opacity-70">
                        {isHeld(item.name) ? '持有' : '開啟'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. 轉化產物區（麥芽糖 / 手寫的從前 / 花海 / 琴傷 / 彩虹 / 雨下一整晚） */}
            <div className="flex flex-col gap-1.5">
              <div className="text-[11px] font-bold text-amber-300/90 flex items-center gap-1">
                <span>✨</span>
                <span>轉化產物區（麥芽糖 / 手寫的從前 / 花海 / 琴傷 / 彩虹 / 雨下一整晚）</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { name: '麥芽糖', label: '🍬 麥芽糖', desc: '甜甜的+稻香熬製（餵食老斑鳩）' },
                  { name: '手寫的從前', label: '💌 手寫的從前', desc: '蘭亭序烈焰焚燒轉化（C2014-08）' },
                  { name: '花海', label: '💐 花海', desc: '梯田培育（C2008-04）' },
                  { name: '琴傷', label: '🎻 琴傷', desc: '古堡透過豬管家取得' },
                  { name: '彩虹', label: '🌈 彩虹', desc: '透過晴天放晴獲得（C2007-02）' },
                  { name: '雨下一整晚', label: '🌧️ 雨下一整晚', desc: '下雨天維持至第30回合終局獲得（C2010-06）' },
                ].map((item) => (
                  <button
                    key={item.name}
                    onClick={() => toggleItem(item.name)}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                      isHeld(item.name)
                        ? 'bg-amber-950/70 border-amber-500/80 text-amber-200 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                        : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                    title={item.desc}
                  >
                    <span>{isHeld(item.name) ? '✓' : '○'}</span>
                    <span>{item.label}</span>
                    <span className="text-[10px] font-normal opacity-70">
                      {isHeld(item.name) ? '持有' : '開啟'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 6. 時空神器、環境輔助與強化道具 */}
            <div className="flex flex-col gap-1.5">
              <div className="text-[11px] font-bold text-purple-300/90 flex items-center gap-1">
                <span>⏳</span>
                <span>時空神器、環境輔助與強化道具（本草綱目鑑賞行囊、煙花易冷撲熄燃燒、晴天放晴雨天、時光機調整時空）</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { name: '本草綱目', label: '🌿 本草綱目' },
                  { name: '反方向的鐘', label: '⏰ 反方向的鐘' },
                  { name: '時光機', label: '⌛ 時光機' },
                  { name: '愛的飛行日記', label: '📖 愛的飛行日記' },
                  { name: '飛行時光機', label: '🚀 飛行時光機' },
                  { name: '半島鐵盒', label: '🗝️ 半島鐵盒' },
                  { name: '第一頁', label: '📑 第一頁', desc: '鐵盒擴充容量 +1' },
                  { name: '第六頁', label: '📑 第六頁', desc: '鐵盒擴充容量 +6' },
                  { name: '第七頁', label: '📑 第七頁', desc: '鐵盒擴充容量 +7' },
                  { name: '序', label: '📖 序', desc: '鐵盒解鎖跨局繼承角色' },
                  { name: '煙花易冷', label: '🎆 煙花易冷' },
                  { name: '晴天', label: '☀️ 晴天', desc: '持本草綱目拖曳驅散下雨天獲彩虹' },
                  { name: '公主病', label: '👑 公主病', desc: '古堡任務道具' },
                ].map((item) => (
                  <button
                    key={item.name}
                    onClick={() => toggleItem(item.name)}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                      isHeld(item.name)
                        ? 'bg-purple-950/70 border-purple-500/80 text-purple-200 shadow-[0_0_8px_rgba(168,85,247,0.2)]'
                        : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <span>{isHeld(item.name) ? '✓' : '○'}</span>
                    <span>{item.label}</span>
                    <span className="text-[10px] font-normal opacity-70">
                      {isHeld(item.name) ? '持有' : '開啟'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 5: 傳奇主線與大滿貫捷徑 */}
          <div className="bg-black/50 border border-stone-800/90 rounded-xl p-3 flex flex-col gap-2 shrink-0">
            <div className="text-xs font-bold text-amber-300/90 flex items-center justify-between">
              <span>🏆 傳奇主線與大滿貫捷徑（點擊直接設定，關閉後即刻顯現結算）</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  onTriggerGrandSlam();
                  showFeedback('已達成【全路線大滿貫】！關閉控制台即可看見終極結算！');
                }}
                className="text-xs bg-gradient-to-r from-amber-600 via-[#d4af37] to-amber-500 hover:brightness-110 text-stone-950 px-3.5 py-2 rounded-lg cursor-pointer font-black shadow-md flex items-center gap-1.5 transition-all active:scale-95"
                title="立即將三條主線寫入通關紀錄並直接展示全路線大滿貫結算！"
              >
                <span>👑</span>
                <span>直接達成【全路線大滿貫】終極結算</span>
              </button>
              <button
                onClick={() => {
                  onTriggerBoss();
                  showFeedback('已跳轉至第 30 回合決戰【將軍】！關閉控制台進行戰鬥');
                }}
                className="text-xs bg-red-950 hover:bg-red-800 text-red-200 border border-red-700 px-3 py-2 rounded-lg cursor-pointer font-bold flex items-center gap-1 transition-colors"
              >
                <span>⚡</span>
                <span>直跳第30回合決戰【將軍】</span>
              </button>
              <button
                onClick={() => {
                  onTriggerVictory('太陽之子');
                  showFeedback('已觸發《太陽之子》通關！');
                }}
                className="text-xs bg-amber-950 hover:bg-amber-800 text-amber-200 border border-amber-700 px-3 py-2 rounded-lg cursor-pointer font-bold transition-colors"
              >
                ☀️ 達成《太陽之子》通關
              </button>
              <button
                onClick={() => {
                  onTriggerVictory('最偉大的作品');
                  showFeedback('已觸發《最偉大的作品》通關！');
                }}
                className="text-xs bg-purple-950 hover:bg-purple-800 text-purple-200 border border-purple-700 px-3 py-2 rounded-lg cursor-pointer font-bold transition-colors"
              >
                🎨 達成《最偉大的作品》通關
              </button>
              <button
                onClick={() => {
                  onTriggerVictory('周杰倫家庭');
                  showFeedback('已觸發《周杰倫家庭》通關！');
                }}
                className="text-xs bg-rose-950 hover:bg-rose-800 text-rose-200 border border-rose-700 px-3 py-2 rounded-lg cursor-pointer font-bold transition-colors"
              >
                🏠 達成《周杰倫家庭》通關
              </button>
              {onTestDrawChopin && (
                <button
                  onClick={() => {
                    onTestDrawChopin();
                    showFeedback('已觸發【11月的蕭邦】SS 角色覺醒視窗！');
                  }}
                  className="text-xs bg-yellow-950/80 hover:bg-yellow-800 text-yellow-200 border border-yellow-600 px-3 py-2 rounded-lg cursor-pointer font-bold flex items-center gap-1 shadow-sm transition-colors"
                >
                  <span>✨</span>
                  <span>測試抽中【11月的蕭邦】(SS特效)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* LOWER SECTION: 卡牌區 (版面縮小，主要以搜尋與滾動操作) */}
        {/* ========================================================= */}
        <div className="h-[210px] sm:h-[230px] shrink-0 flex flex-col overflow-hidden pt-2.5 gap-2">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="搜尋曲名、專輯或編號 (如 C2000-01、龍戰騎士)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && search.trim()) {
                    addRecentSearch(search);
                  }
                }}
                onBlur={() => {
                  if (search.trim()) {
                    addRecentSearch(search);
                  }
                }}
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

          <div className="text-[11px] text-stone-400 flex flex-wrap items-center justify-between gap-1 px-1 shrink-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-stone-400">最近搜尋：</span>
              {recentSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setFilterType('全部');
                    setSearch(term);
                    addRecentSearch(term);
                  }}
                  className="px-1.5 py-0.5 rounded bg-stone-900 hover:bg-amber-950/80 border border-stone-800 hover:border-amber-600/70 text-amber-200 text-[10px] cursor-pointer transition-colors"
                >
                  {term}
                </button>
              ))}
              {recentSearches.length > 0 && (
                <button
                  onClick={() => {
                    setRecentSearches([]);
                    try {
                      localStorage.removeItem(RECENT_SEARCHES_KEY);
                    } catch {}
                  }}
                  title="清除搜尋紀錄"
                  className="px-1 text-[10px] text-stone-500 hover:text-stone-300 cursor-pointer"
                >
                  ✕ 清除
                </button>
              )}
            </div>
            <span className="text-amber-400 font-mono text-[10px]">
              點擊直接於牌桌強制翻開卡牌
            </span>
          </div>

          {/* Cards Grid - 緊湊高密度排列 */}
          <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 text-xs">
            {filteredCards.map((card) => (
              <div
                key={card.id}
                className="p-2 rounded-lg bg-[#0f0e11] border border-stone-800 hover:border-red-700/60 flex flex-col justify-between transition-colors shadow-sm"
              >
                <div>
                  <div className="flex justify-between items-start gap-1">
                    <span className="font-bold text-stone-200 truncate text-[11px] sm:text-xs">
                      {card.name}
                    </span>
                    <span className="text-[9px] text-amber-400 font-mono px-1 rounded bg-stone-900 shrink-0">
                      {card.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-stone-500 font-mono mt-0.5">
                    <span className="truncate">{card.album}</span>
                    <span className="text-stone-400 font-bold ml-1 shrink-0">{card.id}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    addRecentSearch(card.name);
                    onForceDrawCard(card);
                    showFeedback(`已於牌桌翻開【${card.name}】！`);
                  }}
                  className="mt-1.5 w-full py-1 bg-red-950/80 hover:bg-red-800 text-red-200 border border-red-800/80 rounded text-[10px] font-bold cursor-pointer transition-colors"
                >
                  ⚡ 強制翻開
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
