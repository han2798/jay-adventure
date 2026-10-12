import React from 'react';
import { GameState, MetaProgress } from '../types';
import { restoreCardQuotaOnItemLost } from '../utils/gameHelpers';
import { OutcomeModalData } from '../components/modals/OutcomeModal';

export interface UseItemInteractionParams {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  setMeta: React.Dispatch<React.SetStateAction<MetaProgress>>;
  addLog: (msg: string, type?: string) => void;
  setOutcomeModal?: React.Dispatch<React.SetStateAction<OutcomeModalData | null>>;
  triggerCardShowcase?: (cardOrName: any, badgeTitle?: string, onClose?: () => void) => void;
}

export function useItemInteraction(params: UseItemInteractionParams) {
  const {
    gameState,
    setGameState,
    setMeta,
    addLog,
    setOutcomeModal,
    triggerCardShowcase,
  } = params;

  const handleDropOnFireworks = (itemName: string) => {
    if (!gameState.fireworksBurning) return;
    if (!gameState.inventory[itemName] || gameState.inventory[itemName] <= 0) return;

    if (itemName === '煙花易冷') {
      const hasHerbBook = (gameState.inventory['本草綱目'] || 0) > 0;
      if (hasHerbBook) {
        setGameState((prev) => {
          const nextInv = { ...prev.inventory };
          delete nextInv['錯過的煙火']; // 解除後錯過的煙火消失
          const nextOrder = (prev.itemAcquisitionOrder || Object.keys(nextInv)).filter(
            (k) => (nextInv[k] || 0) > 0
          );
          return {
            ...prev,
            inventory: nextInv,
            itemAcquisitionOrder: nextOrder,
            fireworksBurning: false,
            drawnCount: {
              ...prev.drawnCount,
              'C2022-08': 0, // 上限恢復，代表這局還有機會再次抽到錯過的煙火
            },
            flags: {
              ...prev.flags,
              fireworks_burning: false,
              fireworks_burn_ticks: 0,
            },
          };
        });
        addLog('【冷雨滅火】「煙花易冷雨紛紛，行囊遇火不再焚。」憑藉《本草綱目》啟動的行囊進階鑑識，引動【煙花易冷】的冷雨甘霖，成功撲滅周遭火勢，解除了【煙火燃燒】狀態！', 'milestone');
        setOutcomeModal({
          title: '✦ 冷雨滅火・環境復原 ✦',
          icon: '🌧️',
          subtitle: '【煙花易冷】行囊功能',
          narrative: '「煙花易冷雨紛紛，行囊遇火不再焚。」\n\n藉由《本草綱目》喚醒的功能，你成功引動【煙花易冷】化作濛濛細雨，將四處飛濺的漫天火花盡數澆滅！【煙火燃燒】環境狀態已解除，不再每過三回合燒毀物品。',
          badges: [{ label: '環境變化', value: '解除【煙火燃燒】', color: 'text-emerald-400' }],
          confirmText: '太好了',
          onConfirm: () => setOutcomeModal(null),
        });
      } else {
        addLog('你試圖運用【煙花易冷】澆滅火勢，但尚未獲得【古書】，無法參透並啟動其奧妙。\n\n提示：需先啟動行囊進階功能才能施展。', 'warning');
        setOutcomeModal({
          title: '✦ 行囊進階功能未解鎖 ✦',
          icon: '📜',
          subtitle: '【煙花易冷】特殊能力尚未啟動',
          narrative: '你試圖運用【煙花易冷】澆滅火勢，但尚未獲得【古書】，無法參透並啟動其奧妙。\n\n提示：需先啟動行囊進階功能才能施展。',
          confirmText: '知道了',
          onConfirm: () => setOutcomeModal(null),
        });
      }
      return;
    }

    if (itemName === '錯過的煙火') {
      // 如果把C2022-08錯過的煙火這卡片移到煙火燃燒狀態的字樣區，因為火上加火，將會引發大爆炸，將行囊物品全數燒毀
      // 另外，錯過的煙火不會燒毀以下兩種狀況的物品：
      // 1.C2022-08錯過的煙火這卡片本身
      // 2.最新一個獲得的物品
      setGameState((prev) => {
        const nextInv = { ...prev.inventory };
        const order = (prev.itemAcquisitionOrder || Object.keys(nextInv)).filter(
          (k) => (nextInv[k] || 0) > 0
        );

        // 取得最新一個獲得的物品（若最新的是錯過的煙火，則保護其前一個最新獲得的物品）
        const latestItemOverall = order[order.length - 1];
        const latestOtherItem = [...order].reverse().find((k) => k !== '錯過的煙火');
        const sparedLatestItem =
          latestItemOverall === '錯過的煙火' ? latestOtherItem : latestItemOverall;

        // 燒毀所有未受保護的行囊物品
        const burnedItems: string[] = [];
        let nextDrawn = { ...prev.drawnCount };
        let nextPen = { ...(prev.peninsulaInheritedCounts || {}) };

        Object.keys(nextInv).forEach((k) => {
          if (k !== '錯過的煙火' && k !== sparedLatestItem && (nextInv[k] || 0) > 0) {
            burnedItems.push(k);
            const count = nextInv[k];
            delete nextInv[k];
            const quota = restoreCardQuotaOnItemLost(k, nextDrawn, nextPen, count);
            nextDrawn = quota.nextDrawnCount;
            nextPen = quota.nextPeninsulaCounts;
          }
        });

        const nextOrder = order.filter((k) => (nextInv[k] || 0) > 0);

        if (burnedItems.length > 0) {
          addLog(
            `💥【火上加火・大爆炸】你將【錯過的煙火】移入燃燒的煙火中，引發驚天大爆炸！烈焰席捲行囊，燒毀了【${burnedItems.join(
              '、'
            )}】！僅【錯過的煙火】與最新獲得的【${sparedLatestItem}】倖存！`,
            'warning'
          );
          setOutcomeModal({
            title: '✦ 火上加火・引發大爆炸 ✦',
            icon: '💥',
            subtitle: '【錯過的煙火】連鎖引爆',
            narrative: `你將【錯過的煙火】投入四周漫天燃燒的花火之中，火上加火瞬間引發驚天動地的大爆炸！\n\n洶湧烈火吞噬了整座行囊，將【${burnedItems.join(
              '、'
            )}】全數焚燒殆盡！\n\n倖免於難的物品：\n• 【錯過的煙火】（引火之源，不受波及）\n• 【${sparedLatestItem}】（最新獲得的物品，幸運避開核心火舌）`,
            confirmText: '承受浩劫',
            onConfirm: () => setOutcomeModal(null),
          });
        } else {
          addLog(
            '💥【火上加火・大爆炸】你將【錯過的煙火】移入燃燒的煙火中引爆大火！四周火星激射，因行囊無其他可燃舊物，【錯過的煙火】與最新物品安然無恙！',
            'warning'
          );
          setOutcomeModal({
            title: '✦ 火上加火・引發大爆炸 ✦',
            icon: '💥',
            subtitle: '【錯過的煙火】連鎖引爆',
            narrative:
              '你將【錯過的煙火】投入四周漫天燃燒的花火之中，瞬間引爆狂暴火浪！\n\n幸運的是，行囊中除了【錯過的煙火】與最新獲得的物品外，並無其他舊物品，並未造成額外損失。',
            confirmText: '虛驚一場',
            onConfirm: () => setOutcomeModal(null),
          });
        }

        return {
          ...prev,
          inventory: nextInv,
          itemAcquisitionOrder: nextOrder,
          drawnCount: nextDrawn,
          peninsulaInheritedCounts: nextPen,
        };
      });
      return;
    }

    // 燃燒【青花瓷】：高溫崩解還原，去釉化土，獲得【泥土】（後續可種於梯田與爺爺泡的茶連動）
    if (itemName === '青花瓷') {
      setGameState((prev) => {
        const nextInv = { ...prev.inventory };
        nextInv['青花瓷'] = Math.max(0, (nextInv['青花瓷'] || 1) - 1);
        if (nextInv['青花瓷'] === 0) {
          delete nextInv['青花瓷'];
        }
        nextInv['泥土'] = (nextInv['泥土'] || 0) + 1;

        const quota = restoreCardQuotaOnItemLost(
          '青花瓷',
          prev.drawnCount,
          prev.peninsulaInheritedCounts,
          1
        );
        const currentOrder = prev.itemAcquisitionOrder || Object.keys(nextInv);
        const order = currentOrder.filter((k) => (nextInv[k] || 0) > 0);
        if (!order.includes('泥土')) {
          order.push('泥土');
        }

        return {
          ...prev,
          inventory: nextInv,
          itemAcquisitionOrder: order,
          drawnCount: quota.nextDrawnCount,
          peninsulaInheritedCounts: quota.nextPeninsulaCounts,
        };
      });

      addLog('🏺🔥【燒瓷成土】你將【青花瓷】投向漫天飛濺的煙火！烈焰燃燒後的瓷器化為肥沃的【泥土】收入行囊！', 'milestone');
      setOutcomeModal({
        title: '✦ 烈焰燒瓷・青瓷化土 ✦',
        icon: '🌱',
        subtitle: '【青花瓷】高溫燃燒轉化',
        narrative: '「不見炊煙裊裊昇起，卻見烈火吞噬瓷器。」\n\n你將【青花瓷】移入燃燒的煙火中。青瓷釉色逐漸融化，最終燒盡轉化為原始的【泥土】！\n\n此土或許能做些什麼？',
        badges: [
          { label: '消耗文物', value: '【青花瓷】1件', color: 'text-stone-400' },
          { label: '轉化獲得', value: '【泥土】1份', color: 'text-amber-300' },
        ],
        confirmText: '收入行囊',
        onConfirm: () => setOutcomeModal(null),
      });
      return;
    }

    // 燃燒【蘭亭序】：墨韻浴火涅槃，轉化獲得神卡【手寫的從前】（C2014-08）
    if (itemName === '蘭亭序') {
      setGameState((prev) => {
        const nextInv = { ...prev.inventory };
        nextInv['蘭亭序'] = Math.max(0, (nextInv['蘭亭序'] || 1) - 1);
        if (nextInv['蘭亭序'] === 0) {
          delete nextInv['蘭亭序'];
        }
        nextInv['手寫的從前'] = (nextInv['手寫的從前'] || 0) + 1;

        const quota = restoreCardQuotaOnItemLost(
          '蘭亭序',
          prev.drawnCount,
          prev.peninsulaInheritedCounts,
          1
        );
        const currentOrder = prev.itemAcquisitionOrder || Object.keys(nextInv);
        const order = currentOrder.filter((k) => (nextInv[k] || 0) > 0);
        if (!order.includes('手寫的從前')) {
          order.push('手寫的從前');
        }

        return {
          ...prev,
          inventory: nextInv,
          itemAcquisitionOrder: order,
          drawnCount: quota.nextDrawnCount,
          peninsulaInheritedCounts: quota.nextPeninsulaCounts,
        };
      });

      // 永久解鎖卡牌 C2014-08
      setMeta((prev) => ({
        ...prev,
        unlockedCardIds: Array.from(new Set([...prev.unlockedCardIds, 'C2014-08'])),
      }));

      addLog('📜🔥【字化從前】你將《蘭亭序》投向燃燒的煙火！墨香與火光交融，文字行雲流水般在烈焰中幻化成古老思念信箋——獲得卡牌【手寫的從前】！', 'milestone');

      setOutcomeModal({
        title: '✦ 懸筆一絕・手寫從前 ✦',
        icon: '💌',
        subtitle: '【蘭亭序】傾城頃刻間湮滅',
        narrative: (
          <div className="space-y-3 font-sans leading-relaxed text-stone-300">
            <p>「無關風月，我題序等妳回……」</p>
            <p>你將天下第一行書《蘭亭序》投向漫天燃燒的花火！墨香與火光交融，文字行雲流水般在烈焰中幻化成古老的思念信箋。</p>
            <p className="text-s text-amber-300/90 font-mono">昔日蘭亭臨帖，文字穿梭時空而來，獲得卡牌【手寫的從前】！</p>
          </div>
        ),
        badges: [
          { label: '消耗文物', value: '【蘭亭序】1件', color: 'text-stone-400' },
          { label: '獲得卡牌', value: '《手寫的從前》', color: 'text-amber-300' },
        ],
        confirmText: '展開信箋',
        onConfirm: () => {
          setOutcomeModal(null);
          triggerCardShowcase('C2014-08', '蘭亭序於煙火中燃燒轉化獲得');
        },
      });
      return;
    }

    // 燃燒【水】：煙火烈焰高溫煮沸，轉化獲得【熱水】（用於沖泡爺爺泡的茶）
    if (itemName === '水') {
      setGameState((prev) => {
        const nextInv = { ...prev.inventory };
        if (nextInv['水'] > 1) {
          nextInv['水'] -= 1;
        } else {
          delete nextInv['水'];
        }
        nextInv['熱水'] = (nextInv['熱水'] || 0) + 1;

        const currentOrder = prev.itemAcquisitionOrder || Object.keys(nextInv);
        const order = currentOrder.filter((k) => (nextInv[k] || 0) > 0);
        if (!order.includes('熱水')) {
          order.push('熱水');
        }

        return {
          ...prev,
          inventory: nextInv,
          itemAcquisitionOrder: order,
        };
      });

      addLog('🔥💧【煙火煮水】你引導煙火的高溫，將【水】煮沸，成功獲得【熱水】！', 'milestone');

      setOutcomeModal({
        title: '✦ 煙火煮沸・熱水沸騰 ✦',
        icon: '♨️',
        subtitle: '【水】經煙火高溫煮沸',
        narrative: (
          <div className="space-y-3 font-sans leading-relaxed text-stone-300">
            <p>你將【水】置於燃燒的火焰上，水氣蒸騰，煮沸成了一壺熱滾滾的【熱水】！</p>
            <p className="text-s text-amber-300/90 font-mono">獲得【熱水】1 壺，把水燒開了能做些什麼嗎？</p>
          </div>
        ),
        badges: [
          { label: '消耗水源', value: '【水】1瓶', color: 'text-stone-400' },
          { label: '煮沸獲得', value: '【熱水】1壺', color: 'text-amber-300' },
        ],
        confirmText: '收入行囊',
        onConfirm: () => setOutcomeModal(null),
      });
      return;
    }

    // 燃燒【菊花台】：金甲落幕，殘菊浴火，轉化獲得【菊花】（梯田花海培育材料）
    if (itemName === '菊花台') {
      setGameState((prev) => {
        const nextInv = { ...prev.inventory };
        nextInv['菊花台'] = Math.max(0, (nextInv['菊花台'] || 1) - 1);
        if (nextInv['菊花台'] === 0) {
          delete nextInv['菊花台'];
        }
        nextInv['菊花'] = (nextInv['菊花'] || 0) + 1;

        const quota = restoreCardQuotaOnItemLost(
          '菊花台',
          prev.drawnCount,
          prev.peninsulaInheritedCounts,
          1
        );
        const currentOrder = prev.itemAcquisitionOrder || Object.keys(nextInv);
        const order = currentOrder.filter((k) => (nextInv[k] || 0) > 0);
        if (!order.includes('菊花')) {
          order.push('菊花');
        }

        return {
          ...prev,
          inventory: nextInv,
          itemAcquisitionOrder: order,
          drawnCount: quota.nextDrawnCount,
          peninsulaInheritedCounts: quota.nextPeninsulaCounts,
        };
      });

      addLog('🌼🔥【焚台取菊】你將《菊花台》投向燃燒的煙火！台座燒燬殆盡，餘燼中取出殘存的【菊花】收入行囊！', 'milestone');

      setOutcomeModal({
        title: '✦ 焚歌燒台・餘燼殘花 ✦',
        icon: '🌼',
        subtitle: '【菊花台】燒燬台座取花',
        narrative: (
          <div className="space-y-3 font-sans leading-relaxed text-stone-300">
            <p>「菊花殘 滿地傷 你的笑容已泛黃……」</p>
            <p>烈火吞噬了台座，漫天飛舞的餘燼裡，取出殘存的一朵堅韌【菊花】！</p>
            <p className="text-xs text-amber-300/90 font-mono">此花無堅不摧，必能再度於綻放。</p>
          </div>
        ),
        badges: [
          { label: '消耗卡牌', value: '【菊花台】1張', color: 'text-stone-400' },
          { label: '轉化獲得', value: '【菊花】1朵', color: 'text-yellow-300' },
        ],
        confirmText: '收入行囊',
        onConfirm: () => setOutcomeModal(null),
      });
      return;
    }

    // 除了C2010-03煙花易冷以外的物品，若移到煙火燃燒狀態的字樣區，將會被焚燒消失！
    setGameState((prev) => {
      const nextInv = { ...prev.inventory };
      nextInv[itemName] = Math.max(0, (nextInv[itemName] || 1) - 1);
      if (nextInv[itemName] === 0) {
        delete nextInv[itemName];
      }
      const quota = restoreCardQuotaOnItemLost(
        itemName,
        prev.drawnCount,
        prev.peninsulaInheritedCounts,
        1
      );
      const nextOrder = (prev.itemAcquisitionOrder || Object.keys(nextInv)).filter(
        (k) => (nextInv[k] || 0) > 0
      );

      return {
        ...prev,
        inventory: nextInv,
        itemAcquisitionOrder: nextOrder,
        drawnCount: quota.nextDrawnCount,
        peninsulaInheritedCounts: quota.nextPeninsulaCounts,
        ...(itemName === '說走就走'
          ? {
              flags: {
                ...prev.flags,
                blacksmith_leave_round: 0,
                blacksmith_leave_countdown: 0,
                blacksmith_leave_elapsed: 0,
              },
            }
          : {}),
      };
    });

    if (itemName === '說走就走') {
      addLog('【自由止步】行囊中的【說走就走】已被烈火焚毀，小鐵匠打消了離開的念頭，決定繼續留在村莊開立小鐵鋪！', 'milestone');
    }

    addLog(`🔥【物品焚毀】你將【${itemName}】移入漫天煙火之中，熊熊烈火瞬間將其吞噬，化為灰燼消失！`, 'warning');
    setOutcomeModal({
      title: '✦ 物品焚毀 ✦',
      icon: '🔥',
      subtitle: '煙火燃燒吞噬物品',
      narrative: `你將【${itemName}】移入了四周燃燒的漫天煙火之中，炙熱火舌瞬間將其吞噬，【${itemName}】已化為一縷灰燼消失！`,
      confirmText: '已知曉',
      onConfirm: () => setOutcomeModal(null),
    });
  };

  // 拖曳道具至「偏頭痛」環境標籤處理：
  // 若行囊有本草綱目且拖曳至「偏頭痛」，則可痊癒解除狀態
  const handleDropOnHeadache = (itemName: string) => {
    const isHeadache = Boolean(gameState.headacheActive || gameState.flags['headache_active']);
    if (!isHeadache) return;

    if (itemName === '本草綱目') {
      setGameState((prev) => ({
        ...prev,
        headacheActive: false,
        flags: {
          ...prev.flags,
          headache_active: false,
        },
      }));
      addLog('🌿【恢復健康】研讀《本草綱目》的藥理，調和氣血經絡，【偏頭痛】狀態已痊癒解除！', 'milestone');
      setOutcomeModal({
        title: '✦ 恢復健康・頭痛痊癒 ✦',
        icon: '🌿',
        subtitle: '【本草綱目】行囊藥理調治',
        narrative: '你取出珍藏的《本草綱目》，依循書中所載的草本藥理調和氣血。翻騰難受的偏頭痛頓時痊癒，每回合行動力懲罰已完全解除！',
        badges: [
          { label: '環境解除', value: '偏頭痛痊癒', color: 'text-emerald-400' },
          { label: '行動力恢復', value: '免除每回合 -2 扣損', color: 'text-amber-300' },
        ],
        confirmText: '神清氣爽，繼續探索',
        onConfirm: () => {
          setOutcomeModal(null);
        },
      });
    } else {
      addLog(`【方法無效】「${itemName}」並非治頭痛之良藥！研讀醫學方能對症下藥解除偏頭痛。`, 'warning');
    }
  };

  // 拖曳道具至「下雨天」環境標籤處理：
  // 1. 空瓶：盛接雨水轉化為【水】× 1（消耗 1 空瓶）
  // 2. 晴天：放晴解除下雨天狀態（需本草綱目），成功後獲得傳奇卡牌《彩虹》（C2007-02）
  const handleDropOnRain = (itemName: string) => {
    const isRainy = Boolean(gameState.rainyWeatherActive || gameState.flags['rainy_weather_active']);
    if (!isRainy) return;
    if (!gameState.inventory[itemName] || gameState.inventory[itemName] <= 0) return;

    if (itemName === '空瓶') {
      setGameState((prev) => {
        const nextInv = { ...prev.inventory };
        if (nextInv['空瓶'] > 1) {
          nextInv['空瓶'] -= 1;
        } else {
          delete nextInv['空瓶'];
        }
        nextInv['水'] = (nextInv['水'] || 0) + 1;
        const currentOrder = prev.itemAcquisitionOrder || Object.keys(nextInv);
        const order = currentOrder.filter((k) => (nextInv[k] || 0) > 0);
        if (!order.includes('水')) order.push('水');

        return {
          ...prev,
          inventory: nextInv,
          itemAcquisitionOrder: order,
        };
      });
      addLog('🍾🌧️【雨天接水】在大雨中伸出【空瓶】盛裝，成功獲得【水】1 瓶！', 'milestone');
      setOutcomeModal({
        title: '✦ 雨天盛水・獲得水源 ✦',
        icon: '💧',
        subtitle: '下雨天環境互動',
        narrative: (
          <div className="space-y-3 font-sans leading-relaxed text-stone-300">
            <p>你將空瓶置於大雨之中，冰涼的雨水轉瞬盛滿了整只瓶子！</p>
            <p className="text-s text-sky-300 font-mono">獲得【水】1 瓶，可用於灌溉</p>
          </div>
        ),
        badges: [
          { label: '消耗物品', value: '【空瓶】× 1', color: 'text-stone-400' },
          { label: '獲得水源', value: '【水】× 1 瓶', color: 'text-sky-300' },
        ],
        confirmText: '收入行囊',
        onConfirm: () => setOutcomeModal(null),
      });
      return;
    }

    if (itemName === '晴天') {
      const hasHerbBook = (gameState.inventory['本草綱目'] || 0) > 0;
      if (hasHerbBook) {
        setGameState((prev) => {
          const nextInv = { ...prev.inventory };
          if (nextInv['晴天'] > 1) {
            nextInv['晴天'] -= 1;
          } else {
            delete nextInv['晴天'];
          }
          nextInv['彩虹'] = (nextInv['彩虹'] || 0) + 1;
          const currentOrder = prev.itemAcquisitionOrder || Object.keys(nextInv);
          const order = currentOrder.filter((k) => (nextInv[k] || 0) > 0);
          if (!order.includes('彩虹')) order.push('彩虹');

          return {
            ...prev,
            inventory: nextInv,
            itemAcquisitionOrder: order,
            rainyWeatherActive: false,
            flags: {
              ...prev.flags,
              rainy_weather_active: false,
              rainy_rounds_count: 0,
              rain_completed_rounds: 0,
              pending_heard_rain_trigger: false,
            },
          };
        });
        setMeta((prev) => {
          if (prev.unlockedCardIds.includes('C2007-02')) return prev;
          return {
            ...prev,
            unlockedCardIds: [...prev.unlockedCardIds, 'C2007-02'],
          };
        });
        addLog('🌈【雨後天晴】你將《晴天》迎向大雨，陽光穿透烏雲，天空豁然放晴！浮現出一道絢爛奪目的《彩虹》', 'milestone');

        setOutcomeModal({
          title: '✦ 雨後天晴・晴空現虹 ✦',
          icon: '🌈',
          subtitle: '【下雨天】環境解除',
          narrative: (
            <div className="space-y-3 font-sans leading-relaxed text-stone-300">
              <p>「等到放晴的那天 也許我會比較好一點」</p>
              <p>你將【晴天】迎向大雨，陽光穿透烏雲，天空豁然放晴！</p>
              <p className="text-s text-sky-300 font-mono">雨過天晴，浮現出一道絢爛奪目的【彩虹】！</p>
            </div>
          ),
          badges: [
            { label: '消耗卡牌', value: '【晴天】1張', color: 'text-stone-400' },
            { label: '環境變化', value: '雨停放晴', color: 'text-amber-300' },
            { label: '獲得', value: '《彩虹》', color: 'text-sky-300' },
          ],
          confirmText: '凝望彩虹',
          onConfirm: () => {
            setOutcomeModal(null);
            triggerCardShowcase('C2007-02', '雨後天晴・以晴天驅散漫天雨勢獲得');
          },
        });
      } else {
        addLog('你試圖運用【晴天】驅散漫天烏雲，但尚未獲得【古書】，無法參透並啟動其奧妙。\n\n提示：需先啟動行囊進階功能才能施展。', 'warning');
        setOutcomeModal({
          title: '✦ 行囊進階功能未解鎖 ✦',
          icon: '📜',
          subtitle: '【晴天】特殊能力尚未啟動',
          narrative: '你試圖運用【晴天】驅散漫天烏雲，但尚未獲得【古書】，無法參透並啟動其奧妙。\n\n提示：需先啟動行囊進階功能才能施展。',
          confirmText: '知道了',
          onConfirm: () => setOutcomeModal(null),
        });
      }
      return;
    }

    addLog(`【雨中沖刷】你將【${itemName}】置於雨水之中沖刷洗滌，並無特殊連動。`, 'action');
  };

  // Start Next Game (NG) - called when GameOverModal transitions to next run
  return {
    handleDropOnFireworks,
    handleDropOnHeadache,
    handleDropOnRain,
  };
}
