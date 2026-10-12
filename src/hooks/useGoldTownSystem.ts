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
}: UseGoldTownParams) {
  // 控制是否顯示淘金小鎮確認彈窗
  const [showGoldTownConfirmModal, setShowGoldTownConfirmModal] = useState<boolean>(false);
  // 控制是否顯示淘金小鎮挖掘遊戲彈窗
  const [showGoldTownDigModal, setShowGoldTownDigModal] = useState<boolean>(false);
  // 記錄本次淘金是否由卡牌觸發 (如《黃金小鎮》歌曲卡)
  const [isGoldTownFromRevealedCard, setIsGoldTownFromRevealedCard] = useState<boolean>(false);

  // =========================================================================
  // 1. 開啟淘金小鎮確認介面
  // =========================================================================
  const handleOpenGoldTown = () => {
    setIsGoldTownFromRevealedCard(false);
    setShowGoldTownConfirmModal(true);
  };

  // =========================================================================
  // 2. 淘金小鎮探勘結算處理 (發放獲得之金幣、道具、更新 flags 與圖鑑)
  // =========================================================================
  const handleGoldTownComplete = (reward: GoldTownReward) => {
    // 關閉探勘挖掘彈窗
    setShowGoldTownDigModal(false);

    const foundCoins = reward.foundCoins || 0;
    const foundItems = reward.foundItems || [];
    setIsGoldTownFromRevealedCard(false);

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
