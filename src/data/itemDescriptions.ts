export interface SpecialItemInfo {
  name: string;
  category?: string;
  description?: string;
}

// 只有指定的特殊物品才會有專屬介紹與功能，目前確定存在的是「龍戰騎士的遺言」
export const SPECIAL_ITEMS: Record<string, SpecialItemInfo> = {
  龍戰騎士的遺言: {
    name: '龍戰騎士的遺言',
    category: '戰痕遺言・終章信物',
    description: '「與龍一戰的我、追逐著的他、傳說中的獸人、印地安的生物都戰敗了，春秋時代來臨，他終將與你一戰....」',
  },
  煙花易冷: {
    name: '煙花易冷',
    category: '舊故里的氣息',
    description: '「煙花易冷雨紛紛，行囊遇火不再焚」',
  },
  晴天: {
    name: '晴天',
    category: '天氣清爽',
    description: '「等到放晴的那天，也許會好一點」',
  },
  雙截棍: {
    name: '雙截棍',
    category: '習武之人切記',
    description: '「可攻擊對手的武器」',
  },
  雙刀: {
    name: '雙刀',
    category: '以牙還牙的手段',
    description: '「成雙成對的刀，等同對手被攻擊了兩次」',
  },
  最後的戰役: {
    name: '將軍的決戰書',
    category: '戰帖',
    description: '「在這亂舞春秋，將軍下了戰書，第三十回合決戰！」',
  },
  本草綱目: {
    name: '本草綱目',
    category: '善本書',
    description: '「開啟物品說明與進階功能」',
  },
  無雙: {
    name: '無雙',
    category: '英雄霸氣',
    description: '「天賦之人持有將戰無不勝」',
  },
  超跑女神指引的賽道: {
    name: '超跑女神指引的賽道',
    category: '通關進程指引',
    description: '「這是條充滿戰鬥的路。」',
  },
  烏克麗麗: {
    name: '烏克麗麗',
    category: '吉他',
    description: '「好像有人想要？」',
  },
  療傷燒肉粽: {
    name: '療傷燒肉粽',
    category: '治癒用',
    description: '「到底誰需要療傷呢？」',
  },
  床邊故事: {
    name: '床邊故事',
    category: 'zzz',
    description: '「傳說中聽了這故事就會睡著」',
  },
  免費教學錄影帶: {
    name: '免費教學錄影帶',
    category: '哎喲不錯',
    description: '「你是不是感覺到了某些東西都揭曉了」',
  },
  飛行時光機: {
    name: '飛行時光機',
    category: '控制時間機器',
    description: '「點擊使用」',
  },
  稻香: {
    name: '稻香',
    category: '原物料',
    description: '「金黃稻穗散發濃郁香氣」',
  },
  甜甜的: {
    name: '甜點必備',
    category: '調味品',
    description: '「加上去任何東西都是甜的」',
  },
  青花瓷: {
    name: '青花瓷',
    category: '出土文物',
    description: '「瓷器的原料是...？」',
  },
  蘭亭序: {
    name: '天下第一行書',
    category: '出土文物',
    description: '「晉朝時就寫下的東西」',
  },
  泥土: {
    name: '泥土',
    category: '原物料',
    description: '「青花瓷經烈焰焚燒去釉後化成的肥沃泥土，或許能種些什麼？」',
  },
  爺爺泡的茶: {
    name: '爺爺',
    category: '通關關鍵卡牌',
  },
  粉色海洋: {
    name: 'Romeo',
    category: '通關關鍵卡牌',
  },
  前世情人: {
    name: 'Hathaway',
    category: '通關關鍵卡牌',
  },
};

/**
 * 取得行囊物品的說明資訊：
 * 1. 若為指定特殊物品，回傳詳細介紹視窗內容
 * 2. 未指定之物品，視窗僅顯示「卡牌名稱」
 */
export function getItemInfo(name: string): SpecialItemInfo {
  if (SPECIAL_ITEMS[name]) {
    return SPECIAL_ITEMS[name];
  }
  return {
    name,
  };
}
