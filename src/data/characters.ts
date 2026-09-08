import { CharacterDefinition } from '../types';

export const ALL_CHARACTERS: CharacterDefinition[] = [
  {
    id: 'char_hero',
    name: '英雄',
    title: '宿命之龍・天生英武',
    description: '縱使雙手空空，亦有赤手空拳降伏猛獸之能。浩氣長存，能在關鍵宿命決戰中展現破陣之威。',
    avatarColor: 'from-amber-600 to-red-800',
    avatarIcon: '🗡️',
    specialTrait: '對手遭遇戰中毋需消耗武器亦可突圍；持專屬神級兵魄能在決戰秒殺將軍。',
  },
  {
    id: 'char_joker',
    name: '喬克叔叔',
    title: '孤獨小丑・把戲大師',
    description: '身懷魔術雜耍絕技，看似歡樂滑稽，心中深藏著博取心儀之人歡笑的心願。',
    avatarColor: 'from-purple-600 to-indigo-900',
    avatarIcon: '🤡',
    specialTrait: '擁有專屬解謎裝備欄：隱藏著三段式命運詰問，唯有填入契合之物，方能博得心上人的嫣然一笑。',
  },
  {
    id: 'char_magic',
    name: '魔術先生',
    title: '神秘幻術家・洞悉天機',
    description: '手指靈動如風，善於翻弄撲克與時間幻影，常能未卜先知。',
    avatarColor: 'from-blue-600 to-cyan-900',
    avatarIcon: '🎩',
    specialTrait: '抽卡時能感知覆蓋卡牌中的「事件」靈息，提前洞察部分未知。',
  },
  {
    id: 'char_poet',
    name: '流浪詩人',
    title: '吉他吟遊者・浪跡天涯',
    description: '背著吉他浪跡城市與荒野，四處結交萍水相逢的過客。',
    avatarColor: 'from-stone-600 to-amber-950',
    avatarIcon: '🎸',
    specialTrait: '大幅提升遭遇各式奇遇NPC的機率；但若抽中《還在流浪》，將直接遭遇強大宿敵。',
  },
  {
    id: 'char_sunshine',
    name: '陽光宅男',
    title: '平凡青年・潛力無窮',
    description: '平日窩在角落沉浸音樂，一旦遭遇命運重擊或洗禮，將迎來不可思議的血脈覺醒。',
    avatarColor: 'from-yellow-500 to-orange-700',
    avatarIcon: '🧑‍💻',
    specialTrait: '抽中《公主病》或被凱薩琳詛咒時，能突破極限進化為神話級化身【女兒殿下】。',
  },
  {
    id: 'char_loser',
    name: '愛情廢柴',
    title: '飄落落葉・平淡無奇',
    description: '無任何特異功能，全憑純粹的造化在世間闖蕩。',
    avatarColor: 'from-amber-900 to-stone-900',
    avatarIcon: '🪵',
    specialTrait: '身無長物，不被任何光環眷顧，唯有憑藉堅毅的決策摸索生存之道。',
  },
  {
    id: 'char_chopin',
    name: '11月的蕭邦',
    title: '浪漫琴聖・至尊隱藏',
    description: '黑白琴鍵跳躍著詩意與古典的靈魂，漫步在落葉深秋的琴音之中。',
    avatarColor: 'from-amber-400 to-yellow-900',
    avatarIcon: '🎹',
    isSecret: true,
    specialTrait: '隱藏角色：極大幅度提升稀有經典樂章與珍稀唱片的感應抽取機率。',
  },
  {
    id: 'char_daughter',
    name: '女兒殿下',
    title: '前世情人・至尊守護',
    description: '無暇純淨的掌上明珠，擁有世間至深真摯情感的庇護，無法直接抽取。',
    avatarColor: 'from-pink-500 to-rose-800',
    avatarIcon: '👑',
    isSecret: true,
    specialTrait: '極度稀有進化體：全家族主題歌曲親和力滿點，能輕易感應並串聯深刻的親情羈絆。',
  },
];

// 玩家測試階段：初始盲抽化身僅開放【愛情廢柴】，怎麼抽都是
export const INITIAL_SELECTABLE_CHARACTERS = ALL_CHARACTERS.filter(
  (c) => c.id === 'char_loser'
);
