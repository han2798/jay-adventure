import React from 'react';
import { GameState, MetaProgress } from '../types';

/**
 * 梯田農場系統專用介面與參數定義
 */
export interface UseTerraceSystemParams {
  // 全域遊戲狀態 setter
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  // 全域存檔/解鎖紀錄 setter
  setMeta: React.Dispatch<React.SetStateAction<MetaProgress>>;
  // 冒險日誌記錄函式
  addLog: (message: string, type?: 'action' | 'milestone' | 'warning' | 'story') => void;
  // 結果彈窗控制 setter
  setOutcomeModal: (data: any) => void;
  // 卡牌展示全版視窗觸發函式
  triggerCardShowcase: (cardId: string, subtitle?: string, onClose?: () => void) => void;
  // 梯田視窗顯示控制 setter
  setShowTerraceModal: (show: boolean) => void;
}

/**
 * 梯田高山茶嶺農作系統 Custom Hook
 * 負責處理：翻土、播種 (茶樹/花海)、灌溉、收成與田畦重置等邏輯
 */
export function useTerraceSystem({
  setGameState,
  setMeta,
  addLog,
  setOutcomeModal,
  triggerCardShowcase,
  setShowTerraceModal,
}: UseTerraceSystemParams) {

  // =========================================================================
  // 1. 梯田翻土 (需持有【鐵鏟】，農具不消耗；將 idle 狀態翻整為 tilled)
  // =========================================================================
  const handleTerraceTill = (inventory: Record<string, number>) => {
    // 檢查玩家行囊中是否擁有鐵鏟
    const shovel = inventory['鐵鏟'] || 0;
    if (shovel < 1) return;

    // 更新梯田狀態為已翻土
    setGameState((prev) => ({
      ...prev,
      terracePlot: {
        targetCrop: prev.terracePlot?.targetCrop || null,
        step: 'tilled',
      },
    }));

    // 紀錄冒險日誌
    addLog('⚒️【梯田翻土】手持【鐵鏟】深耕翻動梯田土壤，土質鬆軟透氣！下一步可進行播種作物！', 'action');
  };

  // =========================================================================
  // 2. 梯田播種 (土壤已深耕翻整：投入泥土 ➔ 茶葉；菊花＋迷迭香 ➔ 花海)
  // =========================================================================
  const handleTerracePlant = (crop: 'tea' | 'flower_sea', inventory: Record<string, number>) => {
    if (crop === 'tea') {
      // 播種茶樹：檢查並扣除 1 份【泥土】
      const soil = inventory['泥土'] || 0;
      if (soil < 1) return;

      setGameState((prev) => {
        const nextInv = { ...prev.inventory };
        if (nextInv['泥土'] > 1) {
          nextInv['泥土'] -= 1;
        } else {
          delete nextInv['泥土'];
        }
        return {
          ...prev,
          inventory: nextInv,
          terracePlot: {
            targetCrop: 'tea',
            step: 'seeded',
          },
        };
      });

      addLog('🌱【梯田播種】在鬆軟土壤中播撒【泥土】茶苗種子，茶苗已妥善入土！下一步需以【水】引水灌溉！', 'action');
    } else if (crop === 'flower_sea') {
      // 播種花海：檢查並扣除 1 份【菊花】與 1 份【迷迭香】
      const chrysanthemum = inventory['菊花'] || 0;
      const rosemary = inventory['迷迭香'] || 0;
      if (chrysanthemum < 1 || rosemary < 1) return;

      setGameState((prev) => {
        const nextInv = { ...prev.inventory };
        if (nextInv['菊花'] > 1) nextInv['菊花'] -= 1;
        else delete nextInv['菊花'];

        if (nextInv['迷迭香'] > 1) nextInv['迷迭香'] -= 1;
        else delete nextInv['迷迭香'];

        return {
          ...prev,
          inventory: nextInv,
          terracePlot: {
            targetCrop: 'flower_sea',
            step: 'seeded',
          },
        };
      });

      addLog('🌸【梯田播種】在鬆軟土壤中播撒【菊花】與【迷迭香】，花種已入土！下一步需以【水】引水灌溉！', 'action');
    }
  };

  // =========================================================================
  // 3. 梯田灌溉 (消耗【水】*1，掛載 5 回合計時)
  // =========================================================================
  const handleTerraceWater = (inventory: Record<string, number>, currentRound: number) => {
    // 檢查並扣除【水】
    const waterCount = inventory['水'] || 0;
    if (waterCount < 1) return;

    setGameState((prev) => {
      if (!prev.terracePlot) return prev;
      const nextInv = { ...prev.inventory };
      if (nextInv['水'] > 1) {
        nextInv['水'] -= 1;
      } else {
        delete nextInv['水'];
      }
      return {
        ...prev,
        inventory: nextInv,
        terracePlot: {
          ...prev.terracePlot,
          step: 'watered',
          completedRound: currentRound,
          growthRounds: 0,
          requiredRounds: 5,
        },
      };
    });

    addLog('💧【梯田灌溉】傾倒甘霖滋養田畦，作物正式進入生長！歷經滿 5 回合後即可收成！', 'milestone');
  };

  // =========================================================================
  // 4. 梯田收成 (茶葉 ➔ 獲得【茶葉】道具；花海 ➔ 獲得《花海》卡牌與圖鑑解鎖)
  // =========================================================================
  const handleTerraceHarvest = (gameState: GameState) => {
    if (!gameState.terracePlot || gameState.terracePlot.step !== 'watered') return;

    // 計算作物生長回合數是否已達標 (>= 5 回合)
    const growth = Number(
      gameState.terracePlot.growthRounds ??
      (gameState.round >= (gameState.terracePlot.matureRound || 999) ? 5 : 0)
    );
    if (growth < 5) return;

    const targetCrop = gameState.terracePlot.targetCrop;

    if (targetCrop === 'tea') {
      // 情況 A：收成茶葉
      setGameState((prev) => {
        const nextInv = { ...prev.inventory };
        nextInv['茶葉'] = (nextInv['茶葉'] || 0) + 1;
        const currentOrder = prev.itemAcquisitionOrder || Object.keys(nextInv);
        const order = currentOrder.filter((k) => (nextInv[k] || 0) > 0);
        if (!order.includes('茶葉')) order.push('茶葉');
        return {
          ...prev,
          inventory: nextInv,
          itemAcquisitionOrder: order,
          terracePlot: {
            targetCrop: null,
            step: 'idle',
            growthRounds: 0,
            requiredRounds: 5,
          },
        };
      });

      addLog('🍵🌾【梯田收成】採收獲得新鮮青翠的【茶葉】！此茶香氣馥郁！', 'milestone');

      // 彈出收成文字敘述彈窗
      setOutcomeModal({
        title: '✦ 高山茶嶺・香茗採收 ✦',
        icon: '🍵',
        subtitle: '梯田耕作・茶葉豐收',
        narrative: (
          <div className="space-y-3 font-sans leading-relaxed text-stone-300">
            <p>經歷 5 回合淬鍊，茶葉生長翠綠、你摘下香氣撲鼻的【茶葉】！</p>
            <p>這【茶葉】之香，絕對比得上爺爺當年說的茶聖泡的茶！</p>
            <p className="text-s text-emerald-300/90 font-mono">你不禁心想：或許，外婆能再次泡出當年爺爺泡的茶。</p>
          </div>
        ),
        badges: [
          { label: '收成作物', value: '【茶葉】1份', color: 'text-emerald-300' },
          { label: '梯田狀態', value: '恢復閒置・可再耕種', color: 'text-stone-400' },
        ],
        confirmText: '收入行囊',
        onConfirm: () => {
          setOutcomeModal(null);
        },
      });
    } else if (targetCrop === 'flower_sea') {
      // 情況 B：收成花海
      setGameState((prev) => {
        const nextInv = { ...prev.inventory };
        nextInv['花海'] = (nextInv['花海'] || 0) + 1;
        const currentOrder = prev.itemAcquisitionOrder || Object.keys(nextInv);
        const order = currentOrder.filter((k) => (nextInv[k] || 0) > 0);
        if (!order.includes('花海')) order.push('花海');
        return {
          ...prev,
          inventory: nextInv,
          itemAcquisitionOrder: order,
          terracePlot: {
            targetCrop: null,
            step: 'idle',
            growthRounds: 0,
            requiredRounds: 5,
          },
        };
      });

      // 點亮《花海》卡牌圖鑑
      setMeta((prev) => ({
        ...prev,
        unlockedCardIds: Array.from(new Set([...prev.unlockedCardIds, 'C2008-04'])),
      }));

      addLog('💐🌾【花海盛開】梯田繁花錦簇，獲得卡牌《花海》！', 'milestone');

      // 觸發大卡展示
      triggerCardShowcase('C2008-04', '高山梯田培育盛開出土', () => {
        setShowTerraceModal(true);
      });
    }
  };

  // =========================================================================
  // 5. 梯田田畦重置清空 (將梯田恢復為初始荒蕪閒置狀態)
  // =========================================================================
  const handleTerraceClear = () => {
    setGameState((prev) => ({
      ...prev,
      terracePlot: {
        targetCrop: null,
        step: 'idle',
        growthRounds: 0,
        requiredRounds: 5,
      },
    }));
    addLog('🌾【梯田重置】清空了梯田田畦，恢復為荒蕪閒置狀態，可重新選擇播種。', 'action');
  };

  return {
    handleTerraceTill,
    handleTerracePlant,
    handleTerraceWater,
    handleTerraceHarvest,
    handleTerraceClear,
  };
}
