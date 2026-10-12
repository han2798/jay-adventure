import React, { useMemo } from 'react';
import { GameState, MetaProgress, GameHistoryRecord, SettlementRecord, LogEntry } from '../types';
import { CARD_DATABASE, getCardIdByItemName } from '../data/cards';
import { INITIAL_SELECTABLE_CHARACTERS } from '../data/characters';
import { getSettlementGrade } from '../utils/exportSettlement';

const STORAGE_KEY_META = 'jay_chou_rpg_meta_v1';

export interface UseGameLifecycleParams {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  meta: MetaProgress;
  setMeta: React.Dispatch<React.SetStateAction<MetaProgress>>;
  addLog: (msg: string, type?: string) => void;
  selectedIronBoxItems: string[];
  setSelectedIronBoxItems: React.Dispatch<React.SetStateAction<string[]>>;
  retainCharacterInNextGame: boolean;
  setRetainCharacterInNextGame: (val: boolean) => void;
  pendingNextGameCallback: (() => void) | null;
  setPendingNextGameCallback: React.Dispatch<React.SetStateAction<((() => void) | null)>>;
  setShowIronBoxInheritModal: (show: boolean) => void;
  setShowApExhaustedModal: (show: boolean) => void;
  setShowRewindNoticeModal: (show: boolean) => void;
  triggerCardShowcase: (cardOrName: any, badgeTitle?: string, onClose?: () => void) => void;
  getIronBoxCapacity: (pages?: number) => number;
  rollThreeCards?: (state?: any, extra?: any) => any[];
  startNewRound?: (targetRound?: number, customState?: Partial<GameState>) => void;
  setShowNewGamePlusModal?: (show: boolean) => void;
  setShowCompendium?: (show: boolean) => void;
  setRewindClockNotice?: React.Dispatch<React.SetStateAction<any>>;
}

export function useGameLifecycle(params: UseGameLifecycleParams) {
  const {
    gameState,
    setGameState,
    meta,
    setMeta,
    addLog,
    selectedIronBoxItems,
    setSelectedIronBoxItems,
    retainCharacterInNextGame,
    setRetainCharacterInNextGame,
    pendingNextGameCallback,
    setPendingNextGameCallback,
    setShowIronBoxInheritModal,
    setShowApExhaustedModal,
    setShowRewindNoticeModal,
    triggerCardShowcase,
    getIronBoxCapacity,
    rollThreeCards,
    startNewRound,
    setShowNewGamePlusModal,
    setShowCompendium,
    setRewindClockNotice,
  } = params;

  const handleStartNextGame = (
    overrideIronBoxItems?: string[],
    retainCharacter?: boolean
  ) => {
    const finalOutcomeType = gameState.victoryType ? 'VICTORY' : 'DEFEAT';
    const finalOutcomeTitle = gameState.victoryType
      ? `傳奇通關 (${gameState.victoryType})`
      : gameState.defeatReason || '未達通關條件';

    const historyRecord: GameHistoryRecord = {
      gameNumber: gameState.gameNumber,
      characterName: gameState.character?.name || '未知',
      characterTitle: gameState.character?.title || '',
      characterIcon: gameState.character?.avatarIcon || '🪵',
      endRound: gameState.round,
      outcomeType: finalOutcomeType,
      outcomeTitle: finalOutcomeTitle,
      timestamp: new Date().toLocaleDateString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
      logs: [...gameState.logs],
    };

    const isGrandSlam = Object.keys(meta.routeVictoryRecords || {}).length >= 3;
    const gradeInfo = getSettlementGrade(gameState.gameNumber);

    const settlementRec: SettlementRecord = {
      id: `set_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      gameNumber: gameState.gameNumber,
      round: gameState.round,
      totalRounds: (meta.totalRoundsPlayed || 0) + gameState.round,
      outcomeType: finalOutcomeType,
      route: gameState.victoryType || '冒險結算',
      characterName: gameState.character?.name || '未知',
      characterTitle: gameState.character?.title,
      characterIcon: gameState.character?.avatarIcon || '🪵',
      timestamp: new Date().toLocaleDateString('zh-TW', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      isAllCompleted: isGrandSlam,
      grade: gradeInfo.grade as any,
      gradeTitle: gradeInfo.title,
      gradeColor: gradeInfo.color,
      itemsCount: (Object.values(gameState.inventory) as number[]).reduce((a, b) => a + Number(b), 0),
      allRecords: meta.routeVictoryRecords,
      defeatReason: gameState.defeatReason,
    };

    const inheritedItems = overrideIronBoxItems ?? meta.ironBoxItems ?? [];
    const initialInventory: Record<string, number> = {};
    const initialItemOrder: string[] = [];
    const initialPeninsulaCounts: Record<string, number> = {};

    if (inheritedItems.length > 0) {
      inheritedItems.forEach((item) => {
        const actualItem = item === '飛行時光機' ? '時光機' : item;
        initialInventory[actualItem] = (initialInventory[actualItem] || 0) + 1;
        if (!initialItemOrder.includes(actualItem)) {
          initialItemOrder.push(actualItem);
        }
        const cardId = getCardIdByItemName(actualItem);
        if (cardId) {
          initialPeninsulaCounts[cardId] = (initialPeninsulaCounts[cardId] || 0) + 1;
        }
      });
    }

    const shouldRetainCharacter = Boolean(
      retainCharacter &&
      (gameState.character || meta.ironBoxRetainedCharacter)
    );
    const activeCharacter = shouldRetainCharacter
      ? gameState.character || meta.ironBoxRetainedCharacter || null
      : null;

    setMeta((prev) => ({
      ...prev,
      pastGamesCount: prev.pastGamesCount + 1,
      totalRoundsPlayed: (prev.totalRoundsPlayed || 0) + gameState.round,
      gameHistories: [historyRecord, ...(prev.gameHistories || [])],
      settlementHistory: isGrandSlam
        ? [settlementRec, ...(prev.settlementHistory || [])]
        : (prev.settlementHistory || []),
      ironBoxItems: inheritedItems,
      ironBoxRetainedCharacter: shouldRetainCharacter ? activeCharacter : null,
    }));

    const initialFlags = { ...(meta.nextGameFlags || {}) };

    setGameState((prev) => {
      const nextGameNum = prev.gameNumber + 1;
      const initialLogs: LogEntry[] = [];

      if (shouldRetainCharacter && activeCharacter) {
        initialLogs.push({
          round: 1,
          text: `【半島鐵盒・序】跨局時空傳承發動！你維持了角色化身【${activeCharacter.name}】（${activeCharacter.title}），直接邁入第 1 回合！請抽卡！`,
          type: 'milestone',
        });
      } else {
        initialLogs.push({
          round: 0,
          text: `順勢推進，開啟第 ${nextGameNum} 局新探索！請抽取初始角色化身……`,
          type: 'milestone',
        });
      }

      if (inheritedItems.length > 0) {
        initialLogs.push({
          round: shouldRetainCharacter ? 1 : 0,
          text: `【半島鐵盒】跨局傳承生效，繼承了上一局封存的 ${inheritedItems
            .map((it) => (it === '飛行時光機' ? '時光機（由飛行時光機復原）' : it))
            .join('、')}！`,
          type: 'milestone',
        });
      }

      const initialChoices = shouldRetainCharacter && activeCharacter
        ? rollThreeCards(
            {
              ...prev,
              character: activeCharacter,
              round: 1,
              flags: initialFlags,
              inventory: initialInventory,
              itemAcquisitionOrder: initialItemOrder,
              peninsulaInheritedCounts: initialPeninsulaCounts,
              drawnCount: {},
            },
            meta
          )
        : [];

      return {
        ...prev,
        gameNumber: nextGameNum,
        round: 1,
        maxRounds: 30,
        character: activeCharacter,
        inventory: initialInventory,
        itemAcquisitionOrder: initialItemOrder,
        peninsulaInheritedCounts: initialPeninsulaCounts,
        flags: initialFlags,
        jokerSlots: { place: null, shoes: null, performance: null },
        reversedClockUsesRemaining: 3,
        stats: { ap: activeCharacter ? (activeCharacter.startingAp ?? 15) : 15, coins: 0 },
        ninjaChasing: false,
        ninjaNextEncounterRound: null,
        fireworksBurning: false,
        headacheActive: false,
        rainyWeatherActive: false,
        drenchedItemNotice: null,
        blacksmithUnlocked: false,
        goldTownUnlocked: false,
        terraceUnlocked: false,
        romanticPhoneUnlocked: false,
        terracePlot: { targetCrop: null, step: 'idle' },
        logs: initialLogs,
        phase: shouldRetainCharacter && activeCharacter ? 'DRAW_THREE' : 'CHOOSE_CHARACTER',
        revealedCard: null,
        currentDrawChoices: initialChoices,
        defeatReason: undefined,
        victoryType: undefined,
      };
    });
  };

  // Confirm AP Exhausted - forced CG end, transitions to NG (gameNumber + 1)
  const executeConfirmApExhausted = () => {
    const historyRecord: GameHistoryRecord = {
      gameNumber: gameState.gameNumber,
      characterName: gameState.character?.name || '未知',
      characterTitle: gameState.character?.title || '',
      characterIcon: gameState.character?.avatarIcon || '🪵',
      endRound: gameState.round,
      outcomeType: 'AP_DEPLETED',
      outcomeTitle: '行動力耗盡 (重生增加局數處罰)',
      timestamp: new Date().toLocaleDateString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
      logs: [...gameState.logs],
    };

    setMeta((prev) => ({
      ...prev,
      pastGamesCount: prev.pastGamesCount + 1,
      totalRoundsPlayed: (prev.totalRoundsPlayed || 0) + gameState.round,
      gameHistories: [historyRecord, ...(prev.gameHistories || [])],
    }));

    setGameState((prev) => ({
      ...prev,
      gameNumber: prev.gameNumber + 1,
      round: 1,
      maxRounds: 30,
      character: null,
      inventory: {},
      drawnCount: {},
      peninsulaInheritedCounts: {},
      flags: {},
      jokerSlots: { place: null, shoes: null, performance: null },
      reversedClockUsesRemaining: 3,
      stats: { ap: 15, coins: 0 },
      ninjaChasing: false,
      ninjaNextEncounterRound: null,
      fireworksBurning: false,
      headacheActive: false,
      blacksmithUnlocked: false,
      goldTownUnlocked: false,
      terraceUnlocked: false,
      romanticPhoneUnlocked: false,
      terracePlot: { targetCrop: null, step: 'idle' },
      logs: [
        {
          round: 0,
          text: `行動力耗盡重整完畢，受到處罰局數+1，進入第 ${prev.gameNumber + 1} 局！請抽取命運化身……`,
          type: 'milestone',
        },
      ],
      phase: 'CHOOSE_CHARACTER',
      revealedCard: null,
      currentDrawChoices: [],
      defeatReason: undefined,
      victoryType: undefined,
    }));

    setShowApExhaustedModal(false);
  };

  const handleConfirmApExhausted = () => {
    setShowApExhaustedModal(false);
    executeConfirmApExhausted();
  };





  // 進程目標：三條通路線並列進度（置於抽卡區下方）
  const routeProgress = useMemo(() => {
    // 檢查行囊中是否持有【超跑女神指引的賽道】(或超跑女神) 且 同時持有【本草綱目】
    // 若超跑女神不在行囊中(被燒毀、被老斑鳩偷走等)，或未持有本草綱目，進程提示關閉
    const hasTrackItem =
      (gameState.inventory['超跑女神指引的賽道'] || 0) > 0 ||
      (gameState.inventory['超跑女神'] || 0) > 0;
    const hasHerbBook = (gameState.inventory['本草綱目'] || 0) > 0;
    const hasSunGuide = hasTrackItem && hasHerbBook;

    // 1. 平定對手：擊敗四個遭遇對手之後
    const beasts = ['印地安老斑鳩', '忍者', '半獸人', '龍戰騎士的遺言'];
    const defeatedCount = beasts.filter((b) => {
      if (b === '龍戰騎士的遺言') {
        return (
          Boolean(gameState.flags['defeat_龍戰騎士']) ||
          Boolean(gameState.inventory['龍戰騎士的遺言'])
        );
      }
      return Boolean(gameState.flags[`defeat_${b}`]) || Boolean(gameState.inventory[b]);
    }).length;
    const isStep1Done = defeatedCount === 4;

    // 2. 時代轉換：進入亂舞春秋時代之後
    const isStep2Done = Boolean(
      gameState.flags['chaos_era_active'] ||
      gameState.flags['chaos_era_obtained']
    );

    // 3. 最終決戰：獲得最後的戰役，確定第30回合對決將軍之後
    const isStep3Done = Boolean(
      gameState.inventory['最後的戰役'] ||
      gameState.flags['ready_for_general'] ||
      gameState.flags['in_boss_battle']
    );

    return {
      hasSunGuide,
      isStep1Done,
      isStep2Done,
      isStep3Done,
      defeatedCount,
    };
  }, [
    gameState.flags,
    gameState.inventory,
    meta.nextGameFlags,
  ]);

  // Time reversal with 反方向的鐘
  const executeRewindWithClock = () => {
    if (gameState.reversedClockUsesRemaining <= 0) return;
    const remaining = gameState.reversedClockUsesRemaining - 1;
    // 動態倒流至前一回合 R - 1（最低回到第 1 回合）
    const targetRound = Math.max(1, gameState.round - 1);

    // 判斷是否為「提前突襲決戰（非 R30 常規決戰）」戰敗回溯
    const isAmbushBattle = gameState.round < 30;

    const nextInventory = { ...gameState.inventory };
    const nextFlags = {
      ...gameState.flags,
      in_boss_battle: false,
      ready_for_general: !isAmbushBattle, // 若是 R30 戰敗，保持已拆信 ready_for_general 狀態；若為提前突襲，則解除以重新抽牌
      general_immediate_next_round: false,
    };

    // 若是提早突襲戰敗回溯至 R-1：將「最後的戰役」移除，讓玩家回到抽信之前的時空，重新隨機抽牌！
    if (isAmbushBattle) {
      delete nextInventory['最後的戰役'];
    }

    addLog(`【反方向的鐘發動】秒針逆時針飛轉！成功回溯至第 ${targetRound} 回合（剩餘 ${remaining} 次使用機會）！`, 'milestone');
    setGameState((prev) => ({
      ...prev,
      round: targetRound,
      phase: 'DRAW_THREE',
      inventory: nextInventory,
      reversedClockUsesRemaining: remaining,
      defeatReason: undefined,
      stats: {
        ...prev.stats,
        ap: Math.max(prev.stats.ap, 10),
      },
      flags: nextFlags,
    }));
    startNewRound(targetRound, {
      inventory: nextInventory,
      flags: nextFlags,
    });
  };

  const handleRewindWithClock = () => {
    if (gameState.reversedClockUsesRemaining <= 0) return;
    const remaining = gameState.reversedClockUsesRemaining - 1;
    const targetRound = Math.max(1, gameState.round - 1);
    const isAmbushBattle = gameState.round < 30;

    // 彈出專屬「反方向的鐘・回溯通知視窗」，讓玩家清楚得知因果發生過程
    setRewindClockNotice({
      currentRound: gameState.round,
      targetRound,
      remainingUses: remaining,
      isAmbushBattle,
    });
  };

  const handleConfirmRewindNotice = () => {
    setRewindClockNotice(null);
    executeRewindWithClock();
  };

  const handleFullMemoryWipe = () => {
    // 傳奇殿堂的歷次評級戰績卡永久保存，不隨新周目清空！
    const preservedSettlements = meta.settlementHistory || [];

    const cleanMeta: MetaProgress = {
      unlockedCardIds: [],
      unlockedAchievements: [],
      activeSkills: [],
      unlockedDiaries: [],
      ironBoxItems: [],
      pastGamesCount: 1,
      totalRoundsPlayed: 0,
      victories: [],
      routeVictoryRecords: {},
      nextGameFlags: {},
      gameHistories: [],
      settlementHistory: preservedSettlements,
    };

    localStorage.setItem(STORAGE_KEY_META, JSON.stringify(cleanMeta));

    setMeta(cleanMeta);
    setGameState({
      gameNumber: 1,
      round: 0,
      maxRounds: 30,
      character: null,
      inventory: {},
      drawnCount: {},
      peninsulaInheritedCounts: {},
      flags: {},
      jokerSlots: { place: null, shoes: null, performance: null },
      reversedClockUsesRemaining: 3,
      stats: { ap: 15, coins: 0 },
      ninjaChasing: false,
      ninjaNextEncounterRound: null,
      fireworksBurning: false,
      headacheActive: false,
      blacksmithUnlocked: false,
      goldTownUnlocked: false,
      terraceUnlocked: false,
      romanticPhoneUnlocked: false,
      terracePlot: { targetCrop: null, step: 'idle' },
      logs: [
        {
          round: 0,
          text: '【新周目開啟】踏上全新的時空輪迴！傳奇殿堂已永久珍藏你過往的巔峰戰績，本次輪迴請以更少局數挑戰極限！',
          type: 'milestone',
        },
      ],
      phase: 'CHOOSE_CHARACTER',
      revealedCard: null,
      currentDrawChoices: [],
    });
    setShowNewGamePlusModal(false);
    setShowCompendium(false);
  };

  // C2002-04 龍拳化身為龍效果：當選擇化身為龍的選項遭遇 C2008-01 龍戰騎士時，角色頭像與名稱暫時顯示為「龍」與「龍的圖案」
  const isDragonTransformed = Boolean(
    gameState.flags['dragon_awakened'] &&
    gameState.revealedCard?.id === 'C2008-01'
  );

  const effectiveCharacter = useMemo(() => {
    if (!gameState.character) return null;
    if (isDragonTransformed) {
      return {
        ...gameState.character,
        id: 'char_dragon',
        name: '龍',
        title: '右拳打開了天・化身為龍',
        avatarIcon: '🐉',
        avatarColor: 'from-amber-600 via-red-600 to-amber-700',
        description: '「我 右拳打開了天 化身為龍！」你已暫時化身為真龍之軀，神威赫赫，與龍戰騎士展開宿命一決！',
        specialTrait: '真龍形態：擁有無匹的威壓，待與龍戰騎士的宿命之戰告一段落後回歸本尊。',
      };
    }
    return gameState.character;
  }, [gameState.character, isDragonTransformed]);

  return {
    handleStartNextGame,
    handleConfirmApExhausted,
    handleRewindWithClock,
    handleConfirmRewindNotice,
    handleFullMemoryWipe,
  };
}
