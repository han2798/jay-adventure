import React, { useState } from 'react';
import { GameState, MetaProgress, CardDefinition } from '../types';
import { CARD_DATABASE } from '../data/cards';

/**
 * 淘金小鎮挖掘結算獎勵資料結構
 */
export interface GoldTownReward {
  foundCoins: number;   // 挖到的金幣數量
  foundItems: string[]; // 挖到的道具名稱清單
}

/**
 * 淘金小鎮 Hook 輸入參數
 */
export interface UseGoldTownParams {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  meta: MetaProgress;
  setMeta: React.Dispatch<React.SetStateAction<MetaProgress>>;
  addLog: (message: string, type?: 'action' | 'milestone' | 'warning' | 'story') => void;
  setOutcomeModal: (data: any) => void;
  startNewRound: (targetRound?: number, customState?: Partial<GameState>) => void;
  triggerCardShowcase?: (cardId: string, subtitle?: string, onClose?: () => void) => void;
}

/**
 * 淘金小鎮 (Gold Town) 挖寶系統 Custom Hook
 * 負責處理：進入小鎮彈窗、掘金判定、金幣與道具發放、卡牌圖鑑解鎖與結算視窗展示
 */
export function useGoldTownSystem({
  gameState,
  setGameState,
  meta,
  setMeta,
  addLog,
  setOutcomeModal,
  startNewRound,
  triggerCardShowcase,
}: UseGoldTownParams) {
  // 控制是否顯示淘金小鎮確認彈窗
  const [showGoldTownConfirmModal, setShowGoldTownConfirmModal] = useState<boolean>(false);
  // 控制是否顯示淘金小鎮挖掘遊戲彈窗
  const [showGoldTownDigModal, setShowGoldTownDigModal] = useState<boolean>(false);
  // 記錄本次淘金是否由卡牌觸發 (如抽到《淘金小鎮》歌曲卡)
  const [isGoldTownFromRevealedCard, setIsGoldTownFromRevealedCard] = useState<boolean>(false);

  // =========================================================================
  // 1. 開啟淘金小鎮確認介面
  // =========================================================================
  const handleOpenGoldTown = () => {
    setIsGoldTownFromRevealedCard(false);
    setShowGoldTownConfirmModal(true);
  };

  // =========================================================================
  // 2. 淘金小鎮探勘結算處理 (發放獲得之金幣、道具、更新 flags 與圖鑑、彈窗並前進回合)
  // =========================================================================
  const handleGoldTownComplete = (reward: GoldTownReward) => {
    // 關閉探勘挖掘彈窗
    setShowGoldTownDigModal(false);

    const wasFromCard = isGoldTownFromRevealedCard;
    setIsGoldTownFromRevealedCard(false);

    const foundCoins = reward.foundCoins || 0;
    const foundItems = reward.foundItems || [];

    // 更新遊戲全域狀態：將挖到的道具加入行囊、增加金幣、設置 discovered_coins 旗標
    setGameState((prev) => {
      const updatedInventory = { ...prev.inventory };
      let updatedItemOrder = [...(prev.itemAcquisitionOrder || Object.keys(updatedInventory))];
      const updatedDrawnCount = { ...prev.drawnCount };

      foundItems.forEach((itemName) => {
        updatedInventory[itemName] = (updatedInventory[itemName] || 0) + 1;
        if (!updatedItemOrder.includes(itemName)) {
          updatedItemOrder.push(itemName);
        }
        const card = CARD_DATABASE.find((c) => c.name === itemName || c.id === itemName);
        if (card) {
          updatedDrawnCount[card.id] = (updatedDrawnCount[card.id] || 0) + 1;
        }
      });

      const updatedCoins = (prev.stats.coins || 0) + foundCoins;
      const updatedFlags = { ...prev.flags };
      if (foundCoins > 0 || updatedCoins > 0) {
        updatedFlags['discovered_coins'] = true;
      }

      return {
        ...prev,
        inventory: updatedInventory,
        itemAcquisitionOrder: updatedItemOrder,
        drawnCount: updatedDrawnCount,
        flags: updatedFlags,
        stats: {
          ...prev.stats,
          coins: updatedCoins,
        },
      };
    });

    // 自動點亮並解鎖挖到的道具圖鑑
    const newlyUnlockedCards: string[] = [];
    foundItems.forEach((itemName) => {
      const card = CARD_DATABASE.find((c) => c.name === itemName || c.id === itemName);
      if (card && !meta.unlockedCardIds.includes(card.id)) {
        newlyUnlockedCards.push(card.id);
      }
    });

    if (newlyUnlockedCards.length > 0) {
      setMeta((m) => ({
        ...m,
        unlockedCardIds: Array.from(new Set([...m.unlockedCardIds, ...newlyUnlockedCards])),
      }));
    }

    // 紀錄冒險日誌
    const lootSummary: string[] = [];
    if (foundCoins > 0) lootSummary.push(`${foundCoins} 枚金幣`);
    foundItems.forEach((it) => lootSummary.push(`【${it}】`));

    if (lootSummary.length > 0) {
      addLog(`【淘金成果】本次探勘成功挖獲：${lootSummary.join('、')}！`, 'milestone');
    } else {
      addLog('【淘金空手而歸】荒野礦坑泥沙滾滾，這次探勘未能掘得寶物。', 'warning');
    }

    // 建構結算徽章與彈窗敘述
    const badges: any[] = [];
    if (foundCoins > 0) {
      badges.push({ label: '金幣出土', value: `+${foundCoins} 枚`, color: 'text-yellow-400' });
    }
    foundItems.forEach((itemName) => {
      badges.push({ label: '發掘寶物', value: `【${itemName}】`, color: 'text-amber-300' });
    });

    const outcomeNarrative = (
      React.createElement('div', { className: 'space-y-3 font-sans leading-relaxed text-stone-300' },
        React.createElement('p', null,
          lootSummary.length > 0
            ? `在淘金小鎮的沙石泥土中奮力淘洗，你成功挖掘獲得了 ${lootSummary.join('、')}！`
            : '荒野礦坑泥沙滾滾，這次探勘未能掘得寶物。'
        ),
        React.createElement('p', { className: 'text-xs text-amber-300/90 font-mono' },
          '「用雙手淘洗一切想要的生活」——所得金幣與寶物已妥善收納於行囊中！'
        )
      )
    );

    if (wasFromCard) {
      // 若由抽到《淘金小鎮》卡牌觸發：必須展示結算彈窗，並在點擊確認後推進至下一回合
      const nextRound = gameState.round + 1;
      const isAtOrExceedingRound30 = gameState.round >= 30;
      const finalRound = isAtOrExceedingRound30 ? 31 : nextRound;

      setOutcomeModal({
        title: '✦ 淘金小鎮・探勘結算 ✦',
        icon: '⛏️',
        subtitle: '【淘金小鎮】・挖寶結算',
        narrative: outcomeNarrative,
        badges: badges.length > 0 ? badges : undefined,
        confirmText: isAtOrExceedingRound30
          ? '確定（第 30 回合冒險結算）'
          : `確定（進入第 ${Math.min(30, nextRound)} 回合）`,
        onConfirm: () => {
          setOutcomeModal(null);

          // 淘金發掘獲得之特殊卡牌逐一全貌亮相 (CardShowcaseModal)
          const dugCards: CardDefinition[] = [];
          foundItems.forEach((itemName) => {
            const card = CARD_DATABASE.find((c) => c.name === itemName || c.id === itemName);
            if (card) {
              dugCards.push(card);
            }
          });

          const handleFinishSequence = () => {
            startNewRound(finalRound);
          };

          if (dugCards.length > 0 && typeof triggerCardShowcase === 'function') {
            const showCardsInSequence = (index: number) => {
              if (index >= dugCards.length) {
                handleFinishSequence();
                return;
              }
              const currentCard = dugCards[index];
              triggerCardShowcase(currentCard.id, '淘金小鎮探勘發掘', () => {
                setTimeout(() => {
                  showCardsInSequence(index + 1);
                }, 60);
              });
            };
            showCardsInSequence(0);
          } else {
            handleFinishSequence();
          }
        },
      });
    } else {
      // 若由角色欄「淘金小鎮」常駐設施進入：展示結算彈窗，確認後返回冒險（回合不前進）
      setOutcomeModal({
        title: '✦ 淘金小鎮・常駐探勘 ✦',
        icon: '⛏️',
        subtitle: '常駐礦區探勘成果',
        narrative: outcomeNarrative,
        badges: badges.length > 0 ? badges : undefined,
        confirmText: '返回冒險',
        onConfirm: () => {
          setOutcomeModal(null);

          // 常駐淘金發掘獲得之特殊卡牌亦逐一全貌亮相
          const dugCards: CardDefinition[] = [];
          foundItems.forEach((itemName) => {
            const card = CARD_DATABASE.find((c) => c.name === itemName || c.id === itemName);
            if (card) {
              dugCards.push(card);
            }
          });

          if (dugCards.length > 0 && typeof triggerCardShowcase === 'function') {
            const showCardsInSequence = (index: number) => {
              if (index >= dugCards.length) return;
              const currentCard = dugCards[index];
              triggerCardShowcase(currentCard.id, '淘金小鎮探勘發掘', () => {
                setTimeout(() => {
                  showCardsInSequence(index + 1);
                }, 60);
              });
            };
            showCardsInSequence(0);
          }
        },
      });
    }
  };

  return {
    showGoldTownConfirmModal,
    setShowGoldTownConfirmModal,
    showGoldTownDigModal,
    setShowGoldTownDigModal,
    isGoldTownFromRevealedCard,
    setIsGoldTownFromRevealedCard,
    handleOpenGoldTown,
    handleGoldTownComplete,
  };
}
