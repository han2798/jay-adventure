import React from 'react';
import { GameState, JokerEquipment, MetaProgress } from '../types';

/**
 * 喬克叔叔心願裝備 Hook 參數介面
 */
export interface UseJokerEquipmentParams {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  setMeta: React.Dispatch<React.SetStateAction<MetaProgress>>;
  addLog: (message: string, type?: 'action' | 'milestone' | 'warning' | 'story') => void;
  setOutcomeModal: (data: any) => void;
  triggerCardShowcase: (cardId: string, subtitle?: string, onClose?: () => void) => void;
}

/**
 * 喬克叔叔 (Joker) 裝備與心願系統 Custom Hook
 * 負責處理：在我的地盤、穿鞋子特大號、表演紅模仿 三大心願組件裝備、卸下與合體觸發《可愛女人》邏輯
 */
export function useJokerEquipment({
  gameState,
  setGameState,
  setMeta,
  addLog,
  setOutcomeModal,
  triggerCardShowcase,
}: UseJokerEquipmentParams) {

  // =========================================================================
  // 1. 裝備喬克叔叔心願卡牌 (檢查是否吻合 slot 心願：地盤/鞋子/紅模仿)
  // =========================================================================
  const handleEquipJoker = (slot: keyof JokerEquipment, itemName: string) => {
    // 心願欄位對應之正確卡牌名稱
    const expectedMap: Record<keyof JokerEquipment, string> = {
      place: '我的地盤',
      shoes: '鞋子特大號',
      performance: '紅模仿',
    };

    // 提示名稱對應
    const slotLabelMap: Record<keyof JokerEquipment, string> = {
      place: '在',
      shoes: '穿',
      performance: '表演',
    };

    // 若玩家拖曳或選擇的卡牌名稱不吻合該槽位心願
    if (itemName !== expectedMap[slot]) {
      addLog(`【心願未應】「${itemName}」似乎無法呼應喬克叔叔此處「${slotLabelMap[slot]}」的心願之謎……`, 'warning');
      setOutcomeModal({
        title: '✦ 心願未應 ✦',
        icon: '🎭',
        subtitle: '喬克叔叔的心願詰問',
        narrative: `「${itemName}」似乎無法呼應喬克叔叔此處【${slotLabelMap[slot]}＿＿＿】的心願之謎……行囊中的物品並未被消耗。`,
        confirmText: '收回行囊',
        onConfirm: () => setOutcomeModal(null),
      });
      return;
    }

    // 檢查玩家行囊數量是否足夠
    if (!gameState.inventory[itemName] || gameState.inventory[itemName] <= 0) {
      addLog(`【行囊不足】你並未持有【${itemName}】。`, 'warning');
      return;
    }

    setGameState((prev) => {
      const nextSlots = { ...prev.jokerSlots, [slot]: itemName };
      const nextInv = { ...prev.inventory };

      // 扣除行囊中的材料卡牌
      nextInv[itemName] = Math.max(0, (nextInv[itemName] || 1) - 1);
      if (nextInv[itemName] === 0) delete nextInv[itemName];

      // 判斷三個心願槽位是否全數裝備齊全 (我的地盤 + 鞋子特大號 + 紅模仿)
      let awardCuteWoman = false;
      if (
        nextSlots.place === '我的地盤' &&
        nextSlots.shoes === '鞋子特大號' &&
        nextSlots.performance === '紅模仿'
      ) {
        awardCuteWoman = true;
        nextInv['可愛女人'] = (nextInv['可愛女人'] || 0) + 1;
      }

      if (awardCuteWoman) {
        // 成功滿足所有心願，點亮《可愛女人》圖鑑
        setMeta((m) => ({
          ...m,
          unlockedCardIds: Array.from(new Set([...m.unlockedCardIds, 'C2000-01'])),
        }));

        addLog('🎩✨【心願圓滿】「在我的地盤，穿鞋子特大號，表演紅模仿！」喬克叔叔的心願全數實現！獲得卡牌《可愛女人》（C2000-01）！', 'milestone');

        // 展示《可愛女人》大卡
        triggerCardShowcase('C2000-01', '喬克叔叔三大心願圓滿達成');
      } else {
        addLog(`🤡【喬克心願】喬克叔叔成功裝備了【${itemName}】！`, 'action');
      }

      return {
        ...prev,
        inventory: nextInv,
        jokerSlots: nextSlots,
      };
    });
  };

  // =========================================================================
  // 2. 卸下喬克叔叔已裝備的心願卡牌 (將卡牌安全歸還至玩家行囊)
  // =========================================================================
  const handleUnequipJoker = (slot: keyof JokerEquipment) => {
    setGameState((prev) => {
      const item = prev.jokerSlots?.[slot];
      if (!item) return prev;

      const nextSlots = { ...prev.jokerSlots, [slot]: null };
      const nextInv = { ...prev.inventory, [item]: (prev.inventory[item] || 0) + 1 };

      addLog(`喬克叔叔卸下了裝備【${item}】。`, 'action');

      setOutcomeModal({
        title: '✦ 卸下裝備 ✦',
        icon: '🤡',
        subtitle: '喬克叔叔的心願詰問',
        narrative: `喬克叔叔卸下了【${item}】，卡牌已安然歸還至你的行囊之中。`,
        badges: [
          { label: '歸還行囊', value: `【${item}】`, color: 'text-stone-300' },
        ],
        confirmText: '確認',
        onConfirm: () => setOutcomeModal(null),
      });

      return {
        ...prev,
        inventory: nextInv,
        jokerSlots: nextSlots,
      };
    });
  };

  return {
    handleEquipJoker,
    handleUnequipJoker,
  };
}
