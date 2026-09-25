import React from 'react';
import { CardDefinition, GameState } from '../types';
import { ALBUMS } from '../data/albums';

interface CardDisplayProps {
  card: CardDefinition;
  gameState: GameState;
  onSelectOption: (optionIndex: number) => void;
  onClose?: () => void;
}

export const CardDisplay: React.FC<CardDisplayProps> = ({
  card,
  gameState,
  onSelectOption,
}) => {
  if (!card) return null;

  const albumMeta = ALBUMS[card.album] || {
    name: card.album,
    year: card.year,
    themeColor: 'from-stone-900 to-black',
    accentColor: '#d4af37',
    badgeColor: 'bg-stone-800 text-stone-300 border-stone-600',
  };

  // Determine top context badge as strictly defined in Turns 12-13
  const getContextTitle = () => {
    switch (card.type) {
      case '遭遇':
        return { text: '遭遇到！', color: 'text-red-400 border-red-500/50 bg-red-950/80 shadow-[0_0_15px_rgba(239,68,68,0.2)]' };
      case '物品':
        return { text: '獲得了！', color: 'text-amber-300 border-amber-500/50 bg-amber-950/80 shadow-[0_0_15px_rgba(245,158,11,0.2)]' };
      case '事件':
        return { text: '發生了！', color: 'text-sky-300 border-sky-500/50 bg-sky-950/80 shadow-[0_0_15px_rgba(14,165,233,0.2)]' };
      case '日記':
        return { text: '解鎖日記！', color: 'text-emerald-300 border-emerald-500/50 bg-emerald-950/80 shadow-[0_0_15px_rgba(16,185,129,0.2)]' };
      case '線索':
        return { text: '拾獲線索！', color: 'text-purple-300 border-purple-500/50 bg-purple-950/80 shadow-[0_0_15px_rgba(168,85,247,0.2)]' };
      default:
        return { text: '顯現了！', color: 'text-stone-200 border-stone-600 bg-stone-900/80' };
    }
  };

  const contextTitle = getContextTitle();

  // Check if option is available
  const checkOptionAvailable = (option: CardDefinition['options'] extends (infer U)[] ? U : never) => {
    if (!option.require) return { available: true };
    const r = option.require;

    if (r.minAp !== undefined && gameState.stats.ap < r.minAp) {
      return { available: false, reason: r.unavailableReason || '行動力不足' };
    }
    if (r.character && gameState.character?.name !== r.character) {
      return { available: false, reason: r.unavailableReason || `需化身為【${r.character}】` };
    }
    if (r.notCharacter && gameState.character?.name === r.notCharacter) {
      return { available: false, reason: r.unavailableReason || `【${r.notCharacter}】無法選擇此項` };
    }
    if (r.item) {
      const currentCount =
        r.item === '時光機'
          ? (gameState.inventory['時光機'] || 0) + (gameState.inventory['飛行時光機'] || 0)
          : gameState.inventory[r.item] || 0;
      const neededCount = r.itemCount || 1;
      if (currentCount < neededCount) {
        return { available: false, reason: r.unavailableReason };
      }
    }
    if (r.notItem && (gameState.inventory[r.notItem] || 0) > 0) {
      return { available: false, reason: r.unavailableReason || `已持有【${r.notItem}】無法選擇` };
    }
    if (r.items && r.items.length > 0) {
      const missing = r.items.filter((item) => !(gameState.inventory[item] > 0));
      if (missing.length > 0) {
        return { available: false, reason: r.unavailableReason };
      }
    }
    if (r.flag) {
      const flagVal = gameState.flags[r.flag];
      const requiredVal = r.flagValue !== undefined ? r.flagValue : true;
      if (flagVal !== requiredVal) {
        return { available: false, reason: r.unavailableReason || '未滿足特定前置劇情條件' };
      }
    }
    if (r.notFlag) {
      if (Boolean(gameState.flags[r.notFlag])) {
        return { available: false, reason: r.unavailableReason || '已觸發互斥劇情條件' };
      }
    }
    if (r.flag2) {
      const flagVal = gameState.flags[r.flag2];
      const requiredVal = r.flag2Value !== undefined ? r.flag2Value : true;
      if (flagVal !== requiredVal) {
        return { available: false, reason: r.unavailableReason || '未滿足第二階段前置條件' };
      }
    }

    return { available: true };
  };

  // Dynamic flavor text (e.g. 龍戰騎士: 宿命之人 vs 一般抽卡)
  const displayFlavorText = (() => {
    if (card.id === 'C2008-01') {
      if (gameState.flags['dragon_awakened']) {
        return '「你已成為了龍，將與我宿命一決！」龍戰騎士熾熱的龍息封鎖了一切退路。';
      } else {
        return '「你還不是宿命之人！」龍戰騎士居高臨下冷冷凝視你，狂暴的龍息阻隔了前路。';
      }
    }
    return card.flavorText;
  })();

  return (
    <div className="w-full flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
      {/* 1. Context Badge MOVED OUTSIDE THE CARD (as specifically noted in red pen: 移出圖卡) */}
      <div className="flex items-center justify-center">
        <span
          className={`text-sm lg:text-base font-black tracking-widest px-4 py-1 rounded-full border ${contextTitle.color}`}
        >
          ✦ {contextTitle.text} ✦
        </span>
      </div>

      {/* 2. Main Card Body */}
      <div
        id="revealed-card-display"
        className="w-full max-w-xl flex flex-col bg-gradient-to-b from-[#1c1b1f] via-[#141416] to-[#0c0c0e] border-2 border-[#4a4026] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden transition-all"
      >
        {/* Album Artwork & Song Hero Header */}
        <div
          className={`relative w-full h-40 bg-gradient-to-br ${albumMeta.themeColor} flex items-center justify-between px-7 border-b border-stone-800 overflow-hidden`}
        >
          {/* Decorative Vinyl Disc Graphic or Album Cover */}
          {card.coverImage ? (
            <div className="absolute right-4 top-4 bottom-4 w-32 h-32 rounded-xl overflow-hidden border-2 border-amber-500/50 shadow-2xl shrink-0 z-0">
              <img
                src={card.coverImage}
                alt={card.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="absolute -right-6 -bottom-6 w-44 h-44 rounded-full border-4 border-black/80 bg-zinc-950/90 shadow-2xl flex items-center justify-center opacity-85">
              <div className="w-28 h-28 rounded-full border border-zinc-700/60 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
                  <span className="text-[10px] text-[#d4af37] font-mono font-bold">JAY</span>
                </div>
              </div>
            </div>
          )}

          {/* Hero Song Title & Album Info */}
          <div className="relative z-10 flex flex-col pr-16">
            {/* Card ID and Environment Badge on top-left */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-amber-200 bg-black/70 border border-amber-800/80 px-2.5 py-0.5 rounded-md shadow-sm">
                {card.id}
              </span>
              {card.hasEnvironmentEffect && (
                <span className="text-[11px] font-mono font-bold text-red-300 bg-red-950/90 border border-red-700/80 px-2 py-0.5 rounded-md shadow-sm animate-pulse flex items-center gap-1">
                  <span>⚡</span>
                  <span>環境變化{card.environmentEffectName ? `・${card.environmentEffectName}` : ''}</span>
                </span>
              )}
            </div>

            {/* Song Title as the Hero Focus */}
            <h2 className="text-2xl sm:text-3xl font-black text-amber-100 drop-shadow font-serif tracking-wide mt-2">
              {card.name}
            </h2>

            {/* Reference Info */}
            <p className="text-xs text-stone-300/90 font-medium tracking-wide mt-1 drop-shadow-sm font-sans">
              {card.track === 'SS'
                ? `收錄於 ${card.year}年《${card.album}》【傳奇神專卡】`
                : `收錄於 ${card.year}年《${card.album}》 第 ${card.track} 首`}
            </p>
          </div>
        </div>

        {/* 3. Flavor Text / Story Lyrics Box */}
        <div className="p-5">
          <div className="bg-[#121215] p-4 rounded-xl border border-stone-800/80 text-sm text-stone-300 leading-relaxed font-sans shadow-inner">
            {displayFlavorText}
          </div>
        </div>

        {/* 4. Interactive Options Area */}
        <div className="px-5 pb-5 flex flex-col gap-2.5">
          {(() => {
            const isDragonPunch = card.id === 'C2002-04';
            const isHero = gameState.character?.name === '英雄';
            const isHeroWithTape = isHero && Boolean(gameState.inventory['免費教學錄影帶']);

            const rawOptions = (card.options || []).map((opt, originalIdx) => {
              if (isDragonPunch) {
                // 龍拳 (C2002-04)：
                // 選項 0 (我把天地拆封將長江水掏空) 與 1 (將 東方 的日出調整了時空)：正常可顯示點選觸發，無紅字
                // 選項 2 (等待英雄 我就是那條龍)：僅英雄角色出現且可點選，無紅字
                // 選項 3 (我 右拳打開了天 化身為龍)：僅非英雄角色出現且可點選，無紅字
                if (originalIdx === 0 || originalIdx === 1) {
                  return { opt, originalIdx, check: { available: true } };
                }
                if (originalIdx === 2) {
                  return { opt, originalIdx, check: { available: isHero } };
                }
                if (originalIdx === 3) {
                  return { opt, originalIdx, check: { available: !isHero } };
                }
              }

              if (card.id === 'C2001-04' && gameState.flags['ninja_confrontation']) {
                // 忍者對峙：英雄且持有【免費教學錄影帶】時天賦生效，赤手空拳亦可突圍，毋需雙截棍即可攔截
                if (originalIdx === 0 && isHeroWithTape) {
                  return {
                    opt: {
                      ...opt,
                      text: '英雄天賦：赤手空拳攔截飛躍的忍者',
                    },
                    originalIdx,
                    check: { available: true },
                  };
                }
              }

              return {
                opt,
                originalIdx,
                check: checkOptionAvailable(opt),
              };
            });

            // Filter options: hide if hideWhenUnavailable is true and check is not available,
            // or if options require specific items/cards that the player does not possess (to avoid spoiling key items)
            const visibleOptions = rawOptions.filter((item) => {
              if (isDragonPunch) {
                if (item.originalIdx === 2) return isHero;
                if (item.originalIdx === 3) return !isHero;
                return true;
              }

              // 忍者 (C2001-04)：追上對峙階段 (ninja_confrontation)
              if (card.id === 'C2001-04' && gameState.flags['ninja_confrontation']) {
                if (isHeroWithTape) {
                  // 英雄持有免費教學錄影帶啟動天賦，顯示制伏選項 0，隱藏未持有雙截棍逃離選項 1
                  if (item.originalIdx === 0) return true;
                  if (item.originalIdx === 1) return false;
                }
              }

              // 米蘭的小鐵匠 (C2002-09)：若小鐵鋪已經常駐解鎖，則不顯示「指引小鐵匠」
              if (card.id === 'C2002-09' && item.opt.text.includes('指引小鐵匠')) {
                if (gameState.blacksmithUnlocked || gameState.flags['blacksmith_unlocked']) {
                  return false;
                }
              }

              const req = item.opt.require;
              if (!req) return true;
              if (req.hideWhenUnavailable && !item.check.available) {
                return false;
              }

              // 任何需要特定道具但玩家未持有的選項：
              // 若未指定非劇透的抽象提示(unavailableReason)，則直接隱藏避免洩漏具體道具名稱；
              // 若有明確指定抽象提示（例如「缺少可餵食的東西」），則正常顯示讓玩家探索解謎！
              if (
                !item.check.available &&
                (req.item || (req.items && req.items.length > 0)) &&
                !req.unavailableReason
              ) {
                return false;
              }

              // Mutually exclusive story branches
              if (req.flag && gameState.flags[req.flag] !== (req.flagValue ?? true)) {
                return false;
              }
              if (req.notFlag && Boolean(gameState.flags[req.notFlag])) {
                return false;
              }
              return true;
            });

            // 針對龍戰騎士 (C2008-01)：若身上完全沒有任何克制或抵禦道具，不爆雷洩漏關鍵道具名稱，提供正面承受攻擊選項
            if (card.id === 'C2008-01' && visibleOptions.length === 0) {
              const hasSweater = (gameState.inventory['黑色毛衣'] || 0) > 0;
              return (
                <button
                  id="card-option-dragon-knight-attacked"
                  onClick={() => onSelectOption(-2)}
                  className="w-full text-left px-4 py-3 rounded-xl border border-red-700/80 bg-red-950/50 hover:bg-red-900/60 text-red-100 font-medium text-sm transition-all duration-200 flex flex-col gap-1 shadow-sm active:scale-[0.99] cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold text-sm font-sans">
                      無合適道具抵禦，正面承受巨龍咆哮與烈焰猛攻
                    </span>
                    <span className="text-xs font-mono text-red-400 font-bold ml-2 shrink-0">
                      {hasSweater ? '(黑色毛衣抵擋)' : '(行動力 -8)'}
                    </span>
                  </div>
                </button>
              );
            }

            if (visibleOptions.length > 0) {
              return visibleOptions.map(({ opt, originalIdx, check }) => (
                <button
                  key={originalIdx}
                  id={`card-option-${originalIdx}`}
                  disabled={!check.available}
                  onClick={() => check.available && onSelectOption(originalIdx)}
                  className={`w-full text-left px-4 py-3 rounded-xl border font-medium text-sm transition-all duration-200 flex flex-col gap-1 shadow-sm ${
                    check.available
                      ? 'bg-[#1d1c1a] hover:bg-[#2c281d] text-amber-100 border-[#6b5820] hover:border-[#d4af37] hover:shadow-[0_0_15px_rgba(212,175,55,0.2)] active:scale-[0.99] cursor-pointer'
                      : 'bg-stone-900/60 text-stone-500 border-stone-800/80 cursor-not-allowed opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold text-sm font-sans">
                      {opt.text}
                    </span>
                    {!check.available &&
                      check.reason &&
                      !check.reason.includes('信物') &&
                      !check.reason.includes('道具') &&
                      !check.reason.includes('物品') && (
                        <span className="text-xs font-mono text-red-400/90 font-bold ml-2 shrink-0">
                          ({check.reason})
                        </span>
                      )}
                  </div>
                </button>
              ));
            }

            return (
              <button
                id="card-option-default"
                onClick={() => onSelectOption(-1)}
                className="w-full py-3 rounded-xl bg-[#d4af37] text-stone-950 font-bold text-sm hover:bg-amber-300 transition-colors shadow-[0_4px_12px_rgba(212,175,55,0.3)] cursor-pointer text-center font-serif"
              >
                收入行囊，繼續前進
              </button>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
