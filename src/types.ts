export type CardType = '角色' | '物品' | '事件' | '遭遇' | '日記' | '線索';

export interface CardOption {
  text: string;
  require?: {
    character?: string;
    notCharacter?: string;
    item?: string;
    items?: string[]; // 多件物品同時需求（如合成材料）
    itemCount?: number;
    flag?: string;
    flagValue?: boolean | string | number;
    notFlag?: string;
    flag2?: string;
    flag2Value?: boolean | string | number;
  };
  resultText: string;
  effect?: {
    addItem?: string;
    removeItem?: string;
    removeItems?: string[]; // 多件物品同時消耗
    setFlag?: Record<string, boolean | string | number>;
    setMetaFlag?: Record<string, boolean | string | number>;
    forceNextCardId?: string;
    changeCharacter?: string;
    apChange?: number; // 體力/行動力變更 (+ 恢復, - 消耗)
    triggerVictory?: '太陽之子' | '最偉大的作品' | '周杰倫家庭';
    triggerDefeat?: string;
    rewindRound?: number; // 回合數倒流 (遞減) 例如: 《反方向的鐘》回到第 1 回合
    advanceRound?: number; // 回合數推進 (遞增) 例如: 穿梭跳躍
    advanceGame?: number; // 局數推進
    clearItems?: boolean;
    clearProgress?: boolean;
    timedAction?: {
      seconds: number;
      buttonText: string;
      timeoutResultText: string;
      clickResultText: string;
      onClickDefeat?: boolean;
      onTimeoutVictory?: boolean;
    };
  };
}

export interface CardDefinition {
  id: string; // e.g. C2001-09
  name: string; // 曲名
  album: string; // 收錄專輯
  year: number; // 發行年份
  track: number | string; // 第幾首
  type: CardType; // 分類
  maxDraws: number; // 單局上限
  weight: number; // 相對權重 (0 = 不自然盲抽，靠觸發)
  route?: '太陽之子' | '最偉大的作品' | '周杰倫家庭' | '通用';
  flavorText: string;
  condition?: (state: GameState, meta: MetaProgress) => boolean;
  options?: CardOption[];
  coverImage?: string; // 原版專輯封面或卡牌插圖 (可選)
  // Special immediate effect on draw
  onDraw?: (state: GameState, meta: MetaProgress) => { log: string; nextCardId?: string };
}

export interface CharacterDefinition {
  id: string;
  name: string;
  title: string;
  description: string;
  avatarColor: string;
  avatarIcon: string; // 模擬頭像或特色圖案 (愛情廢柴固定為木柴 🪵)
  isSecret?: boolean;
  specialTrait: string;
}

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  requiredCards: string[];
  rewardDescription: string;
}

export interface GameHistoryRecord {
  gameNumber: number;
  characterName: string;
  characterTitle: string;
  characterIcon: string;
  endRound: number;
  outcomeType: 'VICTORY' | 'DEFEAT' | 'AP_DEPLETED';
  outcomeTitle: string;
  timestamp: string;
  logs: Array<{
    round: number;
    text: string;
    type?: 'draw' | 'action' | 'combat' | 'milestone' | 'warning';
  }>;
}

export interface RouteVictoryRecord {
  route: '太陽之子' | '最偉大的作品' | '周杰倫家庭' | string;
  gameNumber: number; // 達成時的累計局數 (例如：第 5 局)
  round: number; // 達成時當局的回合 (例如：第 16 回合)
  totalRounds: number; // 跨局累計總消耗回合
  timestamp: string;
  characterName: string;
}

export interface SettlementRecord {
  id: string;
  gameNumber: number;
  round: number;
  totalRounds: number;
  outcomeType: 'VICTORY' | 'DEFEAT';
  route: string;
  characterName: string;
  characterTitle?: string;
  characterIcon?: string;
  timestamp: string;
  isAllCompleted: boolean;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  gradeTitle: string;
  gradeColor: string;
  itemsCount: number;
  allRecords?: Record<string, RouteVictoryRecord>;
  defeatReason?: string;
}

export interface MetaProgress {
  unlockedCardIds: string[]; // 圖鑑解鎖
  unlockedAchievements: string[]; // 成就解鎖
  activeSkills?: string[]; // 玩家已啟動的成就技能
  ironBoxUnlocked?: boolean; // 是否已解鎖過半島鐵盒
  unlockedDiaries: string[]; // 日記篇章
  ironBoxItems: string[]; // 半島鐵盒保存物品
  pastGamesCount: number; // 累計遊玩局數
  totalRoundsPlayed?: number; // 跨局累計遊玩總回合
  victories: string[]; // 達成過的結局名稱
  routeVictoryRecords?: Record<string, RouteVictoryRecord>; // 路線通關戰績結算
  nextGameFlags: Record<string, boolean | string | number>; // 跨局 Flag (如 亂舞春秋時代)
  gameHistories?: GameHistoryRecord[]; // 歷代冒險日誌記錄
  settlementHistory?: SettlementRecord[]; // 傳奇殿堂・歷次結算戰績卡
}

export interface JokerEquipment {
  place: string | null; // 在我的地盤
  shoes: string | null; // 穿鞋子特大號
  performance: string | null; // 表演紅模仿
}

export interface GameState {
  gameNumber: number; // 第 X 局
  round: number; // 第 Y 回合 (1-30)
  maxRounds: number; // 30
  character: CharacterDefinition | null;
  inventory: Record<string, number>; // item name -> count
  drawnCount: Record<string, number>; // card id -> count drawn in current game
  flags: Record<string, boolean | string | number>; // 當前局標籤
  jokerSlots?: JokerEquipment;
  reversedClockUsesRemaining: number; // 反方向的鐘剩餘次數 (上限3次)
  stats: {
    ap: number; // 行動力 (Action Points)
  };
  logs: Array<{
    round: number;
    text: string;
    type?: 'draw' | 'action' | 'combat' | 'milestone' | 'warning';
  }>;
  phase: 'CHOOSE_CHARACTER' | 'DRAW_THREE' | 'REVEAL_CARD' | 'BOSS_BATTLE' | 'GAME_OVER';
  revealedCard: CardDefinition | null;
  currentDrawChoices: CardDefinition[];
  bossRound?: number; // 1-8 for General
  bossHp?: number; // 100
  activeRouteHint?: string;
  victoryType?: '太陽之子' | '最偉大的作品' | '周杰倫家庭';
  defeatReason?: string;
}
