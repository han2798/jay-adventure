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
  LogEntry,
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
import { BlacksmithModal } from './components/BlacksmithModal';
import { CardShowcaseModal } from './components/CardShowcaseModal';
import { RewindNotificationModal } from './components/RewindNotificationModal';
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
      ninjaChasing: false,
      ninjaNextEncounterRound: null,
      fireworksBurning: false,
      blacksmithUnlocked: false,
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
  const [showBlacksmithModal, setShowBlacksmithModal] = useState<boolean>(false);
  const [showGuideBlacksmithModal, setShowGuideBlacksmithModal] = useState<boolean>(false);
  const [showExchangeInstrumentModal, setShowExchangeInstrumentModal] = useState<boolean>(false);
  const [showUpgradeClockModal, setShowUpgradeClockModal] = useState<boolean>(false);
  const [showUpgradeTimeMachineModal, setShowUpgradeTimeMachineModal] = useState<boolean>(false);
  const [showFlightTimeMachineModal, setShowFlightTimeMachineModal] = useState<boolean>(false);
  const [selectedFlightRound, setSelectedFlightRound] = useState<number>(1);
  const [showWeaponChoiceModal, setShowWeaponChoiceModal] = useState<boolean>(false);
  const [showHallOfFame, setShowHallOfFame] = useState<boolean>(false);
  const [showNewGamePlusModal, setShowNewGamePlusModal] = useState<boolean>(false);
  const [showDevModal, setShowDevModal] = useState<boolean>(false);
  const [showcaseCard, setShowcaseCard] = useState<CardDefinition | null>(null);
  const [showcaseSource, setShowcaseSource] = useState<string>('米蘭小鐵鋪慢火熬製');
  const [showcaseOnClose, setShowcaseOnClose] = useState<(() => void) | null>(null);
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
  const [showGeneralEncounterModal, setShowGeneralEncounterModal] = useState<boolean>(false);
  const [showUnopenedLetterAmbushModal, setShowUnopenedLetterAmbushModal] = useState<boolean>(false);
  const [pendingEventTransition, setPendingEventTransition] = useState<{
    sourceCardName: string;
    targetCard: CardDefinition;
    nextRound: number;
    effectNarrative: string;
    nextInventory: Record<string, number>;
    nextItemOrder?: string[];
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

  // 追上忍者特殊通知視窗狀態
  const [ninjaCaughtNotice, setNinjaCaughtNotice] = useState<{
    round: number;
    ninjaCard: CardDefinition;
  } | null>(null);

  // 反方向的鐘：決戰將軍失敗時回溯通知視窗狀態
  const [rewindClockNotice, setRewindClockNotice] = useState<{
    currentRound: number;
    targetRound: number;
    remainingUses: number;
    isAmbushBattle: boolean;
  } | null>(null);

  // 半島鐵盒：當局回合耗盡時詢問繼承 5 樣卡牌至下一局 (NG)
  const [showIronBoxInheritModal, setShowIronBoxInheritModal] = useState<boolean>(false);
  const [selectedIronBoxItems, setSelectedIronBoxItems] = useState<string[]>([]);
  const [pendingNextGameCallback, setPendingNextGameCallback] = useState<(() => void) | null>(null);

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
      setGameState((prev) => {
        const lastLog = prev.logs[prev.logs.length - 1];
        if (
          lastLog &&
          lastLog.round === prev.round &&
          lastLog.text === text &&
          lastLog.type === (type || 'action')
        ) {
          return prev;
        }
        return {
          ...prev,
          logs: [
            ...prev.logs,
            {
              round: prev.round,
              text,
              type: type || 'action',
            },
          ],
        };
      });
    },
    []
  );

  // 煙火燃燒通知訊息設定函式
  const setBurntItemNotice = useCallback((notice: string | null) => {
    setGameState((prev) => ({ ...prev, burntItemNotice: notice }));
  }, []);

  // 煙火燃燒通知訊息自動倒數關閉
  // 【修改秒數位置】：底下的 2000 代表 2 秒（毫秒制，1000 = 1 秒），若要改為 3 秒改為 3000，以此類推
  useEffect(() => {
    if (gameState.burntItemNotice) {
      const timer = setTimeout(() => {
        setGameState((prev) => (prev.burntItemNotice ? { ...prev, burntItemNotice: null } : prev));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [gameState.burntItemNotice]);

  // 追逐忍者獨立計時器：以 0.5~1.5 秒隨機速度推進忍者回合數
  // 【修改秒數位置】：若要調整忍者前進秒數，可修改底下的 randomDelay 計算方式
  useEffect(() => {
    if (!gameState.ninjaChasing) return;
    if (gameState.phase === 'GAME_OVER' || gameState.phase === 'BOSS_BATTLE') return;

    // 忍者的回合前進速度用亂數決定，目前每回合以 0.5~1.5 秒的速度前進 (500ms ~ 1500ms)
    // 說明：500 為基礎時間（0.5秒），Math.random() * 1000 為額外隨機 0~1.0 秒，加總為 0.5~1.5 秒
    const randomDelay = Math.floor(500 + Math.random() * 1000);
    const timer = setTimeout(() => {
      setGameState((prev) => {
        if (!prev.ninjaChasing) return prev;
        const currentNinjaRound = prev.ninjaRound || (prev.round + 1);
        const nextNinjaRound = currentNinjaRound + 1;

        // 機制 1：當忍者比玩家早抵達 R30，此局提早結束
        if (nextNinjaRound >= 30 && prev.round < 30) {
          return {
            ...prev,
            ninjaChasing: false,
            ninjaRound: 30,
            phase: 'GAME_OVER',
            defeatReason: '忍者已率先抵達第 30 回合逃遁無蹤！追逐失敗，此局提早結束！',
            flags: {
              ...prev.flags,
              ninja_chasing: false,
            },
            logs: [
              ...prev.logs,
              {
                round: prev.round,
                text: '【追逐失敗】忍者已率先抵達第 30 回合逃遁無蹤！追逐失敗，此局提早結束！',
                type: 'warning',
              },
            ],
          };
        }

        return {
          ...prev,
          ninjaRound: nextNinjaRound,
          flags: {
            ...prev.flags,
            ninja_round: nextNinjaRound,
          },
        };
      });
    }, randomDelay);

    return () => clearTimeout(timer);
  }, [gameState.ninjaChasing, gameState.ninjaRound, gameState.phase, gameState.round, addLog]);

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
        // 忍者 (C2001-04) 特殊規則：
        // (1) 處於【追逐忍者】狀態中時，忍者正在前方狂奔逃竄，常規抽卡池絕不重複出現
        // (2) 若行囊已持有【忍者】卡牌，也絕不重複出現
        if (card.id === 'C2001-04' && (state.ninjaChasing || (state.inventory['忍者'] || 0) > 0)) {
          return false;
        }
        // 米蘭的小鐵匠 (C2002-09) 特殊規則：
        // 若小鐵鋪已開立定居（環境狀態常駐），在路上絕不再遭遇小鐵匠
        if (card.id === 'C2002-09' && (state.blacksmithUnlocked || state.flags['blacksmith_unlocked'])) {
          return false;
        }
        // 鄉間的路 (C2026-12) 特殊規則：
        // 若小鐵鋪已開立定居，或者行囊已有【鄉間的路】，在路上絕不再重複抽到
        if (card.id === 'C2026-12' && (state.blacksmithUnlocked || state.flags['blacksmith_unlocked'] || (state.inventory['鄉間的路'] || 0) > 0)) {
          return false;
        }
        // 說走就走 (C2016-02) 特殊規則：
        // 只有在小鐵鋪已開立定居，且行囊中尚未持有【說走就走】時才能抽到
        if (card.id === 'C2016-02' && (!(state.blacksmithUnlocked || state.flags['blacksmith_unlocked']) || (state.inventory['說走就走'] || 0) > 0)) {
          return false;
        }
        // 2. Max draws check
        const alreadyDrawn = state.drawnCount[card.id] || 0;
        if (alreadyDrawn >= card.maxDraws) {
          return false;
        }
        // 3. Weight check (weight <= 0 cannot be drawn normally, unless specifically triggered like 最後的戰役 in 亂舞春秋)
        const isChaosEra = Boolean(state.flags['chaos_era_active']);
        const chaosStartRound = Number(state.flags['chaos_era_start_round'] || 1);
        const isSpecialLinked = card.id === 'C2002-10' && Boolean(
          isChaosEra &&
          !state.inventory['最後的戰役'] &&
          state.round !== 30 &&
          state.round >= chaosStartRound
        );
        if (card.weight <= 0 && !isSpecialLinked) {
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
      // 1. 亂舞春秋 (C2004-07): 持有 忍者、印地安老斑鳩、半獸人、龍戰騎士的遺言、本草綱目 且當局未抽取過
      const chaosEraEligible = Boolean(
        state.inventory['忍者'] &&
        state.inventory['印地安老斑鳩'] &&
        state.inventory['半獸人'] &&
        state.inventory['龍戰騎士的遺言'] &&
        state.inventory['本草綱目'] &&
        !state.flags['chaos_era_obtained']
      );

      // 2. 最後的戰役 (C2002-10): 在進入亂舞春秋時代後的三回合內必定會抽到
      const isChaosEraActive = Boolean(state.flags['chaos_era_active']);
      const chaosStartRound = Number(state.flags['chaos_era_start_round'] || 1);
      const guaranteedRound = Number(state.flags['chaos_era_guaranteed_battle_round'] || (chaosStartRound + 2));
      const lastBattleEligible = Boolean(
        isChaosEraActive &&
        !state.inventory['最後的戰役'] &&
        state.round !== 30 &&
        state.round >= chaosStartRound &&
        (state.round >= guaranteedRound || state.round >= chaosStartRound + 2 || Math.random() < 0.35)
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
        const nextLogs: LogEntry[] = [...(customState?.logs || prev.logs)];
        const pushRoundLog = (text: string, type: LogEntry['type'] = 'action') => {
          const last = nextLogs[nextLogs.length - 1];
          if (last && last.round === targetRound && last.text === text && last.type === type) {
            return;
          }
          nextLogs.push({
            round: targetRound,
            text,
            type,
          });
        };

        const nextState: GameState = {
          ...prev,
          ...customState,
          round: targetRound,
          revealedCard: null,
          logs: nextLogs,
          burntItemNotice: null,
        };

        // 煙火燃燒環境效果：每過三回合，於回合開始時會隨機燒掉行囊中一個東西(移除該物品)，並跳出燒毀通知
        if (nextState.fireworksBurning && nextState.inventory) {
          const currentTicks = Number(prev.flags['fireworks_burn_ticks'] || 0) + 1;
          nextState.flags = {
            ...nextState.flags,
            fireworks_burn_ticks: currentTicks,
          };

          // 每過三回合觸發一次
          if (currentTicks % 3 === 0) {
            // 排除：
            // 1. 【錯過的煙火】本身不被燒毀
            // 2. 【說走就走】不被隨機燒毀（須由玩家主動拖曳至煙火處焚毀以挽留小鐵匠）
            // 3. 當前回合剛拿到的最新物品（不會燒毀當前回合拿到的最新物品，比如此回合是正好計數到第三回合，剛拿到雙刀，則不會燒毀雙刀）
            const newlyAcquiredThisRound = customState?.latestAcquiredItemsThisRound || [];
            const invKeys = Object.keys(nextState.inventory).filter(
              (k) =>
                (nextState.inventory[k] || 0) > 0 &&
                k !== '錯過的煙火' &&
                k !== '說走就走' &&
                !newlyAcquiredThisRound.includes(k)
            );
            if (invKeys.length > 0) {
              const burnedItem = invKeys[Math.floor(Math.random() * invKeys.length)];
              const updatedInv = { ...nextState.inventory };
              updatedInv[burnedItem] = Math.max(0, updatedInv[burnedItem] - 1);
              if (updatedInv[burnedItem] === 0) {
                delete updatedInv[burnedItem];
              }
              nextState.inventory = updatedInv;
              nextState.itemAcquisitionOrder = (nextState.itemAcquisitionOrder || Object.keys(updatedInv)).filter((k) => (updatedInv[k] || 0) > 0);
              pushRoundLog(`🔥【煙火燃燒通知】炙熱煙花已燃燒三回合，無情燒毀了行囊中的【${burnedItem}】！`, 'warning');
              nextState.burntItemNotice = `四周飄散的炙熱花火持續燃燒，已燒毀行囊中的【${burnedItem}】！`;
            } else {
              if (newlyAcquiredThisRound.length > 0) {
                pushRoundLog(`🔥【煙火燃燒】四周火星飄散，因當前回合剛獲得的【${newlyAcquiredThisRound.join('、')}】受到保護不受焚毀，且無其他可燃舊物，本回合無物品損毀。`, 'action');
              } else {
                pushRoundLog('🔥【煙火燃燒】四周火星飄散，因行囊已無其他可燃之物，本回合無物品損毀。', 'action');
              }
            }
          } else {
            pushRoundLog(`🔥【煙火燃燒】四周火星翻騰蔓延（每過三回合將燒毀一件行囊物品，目前已燃燒 ${currentTicks % 3}/3 回合）。`, 'action');
          }
        }

        // 追逐忍者環境判定：如果玩家回合數追上忍者(相等即可)，觸發追上忍者特殊事件
        const currentNinjaTarget = nextState.ninjaRound || (nextState.ninjaNextEncounterRound || (nextState.round + 1));
        if (nextState.ninjaChasing && targetRound >= currentNinjaTarget && !nextState.inventory['忍者']) {
          const ninjaCard = CARD_DATABASE.find((c) => c.id === 'C2001-04');
          if (ninjaCard) {
            pushRoundLog(`【追上忍者】你在第 ${targetRound} 回合追上了忍者！黑影自瓦頂俯衝而下，宿命交鋒觸發！`, 'combat');
            // 追上當下立即解除追逐狀態：停止計時，頂端標籤不再顯示「忍者前進到第X回合」
            nextState.ninjaChasing = false;
            nextState.ninjaRound = undefined;
            nextState.ninjaNextEncounterRound = null;
            nextState.flags = {
              ...nextState.flags,
              ninja_chasing: false,
              ninja_confrontation: true, // 標記為追上後的對決狀態
            };
            setNinjaCaughtNotice({
              round: targetRound,
              ninjaCard,
            });
            return {
              ...nextState,
              phase: 'WAITING_CARD_DRAW',
              revealedCard: null,
            };
          }
        } else if (nextState.ninjaChasing && !nextState.inventory['忍者']) {
          pushRoundLog(`【追逐忍者】忍者正在前路狂奔（目前在第 ${currentNinjaTarget} 回合），請把握時間追上他！`, 'action');
        }

        // 說走就走 (C2016-02) 回合開始提醒機制 (R+5 機制，R=抽到當回合，於 R+5 回合結束前觸發)：
        const leaveRound = Number(nextState.flags['blacksmith_leave_round'] || 0);
        if (nextState.blacksmithUnlocked && leaveRound > 0 && (nextState.inventory['說走就走'] || 0) > 0) {
          if (targetRound < leaveRound) {
            const remaining = leaveRound - targetRound;
            pushRoundLog(
              `【說走就走】小鐵匠正收拾行囊，準備追尋遠方的自由……還有 ${remaining} 回合即將離開村莊！（或許在第 ${leaveRound} 回合結束前可以打消小鐵匠離開的念頭）`,
              'warning'
            );
          } else if (targetRound === leaveRound) {
            pushRoundLog(
              `【說走就走】第 ${leaveRound} 回合已至！小鐵匠已打包好行囊，本回合探索結束後即將動身啟程……（若要挽留，這是最後的機會！）`,
              'warning'
            );
          }
        }

        // If Round === 30 and ready for general, trigger Boss battle with intro transition modal!
        if (targetRound === 30 && nextState.flags['ready_for_general']) {
          setShowGeneralEncounterModal(true);
          return {
            ...nextState,
            phase: 'BOSS_BATTLE',
          };
        }

        // 若玩家選擇不拆信（general_immediate_next_round）：過場機制
        // 依然有三張卡覆蓋的抽卡畫面，但不管點哪張都會跳出突襲警示視窗
        if (Boolean(nextState.flags['general_immediate_next_round'])) {
          const choices = rollThreeCards(nextState, meta);
          return {
            ...nextState,
            phase: 'DRAW_THREE',
            currentDrawChoices: choices,
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
    if (!char) return;

    // Inherit iron box items from meta
    const initialInventory: Record<string, number> = {};
    const initialItemOrder: string[] = [];
    if (meta.ironBoxItems && meta.ironBoxItems.length > 0) {
      meta.ironBoxItems.forEach((item) => {
        const actualItem = item === '飛行時光機' ? '時光機' : item;
        initialInventory[actualItem] = (initialInventory[actualItem] || 0) + 1;
        if (!initialItemOrder.includes(actualItem)) {
          initialItemOrder.push(actualItem);
        }
      });
      const displayNames = meta.ironBoxItems.map((it) =>
        it === '飛行時光機' ? '時光機（由飛行時光機復原）' : it
      );
      addLog(`【半島鐵盒】跨局傳承生效，繼承了上一局封存的 ${displayNames.join('、')}！`, 'milestone');
    }
    // 繼承進行囊後清空暫存，每局 R30 結束時由當局持有狀態重新確認是否封存
    setMeta((prev) => ({
      ...prev,
      ironBoxItems: [],
    }));

    // Next game flags inheritance
    const initialFlags: Record<string, boolean | string | number> = { ...meta.nextGameFlags };

    setGameState((prev) => ({
      ...prev,
      character: char,
      inventory: initialInventory,
      itemAcquisitionOrder: initialItemOrder,
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
    triggerJayQuote();
  };

  // 觸發特殊獲得卡牌全貌大揭曉視窗 (如麥芽糖合成後觸發)
  const triggerCardShowcase = (
    cardId: string,
    sourceText?: string,
    onCloseCallback?: () => void
  ) => {
    const card = CARD_DATABASE.find((c) => c.id === cardId);
    if (card) {
      setShowcaseCard(card);
      setShowcaseSource(sourceText || card.acquisitionSource || '特殊機制獲得');
      setShowcaseOnClose(onCloseCallback ? () => onCloseCallback : null);
      // 同步解鎖圖鑑
      setMeta((prev) => {
        if (prev.unlockedCardIds.includes(card.id)) return prev;
        return {
          ...prev,
          unlockedCardIds: [...prev.unlockedCardIds, card.id],
        };
      });
    }
  };

  const handleCloseShowcase = useCallback(() => {
    setShowcaseCard(null);
    if (showcaseOnClose) {
      const cb = showcaseOnClose;
      setShowcaseOnClose(null);
      cb();
    }
  }, [showcaseOnClose]);

  // Draw Card from the 3 choices
  const handleDrawCard = (card: CardDefinition) => {
    if (!card) return;

    // 若是因為拒拆信函觸發將軍突襲：依然有三張卡覆蓋的抽卡畫面，但不管點哪張都會跳出突襲警示視窗！
    if (gameState.flags['general_immediate_next_round']) {
      setShowUnopenedLetterAmbushModal(true);
      return;
    }

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

    // 專屬合成卡牌（如 C2005-09 麥芽糖）：統一展示新卡牌全貌畫面 (CardShowcaseModal)，永不進入舊卡翻牌畫面
    if (card.isSynthesizedOnly) {
      setGameState((prev) => {
        const nextInv = { ...prev.inventory };
        nextInv[card.name] = (nextInv[card.name] || 0) + 1;
        const currentOrder = prev.itemAcquisitionOrder || [];
        const nextOrder = currentOrder.includes(card.name)
          ? currentOrder
          : [...currentOrder, card.name];
        return {
          ...prev,
          drawnCount: nextDrawnCount,
          inventory: nextInv,
          itemAcquisitionOrder: nextOrder,
        };
      });

      addLog(`【專屬合成獲得】獲得卡牌【${card.name}】！已直接收入行囊。`, 'milestone');
      triggerCardShowcase(card.id, card.acquisitionSource || '米蘭的小鐵匠慢火熬製');
      return;
    }

    addLog(`抽到了【${card.name}】`, 'draw');

    // 觸發周董即時評語：依最新指示，稀有卡定義修改為 5% 以下 (含 5%)
    const isRareCard = card.weight > 0 && card.weight <= 5;
    if (isRareCard) {
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
    let option = card.options && card.options[optionIndex];

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
    let specialCardToShowcase: { cardId: string; sourceText: string } | null = null;

    // 特殊邏輯：龍戰騎士 (C2008-01) 判定
    if (card.id === 'C2008-01') {
      const isDragonDefeated =
        option.text.includes('雙刀與雙截棍齊出') ||
        option.text.includes('無雙一擊');

      if (!isDragonDefeated && !option.text.includes('黑色毛衣')) {
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

    // 忍者 (C2001-04) 英雄持有【免費教學錄影帶】激活天賦專屬結算文本
    if (card.id === 'C2001-04') {
      const isHeroWithTape =
        gameState.character?.name === '英雄' &&
        Boolean(gameState.inventory['免費教學錄影帶']);
      if (
        isHeroWithTape &&
        (option.text.includes('英雄天賦') || option.text.includes('赤手空拳') || option.text.includes('攔截') || option.text.includes('雙截棍'))
      ) {
        optionResultText =
          '英雄天賦身手，不需兵刃就空手制伏忍者！忍者心悅誠服奉上忍道信物，獲得【忍者】卡牌，解除【追逐忍者】狀態！';
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
    let orcMissingInfo = '';
    let orcBlockedBySweater = false;

    if (card.id === 'C2002-01') {
      const isHeroWithTape =
        gameState.character?.name === '英雄' &&
        Boolean(gameState.inventory['免費教學錄影帶']);

      const twinBladesCount = gameState.inventory['雙刀'] || 0;
      const nunchakuCount = gameState.inventory['雙截棍'] || 0;
      const canDefeatWithBlades = twinBladesCount >= 1;
      const canDefeatWithNunchaku = nunchakuCount >= 2;

      if (isHeroWithTape || canDefeatWithBlades || canDefeatWithNunchaku) {
        orcDefeated = true;
        if (isHeroWithTape) {
          // 英雄且持有【免費教學錄影帶】啟動天賦：毋需任何武器即可赤手空拳突圍，且不消耗任何武器
          orcWeaponUsed = null;
          optionResultText =
            '你施展英雄天賦赤手空拳突圍，連貫的拳風成功擊倒嗜血的半獸人！獲得【半獸人】卡牌！';
          addLog('【英雄天賦】憑藉《免費教學錄影帶》掌握獨門訣竅，毋需消耗武器成功擊倒半獸人！獲得【半獸人】卡牌！', 'milestone');
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
    const nextDrawnCount = { ...gameState.drawnCount };

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

      // 2. 胖女巫選項：好奇胖女巫手上的東西
      else if (option.text.includes('胖女巫') || option.text.includes('水晶球')) {
        const hasTimeMachine = (nextInventory['時光機'] || gameState.inventory['時光機'] || nextInventory['飛行時光機'] || gameState.inventory['飛行時光機'] || 0) > 0;
        const isYongWuUnlocked = Boolean(meta.unlockedAchievements?.includes('ach_yong_wu'));

        if (hasTimeMachine) {
          // 持有時光機優先權 > 啟動"詠物調"
          const apLoss = 3;
          nextStats.ap = Math.max(0, nextStats.ap - apLoss);
          optionResultText = '胖女巫手握水晶球冷眼斜睨著你！她尖嘯一聲揮動掃帚施放驅逐咒將你強行送出古堡，行動力 -3！';
          addLog('【逐出古堡】胖女巫發現你，冷笑施法將你驅逐出古堡，行動力-3！', 'warning');
        } else if (isYongWuUnlocked) {
          // 啟動成就"詠物調"：讚美水晶球，開心贈送時光機
          nextInventory['時光機'] = (nextInventory['時光機'] || 0) + 1;
          recordItemAcquired('時光機');
          optionResultText = '你身負【詠物調】之古韻雅意，由衷讚嘆胖女巫手中晶瑩剔透的水晶球。胖女巫聽得心花怒放，欣喜地將失落已久的秘寶【時光機】大方贈予了你！';
          addLog('【女巫賜寶】讚美胖女巫的水晶球，胖女巫欣喜贈送傳奇秘寶【時光機】！', 'milestone');
        } else {
          // 一般情況：胖女巫用水晶球替你占卜得知前世，觸發《愛在西元前》
          effectiveForceNextCardId = 'C2001-01';
          optionResultText = '胖女巫手捧剔透的水晶球替你占卜前世因果。水晶球中波光流轉，浮現出美索不達米亞平原的泥板與漢摩拉比法典……你得知了自己的前世，時空逆流呼嘯而起！';
          addLog('【水晶占卜】胖女巫用水晶球占卜得知前世，時空共鳴，回合將回到《愛在西元前》！', 'milestone');
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
          optionResultText = '你偷偷潛入威廉二世的寢殿，木地板的吱嘎聲頓時驚醒了威廉二世！他雷霆大怒將你強行趕出古堡，狼狽逃竄中體力消耗，行動力 -3！';
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
          optionResultText = `道具不足無法確認！請備齊材料，小鐵匠方可為你熬煮。`;
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
        option.text.includes('強化時光機') ||
        option.text.includes('飛行時光機') ||
        (option.require?.items && option.require.items.includes('愛的飛行日記'))
      ) {
        setShowUpgradeTimeMachineModal(true);
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
        // R+5 機制：R=抽到當回合，於第 R+5 回合結束前離開（當回合不計數）
        const leaveRound = gameState.round + 5;
        nextFlags['blacksmith_leave_round'] = leaveRound;
        optionResultText = `小鐵匠心生嚮往，預計於第 ${leaveRound} 回合結束前收拾行囊離開村莊！`;
        addLog(
          `【說走就走】小鐵匠聽到了遠方的呼喚，心生嚮往……預計於第 ${leaveRound} 回合結束前收起行囊離開村莊！（或許在第 ${leaveRound} 回合結束前，小鐵匠有可能打消去意）`,
          'warning'
        );
      } else {
        // 確認機制：村莊尚無小鐵鋪時抽到，小鐵匠未開鋪定居，不受影響
        delete nextFlags['blacksmith_leave_round'];
        optionResultText = '背起行囊，瀟灑前行！（目前村莊未開立小鐵鋪，小鐵匠不受影響）';
        addLog(
          '【說走就走】這就是年輕，該瀟灑一次的決定！背起行囊，享受遼闊的自由。（目前村莊也沒有人想走）',
          'action'
        );
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
        // 若獲得的物品為專屬特殊機制卡牌（例如比較大的大提琴 C2012-06），且非當前翻開的卡牌，自動觸發新卡亮相全貌視窗
        const awardedSpecialCard = CARD_DATABASE.find((c) => c.name === eff.addItem && c.id !== card.id && c.isSynthesizedOnly);
        if (awardedSpecialCard) {
          specialCardToShowcase = {
            cardId: awardedSpecialCard.id,
            sourceText: awardedSpecialCard.acquisitionSource || `《${card.name}》選擇獲得`,
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
          gameState.character?.name === '英雄' &&
          Boolean(gameState.inventory['免費教學錄影帶']);

        if (!isNinjaHeroExempt) {
          nextInventory[eff.removeItem] = Math.max(0, nextInventory[eff.removeItem] - 1);
          if (nextInventory[eff.removeItem] === 0) delete nextInventory[eff.removeItem];
        }
      }

      if (eff.removeItems) {
        eff.removeItems.forEach((item) => {
          if (nextInventory[item]) {
            nextInventory[item] = Math.max(0, nextInventory[item] - 1);
            if (nextInventory[item] === 0) delete nextInventory[item];
          }
        });
      }

      if (eff.removeRandomItem) {
        const itemKeys = Object.keys(nextInventory).filter((k) => nextInventory[k] > 0);
        if (itemKeys.length > 0) {
          const randomKey = itemKeys[Math.floor(Math.random() * itemKeys.length)];
          nextInventory[randomKey] = Math.max(0, nextInventory[randomKey] - 1);
          if (nextInventory[randomKey] === 0) delete nextInventory[randomKey];
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
        const isHeroWithTape =
          gameState.character?.name === '英雄' &&
          Boolean(gameState.inventory['免費教學錄影帶']);

        if (
          eff?.setFlag?.defeat_忍者 ||
          eff?.setFlag?.defeated_ninja ||
          option.text.includes('雙截棍') ||
          option.text.includes('英雄天賦') ||
          option.text.includes('赤手空拳') ||
          option.text.includes('攔截')
        ) {
          nextNinjaChasing = false;
          nextNinjaNextEncounterRound = null;
          nextNinjaRound = undefined;
          nextFlags['ninja_chasing'] = false;
          nextFlags['ninja_confrontation'] = false;
          if (isHeroWithTape) {
            addLog('【英雄天賦】赤手空拳成功制伏忍者！解除【追逐忍者】狀態，獲得【忍者】卡牌！', 'milestone');
          } else {
            addLog('【降伏忍者】快使用雙截棍！成功制伏忍者並解除【追逐忍者】環境狀態，獲得【忍者】卡牌！', 'milestone');
          }
        } else if (option.text.includes('遁術') || option.text.includes('逃離') || option.text.includes('逃遁')) {
          // 如果無法擊敗，忍者逃離(抽卡上限恢復成1)，下次再抽到忍者重新追逐一次
          nextNinjaChasing = false;
          nextNinjaNextEncounterRound = null;
          nextNinjaRound = undefined;
          nextFlags['ninja_chasing'] = false;
          nextFlags['ninja_confrontation'] = false;
          nextDrawnCount['C2001-04'] = 0; // 抽卡上限恢復成 1
          addLog('【忍者逃離】缺少雙截棍制伏，忍者施展遁術逃離！，下次抽到將重新展開追逐。', 'warning');
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

      // 特殊環境變化邏輯 3：煙花易冷 (C2010-03) 滅火（煙火燃燒解除後，行囊中的錯過的煙火消失，上限恢復）
      if (card.id === 'C2010-03') {
        if (eff?.setFlag?.fireworks_burning === false || option.text.includes('冷雨') || option.text.includes('解除')) {
          nextFireworksBurning = false;
          nextFlags['fireworks_burning'] = false;
          nextFlags['fireworks_burn_ticks'] = 0;
          delete nextInventory['錯過的煙火'];
          nextDrawnCount['C2022-08'] = 0;
          addLog('【冷雨滅火】「煙花易冷雨紛紛，行囊遇火不再焚。」洛陽舊城的冷雨驟然傾瀉，冰涼甘霖澆滅了四周花火，成功解除【煙火燃燒】環境狀態！', 'milestone');
        }
      }

      if (eff?.setFlag?.fireworks_burning === false) {
        nextFireworksBurning = false;
        nextFlags['fireworks_burning'] = false;
        nextFlags['fireworks_burn_ticks'] = 0;
        delete nextInventory['錯過的煙火'];
        nextDrawnCount['C2022-08'] = 0;
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

      // Check Core Route 3: 《周杰倫家庭》 Victory (Family members and songs collected)
      if (
        nextInventory['外婆'] &&
        nextInventory['聽媽媽的話'] &&
        nextInventory['聽爸爸的話'] &&
        (nextInventory['女兒殿下'] || nextCharacter?.name === '女兒殿下')
      ) {
        nextVictory = '周杰倫家庭';
        addLog('【溫馨團聚】外婆、媽媽、爸爸、女兒殿下全員相聚，達成《周杰倫家庭》溫情傳奇結局！', 'milestone');
      }

      // Sunshine guy evolution check
      if (nextCharacter?.name === '陽光宅男' && nextInventory['公主病']) {
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

    // Action consumes 1 AP
    nextStats.ap = Math.max(0, nextStats.ap - 1);

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
          const isYongWuUnlocked = Boolean(meta.unlockedAchievements?.includes('ach_yong_wu'));
          if (hasTimeMachine) {
            badges.push({ label: '逐出古堡', value: '-3 行動力', color: 'text-red-400' });
          } else if (isYongWuUnlocked) {
            badges.push({ label: '女巫賜寶', value: '【時光機】', color: 'text-amber-300' });
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
            gameState.character?.name === '英雄' &&
            Boolean(gameState.inventory['免費教學錄影帶']);
          if (!isNinjaHeroExempt) {
            badges.push({ label: '消耗物品', value: `【${eff.removeItem}】`, color: 'text-stone-400' });
          } else {
            badges.push({ label: '英雄天賦', value: '赤手空拳突圍', color: 'text-amber-300' });
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

      // 體力耗盡判定（包含在 R30 跳接後卡牌抉擇、或一般卡牌體力歸 0 時）
      if (nextStats.ap <= 0) {
        nextStats.ap = 0;
        // 系統保留此選項的物品、狀態、成就與化身，以利後續繼承判定（如鐵盒存放）
        setGameState((prev) => ({
          ...prev,
          inventory: nextInventory,
          itemAcquisitionOrder: nextItemOrder,
          flags: nextFlags,
          character: nextCharacter,
          stats: nextStats,
        }));
        addLog('【行動力竭】行動力歸 0，身體已達極限，本局冒險結束！', 'warning');

        let narrativeDesc = '';
        if (eff?.rewindRound !== undefined) {
          narrativeDesc = `雖然必須時空逆轉重返第 1 回合，但因體力已耗盡，本局冒險在此結束。`;
        } else if (effectiveForceNextCardId) {
          const targetNext = CARD_DATABASE.find((c) => c.id === effectiveForceNextCardId);
          narrativeDesc = `雖然觸發連動前往【${targetNext?.name || '下一卡牌'}】，但因體力已耗盡，本局冒險在此結束。`;
        } else if (optionResultText || option.resultText) {
          narrativeDesc = `雖然${optionResultText || option.resultText}，但因體力已耗盡，本局冒險在此結束。`;
        } else {
          narrativeDesc = `雖然做出了抉擇，但因體力耗盡，本局冒險結束。`;
        }

        setOutcomeModal({
          title: '✦ 宿命終曲・體力耗盡 ✦',
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
        flags: nextFlags,
        character: nextCharacter,
        stats: nextStats,
        fireworksBurning: nextFireworksBurning,
        ninjaChasing: nextNinjaChasing,
        ninjaNextEncounterRound: nextNinjaNextEncounterRound,
        blacksmithUnlocked: nextBlacksmithUnlocked,
      }));

      // 【第30回合邊界條件機制】
      // (3) 觸發卡牌導致增加體力的情況，不影響原先機制，因為原先機制本來就是就算體力再多也是得 30 回合結束，就算體力從 0 補回 1 也一樣
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
            // 檢查是否為說走就走 (C2016-02) 設定的小鐵匠離開回合 (R+5)：
            // 於第 leaveRound 回合探索結算後、進入下一回合 (leaveRound + 1) 前發動離開機制
            const leaveRound = Number(nextFlags['blacksmith_leave_round'] || 0);
            const isDepartureTriggerRound =
              Boolean(nextBlacksmithUnlocked || nextFlags['blacksmith_unlocked']) &&
              leaveRound > 0 &&
              (nextInventory['說走就走'] || 0) > 0 &&
              gameState.round === leaveRound;

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

              // 即時更新當前底層狀態，確保畫面上的「小鐵鋪」按鈕與行囊即時解除與移除
              setGameState((prev) => ({
                ...prev,
                inventory: postDepartureInventory,
                itemAcquisitionOrder: postDepartureItemOrder,
                flags: postDepartureFlags,
                blacksmithUnlocked: false,
              }));

              addLog(
                `【說走就走】第 ${leaveRound} 回合已至，米蘭的小鐵匠收拾好行囊，前往遠方追尋自由與音樂之夢！小鐵鋪已打烊關閉，隨風消逝的【鄉間的路】已從行囊移除。往後旅程中將有機會再度與他相遇！`,
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
                    第 {leaveRound} 回合探索結束，小鐵匠收拾起工具，踏上了追尋自由的遠方。
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
                    ninjaChasing: nextNinjaChasing,
                    ninjaRound: nextNinjaRound,
                    ninjaNextEncounterRound: nextNinjaNextEncounterRound,
                    blacksmithUnlocked: false,
                    latestAcquiredItemsThisRound: newlyAcquiredItemsThisRound,
                    drawnCount: {
                      ...gameState.drawnCount,
                      'C2026-12': 0,
                      'C2002-09': 0,
                    },
                  });
                },
              });
              return;
            }

            startNewRound(finalConfirmRound, {
              inventory: nextInventory,
              itemAcquisitionOrder: nextItemOrder,
              flags: nextFlags,
              character: nextCharacter,
              stats: nextStats,
              fireworksBurning: nextFireworksBurning,
              ninjaChasing: nextNinjaChasing,
              ninjaRound: nextNinjaRound,
              ninjaNextEncounterRound: nextNinjaNextEncounterRound,
              blacksmithUnlocked: nextBlacksmithUnlocked,
              latestAcquiredItemsThisRound: newlyAcquiredItemsThisRound,
            });
          };

          if (specialCardToShowcase) {
            triggerCardShowcase(
              specialCardToShowcase.cardId,
              specialCardToShowcase.sourceText,
              advanceToNextRound
            );
          } else {
            advanceToNextRound();
          }
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

  // 檢查物品是否被限制無法放入半島鐵盒跨局繼承（如《最後的戰役》）
  const isItemPeninsulaRestricted = useCallback((itemName: string) => {
    const cardDef = CARD_DATABASE.find((c) => c.name === itemName);
    return Boolean(cardDef?.isPeninsulaRestricted || itemName === '最後的戰役');
  }, []);

  // Iron Box store/take handlers (支援至多 5 樣卡牌跨局封存傳承)
  const handleStoreIronBox = (itemName: string) => {
    if (meta.ironBoxItems.length >= 5) return;
    if (isItemPeninsulaRestricted(itemName)) {
      addLog(`【半島鐵盒】此物品蘊含當局決戰因果，無法放入鐵盒封存！`, 'warning');
      return;
    }
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

  // 於第 30 回合結束進入 NG 時，若持有半島鐵盒，啟動詢問玩家要保留哪些獲得卡牌繼承到 NG (至多 10 樣)
  const triggerNextGameWithIronBoxCheck = (proceedFn: () => void) => {
    const hasIronBox = Boolean(gameState.inventory['半島鐵盒']);
    const availableItems = Object.keys(gameState.inventory).filter(
      (k) => (gameState.inventory[k] || 0) > 0 && !isItemPeninsulaRestricted(k)
    );
    if (hasIronBox && availableItems.length > 0) {
      const initialSelected = (meta.ironBoxItems || [])
        .filter((it) => availableItems.includes(it))
        .slice(0, 10);
      setSelectedIronBoxItems(initialSelected);
      setPendingNextGameCallback(() => proceedFn);
      setShowIronBoxInheritModal(true);
    } else {
      proceedFn();
    }
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
      ninjaChasing: false,
      ninjaNextEncounterRound: null,
      fireworksBurning: false,
      blacksmithUnlocked: false,
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

  // 米蘭小鐵匠指引確認與常駐開立處理
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
    const finalConfirmRound = isAtOrExceedingRound30 ? 31 : nextRound;

    const advanceToNextRound = () => {
      // 檢查是否為說走就走 (C2016-02) 設定的小鐵匠離開回合 (R+5)
      const leaveRound = Number(gameState.flags['blacksmith_leave_round'] || 0);
      const isDepartureTriggerRound =
        Boolean(gameState.blacksmithUnlocked || gameState.flags['blacksmith_unlocked']) &&
        leaveRound > 0 &&
        (nextInventory['說走就走'] || 0) > 0 &&
        gameState.round === leaveRound;

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

        setGameState((prev) => ({
          ...prev,
          inventory: postDepartureInventory,
          itemAcquisitionOrder: postDepartureItemOrder,
          flags: postDepartureFlags,
          blacksmithUnlocked: false,
        }));

        addLog(
          `【說走就走】第 ${leaveRound} 回合已至，米蘭的小鐵匠收拾好行囊，前往遠方追尋自由與音樂之夢！小鐵鋪已打烊關閉，隨風消逝的【鄉間的路】已從行囊移除。往後旅程中將有機會再度與他相遇！`,
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
              第 {leaveRound} 回合探索結束，小鐵匠收拾起工具，踏上了追尋自由的遠方。
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
              drawnCount: {
                ...gameState.drawnCount,
                'C2026-12': 0,
                'C2002-09': 0,
              },
            });
          },
        });
        return;
      }

      startNewRound(finalConfirmRound, {
        inventory: nextInventory,
        itemAcquisitionOrder: nextItemOrder,
        latestAcquiredItemsThisRound: newlyAcquiredItemsThisRound,
      });
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
    const finalConfirmRound = isAtOrExceedingRound30 ? 31 : nextRound;

    const advanceToNextRound = () => {
      // 檢查是否為說走就走 (C2016-02) 設定的小鐵匠離開回合 (R+5)
      const leaveRound = Number(gameState.flags['blacksmith_leave_round'] || 0);
      const isDepartureTriggerRound =
        Boolean(gameState.blacksmithUnlocked || gameState.flags['blacksmith_unlocked']) &&
        leaveRound > 0 &&
        (nextInventory['說走就走'] || 0) > 0 &&
        gameState.round === leaveRound;

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

        setGameState((prev) => ({
          ...prev,
          inventory: postDepartureInventory,
          itemAcquisitionOrder: postDepartureItemOrder,
          flags: postDepartureFlags,
          blacksmithUnlocked: false,
        }));

        addLog(
          `【說走就走】第 ${leaveRound} 回合已至，米蘭的小鐵匠收拾好行囊，前往遠方追尋自由與音樂之夢！小鐵鋪已打烊關閉，隨風消逝的【鄉間的路】已從行囊移除。往後旅程中將有機會再度與他相遇！`,
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
              第 {leaveRound} 回合探索結束，小鐵匠收拾起工具，踏上了追尋自由的遠方。
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
              drawnCount: {
                ...gameState.drawnCount,
                'C2026-12': 0,
                'C2002-09': 0,
              },
            });
          },
        });
        return;
      }

      startNewRound(finalConfirmRound, {
        inventory: nextInventory,
        itemAcquisitionOrder: nextItemOrder,
        latestAcquiredItemsThisRound: newlyAcquiredItemsThisRound,
      });
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
    const finalConfirmRound = isAtOrExceedingRound30 ? 31 : nextRound;

    const advanceToNextRound = () => {
      // 檢查是否為說走就走 (C2016-02) 設定的小鐵匠離開回合 (R+5)
      const leaveRound = Number(gameState.flags['blacksmith_leave_round'] || 0);
      const isDepartureTriggerRound =
        Boolean(gameState.blacksmithUnlocked || gameState.flags['blacksmith_unlocked']) &&
        leaveRound > 0 &&
        (nextInventory['說走就走'] || 0) > 0 &&
        gameState.round === leaveRound;

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

        setGameState((prev) => ({
          ...prev,
          inventory: postDepartureInventory,
          itemAcquisitionOrder: postDepartureItemOrder,
          flags: postDepartureFlags,
          blacksmithUnlocked: false,
        }));

        addLog(
          `【說走就走】第 ${leaveRound} 回合已至，米蘭的小鐵匠收拾好行囊，前往遠方追尋自由與音樂之夢！小鐵鋪已打烊關閉，隨風消逝的【鄉間的路】已從行囊移除。往後旅程中將有機會再度與他相遇！`,
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
              第 {leaveRound} 回合探索結束，小鐵匠收拾起工具，踏上了追尋自由的遠方。
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
              drawnCount: {
                ...gameState.drawnCount,
                'C2026-12': 0,
                'C2002-09': 0,
              },
            });
          },
        });
        return;
      }

      startNewRound(finalConfirmRound, {
        inventory: nextInventory,
        itemAcquisitionOrder: nextItemOrder,
        latestAcquiredItemsThisRound: newlyAcquiredItemsThisRound,
      });
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
        const leaveRound = Number(gameState.flags['blacksmith_leave_round'] || 0);
        const isDepartureTriggerRound =
          Boolean(gameState.blacksmithUnlocked || gameState.flags['blacksmith_unlocked']) &&
          leaveRound > 0 &&
          (nextInventory['說走就走'] || 0) > 0 &&
          gameState.round === leaveRound;

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

          // 即時更新當前底層狀態，確保畫面上的「小鐵鋪」按鈕與行囊即時解除與移除
          setGameState((prev) => ({
            ...prev,
            inventory: postDepartureInventory,
            itemAcquisitionOrder: postDepartureItemOrder,
            flags: postDepartureFlags,
            blacksmithUnlocked: false,
          }));

          addLog(
            `【說走就走】第 ${leaveRound} 回合已至，米蘭的小鐵匠收拾好行囊，前往遠方追尋自由與音樂之夢！小鐵鋪已打烊關閉，隨風消逝的【鄉間的路】已從行囊移除。往後旅程中將有機會再度與他相遇！`,
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
                第 {leaveRound} 回合探索結束，小鐵匠收拾起工具，踏上了追尋自由的遠方。
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
                drawnCount: {
                  ...gameState.drawnCount,
                  'C2026-12': 0,
                  'C2002-09': 0,
                },
              });
            },
          });
          return;
        }

        startNewRound(finalConfirmRound, {
          inventory: nextInventory,
          itemAcquisitionOrder: nextItemOrder,
          latestAcquiredItemsThisRound: newlyAcquiredItemsThisRound,
        });
      },
    });
  };

  // 小鐵鋪改造交易處理
  const handleBlacksmithTrade = (
    type: 'nunchucks_to_blades' | 'blades_to_nunchucks' | 'craft_maltose' | 'trade_ukulele' | 'upgrade_clock'
  ): boolean => {
    const inv = { ...gameState.inventory };
    const currentOrder = gameState.itemAcquisitionOrder || Object.keys(inv);
    let nextOrder = [...currentOrder];

    if (type === 'nunchucks_to_blades') {
      if ((inv['雙截棍'] || 0) < 2) return false;
      inv['雙截棍'] -= 2;
      if (inv['雙截棍'] === 0) delete inv['雙截棍'];
      inv['雙刀'] = (inv['雙刀'] || 0) + 1;
      nextOrder = [...nextOrder.filter((k) => k !== '雙刀'), '雙刀'];
      nextOrder = nextOrder.filter((k) => (inv[k] || 0) > 0);
      setGameState((prev) => ({
        ...prev,
        inventory: inv,
        itemAcquisitionOrder: nextOrder,
      }));
      checkAchievements(inv);
      addLog('【小鐵鋪重鑄】消耗 2 把【雙截棍】，小鐵匠以純熟爐火為你改造成 1 把【雙刀】！', 'milestone');
      return true;
    }

    if (type === 'blades_to_nunchucks') {
      if ((inv['雙刀'] || 0) < 1) return false;
      inv['雙刀'] -= 1;
      if (inv['雙刀'] === 0) delete inv['雙刀'];
      inv['雙截棍'] = (inv['雙截棍'] || 0) + 2;
      nextOrder = [...nextOrder.filter((k) => k !== '雙截棍'), '雙截棍'];
      nextOrder = nextOrder.filter((k) => (inv[k] || 0) > 0);
      setGameState((prev) => ({
        ...prev,
        inventory: inv,
        itemAcquisitionOrder: nextOrder,
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
      inv['麥芽糖'] = (inv['麥芽糖'] || 0) + 1;
      nextOrder = [...nextOrder.filter((k) => k !== '麥芽糖'), '麥芽糖'];
      nextOrder = nextOrder.filter((k) => (inv[k] || 0) > 0);
      setGameState((prev) => ({
        ...prev,
        inventory: inv,
        itemAcquisitionOrder: nextOrder,
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
      inv['療傷燒肉粽'] = (inv['療傷燒肉粽'] || 0) + 1;
      nextOrder = [...nextOrder.filter((k) => k !== '療傷燒肉粽'), '療傷燒肉粽'];
      nextOrder = nextOrder.filter((k) => (inv[k] || 0) > 0);
      setGameState((prev) => ({
        ...prev,
        inventory: inv,
        itemAcquisitionOrder: nextOrder,
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
      inv['大笨鐘'] = (inv['大笨鐘'] || 0) + 1;
      nextOrder = [...nextOrder.filter((k) => k !== '大笨鐘'), '大笨鐘'];
      nextOrder = nextOrder.filter((k) => (inv[k] || 0) > 0);
      setGameState((prev) => ({
        ...prev,
        inventory: inv,
        itemAcquisitionOrder: nextOrder,
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

    return false;
  };

  // 拖曳道具至「煙火燃燒」環境標籤處理：
  // 1. 煙花易冷 (C2010-03)：滅火解除環境狀態（需本草綱目）
  // 2. 錯過的煙火 (C2022-08)：火上加火引爆大爆炸，除錯過的煙火本身與最新獲得的物品外，其餘行囊物品全數燒毀
  // 3. 除了煙花易冷以外的物品：移入煙火燃燒字樣區將被焚燒消失
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
        addLog('【未明藥理】尚未啟動行囊進階功能，無法辨識與啟用【煙花易冷】的滅火功效！', 'warning');
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
        Object.keys(nextInv).forEach((k) => {
          if (k !== '錯過的煙火' && k !== sparedLatestItem && (nextInv[k] || 0) > 0) {
            burnedItems.push(k);
            delete nextInv[k];
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
          setBurntItemNotice(`💥 火上加火大爆炸！行囊中的【${burnedItems.join('、')}】全數被烈火燒毀！`);
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
          setBurntItemNotice('💥 火上加火引發大爆炸！四周烈焰翻騰，但無其他舊物品損毀。');
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
        };
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
      const nextOrder = (prev.itemAcquisitionOrder || Object.keys(nextInv)).filter(
        (k) => (nextInv[k] || 0) > 0
      );

      return {
        ...prev,
        inventory: nextInv,
        itemAcquisitionOrder: nextOrder,
        ...(itemName === '說走就走'
          ? {
              flags: {
                ...prev.flags,
                blacksmith_leave_round: 0,
              },
            }
          : {}),
      };
    });

    if (itemName === '說走就走') {
      addLog('【自由止步】行囊中的【說走就走】已被烈火焚毀，小鐵匠打消了離開的念頭，決定繼續留在村莊開立小鐵鋪！', 'milestone');
    }

    addLog(`🔥【物品焚毀】你將【${itemName}】移入漫天煙火之中，熊熊烈火瞬間將其吞噬，化為灰燼消失！`, 'warning');
    setBurntItemNotice(`【${itemName}】已被煙火烈焰焚燒消失！`);
    setOutcomeModal({
      title: '✦ 物品焚毀 ✦',
      icon: '🔥',
      subtitle: '煙火燃燒吞噬物品',
      narrative: `你將【${itemName}】移入了四周燃燒的漫天煙火之中，炙熱火舌瞬間將其吞噬，【${itemName}】已化為一縷灰燼消失！`,
      confirmText: '已知曉',
      onConfirm: () => setOutcomeModal(null),
    });
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
      ninjaChasing: false,
      ninjaNextEncounterRound: null,
      fireworksBurning: false,
      blacksmithUnlocked: false,
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
      flags: {},
      jokerSlots: { place: null, shoes: null, performance: null },
      reversedClockUsesRemaining: 3,
      stats: { ap: 15 },
      ninjaChasing: false,
      ninjaNextEncounterRound: null,
      fireworksBurning: false,
      blacksmithUnlocked: false,
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

  // 全域鍵盤事件監聽：ESC / Enter / 空白鍵 快捷確認或關閉彈出視窗
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 若當前焦點在文字輸入框，不攔截打字鍵
      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') {
        if (e.key === 'Escape' && showDevPasswordModal) {
          setShowDevPasswordModal(false);
        }
        return;
      }

      // 優先序 0.8：卡牌亮相大揭曉視窗 (CardShowcaseModal)
      if (showcaseCard) {
        if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') {
          e.preventDefault();
          handleCloseShowcase();
          return;
        }
      }

      // 優先序 1：事件結果確認視窗 (Outcome Modal)
      if (outcomeModal) {
        if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') {
          e.preventDefault();
          outcomeModal.onConfirm();
          return;
        }
      }

      // 優先序 1.5：反方向的鐘回溯通知視窗 (Rewind Clock Notice)
      if (rewindClockNotice) {
        if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') {
          e.preventDefault();
          handleConfirmRewindNotice();
          return;
        }
      }

      // 優先序 2：R30 決戰將軍過場提醒視窗 (General Encounter Modal)
      if (showGeneralEncounterModal) {
        if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') {
          e.preventDefault();
          setShowGeneralEncounterModal(false);
          setGameState((prev) => ({
            ...prev,
            phase: 'BOSS_BATTLE',
          }));
          return;
        }
      }

      // 優先序 3：卡牌事件跳接連動視窗 (A -> B card jump)
      if (pendingEventTransition) {
        if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') {
          e.preventDefault();
          const trans = pendingEventTransition;
          setPendingEventTransition(null);
          const finalRound = Math.min(30, trans.nextRound);
          const targetCardName = trans.targetCard?.name || '未知卡牌';
          addLog(
            `【事件連動】時空流轉至第 ${finalRound} 回合，直接遭遇【${targetCardName}】！`,
            'milestone'
          );
          setGameState((prev) => ({
            ...prev,
            round: finalRound,
            inventory: trans.nextInventory,
            itemAcquisitionOrder: trans.nextItemOrder || Object.keys(trans.nextInventory),
            flags: trans.nextFlags,
            stats: trans.nextStats,
            character: trans.nextCharacter,
            revealedCard: trans.targetCard,
            phase: 'REVEAL_CARD',
          }));
          checkAchievements(trans.nextInventory);
          return;
        }
      }

      // 優先序 4：化身盲抽確認視窗
      if (showCharConfirmModal && pendingCharacter) {
        if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') {
          e.preventDefault();
          const char = pendingCharacter;
          setShowCharConfirmModal(false);
          setPendingCharacter(null);
          if (char) {
            handleSelectCharacter(char);
          }
          return;
        }
      }

      // 優先序 5：體力耗盡失敗處罰視窗
      if (showUnopenedLetterAmbushModal) {
        if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') {
          e.preventDefault();
          setShowUnopenedLetterAmbushModal(false);
          setGameState((prev) => ({
            ...prev,
            flags: {
              ...prev.flags,
              general_immediate_next_round: false,
              ready_for_general: true,
            },
            phase: 'BOSS_BATTLE',
          }));
          setShowGeneralEncounterModal(true);
          return;
        }
      }

      if (showApExhaustedModal) {
        if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') {
          e.preventDefault();
          handleConfirmApExhausted();
          return;
        }
      }

      // ESC 鍵關閉其他資訊視窗
      if (e.key === 'Escape') {
        if (showCompendium) {
          e.preventDefault();
          setShowCompendium(false);
        } else if (showHallOfFame) {
          e.preventDefault();
          setShowHallOfFame(false);
        } else if (showDevModal) {
          e.preventDefault();
          setShowDevModal(false);
        } else if (showDevPasswordModal) {
          e.preventDefault();
          setShowDevPasswordModal(false);
        } else if (showNewGamePlusModal || showWipeMemoryModal) {
          e.preventDefault();
          setShowNewGamePlusModal(false);
          setShowWipeMemoryModal(false);
        } else if (showGuideBlacksmithModal) {
          e.preventDefault();
          setShowGuideBlacksmithModal(false);
        } else if (showExchangeInstrumentModal) {
          e.preventDefault();
          setShowExchangeInstrumentModal(false);
        } else if (showUpgradeClockModal) {
          e.preventDefault();
          setShowUpgradeClockModal(false);
        } else if (showUpgradeTimeMachineModal) {
          e.preventDefault();
          setShowUpgradeTimeMachineModal(false);
        } else if (showFlightTimeMachineModal) {
          e.preventDefault();
          setShowFlightTimeMachineModal(false);
        } else if (showBlacksmithModal) {
          e.preventDefault();
          setShowBlacksmithModal(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    outcomeModal,
    rewindClockNotice,
    showGeneralEncounterModal,
    pendingEventTransition,
    showCharConfirmModal,
    pendingCharacter,
    showApExhaustedModal,
    showUnopenedLetterAmbushModal,
    showGuideBlacksmithModal,
    showExchangeInstrumentModal,
    showUpgradeClockModal,
    showUpgradeTimeMachineModal,
    showFlightTimeMachineModal,
    showBlacksmithModal,
    showCompendium,
    showHallOfFame,
    showDevModal,
    showDevPasswordModal,
    showNewGamePlusModal,
    showWipeMemoryModal,
    showcaseCard,
    handleCloseShowcase,
    addLog,
    checkAchievements,
    handleSelectCharacter,
  ]);

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
      ninjaChasing: false,
      ninjaNextEncounterRound: null,
      fireworksBurning: false,
      blacksmithUnlocked: false,
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

  return (
    <div className="min-h-screen w-full bg-[#0a0a0d] text-[#e0deda] font-sans antialiased flex flex-col items-center select-none overflow-x-hidden">
      {/* Top Universal App Header */}
      <header className="w-full bg-[#121215] border-b border-stone-800 px-6 py-3 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
        <div>
          <h1 className="text-sm font-black text-amber-100 tracking-wider font-serif">
            周杰倫歌曲卡牌冒險
          </h1>
          <p className="text-[10px] text-stone-500 font-mono tracking-tight">
            JAY CHOU SONG CARD ADVENTURE
          </p>
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

          {/* 傳奇殿堂：全通關取得戰績卡後方才解鎖顯示 */}
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

          {/* 開啟新周目：初始就開放，隨時可讓玩家重新挑戰以拚更少局數 */}
          <button
            id="start-new-cycle-btn"
            onClick={() => setShowNewGamePlusModal(true)}
            className="px-3 py-1.5 rounded-lg bg-stone-900/90 hover:bg-red-950/50 text-stone-300 hover:text-red-300 border border-stone-800 hover:border-red-900/70 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm animate-in fade-in"
            title="開啟新周目重新挑戰（傳奇殿堂戰績卡完整保留，以最少局數與回合挑戰巔峰成績）"
          >
            <span>🔄</span>
            <span>開啟新周目</span>
          </button>

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

          {/* 重啟當前局 */}
          <button
            id="restart-game-btn"
            onClick={handleRestartCurrentGame}
            title="重新開始當前局（保持當前局數，重返第 1 回合）"
            className="hidden sm:flex px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-amber-200 border border-stone-800 text-xs font-medium transition-all cursor-pointer"
          >
            重啟當前局
          </button>
        </div>
      </header>

      {/* Main Three-Column Viewport: Left(A+D), Center(B+C), Right(E) */}
      <main className="w-full max-w-[1760px] flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 p-4 lg:p-6 items-start">
        {/* ======================================================== */}
        {/* LEFT COLUMN: A.當前化身 + D.行囊狀態 (加寬版面) */}
        {/* ======================================================== */}
        <div className="lg:col-span-4 xl:col-span-4 flex flex-col gap-4 w-full">
          {/* A. 角色欄 (當前化身) */}
          <CharacterPanel
            character={effectiveCharacter}
            stats={gameState.stats}
            jokerSlots={gameState.jokerSlots}
            inventory={gameState.inventory}
            blacksmithUnlocked={Boolean(gameState.blacksmithUnlocked || gameState.flags['blacksmith_unlocked'])}
            onOpenBlacksmith={() => setShowBlacksmithModal(true)}
            onEquipJokerSlot={handleEquipJoker}
            onUnequipJokerSlot={handleUnequipJoker}
          />

          {/* D. 行囊狀態 (置於角色欄下方) */}
          <InventoryGrid
            inventory={gameState.inventory}
            onItemClick={handleInventoryItemClick}
          />
        </div>

        {/* ======================================================== */}
        {/* CENTER COLUMN: B.回合資訊欄 + C.中央舞台 */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col gap-4 w-full">
          {/* B. 回合資訊欄: 依需求顯示為 "第X局 - 第X/30回合" */}
          <div className="w-full bg-[#141417] border border-stone-800 rounded-xl px-5 py-3.5 flex items-center justify-between shadow-sm flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="text-base lg:text-lg font-black text-[#d4af37] font-serif tracking-wider">
                第 {gameState.gameNumber} 局 - 第 {gameState.round}/{gameState.maxRounds} 回合
              </span>
              {gameState.phase === 'CHOOSE_CHARACTER' && (
                <span className="text-xs text-stone-400 font-serif">
                  （盲抽化身）
                </span>
              )}
            </div>

            {/* 環境狀態 (Environment Status) - 紅框閃爍標籤區，各環境變化可共存各自作用 */}
            <div className="flex items-center gap-2 flex-wrap">
              {Boolean(gameState.flags['chaos_era_active'] || gameState.flags['chaos_era_obtained']) && (
                <span
                  title="環境狀態：亂舞春秋時代（時空震盪，戰亂降臨）"
                  className="text-[11px] sm:text-xs bg-red-950 text-red-300 border border-red-800 px-2.5 py-0.5 rounded font-mono font-bold animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.25)]"
                >
                  亂舞春秋時代
                </span>
              )}

              {Boolean(gameState.ninjaChasing) && (
                <span
                  title="環境狀態：追逐忍者（忍者正朝著第 30 回合狂奔）"
                  className="text-[11px] sm:text-xs bg-red-950 text-red-300 border border-red-800 px-2.5 py-0.5 rounded font-mono font-bold animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.25)]"
                >
                  忍者前進到第 {gameState.ninjaRound || (gameState.round + 1)} 回合
                </span>
              )}

              {Boolean(gameState.fireworksBurning) && (
                <span
                  id="env-fireworks-burning-badge"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'copy';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const itemName = e.dataTransfer.getData('text/plain');
                    if (itemName) {
                      handleDropOnFireworks(itemName);
                    }
                  }}
                  title="環境狀態：煙火燃燒！每三回合燒毀一樣物品。請盡速滅火！"
                  className="text-[11px] sm:text-xs bg-red-950 text-red-300 border border-red-800 hover:border-amber-400 hover:text-amber-200 px-2.5 py-0.5 rounded font-mono font-bold animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.25)] transition-all cursor-pointer select-none"
                >
                  煙火燃燒
                </span>
              )}
            </div>
          </div>

          {/* 煙火燃燒通知橫幅 */}
          {gameState.burntItemNotice && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
              }}
              onDrop={(e) => {
                e.preventDefault();
                const itemName = e.dataTransfer.getData('text/plain');
                if (itemName) {
                  handleDropOnFireworks(itemName);
                }
              }}
              className="w-full bg-red-950/95 border border-red-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-red-200 flex items-center justify-between gap-2 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300"
            >
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg">🔥</span>
                <span className="font-bold text-red-300">【煙火燃燒通知】</span>
                <span>{gameState.burntItemNotice}</span>
              </div>
              <button
                onClick={() => setGameState((prev) => ({ ...prev, burntItemNotice: null }))}
                className="text-stone-400 hover:text-white text-xs px-2 py-0.5 rounded bg-black/40 border border-stone-700 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

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
                        triggerJayQuote();
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
                onRestartNewGame={() => {
                  triggerNextGameWithIronBoxCheck(() => {
                    handleStartNextGame();
                  });
                }}
                onRewindWithClock={handleRewindWithClock}
                onTriggerJayQuote={triggerJayQuote}
              />
            )}
          </div>

          {/* 進程目標 (置於抽卡區下方) */}
          <div className="w-full bg-[#141417] border border-stone-800/90 rounded-xl px-4 py-3 flex flex-col gap-2.5 shadow-sm">
            <div className="border-b border-stone-800/60 pb-1.5">
              <span className="text-xs font-bold text-amber-200/90 tracking-wider font-serif">
                進程目標
              </span>
            </div>
            <div className="flex flex-col gap-2 text-xs font-mono">
              {/* 路線 1: 《太陽之子》 */}
              <div className="flex items-center flex-wrap gap-1.5 text-stone-300">
                {!routeProgress.hasSunGuide ? (
                  <span className="text-stone-400 font-serif">路線 - ( ???? )</span>
                ) : (
                  <>
                    <span className="text-stone-400 font-serif">這是條充滿戰鬥的路 - (</span>
                    <div className="inline-flex items-center gap-1.5">
                      {/* 平定對手 */}
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-sans font-bold transition-all ${
                          routeProgress.isStep1Done
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-500/70 shadow-[0_0_8px_rgba(245,158,11,0.25)]'
                            : 'bg-stone-900/60 text-stone-500 border border-stone-800'
                        }`}
                        title={
                          routeProgress.isStep1Done
                            ? '四方宿敵已全數平定 (4/4)'
                            : `平定進度 (${routeProgress.defeatedCount}/4)`
                        }
                      >
                        平定對手
                      </span>
                      <span className="text-stone-600">/</span>
                      {/* 時代轉換 */}
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-sans font-bold transition-all ${
                          routeProgress.isStep2Done
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-500/70 shadow-[0_0_8px_rgba(245,158,11,0.25)]'
                            : 'bg-stone-900/60 text-stone-500 border border-stone-800'
                        }`}
                        title={
                          routeProgress.isStep2Done
                            ? '已步入亂舞春秋戰亂時代'
                            : '尚未進入亂舞春秋時代'
                        }
                      >
                        時代轉換
                      </span>
                      <span className="text-stone-600">/</span>
                      {/* 最終決戰 */}
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-sans font-bold transition-all ${
                          routeProgress.isStep3Done
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-500/70 shadow-[0_0_8px_rgba(245,158,11,0.25)]'
                            : 'bg-stone-900/60 text-stone-500 border border-stone-800'
                        }`}
                        title={
                          routeProgress.isStep3Done
                            ? '已獲最後的戰役軍令，第30回合決戰將軍'
                            : '尚未獲得最後的戰役'
                        }
                      >
                        最終決戰
                      </span>
                    </div>
                    <span className="text-stone-400 font-serif">)</span>
                  </>
                )}
              </div>

              {/* 路線 2: 目前不顯示真名 */}
              <div className="flex items-center gap-1.5 text-stone-500">
                <span className="font-serif">路線 -</span>
                <span>( ???? )</span>
              </div>

              {/* 路線 3: 目前不顯示真名 */}
              <div className="flex items-center gap-1.5 text-stone-500">
                <span className="font-serif">路線 -</span>
                <span>( ???? )</span>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: E.冒險日誌 (獨立置於右側) */}
        {/* ======================================================== */}
        <div className="lg:col-span-3 xl:col-span-3 flex flex-col gap-4 w-full">
          <AdventureLog logs={gameState.logs} jayQuote={jayQuote} />
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
          currentCharacterId={gameState.character?.id}
          inventory={gameState.inventory}
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
          onRemoveItem={(item) => {
            setGameState((prev) => {
              const nextInv = { ...prev.inventory };
              delete nextInv[item];
              return { ...prev, inventory: nextInv };
            });
            addLog(`【開發者指令】已從行囊移除【${item}】。`, 'action');
          }}
          onToggleItem={(item, defaultCount = 1) => {
            setGameState((prev) => {
              const nextInv = { ...prev.inventory };
              const current = nextInv[item] || 0;
              if (current > 0) {
                delete nextInv[item];
                addLog(`【開發者指令】已關閉/移除【${item}】。`, 'action');
              } else {
                nextInv[item] = defaultCount;
                addLog(`【開發者指令】已開啟/加入【${item}】${defaultCount > 1 ? ` (x${defaultCount})` : ''}。`, 'milestone');
              }
              return { ...prev, inventory: nextInv };
            });
          }}
          onSetItemCount={(item, count) => {
            setGameState((prev) => {
              const nextInv = { ...prev.inventory };
              if (count <= 0) {
                delete nextInv[item];
                addLog(`【開發者指令】已清空【${item}】。`, 'action');
              } else {
                nextInv[item] = count;
                addLog(`【開發者指令】設定【${item}】數量為 ${count}。`, 'action');
              }
              return { ...prev, inventory: nextInv };
            });
          }}
          onAddMultipleItems={(items) => {
            setGameState((prev) => {
              const nextInv = { ...prev.inventory };
              items.forEach((it) => {
                nextInv[it] = (nextInv[it] || 0) + 1;
              });
              return { ...prev, inventory: nextInv };
            });
            addLog(`【開發者指令】批量更新道具：${items.join('、')}。`, 'milestone');
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
            setShowGeneralEncounterModal(true);
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
          isChaosEraActive={Boolean(gameState.flags['chaos_era_active'] || gameState.flags['chaos_era_obtained'])}
          onToggleChaosEra={(active) => {
            setGameState((prev) => ({
              ...prev,
              flags: {
                ...prev.flags,
                chaos_era_active: active,
                chaos_era_obtained: active,
              },
            }));
            addLog(`【開發測試】${active ? '啟動' : '關閉'}【亂舞春秋時代】環境狀態。`, 'milestone');
          }}
          isNinjaChasing={Boolean(gameState.ninjaChasing)}
          onToggleNinjaChase={(active) => {
            setGameState((prev) => ({
              ...prev,
              ninjaChasing: active,
              ninjaRound: active ? Math.min(29, prev.round + 2) : undefined,
              ninjaNextEncounterRound: active ? Math.min(29, prev.round + 2) : null,
              flags: {
                ...prev.flags,
                ninja_chasing: active,
                ninja_round: active ? Math.min(29, prev.round + 2) : undefined,
              },
            }));
            addLog(`【開發測試】${active ? '開啟' : '解除'}【追逐忍者】環境狀態。`, 'milestone');
          }}
          isFireworksBurning={Boolean(gameState.fireworksBurning)}
          onToggleFireworks={(active) => {
            setGameState((prev) => ({
              ...prev,
              fireworksBurning: active,
              flags: {
                ...prev.flags,
                fireworks_burning: active,
              },
            }));
            addLog(`【開發測試】${active ? '開啟' : '熄滅'}【煙火燃燒】環境狀態。`, 'milestone');
          }}
          isBlacksmithUnlocked={Boolean(gameState.blacksmithUnlocked || gameState.flags['blacksmith_unlocked'])}
          onToggleBlacksmith={(active) => {
            setGameState((prev) => ({
              ...prev,
              blacksmithUnlocked: active,
              flags: {
                ...prev.flags,
                blacksmith_unlocked: active,
              },
            }));
            addLog(`【開發測試】${active ? '開啟' : '關閉'}【米蘭小鐵鋪常駐】狀態。`, 'milestone');
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

      {/* 開啟新周目 / Universal Memory Wipe Modal - 等比放大 */}
      {(showNewGamePlusModal || showWipeMemoryModal) && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg sm:max-w-xl bg-gradient-to-b from-[#1c1414] via-[#140e0e] to-[#0a0707] border-2 border-red-700/80 rounded-2xl p-7 sm:p-9 shadow-[0_0_40px_rgba(220,38,38,0.3)] flex flex-col gap-5 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-950/60 border border-red-600 flex items-center justify-center mx-auto text-3xl sm:text-4xl text-red-400 shadow-inner">
              🔄
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-red-300 font-serif">
                開啟新周目・重新挑戰
              </h3>
              <p className="text-sm sm:text-base text-stone-300 mt-2.5 font-sans leading-relaxed">
                確定要開啟新周目重新挑戰嗎？
                <br />
                <span className="text-amber-300 font-bold">
                  為確保挑戰的純粹性與成績的公平真實，開啟新周目將會【全數清空】所有紀錄！
                </span>
              </p>
            </div>

            <div className="bg-black/60 border border-stone-800 rounded-xl p-4 sm:p-5 text-left text-xs sm:text-sm text-stone-300 space-y-2.5 font-sans">
              <div className="flex items-center gap-2 text-amber-300 font-bold bg-amber-950/40 p-2.5 rounded-lg border border-amber-700/60">
                <span className="text-lg text-amber-400">🛡️</span>
                <span>【傳奇殿堂戰績卡永久保存】過往所有已獲得的全通關評級戰績將完整珍藏，不會丟失！</span>
              </div>
              <div className="flex items-center gap-2 text-stone-300">
                <span className="text-red-400 font-bold">✕</span>
                <span>已解鎖歌曲圖鑑全數歸零 (0/63)</span>
              </div>
              <div className="flex items-center gap-2 text-stone-300">
                <span className="text-red-400 font-bold">✕</span>
                <span>各主線通關進度重新開始</span>
              </div>
              <div className="flex items-center gap-2 text-stone-300">
                <span className="text-red-400 font-bold">✕</span>
                <span>全域成就與特質加成重新挑戰</span>
              </div>
              <div className="flex items-center gap-2 text-stone-300">
                <span className="text-red-400 font-bold">✕</span>
                <span>當前行囊道具與鐵盒遺物清空</span>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-stone-800 text-amber-300/90 font-sans">
                <span>✦</span>
                <span>重返第 1 局最初起點，以更少局數衝刺更高的綜合評級！</span>
              </div>
            </div>

            <div className="flex gap-3.5 mt-2">
              <button
                id="cancel-new-cycle-btn"
                onClick={() => {
                  setShowNewGamePlusModal(false);
                  setShowWipeMemoryModal(false);
                }}
                className="flex-1 py-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-sm sm:text-base font-bold transition-all cursor-pointer"
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
                className="flex-1 py-3.5 rounded-xl bg-red-900/90 hover:bg-red-700 text-white text-sm sm:text-base font-black border border-red-600 transition-all cursor-pointer shadow-md active:scale-98"
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
          <div className="relative w-full max-w-lg sm:max-w-xl">
            {pendingCharacter.id === 'char_chopin' && (
              <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 opacity-75 blur-xl animate-pulse pointer-events-none" />
            )}

            <div
              className={`relative w-full bg-gradient-to-b ${
                pendingCharacter.id === 'char_chopin'
                  ? 'from-[#2e240e] via-[#1a150b] to-[#0d0a06] border-2 border-amber-400 shadow-[0_0_50px_rgba(245,158,11,0.6)]'
                  : 'from-[#1b1a20] via-[#141318] to-[#0c0c10] border-2 border-[#d4af37]/80 shadow-2xl'
              } rounded-2xl p-7 sm:p-9 flex flex-col items-center text-center gap-5 sm:gap-6`}
            >
              <div className="w-full flex items-center justify-between border-b border-stone-800 pb-2.5">
                <span className="text-sm sm:text-base text-[#d4af37] font-mono tracking-widest uppercase font-bold flex items-center gap-2">
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
                <span className="text-xs text-stone-500 font-mono">
                  {pendingCharacter.id === 'char_chopin' ? 'SS RANK UNLOCKED' : 'CHARACTER CONFIRMATION'}
                </span>
              </div>

              {pendingCharacter.id === 'char_chopin' && (
                <div className="flex items-center gap-2 text-amber-300 text-sm sm:text-base font-bold font-serif animate-bounce">
                  <span>🎹</span>
                  <span>夜曲奏鳴・十一月的浪漫琴音穿透時空！</span>
                  <span>🎵</span>
                </div>
              )}

              <div
                className={`${
                  pendingCharacter.id === 'char_chopin'
                    ? 'w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 ring-4 ring-amber-400/50 shadow-[0_0_35px_rgba(251,191,36,0.9)] animate-pulse'
                    : 'w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br ' + pendingCharacter.avatarColor + ' shadow-xl'
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
                    className={`text-2xl sm:text-3xl font-black font-serif ${
                      pendingCharacter.id === 'char_chopin'
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-amber-300 to-yellow-200'
                        : 'text-amber-100'
                    }`}
                  >
                    {pendingCharacter.name}
                  </h3>
                  {pendingCharacter.id === 'char_chopin' && (
                    <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-950 text-xs font-black px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                      SS RANK
                    </span>
                  )}
                </div>
                <p className="text-sm sm:text-base text-[#d4af37] mt-1 font-sans font-medium">
                  {pendingCharacter.title}
                </p>
              </div>

              <div className="w-full bg-black/40 border border-stone-800 rounded-xl p-5 sm:p-6 text-sm sm:text-base text-stone-300 leading-relaxed text-left font-sans">
                {pendingCharacter.description}
              </div>

              <button
                id="confirm-start-adventure-btn"
                onClick={() => {
                  const char = pendingCharacter;
                  setShowCharConfirmModal(false);
                  setPendingCharacter(null);
                  if (char) {
                    handleSelectCharacter(char);
                  }
                }}
                className={`w-full py-3.5 sm:py-4 rounded-xl ${
                  pendingCharacter.id === 'char_chopin'
                    ? 'bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 text-stone-950 font-black shadow-[0_0_25px_rgba(251,191,36,0.7)] animate-pulse'
                    : 'bg-gradient-to-r from-amber-600 via-[#d4af37] to-amber-500 text-stone-950 font-black shadow-[0_4px_18px_rgba(212,175,55,0.35)]'
                } text-base sm:text-lg tracking-wider hover:brightness-110 transition-all cursor-pointer mt-2 active:scale-98`}
              >
                {pendingCharacter.id === 'char_chopin'
                  ? '奏響琴弦・傳奇啟程！'
                  : '確認化身・冒險開始！'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Linkage Transition Modal (事件連動包含抽到A卡連動到B卡，跳出確認視窗說明發生效果與按鈕) - 放大字體與加大視窗 */}
      {pendingEventTransition && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg sm:max-w-xl bg-gradient-to-b from-[#1c1822] via-[#14121a] to-[#0c0a10] border-2 border-purple-500/80 rounded-2xl p-7 sm:p-9 shadow-[0_0_50px_rgba(168,85,247,0.4)] flex flex-col items-center text-center gap-5 sm:gap-6">
            <div className="w-full flex items-center justify-between border-b border-purple-900/60 pb-3">
              <span className="text-sm sm:text-base text-purple-300 font-mono tracking-widest uppercase font-bold flex items-center gap-2">
                <span>✦</span>
                <span>劇情連動觸發</span>
                <span>✦</span>
              </span>
              <span className="text-xs text-purple-400/80 font-mono bg-purple-950/80 border border-purple-800/60 px-2.5 py-0.5 rounded">
                EVENT LINKAGE
              </span>
            </div>

            {/* Sequence flow indication */}
            <div className="flex items-center gap-3 text-base sm:text-lg font-serif bg-black/60 px-6 py-3 rounded-xl border border-purple-700/60 shadow-inner">
              <span className="text-stone-300 font-bold">
                【{pendingEventTransition.sourceCardName}】
              </span>
              <span className="text-purple-400 font-bold text-lg sm:text-xl">➔</span>
              <span className="text-amber-300 font-bold">
                【{pendingEventTransition.targetCard?.name || '未知卡牌'}】
              </span>
            </div>

            {/* Narrative explanation */}
            <div className="w-full bg-purple-950/30 border border-purple-800/60 rounded-xl p-5 sm:p-6 text-sm sm:text-base text-purple-100 leading-relaxed text-left font-sans shadow-sm">
              <p className="font-medium text-stone-100 mb-3 leading-relaxed">
                {pendingEventTransition.effectNarrative}
              </p>
              <p className="text-xs sm:text-sm text-purple-300/80 border-t border-purple-800/40 pt-2.5 font-mono">
                ※ 時序流轉至第 {Math.min(30, pendingEventTransition.nextRound)} 回合，宿命引領你直接邁入下一張連動卡牌！
              </p>
            </div>

            <button
              id="confirm-event-transition-btn"
              onClick={() => {
                const trans = pendingEventTransition;
                setPendingEventTransition(null);

                const finalRound = Math.min(30, trans.nextRound);
                const targetCardName = trans.targetCard?.name || '未知卡牌';
                addLog(
                  `【事件連動】時空流轉至第 ${finalRound} 回合，直接遭遇【${targetCardName}】！`,
                  'milestone'
                );

                setGameState((prev) => ({
                  ...prev,
                  round: finalRound,
                  inventory: trans.nextInventory,
                  itemAcquisitionOrder: trans.nextItemOrder || Object.keys(trans.nextInventory),
                  flags: trans.nextFlags,
                  stats: trans.nextStats,
                  character: trans.nextCharacter,
                  revealedCard: trans.targetCard,
                  phase: 'REVEAL_CARD',
                }));

                checkAchievements(trans.nextInventory);
              }}
              className="w-full py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-700 hover:brightness-110 text-white font-black text-base sm:text-lg tracking-wider shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all cursor-pointer active:scale-98 mt-1"
            >
              下回合進入【{pendingEventTransition.targetCard?.name || '下一卡牌'}】
            </button>
          </div>
        </div>
      )}

      {/* AP Exhausted Modal (行動力歸0，失敗處罰：局數+1，物品清空，保留圖鑑與回憶) - 等比放大 */}
      {showApExhaustedModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-lg sm:max-w-xl bg-gradient-to-b from-[#240e0e] via-[#170a0a] to-[#0d0505] border-2 border-red-700/80 rounded-2xl p-7 sm:p-9 shadow-2xl flex flex-col items-center text-center gap-5 sm:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-950/60 border-2 border-red-600 flex items-center justify-center text-4xl sm:text-5xl shadow-[0_0_25px_rgba(239,68,68,0.35)]">
              ⚡
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-serif tracking-wider">
                行動力耗盡・冒險失敗重生
              </h3>
              <p className="text-xs sm:text-sm text-red-300/80 font-mono mt-1 uppercase">
                ACTION POINTS DEPLETED・FAILURE PENALTY APPLIED
              </p>
            </div>

            <div className="text-sm sm:text-base text-stone-200 leading-relaxed font-sans bg-black/50 border border-stone-800 rounded-xl p-5 sm:p-6 text-left space-y-3">
              <p>
                此局行動力已耗盡！你的身體已達極限，不得不就地重整。請重生進入下一局（<span className="text-amber-300 font-bold">行囊物品清空</span>，但<span className="text-amber-300 font-bold">全域歌曲圖鑑與歷史成就將永久保留</span>）。
              </p>
              <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-900/60 text-red-200 text-xs sm:text-sm font-sans">
                ⚠️ <span className="font-bold">失敗處罰機制</span>：本次行動力耗盡導致重生，使你的【總結算局數 +1】。局數越少代表最終通關成績越好；若頻繁耗盡行動力，累積過多局數將嚴重拉低最終通關評級！
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-3 text-xs sm:text-sm font-mono bg-black/40 border border-stone-800 rounded-xl p-3.5 sm:p-4">
              <div className="text-stone-400">力竭局數：<span className="text-stone-200 font-bold">第 {gameState.gameNumber} 局</span></div>
              <div className="text-stone-400">處罰後局數：<span className="text-red-400 font-bold">第 {gameState.gameNumber + 1} 局</span></div>
            </div>

            <button
              id="confirm-ap-depleted-btn"
              onClick={handleConfirmApExhausted}
              className="w-full py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-amber-700 text-white font-black text-base sm:text-lg tracking-wider hover:brightness-110 transition-all shadow-[0_4px_18px_rgba(239,68,68,0.35)] cursor-pointer active:scale-98"
            >
              確認重生・進入第 {gameState.gameNumber + 1} 局
            </button>
          </div>
        </div>
      )}

      {/* 不拆信強襲過場提醒視窗 (三張卡在眼前，彈出警示視窗) - 等比放大 */}
      {showUnopenedLetterAmbushModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg sm:max-w-xl bg-gradient-to-b from-[#2a0e0e] via-[#1a0707] to-[#0c0303] border-2 border-red-600 rounded-2xl p-7 sm:p-9 shadow-[0_0_50px_rgba(239,68,68,0.5)] flex flex-col items-center text-center gap-5 sm:gap-6">
            <div className="w-full flex items-center justify-between border-b border-red-900/60 pb-2.5">
              <span className="text-sm sm:text-base text-amber-400 font-mono tracking-widest uppercase font-bold flex items-center gap-1.5">
                <span>✦</span>
                <span>強襲突圍・無法抽卡</span>
                <span>✦</span>
              </span>
              <span className="text-xs sm:text-sm text-red-400 font-mono font-bold">
                第 {gameState.round} 回合
              </span>
            </div>

            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-950/80 border border-red-600/80 flex items-center justify-center text-4xl sm:text-5xl shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse">
              ⚔️
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-black text-red-100 font-serif tracking-wide">
                戰書未啟・大軍壓境
              </h3>
              <p className="text-sm sm:text-base text-red-200 font-sans leading-relaxed font-semibold">
                因為你不拆信，將軍親臨現場決戰，所以這回合無法抽卡。
              </p>
            </div>

            <button
              id="confirm-ambush-boss-battle"
              onClick={() => {
                setShowUnopenedLetterAmbushModal(false);
                setGameState((prev) => ({
                  ...prev,
                  flags: {
                    ...prev.flags,
                    general_immediate_next_round: false,
                    ready_for_general: true,
                  },
                  phase: 'BOSS_BATTLE',
                }));
                setShowGeneralEncounterModal(true);
              }}
              className="w-full py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-amber-700 hover:brightness-110 text-white font-black text-base sm:text-lg tracking-wider shadow-[0_0_25px_rgba(239,68,68,0.4)] transition-all cursor-pointer active:scale-98"
            >
              應戰將軍・進入決戰
            </button>
          </div>
        </div>
      )}

      {/* Boss General Encounter Intro Modal (進入決戰將軍前的專屬過場提醒視窗) - 等比放大 */}
      {showGeneralEncounterModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-lg sm:max-w-xl bg-gradient-to-b from-[#2a1010] via-[#1a0808] to-[#0c0404] border-2 border-red-600/90 rounded-2xl p-7 sm:p-9 shadow-[0_0_50px_rgba(239,68,68,0.4)] flex flex-col items-center text-center gap-5 sm:gap-6">
            <div className="w-full flex items-center justify-between border-b border-red-900/60 pb-2.5">
              <span className="text-sm sm:text-base text-amber-400 font-mono tracking-widest uppercase font-bold flex items-center gap-1.5">
                <span>✦</span>
                <span>決戰時刻降臨</span>
                <span>✦</span>
              </span>
              <span className="text-xs sm:text-sm text-stone-400 font-mono">
                {`第 ${gameState.round} 回合 決戰降臨`}
              </span>
            </div>

            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-red-950/60 border border-red-500/80 flex items-center justify-center text-4xl sm:text-5xl shadow-[0_0_30px_rgba(239,68,68,0.4)] my-1">
              <span>⚔️</span>
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-amber-100 font-serif tracking-wide">
                {`來到第 ${gameState.round} 回合・將軍與您決戰！`}
              </h3>
              <p className="text-sm sm:text-base text-red-300 font-serif mt-1.5 italic">
                「時間的箭頭 指向最後的戰役」
              </p>
            </div>

            <div className="w-full bg-black/60 border border-red-900/50 rounded-xl p-5 sm:p-6 text-sm sm:text-base text-stone-100 leading-relaxed text-left space-y-3 font-sans">
              <p>
                決戰終局吹響號角！統帥【將軍】親臨戰場與你一決勝負！
              </p>
              <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800 text-amber-200 text-xs sm:text-sm font-sans">
                ⚠️ <span className="font-bold text-amber-100">決戰規則提醒</span>：你只有 <span className="font-bold text-red-300">8 回合</span>的機會！若未能在此限期內破除將軍防線並予以擊潰，氣力耗竭將全盤皆輸！
              </div>
            </div>

            <button
              id="confirm-general-encounter-btn"
              onClick={() => {
                setShowGeneralEncounterModal(false);
                setGameState((prev) => ({
                  ...prev,
                  phase: 'BOSS_BATTLE',
                }));
              }}
              className="w-full py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-amber-700 hover:brightness-110 text-white font-black text-base sm:text-lg tracking-wider shadow-[0_0_25px_rgba(239,68,68,0.4)] transition-all cursor-pointer active:scale-98"
            >
              應戰將軍・進入決戰（限8回合）
            </button>
          </div>
        </div>
      )}

      {/* 追上忍者專屬通知視窗 (先告知玩家追上了，點選確認後跳轉至遭遇戰) */} //已完成
      {ninjaCaughtNotice && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg sm:max-w-xl bg-gradient-to-b from-[#221316] via-[#170e10] to-[#0c0809] border-2 border-red-600/80 rounded-2xl p-7 sm:p-9 shadow-[0_0_50px_rgba(239,68,68,0.4)] flex flex-col items-center text-center gap-5 sm:gap-6">
            <div className="w-full flex items-center justify-between border-b border-red-900/60 pb-3">
              <span className="text-sm sm:text-base text-red-400 font-mono tracking-widest uppercase font-bold flex items-center gap-2">
                <span>✦</span>
                <span>疾風追逐・追上了！</span>
                <span>✦</span>
              </span>
              <span className="text-xs text-red-400/80 font-mono bg-red-950/80 border border-red-800/60 px-2.5 py-0.5 rounded">
                SPECIAL EVENT
              </span>
            </div>

            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-red-950/50 border border-red-600/70 flex items-center justify-center text-4xl sm:text-5xl shadow-[0_0_25px_rgba(239,68,68,0.3)] my-1">
              <span>🥷</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <h3 className="text-2xl sm:text-3xl font-black text-stone-100 font-serif tracking-wide">
                追上了！
              </h3>
              <p className="text-sm sm:text-base text-red-300 font-serif font-bold">
                你在第 {ninjaCaughtNotice.round} 回合成功追上了伊賀忍者！
              </p>
            </div>

            {/* Narrative text - 放大字體 */}
            <div className="w-full bg-black/60 border border-red-900/60 rounded-xl p-5 sm:p-6 text-sm sm:text-base text-stone-100 leading-relaxed text-left font-sans">
              飛掠的急促黑影驟然停駐，瞬間櫻花落地，神秘感凝結了空氣。伊賀忍者黑夜裡偷襲，以煙霧當武器，目光鎖定著你，一觸即發！
            </div>

            <button
              id="confirm-ninja-caught-modal-btn"
              onClick={() => {
                const card = ninjaCaughtNotice.ninjaCard;
                setNinjaCaughtNotice(null);
                setGameState((prev) => ({
                  ...prev,
                  phase: 'REVEAL_CARD',
                  revealedCard: card,
                }));
              }}
              className="w-full py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-amber-600 text-stone-100 font-black text-base sm:text-lg tracking-wider hover:brightness-110 transition-all shadow-[0_4px_20px_rgba(239,68,68,0.4)] cursor-pointer mt-2 active:scale-98"
            >
              確定（進入遭遇戰）
            </button>
          </div>
        </div>
      )}

      {/* Outcome Confirmation Modal (獲得物品、事件效果、裝備結果彈出確認視窗) - 放大字體與加大視窗 */}
      {outcomeModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg sm:max-w-xl bg-gradient-to-b from-[#1e1c26] via-[#15141c] to-[#0c0c12] border-2 border-amber-600/80 rounded-2xl p-7 sm:p-9 shadow-[0_0_50px_rgba(217,119,6,0.4)] flex flex-col items-center text-center gap-5 sm:gap-6">
            <div className="w-full flex items-center justify-between border-b border-stone-800 pb-2.5">
              <span className="text-sm sm:text-base text-amber-400 font-mono tracking-widest uppercase font-bold flex items-center gap-2">
                <span>✦</span>
                <span>{outcomeModal.title}</span>
                <span>✦</span>
              </span>
              <span className="text-xs text-stone-500 font-mono">
                OUTCOME
              </span>
            </div>

            {outcomeModal.icon && (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-950/40 border border-amber-700/60 flex items-center justify-center text-4xl sm:text-5xl shadow-[0_0_25px_rgba(245,158,11,0.25)] my-1">
                <span>{outcomeModal.icon}</span>
              </div>
            )}

            {outcomeModal.subtitle && (
              <p className="text-sm sm:text-base text-amber-200 font-serif font-bold">
                {outcomeModal.subtitle}
              </p>
            )}

            {/* Narrative text - 放大字體 */}
            <div className="w-full bg-black/60 border border-stone-800 rounded-xl p-5 sm:p-6 text-sm sm:text-base text-stone-100 leading-relaxed text-left font-sans">
              {outcomeModal.narrative}
            </div>

            {/* Badges for rewards / items gained / consumed - 放大字體 */}
            {outcomeModal.badges && outcomeModal.badges.length > 0 && (
              <div className="w-full flex flex-wrap gap-2.5 justify-center">
                {outcomeModal.badges.map((b, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-stone-900 border border-stone-700 text-sm"
                  >
                    <span className="text-stone-400 text-xs sm:text-sm font-sans">{b.label}：</span>
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
              className="w-full py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-amber-600 via-[#d4af37] to-amber-500 text-stone-950 font-black text-base sm:text-lg tracking-wider hover:brightness-110 transition-all shadow-[0_4px_20px_rgba(212,175,55,0.4)] cursor-pointer mt-2 active:scale-98"
            >
              {outcomeModal.confirmText || '確定'}
            </button>
          </div>
        </div>
      )}

      {/* 半島鐵盒・跨局記憶傳承 (當局回合耗盡時詢問選擇保留至多 5 樣卡牌繼承至下一局 NG) */}
      {showIronBoxInheritModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-gradient-to-b from-[#221c13] via-[#16130d] to-[#0c0a07] border-2 border-amber-600/90 rounded-2xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.35)] flex flex-col items-center text-center gap-4">
            <div className="w-full flex items-center justify-between border-b border-amber-900/60 pb-2">
              <span className="text-xs text-amber-400 font-mono tracking-widest uppercase font-bold flex items-center gap-1.5">
                <span>📻</span>
                <span>半島鐵盒・時空傳承</span>
                <span>✦</span>
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-600/40 px-2 py-0.5 rounded font-mono font-bold">
                已選 {selectedIronBoxItems.length} / 10 樣
              </span>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-amber-950/60 border border-amber-500/80 flex items-center justify-center text-3xl shadow-[0_0_25px_rgba(245,158,11,0.3)] my-0.5">
              <span>📻</span>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-black text-amber-100 font-serif tracking-wide">
                第 30 回合結束・半島鐵盒開啟
              </h3>
              <p className="text-xs text-amber-300/80 font-serif mt-1 italic">
                「沉澱的呢喃清唱 封存跨越時空的記憶」
              </p>
            </div>

            <div className="w-full bg-black/50 border border-amber-900/40 rounded-xl p-3 text-xs text-stone-200 leading-relaxed text-left font-sans">
              <p>
                你在此局持有神物【半島鐵盒】！請挑選至多 <span className="text-amber-300 font-bold">10 樣</span> 獲得的卡牌/道具放入鐵盒中（包含半島鐵盒本身亦需勾選方可帶入下一局，無法攜帶的不會出現在下方），它們將跨越時空，於下一局冒險初始時直接隨身出現在你的行囊中：
              </p>
            </div>

            {/* 可選物品清單 */}
            <div className="w-full max-h-56 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2 pr-1 text-left">
              {Object.keys(gameState.inventory)
                .filter((name) => (gameState.inventory[name] || 0) > 0 && !isItemPeninsulaRestricted(name))
                .map((itemName) => {
                  const isSelected = selectedIronBoxItems.includes(itemName);
                  const count = gameState.inventory[itemName];
                  return (
                    <button
                      key={itemName}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedIronBoxItems((prev) => prev.filter((it) => it !== itemName));
                        } else {
                          if (selectedIronBoxItems.length >= 10) {
                            addLog('【半島鐵盒】最多只能挑選 10 樣卡牌繼承至下一局！', 'warning');
                            return;
                          }
                          setSelectedIronBoxItems((prev) => [...prev, itemName]);
                        }
                      }}
                      className={`py-2 px-2.5 rounded-lg border transition-all text-xs font-sans flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-amber-950/80 border-amber-400 text-amber-100 shadow-[0_0_12px_rgba(245,158,11,0.3)] ring-1 ring-amber-400/50'
                          : 'bg-black/40 border-stone-800 text-stone-300 hover:border-stone-600 hover:bg-stone-900/50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs font-mono">{isSelected ? '✅' : '▫️'}</span>
                        <span className="truncate font-bold">{itemName}</span>
                      </div>
                      {count > 1 && (
                        <span className="text-[10px] text-stone-400 font-mono shrink-0 ml-1">
                          x{count}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>

            <div className="w-full flex gap-2.5 mt-1">
              <button
                type="button"
                onClick={() => {
                  setMeta((prev) => ({
                    ...prev,
                    ironBoxItems: selectedIronBoxItems,
                  }));
                  if (selectedIronBoxItems.length > 0) {
                    addLog(
                      `【半島鐵盒】已將【${selectedIronBoxItems.join('、')}】封存，將於下一局冒險繼承出現在行囊中！`,
                      'milestone'
                    );
                  }
                  setShowIronBoxInheritModal(false);
                  pendingNextGameCallback?.();
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 via-[#d4af37] to-amber-500 text-stone-950 font-black text-sm tracking-wider hover:brightness-110 transition-all shadow-[0_4px_18px_rgba(212,175,55,0.35)] cursor-pointer active:scale-98"
              >
                確認封存（{selectedIronBoxItems.length}/10）・邁向下一局冒險
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 米蘭小鐵匠鋪重鑄介面 */}
      {showBlacksmithModal && (
        <BlacksmithModal
          inventory={gameState.inventory}
          onClose={() => setShowBlacksmithModal(false)}
          onTrade={handleBlacksmithTrade}
        />
      )}

      {/* 米蘭小鐵匠指引確認視窗 (持有鄉間的路時抽到米蘭小鐵匠觸發機制2) */} //已完成
      {showGuideBlacksmithModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#141418] border-2 border-amber-500/70 rounded-2xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.9)] flex flex-col gap-4 text-stone-200 font-sans">
            <div className="flex items-center gap-2.5 border-b border-stone-800 pb-3">
              <span className="text-2xl">🌾</span>
              <div>
                <h3 className="text-lg font-bold text-amber-200 font-serif">
                  ✦ 命運指引・鄉間的路 ✦
                </h3>
                <p className="text-xs text-stone-400">
                  遭遇米蘭的小鐵匠・環境變化契機
                </p>
              </div>
            </div>

            <p className="text-base text-stone-300 leading-relaxed">
              你身上正持有【鄉間的路】！
              <br />
              是否要為米蘭的小鐵匠指引鄉間小路，讓小鐵匠願意在鄉村駐留開一間小鐵鋪？
            </p>

            <div className="bg-amber-950/30 border border-amber-600/40 rounded-xl p-3 text-xs text-amber-200/90 leading-relaxed">
              💡 <span className="font-bold">環境變化說明：</span>
              指引後小鐵匠將在鄉村常駐，在角色名稱旁新增「小鐵鋪」按鈕，往後可隨時點開拜訪小鐵匠！
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleDeclineGuideBlacksmith}
                className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                暫不指引
              </button>
              <button
                onClick={handleConfirmGuideBlacksmith}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer hover:scale-102 active:scale-98"
              >
                確認指引
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 米蘭小鐵匠交換樂器確認視窗 (持有烏克麗麗遭遇米蘭小鐵匠時) */}
      {showExchangeInstrumentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#141418] border-2 border-amber-500/70 rounded-2xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.9)] flex flex-col gap-4 text-stone-200 font-sans">
            <div className="flex items-center gap-2.5 border-b border-stone-800 pb-3">
              <span className="text-2xl">🎸</span>
              <div>
                <h3 className="text-lg font-bold text-amber-200 font-serif">
                  ✦ 小鐵匠的心願・一把吉他 ✦
                </h3>
                <p className="text-xs text-stone-400">
                  遭遇米蘭的小鐵匠・你好像有小鐵匠想要的東西
                </p>
              </div>
            </div>

            <p className="text-base text-stone-300 leading-relaxed">
              你身上正持有【烏克麗麗】！
              <br />
              小鐵匠一心想買把吉他隨興彈唱，是否願意將【烏克麗麗】送給小鐵匠？
            </p>

            <div className="bg-amber-950/30 border border-amber-600/40 rounded-xl p-3 text-xs text-amber-200/90 leading-relaxed">
              💡 <span className="font-bold">交換物品說明：</span>
              贈送 1 把【烏克麗麗】，完成小鐵匠的心願。
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleDeclineExchangeInstrument}
                className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                保留【烏克麗麗】
              </button>
              <button
                onClick={handleConfirmExchangeInstrument}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer hover:scale-102 active:scale-98"
              >
                確認交換
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 米蘭小鐵匠改造鐘錶確認視窗 (持有反方向的鐘遭遇米蘭小鐵匠時) */}
      {showUpgradeClockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#141418] border-2 border-amber-500/70 rounded-2xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.9)] flex flex-col gap-4 text-stone-200 font-sans">
            <div className="flex items-center gap-2.5 border-b border-stone-800 pb-3">
              <span className="text-2xl">🕰️</span>
              <div>
                <h3 className="text-lg font-bold text-amber-200 font-serif">
                  ✦ 重鑄鐘錶・大笨鐘 ✦
                </h3>
                <p className="text-xs text-stone-400">
                  遭遇米蘭的小鐵匠・改造鐘錶
                </p>
              </div>
            </div>

            <p className="text-base text-stone-300 leading-relaxed">
              你身上正持有【反方向的鐘】！
              <br />
              是否交由小鐵匠以純熟工藝，為你重鑄改造成【大笨鐘】？
            </p>

            <div className="bg-amber-950/30 border border-amber-600/40 rounded-xl p-3 text-xs text-amber-200/90 leading-relaxed">
              💡 <span className="font-bold">改造說明：</span>
              消耗 1 個【反方向的鐘】，重鑄改造成【大笨鐘】。
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowUpgradeClockModal(false)}
                className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                保留【反方向的鐘】
              </button>
              <button
                onClick={handleConfirmUpgradeClock}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer hover:scale-102 active:scale-98"
              >
                確認改造
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 米蘭小鐵匠強化時光機確認視窗 (持有時光機與愛的飛行日記遭遇米蘭小鐵匠時) */}
      {showUpgradeTimeMachineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#141418] border-2 border-amber-500/70 rounded-2xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.9)] flex flex-col gap-4 text-stone-200 font-sans">
            <div className="flex items-center gap-2.5 border-b border-stone-800 pb-3">
              <span className="text-2xl">🚀</span>
              <div>
                <h3 className="text-lg font-bold text-amber-200 font-serif">
                  ✦ 強化時光機・飛行時光機 ✦
                </h3>
                <p className="text-xs text-stone-400">
                  遭遇米蘭的小鐵匠・強化機械
                </p>
              </div>
            </div>

            <p className="text-base text-stone-300 leading-relaxed">
              你身上正同時持有【時光機】與【愛的飛行日記】！
              <br />
              是否透過【愛的飛行日記】把【時光機】強化為【飛行時光機】？
            </p>

            <div className="bg-amber-950/30 border border-amber-600/40 rounded-xl p-3 text-xs text-amber-200/90 leading-relaxed">
              💡 <span className="font-bold">強化說明：</span>
              消耗 1 本【愛的飛行日記】，將【時光機】升級強化為【飛行時光機】。
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowUpgradeTimeMachineModal(false)}
                className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                暫不強化
              </button>
              <button
                onClick={handleConfirmUpgradeTimeMachine}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer hover:scale-102 active:scale-98"
              >
                確認強化
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 飛行時光機使用：跳轉任一回合視窗 */}
      {showFlightTimeMachineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#141418] border-2 border-cyan-500/70 rounded-2xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.9)] flex flex-col gap-4 text-stone-200 font-sans">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🚀</span>
                <div>
                  <h3 className="text-lg font-bold text-cyan-200 font-serif">
                    ✦ 飛行時光機・跳轉時空 ✦
                  </h3>
                  <p className="text-xs text-stone-400">
                    啟動了行囊進階功能・自由穿梭時空
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFlightTimeMachineModal(false)}
                className="text-stone-400 hover:text-stone-100 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-stone-300 leading-relaxed">
              目前身處第 <span className="font-bold text-amber-300 font-mono">{gameState.round}</span> 回合。請選擇欲穿梭前往的目的地回合數（1 ~ 30）：
            </p>

            {/* 回合按鈕網格 (1~30) */}
            <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5 p-3 bg-black/50 border border-stone-800 rounded-xl max-h-56 overflow-y-auto">
              {Array.from({ length: 30 }, (_, i) => i + 1).map((r) => {
                const isSelected = selectedFlightRound === r;
                const isCurrent = gameState.round === r;
                return (
                  <button
                    key={r}
                    onClick={() => setSelectedFlightRound(r)}
                    className={`py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-cyan-500 text-stone-950 shadow-md ring-2 ring-cyan-300 font-black'
                        : isCurrent
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-600/70'
                        : 'bg-stone-900/90 hover:bg-stone-800 text-stone-300 border border-stone-800'
                    }`}
                  >
                    <span>R{r}</span>
                    {isCurrent && <span className="text-[9px] text-amber-400 font-sans">當前</span>}
                  </button>
                );
              })}
            </div>

            <div className="bg-cyan-950/30 border border-cyan-700/40 rounded-xl p-3 text-xs text-cyan-200/90 leading-relaxed">
              💡 <span className="font-bold">穿梭說明：</span>
              確認後將立即啟動飛行時光機，時空跳躍前往目標第 <span className="font-bold text-white font-mono">{selectedFlightRound}</span> 回合！
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowFlightTimeMachineModal(false)}
                className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setShowFlightTimeMachineModal(false);
                  addLog(
                    `【飛行時光機】啟動時空跳轉！耀眼的光芒吞沒了四周，自第 ${gameState.round} 回合直接穿梭前往第 ${selectedFlightRound} 回合！`,
                    'milestone'
                  );
                  startNewRound(selectedFlightRound);
                }}
                className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-stone-950 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer hover:scale-102 active:scale-98 font-serif"
              >
                啟動穿梭（前往第 {selectedFlightRound} 回合）
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 遭遇小鐵匠重鑄武器雙向選擇視窗 (當身上同時擁有雙截棍*2與雙刀時) */}
      {showWeaponChoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#141418] border-2 border-amber-600/70 rounded-2xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.9)] flex flex-col gap-4 text-stone-200 font-sans">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">⚔️</span>
                <h3 className="text-lg font-bold text-amber-200 font-serif">
                  請選擇重鑄武器方向
                </h3>
              </div>
              <button
                onClick={() => setShowWeaponChoiceModal(false)}
                className="text-stone-400 hover:text-stone-100 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              你身上同時備有充足的雙截棍與雙刀，小鐵匠詢問你希望進行哪一種改造：
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => handleExecuteEncounterWeaponCraft('nunchucks_to_blades')}
                className="p-3 bg-[#1b1a1f] hover:bg-amber-950/40 border border-stone-800 hover:border-amber-600/60 rounded-xl text-left transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold text-amber-200 group-hover:text-amber-100">
                  【雙截棍 × 2】➔ 【雙刀 × 1】
                </div>
                <div className="text-[11px] text-stone-400 mt-0.5">
                  消耗 2 把雙截棍，重鑄改造為 1 把雙刀
                </div>
              </button>

              <button
                onClick={() => handleExecuteEncounterWeaponCraft('blades_to_nunchucks')}
                className="p-3 bg-[#1b1a1f] hover:bg-amber-950/40 border border-stone-800 hover:border-amber-600/60 rounded-xl text-left transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold text-amber-200 group-hover:text-amber-100">
                  【雙刀 × 1】➔ 【雙截棍 × 2】
                </div>
                <div className="text-[11px] text-stone-400 mt-0.5">
                  消耗 1 把雙刀，拆解改造為 2 把雙截棍
                </div>
              </button>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setShowWeaponChoiceModal(false)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 反方向的鐘：戰敗逆時針回溯專屬通知視窗 */}
      {rewindClockNotice && (
        <RewindNotificationModal
          currentRound={rewindClockNotice.currentRound}
          targetRound={rewindClockNotice.targetRound}
          remainingUses={rewindClockNotice.remainingUses}
          isAmbushBattle={rewindClockNotice.isAmbushBattle}
          onConfirm={handleConfirmRewindNotice}
        />
      )}

      {/* 特殊合成/研發成果揭曉視窗 (CardShowcaseModal) */}
      {showcaseCard && (
        <CardShowcaseModal
          card={showcaseCard}
          sourceText={showcaseSource}
          onClose={handleCloseShowcase}
        />
      )}
    </div>
  );
}
