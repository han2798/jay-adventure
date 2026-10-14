import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { CARD_DATABASE, getCardItemNames, getCardIdByItemName } from './data/cards';
import { INITIAL_SELECTABLE_CHARACTERS, ALL_CHARACTERS } from './data/characters';
import { ALL_ACHIEVEMENTS } from './data/achievements';
import { MysteryCard } from './components/MysteryCard';
import { CardDisplay } from './components/CardDisplay';
import { CharacterPanel } from './components/CharacterPanel';
import { InventoryGrid } from './components/InventoryGrid';
import { AdventureLog } from './components/AdventureLog';
import { BossBattleView } from './components/BossBattleView';
import { CompendiumModal, CHARACTER_SONG_MAPPING } from './components/CompendiumModal';
import { DevModal } from './components/DevModal';
import { GameOverModal } from './components/GameOverModal';
import { HallOfFameModal } from './components/HallOfFameModal';
import { CharacterAvatarIcon } from './components/CharacterAvatarIcon';
import { BlacksmithModal } from './components/BlacksmithModal';
import { TerraceModal } from './components/TerraceModal';
import { CardShowcaseModal } from './components/CardShowcaseModal';
import { RewindNotificationModal } from './components/RewindNotificationModal';
import { RomanticPhoneModal } from './components/RomanticPhoneModal';
import { GoldTownDigModal, GoldTownReward } from './components/GoldTownDigModal';
import { GoldCoinIcon } from './components/GoldCoinIcon';
import { NinjaIcon } from './components/NinjaIcon';
import { NunchakuIcon } from './components/NunchakuIcon';
import { ShovelIcon } from './components/ShovelIcon';
import { getSettlementGrade } from './utils/exportSettlement';
import { getCarnivalStageData } from './data/carnival';
import {
  restoreCardQuotaOnItemLost,
  isPaperItem,
  exchangeInventoryItems,
  isItemPeninsulaRestricted,
} from './utils/gameHelpers';
import { SimpleActionModal } from './components/modals/SimpleActionModal';
import { OutcomeModal, OutcomeModalData } from './components/modals/OutcomeModal';
import { CharConfirmModal } from './components/modals/CharConfirmModal';
import { HeardRainNoticeModal } from './components/modals/HeardRainNoticeModal';
import { EventLinkageModal } from './components/modals/EventLinkageModal';
import { ApExhaustedModal } from './components/modals/ApExhaustedModal';
import { UnopenedLetterAmbushModal } from './components/modals/UnopenedLetterAmbushModal';
import { GeneralEncounterModal } from './components/modals/GeneralEncounterModal';
import { NinjaCaughtNoticeModal } from './components/modals/NinjaCaughtNoticeModal';
import { FlightTimeMachineModal } from './components/modals/FlightTimeMachineModal';
import { WeaponChoiceModal } from './components/modals/WeaponChoiceModal';
import { GoldTownConfirmModal } from './components/modals/GoldTownConfirmModal';
import { IronBoxInheritModal, ExpandIronBoxModal } from './components/modals/IronBoxModals';
import { BlacksmithActionModals } from './components/modals/BlacksmithActionModals';
import { useTerraceSystem } from './hooks/useTerraceSystem';
import { useGoldTownSystem } from './hooks/useGoldTownSystem';
import { useJokerEquipment } from './hooks/useJokerEquipment';
import { useCardOptionHandler } from './hooks/useCardOptionHandler';
import { useBlacksmithSystem } from './hooks/useBlacksmithSystem';
import { useItemInteraction } from './hooks/useItemInteraction';
import { useGameLifecycle } from './hooks/useGameLifecycle';
import { DevPasswordModal } from './components/modals/DevPasswordModal';
import { NewGamePlusModal } from './components/modals/NewGamePlusModal';

export { restoreCardQuotaOnItemLost, isPaperItem };

const STORAGE_KEY_META = 'jay_chou_rpg_meta_v1';

export default function App() {
  // Load or initialize Meta progress
  const [meta, setMeta] = useState<MetaProgress>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_META);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          unlockedCardIds: parsed.unlockedCardIds || [],
          unlockedAchievements: parsed.unlockedAchievements || [],
          activeSkills: parsed.activeSkills || [],
          unlockedDiaries: parsed.unlockedDiaries || [],
          ironBoxItems: parsed.ironBoxItems || [],
          ironBoxPages: parsed.ironBoxPages || {},
          ironBoxRetainedCharacter: parsed.ironBoxRetainedCharacter || null,
          pastGamesCount: parsed.pastGamesCount || 1,
          totalRoundsPlayed: parsed.totalRoundsPlayed || 0,
          victories: parsed.victories || [],
          routeVictoryRecords: parsed.routeVictoryRecords || {},
          nextGameFlags: parsed.nextGameFlags || {},
          gameHistories: parsed.gameHistories || [],
          settlementHistory: parsed.settlementHistory || [],
        };
      } catch (e) {
        console.error('Failed to parse meta progress', e);
      }
    }
    return {
      unlockedCardIds: [],
      unlockedAchievements: [],
      activeSkills: [],
      unlockedDiaries: [],
      ironBoxItems: [],
      ironBoxPages: {},
      ironBoxRetainedCharacter: null,
      pastGamesCount: 1,
      totalRoundsPlayed: 0,
      victories: [],
      routeVictoryRecords: {},
      nextGameFlags: {},
      gameHistories: [],
      settlementHistory: [],
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
      peninsulaInheritedCounts: {},
      flags: {},
      jokerSlots: { place: null, shoes: null, performance: null },
      reversedClockUsesRemaining: 3,
      stats: { ap: 15, coins: 0 },
      ninjaChasing: false,
      ninjaNextEncounterRound: null,
      fireworksBurning: false,
      headacheActive: false,
      rainyWeatherActive: false,
      drenchedItemNotice: null,
      blacksmithUnlocked: false,
      goldTownUnlocked: false,
      terraceUnlocked: false,
      romanticPhoneUnlocked: false,
      terracePlot: { targetCrop: null, step: 'idle' },
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
  const [showTerraceModal, setShowTerraceModal] = useState<boolean>(false);
  const [showRomanticPhoneModal, setShowRomanticPhoneModal] = useState<boolean>(false);
  const [showGuideBlacksmithModal, setShowGuideBlacksmithModal] = useState<boolean>(false);
  const [showExchangeInstrumentModal, setShowExchangeInstrumentModal] = useState<boolean>(false);
  const [showUpgradeClockModal, setShowUpgradeClockModal] = useState<boolean>(false);
  const [showUpgradeTimeMachineModal, setShowUpgradeTimeMachineModal] = useState<boolean>(false);
  const [showUpgradeShovelModal, setShowUpgradeShovelModal] = useState<boolean>(false);
  const [showExpandIronBoxModal, setShowExpandIronBoxModal] = useState<boolean>(false);
  const [showFlightTimeMachineModal, setShowFlightTimeMachineModal] = useState<boolean>(false);
  const [selectedFlightRound, setSelectedFlightRound] = useState<number>(1);
  const [showWeaponChoiceModal, setShowWeaponChoiceModal] = useState<boolean>(false);
  const [showHallOfFame, setShowHallOfFame] = useState<boolean>(false);
  const [showNewGamePlusModal, setShowNewGamePlusModal] = useState<boolean>(false);
  const [showDevModal, setShowDevModal] = useState<boolean>(false);
  const [showcaseCard, setShowcaseCard] = useState<CardDefinition | null>(null);
  const [showcaseSource, setShowcaseSource] = useState<string>('米蘭小鐵鋪慢火熬製');
  const [showcaseBadgeTitle, setShowcaseBadgeTitle] = useState<string | undefined>(undefined);
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
  const [pendingCharacter, setPendingCharacter] = useState<CharacterDefinition | null>(null);
  const [isDrawingCharacterAnimation, setIsDrawingCharacterAnimation] = useState<boolean>(false);
  const [showCharConfirmModal, setShowCharConfirmModal] = useState<boolean>(false);
  const [showHeardRainNoticeModal, setShowHeardRainNoticeModal] = useState<boolean>(false);
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
  const [outcomeModal, setOutcomeModal] = useState<OutcomeModalData | null>(null);

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

  const BASE_IRON_BOX_CAPACITY = 5;

  const getIronBoxCapacity = useCallback(
    (pages?: MetaProgress['ironBoxPages']) => {
      const p = pages || meta.ironBoxPages || {};
      let cap = BASE_IRON_BOX_CAPACITY;
      if (p.firstPage) cap += 1;
      if (p.sixthPage) cap += 6;
      if (p.seventhPage) cap += 7;
      return cap;
    },
    [meta.ironBoxPages]
  );

  // 半島鐵盒：當局結束時詢問挑選卡牌道具封存跨局繼承
  const [showIronBoxInheritModal, setShowIronBoxInheritModal] = useState<boolean>(false);
  const [selectedIronBoxItems, setSelectedIronBoxItems] = useState<string[]>([]);
  const [retainCharacterInNextGame, setRetainCharacterInNextGame] = useState<boolean>(false);
  const [pendingNextGameCallback, setPendingNextGameCallback] = useState<
    ((inherited?: string[], retainChar?: boolean) => void) | null
  >(null);

  // 周董經典口頭禪彩蛋狀態
  const [jayQuote, setJayQuote] = useState<string | null>(null);

  const triggerJayQuote = useCallback((_customQuote?: string) => {
    // 依作者指示：周杰倫評語系統暫時關閉不呈現於畫面，列入後續優化待辦
    return;
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

  // 雨水淋濕通知訊息自動倒數關閉（3 秒）
  useEffect(() => {
    if (gameState.drenchedItemNotice) {
      const timer = setTimeout(() => {
        setGameState((prev) => (prev.drenchedItemNotice ? { ...prev, drenchedItemNotice: null } : prev));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [gameState.drenchedItemNotice]);

  // 聽見下雨的聲音過場提醒視窗：抽卡階段且達成下雨滿 5 回合連動準備就緒時，跳出提醒視窗
  useEffect(() => {
    if (
      gameState.phase === 'DRAW_THREE' &&
      gameState.flags['rain_heard_sound_ready'] &&
      !gameState.flags['rain_heard_sound_notified']
    ) {
      setGameState((prev) => ({
        ...prev,
        flags: {
          ...prev.flags,
          rain_heard_sound_notified: true,
        },
      }));
      setShowHeardRainNoticeModal(true);
    }
  }, [gameState.phase, gameState.flags]);

  // 公公偏頭痛不存於行囊：清理任何歷史殘留的「公公偏頭痛」行囊道具
  useEffect(() => {
    if (gameState.inventory['公公偏頭痛']) {
      setGameState((prev) => {
        const nextInv = { ...prev.inventory };
        delete nextInv['公公偏頭痛'];
        return {
          ...prev,
          inventory: nextInv,
          itemAcquisitionOrder: (prev.itemAcquisitionOrder || []).filter((k) => k !== '公公偏頭痛'),
        };
      });
    }
  }, [gameState.inventory]);

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
          const hasAll = ach.requiredCards.every((cardName) => {
            if ((inventory[cardName] || 0) > 0) return true;
            const cardDef = CARD_DATABASE.find((c) => c.name === cardName || c.id === cardName);
            if (cardDef && prevMeta.unlockedCardIds.includes(cardDef.id)) return true;
            return false;
          });
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

  // Toggle achievement skill active state (在全域圖鑑中自由開關)
  const handleToggleSkill = useCallback((skillId: string) => {
    setMeta((prev) => {
      const currentActive = prev.activeSkills || [];
      const isCurrentlyActive = currentActive.includes(skillId);
      const nextActive = isCurrentlyActive
        ? currentActive.filter((id) => id !== skillId)
        : [...currentActive, skillId];
      const ach = ALL_ACHIEVEMENTS.find((a) => a.id === skillId);
      if (ach) {
        if (!isCurrentlyActive) {
          addLog(`✦ 已啟用成就技能【${ach.title}】！效果：${ach.rewardDescription}`, 'milestone');
        } else {
          addLog(`✦ 已停用成就技能【${ach.title}】。`, 'action');
        }
      }
      return {
        ...prev,
        activeSkills: nextActive,
      };
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
        // 淘金小鎮 (C2026-11) 特殊規則：
        // 若淘金小鎮已常駐開放，在路上絕不再重複遭遇淘金小鎮
        if (card.id === 'C2026-11' && (state.goldTownUnlocked || state.flags['gold_town_unlocked'])) {
          return false;
        }
        // 梯田 (C2003-10) 特殊規則：
        // 若梯田已解鎖為常駐環境，在路上絕不再重複抽到
        if (card.id === 'C2003-10' && (state.terraceUnlocked || state.flags['terrace_unlocked'])) {
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
        // 2. Max draws check & 半島鐵盒繼承 / 行囊持有上限檢查
        // 計算該卡牌關聯物品在當前行囊中的持有數量
        const itemNames = getCardItemNames(card);
        const heldCount = itemNames.reduce(
          (sum, name) => sum + (state.inventory[name] || 0),
          0
        );

        // A. 若行囊中持有的數量已達該卡牌上限（例如由半島鐵盒帶入、或當局已取得並保留），卡池絕不再出現
        if (heldCount >= card.maxDraws) {
          return false;
        }

        // B. 計算半島鐵盒在開局佔據的名額
        const peninsulaInherited = (state.peninsulaInheritedCounts && state.peninsulaInheritedCounts[card.id]) || 0;
        const allowedDrawsThisRun = Math.max(0, card.maxDraws - peninsulaInherited);
        const alreadyDrawnThisRun = state.drawnCount[card.id] || 0;

        // 若當局抽取次數已達「扣除半島鐵盒後」的剩餘上限，不再出現
        // 例如：上限 2 張，半島鐵盒帶 1 張，當局已抽 1 次，則不再出現
        if (alreadyDrawnThisRun >= allowedDrawsThisRun) {
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

        // 梯田環境生長累積制（經歷滿 5 回合成熟）
        // 若時間往前推進 (targetRound > prev.round)，累計經過的回合差 (delta)；
        // 若時空倒流（反方向的鐘或跳轉更早回合），作物已生長之進度保留不回退！
        if (nextState.terracePlot && nextState.terracePlot.step === 'watered') {
          const delta = targetRound > prev.round ? targetRound - prev.round : 0;
          if (delta > 0) {
            const currentGrowth = Number(nextState.terracePlot.growthRounds || 0);
            const nextGrowth = Math.min(5, currentGrowth + delta);
            nextState.terracePlot = {
              ...nextState.terracePlot,
              growthRounds: nextGrowth,
              requiredRounds: 5,
            };
          }
        }

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
              // 恢復被煙火燒毀物品的卡牌抽取上限額度
              const quota = restoreCardQuotaOnItemLost(
                burnedItem,
                nextState.drawnCount,
                nextState.peninsulaInheritedCounts,
                1
              );
              nextState.drawnCount = quota.nextDrawnCount;
              nextState.peninsulaInheritedCounts = quota.nextPeninsulaCounts;
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

        // 偏頭痛環境提醒：偏頭痛發作中，每次抽卡行動力消耗 -2
        const isHeadache = Boolean(nextState.headacheActive || nextState.flags['headache_active']);
        if (isHeadache && targetRound > 1) {
          pushRoundLog(`🤕【偏頭痛狀態】「公公他偏頭痛，說銀子不夠用……」魔性旋律在腦海迴盪，本回合抽卡行動力消耗加倍（-2 行動力）！`, 'warning');
        }

        // 下雨天環境效果：只要行囊中有紙類物品，每一回合隨機被淋濕損毀一個
        const isRainy = Boolean(nextState.rainyWeatherActive || nextState.flags['rainy_weather_active']);
        let triggerHeardRainThisRound = false;

        if (isRainy) {
          const alreadyHasHeardRain = Boolean(
            (nextState.inventory && (nextState.inventory['聽見下雨的聲音'] || 0) > 0) ||
            (nextState.drawnCount && (nextState.drawnCount['C2014-12'] || 0) > 0) ||
            nextState.flags['heard_rain_triggered']
          );

          if (
            (!alreadyHasHeardRain || Boolean(nextState.flags['pending_heard_rain_trigger'])) &&
            (Boolean(nextState.flags['pending_heard_rain_trigger']) ||
             Boolean(nextState.flags['rain_heard_sound_ready']) ||
             Number(nextState.flags['rain_completed_rounds'] || 0) >= 5 ||
             Number(nextState.flags['rainy_rounds_count'] || 0) >= 5)
          ) {
            triggerHeardRainThisRound = true;
          }

          if (nextState.inventory) {
            const paperKeys = Object.keys(nextState.inventory).filter(
              (k) => (nextState.inventory[k] || 0) > 0 && isPaperItem(k)
            );
            if (paperKeys.length > 0) {
              const drenchedItem = paperKeys[Math.floor(Math.random() * paperKeys.length)];
              const updatedInv = { ...nextState.inventory };
              updatedInv[drenchedItem] = Math.max(0, updatedInv[drenchedItem] - 1);
              if (updatedInv[drenchedItem] === 0) {
                delete updatedInv[drenchedItem];
              }
              const quota = restoreCardQuotaOnItemLost(
                drenchedItem,
                nextState.drawnCount,
                nextState.peninsulaInheritedCounts,
                1
              );
              nextState.drawnCount = quota.nextDrawnCount;
              nextState.peninsulaInheritedCounts = quota.nextPeninsulaCounts;
              nextState.inventory = updatedInv;
              nextState.itemAcquisitionOrder = (nextState.itemAcquisitionOrder || Object.keys(updatedInv)).filter(
                (k) => (updatedInv[k] || 0) > 0
              );
              pushRoundLog(`🌧️【雨水淋濕損毀】下雨天把行囊中的紙類物品【${drenchedItem}】淋濕損毀了！`, 'warning');
              nextState.drenchedItemNotice = `下雨天，行囊中的紙類物品【${drenchedItem}】已被雨水淋濕損毀！`;
            } else {
              pushRoundLog('🌧️【下雨天狀態】陰雨綿綿，所幸行囊中沒有會淋濕損毀的紙類物品。', 'action');
            }
          }
        } else {
          nextState.flags['rainy_rounds_count'] = 0;
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

        // 說走就走 (C2016-02) 回合開始提醒機制 (累積經歷滿 5 個探索回合離開)：
        const hasLeavePlan =
          nextState.flags['blacksmith_leave_countdown'] !== undefined ||
          nextState.flags['blacksmith_leave_elapsed'] !== undefined ||
          Number(nextState.flags['blacksmith_leave_round'] || 0) > 0;
        if (nextState.blacksmithUnlocked && hasLeavePlan && (nextState.inventory['說走就走'] || 0) > 0) {
          const elapsed = Number(
            nextState.flags['blacksmith_leave_elapsed'] ??
            (nextState.flags['blacksmith_leave_round']
              ? Math.max(0, 5 - Math.max(0, Number(nextState.flags['blacksmith_leave_round']) - targetRound))
              : 0)
          );
          const remaining = Math.max(0, 5 - elapsed);
          if (remaining > 1) {
            pushRoundLog(
              `【說走就走】小鐵匠正收拾行囊，準備追尋遠方的自由……還需經歷 ${remaining} 個探索回合即將離開村莊！（若要挽留，可將【說走就走】投入煙火焚毀）`,
              'warning'
            );
          } else if (remaining === 1) {
            pushRoundLog(
              `【說走就走】小鐵匠已打包好行囊，這是留在村莊的最後 1 個探索回合！本回合探索結束後即將動身啟程……（若要挽留，這是最後的機會！）`,
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

        // 聽見下雨的聲音：下雨天持續 5 回合後，下一回合抽卡畫面只會有一張卡，100%是《聽見下雨的聲音》
        if (triggerHeardRainThisRound) {
          const heardRainCard = CARD_DATABASE.find((c) => c.id === 'C2014-12');
          if (heardRainCard) {
            pushRoundLog('🌧️【聽見下雨的聲音】在下雨天許久，你聽見了下雨的聲音……命運之牌已在雨幕中浮現！', 'milestone');
            return {
              ...nextState,
              flags: {
                ...nextState.flags,
                pending_heard_rain_trigger: false,
                rain_heard_sound_ready: true,
                rain_heard_sound_notified: false,
              },
              phase: 'DRAW_THREE',
              currentDrawChoices: [heardRainCard],
            };
          }
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

    // 記錄至角色化身圖鑑，並同步點亮周杰倫歌曲卡牌圖鑑（兩圖鑑並存雙向點亮）
    const cardId = CHARACTER_SONG_MAPPING[char.id];
    setMeta((prev) => {
      const currentList = prev.unlockedCharacterIds || [];
      const currentCards = prev.unlockedCardIds || [];
      const nextCharList = currentList.includes(char.id) ? currentList : [...currentList, char.id];
      const nextCardList = cardId && !currentCards.includes(cardId) ? [...currentCards, cardId] : currentCards;
      return {
        ...prev,
        unlockedCharacterIds: nextCharList,
        unlockedCardIds: nextCardList,
      };
    });

    // Next game flags inheritance
    const initialFlags: Record<string, boolean | string | number> = { ...meta.nextGameFlags };

    const startingAp = char.startingAp ?? (char.name === '魔術先生' ? 10 : char.name === '流浪詩人' ? 20 : 15);

    setGameState((prev) => ({
      ...prev,
      character: char,
      stats: { ...prev.stats, ap: startingAp },
      // 行囊、道具順序與跨局額度已於進入當局/選角前由半島鐵盒直接置入行囊中，此處完整沿用
      flags: { ...prev.flags, ...initialFlags },
      round: 1,
      headacheActive: false,
      fireworksBurning: false,
      ninjaChasing: false,
      ninjaNextEncounterRound: null,
      phase: 'DRAW_THREE',
      currentDrawChoices: rollThreeCards(
        {
          ...prev,
          character: char,
          flags: { ...prev.flags, ...initialFlags },
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
    onCloseCallback?: () => void,
    customBadgeTitle?: string
  ) => {
    const card = CARD_DATABASE.find((c) => c.id === cardId);
    if (card) {
      setShowcaseCard(card);
      setShowcaseSource(sourceText || card.acquisitionSource || '特殊機制獲得');
      setShowcaseBadgeTitle(customBadgeTitle || card.badgeTitle || undefined);
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
    setShowcaseBadgeTitle(undefined);
    if (showcaseOnClose) {
      const cb = showcaseOnClose;
      setShowcaseOnClose(null);
      cb();
    }
  }, [showcaseOnClose]);

  // =========================================================================
  // 重構抽離之子系統 Custom Hooks
  // =========================================================================

  // 1. 梯田高山茶嶺農作系統
  const {
    handleTerraceTill,
    handleTerracePlant,
    handleTerraceWater,
    handleTerraceHarvest,
    handleTerraceClear,
  } = useTerraceSystem({
    gameState,
    setGameState,
    setMeta,
    addLog,
    setOutcomeModal,
    triggerCardShowcase,
    setShowTerraceModal,
  });

  // 2. 淘金小鎮挖寶系統
  const {
    showGoldTownConfirmModal,
    setShowGoldTownConfirmModal,
    showGoldTownDigModal,
    setShowGoldTownDigModal,
    isGoldTownFromRevealedCard,
    setIsGoldTownFromRevealedCard,
    handleOpenGoldTown,
    handleGoldTownComplete,
  } = useGoldTownSystem({
    gameState,
    setGameState,
    meta,
    setMeta,
    addLog,
    setOutcomeModal,
    startNewRound,
    triggerCardShowcase,
  });

  // 3. 喬克叔叔心願裝備系統
  const {
    handleEquipJoker,
    handleUnequipJoker,
  } = useJokerEquipment({
    gameState,
    setGameState,
    setMeta,
    addLog,
    setOutcomeModal,
    triggerCardShowcase,
  });

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
      // 追逐忍者特殊規則：抽到"忍者"後展開追逐，只有追上且擊敗"忍者"後存於行囊也才會記錄於圖鑑
      if (card.id === 'C2001-04') {
        return prev;
      }
      // 外婆特殊機制：現階段無論選擇哪個選項都無法獲得此卡牌，不存於行囊、不開啟圖鑑
      if (card.id === 'C2004-04') {
        return prev;
      }
      const curCards = prev.unlockedCardIds || [];
      const nextCards = curCards.includes(card.id) ? curCards : [...curCards, card.id];
      const curChars = prev.unlockedCharacterIds || [];
      let nextChars = curChars;
      const matchingChar = Object.entries(CHARACTER_SONG_MAPPING).find(([, cId]) => cId === card.id);
      if (matchingChar && !curChars.includes(matchingChar[0])) {
        nextChars = [...curChars, matchingChar[0]];
      }
      return {
        ...prev,
        unlockedCardIds: nextCards,
        unlockedCharacterIds: nextChars,
      };
    });

    // 專屬特殊/合成卡牌（如 聽見下雨的聲音、麥芽糖、療傷燒肉粽、大笨鐘、青花瓷、蘭亭序等）：統一展示新卡牌全貌畫面 (CardShowcaseModal)
    if (card.isSynthesizedOnly) {
      setGameState((prev) => {
        const nextInv = { ...prev.inventory };
        nextInv[card.name] = (nextInv[card.name] || 0) + 1;
        const currentOrder = prev.itemAcquisitionOrder || [];
        const nextOrder = currentOrder.includes(card.name)
          ? currentOrder
          : [...currentOrder, card.name];
        const nextFlags = { ...prev.flags };
        if (card.id === 'C2014-12') {
          nextFlags['heard_rain_triggered'] = true;
          nextFlags['pending_heard_rain_trigger'] = false;
          nextFlags['rain_heard_sound_ready'] = false;
        }
        return {
          ...prev,
          flags: nextFlags,
          drawnCount: nextDrawnCount,
          inventory: nextInv,
          itemAcquisitionOrder: nextOrder,
        };
      });

      addLog(`【特殊卡牌獲得】獲得卡牌【${card.name}】！已直接收入行囊並點亮音樂圖鑑。`, 'milestone');
      triggerCardShowcase(card.id, card.acquisitionSource || '特殊機制獲得', () => {
        // 點擊確認收入行囊後，順暢邁入下一回合抽卡！
        startNewRound(gameState.round + 1);
      });
      return;
    }

    addLog(`抽到了【${card.name}】`, 'draw');

    // 觸發周董即時評語：依最新指示，稀有卡定義修改為 5% 以下 (含 5%)
    const isRareCard = card.weight > 0 && card.weight <= 5;
    if (isRareCard) {
      triggerJayQuote();
    }

    const initialRevealedCard =
      card.id === 'C2004-09'
        ? {
            ...card,
            flavorText: getCarnivalStageData('carnival_layer_1', gameState.flags).flavorText,
            options: getCarnivalStageData('carnival_layer_1', gameState.flags).options,
          }
        : card;

    // 3. Reveal this card ONLY (the other 2 remain mystery cards, never spoiled!)
    setGameState((prev) => ({
      ...prev,
      drawnCount: nextDrawnCount,
      revealedCard: initialRevealedCard,
      phase: 'REVEAL_CARD',
      flags: card.id === 'C2004-09' ? { ...prev.flags, carnival_layer: 'carnival_layer_1' } : prev.flags,
    }));
  };

  const advanceToNextRound = startNewRound;

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

  // 進程目標：三條通路線並列進度
  const routeProgress = useMemo(() => {
    const hasTrackItem =
      (gameState.inventory['超跑女神指引的賽道'] || 0) > 0 ||
      (gameState.inventory['超跑女神'] || 0) > 0;
    const hasHerbBook = (gameState.inventory['本草綱目'] || 0) > 0;
    const hasSunGuide = hasTrackItem && hasHerbBook;

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
      (gameState.inventory['最後的戰役'] || 0) > 0 ||
      gameState.flags['ready_for_general'] ||
      gameState.flags['in_boss_battle']
    );

    return {
      hasSunGuide,
      defeatedCount,
      isStep1Done,
      isStep2Done,
      isStep3Done,
    };
  }, [gameState.inventory, gameState.flags]);

  const getNextGoldTownPageTarget = (): 'first_page' | 'sixth_page' | 'seventh_page' | 'preface' | null => {
    const p = meta.ironBoxPages || {};
    const inv = gameState.inventory || {};
    const hasFirst = Boolean(p.firstPage || (p as any).page1 || (p as any).first_page);
    const hasSixth = Boolean(p.sixthPage || (p as any).page6 || (p as any).sixth_page);
    const hasSeventh = Boolean(p.seventhPage || (p as any).page7 || (p as any).seventh_page);
    const hasPreface = Boolean(p.preface);

    if (!hasFirst) {
      if ((inv['第一頁'] || 0) > 0) return null; // 背包已有，先去改造擴充
      return 'first_page';
    }
    if (!hasSixth) {
      if ((inv['第六頁'] || 0) > 0) return null;
      return 'sixth_page';
    }
    if (!hasSeventh) {
      if ((inv['第七頁'] || 0) > 0) return null;
      return 'seventh_page';
    }
    if (!hasPreface) {
      if ((inv['序'] || 0) > 0) return null;
      return 'preface';
    }
    return null;
  };

  const triggerNextGameWithIronBoxCheck = (
    callback?: (inherited?: string[], retainChar?: boolean) => void
  ) => {
    const hasIronBox = Boolean((gameState.inventory['半島鐵盒'] || 0) > 0);
    const pages = meta.ironBoxPages || {};

    if (hasIronBox) {
      if (callback) setPendingNextGameCallback(() => callback);
      else setPendingNextGameCallback(null);
      setSelectedIronBoxItems(meta.ironBoxItems || []);
      setRetainCharacterInNextGame(Boolean(pages.preface));
      setShowIronBoxInheritModal(true);
    } else {
      if (callback) callback();
      else handleStartNextGame();
    }
  };

  // =========================================================================
  // 核心子系統 Custom Hooks 整合介面 (Core Modular Hooks Integration)
  // =========================================================================

  // 1. 抽卡與選項效果處理器 (Card Options Engine Hook)
  const { handleSelectOption } = useCardOptionHandler({
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
  });

  // 2. 米蘭鐵匠與武器升級合成系統 (Blacksmith & Crafting Hook)
  const {
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
  } = useBlacksmithSystem({
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
  });

  // 3. 環境與道具拖拽互動處理 (Item Interactions Hook)
  const {
    handleDropOnFireworks,
    handleDropOnHeadache,
    handleDropOnRain,
  } = useItemInteraction({
    gameState,
    setGameState,
    setMeta,
    addLog,
    setOutcomeModal,
    triggerCardShowcase,
  });

  // 4. 遊戲局數生命週期與回溯系統 (Game Lifecycle Hook)
  const {
    handleStartNextGame,
    handleConfirmApExhausted,
    handleRewindWithClock,
    handleConfirmRewindNotice,
    handleFullMemoryWipe,
  } = useGameLifecycle({
    gameState,
    setGameState,
    meta,
    setMeta,
    addLog,
    selectedIronBoxItems,
    setSelectedIronBoxItems,
    retainCharacterInNextGame,
    setRetainCharacterInNextGame,
    pendingNextGameCallback,
    setPendingNextGameCallback,
    setShowIronBoxInheritModal,
    setShowApExhaustedModal,
    setShowRewindNoticeModal: () => {},
    triggerCardShowcase,
    getIronBoxCapacity,
    rollThreeCards,
    startNewRound,
    setShowNewGamePlusModal,
    setShowCompendium,
  });

  const handleRestartCurrentGame = () => {
    setGameState((prev) => ({
      ...prev,
      round: 1,
      maxRounds: 30,
      character: null,
      inventory: {},
      itemAcquisitionOrder: [],
      drawnCount: {},
      peninsulaInheritedCounts: {},
      flags: {},
      jokerSlots: { place: null, shoes: null, performance: null },
      reversedClockUsesRemaining: 3,
      stats: { ap: 15, coins: 0 },
      ninjaChasing: false,
      ninjaNextEncounterRound: null,
      fireworksBurning: false,
      headacheActive: false,
      rainyWeatherActive: false,
      drenchedItemNotice: null,
      blacksmithUnlocked: false,
      goldTownUnlocked: false,
      terraceUnlocked: false,
      romanticPhoneUnlocked: false,
      terracePlot: { targetCrop: null, step: 'idle' },
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

  return (
    <div className="min-h-screen w-full bg-[#0a0a0d] text-[#e0deda] font-sans antialiased flex flex-col items-center select-none overflow-x-hidden">
      {/* Top Universal App Header */}
      <header className="w-full bg-[#121215] border-b border-stone-800 px-6 py-3 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm font-black text-amber-100 tracking-wider font-serif">
              周杰倫歌曲卡牌冒險
            </h1>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/50">
              v1.0
            </span>
          </div>
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
            title="開發者測試控制台"
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
            goldTownUnlocked={Boolean(gameState.goldTownUnlocked || gameState.flags['gold_town_unlocked'])}
            terraceUnlocked={Boolean(gameState.terraceUnlocked || gameState.flags['terrace_unlocked'])}
            terraceStatusBadge={getTerraceStatusBadge()}
            romanticPhoneUnlocked={Boolean(gameState.romanticPhoneUnlocked || gameState.flags['romantic_phone_unlocked'] || (gameState.inventory['浪漫手機'] || 0) > 0)}
            hasDiscoveredCoins={Boolean(gameState.flags['discovered_coins'] || (gameState.stats.coins && gameState.stats.coins > 0))}
            onOpenBlacksmith={() => setShowBlacksmithModal(true)}
            onOpenGoldTown={handleOpenGoldTown}
            onOpenTerrace={() => setShowTerraceModal(true)}
            onOpenRomanticPhone={() => setShowRomanticPhoneModal(true)}
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

            {/* 環境狀態 (Environment Status) - 紅框閃爍標籤區，各環境變化可共存各自作用（結算與選角過場不顯示） */}
            {gameState.phase !== 'GAME_OVER' && gameState.phase !== 'CHOOSE_CHARACTER' && (
              <div className="flex items-center gap-2 flex-wrap">
                {Boolean(gameState.flags['chaos_era_active'] || gameState.flags['chaos_era_obtained']) && (
                  <span
                    title="環境狀態：亂舞春秋時代（時空震盪，戰亂降臨）"
                    className="text-[11px] sm:text-xs bg-red-950 text-red-300 border border-red-800 px-2.5 py-0.5 rounded font-mono font-bold animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.25)] flex items-center gap-1"
                  >
                    <span>⚔️</span>
                    <span>亂舞春秋時代</span>
                  </span>
                )}

                {Boolean(gameState.ninjaChasing) && (
                  <span
                    title="環境狀態：追逐忍者（忍者正朝著第 30 回合狂奔）"
                    className="text-[11px] sm:text-xs bg-red-950 text-red-300 border border-red-800 px-2.5 py-0.5 rounded font-mono font-bold animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.25)] flex items-center gap-1.5"
                  >
                    <NinjaIcon className="w-3.5 h-3.5" />
                    <span>忍者前進到第 {gameState.ninjaRound || (gameState.round + 1)} 回合</span>
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
                    className="text-[11px] sm:text-xs bg-red-950 text-red-300 border border-red-800 hover:border-amber-400 hover:text-amber-200 px-2.5 py-0.5 rounded font-mono font-bold animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.25)] transition-all cursor-pointer select-none flex items-center gap-1"
                  >
                    <span>🎆</span>
                    <span>煙火燃燒</span>
                  </span>
                )}

                {Boolean(gameState.headacheActive || gameState.flags['headache_active']) && (
                  <span
                    id="env-headache-badge"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'copy';
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const itemName = e.dataTransfer.getData('text/plain');
                      if (itemName) {
                        handleDropOnHeadache(itemName);
                      }
                    }}
                    title="環境狀態：偏頭痛！每回合抽卡行動力消耗共 -2，趕快想辦法痊癒吧！"
                    className="text-[11px] sm:text-xs bg-red-950 text-red-300 border border-red-800 hover:border-emerald-400 hover:text-emerald-200 px-2.5 py-0.5 rounded font-mono font-bold animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.25)] transition-all cursor-pointer select-none flex items-center gap-1"
                  >
                    <span>🤕</span>
                    <span>偏頭痛</span>
                  </span>
                )}

                {Boolean(gameState.rainyWeatherActive || gameState.flags['rainy_weather_active']) && (() => {
                  const rainExperienced = Number(gameState.flags['rain_experienced_total_rounds']) || 0;
                  const timeScore = 0.5 * (Math.min(30, Math.max(1, gameState.round)) / 30);
                  const rainScore = 0.5 * Math.min(1, rainExperienced / 8);
                  const rainNightProgress = Math.min(100, Math.max(0, Math.round((timeScore + rainScore) * 100)));
                  const isRainNightFull = rainNightProgress >= 100;

                  return (
                    <div
                      id="env-rainy-badge"
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'copy';
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const itemName = e.dataTransfer.getData('text/plain');
                        if (itemName) {
                          handleDropOnRain(itemName);
                        }
                      }}
                      title="環境狀態：下雨天！每回合行囊中的紙類物品會被淋濕損毀，真希望能趕快放晴！"
                      className={`text-[11px] sm:text-xs bg-sky-950/90 text-sky-300 border ${
                        isRainNightFull
                          ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                          : 'border-sky-600 hover:border-cyan-300 hover:text-cyan-100 shadow-[0_0_10px_rgba(56,189,248,0.25)]'
                      } px-2.5 py-1 rounded font-mono transition-all cursor-pointer select-none flex flex-col gap-1 items-start min-w-[170px] sm:min-w-[190px]`}
                    >
                      <div className="flex items-center justify-between w-full font-bold">
                        <div className="flex items-center gap-1">
                          <span>🌧️</span>
                          <span>下雨天</span>
                        </div>
                      </div>

                      {/* 晝夜雨夜計量條 */}
                      <div className="w-full flex items-center gap-1.5 text-[10px] text-sky-300/80 font-sans">
                        <span className="text-[10px] text-sky-400/90 tracking-tighter shrink-0">[白天]</span>
                        <div className="relative flex-1 h-1.5 bg-sky-950 border border-sky-800/80 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 rounded-full ${
                              isRainNightFull
                                ? 'bg-gradient-to-r from-sky-400 via-amber-300 to-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                                : 'bg-gradient-to-r from-sky-500 via-indigo-400 to-amber-300/80'
                            }`}
                            style={{ width: `${rainNightProgress}%` }}
                          />
                          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] animate-rain-shimmer pointer-events-none" />
                        </div>
                        <span
                          className={`text-[10px] tracking-tighter shrink-0 ${
                            isRainNightFull ? 'text-amber-300 font-bold' : 'text-indigo-300/90'
                          }`}
                        >
                          [黑夜]
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
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

          {/* 下雨天紙類物品淋濕損毀通知橫幅 */}
          {gameState.drenchedItemNotice && (
            <div
              className="w-full bg-sky-950/95 border border-sky-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-sky-200 flex items-center justify-between gap-2 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300"
            >
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg">🌧️</span>
                <span className="font-bold text-sky-300">【淋濕損毀】</span>
                <span>{gameState.drenchedItemNotice}</span>
              </div>
              <button
                onClick={() => setGameState((prev) => ({ ...prev, drenchedItemNotice: null }))}
                className="text-stone-400 hover:text-white text-xs px-2 py-0.5 rounded bg-black/40 border border-stone-700 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* C. 中央舞台 */}
          <div className="w-full min-h-[460px] bg-[#101014] border border-stone-800/80 rounded-2xl p-6 flex flex-col items-center justify-center relative shadow-inner overflow-hidden">
            {/* Phase 1: 抽取初始化身 (Destiny Avatar Summoning - 附圖二全新翻新) */}
            {gameState.phase === 'CHOOSE_CHARACTER' && (
              <div className="w-full flex flex-col items-center gap-6 text-center animate-in fade-in duration-300 py-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-amber-200 font-serif tracking-wide">
                    音樂之門已開啟・抽取初始化身
                  </h2>
                  <p className="text-sm text-stone-400 mt-2 font-sans">
                    點擊下方按鍵喚醒並抽取本局專屬於你的音樂冒險化身
                  </p>
                </div>

                {/* 中央命運契約召喚台與動態黑膠星軌 */}
                <div className="relative my-2 flex flex-col items-center justify-center">
                  {/* 外層光暈靈能氛圍 */}
                  <div
                    className={`absolute -inset-8 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-300/30 to-amber-600/20 blur-2xl pointer-events-none transition-all duration-700 ${
                      isDrawingCharacterAnimation ? 'scale-125 opacity-90' : 'scale-100 opacity-40'
                    }`}
                  />

                  {/* 召喚儀式卡框 */}
                  <div className="relative w-48 sm:w-56 h-64 sm:h-72 rounded-2xl bg-gradient-to-b from-[#22202a] via-[#16151c] to-[#0c0c10] border-2 border-[#d4af37] shadow-[0_0_35px_rgba(212,175,55,0.3)] p-4 flex flex-col items-center justify-between overflow-hidden">
                    {/* 頂部徽飾 */}
                    <div className="w-full flex justify-between items-center text-xs text-[#d4af37]/70 font-mono">
                      <span>✦</span>
                      <span className="text-[10px] tracking-widest uppercase">Destiny Avatar</span>
                      <span>✦</span>
                    </div>

                    {/* 中央動態星軌黑膠 / 旋轉召喚圖騰 */}
                    <div className="relative flex flex-col items-center justify-center my-auto">
                      <div
                        className={`w-28 sm:w-32 h-28 sm:h-32 rounded-full border-2 border-[#d4af37]/60 flex items-center justify-center relative bg-black/60 shadow-inner ${
                          isDrawingCharacterAnimation ? 'animate-[spin_0.8s_linear_infinite]' : ''
                        }`}
                      >
                        {/* 經典唱片溝槽 */}
                        <div className="w-22 h-22 rounded-full border border-dashed border-[#d4af37]/40" />
                        <div className="w-14 h-14 rounded-full border border-[#d4af37]/30" />
                        <div className="absolute w-9 h-9 rounded-full bg-[#d4af37]/20 border border-[#d4af37] flex items-center justify-center shadow-md">
                          <span className="text-amber-200 text-lg font-serif">
                            {isDrawingCharacterAnimation ? '✨' : '♫'}
                          </span>
                        </div>
                      </div>

                      {/* 動態狀態文字 */}
                      <span className="mt-4 text-xs font-mono tracking-widest text-[#d4af37] drop-shadow">
                        {isDrawingCharacterAnimation
                          ? '✦ 命運星軌共鳴中…… ✦'
                          : '✦ 命運之簽待召喚 ✦'}
                      </span>
                    </div>

                    {/* 底部裝飾 */}
                    <div className="w-full flex justify-between items-center text-xs text-[#d4af37]/70 font-mono">
                      <span>◆</span>
                      <span className="text-[9px] text-stone-500 tracking-wider">JAY CHOU</span>
                      <span>◆</span>
                    </div>
                  </div>
                </div>

                {/* 抽選角色按鍵 */}
                <button
                  id="draw-character-summon-btn"
                  disabled={isDrawingCharacterAnimation}
                  onClick={() => {
                    if (isDrawingCharacterAnimation) return;
                    setIsDrawingCharacterAnimation(true);
                    triggerJayQuote();
                    setTimeout(() => {
                      const randomIndex = Math.floor(Math.random() * INITIAL_SELECTABLE_CHARACTERS.length);
                      const drawnChar = INITIAL_SELECTABLE_CHARACTERS[randomIndex];
                      setPendingCharacter(drawnChar);
                      setShowCharConfirmModal(true);
                      setIsDrawingCharacterAnimation(false);
                    }, 1100);
                  }}
                  className={`w-64 sm:w-72 py-4 px-6 rounded-2xl font-black text-base sm:text-lg tracking-widest shadow-xl cursor-pointer transition-all active:scale-98 border-2 ${
                    isDrawingCharacterAnimation
                      ? 'bg-stone-800 text-stone-400 border-stone-700 cursor-not-allowed animate-pulse'
                      : 'bg-gradient-to-r from-amber-600 via-[#d4af37] to-amber-500 text-stone-950 border-amber-300 hover:brightness-110 shadow-[0_4px_25px_rgba(212,175,55,0.4)] hover:scale-102'
                  }`}
                >
                  {isDrawingCharacterAnimation ? '✦ 召喚中…… ✦' : '✦ 點擊抽選命運化身 ✦'}
                </button>
              </div>
            )}

            {/* Phase 2: 翻牌抽取 (Tarot Mystery Cards) */}
            {gameState.phase === 'DRAW_THREE' && (
              <div className="w-full flex flex-col items-center gap-6 text-center animate-in fade-in duration-200">
                <div className="-mt-2 flex flex-col items-center">
                  <h2 className="text-xl sm:text-2xl font-black text-amber-200 font-serif tracking-wider">
                    {gameState.currentDrawChoices.length === 1
                      ? '雨幕深處・命運之牌已浮現'
                      : '命運牌堆已洗牌完畢'}
                  </h2>
                  <p className="text-sm text-stone-400 mt-1 font-sans">
                    {gameState.currentDrawChoices.length === 1
                      ? '在下雨天許久，你聽見了下雨的聲音……請翻開這張唯一的命運之牌'
                      : '請點選其中一張覆蓋卡牌盲抽（僅公開所選卡牌，未選中者保持覆蓋）'}
                  </p>
                </div>

                {gameState.currentDrawChoices.length === 1 && (
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-950/80 border border-sky-400/70 text-sky-200 text-xs font-bold animate-pulse shadow-[0_0_15px_rgba(56,189,248,0.3)]">
                    <span>🌧️</span>
                    <span>下雨天累積滿 5 回合連動：100% 抽取《聽見下雨的聲音》</span>
                  </div>
                )}

                <div
                  className={`w-full ${
                    gameState.currentDrawChoices.length === 1
                      ? 'max-w-xs flex justify-center mx-auto'
                      : 'max-w-2xl grid grid-cols-3 gap-3 sm:gap-6 justify-items-center'
                  } px-2`}
                >
                  {gameState.currentDrawChoices.map((choiceCard, idx) => {
                    const isMagician = gameState.character?.name === '魔術先生';
                    const hasTape = Boolean(gameState.inventory['免費教學錄影帶']);
                    return (
                      <MysteryCard
                        key={choiceCard.id}
                        index={idx}
                        onClick={() => handleDrawCard(choiceCard)}
                        isMagicVision={isMagician}
                        canSeeItemCards={isMagician && hasTape}
                        cardHintType={choiceCard.type}
                      />
                    );
                  })}
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
                onVictory={(type, details) => {
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
                    victoryLyric: details?.lyric,
                    victoryNarrative: details?.narrative,
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
                  const isRainy = Boolean(
                    gameState.rainyWeatherActive || gameState.flags['rainy_weather_active']
                  );
                  const rainExperienced = Number(gameState.flags['rain_experienced_total_rounds']) || 0;
                  const reachedEnd = gameState.round >= 30;
                  const isDaughter = gameState.character?.name === '女兒殿下';
                  // 晝夜雨夜深沉度滿額判定：必須在第 30 回合終局維持雨天，且累計歷經雨天滿 8 回合（計量條達到 100%）
                  const isRainNightEligible = isRainy && reachedEnd && rainExperienced >= 8;

                  const proceedNext = () => {
                    triggerNextGameWithIronBoxCheck((inherited, retainChar) => {
                      handleStartNextGame(inherited, retainChar);
                    });
                  };

                  const awardRainyEndCard = (onDone: () => void) => {
                    setGameState((prev) => {
                      const nextInv = { ...prev.inventory };
                      nextInv['雨下一整晚'] = (nextInv['雨下一整晚'] || 0) + 1;
                      const currentOrder = prev.itemAcquisitionOrder || Object.keys(nextInv);
                      const order = currentOrder.filter((k) => (nextInv[k] || 0) > 0);
                      if (!order.includes('雨下一整晚')) order.push('雨下一整晚');
                      return {
                        ...prev,
                        inventory: nextInv,
                        itemAcquisitionOrder: order,
                      };
                    });
                    setMeta((prev) => {
                      if (prev.unlockedCardIds.includes('C2010-06')) return prev;
                      return {
                        ...prev,
                        unlockedCardIds: [...prev.unlockedCardIds, 'C2010-06'],
                      };
                    });
                    addLog(
                      '🌧️🎻【雨下一整晚】「雨下一整晚，街燈下斑駁的倒影……」夜幕降臨雨勢深沉，你在第 30 回合終局獲得卡牌《雨下一整晚》（C2010-06）！',
                      'milestone'
                    );
                    triggerCardShowcase('C2010-06', '雨夜漫漫・在雨天維持足量歷程並迎來第30回合終局獲得', () => {
                      onDone();
                    });
                  };

                  if (reachedEnd && isDaughter) {
                    // 達成以女兒殿下守護完成第 30 回合終局：獲得卡牌《女兒殿下》（C2026-10）
                    setGameState((prev) => {
                      const nextInv = { ...prev.inventory };
                      nextInv['女兒殿下'] = (nextInv['女兒殿下'] || 0) + 1;
                      const currentOrder = prev.itemAcquisitionOrder || Object.keys(nextInv);
                      const order = currentOrder.filter((k) => (nextInv[k] || 0) > 0);
                      if (!order.includes('女兒殿下')) order.push('女兒殿下');
                      return {
                        ...prev,
                        inventory: nextInv,
                        itemAcquisitionOrder: order,
                      };
                    });
                    setMeta((prev) => ({
                      ...prev,
                      unlockedCardIds: Array.from(new Set([...prev.unlockedCardIds, 'C2026-10'])),
                    }));
                    addLog(
                      '👑💖【女兒殿下】父愛如山，你守護著女兒殿下平安度過 30 回合！獲得關鍵卡牌《女兒殿下》（C2026-10）！',
                      'milestone'
                    );
                    triggerCardShowcase('C2026-10', '以【女兒殿下】身分成功完成第 30 回合終局冒險後獲得', () => {
                      if (isRainNightEligible) {
                        awardRainyEndCard(proceedNext);
                      } else {
                        proceedNext();
                      }
                    });
                    return;
                  }

                  if (isRainNightEligible) {
                    awardRainyEndCard(proceedNext);
                    return;
                  }

                  proceedNext();
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
          onToggleSkill={handleToggleSkill}
        />
      )}

      {/* Developer Test Modal - Password Guard */}
      {showDevPasswordModal && (
        <DevPasswordModal
          onClose={() => setShowDevPasswordModal(false)}
          onSuccess={() => {
            setShowDevPasswordModal(false);
            setIsDevAuthenticated(true);
            try {
              sessionStorage.setItem('jay_dev_auth_session', 'true');
            } catch (e) {}
            setShowDevModal(true);
          }}
        />
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
              const nextDrawn = { ...prev.drawnCount };
              const nextPen = { ...(prev.peninsulaInheritedCounts || {}) };
              const quota = restoreCardQuotaOnItemLost(item, nextDrawn, nextPen, 1);
              const nextFlags = { ...prev.flags };
              if (item === '聽見下雨的聲音') {
                delete nextFlags['heard_rain_triggered'];
                delete nextFlags['rain_heard_sound_notified'];
                delete nextFlags['rain_heard_sound_ready'];
                delete nextFlags['pending_heard_rain_trigger'];
                delete quota.nextDrawnCount['C2014-12'];
              }
              return {
                ...prev,
                inventory: nextInv,
                drawnCount: quota.nextDrawnCount,
                peninsulaInheritedCounts: quota.nextPeninsulaCounts,
                flags: nextFlags,
                itemAcquisitionOrder: (prev.itemAcquisitionOrder || []).filter((k) => (nextInv[k] || 0) > 0),
              };
            });
            addLog(`【開發者指令】已從行囊移除【${item}】。`, 'action');
          }}
          onToggleItem={(item, defaultCount = 1) => {
            setGameState((prev) => {
              const nextInv = { ...prev.inventory };
              const current = nextInv[item] || 0;
              const nextDrawn = { ...prev.drawnCount };
              const nextPen = { ...(prev.peninsulaInheritedCounts || {}) };
              const nextFlags = { ...prev.flags };
              if (current > 0) {
                delete nextInv[item];
                const quota = restoreCardQuotaOnItemLost(item, nextDrawn, nextPen, current);
                if (item === '聽見下雨的聲音') {
                  delete nextFlags['heard_rain_triggered'];
                  delete nextFlags['rain_heard_sound_notified'];
                  delete nextFlags['rain_heard_sound_ready'];
                  delete nextFlags['pending_heard_rain_trigger'];
                  delete quota.nextDrawnCount['C2014-12'];
                }
                addLog(`【開發者指令】已關閉/移除【${item}】。`, 'action');
                return {
                  ...prev,
                  inventory: nextInv,
                  drawnCount: quota.nextDrawnCount,
                  peninsulaInheritedCounts: quota.nextPeninsulaCounts,
                  flags: nextFlags,
                  itemAcquisitionOrder: (prev.itemAcquisitionOrder || []).filter((k) => (nextInv[k] || 0) > 0),
                };
              } else {
                nextInv[item] = defaultCount;
                addLog(`【開發者指令】已開啟/加入【${item}】${defaultCount > 1 ? ` (x${defaultCount})` : ''}。`, 'milestone');
                return {
                  ...prev,
                  inventory: nextInv,
                  itemAcquisitionOrder: [...(prev.itemAcquisitionOrder || []).filter((k) => k !== item), item],
                };
              }
            });
          }}
          onSetItemCount={(item, count) => {
            setGameState((prev) => {
              const nextInv = { ...prev.inventory };
              const nextDrawn = { ...prev.drawnCount };
              const nextPen = { ...(prev.peninsulaInheritedCounts || {}) };
              const nextFlags = { ...prev.flags };
              if (count <= 0) {
                const current = nextInv[item] || 1;
                delete nextInv[item];
                const quota = restoreCardQuotaOnItemLost(item, nextDrawn, nextPen, current);
                if (item === '聽見下雨的聲音') {
                  delete nextFlags['heard_rain_triggered'];
                  delete nextFlags['rain_heard_sound_notified'];
                  delete nextFlags['rain_heard_sound_ready'];
                  delete nextFlags['pending_heard_rain_trigger'];
                  delete quota.nextDrawnCount['C2014-12'];
                }
                addLog(`【開發者指令】已清空【${item}】。`, 'action');
                return {
                  ...prev,
                  inventory: nextInv,
                  drawnCount: quota.nextDrawnCount,
                  peninsulaInheritedCounts: quota.nextPeninsulaCounts,
                  flags: nextFlags,
                  itemAcquisitionOrder: (prev.itemAcquisitionOrder || []).filter((k) => (nextInv[k] || 0) > 0),
                };
              } else {
                nextInv[item] = count;
                addLog(`【開發者指令】設定【${item}】數量為 ${count}。`, 'action');
                return {
                  ...prev,
                  inventory: nextInv,
                };
              }
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
            addLog(`【開發者指令】行動力調節為 ${ap}。`, 'milestone');
          }}
          currentCoins={gameState.stats.coins || 0}
          onSetCoins={(coins) => {
            setGameState((prev) => ({
              ...prev,
              stats: { ...prev.stats, coins: Math.max(0, coins) },
            }));
            addLog(`【開發者指令】金幣調節為 ${coins} 枚。`, 'milestone');
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
          isGoldTownUnlocked={Boolean(gameState.goldTownUnlocked || gameState.flags['gold_town_unlocked'])}
          onToggleGoldTown={(active) => {
            setGameState((prev) => ({
              ...prev,
              goldTownUnlocked: active,
              flags: {
                ...prev.flags,
                gold_town_unlocked: active,
              },
            }));
            addLog(`【開發測試】${active ? '開啟' : '關閉'}【淘金小鎮常駐】狀態。`, 'milestone');
          }}
          isTerraceUnlocked={Boolean(gameState.terraceUnlocked || gameState.flags['terrace_unlocked'])}
          onToggleTerrace={(active) => {
            setGameState((prev) => ({
              ...prev,
              terraceUnlocked: active,
              flags: {
                ...prev.flags,
                terrace_unlocked: active,
              },
            }));
            addLog(`【開發測試】${active ? '開啟' : '關閉'}【梯田常駐】狀態。`, 'milestone');
          }}
          onFastMatureTerrace={(specificCrop) => {
            setGameState((prev) => {
              const currentCrop = specificCrop || prev.terracePlot?.targetCrop || 'tea';
              return {
                ...prev,
                terracePlot: {
                  targetCrop: currentCrop,
                  step: 'watered',
                  completedRound: prev.round,
                  growthRounds: 5,
                  requiredRounds: 5,
                  matureRound: prev.round,
                },
              };
            });
            addLog('⚡【開發測試】梯田作物已快速催熟，進入【可收成】狀態！', 'milestone');
          }}
          isHeadacheActive={Boolean(gameState.headacheActive || gameState.flags['headache_active'])}
          onToggleHeadache={(active) => {
            setGameState((prev) => ({
              ...prev,
              headacheActive: active,
              flags: {
                ...prev.flags,
                headache_active: active,
              },
            }));
            addLog(`【開發測試】${active ? '開啟' : '解除'}【偏頭痛】環境狀態。`, 'milestone');
          }}
          isRainyWeatherActive={Boolean(gameState.rainyWeatherActive || gameState.flags['rainy_weather_active'])}
          onToggleRainyWeather={(active) => {
            setGameState((prev) => {
              const nextFlags = {
                ...prev.flags,
                rainy_weather_active: active,
                rainy_rounds_count: active ? (prev.flags['rainy_rounds_count'] || 0) : 0,
              };
              if (!active) {
                nextFlags['rain_completed_rounds'] = 0;
                nextFlags['pending_heard_rain_trigger'] = false;
                nextFlags['rain_heard_sound_ready'] = false;
              }
              return {
                ...prev,
                rainyWeatherActive: active,
                flags: nextFlags,
              };
            });
            addLog(`【開發測試】${active ? '開啟' : '解除'}【那天下雨了】下雨天狀態。`, 'milestone');
          }}
          onFastForwardRainRounds={() => {
            const heardRainCard = CARD_DATABASE.find((c) => c.id === 'C2014-12');
            setGameState((prev) => {
              const nextFlags = { ...prev.flags };
              nextFlags['rainy_weather_active'] = true;
              nextFlags['rain_completed_rounds'] = 5;
              nextFlags['rainy_rounds_count'] = 5;
              nextFlags['pending_heard_rain_trigger'] = true;
              delete nextFlags['heard_rain_triggered'];
              delete nextFlags['rain_heard_sound_notified'];

              const nextDrawn = { ...prev.drawnCount };
              delete nextDrawn['C2014-12'];

              const nextInv = { ...prev.inventory };
              delete nextInv['聽見下雨的聲音'];

              let nextChoices = prev.currentDrawChoices;
              if (prev.phase === 'DRAW_THREE' && heardRainCard) {
                nextChoices = [heardRainCard];
                nextFlags['rain_heard_sound_ready'] = true;
                nextFlags['pending_heard_rain_trigger'] = false;
              }

              return {
                ...prev,
                rainyWeatherActive: true,
                inventory: nextInv,
                itemAcquisitionOrder: (prev.itemAcquisitionOrder || []).filter((k) => (nextInv[k] || 0) > 0),
                drawnCount: nextDrawn,
                flags: nextFlags,
                currentDrawChoices: nextChoices,
              };
            });
            setShowHeardRainNoticeModal(true);
            addLog('⚡【開發測試】設定下雨天歷經滿 5 回合！已連動觸發居中《聽見下雨的聲音》！', 'milestone');
          }}
          onFastForwardRainNight={() => {
            setGameState((prev) => ({
              ...prev,
              rainyWeatherActive: true,
              flags: {
                ...prev.flags,
                rainy_weather_active: true,
                rain_experienced_total_rounds: 8,
              },
            }));
            addLog('🌙【開發測試】快進經歷雨天滿 8 回合，晝夜雨夜計量條達到滿額！', 'milestone');
          }}
          isRomanticPhoneUnlocked={Boolean(gameState.romanticPhoneUnlocked || gameState.flags['romantic_phone_unlocked'] || (gameState.inventory['浪漫手機'] || 0) > 0)}
          onToggleRomanticPhone={(active) => {
            setGameState((prev) => {
              const nextInv = { ...prev.inventory };
              if (active) {
                nextInv['浪漫手機'] = 1;
              } else {
                delete nextInv['浪漫手機'];
              }
              return {
                ...prev,
                romanticPhoneUnlocked: active,
                inventory: nextInv,
                flags: {
                  ...prev.flags,
                  romantic_phone_unlocked: active,
                },
              };
            });
            addLog(`【開發測試】${active ? '開啟' : '關閉'}【浪漫手機常駐】狀態。`, 'milestone');
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

      {/* 開啟新周目對話框 */}
      {showNewGamePlusModal && (
        <NewGamePlusModal
          onClose={() => setShowNewGamePlusModal(false)}
          onConfirm={handleFullMemoryWipe}
        />
      )}

      {/* Character Confirmation Modal (抽角色 -> 跳出角色確認視窗告知玩家 -> 冒險開始按鈕) */}
      <CharConfirmModal
        isOpen={showCharConfirmModal && Boolean(pendingCharacter)}
        character={pendingCharacter}
        onConfirm={(char) => {
          setShowCharConfirmModal(false);
          setPendingCharacter(null);
          handleSelectCharacter(char);
        }}
      />

      {/* 聽見下雨的聲音過場通知視窗 */}
      <HeardRainNoticeModal
        isOpen={showHeardRainNoticeModal}
        onConfirm={() => setShowHeardRainNoticeModal(false)}
      />

      {/* Event Linkage Transition Modal (事件連動包含抽到A卡連動到B卡，跳出確認視窗說明發生效果與按鈕) */}
      <EventLinkageModal
        transition={pendingEventTransition}
        onConfirm={(trans) => {
          setPendingEventTransition(null);
          const finalRound = Math.min(30, trans.nextRound);
          const targetCardName = trans.targetCard?.name || '未知卡牌';
          addLog(
            `【事件連動】時空流轉至第 ${finalRound} 回合，直接遭遇【${targetCardName}】！`,
            'milestone'
          );

          if (trans.targetCard?.id) {
            setMeta((prev) => {
              if (prev.unlockedCardIds.includes(trans.targetCard.id)) return prev;
              return {
                ...prev,
                unlockedCardIds: [...prev.unlockedCardIds, trans.targetCard.id],
              };
            });
          }

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
      />

      {/* AP Exhausted Modal (行動力歸0，失敗處罰：局數+1，物品清空，保留圖鑑與回憶) */}
      <ApExhaustedModal
        isOpen={showApExhaustedModal}
        gameNumber={gameState.gameNumber}
        onConfirm={handleConfirmApExhausted}
      />

      {/* 不拆信強襲過場提醒視窗 (三張卡在眼前，彈出警示視窗) */}
      <UnopenedLetterAmbushModal
        isOpen={showUnopenedLetterAmbushModal}
        round={gameState.round}
        onConfirm={() => {
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
      />

      {/* Boss General Encounter Intro Modal (進入決戰將軍前的專屬過場提醒視窗) */}
      <GeneralEncounterModal
        isOpen={showGeneralEncounterModal}
        round={gameState.round}
        onConfirm={() => {
          setShowGeneralEncounterModal(false);
          setGameState((prev) => ({
            ...prev,
            phase: 'BOSS_BATTLE',
          }));
        }}
      />

      {/* 追上忍者專屬通知視窗 (先告知玩家追上了，點選確認後跳轉至遭遇戰) */}
      <NinjaCaughtNoticeModal
        notice={ninjaCaughtNotice}
        onConfirm={(ninjaCard) => {
          setNinjaCaughtNotice(null);
          setGameState((prev) => ({
            ...prev,
            phase: 'REVEAL_CARD',
            revealedCard: ninjaCard,
          }));
        }}
      />

      {/* Outcome Confirmation Modal (獲得物品、事件效果、裝備結果彈出確認視窗) */}
      <OutcomeModal modal={outcomeModal} />

      {/* 半島鐵盒・跨局記憶傳承 */}
      <IronBoxInheritModal
        isOpen={showIronBoxInheritModal}
        capacity={getIronBoxCapacity()}
        inventory={gameState.inventory}
        character={gameState.character}
        hasPreface={Boolean(meta.ironBoxPages?.preface)}
        selectedItems={selectedIronBoxItems}
        setSelectedItems={setSelectedIronBoxItems}
        retainCharacterInNextGame={retainCharacterInNextGame}
        setRetainCharacterInNextGame={setRetainCharacterInNextGame}
        isItemRestricted={isItemPeninsulaRestricted}
        onConfirm={(itemsToInherit, retainChar) => {
          setMeta((prev) => ({
            ...prev,
            ironBoxItems: itemsToInherit,
            ironBoxRetainedCharacter: retainChar ? gameState.character : null,
          }));
          if (itemsToInherit.length > 0) {
            addLog(
              `【半島鐵盒】已將【${itemsToInherit.join("、")}】封存，將於下一局冒險繼承出現在行囊中！`,
              "milestone"
            );
          }
          if (retainChar && gameState.character) {
            addLog(
              `【半島鐵盒・序】已設定於下一局冒險繼續維持【${gameState.character.name}】（${gameState.character.title}）化身！`,
              "milestone"
            );
          }
          setShowIronBoxInheritModal(false);
          if (pendingNextGameCallback) {
            pendingNextGameCallback(itemsToInherit, retainChar);
          } else {
            handleStartNextGame(itemsToInherit, retainChar);
          }
        }}
      />

      {/* 遭遇米蘭小鐵匠擴充鐵盒確認視窗 */}
      <ExpandIronBoxModal
        isOpen={showExpandIronBoxModal}
        inventory={gameState.inventory}
        onCancel={() => setShowExpandIronBoxModal(false)}
        onConfirm={handleConfirmExpandIronBox}
      />

      {/* 米蘭小鐵匠鋪重鑄介面 */}
      {showBlacksmithModal && (
        <BlacksmithModal
          inventory={gameState.inventory}
          onClose={() => setShowBlacksmithModal(false)}
          onTrade={handleBlacksmithTrade}
          ironBoxPages={meta.ironBoxPages}
        />
      )}

      {/* 淘金小鎮常駐進入確認視窗 */}
      <GoldTownConfirmModal
        isOpen={showGoldTownConfirmModal}
        ap={gameState.stats.ap || 0}
        onCancel={() => {
          setShowGoldTownConfirmModal(false);
          setIsGoldTownFromRevealedCard(false);
        }}
        onConfirm={() => {
          setShowGoldTownConfirmModal(false);
          setGameState((prev) => ({
            ...prev,
            stats: {
              ...prev.stats,
              ap: Math.max(0, prev.stats.ap - 5),
            },
          }));
          addLog('【淘金小鎮】花費 5 點行動力踏入荒野礦區，開始探勘挖寶！', 'milestone');
          setShowGoldTownDigModal(true);
        }}
      />

      {/* 淘金小鎮挖寶介面 */}
      {showGoldTownDigModal && (
        <GoldTownDigModal
          isOpen={showGoldTownDigModal}
          onClose={() => handleGoldTownComplete({ foundItems: [], foundCoins: 0 })}
          onComplete={handleGoldTownComplete}
          currentPageTarget={getNextGoldTownPageTarget()}
        />
      )}

      {/* 梯田高山茶嶺農作介面 */}
      {showTerraceModal && (
        <TerraceModal
          isOpen={showTerraceModal}
          onClose={() => setShowTerraceModal(false)}
          currentRound={gameState.round}
          inventory={gameState.inventory}
          terracePlot={gameState.terracePlot}
          onPlant={handleTerracePlant}
          onTill={handleTerraceTill}
          onWater={handleTerraceWater}
          onHarvest={() => handleTerraceHarvest()}
          onClearPlot={handleTerraceClear}
        />
      )}

      {/* 浪漫手機復古通訊介面 */}
      {showRomanticPhoneModal && (
        <RomanticPhoneModal
          isOpen={showRomanticPhoneModal}
          onClose={() => setShowRomanticPhoneModal(false)}
          inventory={gameState.inventory}
          characterName={gameState.character?.name || ''}
          hasCipher={Boolean(gameState.inventory['暗號'] || gameState.flags['has_cipher'])}
          hasBigBen={Boolean(gameState.inventory['大笨鐘'] || gameState.flags['has_big_ben'])}
          hasStarryMood={Boolean(gameState.inventory['星晴'])}
          hasIstanbul={Boolean(gameState.inventory['伊斯坦堡'])}
          alreadyHasPastLover={Boolean(gameState.inventory['前世情人'] || gameState.flags['lover_trial_completed'])}
          onCompleteLoverTrial={() => {
            setGameState((prev) => {
              const nextInv = { ...prev.inventory };
              nextInv['前世情人'] = (nextInv['前世情人'] || 0) + 1;
              const currentOrder = prev.itemAcquisitionOrder || Object.keys(nextInv);
              const order = currentOrder.filter((k) => (nextInv[k] || 0) > 0);
              if (!order.includes('前世情人')) {
                order.push('前世情人');
              }
              return {
                ...prev,
                inventory: nextInv,
                itemAcquisitionOrder: order,
                flags: {
                  ...prev.flags,
                  lover_trial_completed: true,
                },
              };
            });
            setMeta((prev) => {
              if (prev.unlockedCardIds.includes('C2016-04')) return prev;
              return {
                ...prev,
                unlockedCardIds: [...prev.unlockedCardIds, 'C2016-04'],
              };
            });
            addLog('👑💕【前世誓約】魔術先生浪漫演繹，以《星晴》之銀海與《伊斯坦堡》之城堡完成誓約！獲得核心卡牌《前世情人》！', 'milestone');
            triggerCardShowcase('C2016-04', '浪漫手機連線・魔術先生考驗通過');
          }}
        />
      )}

      {/* 米蘭小鐵匠指引確認視窗 */}
      {/* 米蘭小鐵匠指引確認視窗 (持有鄉間的路時抽到米蘭小鐵匠觸發機制2) */}
      <SimpleActionModal
        isOpen={showGuideBlacksmithModal}
        icon="🎲"
        title="✦ 命運指引・鄉間的路 ✦"
        subtitle="遭遇米蘭的小鐵匠・環境變化契機"
        description={
          <>
            你身上持有【鄉間的路】！
            <br />
            是否要為米蘭的小鐵匠指引鄉間小路，讓小鐵匠願意在鄉村駐留開一間小鐵鋪？
          </>
        }
        tip={
          <>
            💡 <span className="font-bold">環境變化說明：</span>指引後小鐵匠將在鄉村常駐，在角色名稱旁新增「小鐵鋪」按鈕，往後可隨時點開拜訪小鐵匠！
          </>
        }
        cancelText="暫不指引"
        confirmText="為小鐵匠指引鄉間小路"
        onCancel={handleDeclineGuideBlacksmith}
        onConfirm={handleConfirmGuideBlacksmith}
      />

      {/* 米蘭小鐵匠各項獨立動作視窗 (樂器/鐘錶/鐵鏟/時光機) */}
      <BlacksmithActionModals
        showExchangeInstrumentModal={showExchangeInstrumentModal}
        showUpgradeClockModal={showUpgradeClockModal}
        showUpgradeShovelModal={showUpgradeShovelModal}
        showUpgradeTimeMachineModal={showUpgradeTimeMachineModal}
        onDeclineExchangeInstrument={handleDeclineExchangeInstrument}
        onConfirmExchangeInstrument={handleConfirmExchangeInstrument}
        onCloseUpgradeClock={() => setShowUpgradeClockModal(false)}
        onConfirmUpgradeClock={handleConfirmUpgradeClock}
        onCloseUpgradeShovel={() => setShowUpgradeShovelModal(false)}
        onConfirmUpgradeShovel={handleConfirmUpgradeShovel}
        onCloseUpgradeTimeMachine={() => setShowUpgradeTimeMachineModal(false)}
        onConfirmUpgradeTimeMachine={handleConfirmUpgradeTimeMachine}
      />

      {/* 飛行時光機使用：跳轉任一回合視窗 */}
      <FlightTimeMachineModal
        isOpen={showFlightTimeMachineModal}
        currentRound={gameState.round}
        selectedRound={selectedFlightRound}
        onSelectRound={setSelectedFlightRound}
        onCancel={() => setShowFlightTimeMachineModal(false)}
        onConfirm={() => {
          setShowFlightTimeMachineModal(false);
          addLog(
            `【飛行時光機】啟動時空跳轉！耀眼的光芒吞沒了四周，自第 ${gameState.round} 回合直接穿梭前往第 ${selectedFlightRound} 回合！`,
            "milestone"
          );
          startNewRound(selectedFlightRound);
        }}
      />

      {/* 遭遇小鐵匠重鑄武器雙向選擇視窗 */}
      <WeaponChoiceModal
        isOpen={showWeaponChoiceModal}
        onSelect={handleExecuteEncounterWeaponCraft}
        onCancel={() => setShowWeaponChoiceModal(false)}
      />
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
          badgeTitle={showcaseBadgeTitle || showcaseCard.badgeTitle}
          onClose={handleCloseShowcase}
        />
      )}
    </div>
  );
}
