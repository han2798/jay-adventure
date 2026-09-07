import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  GameState,
  MetaProgress,
  CardDefinition,
  JokerEquipment,
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
      stats: { hp: 20, atk: 5 },
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
  const [showDevModal, setShowDevModal] = useState<boolean>(false);

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

      for (let i = 0; i < 3; i++) {
        if (pool.length === 0) break;
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

        // If round exceeded 30 without victory, trigger game over
        if (targetRound > 30) {
          return {
            ...nextState,
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

    const nextInventory = { ...gameState.inventory };
    const nextFlags = { ...gameState.flags };
    let nextStats = { ...gameState.stats };
    let nextCharacter = gameState.character;
    let nextVictory = gameState.victoryType;
    let nextDefeat = gameState.defeatReason;
    let nextRound = gameState.round + 1;

    // Apply effects
    if (option.effect) {
      const eff = option.effect;

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

      if (eff.hpChange) {
        nextStats.hp = Math.max(1, nextStats.hp + eff.hpChange);
      }

      if (eff.atkChange) {
        nextStats.atk += eff.atkChange;
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

      // Time Travel Rewind logic
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

      // Force Next Card Encounter
      if (eff.forceNextCardId) {
        const nextCard = CARD_DATABASE.find((c) => c.id === eff.forceNextCardId);
        if (nextCard) {
          addLog(`劇情觸發連動！下一回合將直接遭遇【${nextCard.name}】！`, 'milestone');
          setGameState((prev) => ({
            ...prev,
            round: nextRound,
            inventory: nextInventory,
            flags: nextFlags,
            stats: nextStats,
            character: nextCharacter,
            revealedCard: nextCard,
            phase: 'REVEAL_CARD',
          }));
          checkAchievements(nextInventory);
          return;
        }
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

    if (nextVictory) {
      setGameState((prev) => ({
        ...prev,
        inventory: nextInventory,
        flags: nextFlags,
        character: nextCharacter,
        stats: nextStats,
        victoryType: nextVictory,
        phase: 'GAME_OVER',
      }));
      setMeta((prev) => ({
        ...prev,
        victories: Array.from(new Set([...prev.victories, nextVictory!])),
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

    // Advance to next round draw
    startNewRound(nextRound, {
      inventory: nextInventory,
      flags: nextFlags,
      character: nextCharacter,
      stats: nextStats,
    });
  };

  // Joker puzzle equipment slot handler
  const handleEquipJoker = (slot: keyof JokerEquipment, itemName: string) => {
    setGameState((prev) => {
      const nextSlots = { ...prev.jokerSlots, [slot]: itemName };
      const nextInv = { ...prev.inventory };
      nextInv[itemName] = Math.max(0, (nextInv[itemName] || 1) - 1);

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
      } else {
        addLog(`喬克叔叔填入了裝備【${itemName}】。`, 'action');
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
      return { ...prev, inventory: nextInv };
    });
    setMeta((prev) => ({
      ...prev,
      ironBoxItems: [...prev.ironBoxItems, itemName],
    }));
    addLog(`將【${itemName}】放入半島鐵盒，將可跨局傳承至下一局！`, 'action');
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
      stats: { hp: 20, atk: 5 },
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
    setMeta((prev) => ({
      ...prev,
      pastGamesCount: prev.pastGamesCount + 1,
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
      stats: { hp: 20, atk: 5 },
      logs: [
        {
          round: 0,
          text: `開啟第 ${prev.gameNumber + 1} 局新探索！請抽取初始角色化身……`,
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

  const handleResetMeta = () => {
    localStorage.removeItem(STORAGE_KEY_META);
    setMeta({
      unlockedCardIds: [],
      unlockedAchievements: [],
      unlockedDiaries: [],
      ironBoxItems: [],
      pastGamesCount: 1,
      victories: [],
      nextGameFlags: {},
    });
    addLog('已重置全域圖鑑與存檔記錄（歸零為 0 張）。', 'warning');
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
        <div className="flex items-center gap-2.5">
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

          <button
            id="dev-mode-btn"
            onClick={() => setShowDevModal(true)}
            className="px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/80 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1"
          >
            <span>🔧</span>
            <span>開發測試</span>
          </button>

          <button
            id="restart-game-btn"
            onClick={handleRestartCurrentGame}
            title="測試功能：重新開始當前局（保持當前局數，重返第 1 回合）"
            className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-amber-200 border border-stone-800 text-xs font-medium transition-all cursor-pointer"
          >
            重啟當前局 (測試)
          </button>
        </div>
      </header>

      {/* Main Three-Column Viewport: Left(A+D), Center(B+C), Right(E) */}
      <main className="w-full max-w-[1500px] flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 p-4 lg:p-6 items-start">
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
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col gap-4 w-full">
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
                        handleSelectCharacter(drawnChar);
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
                  setGameState((prev) => ({
                    ...prev,
                    victoryType: type,
                    phase: 'GAME_OVER',
                  }));
                  setMeta((prev) => ({
                    ...prev,
                    victories: Array.from(new Set([...prev.victories, type])),
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
                onRestartNewGame={handleStartNextGame}
                onRewindWithClock={handleRewindWithClock}
              />
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: E.冒險日誌 (獨立置於右側) */}
        {/* ======================================================== */}
        <div className="lg:col-span-3 xl:col-span-3 flex flex-col gap-4 w-full">
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
          onResetMeta={handleResetMeta}
        />
      )}

      {/* Developer Test Modal */}
      {showDevModal && (
        <DevModal
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
          onChangeCharacter={(charId) => {
            const char = ALL_CHARACTERS.find((c) => c.id === charId);
            if (char) {
              setGameState((prev) => ({ ...prev, character: char }));
              addLog(`【開發者指令】化身切換為【${char.name}】。`, 'milestone');
            }
          }}
          onSetRound={(r) => {
            setGameState((prev) => ({ ...prev, round: r }));
            addLog(`【開發者指令】回合調整為第 ${r} 回合。`, 'milestone');
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
            setGameState((prev) => ({
              ...prev,
              victoryType: type,
              phase: 'GAME_OVER',
            }));
            setMeta((prev) => ({
              ...prev,
              victories: Array.from(new Set([...prev.victories, type])),
            }));
            addLog(`【開發者指令】強制觸發【${type}】傳奇勝利！`, 'milestone');
          }}
        />
      )}
    </div>
  );
}
