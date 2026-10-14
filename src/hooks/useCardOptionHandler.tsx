import React, { useCallback } from 'react';
import { GameState, MetaProgress, CardDefinition, RouteVictoryRecord } from '../types';
import { CARD_DATABASE, getCardItemNames, getCardIdByItemName } from '../data/cards';
import { ALL_CHARACTERS } from '../data/characters';
import { getCarnivalStageData } from '../data/carnival';
import { OutcomeModalData } from '../components/modals/OutcomeModal';
import { restoreCardQuotaOnItemLost, isPaperItem, exchangeInventoryItems, isItemPeninsulaRestricted } from '../utils/gameHelpers';

/**
 * 抽卡選項點擊處理與卡牌效果 Engine Hook 參數
 */
export interface UseCardOptionHandlerParams {
  gameState: GameState;
  meta: MetaProgress;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  setMeta: React.Dispatch<React.SetStateAction<MetaProgress>>;
  advanceToNextRound: (targetRound?: number, customState?: Partial<GameState>) => void;
  startNewRound: (targetRound?: number, customState?: Partial<GameState>) => void;
  triggerCardShowcase: (cardOrName: any, badgeTitle?: string, onClose?: () => void, extra?: any) => void;
  checkAchievements: (stateOrInv: any, meta?: MetaProgress) => void;
  getIronBoxCapacity: (pages?: any) => number;
  addLog: (msg: string, type?: string) => void;
  setShowBlacksmithModal: (show: boolean) => void;
  setShowGuideBlacksmithModal: (show: boolean) => void;
  setShowWeaponChoiceModal: (show: boolean) => void;
  setShowExchangeInstrumentModal: (show: boolean) => void;
  setShowUpgradeClockModal: (show: boolean) => void;
  setShowUpgradeShovelModal: (show: boolean) => void;
  setShowUpgradeTimeMachineModal: (show: boolean) => void;
  setShowExpandIronBoxModal: (show: boolean) => void;
  setShowIronBoxInheritModal: (show: boolean) => void;
  setShowGoldTownConfirmModal: (show: boolean) => void;
  setShowGoldTownDigModal?: (show: boolean) => void;
  setIsGoldTownFromRevealedCard: (val: boolean) => void;
  setShowApExhaustedModal: (show: boolean) => void;
  setSelectedIronBoxItems: React.Dispatch<React.SetStateAction<string[]>>;
  setOutcomeModal: React.Dispatch<React.SetStateAction<OutcomeModalData | null>>;
  setPendingEventTransition: React.Dispatch<React.SetStateAction<any>>;
  setPendingNextGameCallback: React.Dispatch<React.SetStateAction<(((inherited?: string[], retainChar?: boolean) => void) | null)>>;
  setRetainCharacterInNextGame: (val: boolean) => void;
}

/**
 * 處理玩家選擇卡牌選項時的所有連鎖反應與邏輯計算
 */
export function useCardOptionHandler(params: UseCardOptionHandlerParams) {
  const {
    gameState,
    meta,
    setGameState,
    setMeta,
    advanceToNextRound,
    startNewRound,
    triggerCardShowcase,
    checkAchievements,
    getIronBoxCapacity,
    addLog,
    setShowBlacksmithModal,
    setShowGuideBlacksmithModal,
    setShowWeaponChoiceModal,
    setShowExchangeInstrumentModal,
    setShowUpgradeClockModal,
    setShowUpgradeShovelModal,
    setShowUpgradeTimeMachineModal,
    setShowExpandIronBoxModal,
    setShowIronBoxInheritModal,
    setShowGoldTownConfirmModal,
    setShowGoldTownDigModal,
    setIsGoldTownFromRevealedCard,
    setShowApExhaustedModal,
    setSelectedIronBoxItems,
    setOutcomeModal,
    setPendingEventTransition,
    setPendingNextGameCallback,
    setRetainCharacterInNextGame,
  } = params;

  const handleSelectOption = (optionIndex: number) => {
    if (!gameState.revealedCard) return;

    const card = gameState.revealedCard;
    let option = card.options && card.options[optionIndex];

    if (card.id === 'C2004-09') {
      const currentLayer = (gameState.flags['carnival_layer'] as string) || 'carnival_layer_1';
      const stageData = getCarnivalStageData(currentLayer, gameState.flags);
      option = stageData.options[optionIndex] || stageData.options[0];
    }

    // 針對龍戰騎士 (C2008-01) 無道具可選時的正面受擊選項 (-2)
    if (optionIndex === -2 && card.id === 'C2008-01') {
      option = {
        text: '無合適道具抵禦，正面承受龍戰騎士的猛烈一擊',
        resultText: '未能擊敗龍戰騎士，行動力 -8',
        effect: { apChange: -8 },
      };
    } else if (!option) {
      option = {
        text: '收入行囊',
        resultText: `獲得了【${card.name}】！`,
        effect: { addItem: card.name },
      };
    }

    const eff = option.effect;
    const nextInventory = { ...gameState.inventory };
    const newlyAcquiredItemsThisRound: string[] = [];
    let nextItemOrder = [...(gameState.itemAcquisitionOrder || Object.keys(nextInventory))].filter(
      (k) => (nextInventory[k] || 0) > 0
    );
    const recordItemAcquired = (itemName: string) => {
      nextItemOrder = [...nextItemOrder.filter((k) => k !== itemName), itemName];
      if (!newlyAcquiredItemsThisRound.includes(itemName)) {
        newlyAcquiredItemsThisRound.push(itemName);
      }
    };
    const nextFlags = { ...gameState.flags };
    let nextStats = { ...gameState.stats };
    let nextCharacter = gameState.character;
    let nextVictory = gameState.victoryType;
    let nextDefeat = gameState.defeatReason;
    let nextRound = gameState.round + 1;
    let optionResultText = option.resultText;
    let effectiveForceNextCardId = eff?.forceNextCardId;
    const badges: { label: string; value: string; color: string }[] = [];
    let specialCardToShowcase: { cardId: string; sourceText: string; badgeTitle?: string } | null = null;

    // 特殊邏輯：龍戰騎士 (C2008-01) 判定
    if (card.id === 'C2008-01') {
      const isHero = gameState.character?.name === '英雄';
      const isDragonDefeated =
        isHero ||
        option.text.includes('雙刀與雙截棍齊出') ||
        option.text.includes('無雙一擊');

      if (isHero) {
        // 英雄初始能力：赤手空拳打敗敵人（半獸人、忍者、龍戰騎士），毋需武器
        optionResultText =
          '英雄身手撼動乾坤！拳風破開浩劫烈焰，不需兵刃便擊退龍戰騎士！獲得【龍戰騎士的遺言】！';
        addLog('【英雄身手】毋需兵刃，赤手空拳正面擊敗強敵【龍戰騎士】！獲得【龍戰騎士的遺言】！', 'milestone');
        nextInventory['龍戰騎士的遺言'] = (nextInventory['龍戰騎士的遺言'] || 0) + 1;
        recordItemAcquired('龍戰騎士的遺言');
        nextFlags['defeated_dragon_knight'] = true;
        nextFlags['defeat_龍戰騎士'] = true;
        nextFlags['dragon_awakened'] = false;
        badges.push({ label: '英雄身手', value: '赤手空拳破龍威', color: 'text-amber-300' });
        badges.push({ label: '擊敗強敵', value: '龍戰騎士敗退', color: 'text-emerald-400' });
        badges.push({ label: '獲得物品', value: '【龍戰騎士的遺言】', color: 'text-amber-300' });
        if (eff && eff.apChange) {
          eff.apChange = 0;
        }
      } else if (!isDragonDefeated && !option.text.includes('黑色毛衣')) {
        const hasSweater = (gameState.inventory['黑色毛衣'] || 0) > 0;
        if (hasSweater) {
          // 自動抵銷一次攻擊，不會扣行動力（消耗一件行囊中的黑色毛衣）
          nextInventory['黑色毛衣'] = (nextInventory['黑色毛衣'] || 1) - 1;
          if (nextInventory['黑色毛衣'] <= 0) {
            delete nextInventory['黑色毛衣'];
          }
          if (eff && eff.apChange) {
            eff.apChange = 0;
          }
          optionResultText = '未能擊敗龍戰騎士，猛烈一擊呼嘯而來！幸好行囊中的【黑色毛衣】及時替你抵擋了一次猛攻，行動力未受損害！（消耗【黑色毛衣】1件）';
          addLog('【毛衣抵禦】面對龍戰騎士猛烈攻擊，行囊中的【黑色毛衣】自動抵銷了攻擊，行動力未受損害！消耗【黑色毛衣】1件。', 'milestone');
          badges.push({ label: '毛衣抵禦', value: '免受8點傷害', color: 'text-amber-300' });
          badges.push({ label: '消耗物品', value: '【黑色毛衣】1件', color: 'text-stone-400' });
        } else {
          // 扣 8 點行動力
          const apLoss = 8;
          nextStats.ap = Math.max(0, nextStats.ap - apLoss);
          if (eff && eff.apChange) {
            eff.apChange = 0;
          }
          optionResultText = '未能擊敗龍戰騎士，猛烈一擊席捲而來，遭受重創！行動力 -8！';
          addLog('【遭受重創】未能擊敗龍戰騎士，在猛烈一擊中遭受重創，行動力 -8！', 'warning');
          badges.push({ label: '受到重創', value: '-8 行動力', color: 'text-red-400' });
        }
      }
    }

    // 忍者 (C2001-04) 英雄不需兵刃空手制伏專屬結算文本
    if (card.id === 'C2001-04') {
      const isHero = gameState.character?.name === '英雄';
      if (
        isHero &&
        (option.text.includes('英雄天賦') || option.text.includes('赤手空拳') || option.text.includes('攔截') || option.text.includes('雙截棍') || option.text.includes('忍術') || option.text.includes('遁術') || option.text.includes('交鋒'))
      ) {
        optionResultText =
          '英雄身手矯健，不需兵刃就空手制伏忍者！忍者心悅誠服奉上忍道信物，獲得【忍者】卡牌，解除【追逐忍者】狀態！';
      }
    }

    // 印地安老斑鳩 (C2000-08) 餵食判定安全防護
    if (card.id === 'C2000-08' && option.text.includes('餵食')) {
      const hasMaltose = (gameState.inventory['麥芽糖'] || 0) > 0;
      if (!hasMaltose) {
        optionResultText = '缺少可餵食的東西，老斑鳩餓著肚子撲騰著翅膀飛走了。';
        addLog('【餵食未果】身上缺少可餵食的東西，老斑鳩拍翅飛離。', 'warning');
      }
    }

    // 特殊邏輯：半獸人 (C2002-01) 攻擊判定
    // 需消耗一個"C2003-11雙刀"or兩個"C2001-09雙截棍"才能擊敗
    // 選項只會有"攻擊"字樣，點擊後若不足會顯示不足多少東西給玩家知道
    // 已完成
    let orcDefeated = false;
    let orcWeaponUsed: '雙刀' | '雙截棍' | null = null;
    let orcBlockedBySweater = false;

    if (card.id === 'C2002-01') {
      const isHero = gameState.character?.name === '英雄';

      const twinBladesCount = gameState.inventory['雙刀'] || 0;
      const nunchakuCount = gameState.inventory['雙截棍'] || 0;
      const canDefeatWithBlades = twinBladesCount >= 1;
      const canDefeatWithNunchaku = nunchakuCount >= 2;

      if (isHero || canDefeatWithBlades || canDefeatWithNunchaku) {
        orcDefeated = true;
        if (isHero) {
          // 英雄初始能力：毋需任何武器即可赤手空拳突圍，且不消耗任何武器
          orcWeaponUsed = null;
          optionResultText =
            '你施展英雄身手赤手空拳突圍，連貫的拳風成功擊倒嗜血的半獸人！獲得【半獸人】卡牌！';
          addLog('【英雄身手】身手不凡，毋需消耗武器成功擊倒半獸人！獲得【半獸人】卡牌！', 'milestone');
        } else if (canDefeatWithBlades) {
          orcWeaponUsed = '雙刀';
          nextInventory['雙刀'] = (nextInventory['雙刀'] || 1) - 1;
          if (nextInventory['雙刀'] <= 0) {
            delete nextInventory['雙刀'];
          }
          optionResultText =
            '你拔出【雙刀】凌厲出招，以牙還牙的刀光成功擊倒嗜血的半獸人！獲得【半獸人】卡牌！（消耗【雙刀】1把）';
          addLog('【擊敗強敵】消耗【雙刀】1把，成功擊倒半獸人！獲得【半獸人】卡牌！', 'milestone');
        } else {
          orcWeaponUsed = '雙截棍';
          nextInventory['雙截棍'] = (nextInventory['雙截棍'] || 2) - 2;
          if (nextInventory['雙截棍'] <= 0) {
            delete nextInventory['雙截棍'];
          }
          optionResultText =
            '雙截棍哼哼哈兮出擊！連貫的打擊重創狂暴獸人，成功擊倒！獲得【半獸人】卡牌！（消耗【雙截棍】2支）';
          addLog('【擊敗強敵】消耗【雙截棍】2支，成功擊倒半獸人！獲得【半獸人】卡牌！', 'milestone');
        }
        nextInventory['半獸人'] = (nextInventory['半獸人'] || 0) + 1;
        recordItemAcquired('半獸人');
        nextFlags['defeated_orc'] = true;
        nextFlags['defeat_半獸人'] = true;
      } else {
        orcDefeated = false;
        const hasSweater = (gameState.inventory['黑色毛衣'] || 0) > 0;
        if (hasSweater) {
          orcBlockedBySweater = true;
          // 自動抵銷一次攻擊，不會扣行動力（消耗一件行囊中的黑色毛衣）
          nextInventory['黑色毛衣'] = (nextInventory['黑色毛衣'] || 1) - 1;
          if (nextInventory['黑色毛衣'] <= 0) {
            delete nextInventory['黑色毛衣'];
          }
          optionResultText = '你對半獸人發動了攻擊，但武器不足無法擊敗！半獸人狂暴反撲，幸好行囊中的【黑色毛衣】及時替你抵擋了一次攻擊，行動力未受損害！（消耗【黑色毛衣】1件）';
          addLog('【毛衣抵禦】面對半獸人反擊，行囊中的【黑色毛衣】自動抵銷了攻擊，行動力未受損害！消耗【黑色毛衣】1件。', 'milestone');
        } else {
          // 新增會扣5點行動力的影響
          const apLoss = 5;
          nextStats.ap = Math.max(0, nextStats.ap - apLoss);
          optionResultText = '你對半獸人發動了攻擊，但武器不足無法擊敗，反遭半獸人狂暴爪擊重創！行動力 -5！';
          addLog('【攻擊未果】缺少足夠兵刃擊倒半獸人，遭受反撲重創，行動力 -5！', 'warning');
        }
      }
    }

    let nextFireworksBurning = gameState.fireworksBurning;
    let nextNinjaChasing = gameState.ninjaChasing;
    let nextNinjaNextEncounterRound = gameState.ninjaNextEncounterRound;
    let nextNinjaRound = gameState.ninjaRound;
    let nextBlacksmithUnlocked = gameState.blacksmithUnlocked;
    let nextGoldTownUnlocked = gameState.goldTownUnlocked;
    let nextTerraceUnlocked = gameState.terraceUnlocked;
    let nextRomanticPhoneUnlocked = gameState.romanticPhoneUnlocked;
    let nextHeadacheActive = gameState.headacheActive;
    let nextRainyWeatherActive = gameState.rainyWeatherActive;
    if (eff?.setFlag?.romantic_phone_unlocked !== undefined) {
      nextRomanticPhoneUnlocked = Boolean(eff.setFlag.romantic_phone_unlocked);
    } else if (card.id === 'C2005-07') {
      nextRomanticPhoneUnlocked = true;
    }
    if (eff?.setFlag?.terrace_unlocked !== undefined) {
      nextTerraceUnlocked = Boolean(eff.setFlag.terrace_unlocked);
    } else if (card.id === 'C2003-10') {
      nextTerraceUnlocked = true;
    }
    if (eff?.setFlag?.headache_active !== undefined) {
      nextHeadacheActive = Boolean(eff.setFlag.headache_active);
    } else if (card.id === 'C2012-03') {
      nextHeadacheActive = true;
    }
    if (eff?.setFlag?.rainy_weather_active !== undefined) {
      nextRainyWeatherActive = Boolean(eff.setFlag.rainy_weather_active);
    } else if (card.id === 'C2026-03') {
      nextRainyWeatherActive = true;
    }
    const nextDrawnCount = { ...gameState.drawnCount };
    const nextPeninsulaCounts = { ...(gameState.peninsulaInheritedCounts || {}) };

    // 特殊邏輯：淘金小鎮 (C2026-11) 挖寶選項
    if (card.id === 'C2026-11' && optionIndex === 0) {
      if (gameState.stats.ap < 5) {
        addLog(`【行動力不足】進入淘金小鎮需消耗 5 點行動力，當前僅剩 ${gameState.stats.ap} 點！`, 'warning');
        return;
      }
      setIsGoldTownFromRevealedCard(true);
      setGameState((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          ap: Math.max(0, prev.stats.ap - 5),
        },
      }));
      addLog('【淘金小鎮】花費 5 點行動力踏入荒野礦區，開始探勘挖寶！', 'milestone');
      if (setShowGoldTownDigModal) {
        setShowGoldTownDigModal(true);
      } else {
        setShowGoldTownConfirmModal(true);
      }
      return;
    }

    // 特殊邏輯：園遊會 (C2004-09) 多層分支狀態機
    if (card.id === 'C2004-09') {
      const currentLayer = (gameState.flags['carnival_layer'] as string) || 'carnival_layer_1';
      const stageData = getCarnivalStageData(currentLayer, gameState.flags);
      const chosenOption = stageData.options[optionIndex] || stageData.options[0];
      const optText = chosenOption.text;

      // 1. 離開園遊會
      if (optText === '離開園遊會') {
        nextFlags['carnival_layer'] = 'carnival_layer_1';
        option = chosenOption;
        optionResultText = chosenOption.resultText || '你望著遠處的摩天輪，決定暫且轉身離開園遊會。';
      }
      // 2. 繼續逛園遊會
      else if (optText === '繼續逛園遊會' || optText === '繼續逛') {
        let nextLayer = 'carnival_layer_2';
        if (currentLayer === 'carnival_layer_1') nextLayer = 'carnival_layer_2';
        else if (currentLayer === 'carnival_layer_2') nextLayer = 'carnival_layer_3';
        else if (currentLayer === 'carnival_layer_3') nextLayer = 'carnival_layer_4';
        else if (currentLayer === 'carnival_layer_4') nextLayer = 'carnival_layer_5';
        else if (currentLayer === 'carnival_layer_5') nextLayer = 'carnival_layer_1';

        nextFlags['carnival_layer'] = nextLayer;
        const nextStageData = getCarnivalStageData(nextLayer, nextFlags);

        if (nextLayer === 'carnival_layer_1') {
          addLog('【園遊會】你不知不覺繞了一大圈，又回到了園遊會熱鬧的入口處！', 'action');
        } else if (nextLayer === 'carnival_layer_3') {
          addLog('【園遊會】你繼續逛著，前方的攤位傳來陣陣清涼香氣……', 'action');
        } else if (nextLayer === 'carnival_layer_4') {
          addLog('【園遊會】你穿過冰品攤位，朝著五顏色六的玩具區走去……', 'action');
        } else if (nextLayer === 'carnival_layer_5') {
          addLog('【園遊會】你告別玩具攤位，走向傳來琴聲的深處……', 'action');
        } else {
          addLog('【園遊會】你踏著輕快的腳步走進熱鬧的園遊會……', 'action');
        }

        setGameState((prev) => ({
          ...prev,
          flags: nextFlags,
          revealedCard: {
            ...prev.revealedCard!,
            flavorText: nextStageData.flavorText,
            options: nextStageData.options,
          },
        }));
        return;
      }
      // 3. 遇到小男孩，追上他
      else if (optText === '遇到小男孩，追上他') {
        let nextLayer = 'carnival_boy_ice';
        if (currentLayer === 'carnival_layer_4') {
          if (gameState.flags['boy_has_ice_cream']) {
            if (gameState.flags['boy_has_pinwheel']) {
              nextLayer = 'carnival_boy_mv';
            } else {
              nextLayer = 'carnival_boy_toy';
            }
          } else {
            nextLayer = 'carnival_boy_chase_fail';
          }
        } else {
          // 第三層初遇
          if (gameState.flags['boy_has_ice_cream']) {
            if (gameState.flags['boy_has_pinwheel']) {
              nextLayer = 'carnival_boy_mv';
            } else {
              nextLayer = 'carnival_boy_toy';
            }
          } else {
            nextLayer = 'carnival_boy_ice';
          }
        }

        nextFlags['carnival_layer'] = nextLayer;
        const nextStageData = getCarnivalStageData(nextLayer, nextFlags);
        addLog('【園遊會】你快步追上前去，追上了在人群中穿梭的小男孩！', 'action');

        setGameState((prev) => ({
          ...prev,
          flags: nextFlags,
          revealedCard: {
            ...prev.revealedCard!,
            flavorText: nextStageData.flavorText,
            options: nextStageData.options,
          },
        }));
        return;
      }
      // 4. 給他冰
      else if (optText === '給他冰') {
        const iceCount = nextInventory['土耳其冰淇淋'] || 0;
        if (iceCount < 1) {
          addLog('【道具不足】未持有【土耳其冰淇淋】！', 'warning');
          return;
        }
        nextInventory['土耳其冰淇淋'] = Math.max(0, iceCount - 1);
        if (nextInventory['土耳其冰淇淋'] === 0) delete nextInventory['土耳其冰淇淋'];
        const quota = restoreCardQuotaOnItemLost('土耳其冰淇淋', nextDrawnCount, nextPeninsulaCounts, 1);
        Object.assign(nextDrawnCount, quota.nextDrawnCount);
        Object.assign(nextPeninsulaCounts, quota.nextPeninsulaCounts);

        nextFlags['boy_has_ice_cream'] = true;
        nextFlags['carnival_layer'] = 'carnival_boy_toy';

        const nextStageData = getCarnivalStageData('carnival_boy_toy', nextFlags);
        addLog('【小男孩的心願】你將土耳其冰淇淋給了小男孩，小男孩吃得津津有味，開心極了！', 'milestone');

        setGameState((prev) => ({
          ...prev,
          flags: nextFlags,
          inventory: nextInventory,
          drawnCount: nextDrawnCount,
          peninsulaInheritedCounts: nextPeninsulaCounts,
          revealedCard: {
            ...prev.revealedCard!,
            flavorText: nextStageData.flavorText,
            options: nextStageData.options,
          },
        }));
        return;
      }
      // 5. 沒有冰，回去買冰
      else if (optText === '沒有冰，回去買冰') {
        nextFlags['carnival_layer'] = 'carnival_layer_3';
        const nextStageData = getCarnivalStageData('carnival_layer_3', nextFlags);
        addLog('【園遊會】身上沒有冰淇淋，你轉身返回冰品攤位。', 'action');

        setGameState((prev) => ({
          ...prev,
          flags: nextFlags,
          revealedCard: {
            ...prev.revealedCard!,
            flavorText: nextStageData.flavorText,
            options: nextStageData.options,
          },
        }));
        return;
      }
      // 6. 給他玩具
      else if (optText === '給他玩具') {
        const pinwheelCount = nextInventory['白色風車'] || 0;
        if (pinwheelCount < 1) {
          addLog('【道具不足】未持有【白色風車】！', 'warning');
          return;
        }
        nextInventory['白色風車'] = Math.max(0, pinwheelCount - 1);
        if (nextInventory['白色風車'] === 0) delete nextInventory['白色風車'];
        const quota = restoreCardQuotaOnItemLost('白色風車', nextDrawnCount, nextPeninsulaCounts, 1);
        Object.assign(nextDrawnCount, quota.nextDrawnCount);
        Object.assign(nextPeninsulaCounts, quota.nextPeninsulaCounts);

        nextFlags['boy_has_pinwheel'] = true;
        nextFlags['carnival_layer'] = 'carnival_boy_mv';

        const nextStageData = getCarnivalStageData('carnival_boy_mv', nextFlags);
        addLog('【小男孩的心願】你將白色風車送給了小男孩，小男孩開心地拿著風車迎風奔跑！', 'milestone');

        setGameState((prev) => ({
          ...prev,
          flags: nextFlags,
          inventory: nextInventory,
          drawnCount: nextDrawnCount,
          peninsulaInheritedCounts: nextPeninsulaCounts,
          revealedCard: {
            ...prev.revealedCard!,
            flavorText: nextStageData.flavorText,
            options: nextStageData.options,
          },
        }));
        return;
      }
      // 7. 沒有玩具，回去買玩具
      else if (optText === '沒有玩具，回去買玩具') {
        nextFlags['carnival_layer'] = 'carnival_layer_4';
        const nextStageData = getCarnivalStageData('carnival_layer_4', nextFlags);
        addLog('【園遊會】身上沒有玩具，你轉往玩具攤位！', 'action');

        setGameState((prev) => ({
          ...prev,
          flags: nextFlags,
          revealedCard: {
            ...prev.revealedCard!,
            flavorText: nextStageData.flavorText,
            options: nextStageData.options,
          },
        }));
        return;
      }
      // 8. 不追了，返回玩具攤位
      else if (optText === '不追了，返回玩具攤位') {
        nextFlags['carnival_layer'] = 'carnival_layer_4';
        const nextStageData = getCarnivalStageData('carnival_layer_4', nextFlags);
        addLog('【園遊會】小男孩跑得太快，你決定暫且返回攤位繼續逛。', 'action');

        setGameState((prev) => ({
          ...prev,
          flags: nextFlags,
          revealedCard: {
            ...prev.revealedCard!,
            flavorText: nextStageData.flavorText,
            options: nextStageData.options,
          },
        }));
        return;
      }
      // 9. 購買攤位物品 (土耳其冰淇淋、白色風車、烏克麗麗)
      else if (optText.includes('購買土耳其冰淇淋') || optText.includes('購買白色風車') || optText.includes('購買烏克麗麗')) {
        const currentCoins = gameState.stats.coins || 0;
        if (currentCoins < 3) {
          addLog('【金幣不足】金幣不足，無法購買攤位物品！', 'warning');
          return;
        }
        nextFlags['carnival_layer'] = 'carnival_layer_1';
        option = chosenOption;
        optionResultText = chosenOption.resultText;
      }
      // 10. 給他拍攝道具
      else if (optText === '給他拍攝道具') {
        const ukuleleCount = nextInventory['烏克麗麗'] || 0;
        if (ukuleleCount < 1) {
          addLog('【道具不足】未持有【烏克麗麗】！', 'warning');
          return;
        }
        nextFlags['carnival_layer'] = 'carnival_layer_1';
        option = chosenOption;
        optionResultText = chosenOption.resultText;
      }
      // 11. 抱怨他一直要東西 / 抱怨他一直跑追不上 / 沒有道具去找找
      else {
        nextFlags['carnival_layer'] = 'carnival_layer_1';
        option = chosenOption;
        optionResultText = chosenOption.resultText;
        if (chosenOption.effect?.forceNextCardId) {
          effectiveForceNextCardId = chosenOption.effect.forceNextCardId;
        }
      }
    }

    // 特殊邏輯：威廉古堡 (C2001-08) 四大核心選項
    if (card.id === 'C2001-08') {
      // 1. 凱薩琳選項：向凱薩琳公主問好 / 問安
      if (option.text.includes('凱薩琳') || option.text.includes('問好') || option.text.includes('問安')) {
        if (gameState.character?.name === '陽光宅男') {
          // 角色是陽光宅男：因為窺視凱薩琳而被詛咒使得角色變成愛情廢柴
          const loserChar = ALL_CHARACTERS.find((c) => c.id === 'char_loser');
          if (loserChar) nextCharacter = loserChar;
          optionResultText = '凱薩琳公主幽藍的雙眼閃爍著嗜血光芒！你因暗中窺視凱薩琳而觸犯了禁忌，凱薩琳詛咒你，使你化身成為【愛情廢柴】！';
          addLog('窺視凱薩琳公主觸犯禁忌！受到惡毒詛咒，化身退化為【愛情廢柴】！', 'warning');
        } else {
          // 陽光宅男以外的角色：判斷是否持有公主病
          const hasPrincessSickness = (nextInventory['公主病'] || gameState.inventory['公主病'] || 0) > 0;
          if (hasPrincessSickness) {
            delete nextInventory['公主病'];
            const sunshineChar = ALL_CHARACTERS.find((c) => c.id === 'char_sunshine');
            if (sunshineChar) nextCharacter = sunshineChar;
            optionResultText = '凱薩琳公主幽藍的雙眼閃爍著嗜血光芒，你看著她傲慢病態的姿態，忍不住出言批評其患有嚴重的公主病，凱薩琳一氣之下把你的化身被轉化為【陽光宅男】！';
            addLog('出言批評了凱薩琳公主患有公主病！身上的《公主病》破除消散，化身轉化為【陽光宅男】！', 'warning');
          } else {
            const apLoss = 3;
            nextStats.ap = Math.max(0, nextStats.ap - apLoss);
            optionResultText = '你向凱薩琳公主問好，卻只見她面不改色地當場抓起AB血型的公老鼠撕咬吞食！你親眼目睹這血腥猙獰的一幕被嚇得毛骨悚然、心力交瘁，行動力 -3！';
            addLog('【恐怖目擊】親眼目睹凱薩琳公主生吞老鼠！被嚇得魂飛魄散，行動力-3！', 'warning');
          }
        }
      }

      // 2. 胖女巫選項：好奇胖女巫手上的東西 //文本已完成
      else if (option.text.includes('胖女巫') || option.text.includes('水晶球')) {
        const hasTimeMachine = (nextInventory['時光機'] || gameState.inventory['時光機'] || nextInventory['飛行時光機'] || gameState.inventory['飛行時光機'] || 0) > 0;
        const isYongWuActive = Boolean(meta.activeSkills?.includes('ach_yong_wu'));

        if (isYongWuActive && !hasTimeMachine) {
          // ●已啟動【詠物調】且無"時光機"：懂得欣賞，讚賞胖女巫的水晶球，贈送時光機
          nextInventory['時光機'] = (nextInventory['時光機'] || 0) + 1;
          recordItemAcquired('時光機');
          optionResultText = '你身負【詠物調】古韻雅意，讚頌胖女巫手中晶瑩剔透的水晶球。胖女巫聽得心花怒放，欣喜地將失落已久的秘寶【時光機】大方贈予了你！';
          addLog('【女巫賜寶】身負【詠物調】古韻雅意，胖女巫欣喜贈送傳奇秘寶【時光機】！', 'milestone');
        } else if (isYongWuActive && hasTimeMachine) {
          // ●已啟動【詠物調】也有"時光機"：雖然讚賞水晶球，但被懷疑偷走時光機，趕出古堡，AP-2
          const apLoss = 2;
          nextStats.ap = Math.max(0, nextStats.ap - apLoss);
          optionResultText = '胖女巫手握水晶球冷眼睥睨著你！她瞥見你懷中的時光機，驚呼一聲懷疑你偷了古堡秘寶，揮動掃帚將你強行逐出古堡，行動力 -2！';
          addLog('【逐出古堡】胖女巫發現你持有時光機，懷疑你偷竊，將你逐出古堡，行動力-2！', 'warning');
        } else if (!isYongWuActive && hasTimeMachine) {
          // ●未啟動【詠物調】但有"時光機"：不懂得欣賞水晶球，又被懷疑偷走時光機，觸發愛在西元前且AP-2(合併觸發)
          const apLoss = 2;
          nextStats.ap = Math.max(0, nextStats.ap - apLoss);
          effectiveForceNextCardId = 'C2001-01';
          optionResultText = '當你好奇湊近，胖女巫冷眼看著不懂欣賞水晶球的你，更發現你私藏時光機而震怒！她尖聲厲斥將你驅逐！（行動力 -2，並施咒引發時空逆流將你打回西元前！）';
          addLog('【時空魔咒】胖女巫生氣你不懂欣賞水晶球又懷疑你盜取時光機，憤怒施咒將你驅逐（行動力 -2，並施咒引發時空逆流將你打回西元前！）', 'warning');
        } else {
          // ●未啟動【詠物調】且無"時光機"：胖女巫透過水晶球讓玩家觸發愛在西元前
          effectiveForceNextCardId = 'C2001-01';
          optionResultText = '當你好奇湊近，胖女巫手捧水晶球說著：陽光射進教堂的角度，能知道你前世...。忽然！水晶球波光流轉，浮現出美索不達米亞平原……胖女巫施咒引發時空逆流！';
          addLog('【水晶施咒】胖女巫用水晶球占卜得知前世，時空引發逆流，回合將觸發《愛在西元前》！', 'milestone');
        }
      }

      // 3. 威廉二世選項：偷偷進入威廉二世房間
      else if (option.text.includes('威廉二世')) {
        const hasBedtimeStory = (nextInventory['床邊故事'] || gameState.inventory['床邊故事'] || 0) > 0;
        if (hasBedtimeStory) {
          if (nextInventory['床邊故事'] > 1) {
            nextInventory['床邊故事'] -= 1;
          } else {
            delete nextInventory['床邊故事'];
          }
          nextInventory['反方向的鐘'] = (nextInventory['反方向的鐘'] || 0) + 1;
          recordItemAcquired('反方向的鐘');
          nextFlags['got_reversed_clock'] = true;
          optionResultText = '你輕手輕腳潛入威廉二世昏暗的寢殿，藉由手中的【床邊故事】使威廉二世沉沉睡去，悄悄地從他腰間取下了傳奇秘寶【反方向的鐘】！';
          addLog('【古堡秘寶】床邊故事安撫威廉二世，成功獲得【反方向的鐘】！消耗【床邊故事】。', 'milestone');
          specialCardToShowcase = { cardId: 'C2000-10', sourceText: '威廉古堡寢殿盜取' };
        } else {
          const apLoss = 3;
          nextStats.ap = Math.max(0, nextStats.ap - apLoss);
          optionResultText = '你偷偷潛入威廉二世的寢殿，木地板的吱嘎聲頓時驚醒了威廉二世！他雷霆大怒將你強行趕出古堡，狼狽逃竄中消耗，行動力 -3！';
          addLog('【驚動二世】潛入威廉二世寢殿卻驚醒威廉二世被趕出古堡，行動力-3！', 'warning');
        }
      }

      // 4. 豬管家選項：詢問豬管家為什麼要念約翰福音做彌補
      else if (option.text.includes('豬管家')) {
        const hasZongzi = (nextInventory['療傷燒肉粽'] || gameState.inventory['療傷燒肉粽'] || 0) > 0;
        if (hasZongzi) {
          if (nextInventory['療傷燒肉粽'] > 1) {
            nextInventory['療傷燒肉粽'] -= 1;
          } else {
            delete nextInventory['療傷燒肉粽'];
          }
          nextInventory['琴傷'] = (nextInventory['琴傷'] || 0) + 1;
          recordItemAcquired('琴傷');
          optionResultText = '豬管家眼淚汪汪地念著約翰福音做彌補，熱騰騰的【療傷燒肉粽】香氣打動了他受傷的心靈！不禁想起情傷，而把這段往事傾訴給你聽，獲得日記《琴傷》！';
          addLog('【感化管家】熱騰騰的燒肉粽溫暖了豬管家，獲得日記《琴傷》！消耗【療傷燒肉粽】。', 'milestone');
          specialCardToShowcase = { cardId: 'C2011-07', sourceText: '威廉古堡感化豬管家' };
        } else {
          optionResultText = '豬管家滿面愁容，口中福音喃喃念著，沉浸在深沉的哀傷中，並未對你多吐露半句心聲。';
          addLog('【管家的彌補】豬管家滿面愁容念著約翰福音，想辦法為他療傷吧！', 'info');
        }
      }
    }

    // 特殊邏輯：米蘭的小鐵匠 (C2002-09) 機制1：抽卡狀態下的選項判斷
    if (card.id === 'C2002-09') {
      if (option.text.includes('改造武器') || option.text.includes('重鑄武器')) {
        const twinBladesCount = gameState.inventory['雙刀'] || 0;
        const nunchakuCount = gameState.inventory['雙截棍'] || 0;

        if (twinBladesCount >= 1 && nunchakuCount >= 2) {
          setShowWeaponChoiceModal(true);
          return;
        } else if (nunchakuCount >= 2) {
          nextInventory['雙截棍'] = (nextInventory['雙截棍'] || 2) - 2;
          if (nextInventory['雙截棍'] <= 0) delete nextInventory['雙截棍'];
          nextInventory['雙刀'] = (nextInventory['雙刀'] || 0) + 1;
          recordItemAcquired('雙刀');
          optionResultText = '小鐵匠在鍛爐前揮汗如雨，將 2 把【雙截棍】重鑄改造為 1 把鋒芒畢露的【雙刀】！';
          addLog('【重鑄武器】消耗 2 把【雙截棍】，小鐵匠成功為你改造成 1 把【雙刀】！', 'milestone');
          badges.push({ label: '重鑄武器', value: '獲得【雙刀】', color: 'text-amber-300' });
        } else if (twinBladesCount >= 1) {
          nextInventory['雙刀'] = (nextInventory['雙刀'] || 1) - 1;
          if (nextInventory['雙刀'] <= 0) delete nextInventory['雙刀'];
          nextInventory['雙截棍'] = (nextInventory['雙截棍'] || 0) + 2;
          recordItemAcquired('雙截棍');
          optionResultText = '小鐵匠熟練地拆解刃身並接上鎖鏈，將 1 把【雙刀】改造成 2 把手感絕佳的【雙截棍】！';
          addLog('【重鑄武器】消耗 1 把【雙刀】，小鐵匠成功為你改造成 2 把【雙截棍】！', 'milestone');
          badges.push({ label: '重鑄武器', value: '獲得【雙截棍】*2', color: 'text-amber-300' });
        } else {
          optionResultText = '道具不足無法確認！需要持有武器，小鐵匠方可為你進行改造。';
          addLog('【材料不足】身上未持有足夠改造的武器，無法進行改造。', 'warning');
          badges.push({ label: '改造失敗', value: '材料不足', color: 'text-rose-400' });
        }
      } else if (option.text.includes('製作食物')) {
        const sweetCount = gameState.inventory['甜甜的'] || 0;
        const riceCount = gameState.inventory['稻香'] || 0;

        if (sweetCount >= 1 && riceCount >= 1) {
          nextInventory['甜甜的'] = (nextInventory['甜甜的'] || 1) - 1;
          if (nextInventory['甜甜的'] <= 0) delete nextInventory['甜甜的'];
          nextInventory['稻香'] = (nextInventory['稻香'] || 1) - 1;
          if (nextInventory['稻香'] <= 0) delete nextInventory['稻香'];
          nextInventory['麥芽糖'] = (nextInventory['麥芽糖'] || 0) + 1;
          recordItemAcquired('麥芽糖');
          optionResultText = '開心的 被黏手 我滿嘴 都是糖果！以【稻香】+【甜甜的】成功製作出香甜可口的【麥芽糖】！';
          addLog('【食物製作】消耗【甜甜的】與【稻香】，小鐵匠成功為你慢火熬製出【麥芽糖】！', 'milestone');
          badges.push({ label: '食物製作', value: '獲得【麥芽糖】', color: 'text-emerald-400' });
          specialCardToShowcase = { cardId: 'C2005-09', sourceText: '米蘭的小鐵匠慢火熬製' };
        } else {
          const missing: string[] = [];
          if (sweetCount < 1) missing.push('【甜甜的】');
          if (riceCount < 1) missing.push('【稻香】');
          optionResultText = `道具不足無法確認！請備齊材料【原物料】+【調味】，小鐵匠方可為你熬煮。`;
          addLog(`【材料不足】身上未備齊材料，無法製作。`, 'warning');
          badges.push({ label: '製作失敗', value: '材料不足', color: 'text-rose-400' });
        }
      } else if (
        option.text.includes('小鐵匠想要的東西') ||
        option.text.includes('贈送樂器') ||
        option.text.includes('交換樂器') ||
        option.require?.item === '烏克麗麗'
      ) {
        setShowExchangeInstrumentModal(true);
        return;
      } else if (
        option.text.includes('有用不到的東西') ||
        option.text.includes('改造鐘錶') ||
        option.text.includes('改造大鐘') ||
        option.text.includes('大笨鐘') ||
        option.text.includes('反方向的鐘') ||
        option.require?.item === '反方向的鐘'
      ) {
        setShowUpgradeClockModal(true);
        return;
      } else if (
        option.text.includes('重鑄鐵鏟') ||
        option.text.includes('改造鐵鏟') ||
        option.text.includes('鐵鏟')
      ) {
        setShowUpgradeShovelModal(true);
        return;
      } else if (
        option.text.includes('強化時光機') ||
        option.text.includes('飛行時光機') ||
        (option.require?.items && option.require.items.includes('愛的飛行日記'))
      ) {
        setShowUpgradeTimeMachineModal(true);
        return;
      } else if (option.text.includes('擴充鐵盒')) {
        setShowExpandIronBoxModal(true);
        return;
      } else if (
        option.text.includes('指引小鐵匠') ||
        option.require?.item === '鄉間的路'
      ) {
        setShowGuideBlacksmithModal(true);
        return;
      }
    }

    // 特殊邏輯：說走就走 (C2016-02) 觸發
    if (card.id === 'C2016-02') {
      const hasBlacksmithShop = Boolean(gameState.blacksmithUnlocked || gameState.flags['blacksmith_unlocked']);
      if (hasBlacksmithShop) {
        // 累積制（經歷滿 5 個探索回合後離開，同梯田累積機制，防範時空回溯與跳躍誤判）
        nextFlags['blacksmith_leave_countdown'] = 5;
        nextFlags['blacksmith_leave_elapsed'] = 0;
        delete nextFlags['blacksmith_leave_round'];
        optionResultText = '小鐵匠心生嚮往，預計於經歷 5 個探索回合後收拾工具啟程離開村莊！';
        addLog(
          '【說走就走】小鐵匠聽到了遠方的呼喚，心生嚮往……預計於經歷 5 個探索回合後收拾工具啟程離開村莊！（若在 5 回合內將【說走就走】投入煙火焚毀，小鐵匠將打消去意）',
          'warning'
        );
      } else {
        // 確認機制：村莊尚無小鐵鋪時抽到，小鐵匠未開鋪定居，不受影響
        delete nextFlags['blacksmith_leave_countdown'];
        delete nextFlags['blacksmith_leave_elapsed'];
        delete nextFlags['blacksmith_leave_round'];
        optionResultText = '背起行囊，瀟灑前行！（目前村莊未開立小鐵鋪，小鐵匠不受影響）';
        addLog(
          '【說走就走】這就是年輕，該瀟灑一次的決定！背起行囊，享受遼闊的自由。（目前村莊也沒有人想走）',
          'action'
        );
      }
    }

    // 特殊邏輯：外婆 (C2004-04) 複合式選項處理
    if (card.id === 'C2004-04') {
      // 確保外婆不存於行囊、不開啟圖鑑
      delete nextInventory['外婆'];
      delete nextInventory['C2004-04'];

      if (option.text.includes('和外公的往事靜靜回憶')) {
        const hasTeaLeaves = (nextInventory['茶葉'] || 0) > 0;
        const hasHotWater = (nextInventory['熱水'] || 0) > 0;
        if (hasTeaLeaves && hasHotWater) {
          // 消耗茶葉與熱水
          nextInventory['茶葉'] -= 1;
          if (nextInventory['茶葉'] <= 0) delete nextInventory['茶葉'];
          nextInventory['熱水'] -= 1;
          if (nextInventory['熱水'] <= 0) delete nextInventory['熱水'];

          // 獲得《爺爺泡的茶》卡牌並恢復 5 點行動力
          nextInventory['爺爺泡的茶'] = (nextInventory['爺爺泡的茶'] || 0) + 1;
          recordItemAcquired('爺爺泡的茶');
          newlyAcquiredItemsThisRound.push('爺爺泡的茶');
          nextStats.ap = Math.max(0, nextStats.ap + 5);

          // 解鎖圖鑑
          setMeta((prev) => {
            if (prev.unlockedCardIds.includes('C2002-07')) return prev;
            return {
              ...prev,
              unlockedCardIds: [...prev.unlockedCardIds, 'C2002-07'],
            };
          });

          specialCardToShowcase = {
            cardId: 'C2002-07',
            sourceText: '外婆悉心沏泡回憶中的茶香  ',
            badgeTitle: '✦ 經典茗香・親情傳承 ✦',
          };

          optionResultText = '外婆眼神中透著溫柔，懷念的心情與熟悉的茶香，慢火沏泡出珍貴的《爺爺泡的茶》！行動力恢復 +5！';
          addLog('🍵【爺爺泡的茶】外婆取過你帶來的茶葉與熱水，為你沏出一壺醇厚甘甜的茶！獲得卡牌《爺爺泡的茶》，行動力恢復 +5！', 'milestone');
          badges.push({ label: '消耗材料', value: '【茶葉】×1、【熱水】×1', color: 'text-stone-400' });
          badges.push({ label: '親情滋養', value: '+5 行動力', color: 'text-emerald-400' });
          badges.push({ label: '獲得卡牌', value: '《爺爺泡的茶》', color: 'text-amber-300' });
        } else {
          nextStats.ap = Math.max(0, nextStats.ap + 1);
          optionResultText = '你與外婆坐在藤椅上，靜靜回憶著外公過去的點點滴滴，心中感到絲絲溫暖與懷念，行動力 +1。';
          addLog('👵【靜靜回憶】你與外婆一同回憶外公的往事，心中倍感溫暖，行動力 +1。', 'action');
          badges.push({ label: '親情溫暖', value: '+1 行動力', color: 'text-amber-300' });
        }
      } else if (option.text.includes('外婆失落而失落')) {
        // 判定行囊是否空無一物
        const totalItems = Object.keys(nextInventory).reduce(
          (sum, k) => sum + (nextInventory[k] || 0),
          0
        );
        if (totalItems === 0) {
          nextStats.coins = (nextStats.coins || 0) + 10;
          optionResultText = '外婆看你兩手空空、行囊空無一物，心疼地掏出零錢塞到你手裡，獲得 10 枚金幣！';
          addLog('👵💰【外婆的心疼】外婆見你行囊空無一物，心疼地塞了 10 枚金幣給你！', 'milestone');
          badges.push({ label: '外婆心疼', value: '+10 枚金幣', color: 'text-amber-300' });
        } else {
          optionResultText = '「我告訴外婆 我沒輸 不需要改變」，外婆輕撫你的肩膀，彷彿一切壞事也沒有發生。';
          addLog('👵【外婆的安慰】外婆慈愛地看著你，相伴無言，任何壞事都沒有發生。', 'action');
          badges.push({ label: '陪伴外婆', value: '相伴無言', color: 'text-stone-400' });
        }
      } else if (option.text.includes('而不是六百塊')) {
        badges.push({ label: '外婆好料', value: '+5 行動力', color: 'text-emerald-400' });
      } else if (option.text.includes('她以我為榮')) {
        badges.push({ label: '外婆笑容', value: '+3 行動力', color: 'text-amber-300' });
      }
    }

    addLog(`做出選擇：${option.text}。${optionResultText}`, 'action');

    // Apply effects
    if (eff) {
      if (eff.addItem) {
        if (eff.addItem === '公主病') {
          // 公主病上限為 1
          nextInventory['公主病'] = 1;
        } else {
          nextInventory[eff.addItem] = (nextInventory[eff.addItem] || 0) + 1;
        }
        recordItemAcquired(eff.addItem);
        // 若獲得的物品為專屬特殊機制卡牌，或是從園遊會購買獲得的卡牌（例如園遊會購買烏克麗麗），且非當前翻開的卡牌，自動觸發新卡亮相全貌視窗
        const isCarnivalPurchase = card.id === 'C2004-09';
        const awardedSpecialCard = CARD_DATABASE.find(
          (c) =>
            c.name === eff.addItem &&
            c.id !== card.id &&
            (c.isSynthesizedOnly || (isCarnivalPurchase && eff.addItem === '烏克麗麗'))
        );
        if (awardedSpecialCard) {
          specialCardToShowcase = {
            cardId: awardedSpecialCard.id,
            sourceText:
              isCarnivalPurchase && eff.addItem === '烏克麗麗'
                ? '園遊會樂器攤位購買'
                : awardedSpecialCard.acquisitionSource || `《${card.name}》選擇獲得`,
            badgeTitle:
              isCarnivalPurchase && eff.addItem === '烏克麗麗'
                ? '✦ 園遊會奇遇 ✦'
                : awardedSpecialCard.badgeTitle,
          };
        }
        // Diary unlock check
        if (card.type === '日記' && !meta.unlockedDiaries.includes(eff.addItem)) {
          setMeta((prev) => ({
            ...prev,
            unlockedDiaries: [...prev.unlockedDiaries, eff.addItem!],
          }));
        }
      }

      if (eff.removeItem && nextInventory[eff.removeItem]) {
        const isNinjaHeroExempt =
          card.id === 'C2001-04' &&
          eff.removeItem === '雙截棍' &&
          gameState.character?.name === '英雄';

        if (!isNinjaHeroExempt) {
          const removedName = eff.removeItem;
          nextInventory[removedName] = Math.max(0, nextInventory[removedName] - 1);
          if (nextInventory[removedName] === 0) delete nextInventory[removedName];
          const quota = restoreCardQuotaOnItemLost(removedName, nextDrawnCount, nextPeninsulaCounts, 1);
          Object.assign(nextDrawnCount, quota.nextDrawnCount);
          Object.assign(nextPeninsulaCounts, quota.nextPeninsulaCounts);
        }
      }

      if (eff.removeItems) {
        eff.removeItems.forEach((item) => {
          if (nextInventory[item]) {
            nextInventory[item] = Math.max(0, nextInventory[item] - 1);
            if (nextInventory[item] === 0) delete nextInventory[item];
            const quota = restoreCardQuotaOnItemLost(item, nextDrawnCount, nextPeninsulaCounts, 1);
            Object.assign(nextDrawnCount, quota.nextDrawnCount);
            Object.assign(nextPeninsulaCounts, quota.nextPeninsulaCounts);
          }
        });
      }

      if (eff.removeRandomItem) {
        const itemKeys = Object.keys(nextInventory).filter((k) => nextInventory[k] > 0);
        if (itemKeys.length > 0) {
          const randomKey = itemKeys[Math.floor(Math.random() * itemKeys.length)];
          nextInventory[randomKey] = Math.max(0, nextInventory[randomKey] - 1);
          if (nextInventory[randomKey] === 0) delete nextInventory[randomKey];
          const quota = restoreCardQuotaOnItemLost(randomKey, nextDrawnCount, nextPeninsulaCounts, 1);
          Object.assign(nextDrawnCount, quota.nextDrawnCount);
          Object.assign(nextPeninsulaCounts, quota.nextPeninsulaCounts);
          addLog(`【行囊受損】老斑鳩趁亂偷走了【${randomKey}】！`, 'warning');
        } else {
          addLog('【行囊空空】老斑鳩撲騰翻找，見行囊空無一物，悻悻然飛走了。', 'action');
        }
      }

      if (eff.setFlag) {
        Object.assign(nextFlags, eff.setFlag);
      }

      // 特殊環境變化邏輯 1：忍者 (C2001-04) 追逐狀態
      if (card.id === 'C2001-04') {
        const isHero = gameState.character?.name === '英雄';
        const isNinjaDefeated =
          eff?.setFlag?.defeat_忍者 === true ||
          eff?.setFlag?.defeated_ninja === true ||
          eff?.addItem === '忍者' ||
          (isHero && gameState.flags['ninja_confrontation'] && option.text.includes('赤手空拳'));

        const isNinjaEscaped =
          !isNinjaDefeated &&
          (eff?.setFlag?.ninja_confrontation === false ||
            option.text.includes('遁術') ||
            option.text.includes('逃離') ||
            option.text.includes('未持有'));

        if (isNinjaDefeated) {
          nextNinjaChasing = false;
          nextNinjaNextEncounterRound = null;
          nextNinjaRound = undefined;
          nextFlags['ninja_chasing'] = false;
          nextFlags['ninja_confrontation'] = false;
          if (isHero) {
            addLog('【英雄身手】赤手空拳成功制伏忍者！解除【追逐忍者】狀態，獲得【忍者】卡牌！', 'milestone');
          } else {
            addLog('【降伏忍者】快使用雙截棍！成功制伏忍者並解除【追逐忍者】環境狀態，獲得【忍者】卡牌！', 'milestone');
          }
          nextInventory['忍者'] = (nextInventory['忍者'] || 0) + 1;
          recordItemAcquired('忍者');
          nextFlags['defeat_忍者'] = true;
          nextFlags['defeated_ninja'] = true;
          // 擊敗忍者後，存於行囊且正式記錄於圖鑑
          setMeta((prev) => {
            if (prev.unlockedCardIds.includes('C2001-04')) return prev;
            return {
              ...prev,
              unlockedCardIds: [...prev.unlockedCardIds, 'C2001-04'],
            };
          });
        } else if (isNinjaEscaped) {
          // 如果無法擊敗，忍者逃離(抽卡記錄重置)，下次再抽到忍者重新追逐一次
          nextNinjaChasing = false;
          nextNinjaNextEncounterRound = null;
          nextNinjaRound = undefined;
          nextFlags['ninja_chasing'] = false;
          nextFlags['ninja_confrontation'] = false;
          nextDrawnCount['C2001-04'] = 0; // 重置抽卡記錄，允許未來重新抽到
          addLog('【忍者逃離】缺少雙截棍制伏，忍者施展遁術逃離！下次抽到將重新展開追逐。', 'warning');
        } else {
          // 第一次抽到此卡，進入追逐忍者狀態（忍者起始回合為玩家下一回合 + 1，即領先玩家 1 回合在前方狂奔）
          nextNinjaChasing = true;
          const initialNinjaR = Math.min(30, gameState.round + 2);
          nextNinjaNextEncounterRound = initialNinjaR;
          nextNinjaRound = initialNinjaR;
          nextFlags['ninja_chasing'] = true;
          nextFlags['ninja_round'] = initialNinjaR;
          nextFlags['ninja_confrontation'] = false;
          addLog(`【追逐忍者】進入【追逐忍者】環境狀態！忍者在屋脊瓦頂狂奔，目前已前進至第 ${initialNinjaR} 回合，請盡快追上他！`, 'combat');
        }
      }

      // 特殊環境變化邏輯 2：錯過的煙火 (C2022-08) 煙火燃燒狀態
      if (card.id === 'C2022-08') {
        nextFireworksBurning = true;
        nextFlags['fireworks_burning'] = true;
        nextFlags['fireworks_burn_ticks'] = 0;
        addLog('【煙火燃燒】「煙火飄散在你四週，每回合燃燒著你……」進入【煙火燃燒】環境狀態！', 'warning');
      }

      // 特殊環境變化邏輯 3：煙花易冷 (C2010-03) 或任何解除效果 滅火（煙火燃燒解除後，行囊中的錯過的煙火消失，上限恢復）
      if (card.id === 'C2010-03' && (eff?.setFlag?.fireworks_burning === false || option.text.includes('冷雨') || option.text.includes('解除'))) {
        nextFireworksBurning = false;
        nextFlags['fireworks_burning'] = false;
        nextFlags['fireworks_burn_ticks'] = 0;
        delete nextInventory['錯過的煙火'];
        nextDrawnCount['C2022-08'] = 0;
        addLog('【冷雨滅火】「煙花易冷雨紛紛，行囊遇火不再焚。」洛陽舊城的冷雨驟然傾瀉，冰涼甘霖澆滅了四周花火，成功解除【煙火燃燒】環境狀態！', 'milestone');
      } else if (eff?.setFlag?.fireworks_burning === false) {
        nextFireworksBurning = false;
        nextFlags['fireworks_burning'] = false;
        nextFlags['fireworks_burn_ticks'] = 0;
        delete nextInventory['錯過的煙火'];
        nextDrawnCount['C2022-08'] = 0;
      }

      // 特殊環境變化邏輯 4：公公偏頭痛 (C2012-03)
      if (card.id === 'C2012-03') {
        nextHeadacheActive = true;
        nextFlags['headache_active'] = true;
        // 修正：公公偏頭痛此卡不存於行囊，但記錄於圖鑑
        delete nextInventory['公公偏頭痛'];
        setMeta((prev) => {
          if (prev.unlockedCardIds.includes('C2012-03')) return prev;
          return {
            ...prev,
            unlockedCardIds: [...prev.unlockedCardIds, 'C2012-03'],
          };
        });
        addLog('【偏頭痛】被小男孩糾纏得難以招架，進入【偏頭痛】環境狀態！每回合行動力額外消耗 -2。', 'warning');
      }

      // 特殊環境變化邏輯 5：本草綱目 (C2006-04) 獲得時若處於偏頭痛狀態，一併解除
      if (card.id === 'C2006-04' && (nextHeadacheActive || nextFlags['headache_active'])) {
        nextHeadacheActive = false;
        nextFlags['headache_active'] = false;
        addLog('🌿【藥到病除】獲得《本草綱目》，依循書中所載草本藥理，【偏頭痛】狀態隨之痊癒解除！', 'milestone');
      }

      // 特殊環境變化邏輯 6：那天下雨了 (C2026-03)
      if (card.id === 'C2026-03') {
        nextRainyWeatherActive = true;
        nextFlags['rainy_weather_active'] = true;
        nextFlags['rainy_rounds_count'] = 0;
        nextFlags['rain_completed_rounds'] = 0;
        nextFlags['pending_heard_rain_trigger'] = false;
        delete nextInventory['那天下雨了'];
        setMeta((prev) => {
          if (prev.unlockedCardIds.includes('C2026-03')) return prev;
          return {
            ...prev,
            unlockedCardIds: [...prev.unlockedCardIds, 'C2026-03'],
          };
        });
        addLog('🌧️【那天下雨了】天降甘霖，滂沱大雨洗滌大地，進入【下雨天】環境狀態！', 'warning');
      }

      // 特殊環境變化邏輯 7：晴天 (C2003-03) 抽到放晴解除下雨天
      if (card.id === 'C2003-03' && (nextRainyWeatherActive || nextFlags['rainy_weather_active'])) {
        nextRainyWeatherActive = false;
        nextFlags['rainy_weather_active'] = false;
        nextFlags['rainy_rounds_count'] = 0;
        nextFlags['rain_completed_rounds'] = 0;
        nextFlags['pending_heard_rain_trigger'] = false;
        addLog('☀️【雨後天晴】「等到放晴的那天 也許我會比較好一點」陽光穿透烏雲，大雨驟停，成功解除【下雨天】狀態！', 'milestone');
      }

      // 下雨天環境經歷回合累積：當處於下雨天環境下實際經歷並完成冒險回合時累積（抽到那天下雨了當回合不計）
      const isCurrentlyRainy = Boolean(gameState.rainyWeatherActive || gameState.flags['rainy_weather_active']);
      if (isCurrentlyRainy && nextRainyWeatherActive && card.id !== 'C2026-03') {
        const completedRounds = (Number(nextFlags['rain_completed_rounds']) || 0) + 1;
        nextFlags['rain_completed_rounds'] = completedRounds;
        nextFlags['rainy_rounds_count'] = completedRounds;

        // 累計全局經歷下雨天回合數（用於晝夜雨夜深沉度計量，換晴不重置）
        const experiencedTotal = (Number(nextFlags['rain_experienced_total_rounds']) || 0) + 1;
        nextFlags['rain_experienced_total_rounds'] = experiencedTotal;

        const alreadyHasHeardRain = Boolean(
          (nextInventory && nextInventory['聽見下雨的聲音']) ||
          (nextDrawnCount && (nextDrawnCount['C2014-12'] || 0) > 0) ||
          nextFlags['heard_rain_triggered']
        );

        if (completedRounds >= 5 && !alreadyHasHeardRain) {
          nextFlags['pending_heard_rain_trigger'] = true;
        }
      }

      // 龍戰騎士 C2008-01 遭遇結束後，清除化身為龍狀態
      if (card.id === 'C2008-01') {
        nextFlags['dragon_awakened'] = false;
      }

      // 確保 nextItemOrder 僅保留目前仍存在行囊中的物品
      nextItemOrder = nextItemOrder.filter((k) => (nextInventory[k] || 0) > 0);

      if (eff.setMetaFlag) {
        setMeta((prev) => ({
          ...prev,
          nextGameFlags: { ...prev.nextGameFlags, ...eff.setMetaFlag },
        }));
      }

      if (eff.apChange) {
        nextStats.ap = Math.max(0, nextStats.ap + eff.apChange);
      }

      if (eff.coinChange) {
        nextStats.coins = Math.max(0, (nextStats.coins || 0) + eff.coinChange);
      }

      if (eff.setFlag?.['gold_town_unlocked']) {
        nextGoldTownUnlocked = true;
      }

      if (eff.changeCharacter) {
        const newChar = ALL_CHARACTERS.find((c) => c.id === eff.changeCharacter);
        if (newChar) {
          nextCharacter = newChar;
          addLog(`命運洗禮！你的化身轉化為【${newChar.name}】！`, 'milestone');
        }
      }

      if (eff.triggerVictory) {
        nextVictory = eff.triggerVictory;
      }

      if (eff.triggerDefeat) {
        nextDefeat = eff.triggerDefeat;
      }

      // Time Travel Rewind & Advance logic
      if (eff.rewindRound !== undefined) {
        nextRound = eff.rewindRound;
        if (eff.clearItems) {
          // 愛在西元前：只保留角色身份重新回到第 1 回合（道具與當局成就蒐集清除）
          Object.keys(nextInventory).forEach((k) => {
            delete nextInventory[k];
          });
          // 愛在西元前清除所有物品，所有物品卡牌抽取上限額度全數恢復
          Object.keys(nextPeninsulaCounts).forEach((id) => delete nextPeninsulaCounts[id]);
          CARD_DATABASE.forEach((c) => {
            if (getCardItemNames(c).length > 0) {
              delete nextDrawnCount[c.id];
            }
          });
          if (eff.clearProgress) {
            Object.keys(nextFlags).forEach((k) => {
              delete nextFlags[k];
            });
          }
          addLog('【愛在西元前・時光逆流】時空狂瀾撕扯！只保留角色身份重新回到第 1 回合，道具與當局成就蒐集在泥板歲月中悉數清除！', 'warning');
        } else {
          // 回到過去：重新回到第 1 回合（保留目前全身狀態）
          addLog('【回到過去・時空逆流】想回到過去，試著讓故事繼續！你保留了目前全部全身狀態與行囊道具，重新回到第 1 回合！', 'milestone');
        }
      }

      if (eff.advanceRound !== undefined) {
        nextRound = nextRound + eff.advanceRound;
        addLog(`【時空流轉】受到卡牌效果影響，時光流速加快，回合推進了 ${eff.advanceRound} 回合！`, 'action');
      }

      if (eff.advanceGame !== undefined) {
        setGameState((prev) => ({ ...prev, gameNumber: prev.gameNumber + eff.advanceGame! }));
        addLog(`【命運輪迴】受到卡牌效果干預，當前局數推進了 ${eff.advanceGame} 局！`, 'milestone');
      }

      // Special logic for 亂舞春秋 (C2004-07)
      if (card.id === 'C2004-07') {
        nextFlags['chaos_era_obtained'] = true;
        nextFlags['chaos_era_active'] = true;
        nextFlags['chaos_era_start_round'] = nextRound;
        nextFlags['chaos_era_guaranteed_battle_round'] = nextRound + Math.floor(Math.random() * 3);
        addLog('【亂舞春秋】時空裂痕驟開！烽火席捲而來，當前局全面進入【亂舞春秋時代】！', 'milestone');
      }

      // Check Core Route 2: 《最偉大的作品》 Victory (4 SS albums collected: 《杰倫》, 《范特西》, 《葉惠美》, 《跨時代》)
      if (
        nextInventory['《杰倫》'] &&
        nextInventory['《范特西》'] &&
        nextInventory['《葉惠美》'] &&
        nextInventory['《跨時代》']
      ) {
        nextVictory = '最偉大的作品';
        addLog('【登峰造極】四大神卡《杰倫》《范特西》《葉惠美》《跨時代》齊聚！達成《最偉大的作品》傳奇結局！', 'milestone');
      }

      // Check Core Route 3: 《周杰倫家庭》 Victory
      // 依據原始設定稿：父(以父之名)、母(《葉惠美》)、外婆(外婆)、爺爺(爺爺泡的茶)、大女兒(前世情人)、兒子(粉色海洋)、小女兒(女兒殿下)、老婆(娘子)，最終取得《I Do》完成通關！
      const hasFather = Boolean(nextInventory['以父之名']);
      const hasMother = Boolean(nextInventory['《葉惠美》'] || nextInventory['葉惠美']);
      const hasGrandma = Boolean(nextInventory['外婆']);
      const hasGrandpa = Boolean(nextInventory['爺爺泡的茶']);
      const hasEldestDaughter = Boolean(nextInventory['前世情人']);
      const hasSon = Boolean(nextInventory['粉色海洋']);
      const hasYoungestDaughter = nextCharacter?.name === '女兒殿下' || Boolean(nextInventory['女兒殿下']);
      const hasWife = Boolean(nextInventory['娘子']);
      const hasIDo = Boolean(nextInventory['I Do']);

      if (
        hasFather &&
        hasMother &&
        hasGrandma &&
        hasGrandpa &&
        hasEldestDaughter &&
        hasSon &&
        hasYoungestDaughter &&
        hasWife &&
        hasIDo
      ) {
        nextVictory = '周杰倫家庭';
        addLog('【家庭圓滿・永恆誓約】父、母、外婆、爺爺、大女兒、兒子、小女兒、娘子全員團聚，在《I Do》神聖誓約下達成《周杰倫家庭》終極傳奇結局！', 'milestone');
      }

      // 陽光宅男天賦：必須已獲得【免費教學錄影帶】啟用天賦，且持有/抽到【公主病】後，奇蹟進化為【女兒殿下】
      if (nextCharacter?.name === '陽光宅男' && nextInventory['免費教學錄影帶'] && nextInventory['公主病']) {
        const daughterChar = ALL_CHARACTERS.find((c) => c.id === 'char_daughter');
        if (daughterChar) {
          nextCharacter = daughterChar;
          addLog('【血脈覺醒】陽光宅男啟動天賦真情覺醒，奇蹟進化為神級化身【女兒殿下】！', 'milestone');
          setMeta((prev) => {
            const list = prev.unlockedCharacterIds || [];
            const cards = prev.unlockedCardIds || [];
            const nextList = list.includes('char_daughter') ? list : [...list, 'char_daughter'];
            const nextCards = cards.includes('C2026-10') ? cards : [...cards, 'C2026-10'];
            return {
              ...prev,
              unlockedCharacterIds: nextList,
              unlockedCardIds: nextCards,
            };
          });
        }
      }

      checkAchievements(nextInventory);

      // If victory condition reached, trigger victory immediately (even at round 30 or AP exhaustion)
      if (nextVictory) {
        const victoryRoute = nextVictory;
        const totalRoundsNow = (meta.totalRoundsPlayed || 0) + gameState.round;
        const record: RouteVictoryRecord = {
          route: victoryRoute,
          gameNumber: gameState.gameNumber,
          round: Math.min(30, gameState.round),
          totalRounds: totalRoundsNow,
          timestamp: new Date().toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' }),
          characterName: nextCharacter?.name || '未知',
        };

        setGameState((prev) => ({
          ...prev,
          inventory: nextInventory,
          itemAcquisitionOrder: nextItemOrder,
          flags: nextFlags,
          character: nextCharacter,
          stats: nextStats,
          victoryType: victoryRoute,
          phase: 'GAME_OVER',
        }));
        setMeta((prev) => ({
          ...prev,
          victories: Array.from(new Set([...prev.victories, victoryRoute])),
          routeVictoryRecords: {
            ...(prev.routeVictoryRecords || {}),
            [victoryRoute]: prev.routeVictoryRecords?.[victoryRoute] || record,
          },
        }));
        return;
      }

      if (nextDefeat) {
        setGameState((prev) => ({
          ...prev,
          inventory: nextInventory,
          itemAcquisitionOrder: nextItemOrder,
          flags: nextFlags,
          character: nextCharacter,
          stats: nextStats,
          defeatReason: nextDefeat,
          phase: 'GAME_OVER',
        }));
        return;
      }
    }

    // Action consumes AP: normally 1 AP, but with 偏頭痛 (headache) consumes 2 AP
    const isHeadacheOnAction = Boolean(gameState.headacheActive || gameState.flags['headache_active']);
    const actionApCost = isHeadacheOnAction ? 2 : 1;
    nextStats.ap = Math.max(0, nextStats.ap - actionApCost);
    if (isHeadacheOnAction) {
      addLog(`🤕【偏頭痛】受偏頭痛折磨，本回合抽卡行動力消耗 -2！（剩餘行動力：${nextStats.ap}）`, 'warning');
    }

      // Construct outcome modal badges
      if (card.id === 'C2001-08') {
        if (option.text.includes('凱薩琳') || option.text.includes('問好') || option.text.includes('問安')) {
          if (gameState.character?.name === '陽光宅男') {
            badges.push({ label: '化身退化', value: '【愛情廢柴】', color: 'text-red-400' });
          } else {
            const hadPrincessSickness = (gameState.inventory['公主病'] || 0) > 0;
            if (hadPrincessSickness) {
              badges.push({ label: '破除詛咒', value: '【公主病】消散', color: 'text-stone-400' });
              badges.push({ label: '化身轉化', value: '【陽光宅男】', color: 'text-amber-300' });
            } else {
              badges.push({ label: '恐怖目擊', value: '-3 行動力', color: 'text-red-400' });
            }
          }
        } else if (option.text.includes('胖女巫') || option.text.includes('水晶球')) {
          const hasTimeMachine = ((gameState.inventory['時光機'] || 0) + (gameState.inventory['飛行時光機'] || 0)) > 0;
          const isYongWuActive = Boolean(meta.activeSkills?.includes('ach_yong_wu'));
          if (isYongWuActive && !hasTimeMachine) {
            badges.push({ label: '詠物調賜寶', value: '【時光機】', color: 'text-amber-300' });
          } else if (isYongWuActive && hasTimeMachine) {
            badges.push({ label: '逐出古堡', value: '-2 行動力', color: 'text-red-400' });
          } else if (!isYongWuActive && hasTimeMachine) {
            badges.push({ label: '偷竊震怒', value: '-2 行動力', color: 'text-red-400' });
            badges.push({ label: '占卜前世', value: '觸發《愛在西元前》', color: 'text-cyan-300' });
          } else {
            badges.push({ label: '占卜前世', value: '觸發《愛在西元前》', color: 'text-cyan-300' });
          }
        } else if (option.text.includes('威廉二世')) {
          const hasBedtimeStory = (gameState.inventory['床邊故事'] || 0) > 0;
          if (hasBedtimeStory) {
            badges.push({ label: '消耗物品', value: '【床邊故事】', color: 'text-stone-400' });
            badges.push({ label: '古堡秘寶', value: '【反方向的鐘】', color: 'text-amber-300' });
          } else {
            badges.push({ label: '驚動二世', value: '-3 行動力', color: 'text-red-400' });
          }
        } else if (option.text.includes('豬管家')) {
          const hasZongzi = (gameState.inventory['療傷燒肉粽'] || 0) > 0;
          if (hasZongzi) {
            badges.push({ label: '消耗物品', value: '【療傷燒肉粽】', color: 'text-stone-400' });
            badges.push({ label: '感化管家', value: '【琴傷】', color: 'text-amber-300' });
          } else {
            badges.push({ label: '念約翰福音', value: '為往事彌補', color: 'text-stone-400' });
          }
        }
      } else {
        if (card.id === 'C2002-01') {
          if (orcDefeated) {
            badges.push({ label: '擊敗強敵', value: '嗜血半獸人倒地', color: 'text-emerald-400' });
            badges.push({ label: '獲得物品', value: '【半獸人】', color: 'text-amber-300' });
            if (orcWeaponUsed) {
              badges.push({
                label: '消耗物品',
                value: orcWeaponUsed === '雙刀' ? '【雙刀】1把' : '【雙截棍】2支',
                color: 'text-stone-400',
              });
            } else {
              badges.push({ label: '英雄天賦', value: '赤手空拳突圍', color: 'text-amber-300' });
            }
          } else {
            badges.push({ label: '攻擊未果', value: '武器不足', color: 'text-red-400' });
            if (orcBlockedBySweater) {
              badges.push({ label: '毛衣抵禦', value: '免受5點傷害', color: 'text-amber-300' });
              badges.push({ label: '消耗物品', value: '【黑色毛衣】1件', color: 'text-stone-400' });
            } else {
              badges.push({ label: '受到重創', value: '-5 行動力', color: 'text-red-400' });
            }
          }
        }
        if (eff?.addItem) {
          badges.push({ label: '獲得物品', value: `【${eff.addItem}】`, color: 'text-amber-300' });
        }
        if (eff?.removeItem) {
          const isNinjaHeroExempt =
            card.id === 'C2001-04' &&
            eff.removeItem === '雙截棍' &&
            gameState.character?.name === '英雄';
          if (!isNinjaHeroExempt) {
            badges.push({ label: '消耗物品', value: `【${eff.removeItem}】`, color: 'text-stone-400' });
          } else {
            badges.push({ label: '英雄身手', value: '赤手空拳突圍', color: 'text-amber-300' });
          }
        }
        if (eff?.removeItems && eff.removeItems.length > 0) {
          badges.push({
            label: '消耗物品',
            value: eff.removeItems.map((i) => `【${i}】`).join('、'),
            color: 'text-stone-400',
          });
        }
        if (eff?.apChange) {
          badges.push({
            label: '行動力變動',
            value: `${eff.apChange > 0 ? '+' : ''}${eff.apChange} 行動力`,
            color: eff.apChange > 0 ? 'text-emerald-400' : 'text-red-400',
          });
        }
        if (eff?.coinChange) {
          badges.push({
            label: '金幣變動',
            value: `${eff.coinChange > 0 ? '+' : ''}${eff.coinChange} 金幣`,
            color: eff.coinChange > 0 ? 'text-yellow-400' : 'text-amber-400',
          });
        }
        if (isHeadacheOnAction) {
          badges.push({
            label: '偏頭痛消耗',
            value: '本回合抽卡行動力共扣 2 點',
            color: 'text-amber-400',
          });
        }
        if (eff?.setFlag?.['gold_town_unlocked']) {
          badges.push({ label: '環境解鎖', value: '淘金小鎮常駐', color: 'text-yellow-400' });
        }
        if (eff?.rewindRound !== undefined) {
          badges.push({ label: '時空逆轉', value: '重返第 1 回合', color: 'text-cyan-300' });
        }
        if (nextCharacter && nextCharacter.name !== gameState.character?.name) {
          badges.push({ label: '化身覺醒', value: `【${nextCharacter.name}】`, color: 'text-yellow-300' });
        }
      }

      // 【第30回合邊界條件機制】：
      // 假設 R30 抽到 A 卡跳接 B 卡（例如《跨時代》跳接《威廉古堡》）
      // 允許先跳接完成，讓玩家可以在連動卡牌中做最後一次抉擇
      if (gameState.round >= 30 && effectiveForceNextCardId && !gameState.flags['_r30_chained_once']) {
        const nextCard = CARD_DATABASE.find((c) => c.id === effectiveForceNextCardId);
        if (nextCard) {
          setPendingEventTransition({
            sourceCardName: card.name,
            targetCard: nextCard,
            nextRound: 30,
            effectNarrative:
              optionResultText ||
              option.resultText ||
              `※ 第 30 回合宿命延伸！宿命牽引你由【${card.name}】直接連動邁入【${nextCard.name}】！`,
            nextInventory,
            nextItemOrder,
            nextFlags: { ...nextFlags, _r30_chained_once: true },
            nextStats,
            nextCharacter,
          });
          return;
        }
      }

      // 行動力耗盡判定（包含在 R30 跳接後卡牌抉擇、或一般卡牌行動力歸 0 時）
      if (nextStats.ap <= 0) {
        nextStats.ap = 0;
        // 行動力耗盡，本局冒險強制結束，清除當前所有暫態環境狀態
        nextHeadacheActive = false;
        nextFlags['headache_active'] = false;
        nextFireworksBurning = false;
        nextFlags['fireworks_burning'] = false;
        nextNinjaChasing = false;
        nextFlags['ninja_chasing'] = false;
        nextRainyWeatherActive = false;
        nextFlags['rainy_weather_active'] = false;

        // 系統保留此選項的物品、狀態、成就與化身，以利後續繼承判定（如鐵盒存放）
        setGameState((prev) => ({
          ...prev,
          inventory: nextInventory,
          itemAcquisitionOrder: nextItemOrder,
          flags: nextFlags,
          character: nextCharacter,
          stats: nextStats,
          headacheActive: false,
          fireworksBurning: false,
          ninjaChasing: false,
          rainyWeatherActive: false,
        }));
        addLog('【行動力竭】行動力歸 0，身體已達極限，本局冒險結束！', 'warning');

        let narrativeDesc = '';
        if (eff?.rewindRound !== undefined) {
          narrativeDesc = `雖然必須時空逆轉重返第 1 回合，但因行動力已耗盡，本局冒險在此結束。`;
        } else if (effectiveForceNextCardId) {
          const targetNext = CARD_DATABASE.find((c) => c.id === effectiveForceNextCardId);
          narrativeDesc = `雖然觸發連動前往【${targetNext?.name || '下一卡牌'}】，但因行動力已耗盡，本局冒險在此結束。`;
        } else if (optionResultText || option.resultText) {
          narrativeDesc = `雖然${optionResultText || option.resultText}，但因行動力已耗盡，本局冒險在此結束。`;
        } else {
          narrativeDesc = `雖然做出了抉擇，但因行動力耗盡，本局冒險結束。`;
        }

        setOutcomeModal({
          title: '✦ 宿命終曲・行動力耗盡 ✦',
          icon: '⏳',
          subtitle: `【${card.name}】・${option.text}`,
          narrative: narrativeDesc,
          badges: badges.length > 0 ? badges : undefined,
          confirmText: '確認結算・結束本局',
          onConfirm: () => {
            setOutcomeModal(null);
            setGameState((prev) => ({
              ...prev,
              defeatReason: '行動力已歸 0，本局冒險強制結束。所有的遺憾都將化為下一局的經驗！',
              phase: 'GAME_OVER',
              headacheActive: false,
              fireworksBurning: false,
              ninjaChasing: false,
              rainyWeatherActive: false,
              flags: {
                ...prev.flags,
                headache_active: false,
                fireworks_burning: false,
                ninja_chasing: false,
                rainy_weather_active: false,
              },
            }));
            setShowApExhaustedModal(true);
          },
        });
        return;
      }

      // 若有卡牌連動（AP 充足情況）
      if (effectiveForceNextCardId) {
        const nextCard = CARD_DATABASE.find((c) => c.id === effectiveForceNextCardId);
        if (nextCard) {
          setPendingEventTransition({
            sourceCardName: card.name,
            targetCard: nextCard,
            nextRound: gameState.round >= 30 ? 30 : nextRound,
            effectNarrative:
              optionResultText ||
              option.resultText ||
              (gameState.round >= 30
                ? `※ 第 30 回合宿命延伸！宿命牽引你由【${card.name}】直接連動邁入【${nextCard.name}】！`
                : `命運交織，你由【${card.name}】開啟了前往【${nextCard.name}】的宿命通道！`),
            nextInventory,
            nextItemOrder,
            nextFlags,
            nextStats,
            nextCharacter,
          });
          return;
        }
      }

      // Apply immediate state for background HUD reflection
      setGameState((prev) => ({
        ...prev,
        inventory: nextInventory,
        itemAcquisitionOrder: nextItemOrder,
        drawnCount: nextDrawnCount,
        peninsulaInheritedCounts: nextPeninsulaCounts,
        flags: nextFlags,
        character: nextCharacter,
        stats: nextStats,
        fireworksBurning: nextFireworksBurning,
        ninjaChasing: nextNinjaChasing,
        ninjaNextEncounterRound: nextNinjaNextEncounterRound,
        blacksmithUnlocked: nextBlacksmithUnlocked,
        goldTownUnlocked: nextGoldTownUnlocked,
        terraceUnlocked: nextTerraceUnlocked,
        romanticPhoneUnlocked: nextRomanticPhoneUnlocked,
        headacheActive: nextHeadacheActive,
        rainyWeatherActive: nextRainyWeatherActive,
      }));

      // 【第30回合邊界條件機制】
      // (3) 觸發卡牌導致增加行動力的情況，不影響原先機制，因為原先機制本來就是就算行動力再多也是得 30 回合結束，就算行動力從 0 補回 1 也一樣
      // (2) 回合不計數 - 依然是第 30 回合，不會變成第 31、32 回合，結算依然不超過 30 回合上限
      const isAtOrExceedingRound30 = gameState.round >= 30;
      const finalConfirmRound = isAtOrExceedingRound30 ? 31 : nextRound;

      // Display outcome confirmation modal before advancing to next round
      const isFireworksCard = card.id === 'C2022-08';
      const isRewindRoundCard = eff?.rewindRound !== undefined;
      const outcomeTitle = isFireworksCard
        ? '✦ 環境變化・煙火燃燒 ✦'
        : isRewindRoundCard
        ? '✦ 時空逆轉・因果重塑 ✦'
        : card.id === 'C2002-01'
        ? (orcDefeated ? '✦ 擊敗強敵・戰鬥結算 ✦' : '✦ 攻擊未果・戰鬥結算 ✦')
        : eff?.addItem
        ? '✦ 獲得物品・決策結算 ✦'
        : '✦ 冒險決策・事件結算 ✦';
      const outcomeIcon = isFireworksCard
        ? '🎆'
        : isRewindRoundCard
        ? '⏳'
        : card.id === 'C2002-01'
        ? (orcDefeated ? '⚔️' : '🛡️')
        : eff?.addItem
        ? '🎁'
        : '📜';
      const outcomeNarrative = isFireworksCard
        ? '煙火飄散在你四週，每回合燃燒著你……'
        : optionResultText || option.resultText || `做出選擇：${option.text}。`;
      const finalBadges = [...badges];
      if (isFireworksCard) {
        finalBadges.push({ label: '環境變化', value: '進入【煙火燃燒】狀態', color: 'text-red-400' });
      }

      // 確保本回合新增或數量增加的物品皆列入保護清單
      Object.keys(nextInventory).forEach((k) => {
        if ((nextInventory[k] || 0) > (gameState.inventory[k] || 0) && !newlyAcquiredItemsThisRound.includes(k)) {
          newlyAcquiredItemsThisRound.push(k);
        }
      });
      if (eff?.addItem && !newlyAcquiredItemsThisRound.includes(eff.addItem)) {
        newlyAcquiredItemsThisRound.push(eff.addItem);
      }

      setOutcomeModal({
        title: outcomeTitle,
        icon: outcomeIcon,
        subtitle: `【${card.name}】・${option.text}`,
        narrative: outcomeNarrative,
        badges: finalBadges.length > 0 ? finalBadges : undefined,
        confirmText: isRewindRoundCard
          ? `時空變化・重返第 ${eff?.rewindRound} 回合`
          : isAtOrExceedingRound30
          ? '確定（第 30 回合冒險結算）'
          : `確定（進入第 ${Math.min(30, nextRound)} 回合）`,
        onConfirm: () => {
          setOutcomeModal(null);
          const advanceToNextRound = () => {
            // 檢查是否為說走就走 (C2016-02) 累積經歷滿 5 個探索回合小鐵匠離開機制：
            // 與梯田生長累積制相同：若時間往前推進 (delta > 0)，累計歷經探索回合；
            // 若時空倒流（反方向的鐘或跳轉更早回合），已累積歷經進度保留不回退！
            const delta = finalConfirmRound > gameState.round ? finalConfirmRound - gameState.round : 0;
            const currentElapsed = Number(
              nextFlags['blacksmith_leave_elapsed'] ??
              (nextFlags['blacksmith_leave_round']
                ? Math.max(0, 5 - Math.max(0, Number(nextFlags['blacksmith_leave_round']) - gameState.round))
                : 0)
            );
            const nextElapsed = currentElapsed + (delta > 0 ? 1 : 0);

            const hasLeavePlan =
              nextFlags['blacksmith_leave_countdown'] !== undefined ||
              nextFlags['blacksmith_leave_elapsed'] !== undefined ||
              Number(nextFlags['blacksmith_leave_round'] || 0) > 0;

            const isDepartureTriggerRound =
              Boolean(nextBlacksmithUnlocked || nextFlags['blacksmith_unlocked']) &&
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
                ...nextFlags,
                blacksmith_unlocked: false,
              };
              delete postDepartureFlags['blacksmith_leave_round'];
              delete postDepartureFlags['blacksmith_leave_countdown'];
              delete postDepartureFlags['blacksmith_leave_elapsed'];

              // 即時更新當前底層狀態，確保畫面上的「小鐵鋪」按鈕與行囊即時解除與移除
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
                    character: nextCharacter,
                    stats: nextStats,
                    fireworksBurning: nextFireworksBurning,
                    headacheActive: nextHeadacheActive,
                    rainyWeatherActive: nextRainyWeatherActive,
                    ninjaChasing: nextNinjaChasing,
                    ninjaRound: nextNinjaRound,
                    ninjaNextEncounterRound: nextNinjaNextEncounterRound,
                    blacksmithUnlocked: false,
                    latestAcquiredItemsThisRound: newlyAcquiredItemsThisRound,
                    drawnCount: {
                      ...nextDrawnCount,
                      'C2026-12': 0,
                      'C2002-09': 0,
                    },
                    peninsulaInheritedCounts: nextPeninsulaCounts,
                  });
                },
              });
              return;
            }

            const updatedFlags = { ...nextFlags };
            if (Boolean(nextBlacksmithUnlocked || nextFlags['blacksmith_unlocked']) && (nextInventory['說走就走'] || 0) > 0 && hasLeavePlan) {
              updatedFlags['blacksmith_leave_elapsed'] = nextElapsed;
              updatedFlags['blacksmith_leave_countdown'] = Math.max(0, 5 - nextElapsed);
            }

            startNewRound(finalConfirmRound, {
              inventory: nextInventory,
              itemAcquisitionOrder: nextItemOrder,
              drawnCount: nextDrawnCount,
              peninsulaInheritedCounts: nextPeninsulaCounts,
              flags: updatedFlags,
              character: nextCharacter,
              stats: nextStats,
              fireworksBurning: nextFireworksBurning,
              headacheActive: nextHeadacheActive,
              rainyWeatherActive: nextRainyWeatherActive,
              ninjaChasing: nextNinjaChasing,
              ninjaRound: nextNinjaRound,
              ninjaNextEncounterRound: nextNinjaNextEncounterRound,
              blacksmithUnlocked: nextBlacksmithUnlocked,
              goldTownUnlocked: nextGoldTownUnlocked,
              terraceUnlocked: nextTerraceUnlocked,
              romanticPhoneUnlocked: nextRomanticPhoneUnlocked,
              latestAcquiredItemsThisRound: newlyAcquiredItemsThisRound,
            });
          };

          if (specialCardToShowcase) {
            triggerCardShowcase(
              specialCardToShowcase.cardId,
              specialCardToShowcase.sourceText,
              advanceToNextRound,
              specialCardToShowcase.badgeTitle
            );
          } else {
            advanceToNextRound();
          }
        },
      });
    };

  // 檢查物品是否被限制無法放入半島鐵盒跨局繼承（如《最後的戰役》）
  const isItemPeninsulaRestricted = useCallback((itemName: string) => {
    const cardDef = CARD_DATABASE.find((c) => c.name === itemName);
    return Boolean(cardDef?.isPeninsulaRestricted || itemName === '最後的戰役');
  }, []);

  // 於第 30 回合結束進入 NG 時，若持有半島鐵盒，啟動詢問玩家要保留哪些獲得卡牌繼承到 NG
  const triggerNextGameWithIronBoxCheck = (
    proceedFn: (inherited?: string[], retainChar?: boolean) => void
  ) => {
    const hasIronBox = Boolean((gameState.inventory['半島鐵盒'] || 0) > 0);
    const pages = meta.ironBoxPages || {};
    const availableItems = Object.keys(gameState.inventory).filter(
      (k) => (gameState.inventory[k] || 0) > 0 && !isItemPeninsulaRestricted(k)
    );
    if (hasIronBox) {
      const capacity = getIronBoxCapacity();
      const initialSelected = (meta.ironBoxItems || [])
        .filter((it) => availableItems.includes(it))
        .slice(0, capacity);
      setSelectedIronBoxItems(initialSelected);
      setRetainCharacterInNextGame(Boolean(pages.preface));
      setPendingNextGameCallback(() => proceedFn);
      setShowIronBoxInheritModal(true);
    } else {
      proceedFn();
    }
  };

  // Restart Current Game (CG) for testing - maintains gameNumber without advancing to NG
  return {
    handleSelectOption,
  };
}
