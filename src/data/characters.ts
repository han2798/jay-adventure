import { CharacterDefinition } from '../types';

export const ALL_CHARACTERS: CharacterDefinition[] = [
  {
    id: 'char_hero', //已完成
    name: '英雄',
    title: '擊殺 雙殺 三殺！',
    description: '赤手空拳就能擊退敵人。',
    avatarColor: 'from-amber-600 to-red-800',
    avatarIcon: '🗡️',
    startingAp: 15,
    specialTrait: '英雄《無雙》，或許能克敵制勝！',
  },
  {
    id: 'char_joker',
    name: '喬克叔叔',
    title: '孤獨小丑・把戲大師',
    description: '常規角色，韌性極強的小丑，能免於一次行動力歸0的懲罰。',
    avatarColor: 'from-purple-600 to-indigo-900',
    avatarIcon: '🤡',
    startingAp: 15,
    specialTrait: '常規角色。韌性極強的小丑，能免於一次AP歸0的懲罰。透過《免費教學錄影帶》能開啟裝備欄：分別裝備在「我的地盤」、穿「鞋子特大號」、表演「紅模仿」後，可以召喚出《可愛女人》。',
  },
  {
    id: 'char_magic', //已完成
    name: '魔術先生',
    title: '神秘魔術師・洞悉卡牌',
    description: '能看透「事件」卡牌的角色。初始行動力為 10 點。',
    avatarColor: 'from-blue-600 to-cyan-900',
    avatarIcon: '🎩',
    startingAp: 10,
    specialTrait: '能看透「物品」卡牌。',
  },
  {
    id: 'char_poet',
    name: '流浪詩人',
    title: '吉他吟遊者・浪跡天涯',
    description: '常規角色，背著吉他浪跡天涯，四處結交過客。初始行動力為 20 點。',
    avatarColor: 'from-stone-600 to-amber-950',
    avatarIcon: '🎸',
    startingAp: 20,
    specialTrait: '常規角色，初始AP為20。四處流浪的他會讓遭遇NPC的機會上升，但抽到《還在流浪》的話下一回合會直接遭遇對手（半獸人等）。透過《免費教學錄影帶》能開啟天賦：可花費5AP指定下一回合直接出現可常駐的卡牌。',
  },
  {
    id: 'char_sunshine', //已完成
    name: '陽光宅男',
    title: '平凡青年・真愛覺醒',
    description: '宅男上吧！去尋找真愛！',
    avatarColor: 'from-yellow-500 to-orange-700',
    avatarIcon: '🧑‍💻',
    startingAp: 15,
    specialTrait: '無初始能力，但若能捕獲公主芳心，或許宅男將不再是宅男！',
  },
  {
    id: 'char_loser', //已完成
    name: '愛情廢柴',
    title: '凋零木材・平淡無奇',
    description: '無任何特殊能力。',
    avatarColor: 'from-amber-900 to-stone-900',
    avatarIcon: '🪵',
    startingAp: 15,
    specialTrait: '就算你持有免費教學錄影帶了，還是沒有任何天賦，靠自己的造化在遊戲裡闖蕩吧！',
  },
  {
    id: 'char_chopin',
    name: '11月的蕭邦',
    title: '浪漫琴聖・至尊隱藏',
    description: 'SS級隱藏角色，最低機率抽得，最容易完成《最偉大的作品》路線。',
    avatarColor: 'from-amber-400 to-yellow-900',
    avatarIcon: '🎹',
    isSecret: true,
    startingAp: 15,
    specialTrait: 'SS級隱藏角色。最低機率抽得，最容易完成《最偉大的作品》路線的角色，可以讓相關核心樂章抽卡觸發率大幅增加！',
  },
  {
    id: 'char_daughter', //已完成
    name: '女兒殿下',
    title: '前世情人・真愛守護',
    description: '你已經從【陽光宅男】進化覺醒。',
    avatarColor: 'from-pink-500 to-rose-800',
    avatarIcon: '👑',
    isSecret: true,
    startingAp: 15,
    specialTrait: '請守護女兒殿下完成此局！',
  },
];

// 開放抽取的初始角色化身：陽光宅男、愛情廢柴、英雄、魔術先生
export const INITIAL_SELECTABLE_CHARACTERS = ALL_CHARACTERS.filter((c) =>
  ['char_sunshine', 'char_loser', 'char_hero', 'char_magic'].includes(c.id)
);
