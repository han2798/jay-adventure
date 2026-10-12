import { AchievementDefinition } from '../types';

export const ALL_ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'ach_dark_trilogy',
    title: '暗黑三部曲',
    description: '收集《以父之名》、《夜的第七章》、《止戰之殤》三首傳奇史詩樂章。',
    requiredCards: ['以父之名', '夜的第七章', '止戰之殤'],
    rewardDescription: '冥冥中感知黑夜中的宿命脈絡，所有對手戰鬥成功率與反擊傷害大幅提升。',
  },
  {
    id: 'ach_yong_wu',
    title: '詠物調',
    description: '收集《青花瓷》、《蘭亭序》兩首中國風極致詞作。',
    requiredCards: ['青花瓷', '蘭亭序'],
    rewardDescription: '對於珍奇物品具有獨特眼光，或許讚賞古堡內某人的物品會有意想不到收穫！',
  },
  {
    id: 'ach_four_magicians',
    title: '魔杰座四人組',
    description: '收集《龍戰騎士》、《魔術先生》、《流浪詩人》、《喬克叔叔》。',
    requiredCards: ['龍戰騎士', '魔術先生', '流浪詩人', '喬克叔叔'],
    rewardDescription: '魔杰奇境共鳴，下一局開局可自由鎖定魔杰座核心角色或關鍵卡牌。',
  },
  {
    id: 'ach_three_weapons',
    title: '三雙利器',
    description: '收集《無雙》、《雙刀》、《雙截棍》三樣頂級兵刃。',
    requiredCards: ['無雙', '雙刀', '雙截棍'],
    rewardDescription: '殺伐之氣直衝雲霄，下一局有高機率直接化身為【英雄】。',
  },
  {
    id: 'ach_trio_listen',
    title: '三聽其語',
    description: '收集《聽媽媽的話》、《聽爸爸的話》、《聽見下雨的聲音》。',
    requiredCards: ['聽媽媽的話', '聽爸爸的話', '聽見下雨的聲音'],
    rewardDescription: '家庭親情力量覺醒，可解鎖召喚大天使《葉惠美》的關鍵奧秘。',
  },
  {
    id: 'ach_three_goddesses',
    title: '陸海空女神',
    description: '收集遭遇《嘻哈空姐》、《超跑女神》、《美人魚》。',
    requiredCards: ['嘻哈空姐', '超跑女神', '美人魚'],
    rewardDescription: '貫穿天與海的指引，直接獲悉《太陽之子》、《最偉大的作品》、《周杰倫家庭》三線核心線索。',
  },
  {
    id: 'ach_vivian',
    title: '經典徐若瑄',
    description: '收集《可愛女人》、《伊斯坦堡》、《龍捲風》、《簡單愛》、《開不了口》、《愛情懸崖》。',
    requiredCards: ['可愛女人', '伊斯坦堡', '龍捲風', '簡單愛', '開不了口', '愛情懸崖'],
    rewardDescription: '獲知秘言：「不用感到抱歉，你的想像依然無限大，也不需要說話，等著他回來吧」，解開《范特西》合成鑰匙。',
  },
  {
    id: 'ach_four_colors',
    title: '四色之韻',
    description: '收集《藍色風暴》、《黑色毛衣》、《白色風車》、《粉色海洋》。',
    requiredCards: ['藍色風暴', '黑色毛衣', '白色風車', '粉色海洋'],
    rewardDescription: '調色盤交織出絕美景致，每局可額外抵擋一次命運懲罰。',
  },
  {
    id: 'ach_charming',
    title: '把妹三件套',
    description: '收集《浪漫手機》、《告白氣球》、《甜甜的》。',
    requiredCards: ['浪漫手機', '告白氣球', '甜甜的'],
    rewardDescription: '浪漫氣場縈繞，大幅提升後續遭遇女性NPC與獲贈線索的機率。',
  },
];
