import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  GameState,
  MetaProgress,
  CardDefinition,
  JokerEquipment,
  CharacterDefinition,
  GameHistoryRecord,
  RouteVictoryRecord,
  SettlementRecord,
} from './types';
import { CARD_DATABASE } from './data/cards';
import { INITIAL_SELECTABLE_CHARACTERS, ALL_CHARACTERS } from './data/characters';
import { ALL_ACHIEVEMENTS } from './data/achievements';
import { MysteryCard } from './components/MysteryCard';
import { CardDisplay } from './components/CardDisplay';
import { CharacterPanel } from './components/CharacterPanel';
import { InventoryGrid } from './components/InventoryGrid';
import { AdventureLog } from './components/AdventureLog';
import { BossBattleView } from './components/BossBattleView';
import { CompendiumModal } from './components/CompendiumModal';
import { DevModal } from './components/DevModal';
import { GameOverModal } from './components/GameOverModal';
import { HallOfFameModal } from './components/HallOfFameModal';
import { CharacterAvatarIcon } from './components/CharacterAvatarIcon';
import { JayQuoteEasterEgg } from './components/JayQuoteEasterEgg';
import { getSettlementGrade } from './utils/exportSettlement';

const STORAGE_KEY_META = 'jay_chou_rpg_meta_v1';

export default function App() {
  // Load or initialize Meta progress
  const [meta, setMeta] = useState<MetaProgress>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_META);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse meta progress', e);
      }
    }
    return {
      unlockedCardIds: [],
      unlockedAchievements: [],
      unlockedDiaries: [],
      ironBoxItems: [],
      pastGamesCount: 1,
      victories: [],
      nextGameFlags: {},
    };
  });

  // Save meta progress
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_META, JSON.stringify(meta));
  }, [meta]);

  // Game Core State
  const [gameState, setGameState] = useState<GameState>(() => {
    return {
      gameNumber: 1,
      round: 1,
      maxRounds: 30,
      character: null,
      inventory: {},
      drawnCount: {},
      flags: {},
      jokerSlots: { place: null, shoes: null, performance: null },
      reversedClockUsesRemaining: 3,
      stats: { ap: 15 },
      logs: [
        {
          round: 0,
          text: '歡迎踏入《跨時代：周杰倫文字冒險》！命運迷霧已起，請抽取初始角色化身……',
          type: 'milestone',
        },
      ],
      phase: 'CHOOSE_CHARACTER',
      revealedCard: null,
      currentDrawChoices: [],
    };
  });

  // Modals state
  const [showCompendium, setShowCompendium] = useState<boolean>(false);
  const [showHallOfFame, setShowHallOfFame] = useState<boolean>(false);
  const [showNewGamePlusModal, setShowNewGamePlusModal] = useState<boolean>(false);
  const [showDevModal, setShowDevModal] = useState<boolean>(false);
  const [showDevPasswordModal, setShowDevPasswordModal] = useState<boolean>(false);
  const [isDevAuthenticated, setIsDevAuthenticated] = useState<boolean>(() => {
    try {
      return typeof window !== 'undefined' && sessionStorage.getItem('jay_dev_auth_session') === 'true';
    } catch {
      return false;
    }
  });
  const [devPasswordInput, setDevPasswordInput] = useState<string>('');
  const [devPasswordError, setDevPasswordError] = useState<string>('');
  const [showWipeMemoryModal, setShowWipeMemoryModal] = useState<boolean>(false);
  const [pendingCharacter, setPendingCharacter] = useState<CharacterDefinition | null>(null);
  const [showCharConfirmModal, setShowCharConfirmModal] = useState<boolean>(false);
  const [showApExhaustedModal, setShowApExhaustedModal] = useState<boolean>(false);
  const [pendingEventTransition, setPendingEventTransition] = useState<{
    sourceCardName: string;
    targetCard: CardDefinition;
    nextRound: number;
    effectNarrative: string;
    nextInventory: Record<string, number>;
    nextFlags: Record<string, any>;
    nextStats: { ap: number };
    nextCharacter: CharacterDefinition;
  } | null>(null);
  const [outcomeModal, setOutcomeModal] = useState<{
    title: string;
    icon?: string;
    subtitle?: string;
    narrative: string;
    badges?: { label: string; value: string; color?: string }[];
    confirmText?: string;
    onConfirm: () => void;
  } | null>(null);

  // 周董經典口頭禪彩蛋狀態
  const [jayQuote, setJayQuote] = useState<string | null>(null);

  const triggerJayQuote = useCallback((customQuote?: string) => {
    const defaultQuotes = [
      '「哎呦，不錯喔！」',
      '「這個超屌！」',
      '「有點屌喔！」',
      '「聽媽媽的話，不錯喔！」',
      '「屌爆了！」',
      '「哎呦，可以喔！」',
    ];
    const q = customQuote || defaultQuotes[Math.floor(Math.random() * defaultQuotes.length)];
    setJayQuote(q);
    setTimeout(() => {
      setJayQuote(null);
    }, 3500);
  }, []);

  // 判定玩家是否已全通關取得過評級戰績卡（解鎖「傳奇殿堂」與「開啟新周目」）
  const hasAchievedGrandSlam = useMemo(() => {
    const hasFullSettlement = Boolean(
      meta.settlementHistory && meta.settlementHistory.some((s) => s.isAllCompleted)
    );
    const hasThreeRoutes = Object.keys(meta.routeVictoryRecords || {}).length >= 3;
    return hasFullSettlement || hasThreeRoutes;
  }, [meta.settlementHistory, meta.routeVictoryRecords]);

  // Add Log Helper
  const addLog = useCallback(
    (text: string, type?: 'draw' | 'action' | 'combat' | 'milestone' | 'warning') => {
      setGameState((prev) => ({
        ...prev,
        logs: [
          ...prev.logs,
          {
            round: prev.round,
            text,
            type: type || 'action',
          },
        ],
      }));
    },
    []
  );

  // Check and unlock achievements
  const checkAchievements = useCallback((inventory: Record<string, number>) => {
    setMeta((prevMeta) => {
      const newlyUnlocked: string[] = [];
      ALL_ACHIEVEMENTS.forEach((ach) => {
        if (!prevMeta.unlockedAchievements.includes(ach.id)) {
          const hasAll = ach.requiredCards.every((cardName) => (inventory[cardName] || 0) > 0);
          if (hasAll) {
            newlyUnlocked.push(ach.id);
          }
        }
      });

      if (newlyUnlocked.length > 0) {
        newlyUnlocked.forEach((id) => {
          const ach = ALL_ACHIEVEMENTS.find((a) => a.id === id);
          if (ach) {
            addLog(`✦ 恭喜解鎖傳奇成就【${ach.title}】！${ach.rewardDescription}`, 'milestone');
          }
        });
        return {
          ...prevMeta,
          unlockedAchievements: [...prevMeta.unlockedAchievements, ...newlyUnlocked],
        };
      }
      return prevMeta;
    });
  }, [addLog]);

  // Generate 3 weighted random cards for current round
  const rollThreeCards = useCallback(
    (state: GameState, metaData: MetaProgress): CardDefinition[] => {
      // Filter available cards
      const candidates = CARD_DATABASE.filter((card) => {
        // 1. Condition check
        if (card.condition && !card.condition(state, metaData)) {
          return false;
        }
        // 2. Max draws check
        const alreadyDrawn = state.drawnCount[card.id] || 0;
        if (alreadyDrawn >= card.maxDraws) {
          return false;
        }
        // 3. Weight check (weight <= 0 cannot be drawn normally)
        if (card.weight <= 0) {
          return false;
        }
        return true;
      });

      if (candidates.length < 3) {
        return candidates;
      }

      // Pick 3 unique cards without replacement using relative weights
      const pool = [...candidates];
      const selected: CardDefinition[] = [];

      // Guaranteed priority cards (100% appearance when conditions are met)
      // 1. 亂舞春秋 (C2004-07): 持有 忍者、印地安老斑鳩、半獸人、龍戰騎士 且當局未抽取過
      const chaosEraEligible = Boolean(
        state.inventory['忍者'] &&
        state.inventory['印地安老斑鳩'] &&
        state.inventory['半獸人'] &&
        state.inventory['龍戰騎士'] &&
        !state.flags['chaos_era_obtained']
      );

      // 2. 最後的戰役 (C2002-10): 處於亂舞春秋時代 且未持有最後的戰役 且非第30回合
      const lastBattleEligible = Boolean(
        (state.flags['chaos_era_active'] || metaData.nextGameFlags['next_game_chaos_era']) &&
        !state.inventory['最後的戰役'] &&
        state.round !== 30
      );

      if (chaosEraEligible) {
        const chaosCard = pool.find((c) => c.id === 'C2004-07');
        if (chaosCard && !selected.some((c) => c.id === chaosCard.id)) {
          selected.push(chaosCard);
          const idx = pool.findIndex((c) => c.id === chaosCard.id);
          if (idx !== -1) pool.splice(idx, 1);
        }
      }

      if (lastBattleEligible) {
        const battleCard = pool.find((c) => c.id === 'C2002-10');
        if (battleCard && !selected.some((c) => c.id === battleCard.id)) {
          selected.push(battleCard);
          const idx = pool.findIndex((c) => c.id === battleCard.id);
          if (idx !== -1) pool.splice(idx, 1);
        }
      }

      while (selected.length < 3 && pool.length > 0) {
        const totalWeight = pool.reduce((acc, c) => acc + c.weight, 0);
        let randomVal = Math.random() * totalWeight;

        let pickedIdx = 0;
        for (let j = 0; j < pool.length; j++) {
          randomVal -= pool[j].weight;
          if (randomVal <= 0) {
            pickedIdx = j;
            break;
          }
        }

        selected.push(pool[pickedIdx]);
        pool.splice(pickedIdx, 1);
      }

      return selected;
    },
    []
  );

  // Start round: prepare choices or trigger Boss battle
  const startNewRound = useCallback(
    (targetRound: number, customState?: Partial<GameState>) => {
      setGameState((prev) => {
        const nextState = {
          ...prev,
          ...customState,
          round: targetRound,
          revealedCard: null,
        };

        // If Round === 30 and ready for general, trigger Boss battle!
        if (targetRound === 30 && nextState.flags['ready_for_general']) {
          return {
            ...nextState,
            phase: 'BOSS_BATTLE',
          };
        }

        // If round exceeded 30 without victory, trigger game over (strictly capped at 30)
        if (targetRound > 30) {
          return {
            ...nextState,
            round: 30,
            phase: 'GAME_OVER',
            defeatReason: '30 回合光陰已盡，未能達成通關任務條件。',
          };
        }

        // Otherwise, prepare 3 mystery cards
        const choices = rollThreeCards(nextState, meta);
        return {
          ...nextState,
          phase: 'DRAW_THREE',
          currentDrawChoices: choices,
        };
      });
    },
    [rollThreeCards, meta]
  );

  // Select Initial Character
  const handleSelectCharacter = (char: typeof INITIAL_SELECTABLE_CHARACTERS[0]) => {
    // Inherit iron box items from meta
    const initialInventory: Record<string, number> = {};
    if (meta.ironBoxItems && meta.ironBoxItems.length > 0) {
      meta.ironBoxItems.forEach((item) => {
        initialInventory[item] = (initialInventory[item] || 0) + 1;
      });
      addLog(`【半島鐵盒】跨局傳承生效，繼承了上一局封存的 ${meta.ironBoxItems.join('、')}！`, 'milestone');
    }

    // Next game flags inheritance
    const initialFlags: Record<string, boolean | string | number> = { ...meta.nextGameFlags };
    if (meta.nextGameFlags['next_game_chaos_era']) {
      initialFlags['chaos_era_active'] = true;
      addLog('【亂舞春秋】時空裂痕生效，當前局開局即進入亂舞春秋時代！', 'milestone');
    }

    setGameState((prev) => ({
      ...prev,
      character: char,
      inventory: initialInventory,
      flags: initialFlags,
      round: 1,
      phase: 'DRAW_THREE',
      currentDrawChoices: rollThreeCards(
        {
          ...prev,
          character: char,
          inventory: initialInventory,
          flags: initialFlags,
        },
        meta
      ),
      logs: [
        ...prev.logs,
        {
          round: 1,
          text: `你化身為【${char.name}】（${char.title}），踏入充滿周杰倫旋律的神秘世界。第 1 回合開始，請抽卡！`,
          type: 'milestone',
        },
      ],
    }));
  };

  // Draw Card from the 3 choices
  const handleDrawCard = (card: CardDefinition) => {
    // 1. Mark drawn count for limit
    const nextDrawnCount = {
      ...gameState.drawnCount,
      [card.id]: (gameState.drawnCount[card.id] || 0) + 1,
    };

    // 2. Add to meta unlocked cards
    setMeta((prev) => {
      if (!prev.unlockedCardIds.includes(card.id)) {
        return {
          ...prev,
          unlockedCardIds: [...prev.unlockedCardIds, card.id],
        };
      }
      return prev;
    });

    addLog(`抽到了【${card.name}】`, 'draw');

    // 觸發周董彩蛋語錄：若抽到神級卡、高稀有度卡或太陽之子路線卡
    const isSpecialCard =
      card.weight <= 4 ||
      card.route === '太陽之子' ||
      ['《跨時代》', '《葉惠美》', '《范特西》', '《杰倫》', '最後的戰役', '龍戰騎士', '亂舞春秋'].includes(
        card.name
      );
    if (isSpecialCard && Math.random() < 0.7) {
      triggerJayQuote();
    }

    // 3. Reveal this card ONLY (the other 2 remain mystery cards, never spoiled!)
    setGameState((prev) => ({
      ...prev,
      drawnCount: nextDrawnCount,
      revealedCard: card,
      phase: 'REVEAL_CARD',
    }));
  };

  // Select Option on Revealed Card
  const handleSelectOption = (optionIndex: number) => {
    if (!gameState.revealedCard) return;

    const card = gameState.revealedCard;
    const option = card.options && card.options[optionIndex]
      ? card.options[optionIndex]
      : {
          text: '收入行囊',
          resultText: `獲得了【${card.name}】！`,
          effect: { addItem: card.name },
        };

    addLog(`做出選擇：${option.text}。${option.resultText}`, 'action');

    const eff = option.effect;
    const nextInventory = { ...gameState.inventory };
    const nextFlags = { ...gameState.flags };
    let nextStats = { ...gameState.stats };
    let nextCharacter = gameState.character;
    let nextVictory = gameState.victoryType;
    let nextDefeat = gameState.defeatReason;
    let nextRound = gameState.round + 1;

    // Apply effects
    if (eff) {
      if (eff.addItem) {
        nextInventory[eff.addItem] = (nextInventory[eff.addItem] || 0) + 1;
        // Diary unlock check
        if (card.type === '日記' && !meta.unlockedDiaries.includes(eff.addItem)) {
          setMeta((prev) => ({
            ...prev,
            unlockedDiaries: [...prev.unlockedDiaries, eff.addItem!],
          }));
        }
      }

      if (eff.removeItem && nextInventory[eff.removeItem]) {
        nextInventory[eff.removeItem] = Math.max(0, nextInventory[eff.removeItem] - 1);
        if (nextInventory[eff.removeItem] === 0) delete nextInventory[eff.removeItem];
      }

      if (eff.removeItems) {
        eff.removeItems.forEach((item) => {
          if (nextInventory[item]) {
            nextInventory[item] = Math.max(0, nextInventory[item] - 1);
            if (nextInventory[item] === 0) delete nextInventory[item];
          }
        });
      }

      if (eff.setFlag) {
        Object.assign(nextFlags, eff.setFlag);
      }

      if (eff.setMetaFlag) {
        setMeta((prev) => ({
          ...prev,
          nextGameFlags: { ...prev.nextGameFlags, ...eff.setMetaFlag },
        }));
      }

      if (eff.apChange) {
        nextStats.ap = Math.max(0, nextStats.ap + eff.apChange);
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
          // Clear items (except iron box stored ones or character)
          Object.keys(nextInventory).forEach((k) => {
            if (k !== '時光機') delete nextInventory[k];
          });
          addLog('【時光倒流】你回到了第 1 回合！身上的常規物品在時空亂流中悉數消散。', 'warning');
        } else {
          addLog('【時光機啟動】帶著全部物品與記憶，毫髮無傷地重返第 1 回合！', 'milestone');
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
        setMeta((prev) => ({
          ...prev,
          nextGameFlags: { ...prev.nextGameFlags, next_game_chaos_era: true },
        }));
        if (gameState.round <= 24) {
          nextFlags['chaos_era_active'] = true;
          addLog('【亂舞春秋】在第 24 回合前啟動！時空震盪，當局全面進入【亂舞春秋時代】！', 'milestone');
        } else {
          addLog('【亂舞春秋】在第 25 回合後啟動！時空震盪延遲，將於下一局全面進入【亂舞春秋時代】！', 'milestone');
        }
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

      // Check Core Route 3: 《周杰倫家庭》 Victory (Family members and songs collected)
      if (
        nextInventory['外婆'] &&
        nextInventory['聽媽媽的話'] &&
        nextInventory['聽爸爸的話'] &&
        (nextInventory['女兒殿下'] || nextCharacter.name === '女兒殿下')
      ) {
        nextVictory = '周杰倫家庭';
        addLog('【溫馨團聚】外婆、媽媽、爸爸、女兒殿下全員相聚，達成《周杰倫家庭》溫情傳奇結局！', 'milestone');
      }

      // Sunshine guy evolution check
      if (nextCharacter.name === '陽光宅男' && nextInventory['公主病']) {
        const daughterChar = ALL_CHARACTERS.find((c) => c.id === 'char_daughter');
        if (daughterChar) {
          nextCharacter = daughterChar;
          addLog('【血脈覺醒】陽光宅男感應到了任性的公主病真情，奇蹟進化為神級化身【女兒殿下】！', 'milestone');
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
          characterName: nextCharacter.name,
        };

        setGameState((prev) => ({
          ...prev,
          inventory: nextInventory,
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
          flags: nextFlags,
          character: nextCharacter,
          stats: nextStats,
          defeatReason: nextDefeat,
          phase: 'GAME_OVER',
        }));
        return;
      }

      // Force Next Card Encounter (事件連動過場視窗)
      if (eff.forceNextCardId) {
        const nextCard = CARD_DATABASE.find((c) => c.id === eff.forceNextCardId);
        if (nextCard) {
          // Action consumes 1 AP
          nextStats.ap = Math.max(0, nextStats.ap - 1);

          // 【第30回合邊界條件機制】
          // (1) 延伸 - 持續觸發卡牌或效果，直到無法觸發為止 (A卡跳接B卡，B卡如果還會觸發跳接到C卡的話依然持續，以此類推)
          // (2) 回合不計數 - 依然是第 30 回合，不會變成第 31、32 回合，結算依然不超過 30 回合上限
          if (gameState.round >= 30) {
            setPendingEventTransition({
              sourceCardName: card.name,
              targetCard: nextCard,
              nextRound: 30,
              effectNarrative:
                option.resultText ||
                `※ 第 30 回合宿命延伸！宿命牽引你由【${card.name}】直接連動邁入【${nextCard.name}】！`,
              nextInventory,
              nextFlags,
              nextStats,
              nextCharacter,
            });
            return;
          }

          if (nextStats.ap <= 0) {
            nextStats.ap = 0;
            addLog('【行動力竭】行動力歸 0，身體已達極限，本局冒險強制結束！', 'warning');
            setGameState((prev) => ({
              ...prev,
              inventory: nextInventory,
              flags: nextFlags,
              character: nextCharacter,
              stats: nextStats,
              defeatReason: '行動力已歸 0，本局冒險強制結束。所有的遺憾都將化為下一局的經驗！',
            }));
            setShowApExhaustedModal(true);
            return;
          }

          setPendingEventTransition({
            sourceCardName: card.name,
            targetCard: nextCard,
            nextRound: nextRound,
            effectNarrative: option.resultText || `命運交織，你由【${card.name}】開啟了前往【${nextCard.name}】的宿命通道！`,
            nextInventory,
            nextFlags,
            nextStats,
            nextCharacter,
          });
          return;
        }
      }
    }

    // Action consumes 1 AP
    nextStats.ap = Math.max(0, nextStats.ap - 1);

    if (nextStats.ap <= 0) {
      nextStats.ap = 0;
      addLog('【行動力竭】行動力歸 0，身體已達極限，本局冒險強制結束！', 'warning');
      setGameState((prev) => ({
        ...prev,
        inventory: nextInventory,
        flags: nextFlags,
        character: nextCharacter,
        stats: nextStats,
        defeatReason: '行動力已歸 0，本局冒險強制結束。所有的遺憾都將化為下一局的經驗！',
      }));
      setShowApExhaustedModal(true);
      return;
    }

    // Apply immediate state for background HUD reflection
    setGameState((prev) => ({
      ...prev,
      inventory: nextInventory,
      flags: nextFlags,
      character: nextCharacter,
      stats: nextStats,
    }));

    // Construct outcome modal badges
    const badges: { label: string; value: string; color?: string }[] = [];
    if (eff?.addItem) {
      badges.push({ label: '獲得物品', value: `【${eff.addItem}】`, color: 'text-amber-300' });
    }
    if (eff?.removeItem) {
      badges.push({ label: '消耗物品', value: `【${eff.removeItem}】`, color: 'text-stone-400' });
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
        value: `${eff.apChange > 0 ? '+' : ''}${eff.apChange} AP`,
        color: eff.apChange > 0 ? 'text-emerald-400' : 'text-red-400',
      });
    }
    if (eff?.rewindRound !== undefined) {
      badges.push({ label: '時空逆轉', value: '重返第 1 回合', color: 'text-cyan-300' });
    }
    if (nextCharacter.name !== gameState.character?.name) {
      badges.push({ label: '化身覺醒', value: `【${nextCharacter.name}】`, color: 'text-yellow-300' });
    }

    // 【第30回合邊界條件機制】
    // (3) 觸發卡牌導致增加體力的情況，不影響原先機制，因為原先機制本來就是就算體力再多也是得 30 回合結束，就算體力從 0 補回 1 也一樣
    // (2) 回合不計數 - 依然是第 30 回合，不會變成第 31、32 回合，結算依然不超過 30 回合上限
    const isAtOrExceedingRound30 = gameState.round >= 30;
    const finalConfirmRound = isAtOrExceedingRound30 ? 31 : nextRound;

    // Display outcome confirmation modal before advancing to next round
    setOutcomeModal({
      title: eff?.addItem ? '✦ 獲得物品・決策結算 ✦' : '✦ 冒險決策・事件結算 ✦',
      icon: eff?.addItem ? '🎁' : '📜',
      subtitle: `【${card.name}】・${option.text}`,
      narrative: option.resultText || `做出選擇：${option.text}。`,
      badges: badges.length > 0 ? badges : undefined,
      confirmText: isAtOrExceedingRound30
        ? '確定（第 30 回合冒險結算）'
        : `確定（進入第 ${Math.min(30, nextRound)} 回合）`,
      onConfirm: () => {
        setOutcomeModal(null);
        startNewRound(finalConfirmRound, {
          inventory: nextInventory,
          flags: nextFlags,
          character: nextCharacter,
          stats: nextStats,
        });
      },
    });
  };

  // Joker puzzle equipment slot handler
  const handleEquipJoker = (slot: keyof JokerEquipment, itemName: string) => {
    const expectedMap: Record<keyof JokerEquipment, string> = {
      place: '我的地盤',
      shoes: '鞋子特大號',
      performance: '紅模仿',
    };

    const slotLabelMap: Record<keyof JokerEquipment, string> = {
      place: '在',
      shoes: '穿',
      performance: '表演',
    };

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

    if (!gameState.inventory[itemName] || gameState.inventory[itemName] <= 0) {
      addLog(`【行囊不足】你並未持有【${itemName}】。`, 'warning');
      return;
    }

    setGameState((prev) => {
      const nextSlots = { ...prev.jokerSlots, [slot]: itemName };
      const nextInv = { ...prev.inventory };
      nextInv[itemName] = Math.max(0, (nextInv[itemName] || 1) - 1);
      if (nextInv[itemName] === 0) delete nextInv[itemName];

      // Check if all 3 are slotted! (在我的地盤, 穿鞋子特大號, 表演紅模仿)
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
        addLog('【小丑的心願達成】喬克叔叔在我的地盤，穿著鞋子特大號，表演紅模仿，博得可愛女人歡心！獲得【可愛女人】！', 'milestone');
        setOutcomeModal({
          title: '✦ 喬克叔叔的心願達成 ✦',
          icon: '💖',
          subtitle: '博得伊人一笑',
          narrative: '喬克叔叔在我的地盤，穿著鞋子特大號，表演紅模仿……小丑臉上的淚痕化為燦爛笑容，終於博得心儀之人的嫣然一笑！獲得了【可愛女人】！',
          badges: [
            { label: '裝備完成', value: `【${slotLabelMap[slot]}】${itemName}`, color: 'text-purple-300' },
            { label: '獲得傳奇卡牌', value: '【可愛女人】 x1', color: 'text-pink-300' },
          ],
          confirmText: '收入行囊',
          onConfirm: () => setOutcomeModal(null),
        });
      } else {
        addLog(`【心願契合】喬克叔叔成功裝備了【${itemName}】！`, 'milestone');
        setOutcomeModal({
          title: '✦ 心願共鳴・裝備成功 ✦',
          icon: '🤡',
          subtitle: '喬克叔叔的心願詰問',
          narrative: `喬克叔叔成功在【${slotLabelMap[slot]}】裝備了【${itemName}】！心中的旋律悄然拼湊，距離博得心上人的歡笑更近了一步。`,
          badges: [
            { label: `填入【${slotLabelMap[slot]}】裝備槽`, value: `【${itemName}】`, color: 'text-purple-300' },
          ],
          confirmText: '確認',
          onConfirm: () => setOutcomeModal(null),
        });
      }

      return {
        ...prev,
        inventory: nextInv,
        jokerSlots: nextSlots,
      };
    });
  };

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

  // Iron Box store/take handlers
  const handleStoreIronBox = (itemName: string) => {
    if (meta.ironBoxItems.length >= 3) return;
    setGameState((prev) => {
      const nextInv = { ...prev.inventory };
      nextInv[itemName] = Math.max(0, (nextInv[itemName] || 1) - 1);
      if (nextInv[itemName] === 0) delete nextInv[itemName];
      return { ...prev, inventory: nextInv };
    });
    setMeta((prev) => ({
      ...prev,
      ironBoxItems: [...prev.ironBoxItems, itemName],
    }));
    addLog(`將【${itemName}】放入半島鐵盒，將可跨局傳承至下一局！`, 'action');
    setOutcomeModal({
      title: '✦ 半島鐵盒・時空封存 ✦',
      icon: '📻',
      subtitle: '跨局記憶傳承',
      narrative: `你將【${itemName}】小心翼翼地放入了半島鐵盒之中。這份珍貴的物品將跨越時空輪迴，在未來的冒險中由你再度繼承。`,
      badges: [{ label: '封存物品', value: `【${itemName}】`, color: 'text-amber-300' }],
      confirmText: '確認',
      onConfirm: () => setOutcomeModal(null),
    });
  };

  const handleTakeIronBox = (itemName: string) => {
    setMeta((prev) => {
      const nextItems = [...prev.ironBoxItems];
      const idx = nextItems.indexOf(itemName);
      if (idx >= 0) nextItems.splice(idx, 1);
      return { ...prev, ironBoxItems: nextItems };
    });
    setGameState((prev) => {
      const nextInv = { ...prev.inventory, [itemName]: (prev.inventory[itemName] || 0) + 1 };
      return { ...prev, inventory: nextInv };
    });
    addLog(`從半島鐵盒取回了【${itemName}】至行囊。`, 'action');
    setOutcomeModal({
      title: '✦ 半島鐵盒・取出回憶 ✦',
      icon: '📻',
      subtitle: '取回封存物品',
      narrative: `你從半島鐵盒中取出了【${itemName}】，卡牌已重新放入當前冒險的行囊。`,
      badges: [{ label: '取出行囊', value: `【${itemName}】`, color: 'text-amber-300' }],
      confirmText: '確認',
      onConfirm: () => setOutcomeModal(null),
    });
  };

  // Restart Current Game (CG) for testing - maintains gameNumber without advancing to NG
  const handleRestartCurrentGame = () => {
    setGameState((prev) => ({
      ...prev,
      round: 1,
      maxRounds: 30,
      character: null,
      inventory: {},
      drawnCount: {},
      flags: {},
      jokerSlots: { place: null, shoes: null, performance: null },
      reversedClockUsesRemaining: 3,
      stats: { ap: 15 },
      logs: [
        {
          round: 0,
          text: `重新啟動第 ${prev.gameNumber} 局探索！請抽取本局初始角色化身……`,
          type: 'milestone',
        },
      ],
      phase: 'CHOOSE_CHARACTER',
      revealedCard: null,
      currentDrawChoices: [],
    }));
  };

  // Start Next Game (NG) - called when GameOverModal transitions to next run
  const handleStartNextGame = () => {
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

    setMeta((prev) => ({
      ...prev,
      pastGamesCount: prev.pastGamesCount + 1,
      totalRoundsPlayed: (prev.totalRoundsPlayed || 0) + gameState.round,
      gameHistories: [historyRecord, ...(prev.gameHistories || [])],
      settlementHistory: isGrandSlam
        ? [settlementRec, ...(prev.settlementHistory || [])]
        : (prev.settlementHistory || []),
    }));

    setGameState((prev) => ({
      ...prev,
      gameNumber: prev.gameNumber + 1,
      round: 1,
      maxRounds: 30,
      character: null,
      inventory: {},
      drawnCount: {},
      flags: {},
      jokerSlots: { place: null, shoes: null, performance: null },
      reversedClockUsesRemaining: 3,
      stats: { ap: 15 },
      logs: [
        {
          round: 0,
          text: `順勢推進，開啟第 ${prev.gameNumber + 1} 局新探索！請抽取初始角色化身……`,
          type: 'milestone',
        },
      ],
      phase: 'CHOOSE_CHARACTER',
      revealedCard: null,
      currentDrawChoices: [],
      defeatReason: undefined,
      victoryType: undefined,
    }));
  };

  // Confirm AP Exhausted - forced CG end, transitions to NG (gameNumber + 1)
  const handleConfirmApExhausted = () => {
    const historyRecord: GameHistoryRecord = {
      gameNumber: gameState.gameNumber,
      characterName: gameState.character?.name || '未知',
      characterTitle: gameState.character?.title || '',
      characterIcon: gameState.character?.avatarIcon || '🪵',
      endRound: gameState.round,
      outcomeType: 'AP_DEPLETED',
      outcomeTitle: '體力耗盡 (重生增加局數處罰)',
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
      flags: {},
      jokerSlots: { place: null, shoes: null, performance: null },
      reversedClockUsesRemaining: 3,
      stats: { ap: 15 },
      logs: [
        {
          round: 0,
          text: `體力耗盡重整完畢，受到處罰局數+1，進入第 ${prev.gameNumber + 1} 局！請抽取命運化身……`,
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

  // Dynamic Progress Goal for Section B (回合資訊欄)
  const currentProgressGoal = useMemo(() => {
    if (gameState.phase === 'CHOOSE_CHARACTER') {
      return '命運迷霧・擇定化身';
    }
    if (gameState.flags['ready_for_general']) {
      return '決戰前夕・楚河漢界迎戰將軍';
    }
    if (gameState.flags['chaos_era_active']) {
      return '烽火亂世・追尋最後的戰役';
    }
    if (gameState.flags['dragon_awakened']) {
      return '龍魂覺醒・奔赴宿命對決';
    }

    // Beasts check for 太陽之子 route
    const beasts = ['印地安老斑鳩', '忍者', '半獸人', '龍戰騎士'];
    const defeatedBeasts = beasts.filter((b) => Boolean(gameState.flags[`defeat_${b}`]));
    if (defeatedBeasts.length > 0) {
      return `四方宿敵平定 (${defeatedBeasts.length}/4)・窺探亂世天機`;
    }

    // Great Work route check
    const ssCards = ['《杰倫》', '《范特西》', '《葉惠美》', '《跨時代》'];
    const heldSS = ssCards.filter((c) => Boolean(gameState.inventory[c]));
    if (heldSS.length > 0) {
      return `傳世神卡凝鍊中 (${heldSS.length}/4)`;
    }
    if (gameState.flags['castle_unlocked']) {
      return '古堡夜深・探尋夜訪者之謎';
    }

    // Family route check
    const familyMembers = ['外婆', '聽媽媽的話', '聽爸爸的話', '女兒殿下'];
    const heldFamily = familyMembers.filter((m) => Boolean(gameState.inventory[m]));
    if (heldFamily.length > 0) {
      return `血脈至親凝聚中 (${heldFamily.length}/4)`;
    }

    return '探索未知・順勢而為';
  }, [gameState.phase, gameState.flags, gameState.inventory]);

  // Time reversal with 反方向的鐘
  const handleRewindWithClock = () => {
    if (gameState.reversedClockUsesRemaining <= 0) return;
    const remaining = gameState.reversedClockUsesRemaining - 1;
    addLog(`【反方向的鐘發動】秒針逆時針飛轉！成功回溯至第 29 回合（剩餘 ${remaining} 次使用機會）！`, 'milestone');
    setGameState((prev) => ({
      ...prev,
      round: 29,
      phase: 'DRAW_THREE',
      reversedClockUsesRemaining: remaining,
      defeatReason: undefined,
    }));
    startNewRound(29);
  };

  const handleFullMemoryWipe = () => {
    // 傳奇殿堂的歷次評級戰績卡永久保存，不隨新周目清空！
    const preservedSettlements = meta.settlementHistory || [];

    const cleanMeta: MetaProgress = {
      unlockedCardIds: [],
      unlockedAchievements: [],
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
      flags: {},
      jokerSlots: { place: null, shoes: null, performance: null },
      reversedClockUsesRemaining: 3,
      stats: { ap: 15 },
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
    setShowWipeMemoryModal(false);
    setShowNewGamePlusModal(false);
    setShowCompendium(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0d] text-[#e0deda] font-sans antialiased flex flex-col items-center select-none overflow-x-hidden">
      {/* Top Universal App Header */}
      <header className="w-full bg-[#121215] border-b border-stone-800 px-6 py-3 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d4af37] to-amber-800 flex items-center justify-center text-black font-serif font-black text-base shadow-sm">
            跨
          </div>
          <div>
            <h1 className="text-sm font-black text-amber-100 tracking-wider font-serif">
              跨時代：周杰倫文字冒險
            </h1>
            <p className="text-[10px] text-stone-500 font-mono tracking-tight">
              JAY CHOU ROGUELIKE ADVENTURE
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* 全域圖鑑 */}
          <button
            id="compendium-btn"
            onClick={() => setShowCompendium(true)}
            className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-200 border border-amber-900/60 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <span>📜</span>
            <span>全域圖鑑</span>
            <span className="text-[10px] bg-amber-950 px-1.5 rounded text-amber-400 font-mono">
              {meta.unlockedCardIds.length}
            </span>
          </button>

          {/* (2) 傳奇殿堂：全通關取得戰績卡後方才解鎖顯示 */}
          {hasAchievedGrandSlam && (
            <button
              id="hall-of-fame-btn"
              onClick={() => setShowHallOfFame(true)}
              className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-300 border border-amber-800/80 hover:border-amber-500/80 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm animate-in fade-in"
              title="傳奇殿堂：查看每次全通關的評級戰績卡與歷史榮耀"
            >
              <span>🏛️</span>
              <span>傳奇殿堂</span>
            </button>
          )}

          {/* (1) 開啟新周目：全通關取得戰績卡後方才出現，供玩家重新挑戰更少局數 */}
          {hasAchievedGrandSlam && (
            <button
              id="start-new-cycle-btn"
              onClick={() => setShowNewGamePlusModal(true)}
              className="px-3 py-1.5 rounded-lg bg-stone-900/90 hover:bg-red-950/50 text-stone-300 hover:text-red-300 border border-stone-800 hover:border-red-900/70 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm animate-in fade-in"
              title="開啟新周目重新挑戰（傳奇殿堂戰績卡完整保留，以最少局數與回合挑戰巔峰成績）"
            >
              <span>🔄</span>
              <span>開啟新周目</span>
            </button>
          )}

          {/* 開發測試：同一次打開網頁只需輸入一次 1028 密碼 */}
          <button
            id="dev-mode-btn"
            onClick={() => {
              let authed = isDevAuthenticated;
              try {
                if (
                  typeof window !== 'undefined' &&
                  sessionStorage.getItem('jay_dev_auth_session') === 'true'
                ) {
                  authed = true;
                }
              } catch (e) {}

              if (authed) {
                setShowDevModal(true);
              } else {
                setDevPasswordInput('');
                setDevPasswordError('');
                setShowDevPasswordModal(true);
              }
            }}
            className="px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/80 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1"
            title="開發者測試控制台（密碼 1028，本網頁開啟期間只需輸入一次）"
          >
            <span>🔧</span>
            <span>開發測試</span>
          </button>

          <button
            id="restart-game-btn"
            onClick={handleRestartCurrentGame}
            title="測試功能：重新開始當前局（保持當前局數，重返第 1 回合）"
            className="hidden sm:flex px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-amber-200 border border-stone-800 text-xs font-medium transition-all cursor-pointer"
          >
            重啟當前局 (測試)
          </button>
        </div>
      </header>

      {/* Main Three-Column Viewport: Left(A+D), Center(B+C), Right(E) */}
      <main className="w-full max-w-[1680px] flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 p-4 lg:p-6 items-start">
        {/* ======================================================== */}
        {/* LEFT COLUMN: A.當前化身 + D.行囊狀態 */}
        {/* ======================================================== */}
        <div className="lg:col-span-3 xl:col-span-3 flex flex-col gap-4 w-full">
          {/* A. 角色欄 (當前化身) */}
          <CharacterPanel
            character={gameState.character}
            stats={gameState.stats}
            jokerSlots={gameState.jokerSlots}
            inventory={gameState.inventory}
            onEquipJokerSlot={handleEquipJoker}
            onUnequipJokerSlot={handleUnequipJoker}
          />

          {/* D. 行囊狀態 (置於角色欄下方) */}
          <InventoryGrid inventory={gameState.inventory} />
        </div>

        {/* ======================================================== */}
        {/* CENTER COLUMN: B.回合資訊欄 + C.中央舞台 */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col gap-4 w-full">
          {/* B. 回合資訊欄: Strictly Chinese "第 X 局 - 第 Y 回合 / 30" */}
          <div className="w-full bg-[#141417] border border-stone-800 rounded-xl px-5 py-3.5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-base lg:text-lg font-black text-[#d4af37] font-serif tracking-wider">
                {gameState.phase === 'CHOOSE_CHARACTER'
                  ? `第 ${gameState.gameNumber} 局 - 命運抉擇（盲抽化身）`
                  : `第 ${gameState.gameNumber} 局 - 第 ${gameState.round} 回合 / ${gameState.maxRounds}`}
              </span>
              {gameState.flags['chaos_era_active'] && (
                <span className="text-[10px] bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 rounded font-mono font-bold animate-pulse">
                  烽火・亂舞春秋時代
                </span>
              )}
            </div>

            <div className="text-xs text-stone-400 font-sans flex items-center gap-2">
              <span>進程目標：</span>
              <span className="text-amber-200/90 font-medium font-serif">
                {currentProgressGoal}
              </span>
            </div>
          </div>

          {/* C. 中央舞台 */}
          <div className="w-full min-h-[460px] bg-[#101014] border border-stone-800/80 rounded-2xl p-6 flex flex-col items-center justify-center relative shadow-inner overflow-hidden">
            {/* Phase 1: 盲抽初始角色 (Lottery Draw) */}
            {gameState.phase === 'CHOOSE_CHARACTER' && (
              <div className="w-full flex flex-col items-center gap-6 text-center animate-in fade-in duration-300">
                <div>
                  <h2 className="text-xl font-black text-amber-200 font-serif">
                    命運之門已開啟・請抽取初始化身
                  </h2>
                  <p className="text-xs text-stone-400 mt-1">
                    三張神秘命運之簽懸浮於虛空之中，點選其中一張抽取你本局的命運化身
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 sm:gap-6 w-full max-w-lg justify-items-center">
                  {[0, 1, 2].map((idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        // Randomly draw an initial selectable character
                        const randomIndex = Math.floor(Math.random() * INITIAL_SELECTABLE_CHARACTERS.length);
                        const drawnChar = INITIAL_SELECTABLE_CHARACTERS[randomIndex];
                        setPendingCharacter(drawnChar);
                        setShowCharConfirmModal(true);
                      }}
                      className="group w-28 sm:w-36 h-44 sm:h-52 rounded-xl bg-gradient-to-b from-[#1c1b22] via-[#141318] to-[#0c0c10] border-2 border-stone-800 hover:border-[#d4af37] p-3 flex flex-col items-center justify-between shadow-lg hover:shadow-[0_0_20px_rgba(212,175,55,0.25)] transition-all transform hover:-translate-y-1.5 cursor-pointer relative overflow-hidden active:scale-95"
                    >
                      <div className="w-full flex justify-between items-center text-[10px] text-stone-500 font-serif">
                        <span>✦</span>
                        <span>✦</span>
                      </div>

                      <div className="w-14 h-14 rounded-full border border-stone-700/80 group-hover:border-[#d4af37] flex items-center justify-center bg-black/40 group-hover:bg-[#d4af37]/10 transition-colors">
                        <span className="text-stone-400 group-hover:text-amber-200 font-serif text-lg font-bold">
                          ？
                        </span>
                      </div>

                      <div className="flex flex-col items-center">
                        <span className="text-xs font-bold text-stone-300 group-hover:text-amber-200 font-serif">
                          抽取化身
                        </span>
                        <span className="text-[9px] text-stone-500 mt-0.5">
                          點擊盲抽
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Phase 2: Draw Three Cards (Tarot Mystery Cards) */}
            {gameState.phase === 'DRAW_THREE' && (
              <div className="w-full flex flex-col items-center gap-6 text-center animate-in fade-in duration-200">
                <div className="-mt-2 flex flex-col items-center">
                  <h2 className="text-xl sm:text-2xl font-black text-amber-200 font-serif tracking-wider">
                    命運牌堆已洗牌完畢
                  </h2>
                  <p className="text-sm text-stone-400 mt-1 font-sans">
                    請點選其中一張覆蓋卡牌盲抽（僅公開所選卡牌，未選中者保持覆蓋）
                  </p>
                </div>

                <div className="w-full max-w-2xl grid grid-cols-3 gap-3 sm:gap-6 px-2 justify-items-center">
                  {gameState.currentDrawChoices.map((choiceCard, idx) => (
                    <MysteryCard
                      key={choiceCard.id}
                      index={idx}
                      onClick={() => handleDrawCard(choiceCard)}
                      isMagicVision={gameState.character?.name === '魔術先生'}
                      cardHintType={choiceCard.type}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Phase 3: Revealed Card Display */}
            {gameState.phase === 'REVEAL_CARD' && gameState.revealedCard && (
              <CardDisplay
                card={gameState.revealedCard}
                gameState={gameState}
                onSelectOption={handleSelectOption}
              />
            )}

            {/* Phase 4: Boss Battle with 將軍 (Round 30) */}
            {gameState.phase === 'BOSS_BATTLE' && (
              <BossBattleView
                gameState={gameState}
                onVictory={(type) => {
                  const totalRoundsNow = (meta.totalRoundsPlayed || 0) + gameState.round;
                  const record: RouteVictoryRecord = {
                    route: type,
                    gameNumber: gameState.gameNumber,
                    round: gameState.round,
                    totalRounds: totalRoundsNow,
                    timestamp: new Date().toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' }),
                    characterName: gameState.character?.name || '未知',
                  };
                  setGameState((prev) => ({
                    ...prev,
                    victoryType: type,
                    phase: 'GAME_OVER',
                  }));
                  setMeta((prev) => ({
                    ...prev,
                    victories: Array.from(new Set([...prev.victories, type])),
                    routeVictoryRecords: {
                      ...(prev.routeVictoryRecords || {}),
                      [type]: prev.routeVictoryRecords?.[type] || record,
                    },
                  }));
                }}
                onDefeat={(reason) => {
                  setGameState((prev) => ({
                    ...prev,
                    defeatReason: reason,
                    phase: 'GAME_OVER',
                  }));
                }}
                onRewindWithClock={handleRewindWithClock}
                onAddLog={addLog}
              />
            )}

            {/* Phase 5: Game Over / Victory Modal */}
            {gameState.phase === 'GAME_OVER' && (
              <GameOverModal
                gameState={gameState}
                meta={meta}
                onRestartNewGame={handleStartNextGame}
                onRewindWithClock={handleRewindWithClock}
                onTriggerJayQuote={triggerJayQuote}
              />
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: E.冒險日誌 (獨立置於右側，加寬以減少折行) */}
        {/* ======================================================== */}
        <div className="lg:col-span-4 xl:col-span-4 flex flex-col gap-4 w-full">
          <AdventureLog logs={gameState.logs} />
        </div>
      </main>

      {/* Compendium Modal */}
      {showCompendium && (
        <CompendiumModal
          meta={meta}
          gameState={gameState}
          onClose={() => setShowCompendium(false)}
          onStoreInIronBox={handleStoreIronBox}
          onTakeFromIronBox={handleTakeIronBox}
        />
      )}

      {/* Developer Test Modal - Password Guard */}
      {showDevPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#141418] border-2 border-stone-800 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-stone-900 border border-stone-700 flex items-center justify-center mx-auto text-xl text-amber-300">
              🔒
            </div>

            <div>
              <h3 className="text-base font-bold text-amber-200 font-serif">
                開發者測試模式・通行驗證
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                請輸入 4 位授權通行密碼以開啟測試面板
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (devPasswordInput.trim() === '1028') {
                  setIsDevAuthenticated(true);
                  try {
                    sessionStorage.setItem('jay_dev_auth_session', 'true');
                  } catch (err) {}
                  setShowDevPasswordModal(false);
                  setShowDevModal(true);
                  setDevPasswordError('');
                  setDevPasswordInput('');
                } else {
                  setDevPasswordError('密碼錯誤，拒絕存取');
                }
              }}
              className="flex flex-col gap-3"
            >
              <input
                id="dev-password-input"
                type="password"
                maxLength={8}
                value={devPasswordInput}
                onChange={(e) => {
                  setDevPasswordInput(e.target.value);
                  setDevPasswordError('');
                }}
                autoFocus
                placeholder="請輸入通行密碼"
                className="w-full text-center tracking-widest text-lg font-mono py-2.5 px-4 rounded-xl bg-black/60 border border-stone-700 focus:border-amber-400 focus:outline-none text-amber-100 placeholder:text-stone-600 placeholder:text-sm placeholder:tracking-normal"
              />

              {devPasswordError && (
                <p className="text-xs text-red-400 font-mono font-medium animate-pulse">
                  {devPasswordError}
                </p>
              )}

              <div className="flex gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDevPasswordModal(false);
                    setDevPasswordInput('');
                    setDevPasswordError('');
                  }}
                  className="flex-1 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold transition-all cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
                >
                  確認進入
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Developer Test Modal */}
      {showDevModal && (
        <DevModal
          currentRound={gameState.round}
          currentGameNumber={gameState.gameNumber}
          currentAp={gameState.stats.ap}
          onClose={() => setShowDevModal(false)}
          onForceDrawCard={(card) => {
            handleDrawCard(card);
            setShowDevModal(false);
          }}
          onAddItem={(item) => {
            setGameState((prev) => ({
              ...prev,
              inventory: {
                ...prev.inventory,
                [item]: (prev.inventory[item] || 0) + 1,
              },
            }));
            addLog(`【開發者指令】獲取道具【${item}】。`, 'milestone');
          }}
          onAddMultipleItems={(items) => {
            setGameState((prev) => {
              const nextInv = { ...prev.inventory };
              items.forEach((it) => {
                nextInv[it] = (nextInv[it] || 0) + 1;
              });
              return { ...prev, inventory: nextInv };
            });
            addLog(`【開發者指令】批量獲取套裝道具：${items.join('、')}。`, 'milestone');
          }}
          onClearInventory={() => {
            setGameState((prev) => ({
              ...prev,
              inventory: {},
            }));
            addLog('【開發者指令】已清空行囊物品。', 'milestone');
          }}
          onChangeCharacter={(charId) => {
            const char = ALL_CHARACTERS.find((c) => c.id === charId);
            if (char) {
              setGameState((prev) => ({ ...prev, character: char }));
              addLog(`【開發者指令】化身切換為【${char.name}】。`, 'milestone');
            }
          }}
          onSetRoundAndGame={(r, g) => {
            setGameState((prev) => ({ ...prev, round: r, gameNumber: g }));
            setMeta((prev) => ({
              ...prev,
              pastGamesCount: Math.max(prev.pastGamesCount, g),
            }));
            addLog(`【開發者指令】進度跳轉設定為：第 ${g} 局、第 ${r} 回合。`, 'milestone');
          }}
          onSetAp={(ap) => {
            setGameState((prev) => ({
              ...prev,
              stats: { ...prev.stats, ap: Math.max(0, ap) },
            }));
            addLog(`【開發者指令】AP 體力調節為 ${ap}。`, 'milestone');
          }}
          onTriggerBoss={() => {
            setGameState((prev) => ({
              ...prev,
              round: 30,
              flags: { ...prev.flags, ready_for_general: true },
              phase: 'BOSS_BATTLE',
            }));
            addLog('【開發者指令】直接觸發第 30 回合決戰【將軍】！', 'milestone');
          }}
          onTriggerVictory={(type) => {
            const totalRoundsNow = (meta.totalRoundsPlayed || 0) + gameState.round;
            const record: RouteVictoryRecord = {
              route: type,
              gameNumber: gameState.gameNumber,
              round: gameState.round,
              totalRounds: totalRoundsNow,
              timestamp: new Date().toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' }),
              characterName: gameState.character?.name || '音樂冒險者',
            };
            setGameState((prev) => ({
              ...prev,
              victoryType: type,
              phase: 'GAME_OVER',
            }));
            setMeta((prev) => ({
              ...prev,
              victories: Array.from(new Set([...prev.victories, type])),
              routeVictoryRecords: {
                ...(prev.routeVictoryRecords || {}),
                [type]: record,
              },
            }));
            setShowDevModal(false);
            addLog(`【開發者指令】強制觸發【${type}】傳奇勝利！`, 'milestone');
          }}
          onTriggerGrandSlam={() => {
            const currentTotal = (meta.totalRoundsPlayed || 0) + gameState.round;
            const today = new Date().toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' });
            const charName = gameState.character?.name || '音樂冒險者';
            const newRecords: Record<string, RouteVictoryRecord> = {
              '太陽之子': {
                route: '太陽之子',
                gameNumber: Math.max(1, gameState.gameNumber - 2),
                round: 30,
                totalRounds: Math.max(30, currentTotal - 15),
                timestamp: today,
                characterName: charName,
              },
              '最偉大的作品': {
                route: '最偉大的作品',
                gameNumber: Math.max(2, gameState.gameNumber - 1),
                round: 22,
                totalRounds: Math.max(52, currentTotal - 8),
                timestamp: today,
                characterName: charName,
              },
              '周杰倫家庭': {
                route: '周杰倫家庭',
                gameNumber: gameState.gameNumber,
                round: gameState.round,
                totalRounds: currentTotal,
                timestamp: today,
                characterName: charName,
              },
            };
            setGameState((prev) => ({
              ...prev,
              victoryType: '全路線大滿貫',
              phase: 'GAME_OVER',
            }));
            setMeta((prev) => ({
              ...prev,
              victories: ['太陽之子', '最偉大的作品', '周杰倫家庭'],
              routeVictoryRecords: newRecords,
            }));
            setShowDevModal(false);
            addLog('【開發者指令】直接觸發【全路線大滿貫】終極大結局！', 'milestone');
          }}
          onUnlockAllSongs={() => {
            const allSongIds = CARD_DATABASE.filter((c) => c.id.startsWith('C')).map((c) => c.id);
            setMeta((prev) => ({
              ...prev,
              unlockedCardIds: Array.from(new Set([...(prev.unlockedCardIds || []), ...allSongIds])),
            }));
            addLog('【開發者指令】全數 63 首歌曲圖鑑已解鎖！', 'milestone');
          }}
          onUnlockAllAchievements={() => {
            const allAchIds = ALL_ACHIEVEMENTS.map((a) => a.id);
            setMeta((prev) => ({
              ...prev,
              unlockedAchievements: allAchIds,
            }));
            addLog('【開發者指令】全數 9 大傳奇成就已解鎖！', 'milestone');
          }}
          onClearHallOfFame={() => {
            setMeta((prev) => {
              const updated = {
                ...prev,
                settlementHistory: [],
              };
              localStorage.setItem(STORAGE_KEY_META, JSON.stringify(updated));
              return updated;
            });
            addLog('【開發者指令】傳奇殿堂戰績卡已全部清空！', 'milestone');
          }}
          onTestDrawChopin={() => {
            const chopin = ALL_CHARACTERS.find((c) => c.id === 'char_chopin');
            if (chopin) {
              setPendingCharacter(chopin);
              setShowCharConfirmModal(true);
            }
          }}
        />
      )}

      {/* Hall of Fame Modal (傳奇殿堂・歷次結算戰績卡) */}
      <HallOfFameModal
        isOpen={showHallOfFame}
        onClose={() => setShowHallOfFame(false)}
        meta={meta}
        gameState={gameState}
      />

      {/* 開啟新周目 / Universal Memory Wipe Modal */}
      {(showNewGamePlusModal || showWipeMemoryModal) && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-gradient-to-b from-[#1c1414] via-[#140e0e] to-[#0a0707] border-2 border-red-700/80 rounded-2xl p-6 shadow-[0_0_40px_rgba(220,38,38,0.3)] flex flex-col gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-red-950/60 border border-red-600 flex items-center justify-center mx-auto text-2xl text-red-400 shadow-inner">
              🔄
            </div>

            <div>
              <h3 className="text-lg font-black text-red-300 font-serif">
                開啟新周目・重新挑戰
              </h3>
              <p className="text-xs text-stone-300 mt-2 font-sans leading-relaxed">
                確定要開啟新周目重新挑戰嗎？
                <br />
                <span className="text-amber-300 font-bold">
                  為確保挑戰的純粹性與成績的公平真實，開啟新周目將會【全數清空】所有紀錄！
                </span>
              </p>
            </div>

            <div className="bg-black/60 border border-stone-800 rounded-xl p-3.5 text-left text-xs text-stone-400 space-y-2 font-sans">
              <div className="flex items-center gap-2 text-amber-300 font-bold bg-amber-950/40 p-2 rounded-lg border border-amber-700/60">
                <span className="text-base text-amber-400">🛡️</span>
                <span>【傳奇殿堂戰績卡永久保存】過往所有已獲得的全通關評級戰績將完整珍藏，不會丟失！</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-400 font-bold">✕</span>
                <span>已解鎖歌曲圖鑑全數歸零 (0/63)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-400 font-bold">✕</span>
                <span>各主線通關進度重新開始</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-400 font-bold">✕</span>
                <span>全域成就與特質加成重新挑戰</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-400 font-bold">✕</span>
                <span>當前行囊道具與鐵盒遺物清空</span>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-stone-800 text-amber-300/90 font-sans">
                <span>✦</span>
                <span>重返第 1 局最初起點，以更少局數衝刺更高的綜合評級！</span>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                id="cancel-new-cycle-btn"
                onClick={() => {
                  setShowNewGamePlusModal(false);
                  setShowWipeMemoryModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold transition-all cursor-pointer"
              >
                取消保留
              </button>
              <button
                id="confirm-new-cycle-btn"
                onClick={() => {
                  setShowNewGamePlusModal(false);
                  setShowWipeMemoryModal(false);
                  handleFullMemoryWipe();
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-900/90 hover:bg-red-700 text-white text-xs font-black border border-red-600 transition-all cursor-pointer shadow-md active:scale-98"
              >
                確認開啟新周目
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Character Confirmation Modal (抽角色 -> 跳出角色確認視窗告知玩家 -> 冒險開始按鈕) */}
      {showCharConfirmModal && pendingCharacter && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* If SS-rank 11月的蕭邦, wrap in special radiant aura */}
          <div className="relative w-full max-w-md">
            {pendingCharacter.id === 'char_chopin' && (
              <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 opacity-75 blur-xl animate-pulse pointer-events-none" />
            )}

            <div
              className={`relative w-full bg-gradient-to-b ${
                pendingCharacter.id === 'char_chopin'
                  ? 'from-[#2e240e] via-[#1a150b] to-[#0d0a06] border-2 border-amber-400 shadow-[0_0_50px_rgba(245,158,11,0.6)]'
                  : 'from-[#1b1a20] via-[#141318] to-[#0c0c10] border-2 border-[#d4af37]/80 shadow-2xl'
              } rounded-2xl p-6 flex flex-col items-center text-center gap-4`}
            >
              <div className="w-full flex items-center justify-between border-b border-stone-800 pb-2">
                <span className="text-xs text-[#d4af37] font-mono tracking-widest uppercase font-bold flex items-center gap-1.5">
                  {pendingCharacter.id === 'char_chopin' ? (
                    <>
                      <span className="animate-spin text-amber-300">✨</span>
                      <span>✦ 極稀有 SS 角色降臨 ✦</span>
                      <span className="animate-spin text-amber-300">✨</span>
                    </>
                  ) : (
                    '✦ 命運之簽覺醒 ✦'
                  )}
                </span>
                <span className="text-[10px] text-stone-500 font-mono">
                  {pendingCharacter.id === 'char_chopin' ? 'SS RANK UNLOCKED' : 'CHARACTER CONFIRMATION'}
                </span>
              </div>

              {pendingCharacter.id === 'char_chopin' && (
                <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold font-serif animate-bounce">
                  <span>🎹</span>
                  <span>夜曲奏鳴・十一月的浪漫琴音穿透時空！</span>
                  <span>🎵</span>
                </div>
              )}

              <div
                className={`${
                  pendingCharacter.id === 'char_chopin'
                    ? 'w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 ring-4 ring-amber-400/50 shadow-[0_0_35px_rgba(251,191,36,0.9)] animate-pulse'
                    : 'w-20 h-20 rounded-2xl bg-gradient-to-br ' + pendingCharacter.avatarColor + ' shadow-xl'
                } flex items-center justify-center border border-white/30 my-1`}
              >
                <CharacterAvatarIcon
                  character={pendingCharacter}
                  size={pendingCharacter.id === 'char_chopin' ? 'xl' : 'lg'}
                />
              </div>

              <div>
                <div className="flex items-center justify-center gap-2">
                  <h3
                    className={`text-2xl font-black font-serif ${
                      pendingCharacter.id === 'char_chopin'
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-amber-300 to-yellow-200'
                        : 'text-amber-100'
                    }`}
                  >
                    {pendingCharacter.name}
                  </h3>
                  {pendingCharacter.id === 'char_chopin' && (
                    <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                      SS RANK
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#d4af37] mt-1 font-sans font-medium">
                  {pendingCharacter.title}
                </p>
              </div>

              <div className="w-full bg-black/40 border border-stone-800 rounded-xl p-3.5 text-xs text-stone-300 leading-relaxed text-left font-sans">
                {pendingCharacter.description}
              </div>

              {pendingCharacter.specialTrait && (
                <div
                  className={`w-full ${
                    pendingCharacter.id === 'char_chopin'
                      ? 'bg-amber-950/50 border-2 border-amber-600/80 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                      : 'bg-amber-950/30 border border-amber-900/60'
                  } rounded-xl p-3 text-xs text-amber-200 text-left font-sans flex items-start gap-2`}
                >
                  <span className="shrink-0 text-amber-400 font-bold">天賦：</span>
                  <span className="leading-relaxed">{pendingCharacter.specialTrait}</span>
                </div>
              )}

              <button
                id="confirm-start-adventure-btn"
                onClick={() => {
                  setShowCharConfirmModal(false);
                  handleSelectCharacter(pendingCharacter);
                  setPendingCharacter(null);
                }}
                className={`w-full py-3 rounded-xl ${
                  pendingCharacter.id === 'char_chopin'
                    ? 'bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 text-stone-950 font-black shadow-[0_0_25px_rgba(251,191,36,0.7)] animate-pulse'
                    : 'bg-gradient-to-r from-amber-600 via-[#d4af37] to-amber-500 text-stone-950 font-black shadow-[0_4px_18px_rgba(212,175,55,0.35)]'
                } text-sm tracking-wider hover:brightness-110 transition-all cursor-pointer mt-2 active:scale-98`}
              >
                {pendingCharacter.id === 'char_chopin'
                  ? '奏響琴弦・傳奇啟程！'
                  : '確認化身・冒險開始！'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Linkage Transition Modal (事件連動包含抽到A卡連動到B卡，跳出確認視窗說明發生效果與按鈕) */}
      {pendingEventTransition && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-gradient-to-b from-[#1c1822] via-[#14121a] to-[#0c0a10] border-2 border-purple-500/80 rounded-2xl p-6 shadow-[0_0_40px_rgba(168,85,247,0.3)] flex flex-col items-center text-center gap-4">
            <div className="w-full flex items-center justify-between border-b border-purple-900/60 pb-2">
              <span className="text-xs text-purple-300 font-mono tracking-widest uppercase font-bold flex items-center gap-1">
                <span>✦</span>
                <span>劇情連動觸發</span>
                <span>✦</span>
              </span>
              <span className="text-[10px] text-stone-500 font-mono">
                EVENT LINKAGE
              </span>
            </div>

            {/* Sequence flow indication */}
            <div className="flex items-center gap-2 text-xs font-serif bg-black/50 px-4 py-2 rounded-xl border border-purple-900/50">
              <span className="text-stone-300 font-bold">
                【{pendingEventTransition.sourceCardName}】
              </span>
              <span className="text-purple-400 font-bold">➔</span>
              <span className="text-amber-300 font-bold">
                【{pendingEventTransition.targetCard.name}】
              </span>
            </div>

            {/* Narrative explanation */}
            <div className="w-full bg-purple-950/20 border border-purple-900/40 rounded-xl p-4 text-xs text-purple-100 leading-relaxed text-left font-sans">
              <p className="font-medium text-stone-200 mb-2">
                {pendingEventTransition.effectNarrative}
              </p>
              <p className="text-[11px] text-stone-400 border-t border-purple-900/30 pt-2 font-mono">
                ※ 時序流轉至第 {Math.min(30, pendingEventTransition.nextRound)} 回合，宿命引領你直接邁入下一張連動卡牌！
              </p>
            </div>

            <button
              id="confirm-event-transition-btn"
              onClick={() => {
                const trans = pendingEventTransition;
                setPendingEventTransition(null);

                const finalRound = Math.min(30, trans.nextRound);
                addLog(
                  `【事件連動】時空流轉至第 ${finalRound} 回合，直接遭遇【${trans.targetCard.name}】！`,
                  'milestone'
                );

                setGameState((prev) => ({
                  ...prev,
                  round: finalRound,
                  inventory: trans.nextInventory,
                  flags: trans.nextFlags,
                  stats: trans.nextStats,
                  character: trans.nextCharacter,
                  revealedCard: trans.targetCard,
                  phase: 'REVEAL_CARD',
                }));

                checkAchievements(trans.nextInventory);
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-700 hover:brightness-110 text-white font-black text-sm tracking-wider shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all cursor-pointer active:scale-98"
            >
              下回合進入【{pendingEventTransition.targetCard.name}】
            </button>
          </div>
        </div>
      )}

      {/* AP Exhausted Modal (體力歸0，失敗處罰：局數+1，物品清空，保留圖鑑與回憶) */}
      {showApExhaustedModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-gradient-to-b from-[#240e0e] via-[#170a0a] to-[#0d0505] border-2 border-red-700/80 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-red-950/60 border-2 border-red-600 flex items-center justify-center text-3xl shadow-[0_0_25px_rgba(239,68,68,0.35)]">
              ⚡
            </div>

            <div>
              <h3 className="text-xl font-black text-white font-serif tracking-wider">
                體力耗盡・冒險失敗重生
              </h3>
              <p className="text-xs text-red-300/80 font-mono mt-1 uppercase">
                STAMINA DEPLETED・FAILURE PENALTY APPLIED
              </p>
            </div>

            <div className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans bg-black/50 border border-stone-800 rounded-xl p-4 text-left space-y-2">
              <p>
                此局體力已耗盡！你的身體已達極限，不得不就地重整。請重生進入下一局（<span className="text-amber-300 font-bold">行囊物品清空</span>，但<span className="text-amber-300 font-bold">全域歌曲圖鑑與歷史成就將永久保留</span>）。
              </p>
              <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-900/60 text-red-200 text-xs font-sans">
                ⚠️ <span className="font-bold">失敗處罰機制</span>：本次體力耗盡導致重生，使你的【總結算局數 +1】。局數越少代表最終通關成績越好；若頻繁耗盡體力，累積過多局數將嚴重拉低最終通關評級！
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-2 text-xs font-mono bg-black/40 border border-stone-800 rounded-xl p-3">
              <div className="text-stone-400">力竭局數：<span className="text-stone-200 font-bold">第 {gameState.gameNumber} 局</span></div>
              <div className="text-stone-400">處罰後局數：<span className="text-red-400 font-bold">第 {gameState.gameNumber + 1} 局</span></div>
            </div>

            <button
              id="confirm-ap-depleted-btn"
              onClick={handleConfirmApExhausted}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-amber-700 text-white font-bold text-sm tracking-wider hover:brightness-110 transition-all shadow-[0_4px_18px_rgba(239,68,68,0.35)] cursor-pointer mt-1 active:scale-98"
            >
              確認重生・進入第 {gameState.gameNumber + 1} 局
            </button>
          </div>
        </div>
      )}

      {/* Outcome Confirmation Modal (獲得物品、事件效果、裝備結果彈出確認視窗) */}
      {outcomeModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-gradient-to-b from-[#1c1a22] via-[#14131a] to-[#0c0c12] border-2 border-amber-600/70 rounded-2xl p-6 shadow-[0_0_40px_rgba(217,119,6,0.35)] flex flex-col items-center text-center gap-4">
            <div className="w-full flex items-center justify-between border-b border-stone-800 pb-2">
              <span className="text-xs text-amber-400 font-mono tracking-widest uppercase font-bold flex items-center gap-1.5">
                <span>✦</span>
                <span>{outcomeModal.title}</span>
                <span>✦</span>
              </span>
              <span className="text-[10px] text-stone-500 font-mono">
                OUTCOME
              </span>
            </div>

            {outcomeModal.icon && (
              <div className="w-14 h-14 rounded-2xl bg-amber-950/40 border border-amber-700/60 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(245,158,11,0.2)] my-1">
                <span>{outcomeModal.icon}</span>
              </div>
            )}

            {outcomeModal.subtitle && (
              <p className="text-xs text-amber-200/90 font-serif font-bold">
                {outcomeModal.subtitle}
              </p>
            )}

            {/* Narrative text */}
            <div className="w-full bg-black/50 border border-stone-800/80 rounded-xl p-4 text-xs text-stone-200 leading-relaxed text-left font-sans">
              {outcomeModal.narrative}
            </div>

            {/* Badges for rewards / items gained / consumed */}
            {outcomeModal.badges && outcomeModal.badges.length > 0 && (
              <div className="w-full flex flex-wrap gap-2 justify-center">
                {outcomeModal.badges.map((b, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700/80 text-xs"
                  >
                    <span className="text-stone-400 text-[11px] font-sans">{b.label}：</span>
                    <span className={`font-bold font-serif ${b.color || 'text-amber-300'}`}>
                      {b.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              id="confirm-outcome-modal-btn"
              onClick={outcomeModal.onConfirm}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 via-[#d4af37] to-amber-500 text-stone-950 font-black text-sm tracking-wider hover:brightness-110 transition-all shadow-[0_4px_18px_rgba(212,175,55,0.35)] cursor-pointer mt-2 active:scale-98"
            >
              {outcomeModal.confirmText || '確定'}
            </button>
          </div>
        </div>
      )}

      {/* 周董經典語錄浮動彩蛋 */}
      <JayQuoteEasterEgg quote={jayQuote} onDismiss={() => setJayQuote(null)} />
    </div>
  );
}
