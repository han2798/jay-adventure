import React, { useCallback } from 'react';
import { GameState, MetaProgress } from '../types';
import { restoreCardQuotaOnItemLost } from '../utils/gameHelpers';
import { OutcomeModalData } from '../components/modals/OutcomeModal';

export interface UseBlacksmithSystemParams {
  gameState: GameState;
  meta: MetaProgress;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  setMeta: React.Dispatch<React.SetStateAction<MetaProgress>>;
  addLog: (msg: string, type?: string) => void;
  advanceToNextRound: (targetRound?: number, customState?: Partial<GameState>) => void;
  startNewRound: (targetRound?: number, customState?: Partial<GameState>) => void;
  getIronBoxCapacity: (pages?: any) => number;
  setShowGuideBlacksmithModal: (show: boolean) => void;
  setShowExchangeInstrumentModal: (show: boolean) => void;
  setShowUpgradeClockModal: (show: boolean) => void;
  setShowUpgradeShovelModal: (show: boolean) => void;
  setShowUpgradeTimeMachineModal: (show: boolean) => void;
  setShowExpandIronBoxModal: (show: boolean) => void;
  setShowWeaponChoiceModal: (show: boolean) => void;
  setShowBlacksmithModal?: (show: boolean) => void;
  setOutcomeModal?: React.Dispatch<React.SetStateAction<OutcomeModalData | null>>;
  triggerCardShowcase?: (cardOrName: any, badgeTitle?: string, onClose?: () => void) => void;
  checkAchievements?: (stateOrInv: any, meta?: MetaProgress) => void;
  setSelectedFlightRound?: (round: number) => void;
  setShowFlightTimeMachineModal?: (show: boolean) => void;
}

export function useBlacksmithSystem(params: UseBlacksmithSystemParams) {
  const {
    gameState,
    meta,
    setGameState,
    setMeta,
    addLog,
    advanceToNextRound,
    startNewRound,
    getIronBoxCapacity,
    setShowGuideBlacksmithModal,
    setShowExchangeInstrumentModal,
    setShowUpgradeClockModal,
    setShowUpgradeShovelModal,
    setShowUpgradeTimeMachineModal,
    setShowExpandIronBoxModal,
    setShowWeaponChoiceModal,
    setShowBlacksmithModal,
    setOutcomeModal,
    triggerCardShowcase,
    checkAchievements,
    setSelectedFlightRound,
    setShowFlightTimeMachineModal,
  } = params;

  const handleConfirmGuideBlacksmith = () => {
    setShowGuideBlacksmithModal(false);
    setGameState((prev) => ({
      ...prev,
      blacksmithUnlocked: true,
      flags: {
        ...prev.flags,
        blacksmith_unlocked: true,
      },
    }));
    addLog(
      '【環境變化】為米蘭的小鐵匠指引了【鄉間的路】！小鐵匠於村莊駐留開立「小鐵鋪」，角色名稱旁已新增【小鐵鋪】按鈕，隨時可拜訪！',
      'milestone'
    );
    const nextRound = gameState.round + 1;
    const isAtOrExceedingRound30 = gameState.round >= 30;
    const finalConfirmRound = isAtOrExceedingRound30 ? 31 : nextRound;

    setOutcomeModal({
      title: '✦ 環境變化・小鐵鋪常駐 ✦',
      icon: '⚒️',
      subtitle: '米蘭的小鐵匠定居鄉村',
      narrative:(
      <>
        你出示【鄉間的路】，為小鐵匠指引了前往安靜鄉村的道路。
      <br />
        小鐵匠興高采烈地循著小徑前往村莊，開設「小鐵鋪」定居！
      <br />
        往後你在冒險旅程中，角色名稱旁將永久顯示【小鐵鋪】
      </>
      ),
      badges: [{ label: '環境變化', value: '小鐵鋪常駐', color: 'text-amber-400' }],
      confirmText: isAtOrExceedingRound30
        ? '確定（第 30 回合冒險結算）'
        : `確定（進入第 ${Math.min(30, nextRound)} 回合）`,
      onConfirm: () => {
        setOutcomeModal(null);
        startNewRound(finalConfirmRound, {
          blacksmithUnlocked: true,
          flags: {
            ...gameState.flags,
            blacksmith_unlocked: true,
          },
        });
      },
    });
  };

  const handleDeclineGuideBlacksmith = () => {
    setShowGuideBlacksmithModal(false);
  };

  /**
   * 米蘭小鐵匠各項鍛造／交換操作後的回合推進與打烊離開檢查
   * 採用與梯田相同的「累積經歷回合制」：
   * 不論時空如何回溯（反方向的鐘）或跳轉，均以實際歷經推進的探索回合數為準，
   * 滿 5 回合時統一行囊移除、小鐵鋪常駐解除，並彈出統一之打烊告別視窗！
   */
  const performBlacksmithAdvance = (
    nextInventory: Record<string, number>,
    nextItemOrder: string[],
    newlyAcquiredItemsThisRound: string[] = [],
    extraState: Partial<GameState> = {}
  ) => {
    const isAtOrExceedingRound30 = gameState.round >= 30;
    const nextRound = gameState.round + 1;
    const finalConfirmRound = isAtOrExceedingRound30 ? 31 : nextRound;

    const delta = finalConfirmRound > gameState.round ? finalConfirmRound - gameState.round : 0;
    const currentElapsed = Number(
      gameState.flags['blacksmith_leave_elapsed'] ??
      (gameState.flags['blacksmith_leave_round']
        ? Math.max(0, 5 - Math.max(0, Number(gameState.flags['blacksmith_leave_round']) - gameState.round))
        : 0)
    );
    const nextElapsed = currentElapsed + (delta > 0 ? 1 : 0);

    const hasLeavePlan =
      gameState.flags['blacksmith_leave_countdown'] !== undefined ||
      gameState.flags['blacksmith_leave_elapsed'] !== undefined ||
      Number(gameState.flags['blacksmith_leave_round'] || 0) > 0;

    const isDepartureTriggerRound =
      Boolean(gameState.blacksmithUnlocked || gameState.flags['blacksmith_unlocked']) &&
      hasLeavePlan &&
      (nextInventory['說走就走'] || 0) > 0 &&
      nextElapsed >= 5;

    if (isDepartureTriggerRound) {
      const postDepartureInventory = { ...nextInventory };
      delete postDepartureInventory['說走就走'];
      delete postDepartureInventory['鄉間的路'];

      const postDepartureItemOrder = (nextItemOrder || Object.keys(postDepartureInventory)).filter(
        (k) => (postDepartureInventory[k] || 0) > 0
      );

      const postDepartureFlags = {
        ...gameState.flags,
        blacksmith_unlocked: false,
      };
      delete postDepartureFlags['blacksmith_leave_round'];
      delete postDepartureFlags['blacksmith_leave_countdown'];
      delete postDepartureFlags['blacksmith_leave_elapsed'];

      setGameState((prev) => ({
        ...prev,
        inventory: postDepartureInventory,
        itemAcquisitionOrder: postDepartureItemOrder,
        flags: postDepartureFlags,
        blacksmithUnlocked: false,
      }));

      addLog(
        `【說走就走】第 ${gameState.round} 回合探索結束，米蘭的小鐵匠收拾好行囊，前往遠方追尋自由與音樂之夢！小鐵鋪已打烊關閉，隨風消逝的【鄉間的路】已從行囊移除。往後旅程中將有機會再度與他相遇！`,
        'warning'
      );

      setOutcomeModal({
        title: '✦ 小鐵匠離去・小鐵鋪打烊 ✦',
        icon: '🎒',
        subtitle: '【說走就走】效果發動完成',
        narrative: (
          <>
            「說走就走的旅行 Oh~」
            <br />
            第 {gameState.round} 回合探索結束，小鐵匠收拾工具，踏上追尋自由的旅途。
            <br />
            小鐵鋪已解除 • 【說走就走】消失 • 【鄉間的路】不見蹤跡
            <br />
            往後旅途仍有機會再與米蘭的小鐵匠相遇！
          </>
        ),
        badges: [
          { label: '環境變化', value: '小鐵鋪解除', color: 'text-amber-400' },
        ],
        confirmText: isAtOrExceedingRound30
          ? '確定（第 30 回合冒險結算）'
          : `確定（進入第 ${Math.min(30, nextRound)} 回合）`,
        onConfirm: () => {
          setOutcomeModal(null);
          startNewRound(finalConfirmRound, {
            inventory: postDepartureInventory,
            itemAcquisitionOrder: postDepartureItemOrder,
            flags: postDepartureFlags,
            blacksmithUnlocked: false,
            latestAcquiredItemsThisRound: newlyAcquiredItemsThisRound,
            ...extraState,
            drawnCount: {
              ...(extraState.drawnCount || gameState.drawnCount),
              'C2026-12': 0,
              'C2002-09': 0,
            },
          });
        },
      });
      return;
    }

    const updatedFlags = { ...gameState.flags };
    if (Boolean(gameState.blacksmithUnlocked || gameState.flags['blacksmith_unlocked']) && (nextInventory['說走就走'] || 0) > 0 && hasLeavePlan) {
      updatedFlags['blacksmith_leave_elapsed'] = nextElapsed;
      updatedFlags['blacksmith_leave_countdown'] = Math.max(0, 5 - nextElapsed);
    }

    startNewRound(finalConfirmRound, {
      inventory: nextInventory,
      itemAcquisitionOrder: nextItemOrder,
      flags: updatedFlags,
      latestAcquiredItemsThisRound: newlyAcquiredItemsThisRound,
      ...extraState,
    });
  };

  // 遭遇米蘭的小鐵匠交換樂器確認處理（以烏克麗麗交換療傷燒肉粽）
  const handleConfirmExchangeInstrument = () => {
    setShowExchangeInstrumentModal(false);
    if (!gameState.revealedCard) return;
    const card = gameState.revealedCard;

    const ukuleleCount = gameState.inventory['烏克麗麗'] || 0;
    if (ukuleleCount < 1) {
      addLog('【道具不足】身上未持有【烏克麗麗】，無法與小鐵匠交換。', 'warning');
      return;
    }

    const nextInventory = { ...gameState.inventory };
    nextInventory['烏克麗麗'] = (nextInventory['烏克麗麗'] || 1) - 1;
    if (nextInventory['烏克麗麗'] <= 0) delete nextInventory['烏克麗麗'];
    nextInventory['療傷燒肉粽'] = (nextInventory['療傷燒肉粽'] || 0) + 1;

    let nextItemOrder = [...(gameState.itemAcquisitionOrder || Object.keys(nextInventory))].filter(
      (k) => (nextInventory[k] || 0) > 0
    );
    nextItemOrder = [...nextItemOrder.filter((k) => k !== '療傷燒肉粽'), '療傷燒肉粽'];

    const newlyAcquiredItemsThisRound: string[] = ['療傷燒肉粽'];

    addLog('【小鐵匠交換】消耗【烏克麗麗】，小鐵匠為了答謝，將存糧【療傷燒肉粽】贈予你！', 'milestone');

    const isAtOrExceedingRound30 = gameState.round >= 30;
    const nextRound = gameState.round + 1;

    const advanceToNextRound = () => {
      performBlacksmithAdvance(nextInventory, nextItemOrder, newlyAcquiredItemsThisRound);
    };

    setOutcomeModal({
      title: '✦ 獲得物品・決策結算 ✦',
      icon: '🎁',
      subtitle: `【${card.name}】・你好像有小鐵匠想要的東西`,
      narrative: (
        <>
          {card.options.find((o) => o.text.includes('小鐵匠想要的東西'))?.resultText || (
            <>
              小鐵匠激動的說：「這正是我一心想買的吉他！」
              <br />
              小鐵匠收下吉他隨興彈唱，無以回報，只能將旅行存糧的肉粽相贈給你
            </>
          )}
        </>
      ),
      badges: [{ label: '交換成功', value: '獲得【療傷燒肉粽】', color: 'text-amber-300' }],
      confirmText: isAtOrExceedingRound30
        ? '確定（第 30 回合冒險結算）'
        : `確定（進入第 ${Math.min(30, nextRound)} 回合）`,
      onConfirm: () => {
        setOutcomeModal(null);
        triggerCardShowcase('C2011-06', '米蘭的小鐵匠交換贈予', advanceToNextRound);
      },
    });
  };

  const handleDeclineExchangeInstrument = () => {
    setShowExchangeInstrumentModal(false);
  };

  // 遭遇米蘭的小鐵匠改造鐘錶確認處理（以反方向的鐘改造成大笨鐘）
  const handleConfirmUpgradeClock = () => {
    setShowUpgradeClockModal(false);
    if (!gameState.revealedCard) return;
    const card = gameState.revealedCard;

    const hasClock = (gameState.inventory['反方向的鐘'] || 0) >= 1;
    if (!hasClock) {
      addLog('【道具不足】未持有【反方向的鐘】，無法改造。', 'warning');
      return;
    }

    const nextInventory = { ...gameState.inventory };
    nextInventory['反方向的鐘'] = (nextInventory['反方向的鐘'] || 1) - 1;
    if (nextInventory['反方向的鐘'] <= 0) delete nextInventory['反方向的鐘'];
    nextInventory['大笨鐘'] = (nextInventory['大笨鐘'] || 0) + 1;

    let nextItemOrder = [...(gameState.itemAcquisitionOrder || Object.keys(nextInventory))].filter(
      (k) => (nextInventory[k] || 0) > 0
    );
    nextItemOrder = [...nextItemOrder.filter((k) => k !== '大笨鐘'), '大笨鐘'];

    const newlyAcquiredItemsThisRound: string[] = ['大笨鐘'];

    checkAchievements(nextInventory);
    addLog('【小鐵匠改造】消耗【反方向的鐘】，小鐵匠巧手為你改造成了【大笨鐘】！', 'milestone');

    const isAtOrExceedingRound30 = gameState.round >= 30;
    const nextRound = gameState.round + 1;

    const advanceToNextRound = () => {
      performBlacksmithAdvance(nextInventory, nextItemOrder, newlyAcquiredItemsThisRound);
    };

    setOutcomeModal({
      title: '✦ 獲得物品・決策結算 ✦',
      icon: '🕰️',
      subtitle: `【${card.name}】・改造鐘錶`,
      narrative: (
        <>
          {card.options.find(
            (o) =>
              o.text.includes('有用不到的東西') ||
              o.text.includes('改造鐘錶') ||
              o.text.includes('反方向的鐘') ||
              o.text.includes('大笨鐘') ||
              o.require?.item === '反方向的鐘'
          )?.resultText ||
            '小鐵匠以純熟工藝將【反方向的鐘】重鑄為【大笨鐘】！'}
        </>
      ),
      badges: [{ label: '改造成功', value: '獲得【大笨鐘】', color: 'text-amber-300' }],
      confirmText: isAtOrExceedingRound30
        ? '確定（第 30 回合冒險結算）'
        : `確定（進入第 ${Math.min(30, nextRound)} 回合）`,
      onConfirm: () => {
        setOutcomeModal(null);
        triggerCardShowcase('C2012-10', '米蘭的小鐵匠巧手改造', advanceToNextRound);
      },
    });
  };

  // 遭遇米蘭的小鐵匠重鑄鐵鏟確認處理（將雙截棍重鑄為鐵鏟）
  const handleConfirmUpgradeShovel = () => {
    setShowUpgradeShovelModal(false);
    if (!gameState.revealedCard) return;

    const hasNunchaku = (gameState.inventory['雙截棍'] || 0) >= 1;
    if (!hasNunchaku) {
      addLog('【道具不足】未持有【雙截棍】，無法重鑄改造。', 'warning');
      return;
    }

    const nextInventory = { ...gameState.inventory };
    nextInventory['雙截棍'] = (nextInventory['雙截棍'] || 1) - 1;
    if (nextInventory['雙截棍'] <= 0) delete nextInventory['雙截棍'];
    nextInventory['鐵鏟'] = (nextInventory['鐵鏟'] || 0) + 1;

    let nextItemOrder = [...(gameState.itemAcquisitionOrder || Object.keys(nextInventory))].filter(
      (k) => (nextInventory[k] || 0) > 0
    );
    nextItemOrder = [...nextItemOrder.filter((k) => k !== '鐵鏟'), '鐵鏟'];

    let nextDrawn = { ...gameState.drawnCount };
    let nextPen = { ...(gameState.peninsulaInheritedCounts || {}) };
    const quota = restoreCardQuotaOnItemLost('雙截棍', nextDrawn, nextPen, 1);
    nextDrawn = quota.nextDrawnCount;
    nextPen = quota.nextPeninsulaCounts;

    addLog('【小鐵匠重鑄】消耗 1 把【雙截棍】，小鐵匠在鍛爐前揮汗如雨，巧手為你重鑄成了【鐵鏟】！', 'milestone');

    const isAtOrExceedingRound30 = gameState.round >= 30;
    const nextRound = gameState.round + 1;

    const advanceToNextRound = () => {
      performBlacksmithAdvance(nextInventory, nextItemOrder, ['鐵鏟'], {
        drawnCount: nextDrawn,
        peninsulaInheritedCounts: nextPen,
      });
    };

    setOutcomeModal({
      title: '✦ 小鐵匠重鑄・鐵鏟 ✦',
      icon: '⚒️',
      subtitle: '重鑄改造・武器化為實用工具',
      narrative: '小鐵匠在鍛爐前揮汗如雨，將 1 把【雙截棍】重鑄改造為 1 把結實耐用的【鐵鏟】！\n\n熊熊爐火，武器也能重新鍛造成合適的工具。',
      badges: [
        { label: '重鑄武器', value: '消耗【雙截棍】*1', color: 'text-stone-400' },
        { label: '獲得工具', value: '獲得【鐵鏟】*1', color: 'text-amber-300' },
      ],
      confirmText: isAtOrExceedingRound30
        ? '確定（第 30 回合冒險結算）'
        : `確定（進入第 ${Math.min(30, nextRound)} 回合）`,
      onConfirm: () => {
        setOutcomeModal(null);
        advanceToNextRound();
      },
    });
  };

  // 遭遇米蘭的小鐵匠強化時光機確認處理（以時光機+愛的飛行日記強化為飛行時光機）
  const handleConfirmUpgradeTimeMachine = () => {
    setShowUpgradeTimeMachineModal(false);
    if (!gameState.revealedCard) return;
    const card = gameState.revealedCard;

    const hasTm = (gameState.inventory['時光機'] || 0) >= 1;
    const hasDiary = (gameState.inventory['愛的飛行日記'] || 0) >= 1;
    if (!hasTm || !hasDiary) {
      addLog('【道具不足】未備齊【時光機】與【愛的飛行日記】，無法強化。', 'warning');
      return;
    }

    const nextInventory = { ...gameState.inventory };
    nextInventory['時光機'] = (nextInventory['時光機'] || 1) - 1;
    if (nextInventory['時光機'] <= 0) delete nextInventory['時光機'];
    nextInventory['愛的飛行日記'] = (nextInventory['愛的飛行日記'] || 1) - 1;
    if (nextInventory['愛的飛行日記'] <= 0) delete nextInventory['愛的飛行日記'];
    nextInventory['飛行時光機'] = (nextInventory['飛行時光機'] || 0) + 1;

    let nextItemOrder = [...(gameState.itemAcquisitionOrder || Object.keys(nextInventory))].filter(
      (k) => (nextInventory[k] || 0) > 0
    );
    nextItemOrder = [...nextItemOrder.filter((k) => k !== '飛行時光機'), '飛行時光機'];

    const newlyAcquiredItemsThisRound: string[] = ['飛行時光機'];

    checkAchievements(nextInventory);
    addLog('【小鐵匠強化】消耗【愛的飛行日記】，小鐵匠巧奪天工將【時光機】成功強化為【飛行時光機】！', 'milestone');

    const isAtOrExceedingRound30 = gameState.round >= 30;
    const nextRound = gameState.round + 1;

    const advanceToNextRound = () => {
      performBlacksmithAdvance(nextInventory, nextItemOrder, newlyAcquiredItemsThisRound);
    };

    setOutcomeModal({
      title: '✦ 獲得物品・決策結算 ✦',
      icon: '🚀',
      subtitle: `【${card.name}】・強化時光機`,
      narrative: (
        <>
          {card.options.find((o) => o.text.includes('強化時光機'))?.resultText ||
            '透過愛的飛行日記，小鐵匠將時光機強化為能在時空中自由穿梭的【飛行時光機】！'}
        </>
      ),
      badges: [{ label: '強化成功', value: '獲得【飛行時光機】', color: 'text-amber-300' }],
      confirmText: isAtOrExceedingRound30
        ? '確定（第 30 回合冒險結算）'
        : `確定（進入第 ${Math.min(30, nextRound)} 回合）`,
      onConfirm: () => {
        setOutcomeModal(null);
        triggerCardShowcase('C2010-09-EX', '米蘭的小鐵匠巧手強化', advanceToNextRound);
      },
    });
  };

  // 遭遇米蘭的小鐵匠擴充鐵盒確認處理（以持有頁籤擴充半島鐵盒）
  const handleConfirmExpandIronBox = () => {
    setShowExpandIronBoxModal(false);
    if (!gameState.revealedCard) return;

    const hasIronBox = (gameState.inventory['半島鐵盒'] || 0) >= 1;
    const firstCount = gameState.inventory['第一頁'] || 0;
    const sixthCount = gameState.inventory['第六頁'] || 0;
    const seventhCount = gameState.inventory['第七頁'] || 0;
    const prefaceCount = gameState.inventory['序'] || 0;

    if (!hasIronBox || firstCount + sixthCount + seventhCount + prefaceCount <= 0) {
      addLog('【道具不足】缺少【半島鐵盒】或擴充頁籤，無法擴充。', 'warning');
      return;
    }

    const nextInventory = { ...gameState.inventory };
    const pagesGained: string[] = [];
    let capacityGain = 0;
    let prefaceUnlocked = false;

    const currentPages = { ...(meta.ironBoxPages || {}) };

    // 順序 1: 第一頁
    if (!currentPages.firstPage && firstCount > 0) {
      nextInventory['第一頁'] -= 1;
      if (nextInventory['第一頁'] <= 0) delete nextInventory['第一頁'];
      currentPages.firstPage = true;
      capacityGain += 1;
      pagesGained.push('【第一頁】(+1格容量)');
    }
    // 順序 2: 第六頁 (需已擴充第一頁)
    if (currentPages.firstPage && !currentPages.sixthPage && sixthCount > 0) {
      nextInventory['第六頁'] -= 1;
      if (nextInventory['第六頁'] <= 0) delete nextInventory['第六頁'];
      currentPages.sixthPage = true;
      capacityGain += 6;
      pagesGained.push('【第六頁】(+6格容量)');
    }
    // 順序 3: 第七頁 (需已擴充第六頁)
    if (currentPages.sixthPage && !currentPages.seventhPage && seventhCount > 0) {
      nextInventory['第七頁'] -= 1;
      if (nextInventory['第七頁'] <= 0) delete nextInventory['第七頁'];
      currentPages.seventhPage = true;
      capacityGain += 7;
      pagesGained.push('【第七頁】(+7格容量)');
    }
    // 順序 4: 序 (需已擴充第七頁)
    if (currentPages.seventhPage && !currentPages.preface && prefaceCount > 0) {
      nextInventory['序'] -= 1;
      if (nextInventory['序'] <= 0) delete nextInventory['序'];
      currentPages.preface = true;
      prefaceUnlocked = true;
      pagesGained.push('【序】(解鎖跨局繼承角色)');
    }

    if (pagesGained.length === 0) {
      addLog('【順序不符】未持有當前順位所需之擴充頁籤，請依照順序（第一頁 ➔ 第六頁 ➔ 第七頁 ➔ 序）進行擴充。', 'warning');
      return;
    }

    const nextItemOrder = [...(gameState.itemAcquisitionOrder || Object.keys(nextInventory))].filter(
      (k) => (nextInventory[k] || 0) > 0
    );

    setMeta((prev) => ({
      ...prev,
      ironBoxPages: currentPages,
    }));

    const newCap = getIronBoxCapacity(currentPages);
    addLog(
      `【鐵盒擴充】小鐵匠以純熟工藝將 ${pagesGained.join('、')} 鍛造融入【半島鐵盒】！當前封存上限提升為 ${newCap} 樣！${
        prefaceUnlocked ? ' 並已啟動跨局「繼承角色化身」傳奇能力！' : ''
      }`,
      'milestone'
    );

    const isAtOrExceedingRound30 = gameState.round >= 30;
    const nextRound = gameState.round + 1;

    const advanceToNextRound = () => {
      performBlacksmithAdvance(nextInventory, nextItemOrder);
    };

    setOutcomeModal({
      title: '✦ 半島鐵盒・神器擴充 ✦',
      icon: '📻',
      subtitle: '遭遇米蘭的小鐵匠・擴充鐵盒',
      narrative: (
        <div className="space-y-3 font-sans leading-relaxed text-stone-300">
          <p>「放在床邊堆好多 第一頁第六頁第七頁序」</p>
          <p>小鐵匠接過【半島鐵盒】與挖掘出的泛黃頁籤，精準裝訂並重鑄進鐵盒之中！</p>
          <div className="bg-amber-950/40 border border-amber-600/50 p-3 rounded-xl text-xs space-y-1.5">
            <div className="text-amber-200 font-bold">本次擴充成果：</div>
            <div className="text-stone-300 space-y-1">
              {pagesGained.map((pg, idx) => (
                <div key={`${pg}-${idx}`} className="flex items-center gap-1.5 text-amber-300">
                  <span>✦</span>
                  <span>融入 {pg}</span>
                </div>
              ))}
            </div>
            <div className="pt-1 border-t border-amber-800/40 text-stone-300 flex items-center justify-between">
              <span>鐵盒當前封存上限：</span>
              <span className="font-mono font-bold text-amber-200 text-sm">{newCap} 樣道具</span>
            </div>
            {currentPages.preface && (
              <div className="text-yellow-300 font-bold flex items-center gap-1.5">
                <span>✨</span>
                <span>已啟動【序】：第 30 回合結束時可選擇跨局繼承當前角色！</span>
              </div>
            )}
          </div>
        </div>
      ),
      badges: [
        ...(capacityGain > 0
          ? [{ label: '容量提升', value: `+${capacityGain} 格 (總計 ${newCap} 格)`, color: 'text-amber-300' }]
          : []),
        ...(prefaceUnlocked ? [{ label: '能力啟動', value: '跨局繼承角色', color: 'text-yellow-400' }] : []),
      ],
      confirmText: `確定（進入第 ${Math.min(30, nextRound)} 回合）`,
      onConfirm: () => {
        setOutcomeModal(null);
        advanceToNextRound();
      },
    });
  };

  // 點選行囊物品處理（飛行時光機）
  const handleInventoryItemClick = (itemName: string) => {
    if (itemName === '飛行時光機') {
      const hasHerbBook = (gameState.inventory['本草綱目'] || 0) > 0;
      if (!hasHerbBook) {
        addLog('【未明奧妙】尚未啟動行囊，無法參透與使用【飛行時光機】的功能！', 'warning');
        setOutcomeModal({
          title: '✦ 行囊進階功能未解鎖 ✦',
          icon: '📜',
          subtitle: '【飛行時光機】特殊能力尚未啟動',
          narrative: '你端詳著這台閃亮的時光機器，但尚無法參透並啟動其奧秘。\n\n提示：請先啟動行囊進階功能。',
          confirmText: '知道了',
          onConfirm: () => setOutcomeModal(null),
        });
        return;
      }

      // 已持有本草綱目，開啟時空穿梭選擇視窗
      setSelectedFlightRound(gameState.round);
      setShowFlightTimeMachineModal(true);
    }
  };

  // 遭遇小鐵匠時，身上同時擁有雙截棍*2與雙刀時的自選改造執行
  const handleExecuteEncounterWeaponCraft = (craftType: 'nunchucks_to_blades' | 'blades_to_nunchucks') => {
    setShowWeaponChoiceModal(false);
    if (!gameState.revealedCard) return;
    const card = gameState.revealedCard;

    const nextInventory = { ...gameState.inventory };
    let nextItemOrder = [...(gameState.itemAcquisitionOrder || Object.keys(nextInventory))].filter(
      (k) => (nextInventory[k] || 0) > 0
    );
    const newlyAcquiredItemsThisRound: string[] = [];
    const recordItemAcquired = (itemName: string) => {
      nextItemOrder = [...nextItemOrder.filter((k) => k !== itemName), itemName];
      if (!newlyAcquiredItemsThisRound.includes(itemName)) {
        newlyAcquiredItemsThisRound.push(itemName);
      }
    };

    let resultText = '';
    const badges: { label: string; value: string; color: string }[] = [];

    if (craftType === 'nunchucks_to_blades') {
      nextInventory['雙截棍'] = (nextInventory['雙截棍'] || 2) - 2;
      if (nextInventory['雙截棍'] <= 0) delete nextInventory['雙截棍'];
      nextInventory['雙刀'] = (nextInventory['雙刀'] || 0) + 1;
      recordItemAcquired('雙刀');
      resultText = '小鐵匠在鐵砧上揮汗如雨，將 2 把【雙截棍】重鑄改造為 1 把鋒芒畢露的【雙刀】！';
      addLog('【重鑄武器】消耗 2 把【雙截棍】，小鐵匠成功為你改造成 1 把【雙刀】！', 'milestone');
      badges.push({ label: '重鑄武器', value: '獲得【雙刀】', color: 'text-amber-300' });
    } else {
      nextInventory['雙刀'] = (nextInventory['雙刀'] || 1) - 1;
      if (nextInventory['雙刀'] <= 0) delete nextInventory['雙刀'];
      nextInventory['雙截棍'] = (nextInventory['雙截棍'] || 0) + 2;
      recordItemAcquired('雙截棍');
      resultText = '小鐵匠熟練地拆解刃身並銜接精鋼鎖鏈，將 1 把【雙刀】改造成 2 把手感絕佳的【雙截棍】！';
      addLog('【重鑄武器】消耗 1 把【雙刀】，小鐵匠成功為你改造成 2 把【雙截棍】！', 'milestone');
      badges.push({ label: '重鑄武器', value: '獲得【雙截棍】*2', color: 'text-amber-300' });
    }

    nextItemOrder = nextItemOrder.filter((k) => (nextInventory[k] || 0) > 0);

    const isAtOrExceedingRound30 = gameState.round >= 30;
    const nextRound = gameState.round + 1;
    const finalConfirmRound = isAtOrExceedingRound30 ? 31 : nextRound;

    setOutcomeModal({
      title: '✦ 冒險決策・重鑄武器 ✦',
      icon: '⚔️',
      subtitle: `【${card.name}】・重鑄武器`,
      narrative: resultText,
      badges: badges.length > 0 ? badges : undefined,
      confirmText: isAtOrExceedingRound30
        ? '確定（第 30 回合冒險結算）'
        : `確定（進入第 ${Math.min(30, nextRound)} 回合）`,
      onConfirm: () => {
        setOutcomeModal(null);
        performBlacksmithAdvance(nextInventory, nextItemOrder, newlyAcquiredItemsThisRound);
      },
    });
  };

  // 小鐵鋪改造交易處理
  const handleBlacksmithTrade = (
    type:
      | 'nunchucks_to_blades'
      | 'blades_to_nunchucks'
      | 'nunchucks_to_shovel'
      | 'craft_maltose'
      | 'trade_ukulele'
      | 'upgrade_clock'
      | 'upgrade_time_machine'
      | 'expand_iron_box'
  ): boolean => {
    const inv = { ...gameState.inventory };
    const currentOrder = gameState.itemAcquisitionOrder || Object.keys(inv);
    let nextOrder = [...currentOrder];
    let nextDrawn = { ...gameState.drawnCount };
    let nextPen = { ...(gameState.peninsulaInheritedCounts || {}) };

    if (type === 'nunchucks_to_shovel') {
      if ((inv['雙截棍'] || 0) < 1) return false;
      inv['雙截棍'] -= 1;
      if (inv['雙截棍'] === 0) delete inv['雙截棍'];
      const quota = restoreCardQuotaOnItemLost('雙截棍', nextDrawn, nextPen, 1);
      nextDrawn = quota.nextDrawnCount;
      nextPen = quota.nextPeninsulaCounts;
      inv['鐵鏟'] = (inv['鐵鏟'] || 0) + 1;
      nextOrder = [...nextOrder.filter((k) => k !== '鐵鏟'), '鐵鏟'];
      nextOrder = nextOrder.filter((k) => (inv[k] || 0) > 0);
      setGameState((prev) => ({
        ...prev,
        inventory: inv,
        itemAcquisitionOrder: nextOrder,
        drawnCount: nextDrawn,
        peninsulaInheritedCounts: nextPen,
      }));
      addLog('【小鐵鋪重鑄】消耗 1 把【雙截棍】，改造成 1 把【鐵鏟】！', 'milestone');
      return true;
    }

    if (type === 'nunchucks_to_blades') {
      if ((inv['雙截棍'] || 0) < 2) return false;
      inv['雙截棍'] -= 2;
      if (inv['雙截棍'] === 0) delete inv['雙截棍'];
      const quota = restoreCardQuotaOnItemLost('雙截棍', nextDrawn, nextPen, 2);
      nextDrawn = quota.nextDrawnCount;
      nextPen = quota.nextPeninsulaCounts;
      inv['雙刀'] = (inv['雙刀'] || 0) + 1;
      nextOrder = [...nextOrder.filter((k) => k !== '雙刀'), '雙刀'];
      nextOrder = nextOrder.filter((k) => (inv[k] || 0) > 0);
      setGameState((prev) => ({
        ...prev,
        inventory: inv,
        itemAcquisitionOrder: nextOrder,
        drawnCount: nextDrawn,
        peninsulaInheritedCounts: nextPen,
      }));
      checkAchievements(inv);
      addLog('【小鐵鋪重鑄】消耗 2 把【雙截棍】，小鐵匠以純熟爐火為你改造成 1 把【雙刀】！', 'milestone');
      return true;
    }

    if (type === 'blades_to_nunchucks') {
      if ((inv['雙刀'] || 0) < 1) return false;
      inv['雙刀'] -= 1;
      if (inv['雙刀'] === 0) delete inv['雙刀'];
      const quota = restoreCardQuotaOnItemLost('雙刀', nextDrawn, nextPen, 1);
      nextDrawn = quota.nextDrawnCount;
      nextPen = quota.nextPeninsulaCounts;
      inv['雙截棍'] = (inv['雙截棍'] || 0) + 2;
      nextOrder = [...nextOrder.filter((k) => k !== '雙截棍'), '雙截棍'];
      nextOrder = nextOrder.filter((k) => (inv[k] || 0) > 0);
      setGameState((prev) => ({
        ...prev,
        inventory: inv,
        itemAcquisitionOrder: nextOrder,
        drawnCount: nextDrawn,
        peninsulaInheritedCounts: nextPen,
      }));
      checkAchievements(inv);
      addLog('【小鐵鋪拆解】消耗 1 把【雙刀】，小鐵匠熟練拆解為你改造成 2 把【雙截棍】！', 'milestone');
      return true;
    }

    if (type === 'craft_maltose') {
      if ((inv['甜甜的'] || 0) < 1 || (inv['稻香'] || 0) < 1) return false;
      inv['甜甜的'] -= 1;
      if (inv['甜甜的'] === 0) delete inv['甜甜的'];
      inv['稻香'] -= 1;
      if (inv['稻香'] === 0) delete inv['稻香'];
      const q1 = restoreCardQuotaOnItemLost('甜甜的', nextDrawn, nextPen, 1);
      nextDrawn = q1.nextDrawnCount;
      nextPen = q1.nextPeninsulaCounts;
      const q2 = restoreCardQuotaOnItemLost('稻香', nextDrawn, nextPen, 1);
      nextDrawn = q2.nextDrawnCount;
      nextPen = q2.nextPeninsulaCounts;
      inv['麥芽糖'] = (inv['麥芽糖'] || 0) + 1;
      nextOrder = [...nextOrder.filter((k) => k !== '麥芽糖'), '麥芽糖'];
      nextOrder = nextOrder.filter((k) => (inv[k] || 0) > 0);
      setGameState((prev) => ({
        ...prev,
        inventory: inv,
        itemAcquisitionOrder: nextOrder,
        drawnCount: nextDrawn,
        peninsulaInheritedCounts: nextPen,
      }));
      checkAchievements(inv);
      addLog('【小鐵鋪熬製】消耗【甜甜的】與【稻香】，小鐵匠以溫火為你慢熬出香甜黏手的【麥芽糖】！', 'milestone');
      setShowBlacksmithModal(false);
      setOutcomeModal({
        title: '✦ 獲得物品・決策結算 ✦',
        icon: '🍯',
        subtitle: '【米蘭的小鐵匠】・製作食物',
        narrative: (
          <>
            開心的 被黏手 我滿嘴 都是糖果！以【稻香】+【甜甜的】成功製作出香甜可口的【麥芽糖】！
          </>
        ),
        badges: [{ label: '食物製作', value: '獲得【麥芽糖】', color: 'text-emerald-400' }],
        confirmText: '確定',
        onConfirm: () => {
          setOutcomeModal(null);
          triggerCardShowcase('C2005-09', '米蘭的小鐵匠慢火熬製');
        },
      });
      return true;
    }

    if (type === 'trade_ukulele') {
      if ((inv['烏克麗麗'] || 0) < 1) return false;
      inv['烏克麗麗'] -= 1;
      if (inv['烏克麗麗'] === 0) delete inv['烏克麗麗'];
      const quota = restoreCardQuotaOnItemLost('烏克麗麗', nextDrawn, nextPen, 1);
      nextDrawn = quota.nextDrawnCount;
      nextPen = quota.nextPeninsulaCounts;
      inv['療傷燒肉粽'] = (inv['療傷燒肉粽'] || 0) + 1;
      nextOrder = [...nextOrder.filter((k) => k !== '療傷燒肉粽'), '療傷燒肉粽'];
      nextOrder = nextOrder.filter((k) => (inv[k] || 0) > 0);
      setGameState((prev) => ({
        ...prev,
        inventory: inv,
        itemAcquisitionOrder: nextOrder,
        drawnCount: nextDrawn,
        peninsulaInheritedCounts: nextPen,
      }));
      checkAchievements(inv);
      addLog('【小鐵鋪情懷】小鐵匠開心地收下【烏克麗麗】隨興彈唱，並熱情贈予你一串熱氣騰騰的【療傷燒肉粽】！', 'milestone');
      setShowBlacksmithModal(false);
      setOutcomeModal({
        title: '✦ 獲得物品・決策結算 ✦',
        icon: '🎁',
        subtitle: '【米蘭的小鐵匠】・你好像有小鐵匠想要的東西',
        narrative: (
          <>
            小鐵匠激動的說：「這正是我一心想買的吉他！」
            <br />
            小鐵匠收下吉他隨興彈唱，無以回報，只能將旅行存糧的肉粽相贈給你
          </>
        ),
        badges: [{ label: '交換成功', value: '獲得【療傷燒肉粽】', color: 'text-amber-300' }],
        confirmText: '確定',
        onConfirm: () => {
          setOutcomeModal(null);
          triggerCardShowcase('C2011-06', '小鐵匠交換贈予');
        },
      });
      return true;
    }

    if (type === 'upgrade_clock') {
      if ((inv['反方向的鐘'] || 0) < 1) return false;
      inv['反方向的鐘'] -= 1;
      if (inv['反方向的鐘'] === 0) delete inv['反方向的鐘'];
      const quota = restoreCardQuotaOnItemLost('反方向的鐘', nextDrawn, nextPen, 1);
      nextDrawn = quota.nextDrawnCount;
      nextPen = quota.nextPeninsulaCounts;
      inv['大笨鐘'] = (inv['大笨鐘'] || 0) + 1;
      nextOrder = [...nextOrder.filter((k) => k !== '大笨鐘'), '大笨鐘'];
      nextOrder = nextOrder.filter((k) => (inv[k] || 0) > 0);
      setGameState((prev) => ({
        ...prev,
        inventory: inv,
        itemAcquisitionOrder: nextOrder,
        drawnCount: nextDrawn,
        peninsulaInheritedCounts: nextPen,
      }));
      checkAchievements(inv);
      addLog('【小鐵鋪改造】消耗【反方向的鐘】，小鐵匠以純熟工藝為你改造成【大笨鐘】！', 'milestone');
      setShowBlacksmithModal(false);
      setOutcomeModal({
        title: '✦ 獲得物品・決策結算 ✦',
        icon: '🕰️',
        subtitle: '【米蘭的小鐵匠】・改造鐘錶',
        narrative: (
          <>
            小鐵匠以純熟工藝為你把【反方向的鐘】改造成【大笨鐘】！
          </>
        ),
        badges: [{ label: '改造成功', value: '獲得【大笨鐘】', color: 'text-amber-300' }],
        confirmText: '確定',
        onConfirm: () => {
          setOutcomeModal(null);
          triggerCardShowcase('C2012-10', '米蘭的小鐵匠巧手改造');
        },
      });
      return true;
    }

    if (type === 'upgrade_time_machine') {
      if ((inv['時光機'] || 0) < 1 || (inv['愛的飛行日記'] || 0) < 1) return false;
      inv['時光機'] -= 1;
      if (inv['時光機'] === 0) delete inv['時光機'];
      inv['愛的飛行日記'] -= 1;
      if (inv['愛的飛行日記'] === 0) delete inv['愛的飛行日記'];
      inv['飛行時光機'] = (inv['飛行時光機'] || 0) + 1;
      nextOrder = [...nextOrder.filter((k) => k !== '飛行時光機'), '飛行時光機'];
      nextOrder = nextOrder.filter((k) => (inv[k] || 0) > 0);
      setGameState((prev) => ({
        ...prev,
        inventory: inv,
        itemAcquisitionOrder: nextOrder,
      }));
      checkAchievements(inv);
      addLog('【小鐵鋪機械改造】消耗【愛的飛行日記】，小鐵匠以超凡精工為你將【時光機】強化為【飛行時光機】！', 'milestone');
      setShowBlacksmithModal(false);
      setOutcomeModal({
        title: '✦ 獲得物品・決策結算 ✦',
        icon: '🚀',
        subtitle: '【米蘭的小鐵匠】・強化時光機',
        narrative: (
          <>
            透過愛的飛行日記，小鐵匠將時光機強化為能在時空中自由穿梭的【飛行時光機】！
          </>
        ),
        badges: [{ label: '強化成功', value: '獲得【飛行時光機】', color: 'text-amber-300' }],
        confirmText: '確定',
        onConfirm: () => {
          setOutcomeModal(null);
          triggerCardShowcase('C2010-09-EX', '米蘭的小鐵匠巧手強化');
        },
      });
      return true;
    }

    if (type === 'expand_iron_box') {
      if ((inv['半島鐵盒'] || 0) < 1) return false;
      const firstCount = inv['第一頁'] || 0;
      const sixthCount = inv['第六頁'] || 0;
      const seventhCount = inv['第七頁'] || 0;
      const prefaceCount = inv['序'] || 0;
      if (firstCount + sixthCount + seventhCount + prefaceCount <= 0) return false;

      const pagesGained: string[] = [];
      let capacityGain = 0;
      let prefaceUnlocked = false;

      const currentPages = { ...(meta.ironBoxPages || {}) };

      // 順序 1: 第一頁
      if (!currentPages.firstPage && firstCount > 0) {
        inv['第一頁'] -= 1;
        if (inv['第一頁'] <= 0) delete inv['第一頁'];
        currentPages.firstPage = true;
        capacityGain += 1;
        pagesGained.push('【第一頁】(+1格容量)');
      }
      // 順序 2: 第六頁 (需已擴充第一頁)
      if (currentPages.firstPage && !currentPages.sixthPage && sixthCount > 0) {
        inv['第六頁'] -= 1;
        if (inv['第六頁'] <= 0) delete inv['第六頁'];
        currentPages.sixthPage = true;
        capacityGain += 6;
        pagesGained.push('【第六頁】(+6格容量)');
      }
      // 順序 3: 第七頁 (需已擴充第六頁)
      if (currentPages.sixthPage && !currentPages.seventhPage && seventhCount > 0) {
        inv['第七頁'] -= 1;
        if (inv['第七頁'] <= 0) delete inv['第七頁'];
        currentPages.seventhPage = true;
        capacityGain += 7;
        pagesGained.push('【第七頁】(+7格容量)');
      }
      // 順序 4: 序 (需已擴充第七頁)
      if (currentPages.seventhPage && !currentPages.preface && prefaceCount > 0) {
        inv['序'] -= 1;
        if (inv['序'] <= 0) delete inv['序'];
        currentPages.preface = true;
        prefaceUnlocked = true;
        pagesGained.push('【序】(解鎖跨局繼承角色)');
      }

      if (pagesGained.length === 0) return false;

      nextOrder = nextOrder.filter((k) => (inv[k] || 0) > 0);

      setMeta((prev) => ({
        ...prev,
        ironBoxPages: currentPages,
      }));

      setGameState((prev) => ({
        ...prev,
        inventory: inv,
        itemAcquisitionOrder: nextOrder,
      }));

      const newCap = getIronBoxCapacity(currentPages);
      addLog(
        `【鐵盒擴充】小鐵匠以純熟工藝將 ${pagesGained.join('、')} 鍛造融入【半島鐵盒】！當前封存上限提升為 ${newCap} 樣！${
          prefaceUnlocked ? ' 並已啟動跨局「繼承角色化身」傳奇能力！' : ''
        }`,
        'milestone'
      );

      setShowBlacksmithModal(false);
      setOutcomeModal({
        title: '✦ 半島鐵盒・神器擴充 ✦',
        icon: '📻',
        subtitle: '【米蘭的小鐵匠】・改造物品',
        narrative: (
          <div className="space-y-3 font-sans leading-relaxed text-stone-300">
            <p>「走廊燈關上 書包放 走到房間窗外望……第一頁第六頁第七頁序」</p>
            <p>小鐵匠在鐵砧與鍛爐前專注敲打，將泛黃書頁精準裝訂並重鑄進【半島鐵盒】的金屬封皮之中！</p>
            <div className="bg-amber-950/40 border border-amber-600/50 p-3 rounded-xl text-xs space-y-1.5">
              <div className="text-amber-200 font-bold">本次擴充成果：</div>
              <div className="text-stone-300 space-y-1">
                {pagesGained.map((pg, idx) => (
                  <div key={`${pg}-${idx}`} className="flex items-center gap-1.5 text-amber-300">
                    <span>✦</span>
                    <span>融入 {pg}</span>
                  </div>
                ))}
              </div>
              <div className="pt-1 border-t border-amber-800/40 text-stone-300 flex items-center justify-between">
                <span>鐵盒當前封存上限：</span>
                <span className="font-mono font-bold text-amber-200 text-sm">{newCap} 樣道具</span>
              </div>
              {currentPages.preface && (
                <div className="text-yellow-300 font-bold flex items-center gap-1.5">
                  <span>✨</span>
                  <span>已啟動【序】：第 30 回合結束時可選擇跨局繼承當前角色！</span>
                </div>
              )}
            </div>
          </div>
        ),
        badges: [
          ...(capacityGain > 0
            ? [{ label: '容量提升', value: `+${capacityGain} 格 (總計 ${newCap} 格)`, color: 'text-amber-300' }]
            : []),
          ...(prefaceUnlocked ? [{ label: '能力啟動', value: '跨局繼承角色', color: 'text-yellow-400' }] : []),
        ],
        confirmText: '確定',
        onConfirm: () => {
          setOutcomeModal(null);
        },
      });
      return true;
    }

    return false;
  };

  // 淘金小鎮：按順序取得制計算當前應出土之頁籤（第一頁 -> 第六頁 -> 第七頁 -> 序，不並存）
  const getNextGoldTownPageTarget = (): 'first_page' | 'sixth_page' | 'seventh_page' | 'preface' | null => {
    const p = meta.ironBoxPages || {};
    const inv = gameState.inventory || {};
    if (!p.firstPage) {
      if ((inv['第一頁'] || 0) > 0) return null; // 背包已有，先去改造擴充
      return 'first_page';
    }
    if (!p.sixthPage) {
      if ((inv['第六頁'] || 0) > 0) return null;
      return 'sixth_page';
    }
    if (!p.seventhPage) {
      if ((inv['第七頁'] || 0) > 0) return null;
      return 'seventh_page';
    }
    if (!p.preface) {
      if ((inv['序'] || 0) > 0) return null;
      return 'preface';
    }
    return null; // 全部已擴充完畢
  };

  // 6. 梯田狀態標籤計算（供角色欄按鈕顯示狀態徽章）
  const getTerraceStatusBadge = () => {
    if (!gameState.terraceUnlocked && !gameState.flags['terrace_unlocked']) return null;
    const plot = gameState.terracePlot;
    if (!plot || plot.step === 'idle') return null;
    if (plot.step === 'tilled') return { text: '待播種', isMature: false };
    if (plot.step === 'seeded') return { text: '待澆水', isMature: false };
    if (plot.step === 'watered') {
      const growth = Number(plot.growthRounds || 0);
      if (growth >= 5) {
        return { text: '可收成！', isMature: true };
      }
      return { text: `剩${Math.max(1, 5 - growth)}回合`, isMature: false };
    }
    return null;
  };

  // 拖曳道具至「煙火燃燒」環境標籤處理：
  // 1. 煙花易冷 (C2010-03)：滅火解除環境狀態（需本草綱目）
  // 2. 錯過的煙火 (C2022-08)：火上加火引爆大爆炸，除錯過的煙火本身與最新獲得的物品外，其餘行囊物品全數燒毀
  // 3. 除了煙花易冷以外的物品：移入煙火燃燒字樣區將被焚燒消失
  return {
    handleConfirmGuideBlacksmith,
    handleDeclineGuideBlacksmith,
    handleConfirmExchangeInstrument,
    handleDeclineExchangeInstrument,
    handleConfirmUpgradeClock,
    handleConfirmUpgradeShovel,
    handleConfirmUpgradeTimeMachine,
    handleConfirmExpandIronBox,
    handleInventoryItemClick,
    handleExecuteEncounterWeaponCraft,
    handleBlacksmithTrade,
  };
}
