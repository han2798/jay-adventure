import React, { useState, useEffect } from 'react';
import { GoldCoinIcon } from './GoldCoinIcon';
import { NunchakuIcon } from './NunchakuIcon';

export interface GoldTownReward {
  foundItems: string[];
  foundCoins: number;
}

interface GoldTownDigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (reward: GoldTownReward) => void;
  currentPageTarget?: 'first_page' | 'sixth_page' | 'seventh_page' | 'preface' | null;
}

export type DigTileType =
  | 'bottle'
  | 'porcelain'
  | 'calligraphy'
  | 'first_page'
  | 'sixth_page'
  | 'seventh_page'
  | 'preface'
  | 'nunchaku'
  | 'black_sweater'
  | 'compendium_of_materia_medica'
  | 'scrap_paper'
  | 'coin'
  | 'empty';

interface DigTile {
  id: number;
  type: DigTileType;
  revealed: boolean;
}

// 產生隨機 6x6 挖寶區 (共 36 格)：
// 空瓶*1, 金幣*10, 青花瓷*1, 蘭亭序*1, 雙截棍*1,
// 頁籤*1 (或第六頁/第七頁/序，嚴格按順序出現不並存),
// 黑色毛衣*2, 本草綱目*1, 廢紙*3, 空格*15 (若無待擴充頁籤則為空格*16)
const generateGrid = (
  currentPageTarget?: 'first_page' | 'sixth_page' | 'seventh_page' | 'preface' | null
): DigTile[] => {
  const items: DigTileType[] = [
    'bottle', // 空瓶*1
    'porcelain', // 青花瓷*1
    'calligraphy', // 蘭亭序*1
    'nunchaku', // 雙截棍*1
    'black_sweater', // 黑色毛衣*2
    'black_sweater',
    'compendium_of_materia_medica', // 本草綱目*1
    'scrap_paper', // 廢紙*3 (讓下雨天狀態消耗用紙)
    'scrap_paper',
    'scrap_paper',
    ...Array(10).fill('coin' as DigTileType), // 金幣*10
  ];

  if (currentPageTarget) {
    items.push(currentPageTarget); // 頁籤*1 (第一頁、第六頁、第七頁、序 依序出現不並存)
    items.push(...Array(15).fill('empty' as DigTileType)); // 空格*15
  } else {
    items.push(...Array(16).fill('empty' as DigTileType)); // 若無待擴充頁籤則為空格*16
  }

  // Fisher-Yates 隨機洗牌
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }

  return items.map((type, index) => ({
    id: index,
    type,
    revealed: false,
  }));
};

export const GoldTownDigModal: React.FC<GoldTownDigModalProps> = ({
  isOpen,
  onClose: _onClose,
  onComplete,
  currentPageTarget,
}) => {
  const [grid, setGrid] = useState<DigTile[]>(() => generateGrid(currentPageTarget));
  const [digsRemaining, setDigsRemaining] = useState<number>(10);
  const [foundItems, setFoundItems] = useState<string[]>([]);
  const [foundCoins, setFoundCoins] = useState<number>(0);
  const [lastDugMessage, setLastDugMessage] = useState<React.ReactNode | null>(null);
  const [isMapRevealed, setIsMapRevealed] = useState<boolean>(false);

  // 當視窗重新開啟時，重新生成 6x6 挖寶區並重置狀態
  useEffect(() => {
    if (isOpen) {
      setGrid(generateGrid(currentPageTarget));
      setDigsRemaining(10);
      setFoundItems([]);
      setFoundCoins(0);
      setLastDugMessage(null);
      setIsMapRevealed(false);
    }
  }, [isOpen, currentPageTarget]);

  const handleFinish = () => {
    onComplete({
      foundItems,
      foundCoins,
    });
  };

  // 監聽 ESC 鍵：當 10 次挖掘耗盡或全圖揭曉時，按下 ESC 安全結算
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (digsRemaining === 0 || isMapRevealed)) {
        e.preventDefault();
        e.stopPropagation();
        handleFinish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, foundItems, foundCoins, digsRemaining, isMapRevealed]);

  if (!isOpen) return null;

  const handleDigTile = (index: number) => {
    if (digsRemaining <= 0 || isMapRevealed) return;
    if (grid[index]?.revealed) return;

    const target = grid[index];
    const newGrid = [...grid];
    newGrid[index] = { ...target, revealed: true };
    setGrid(newGrid);

    const nextDigs = digsRemaining - 1;
    setDigsRemaining(nextDigs);

    if (target.type === 'bottle') {
      setFoundItems((prev) => [...prev, '空瓶']);
      setLastDugMessage(
        <span className="flex items-center justify-center gap-1.5">
          <span>🍾</span>
          <span>【驚喜出土】在砂石層中發掘出一只澄澈無瑕的【空瓶】！</span>
        </span>
      );
    } else if (target.type === 'porcelain') {
      setFoundItems((prev) => [...prev, '青花瓷']);
      setLastDugMessage(
        <span className="flex items-center justify-center gap-1.5">
          <span>🏺</span>
          <span>【驚喜出土】挖出了晶瑩剔透的古董【青花瓷】！</span>
        </span>
      );
    } else if (target.type === 'calligraphy') {
      setFoundItems((prev) => [...prev, '蘭亭序']);
      setLastDugMessage(
        <span className="flex items-center justify-center gap-1.5">
          <span>📜</span>
          <span>【絕世珍寶】挖出了書聖傳世之作【蘭亭序】！</span>
        </span>
      );
    } else if (target.type === 'first_page') {
      setFoundItems((prev) => [...prev, '第一頁']);
      setLastDugMessage(
        <span className="flex items-center justify-center gap-1.5">
          <span>📑</span>
          <span>【泛黃頁籤】在土層深處發掘出散發書香的【第一頁】！</span>
        </span>
      );
    } else if (target.type === 'sixth_page') {
      setFoundItems((prev) => [...prev, '第六頁']);
      setLastDugMessage(
        <span className="flex items-center justify-center gap-1.5">
          <span>📑</span>
          <span>【泛黃頁籤】在碎石岩縫中發掘出珍貴的【第六頁】！</span>
        </span>
      );
    } else if (target.type === 'seventh_page') {
      setFoundItems((prev) => [...prev, '第七頁']);
      setLastDugMessage(
        <span className="flex items-center justify-center gap-1.5">
          <span>📑</span>
          <span>【泛黃頁籤】在礦脈深處發掘出斑駁的【第七頁】！</span>
        </span>
      );
    } else if (target.type === 'preface') {
      setFoundItems((prev) => [...prev, '序']);
      setLastDugMessage(
        <span className="flex items-center justify-center gap-1.5">
          <span>📖</span>
          <span>【時空之序】在金礦之巔發掘出神秘的傳奇【序】！</span>
        </span>
      );
    } else if (target.type === 'nunchaku') {
      setFoundItems((prev) => [...prev, '雙截棍']);
      setLastDugMessage(
        <span className="flex items-center justify-center gap-1.5">
          <NunchakuIcon className="w-5 h-5 shrink-0" />
          <span>【兵刃現世】哼哼哈兮！在岩壁中拔出了精鋼【雙截棍】！</span>
        </span>
      );
    } else if (target.type === 'black_sweater') {
      setFoundItems((prev) => [...prev, '黑色毛衣']);
      setLastDugMessage(
        <span className="flex items-center justify-center gap-1.5">
          <span>🧶</span>
          <span>【溫暖重現】在舊木箱中尋獲了保存完好的【黑色毛衣】！</span>
        </span>
      );
    } else if (target.type === 'compendium_of_materia_medica') {
      setFoundItems((prev) => [...prev, '本草綱目']);
      setLastDugMessage(
        <span className="flex items-center justify-center gap-1.5">
          <span>📚</span>
          <span>【草本典籍】在沉積岩中挖出了古樸醫典【本草綱目】！</span>
        </span>
      );
    } else if (target.type === 'scrap_paper') {
      setFoundItems((prev) => [...prev, '廢紙']);
      setLastDugMessage(
        <span className="flex items-center justify-center gap-1.5">
          <span>📄</span>
          <span>【翻出廢紙】在碎石堆中翻出了一張泛黃破損的【廢紙】！</span>
        </span>
      );
    } else if (target.type === 'coin') {
      setFoundCoins((prev) => prev + 1);
      setLastDugMessage(
        <span className="flex items-center justify-center gap-1.5">
          <GoldCoinIcon className="w-4 h-4 shrink-0" />
          <span>【淘得真金】在砂土碎石中拾獲 1 枚燦爛的金幣！</span>
        </span>
      );
    } else {
      setLastDugMessage(
        <span className="flex items-center justify-center gap-1.5">
          <span>💨</span>
          <span>只有飛揚的塵土與沙石，一無所獲。</span>
        </span>
      );
    }

    // 若 10 次挖掘耗盡，自動掀開全圖真相供玩家檢閱
    if (nextDigs === 0) {
      setIsMapRevealed(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#1c1917] via-[#141210] to-[#0c0a09] border-2 border-amber-600/70 rounded-2xl p-4 sm:p-6 shadow-[0_0_50px_rgba(217,119,6,0.3)] flex flex-col gap-4 text-stone-200 max-h-[95vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-800/40 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⛏️</span>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-serif text-amber-200 tracking-wider">
                ✦ 淘金小鎮・荒野礦坑 ✦
              </h2>
              <p className="text-xs text-amber-400/80 font-sans">
                管他多少金礦 全都拿來鑄造成Crown！
              </p>
            </div>
          </div>

          {(digsRemaining === 0 || isMapRevealed) ? (
            <button
              onClick={handleFinish}
              className="text-stone-400 hover:text-stone-200 text-sm px-2.5 py-1 rounded-lg bg-stone-800/70 hover:bg-stone-700 cursor-pointer border border-stone-700/60"
              title="完成探勘並結算"
            >
              ✕
            </button>
          ) : (
            <span className="text-[11px] text-amber-400/80 bg-amber-950/40 border border-amber-800/40 px-2.5 py-1 rounded-lg font-mono">
              探勘中 (需挖滿 10 次)
            </span>
          )}
        </div>

        {/* Status Bar */}
        <div className="grid grid-cols-3 gap-2 bg-amber-950/30 border border-amber-700/40 p-2.5 rounded-xl text-center text-xs">
          <div className="flex flex-col items-center justify-center">
            <span className="text-stone-400 text-[11px]">剩餘次數</span>
            <span className="font-mono text-base font-bold text-amber-300">
              {digsRemaining} / 10
            </span>
          </div>
          <div className="flex flex-col items-center justify-center border-x border-amber-800/30">
            <span className="text-stone-400 text-[11px]">已獲金幣</span>
            <span className="font-mono text-base font-bold text-yellow-400 flex items-center gap-1.5">
              <GoldCoinIcon className="w-4 h-4" />
              <span>{foundCoins} 枚</span>
            </span>
          </div>
          <div className="flex flex-col items-center justify-center">
            <span className="text-stone-400 text-[11px]">已掘寶物</span>
            <span className="font-bold text-emerald-300 text-xs truncate max-w-full px-1">
              {foundItems.length > 0 ? foundItems.join('、') : '無'}
            </span>
          </div>
        </div>

        {/* Feedback / Reveal Banner */}
        {isMapRevealed ? (
          <div className="bg-amber-950/80 border border-amber-500/70 px-3 py-1.5 rounded-lg text-xs text-amber-200 text-center font-sans animate-in fade-in flex items-center justify-center gap-1.5 shadow-sm">
            <span>🔍</span>
            <span className="font-bold">礦坑全貌已揭曉！未發掘的寶物與金幣已標示於礦坑中（半透明處）。</span>
          </div>
        ) : lastDugMessage ? (
          <div className="bg-amber-900/20 border border-amber-600/40 px-3 py-1.5 rounded-lg text-xs text-amber-200 text-center font-sans animate-in fade-in flex items-center justify-center min-h-[32px]">
            {lastDugMessage}
          </div>
        ) : null}

        {/* 6x6 Digging Grid (36 Tiles) */}
        <div className="bg-black/60 p-3 rounded-xl border border-amber-900/50 shadow-inner">
          <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
            {grid.map((tile, idx) => {
              if (tile.revealed) {
                // 已挖開
                if (tile.type === 'bottle') {
                  return (
                    <div
                      key={tile.id}
                      className="aspect-square rounded-lg bg-sky-950/80 border-2 border-sky-400 flex flex-col items-center justify-center shadow-[0_0_12px_rgba(56,189,248,0.5)] p-0.5"
                    >
                      <span className="text-xl sm:text-2xl">🍾</span>
                      <span className="text-[9px] sm:text-[10px] text-sky-300 font-bold truncate">
                        空瓶
                      </span>
                    </div>
                  );
                }
                if (tile.type === 'porcelain') {
                  return (
                    <div
                      key={tile.id}
                      className="aspect-square rounded-lg bg-emerald-950/80 border-2 border-emerald-400 flex flex-col items-center justify-center shadow-[0_0_12px_rgba(52,211,153,0.5)] p-0.5"
                    >
                      <span className="text-xl sm:text-2xl">🏺</span>
                      <span className="text-[9px] sm:text-[10px] text-emerald-300 font-bold truncate">
                        青花瓷
                      </span>
                    </div>
                  );
                }
                if (tile.type === 'calligraphy') {
                  return (
                    <div
                      key={tile.id}
                      className="aspect-square rounded-lg bg-amber-950/80 border-2 border-amber-400 flex flex-col items-center justify-center shadow-[0_0_12px_rgba(251,191,36,0.5)] p-0.5"
                    >
                      <span className="text-xl sm:text-2xl">📜</span>
                      <span className="text-[9px] sm:text-[10px] text-amber-300 font-bold truncate">
                        蘭亭序
                      </span>
                    </div>
                  );
                }
                if (tile.type === 'first_page') {
                  return (
                    <div
                      key={tile.id}
                      className="aspect-square rounded-lg bg-cyan-950/80 border-2 border-cyan-400 flex flex-col items-center justify-center shadow-[0_0_12px_rgba(34,211,238,0.5)] p-0.5"
                    >
                      <span className="text-xl sm:text-2xl">📑</span>
                      <span className="text-[9px] sm:text-[10px] text-cyan-300 font-bold truncate">
                        第一頁
                      </span>
                    </div>
                  );
                }
                if (tile.type === 'sixth_page') {
                  return (
                    <div
                      key={tile.id}
                      className="aspect-square rounded-lg bg-indigo-950/80 border-2 border-indigo-400 flex flex-col items-center justify-center shadow-[0_0_12px_rgba(129,140,248,0.5)] p-0.5"
                    >
                      <span className="text-xl sm:text-2xl">📑</span>
                      <span className="text-[9px] sm:text-[10px] text-indigo-300 font-bold truncate">
                        第六頁
                      </span>
                    </div>
                  );
                }
                if (tile.type === 'seventh_page') {
                  return (
                    <div
                      key={tile.id}
                      className="aspect-square rounded-lg bg-purple-950/80 border-2 border-purple-400 flex flex-col items-center justify-center shadow-[0_0_12px_rgba(192,132,252,0.5)] p-0.5"
                    >
                      <span className="text-xl sm:text-2xl">📑</span>
                      <span className="text-[9px] sm:text-[10px] text-purple-300 font-bold truncate">
                        第七頁
                      </span>
                    </div>
                  );
                }
                if (tile.type === 'preface') {
                  return (
                    <div
                      key={tile.id}
                      className="aspect-square rounded-lg bg-yellow-950/90 border-2 border-yellow-300 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(253,224,71,0.6)] p-0.5"
                    >
                      <span className="text-xl sm:text-2xl">📖</span>
                      <span className="text-[9px] sm:text-[10px] text-yellow-200 font-black truncate">
                        序
                      </span>
                    </div>
                  );
                }
                if (tile.type === 'nunchaku') {
                  return (
                    <div
                      key={tile.id}
                      className="aspect-square rounded-lg bg-red-950/80 border-2 border-red-400 flex flex-col items-center justify-center shadow-[0_0_12px_rgba(248,113,113,0.5)] p-0.5"
                    >
                      <NunchakuIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span className="text-[9px] sm:text-[10px] text-red-300 font-bold truncate">
                        雙截棍
                      </span>
                    </div>
                  );
                }
                if (tile.type === 'black_sweater') {
                  return (
                    <div
                      key={tile.id}
                      className="aspect-square rounded-lg bg-stone-900 border-2 border-stone-400 flex flex-col items-center justify-center shadow-[0_0_12px_rgba(168,162,158,0.5)] p-0.5"
                    >
                      <span className="text-xl sm:text-2xl">🧶</span>
                      <span className="text-[9px] sm:text-[10px] text-stone-300 font-bold truncate">
                        黑色毛衣
                      </span>
                    </div>
                  );
                }
                if (tile.type === 'compendium_of_materia_medica') {
                  return (
                    <div
                      key={tile.id}
                      className="aspect-square rounded-lg bg-teal-950/80 border-2 border-teal-400 flex flex-col items-center justify-center shadow-[0_0_12px_rgba(45,212,191,0.5)] p-0.5"
                    >
                      <span className="text-xl sm:text-2xl">📚</span>
                      <span className="text-[9px] sm:text-[10px] text-teal-300 font-bold truncate">
                        本草綱目
                      </span>
                    </div>
                  );
                }
                if (tile.type === 'scrap_paper') {
                  return (
                    <div
                      key={tile.id}
                      className="aspect-square rounded-lg bg-stone-800/90 border-2 border-stone-400 flex flex-col items-center justify-center shadow-[0_0_10px_rgba(168,162,158,0.4)] p-0.5"
                    >
                      <span className="text-xl sm:text-2xl">📄</span>
                      <span className="text-[9px] sm:text-[10px] text-stone-300 font-bold truncate">
                        廢紙
                      </span>
                    </div>
                  );
                }
                if (tile.type === 'coin') {
                  return (
                    <div
                      key={tile.id}
                      className="aspect-square rounded-lg bg-yellow-950/80 border-2 border-yellow-500 flex flex-col items-center justify-center shadow-[0_0_10px_rgba(234,179,8,0.4)] p-0.5"
                    >
                      <GoldCoinIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span className="text-[9px] sm:text-[10px] text-yellow-300 font-bold truncate">
                        +1金幣
                      </span>
                    </div>
                  );
                }
                // 空地
                return (
                  <div
                    key={tile.id}
                    className="aspect-square rounded-lg bg-stone-900/60 border border-stone-800 flex items-center justify-center opacity-60"
                  >
                    <span className="text-xs text-stone-500 font-sans">空</span>
                  </div>
                );
              }

              // 未挖開但已揭曉全圖（結算時半透明顯示真相，寶物隱藏具體名稱保留神秘感）
              if (isMapRevealed) {
                if (
                  tile.type === 'first_page' ||
                  tile.type === 'sixth_page' ||
                  tile.type === 'seventh_page' ||
                  tile.type === 'preface'
                ) {
                  return (
                    <div
                      key={tile.id}
                      className="aspect-square rounded-lg bg-amber-950/30 border border-dashed border-amber-500/60 flex flex-col items-center justify-center opacity-70 p-0.5 shadow-sm"
                      title="未掘出的鐵盒頁籤"
                    >
                      <span className="text-lg opacity-80 select-none">📑</span>
                      <span className="text-[8px] sm:text-[9px] text-amber-300 font-bold truncate">頁籤</span>
                    </div>
                  );
                }
                if (
                  tile.type === 'bottle' ||
                  tile.type === 'porcelain' ||
                  tile.type === 'calligraphy' ||
                  tile.type === 'nunchaku' ||
                  tile.type === 'black_sweater' ||
                  tile.type === 'compendium_of_materia_medica' ||
                  tile.type === 'scrap_paper'
                ) {
                  return (
                    <div
                      key={tile.id}
                      className="aspect-square rounded-lg bg-purple-950/30 border border-dashed border-purple-500/60 flex flex-col items-center justify-center opacity-70 p-0.5 shadow-sm"
                      title="未掘出的神祕寶物"
                    >
                      <span className="text-lg opacity-80 select-none">🎁</span>
                      <span className="text-[8px] sm:text-[9px] text-purple-300 font-bold truncate">寶物</span>
                    </div>
                  );
                }
                if (tile.type === 'coin') {
                  return (
                    <div
                      key={tile.id}
                      className="aspect-square rounded-lg bg-yellow-950/30 border border-dashed border-yellow-500/60 flex flex-col items-center justify-center opacity-70 p-0.5"
                      title="未挖出的金幣"
                    >
                      <GoldCoinIcon className="w-4 h-4 sm:w-5 sm:h-5 opacity-80" />
                      <span className="text-[8px] sm:text-[9px] text-yellow-400 font-bold truncate">金幣</span>
                    </div>
                  );
                }
                return (
                  <div
                    key={tile.id}
                    className="aspect-square rounded-lg bg-stone-950/40 border border-stone-800/40 flex items-center justify-center opacity-30"
                  >
                    <span className="text-[10px] text-stone-600 font-sans">空</span>
                  </div>
                );
              }

              // 未挖開泥土格子
              const canDig = digsRemaining > 0;
              return (
                <button
                  key={tile.id}
                  onClick={() => handleDigTile(idx)}
                  disabled={!canDig}
                  className={`aspect-square rounded-lg border transition-all flex items-center justify-center font-bold text-xs select-none ${
                    canDig
                      ? 'bg-gradient-to-br from-[#3b2b1d] via-[#2c1d12] to-[#1c120a] border-amber-800/80 hover:border-amber-400 hover:scale-105 active:scale-95 shadow-md hover:shadow-[0_0_10px_rgba(245,158,11,0.3)] cursor-pointer'
                      : 'bg-stone-900/40 border-stone-800 opacity-40 cursor-not-allowed'
                  }`}
                  title={canDig ? `點擊挖掘 (剩餘 ${digsRemaining} 次)` : '次數已耗盡'}
                >
                  <span className="text-amber-600/70 text-base sm:text-lg group-hover:scale-110">
                    ⛏️
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-amber-900/40">
          <span className="text-xs text-stone-400">
            {isMapRevealed ? (
              <span className="text-amber-300 font-bold">全圖已揭曉，請點擊右側確認結算</span>
            ) : digsRemaining === 0 ? (
              <span className="text-amber-300 font-bold">10 次挖掘已完成，請點擊右側進行結算</span>
            ) : (
              <span>請點擊上方礦坑方格探勘（剩餘 <span className="text-amber-400 font-mono font-bold">{digsRemaining}</span> 次）</span>
            )}
          </span>

          <div className="flex items-center gap-2">
            {isMapRevealed ? (
              <button
                onClick={handleFinish}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black text-xs font-black shadow-lg shadow-amber-900/50 transition-all cursor-pointer animate-pulse"
              >
                查看探勘結算 →
              </button>
            ) : digsRemaining > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-stone-500 bg-stone-900 px-3 py-1.5 rounded-lg border border-stone-800">
                  尚有 {digsRemaining} 次挖掘未用
                </span>
              </div>
            ) : (
              <button
                onClick={handleFinish}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black text-xs font-black shadow-lg shadow-amber-900/50 transition-all cursor-pointer animate-pulse"
              >
                帶著寶物返回冒險！
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
