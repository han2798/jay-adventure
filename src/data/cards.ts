import { CardDefinition } from '../types';

/**
 * 周杰倫音樂宇宙・全卡牌資料庫 (全 191 張：175 歌曲卡 + 16 專輯卡)
 * 依照卡牌 ID (發行年份與曲目序號) 統一編排
 * 
 * 備註：
 * 1. 既有已實裝之 63 張卡牌完整保留其機制、效果與邏輯
 * 2. 其餘 128 張新卡牌預設權重 weight: 0 (尚未開放盲抽)，預留 // TODO: 第二階段效果與選項實裝
 * 3. 供後續在程式碼中直接編輯文字敘述與自訂效果
 */
export const CARD_DATABASE: CardDefinition[] = [

  // =========================================================================
  // 【2000 年・首張專輯《Jay》】
  // =========================================================================
  {
    id: 'C2000-01',
    name: '可愛女人',
    album: 'Jay',
    year: 2000,
    track: 1,
    type: '物品',
    maxDraws: 1,
    weight: 4,
    route: '最偉大的作品',
    flavorText: '「漂亮的讓我面紅的可愛女人，溫柔的讓我心疼的可愛女人……」',
    options: [{ text: '收下這份傾慕信物', resultText: '獲得珍稀情詩卡片【可愛女人】！', effect: { addItem: '可愛女人' } }],
  },
  {
    id: 'C2000-02',
    name: '完美主義',
    album: 'Jay',
    year: 2000,
    track: 2,
    type: '線索',
    maxDraws: 1,
    weight: 5,
    route: '最偉大的作品',
    flavorText: '「如果說懷疑，可以造就哲學的真理；那一首完美的旋律，是否能跨越時間？」',
    options: [
      {
        text: '收入行囊細細研讀',
        resultText: '你領悟了極致的苛求精神，獲得【完美主義】。',
        effect: { addItem: '完美主義' },
      },
    ],
  },
  // ==========================================
  // [C2000-03] 星晴
  // ==========================================
  {
    id: 'C2000-03', //已完成
    name: '星晴',
    album: 'Jay',
    year: 2000,
    track: 3,
    type: '事件',
    maxDraws: 1,
    weight: 10,
    route: '周杰倫家庭',
    flavorText: '「看星星 一顆兩顆三顆四顆 連成線」\n遠方的星聽得見嗎？有沒有人的心願能實現？。',
    options: [
      {
        text: '乘著風，遊盪在藍天邊',
        resultText: '夜空中繁星閃爍，宛如銀海般的笑容。\n你將這份笑容收進行囊，行動力恢復 +4！',
        effect: {
          addItem: '星晴',
          apChange: 4,
        },
      },
    ],
  },
  // ==========================================
  // [C2000-04] 娘子
  // ==========================================
  {
    id: 'C2000-04',
    name: '娘子',
    album: 'Jay',
    year: 2000,
    track: 4,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「娘子她人在江南等我，淚長流不知洗去多少愁……」塞北的落日下，漫天黃沙模糊了歸鄉的路。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2000-05] 鬥牛
  // ==========================================
  {
    id: 'C2000-05',
    name: '鬥牛',
    album: 'Jay',
    year: 2000,
    track: 5,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「你說你說分數怎麼停留，一直在停留，誰在防守誰在進攻……」街頭球場上燃燒的青春汗水！',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2000-06] 黑色幽默
  // ==========================================
  {
    id: 'C2000-06',
    name: '黑色幽默',
    album: 'Jay',
    year: 2000,
    track: 6,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「說不上為什麼，我變得更消極，難道是黑色的幽默……」憂鬱深沉的黑白琴鍵在寂靜的雨夜中悲鳴。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  {
    id: 'C2000-07', //已完成
    name: '伊斯坦堡',
    album: 'Jay',
    year: 2000,
    track: 7,
    type: '事件',
    maxDraws: 1,
    weight: 10,
    route: '周杰倫家庭',
    flavorText: '「走過了很多地方，我來到伊斯坦堡，就像是童話故事，有教堂有城堡」\n或許我無法造出城堡，但我能帶妳去看城堡。',
    options: [
      {
        text: '說穿了其實我的願望就這麼小',
        resultText: '希望有天能帶她到伊斯坦堡，行動力+4！\n獲得【伊斯坦堡】卡牌放入行囊！',
        effect: {
          addItem: '伊斯坦堡',
          apChange: 4,
        },
      },
    ],
  },
  {
    id: 'C2000-08', //已完成
    name: '印地安老斑鳩',
    album: 'Jay',
    year: 2000,
    track: 8,
    type: '遭遇',
    maxDraws: 5,
    weight: 20, // 機率 20%
    route: '太陽之子',
    flavorText: '「在一處被廢棄的白蟻丘，站著一隻餓昏的老斑鳩。」',
    options: [
      {
        text: '趕走老斑鳩',
        resultText: '老斑鳩怪叫撲騰，趁亂偷走了行囊中的一個物品後跑走了！',
        effect: {
          removeRandomItem: true,
        },
      },
      {
        text: '餵食老斑鳩',
        require: { item: '麥芽糖', unavailableReason: '缺少可餵食的東西' },
        resultText: '老斑鳩吃飽離開了，留下了認可的羽毛！獲得【印地安老斑鳩】卡片！',
        effect: {
          removeItem: '麥芽糖',
          addItem: '印地安老斑鳩',
          setFlag: { defeated_spotted_dove: true, defeat_印地安老斑鳩: true },
        },
      },
    ],
  },
  {
    id: 'C2000-09',
    name: '龍捲風',
    album: 'Jay',
    year: 2000,
    track: 9,
    type: '事件',
    maxDraws: 1,
    weight: 5,
    route: '通用',
    flavorText: '「愛像一陣風，吹完它就走，這樣的節奏，誰都無可奈何……」狂暴的風暴席捲而過！',
    options: [
      {
        text: '在龍捲風眼中逆風前行',
        resultText: '狂風淬鍊了意志，精神更為堅韌，行動力+3！',
        effect: { apChange: 3 },
      },
    ],
  },
  {
    id: 'C2000-10', //已完成
    name: '反方向的鐘',
    album: 'Jay',
    year: 2000,
    track: 10,
    type: '物品',
    maxDraws: 1,
    weight: 0, // 只能從威廉古堡威廉二世處獲得
    route: '太陽之子',
    isSynthesizedOnly: true,
    acquisitionSource: '從威廉二世身邊盜取',
    hintText: '獲得【反方向的鐘】，若不幸在決戰時戰敗，可藉由此鐘倒流至前一回合重整旗鼓（最多 3 次機會）！',
    specialAcquisitionNote:
      '此卡牌為專屬特殊機制卡牌，在常規抽卡池中無法抽卡獲得。\n已從威廉古堡寢殿成功獲得，並永久記錄至你的冒險手冊與音樂圖鑑！',
    flavorText: '「穿梭時間的畫面的鐘，從反方向開始移動……」',
    options: [],
  },
  {
    id: 'C2000-SS',
    name: '《杰倫》',
    album: 'Jay',
    year: 2000,
    track: 'SS',
    type: '線索',
    maxDraws: 1,
    weight: 0, // 合成取得
    route: '最偉大的作品',
    flavorText: '【傳奇神專・初號機】西元 2000 年，華語樂壇震撼的一筆！融合完美主義、我不配與超人不會飛的跨時空神作。',
    options: [
      {
        text: '領悟首張同名專輯的開天闢地之力',
        resultText: '神專之光融入靈魂！全能力大幅提升！',
        effect: { addItem: '《杰倫》', apChange: 15 },
      },
    ],
  },

  // =========================================================================
  // 【2001 年・第二張專輯《范特西》】
  // =========================================================================
  {
    id: 'C2001-01', //已完成
    name: '愛在西元前',
    album: '范特西',
    year: 2001,
    track: 1,
    type: '事件',
    maxDraws: 2,
    weight: 6,
    route: '通用',
    flavorText: '「古巴比倫王頒布了漢摩拉比法典，刻在黑色的玄武岩，距今已經三千七百多年……」狂暴的時空亂流撕扯著一切物質！',
    options: [
      {
        text: '穿越時空回到西元前',
        resultText: '時空逆流！只保留角色身份重新回到第 1 回合，身上的道具與當局成就蒐集在狂瀾中悉數清除！',
        effect: {
          rewindRound: 1,
          clearItems: true,
          clearProgress: true,
        },
      },
      {
        text: '啟動【時光機】維持當前時空',
        require: { item: '時光機' },
        resultText: '你啟動了【時光機】，抵抗住時空狂瀾，選擇不進行時光逆流，平穩繼續當前的冒險。',
        effect: {},
      },
      {
        text: '在黑色的玄武岩刻下誓約，拼死抵禦時空狂瀾',
        resultText: '你立於風沙咆哮的黑色玄武岩前，以無比堅毅的信念硬生生抗拒時空撕扯！\n\n你成功守住了行囊物品與當前時空，但元氣重挫，行動力 -10！',
        effect: { apChange: -10 },
      },
    ],
  },
  {
    id: 'C2001-02',
    name: '爸我回來了',
    album: '范特西',
    year: 2001,
    track: 2,
    type: '線索',
    maxDraws: 1,
    weight: 5,
    route: '最偉大的作品',
    flavorText: '「不要再打我媽媽……」憤怒又沉重的呢喃，控訴著家庭暴力陰影。',
    options: [{ text: '收入行囊保存', resultText: '獲得【爸我回來了】。', effect: { addItem: '爸我回來了' } }],
  },
  {
    id: 'C2001-03',
    name: '簡單愛',
    album: '范特西',
    year: 2001,
    track: 3,
    type: '事件',
    maxDraws: 1,
    weight: 5,
    route: '通用',
    flavorText: '「我想就這樣牽著你的手不放開，愛可不可以簡簡單單沒有傷害……」純真陽光灑落單車後座。',
    options: [
      {
        text: '騎著單車在午後微風中漫遊',
        resultText: '最單純的快樂湧上心頭，行動力大幅恢復！',
        effect: { apChange: 15 },
      },
    ],
  },
  {
    id: 'C2001-04', //已完成
    name: '忍者',
    album: '范特西',
    year: 2001,
    track: 4,
    type: '遭遇',
    maxDraws: 1,
    weight: 15, // 上限1，抽卡機率15%
    route: '太陽之子',
    hasEnvironmentEffect: true, // 具備環境變化效果（追逐忍者狀態）
    environmentEffectName: '追逐忍者',
    flavorText: '「隱身要徹底 要忘記 什麼是自己！」你正想攻擊忍者，他身法詭譎迅捷避開！',
    options: [
      {
        text: '使用雙截棍攻擊，攔截飛躍的忍者',
        require: { item: '雙截棍', flag: 'ninja_confrontation', hideWhenUnavailable: true },
        resultText: '快使用雙截棍！呼呼哈兮！乾淨俐落地擊中空中的黑影！忍者心悅誠服奉上忍道信物，獲得【忍者】卡牌，解除【追逐忍者】狀態！',
        effect: {
          removeItem: '雙截棍',
          addItem: '忍者',
          setFlag: { defeated_ninja: true, defeat_忍者: true, ninja_confrontation: false, ninja_chasing: false },
        },
      },
      {
        text: '未持有雙截棍，眼看忍者施展遁術逃離',
        require: { notItem: '雙截棍', flag: 'ninja_confrontation', hideWhenUnavailable: true },
        resultText: '未能在第一時間以雙截棍制伏，忍者冷笑一聲投擲煙霧彈遁入暗夜！日後若再次抽到將重新展開追逐。',
        effect: {
          setFlag: { ninja_confrontation: false, ninja_chasing: false },
        },
      },
      {
        text: '目睹忍者在瓦頂飛躍逃竄，立刻展開追逐！',
        require: { notFlag: 'ninja_confrontation', hideWhenUnavailable: true },
        resultText: '進入【追逐忍者】環境狀態！忍者正朝著第 30 回合飛速狂奔，請在忍者抵達終點前追上他！',
        effect: {
          setFlag: { ninja_chasing: true },
        },
      },
    ],
  },
  {
    id: 'C2001-05',
    name: '開不了口',
    album: '范特西',
    year: 2001,
    track: 5,
    type: '事件',
    maxDraws: 1,
    weight: 5,
    route: '通用',
    flavorText: '「沒有你在我有多難熬，沒有你在我有多難熬……那些說不出口的話化作了深邃的旋律。」',
    options: [
      {
        text: '將未說出口的話深埋心底',
        resultText: '沉默孕育了堅忍，心神專注度提升，行動力+3！',
        effect: { apChange: 3 },
      },
    ],
  },
  {
    id: 'C2001-06',
    name: '上海一九四三',
    album: '范特西',
    year: 2001,
    track: 6,
    type: '日記',
    maxDraws: 1,
    weight: 5,
    route: '通用',
    flavorText: '「泛黃的相片，老舊的弄堂，郵差送來了歲月的思念……」',
    options: [
      {
        text: '將歷史殘頁收入劇情日記本',
        resultText: '全域日記已解鎖篇章【上海一九四三】！塵封的時代故事揭開一角。',
        effect: { addItem: '上海一九四三' },
      },
    ],
  },
  {
    id: 'C2001-07',
    name: '對不起',
    album: '范特西',
    year: 2001,
    track: 7,
    type: '線索',
    maxDraws: 1,
    weight: 5,
    route: '最偉大的作品',
    flavorText: '「廣場一枚銅幣，教堂的鐘聲起……一句真心的抱歉，洗滌了心靈。」',
    options: [{ text: '收入行囊保存', resultText: '獲得【對不起】。', effect: { addItem: '對不起' } }],
  },
  {
    id: 'C2001-08', //已完成
    name: '威廉古堡',
    album: '范特西',
    year: 2001,
    track: 8,
    type: '事件',
    maxDraws: 2,
    weight: 0, // 抽卡機率 0%，只有跨時代選項正確才會觸發
    route: '最偉大的作品',
    flavorText: '「藤蔓爬滿了伯爵的墳墓，眼前一片荒蕪，而你進入古堡裡......」',
    options: [
      {
        text: '偷偷進入威廉二世房間',
        resultText: '你輕手輕腳地探入威廉二世昏暗的寢殿……',
        effect: {},
      },
      {
        text: '向凱薩琳公主問好',
        resultText: '向高傲冷豔的凱薩琳公主問好致意……',
        effect: {},
      },
      {
        text: '好奇胖女巫手上的東西',
        resultText: '你好奇地湊上前去打量胖女巫手中的神祕物件……',
        effect: {},
      },
      {
        text: '詢問豬管家為什麼要念約翰福音做彌補',
        resultText: '你走向愁容滿面的豬管家，輕聲詢問他口中的約翰福音……',
        effect: {},
      },
    ],
  },
  {
    id: 'C2001-09', //已完成
    name: '雙截棍',
    album: '范特西',
    year: 2001,
    track: 9,
    type: '物品',
    maxDraws: 6,
    weight: 12,
    route: '通用',
    flavorText: '「他們兒子我習慣....。」',
    options: [
      {
        text: '快使用雙截棍！哼哼哈兮！',
        resultText: '獲得武器【雙截棍】！',
        effect: { addItem: '雙截棍'},
      },
    ],
  },
  {
    id: 'C2001-10',
    name: '安靜',
    album: '范特西',
    year: 2001,
    track: 10,
    type: '線索',
    maxDraws: 1,
    weight: 5,
    route: '最偉大的作品',
    flavorText: '「我也會慢慢習慣，一個人安靜的走開……」',
    options: [{ text: '收入行囊保存', resultText: '獲得【安靜】。', effect: { addItem: '安靜' } }],
  },
  {
    id: 'C2001-SS',
    name: '《范特西》',
    album: '范特西',
    year: 2001,
    track: 'SS',
    type: '線索',
    maxDraws: 1,
    weight: 0, // 合成取得
    route: '最偉大的作品',
    flavorText: '【傳奇神專・范特西】西元 2001 年，橫掃金曲獎的奇幻巔峰！以爸我回來了、對不起與安靜構築的傳世經典。',
    options: [
      {
        text: '釋放范特西神專的無盡幻想',
        resultText: '天馬行空的旋律加護全身！獲得【范特西】傳奇神專！',
        effect: { addItem: '《范特西》', apChange: 15 },
      },
    ],
  },

  // =========================================================================
  // 【2002 年・第三張專輯《八度空間》】
  // =========================================================================
  {
    id: 'C2002-01', //已完成
    name: '半獸人',
    album: '八度空間',
    year: 2002,
    track: 1,
    type: '遭遇',
    maxDraws: 5,
    weight: 0, // 抽卡機率0%是因為已經可以透過"C2010-01跨時代"觸發
    route: '太陽之子',
    flavorText: '「你跨越了時代，但半獸人正揮舞著雙拳利爪怒目而視！」',
    options: [
      {
        text: '攻擊',
        resultText: '你對半獸人發動攻擊！',
        effect: {},
      },
    ],
  },
  {
    id: 'C2002-02', //已完成
    name: '半島鐵盒',
    album: '八度空間',
    year: 2002,
    track: 2,
    type: '物品',
    maxDraws: 1,
    weight: 10,
    route: '最偉大的作品',
    flavorText: '「回想剛買的書 一本名叫半島鐵盒。」，透過鐵盒可以把你的珍寶都裝進去，不會隨局數的變遷而丟失……',
    options: [
      {
        text: '拾起半島鐵盒放入行囊',
        resultText: '獲得【半島鐵盒】！你可以藉由鐵盒跨越局數宿命，將關鍵線索或特定物品完整傳承至下一局。',
        effect: {
          addItem: '半島鐵盒',
          setFlag: { hasIronBox: true },
        },
      },
    ],
  },
  // ==========================================
  // [C2002-03] 暗號
  // ==========================================
  {
    id: 'C2002-03',
    name: '暗號',
    album: '八度空間',
    year: 2002,
    track: 3,
    type: '物品',
    maxDraws: 1,
    weight: 10,
    route: '周杰倫家庭',
    flavorText: '「你停止收訊號 我開始搜尋不到……到底有誰知道 是幾點鐘方向 你才會收到暗號」',
    options: [
      {
        text: '記下字條上的通訊暗號',
        resultText: '你發現了字條上潦草寫著的一串號碼【0000】！\n若持有浪漫手機，打開電話簿或許能撥往前世……',
        effect: {
          addItem: '暗號',
        },
      },
    ],
  },
  {
    id: 'C2002-04', //已完成
    name: '龍拳',
    album: '八度空間',
    year: 2002,
    track: 4,
    type: '事件',
    maxDraws: 3,
    weight: 5,
    route: '太陽之子',
    condition: (state) => !state.inventory['龍戰騎士的遺言'] && !state.flags['defeat_龍戰騎士'],
    flavorText: '「以敦煌為圓心的東北東，這民族的海岸線像一隻弓，那長城 像五千年來待射的夢！」',
    options: [
      {
        text: '我把天地拆封將長江水掏空',
        require: { notCharacter: '英雄' },
        resultText: '長江之水奔湧而盡，你身心俱疲，在乾涸的河灘上動彈不得……',
        effect: {
          forceNextCardId: 'C2004-06', // 強制遭遇 擱淺
        },
      },
      {
        text: '將 東方 的日出調整了時空',
        require: { notCharacter: '英雄' },
        resultText: '時空指針發生偏轉，東方的日出逆流而動，周遭景致倒退，你被捲入時光長河！',
        effect: {
          forceNextCardId: 'C2002-08', // 強制遭遇 回到過去
        },
      },
      {
        text: '等待英雄 我就是那條龍',
        require: { character: '英雄' },
        resultText: '身為天命真龍，英雄雙拳金芒爆綻！你已成為了龍，引動與龍戰騎士的宿命一決！',
        effect: {
          setFlag: { dragon_awakened: true },
          forceNextCardId: 'C2008-01', // 強制下一回合遭遇龍戰騎士
        },
      },
      {
        text: '我 右拳打開了天 化身為龍',
        require: { notCharacter: '英雄' },
        resultText: '狂暴的龍魂湧入周身！你右拳打開了天化身為龍，引動與龍戰騎士的宿命一決！',
        effect: {
          setFlag: { dragon_awakened: true },
          forceNextCardId: 'C2008-01', // 強制下一回合遭遇龍戰騎士
        },
      },
    ],
  },
  // ==========================================
  // [C2002-05] 火車叨位去
  // ==========================================
  {
    id: 'C2002-05',
    name: '火車叨位去',
    album: '八度空間',
    year: 2002,
    track: 5,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「周杰倫音樂宇宙・八度空間」收錄之經典名作《火車叨位去》。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2002-06] 分裂
  // ==========================================
  {
    id: 'C2002-06',
    name: '分裂',
    album: '八度空間',
    year: 2002,
    track: 6,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「周杰倫音樂宇宙・八度空間」收錄之經典名作《分裂》。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2002-07] 爺爺泡的茶
  // ==========================================
  {
    id: 'C2002-07', //已完成
    name: '爺爺泡的茶',
    album: '八度空間',
    year: 2002,
    track: 7,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 只能透過給外婆泡茶後取得
    route: '周杰倫家庭',
    isSynthesizedOnly: true,
    acquisitionSource: '外婆悉心沏泡回憶中的茶香',
    badgeTitle: '✦ 經典茗香・親情傳承 ✦',
    hintText: '回憶起那些年 爺爺的手繭 泡在水裡會有茶色蔓延\n行動力恢復 +5！ \n獲得關鍵卡牌【爺爺泡的茶】！',
    specialAcquisitionNote:
      '此卡牌為專屬特殊機制卡牌，在常規抽卡池中無法抽卡獲得。   \n經由外婆悉心沏泡茶葉獲得，已永久記錄至你的冒險手冊與音樂圖鑑！',
    flavorText: '「爺爺泡的茶 有一種味道叫做家」（沒法挑剔它 口感味覺還不差）',
    options: [],
  },
  {
    id: 'C2002-08', //已完成
    name: '回到過去',
    album: '八度空間',
    year: 2002,
    track: 8,
    type: '事件',
    maxDraws: 2,
    weight: 15,
    route: '通用',
    flavorText: '「想回到過去，試著讓故事繼續，至少不再讓妳離我而去……」孤單的音符化為逆流的光陰。',
    options: [
      {
        text: '順著旋律逆轉光陰',
        resultText: '想回到過去，試著讓故事繼續！\n你保留了目前全部的行囊道具、成就與全身狀態，重新回到第 1 回合！',
        effect: {
          rewindRound: 1,
        },
      },
      {
        text: '啟動【時光機】撫平時空裂痕',
        require: { item: '時光機' },
        resultText: '時光機懸浮運轉，你從容地撫平了時間裂痕，選擇不進行時光逆流，繼續當前的冒險。',
        effect: {},
      },
    ],
  },
  {
    id: 'C2002-09', //已完成
    name: '米蘭的小鐵匠',
    album: '八度空間',
    year: 2002,
    track: 9,
    type: '遭遇',
    maxDraws: 3,
    weight: 6,
    route: '通用',
    flavorText: '米蘭的小鐵匠，為了買一把吉他，每天工作辛苦奔波……\n今天遇到你：「說吧，要我幫你做什麼呢？」',
    options: [
      {
        text: '改造武器',
        resultText: '小鐵匠接過兵刃開始敲打鍛造……',
        effect: {},
      },
      {
        text: '製作食物',
        resultText: '小鐵匠在爐火前為你調配慢熬……',
        effect: {},
      },
      {
        text: '你好像有小鐵匠想要的東西',
        require: {
          item: '烏克麗麗',
          hideWhenUnavailable: true,
        },
        resultText: '小鐵匠激動的說：「這正是我一心想買的吉他！」\n小鐵匠收下吉他隨興彈唱，無以回報，只能將旅行存糧的肉粽相贈給你',
        effect: {},
      },
      {
        text: '有用不到的東西嗎？',
        require: {
          item: '反方向的鐘',
          hideWhenUnavailable: true,
        },
        resultText: '小鐵匠以純熟工藝將【反方向的鐘】重鑄為【大笨鐘】！',
        effect: {},
      },
      {
        text: '重鑄鐵鏟',
        require: {
          item: '雙截棍',
          hideWhenUnavailable: true,
        },
        resultText: '小鐵匠在鍛爐前揮汗如雨，將 1 把【雙截棍】重鑄改造為 1 把結實耐用的【鐵鏟】！',
        effect: {},
      },
      {
        text: '強化時光機',
        require: {
          items: ['時光機', '愛的飛行日記'],
          hideWhenUnavailable: true,
        },
        resultText: '透過愛的飛行日記，小鐵匠將時光機強化為能在時空中自由穿梭的【飛行時光機】！',
        effect: {},
      },
      {
        text: '擴充鐵盒',
        require: {
          item: '半島鐵盒',
          hideWhenUnavailable: true,
        },
        resultText: '小鐵匠接過半島鐵盒與散發時光氣息的頁籤，專注地鍛造融入鐵盒之中……',
        effect: {},
      },
      {
        text: '指引小鐵匠',
        resultText: '你出示【鄉間的路】，為米蘭的小鐵匠指引方向……',
        require: {
          item: '鄉間的路',
          hideWhenUnavailable: true,
          notFlag: 'blacksmith_unlocked',
        },
        effect: {},
      },
    ],
  },
  {
    id: 'C2002-10', //已完成
    name: '最後的戰役',
    album: '八度空間',
    year: 2002,
    track: 10,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 本身機率 0%，只有進入亂舞春秋時代後連動機率 100%
    route: '太陽之子',
    isPeninsulaRestricted: true,
    condition: (state) =>
      Boolean(
        state.flags['chaos_era_active'] &&
        !state.inventory['最後的戰役'] &&
        state.round !== 30
      ),
    flavorText: '「機槍掃射聲中，戰友倒在身旁，你在硝煙瀰漫的戰壕中，接到了一封來自敵軍統帥的親筆決戰書……」',
    options: [
      {
        text: '拆開決戰信函，應戰將軍！',
        resultText: '決戰號角吹響！已鎖定第 30 回合終局對決，統帥【將軍】將在第 30 回合親自下場與你一決勝負！',
        effect: {
          addItem: '最後的戰役',
          setFlag: { ready_for_general: true },
        },
      },
      {
        text: '置之不理，拒拆信函',
        resultText: '將軍得知你拒絕拆閱戰書，大為震怒，親身突襲！下回合將軍將提前來與你決戰！',
        effect: {
          addItem: '最後的戰役',
          setFlag: { general_immediate_next_round: true },
        },
      },
    ],
  },
  // ==========================================
  // [C2002-SS] 《八度空間》
  // ==========================================
  {
    id: 'C2002-SS',
    name: '《八度空間》',
    album: '八度空間',
    year: 2002,
    track: 'SS',
    type: '線索',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '【傳奇神專・《八度空間》】西元 2002 年震撼發行的經典之作，收錄眾多傳世名曲！凝聚了周杰倫音樂宇宙的無上瑰寶。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },

  // =========================================================================
  // 【2003 年・第四張專輯《葉惠美》】
  // =========================================================================
  // ==========================================
  // [C2003-01] 以父之名
  // ==========================================
  {
    id: 'C2003-01',
    name: '以父之名',
    album: '葉惠美',
    year: 2003,
    track: 1,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「周杰倫音樂宇宙・葉惠美」收錄之經典名作《以父之名》。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2003-02] 懦夫
  // ==========================================
  {
    id: 'C2003-02',
    name: '懦夫',
    album: '葉惠美',
    year: 2003,
    track: 2,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「走在淡水河邊 聽著雨聲，我看見自己懦弱的眼神……」面對誘惑與迷茫，是沉淪還是勇敢抗爭？',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  {
    id: 'C2003-03', //已完成
    name: '晴天',
    album: '葉惠美',
    year: 2003,
    track: 3,
    type: '事件',
    maxDraws: 1,
    weight: 10,
    route: '通用',
    flavorText: '「還要多久，我才能夠在妳身邊，等到放晴的那天，也許我會比較好一點。」',
    options: [
      {
        text: '大雨漸散，天氣晴朗，恢復 10 點行動力',
        require: { flag: 'rainy_weather_active', hideWhenUnavailable: true },
        resultText: '陽光穿透烏雲，大雨驟停，天空放晴！\n\n獲得【晴天】，行動力大幅恢復！',
        effect: {
          addItem: '晴天',
          apChange: 10,
          setFlag: { rainy_weather_active: false },
        },
      },
      {
        text: '沒想到失去的勇氣我還留著，恢復行動力',
        require: { notFlag: 'rainy_weather_active', hideWhenUnavailable: true },
        resultText: '吹著前奏望著天空，我想起花瓣試著掉落\n\n獲得【晴天】，行動力獲得恢復！',
        effect: {
          addItem: '晴天',
          apChange: 5,
        },
      },
    ],
  },
  // ==========================================
  // [C2003-04] 三年二班
  // ==========================================
  {
    id: 'C2003-04',
    name: '三年二班',
    album: '葉惠美',
    year: 2003,
    track: 4,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「這場球我們一定贏，三年二班周杰倫……」乒乓球在球桌上來回飛旋，每一次擊球都帶著必勝的信念！',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2003-05] 東風破
  // ==========================================
  {
    id: 'C2003-05',
    name: '東風破',
    album: '葉惠美',
    year: 2003,
    track: 5,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「誰在用琵琶彈奏 一曲東風破，歲月在年代的牆上剝落……」水墨泛黃的拱橋旁，傳來悠揚千古的琵琶聲。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2003-06] 妳聽得到
  // ==========================================
  {
    id: 'C2003-06',
    name: '妳聽得到',
    album: '葉惠美',
    year: 2003,
    track: 6,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「反正我遠遠也能看到妳，只要妳聽得到……」情竇初開的耳語在隨身聽的耳機線裡輕輕迴盪。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2003-07] 同一種調調
  // ==========================================
  {
    id: 'C2003-07',
    name: '同一種調調',
    album: '葉惠美',
    year: 2003,
    track: 7,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「雖然是同一種調調，卻有著不同的煩惱……」相同的心跳與頻率，在人海中悄然共鳴。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2003-08] 她的睫毛
  // ==========================================
  {
    id: 'C2003-08',
    name: '她的睫毛',
    album: '葉惠美',
    year: 2003,
    track: 8,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「她的睫毛，彎的嘴角，無預警的對我笑……」眼神交會的剎那，所有防線瞬間瓦解。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  {
    id: 'C2003-09',
    name: '愛情懸崖',
    album: '葉惠美',
    year: 2003,
    track: 9,
    type: '事件',
    maxDraws: 1,
    weight: 5,
    route: '通用',
    flavorText: '「站在懸崖峭壁，冷風撕扯衣角，回首已是萬丈深淵……」',
    options: [
      {
        text: '凝視深淵，在狂風中挺直脊樑',
        resultText: '跨越恐懼後豁然開朗，獲得深層探索感知！',
        effect: { apChange: 5 },
      },
    ],
  },
  // ==========================================
  // [C2003-10] 梯田
  // ==========================================
  {
    id: 'C2003-10', //已完成
    name: '梯田',
    album: '葉惠美',
    year: 2003,
    track: 10,
    type: '遭遇',
    maxDraws: 1,
    weight: 15,
    route: '周杰倫家庭',
    hasEnvironmentEffect: true,
    environmentEffectName: '梯田',
    flavorText: '「說到中學時期 家鄉的一片片梯田 是我看過最美的綠地」破壞自然的生態 會不會很累！？',
    options: [
      {
        text: '漫步走入梯田，守護這片土地',
        resultText: '你走入層層疊疊的青翠梯田，解鎖了【梯田】環境！\n此後可隨時由角色欄進入梯田耕種！',
        effect: {
          setFlag: { terrace_unlocked: true },
        },
      },
    ],
  },
  {
    id: 'C2003-11', //已完成
    name: '雙刀',
    album: '葉惠美',
    year: 2003,
    track: 11,
    type: '物品',
    maxDraws: 3,
    weight: 10,
    route: '通用',
    flavorText: '「雙刀的正前方 我殺氣不轉彎 背對我的力量 它自己卻受傷。」',
    options: [
      {
        text: '雙刀的右下方 我揮刀去了斷 將恩怨全看穿 丹鳳眼的目光',
        resultText: '獲得利刃【雙刀】！鋒芒畢露。',
        effect: { addItem: '雙刀' },
      },
    ],
  },
  {
    id: 'C2003-SS',
    name: '《葉惠美》',
    album: '葉惠美',
    year: 2003,
    track: 'SS',
    type: '線索',
    maxDraws: 1,
    weight: 1,
    route: '周杰倫家庭',
    flavorText: '【傳奇神專・以母之名】以母親之名命名的傳世專輯，融合古典復古與家庭溫情的無上殿堂。',
    options: [
      {
        text: '銘記母親的慈愛與教誨',
        resultText: '家庭羈絆昇華！獲得神專【《葉惠美》】！',
        effect: { addItem: '《葉惠美》', apChange: 20 },
      },
    ],
  },

  // =========================================================================
  // 【2004 年・第五張專輯《七里香》】
  // =========================================================================
  {
    id: 'C2004-01',
    name: '我的地盤',
    album: '七里香',
    year: 2004,
    track: 1,
    type: '物品',
    maxDraws: 1,
    weight: 6,
    route: '最偉大的作品',
    flavorText: '「在我地盤這，你就得聽我的！動感的節拍帶著獨門自信。」',
    options: [{ text: '拾起收入行囊', resultText: '獲得【我的地盤】。', effect: { addItem: '我的地盤' } }],
  },
  // ==========================================
  // [C2004-02] 七里香
  // ==========================================
  {
    id: 'C2004-02',
    name: '七里香',
    album: '七里香',
    year: 2004,
    track: 2,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「雨下整夜 我的愛溢出就像雨水，院子落葉 跟我的思念厚厚一疊……」初夏的微風混合著七里香的芬芳，在雨後的窗櫺盤旋。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2004-03] 藉口
  // ==========================================
  {
    id: 'C2004-03',
    name: '藉口',
    album: '七里香',
    year: 2004,
    track: 3,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「如果說你要走 我不會強留，只要你能夠過得比我好……」車窗上的霧氣倒映著離別的落寞。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  {
    id: 'C2004-04', //已完成
    name: '外婆',
    album: '七里香',
    year: 2004,
    track: 4,
    type: '遭遇',
    maxDraws: 3,
    weight: 8,
    route: '周杰倫家庭',
    flavorText: '「今天是外婆的生日，我換上復古西裝……但外婆說她除了大稻埕碼頭哪裡都不想去……」',
    options: [
      {
        text: '她要的是陪伴 而不是六百塊',
        require: { maxAp: 5, hideWhenUnavailable: true },
        resultText: '外婆笑瞇瞇地張羅一整桌拿手好菜，不時叮嚀你趁熱快吃\n\n行動力大幅恢復 +5！',
        effect: {
          apChange: 5,
        },
      },
      {
        text: '外婆露出了笑容說她以我為榮',
        resultText: '外婆撫摸著你的頭，眼神裡滿是慈愛與驕傲\n\n行動力恢復 +3！',
        effect: {
          apChange: 3,
        },
      },
      {
        text: '把所有和外公的往事靜靜回憶',
        resultText: '', // 文本由 App.tsx 依持有材料（茶葉+熱水）動態判定結算
        effect: {},
      },
      {
        text: '我失落 是因為看到外婆失落而失落',
        resultText: '', // 文本由 App.tsx 依行囊（是否空無一物）動態判定結算
        effect: {},
      },
    ],
  },
  {
    id: 'C2004-05', //已完成
    name: '將軍',
    album: '七里香',
    year: 2004,
    track: 5,
    type: '遭遇',
    maxDraws: 1,
    weight: 0, // 只能在第30回合強制遭遇
    route: '太陽之子',
    condition: (state) => state.round === 30 && Boolean(state.flags['ready_for_general']),
    flavorText: '「看我 我手指放鬆 我目光如龍 當敵人是空！」',
    options: [
      {
        text: '擺開陣勢，正式進入決戰棋局！',
        resultText: '將軍冷笑：「我猜他想的應該和我一樣？」進入八回合死鬥！',
        effect: {
          setFlag: { in_boss_battle: true, boss_hp: 100, boss_step: 1 },
        },
      },
    ],
  },
  {
    id: 'C2004-06',
    name: '擱淺',
    album: '七里香',
    year: 2004,
    track: 6,
    type: '事件',
    maxDraws: 3,
    weight: 9,
    route: '通用',
    flavorText: '「久未放晴的天空，依舊因為妳而陰霾。我只能任由自己擱淺在回憶的灘頭……」',
    options: [
      {
        text: '「風箏在陰天擱淺，想念還在等待救援」',
        resultText: '在逆境中堅守初心，雖行動受阻但意志磨練得更加堅韌。',
        effect: { apChange: 3 },
      },
      {
        text: '「讀完了依賴，我很快就離開」',
        resultText: '掙脫情感羈絆，轉身踏上新的旅程。',
        effect: {},
      },
    ],
  },
  {
    id: 'C2004-07', //已完成
    name: '亂舞春秋',
    album: '七里香',
    year: 2004,
    track: 7,
    type: '遭遇',
    maxDraws: 1,
    weight: 100, // 滿足條件後必定進入抽卡池
    route: '太陽之子',
    hasEnvironmentEffect: true,
    environmentEffectName: '亂舞春秋時代',
    condition: (state) =>
      Boolean(
        state.inventory['忍者'] &&
        state.inventory['印地安老斑鳩'] &&
        state.inventory['半獸人'] &&
        state.inventory['龍戰騎士的遺言'] &&
        state.inventory['本草綱目'] &&
        !state.flags['chaos_era_obtained']
      ),
    flavorText: '「人魔開始重出地獄，叛軍如野火般攻擊，時代劇烈顛簸，戰國烽火席捲而來！」',
    options: [
      {
        text: '踏入亂舞春秋，啟動時代變換',
        resultText: '進入亂舞春秋時代，尋找那最後一戰！',
        effect: {
          setFlag: { chaos_era_obtained: true },
        },
      },
    ],
  },
  // ==========================================
  // [C2004-08] 困獸之鬥
  // ==========================================
  {
    id: 'C2004-08',
    name: '困獸之鬥',
    album: '七里香',
    year: 2004,
    track: 8,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「我像隻困在籠裡的獸，在黑暗中舔舐傷口……」狹窄的牢籠中，爆發出對命運不公的嘶吼！',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2004-09] 園遊會
  // ==========================================
  {
    id: 'C2004-09', //已完成
    name: '園遊會',
    album: '七里香',
    year: 2004,
    track: 9,
    type: '遭遇',
    maxDraws: 5,
    weight: 6,
    route: '周杰倫家庭',
    flavorText: '「氣球在我手上，我牽著妳瞎逛。」五彩繽紛的氣球在園遊會入口處飄盪著，充滿開心的氣息。',
    options: [
      {
        text: '離開園遊會',
        resultText: '你望著遠處的摩天輪，決定暫且轉身離開園遊會。',
        effect: {},
      },
      {
        text: '繼續逛園遊會',
        resultText: '',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2004-10] 止戰之殤
  // ==========================================
  {
    id: 'C2004-10',
    name: '止戰之殤',
    album: '七里香',
    year: 2004,
    track: 10,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「孩子們眼中的希望是什麼形狀，是否院子有秋千可以盪……」硝煙瀰漫的戰場廢墟中，孩童無邪的眼眸渴望著黎明。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2004-SS] 《七里香》
  // ==========================================
  {
    id: 'C2004-SS',
    name: '《七里香》',
    album: '七里香',
    year: 2004,
    track: 'SS',
    type: '線索',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '【傳奇神專・《七里香》】西元 2004 年震撼發行的經典之作，收錄眾多傳世名曲！凝聚了周杰倫音樂宇宙的無上瑰寶。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },

  // =========================================================================
  // 【2005 年・第六張專輯《11月的蕭邦》】
  // =========================================================================
  {
    id: 'C2005-01',
    name: '夜曲',
    album: '11月的蕭邦',
    year: 2005,
    track: 1,
    type: '事件',
    maxDraws: 2,
    weight: 8,
    route: '通用',
    flavorText: '「為你彈奏蕭邦的夜曲，紀念我死去的愛情，跟夜風一樣的聲音，心碎的很好聽。」',
    options: [
      {
        text: '靜心聆聽古典鋼琴夜曲',
        resultText: '你對蕭邦音樂精髓的領會更上一層樓，心境沉穩！',
        effect: { apChange: 2 },
      },
    ],
  },
  // ==========================================
  // [C2005-02] 藍色風暴
  // ==========================================
  {
    id: 'C2005-02',
    name: '藍色風暴',
    album: '11月的蕭邦',
    year: 2005,
    track: 2,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「暴風雨即將來襲，藍色閃電撕裂黑夜……」狂嘯的海風捲起滔天巨浪，雷電在海平線交織。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2005-03] 髮如雪
  // ==========================================
  {
    id: 'C2005-03',
    name: '髮如雪',
    album: '11月的蕭邦',
    year: 2005,
    track: 3,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「狼牙月 伊人憔悴，我舉杯 飲盡了風雪……」紛飛的大雪中，白髮如雪隨風飄散。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  {
    id: 'C2005-04', //已完成
    name: '黑色毛衣',
    album: '11月的蕭邦',
    year: 2005,
    track: 4,
    type: '物品',
    maxDraws: 5,
    weight: 20,
    route: '通用',
    flavorText: '「一件黑色毛衣，兩個人的回憶……」\n厚實的針織給予抵禦的力量。',
    options: [
      {
        text: '穿上黑色毛衣',
        resultText: '穿上【黑色毛衣】抵禦敵意。',
        effect: { addItem: '黑色毛衣'},
      },
    ],
  },
  // ==========================================
  // [C2005-05] 四面楚歌
  // ==========================================
  {
    id: 'C2005-05',
    name: '四面楚歌',
    album: '11月的蕭邦',
    year: 2005,
    track: 5,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「這街道的記者 像狗仔一樣跟在身後……」在羅馬廣場的噴水池邊，面對四面八方的窺探從容微笑。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2005-06] 楓
  // ==========================================
  {
    id: 'C2005-06',
    name: '楓',
    album: '11月的蕭邦',
    year: 2005,
    track: 6,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「緩緩飄落的楓葉像思念，我點燃燭光溫暖歲末的秋天……」深秋滿山紅楓凋落，記憶在落葉堆中燃燒。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2005-07] 浪漫手機
  // ==========================================
  {
    id: 'C2005-07',
    name: '浪漫手機',
    album: '11月的蕭邦',
    year: 2005,
    track: 7,
    type: '物品',
    maxDraws: 1,
    weight: 10,
    route: '周杰倫家庭',
    flavorText: '「希望你帶著浪漫的手機，隨時隨地連線著我的心……」\n按鍵手機屏幕亮起的微光，傳遞著跨越距離與時空的心動。',
    options: [
      {
        text: '拾起這部浪漫手機，隨身攜帶',
        resultText: '你拾起了這部復古按鍵手機！\n【浪漫手機】已常駐解鎖於角色欄位，隨時點擊開啟通訊介面！',
        effect: {
          addItem: '浪漫手機',
          setFlag: { romantic_phone_unlocked: true },
        },
      },
    ],
  },
  // ==========================================
  // [C2005-08] 逆鱗
  // ==========================================
  {
    id: 'C2005-08',
    name: '逆鱗',
    album: '11月的蕭邦',
    year: 2005,
    track: 8,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「不可觸碰我的逆鱗，否則將迎來狂暴的怒火……」沉睡的巨龍在深淵中睜開猩紅雙目！',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2005-09] 麥芽糖
  // ==========================================
  {
    id: 'C2005-09', //已完成
    name: '麥芽糖',
    album: '11月的蕭邦',
    year: 2005,
    track: 9,
    type: '物品',
    maxDraws: 1,
    weight: 0,
    route: '太陽之子',
    isSynthesizedOnly: true,
    acquisitionSource: '米蘭的小鐵匠慢火熬製',
    hintText: '獲得【麥芽糖】，有人要吃嗎？。',
    specialAcquisitionNote:
      '此卡牌為專屬合成/特殊機制道具，在常規抽卡池中無法抽卡獲得。透過小鐵匠的手藝熬製成功，已永久記錄至你的冒險手冊與音樂圖鑑！',
    flavorText: '「開心的 被黏手 我滿嘴 都是糖果。」',
    options: [],
  },
  // ==========================================
  // [C2005-10] 珊瑚海
  // ==========================================
  {
    id: 'C2005-10',
    name: '珊瑚海',
    album: '11月的蕭邦',
    year: 2005,
    track: 10,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「海鳥跟魚相愛，只是一場意外……」海浪拍打著岸邊嶙峋的礁石，兩個世界註定無法相擁。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2005-11] 飄移
  // ==========================================
  {
    id: 'C2005-11',
    name: '飄移',
    album: '11月的蕭邦',
    year: 2005,
    track: 11,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「得飄 得飄 得咿的飄，我繞過山頭 輪胎在柏油路上尖叫……」秋名山險峻的五連髮夾彎上，引擎轟鳴撕裂黑夜！',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2005-12] 一路向北
  // ==========================================
  {
    id: 'C2005-12',
    name: '一路向北',
    album: '11月的蕭邦',
    year: 2005,
    track: 12,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「一路向北 離開有你的季節，你說你好累 已無法再愛上誰……」後視鏡裡倒退的風景，再也追不回昔日的溫柔。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2005-SS] 《11月的蕭邦》
  // ==========================================
  {
    id: 'C2005-SS',
    name: '《11月的蕭邦》',
    album: '11月的蕭邦',
    year: 2005,
    track: 'SS',
    type: '線索',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '【傳奇神專・《11月的蕭邦》】西元 2005 年震撼發行的經典之作，收錄眾多傳世名曲！凝聚了周杰倫音樂宇宙的無上瑰寶。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },

  // =========================================================================
  // 【2006 年・第七張專輯《依然范特西》】
  // =========================================================================
  // ==========================================
  // [C2006-01] 夜的第七章
  // ==========================================
  {
    id: 'C2006-01',
    name: '夜的第七章',
    album: '依然范特西',
    year: 2006,
    track: 1,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「周杰倫音樂宇宙・依然范特西」收錄之經典名作《夜的第七章》。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  {
    id: 'C2006-02',
    name: '聽媽媽的話',
    album: '依然范特西',
    year: 2006,
    track: 2,
    type: '事件',
    maxDraws: 2,
    weight: 9,
    route: '周杰倫家庭',
    flavorText: '「聽媽媽的話，別讓她受傷，想快快長大，才能保護她……」',
    options: [
      {
        text: '乖乖聽媽媽的話，認真練琴讀書',
        resultText: '母親的叮嚀溫暖心房，心智豁然開朗！',
        effect: { addItem: '聽媽媽的話' },
      },
    ],
  },
  // ==========================================
  // [C2006-03] 千里之外
  // ==========================================
  {
    id: 'C2006-03',
    name: '千里之外',
    album: '依然范特西',
    year: 2006,
    track: 3,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「屋簷如懸崖 風鈴如滄海 我等燕歸來……」千里之外的薄霧中，一曲古琴奏響了離愁。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2006-04] 本草綱目
  // ==========================================
  {
    id: 'C2006-04', //已完成
    name: '本草綱目',
    album: '依然范特西',
    year: 2006,
    track: 4,
    type: '物品',
    maxDraws: 1,
    weight: 20, // 上限1，抽卡機率10%
    route: '通用',
    flavorText: '「如果華陀再世 崇洋都被醫治，外邦來學漢字 激發我民族意識……」既然來學漢字了，你也能看懂些什麼了。',
    options: [
      {
        text: '收存【本草綱目】入行囊',
        resultText: '獲得了【本草綱目】，精華融入行囊，開啟進階鑑識視窗，並能施展行囊道具的特殊功能！',
        effect: {
          addItem: '本草綱目',
        },
      },
    ],
  },
  {
    id: 'C2006-05',
    name: '退後',
    album: '依然范特西',
    year: 2006,
    track: 5,
    type: '線索',
    maxDraws: 1,
    weight: 2,
    route: '通用',
    flavorText: '「我知我不配，退後才發現已經無法回頭……」喧囂的街角定格了悔恨的身影。',
    options: [
      {
        text: '在回憶的人潮中默默轉身退後',
        resultText: '領悟了退後的深層情感，獲得重要線索【退後】。',
        effect: { addItem: '退後' },
      },
    ],
  },
  {
    id: 'C2006-06',
    name: '紅模仿',
    album: '依然范特西',
    year: 2006,
    track: 6,
    type: '物品',
    maxDraws: 1,
    weight: 6,
    route: '最偉大的作品',
    flavorText: '「唱得太油，又太作做；我堅持原汁原味的周式風格！」',
    options: [{ text: '拾起收入行囊', resultText: '獲得【紅模仿】。', effect: { addItem: '紅模仿' } }],
  },
  // ==========================================
  // [C2006-07] 心雨
  // ==========================================
  {
    id: 'C2006-07',
    name: '心雨',
    album: '依然范特西',
    year: 2006,
    track: 7,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「心裡的雨傾盆而下，卻澆不滅對你的牽掛……」窗外的暴雨洗刷著街道，內心的孤單如同無底深淵。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  {
    id: 'C2006-08', //已完成
    name: '白色風車',
    album: '依然范特西',
    year: 2006,
    track: 8,
    type: '物品',
    maxDraws: 1,
    weight: 0,
    route: '周杰倫家庭',
    isSynthesizedOnly: true,
    acquisitionSource: '園遊會玩具攤位購買',
    badgeTitle: '✦ 園遊會奇遇 ✦',
    hintText: '獲得安靜轉著的【白色風車】，是小男孩想要的玩具。',
    specialAcquisitionNote:
      '此卡牌為專屬特殊機制卡牌，在常規抽卡池中無法抽卡獲得。\n由園遊會攤位購買獲得，已永久記錄至你的冒險手冊與音樂圖鑑！',
    flavorText: '「白色的風車，安靜地轉著，真實的感覺，夢境般遙遠……」',
    options: [],
  },
  // ==========================================
  // [C2006-09] 迷迭香
  // ==========================================
  {
    id: 'C2006-09', //已完成
    name: '迷迭香',
    album: '依然范特西',
    year: 2006,
    track: 9,
    type: '物品',
    maxDraws: 1,
    weight: 10,
    route: '通用',
    flavorText: '「你隨風飄揚的笑，有迷迭香的味道。」\n迷迭香也會開花的，愛的甜味與美麗的花。',
    options: [
      {
        text: '拾起迷迭香放入行囊',
        resultText: '獲得【迷迭香】，愛的甜味蔓延發酵。',
        effect: {
          addItem: '迷迭香',
        },
      },
    ],
  },
  // ==========================================
  // [C2006-10] 菊花台
  // ==========================================
  {
    id: 'C2006-10', //已完成
    name: '菊花台',
    album: '依然范特西',
    year: 2006,
    track: 10,
    type: '物品',
    maxDraws: 1,
    weight: 10,
    route: '通用',
    flavorText: '「花 已向晚 飄落了燦爛。」閣樓上冰冷的絕望，而花落人斷腸。',
    options: [
      {
        text: '收下菊花台放入行囊',
        resultText: '獲得【菊花台】，花落人斷腸 我心事靜靜躺。',
        effect: {
          addItem: '菊花台',
        },
      },
    ],
  },
  // ==========================================
  // [C2006-SS] 《依然范特西》
  // ==========================================
  {
    id: 'C2006-SS',
    name: '《依然范特西》',
    album: '依然范特西',
    year: 2006,
    track: 'SS',
    type: '線索',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '【傳奇神專・《依然范特西》】西元 2006 年震撼發行的經典之作，收錄眾多傳世名曲！凝聚了周杰倫音樂宇宙的無上瑰寶。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },

  // =========================================================================
  // 【2007 年・第八張專輯《我很忙》】
  // =========================================================================
  // ==========================================
  // [C2007-01] 牛仔很忙
  // ==========================================
  {
    id: 'C2007-01',
    name: '牛仔很忙',
    album: '我很忙',
    year: 2007,
    track: 1,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「我副業是個牛仔 正義是我的本行……」西部荒漠的小酒館前，快槍手拔槍的速度快過閃電！',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2007-02] 彩虹
  // ==========================================
  {
    id: 'C2007-02', //已完成
    name: '彩虹',
    album: '我很忙',
    year: 2007,
    track: 2,
    type: '事件',
    maxDraws: 1,
    weight: 0,
    route: '通用',
    isSynthesizedOnly: true,
    acquisitionSource: '雨後天晴・以晴天驅散漫天雨勢獲得',
    hintText: '雨過天晴的天空，橫跨著絢爛而短暫的七色彩虹，獲得【彩虹】。',
    specialAcquisitionNote:
      '此卡牌為專屬特殊機制卡牌，在常規抽卡池中無法抽卡獲得。\n以晴天消散雨勢後獲得，已永久記錄至你的冒險手冊與音樂圖鑑！',
    flavorText: '「哪裡有彩虹告訴我，能不能把我的願望還給我」',
    options: [],
  },
  // ==========================================
  // [C2007-03] 青花瓷
  // ==========================================
  {
    id: 'C2007-03', //已完成
    name: '青花瓷',
    album: '我很忙',
    year: 2007,
    track: 3,
    type: '物品',
    maxDraws: 1,
    weight: 0,
    route: '周杰倫家庭',
    isSynthesizedOnly: true,
    acquisitionSource: '淘金小鎮探勘發掘',
    badgeTitle: '✦ 秘寶現世 ✦',
    hintText: '獲得【青花瓷】，那色白花青的錦鯉躍然於碗底。',
    specialAcquisitionNote:
      '此卡牌為專屬特殊機制卡牌，在常規抽卡池中無法抽卡獲得。\n在淘金小鎮探勘發掘出土，已永久記錄至你的冒險手冊與音樂圖鑑！',
    flavorText: '「如傳世的青花瓷自顧自美麗 妳眼帶笑意。」',
    options: [],
  },
  // ==========================================
  // [C2007-04] 陽光宅男
  // ==========================================
  {
    id: 'C2007-04',
    name: '陽光宅男',
    album: '我很忙',
    year: 2007,
    track: 4,
    type: '事件',
    maxDraws: 1,
    weight: 0,
    route: '通用',
    flavorText: '「鑰匙別在腰帶皮夾插在屁股口袋，陽光宅男也能煥發帥氣神采……」拉開緊閉的窗簾，迎向燦爛陽光！',
    options: [
      {
        text: '改造帥氣造型，走出房間迎向陽光',
        resultText: '你換上了整潔帥氣的襯衫，拉開緊閉的窗簾迎向燦爛陽光！自信心大增，行動力 +3！',
        effect: { apChange: 3 },
      },
      {
        text: '尋找真愛，追逐心目中的公主殿下',
        resultText: '宅男上吧！去尋找真愛！你內心燃起熾熱的勇氣，行動力 +3！',
        effect: { apChange: 3 },
      },
    ],
  },
  // ==========================================
  // [C2007-05] 蒲公英的約定
  // ==========================================
  {
    id: 'C2007-05',
    name: '蒲公英的約定',
    album: '我很忙',
    year: 2007,
    track: 5,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「小學籬笆旁的蒲公英，是記憶中童年最早的風景……」微風吹散白色的蒲公英種子，飄向遙遠的未來。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  {
    id: 'C2007-06', //已完成
    name: '無雙',
    album: '我很忙',
    year: 2007,
    track: 6,
    type: '物品',
    maxDraws: 1,
    weight: 4,
    route: '太陽之子',
    flavorText: '「命格無雙 一統江山 破城之後 我卻微笑絕不戀戰」',
    options: [
      {
        text: '握住無雙戰意',
        resultText: '獲得【無雙】！行動力+1\n周身湧現唯我獨尊的無雙霸氣！',
        effect: { addItem: '無雙', apChange: 1 },
      },
    ],
  },
  {
    id: 'C2007-07',
    name: '我不配',
    album: '我很忙',
    year: 2007,
    track: 7,
    type: '線索',
    maxDraws: 1,
    weight: 5,
    route: '最偉大的作品',
    flavorText: '「這感覺已經不對，我努力在挽回……閃光燈下的無奈與孤單。」',
    options: [
      {
        text: '收入行囊細細研讀',
        resultText: '你體會了聚光燈後的隱忍與謙遜，獲得【我不配】。',
        effect: { addItem: '我不配' },
      },
    ],
  },
  // ==========================================
  // [C2007-08] 扯
  // ==========================================
  {
    id: 'C2007-08',
    name: '扯',
    album: '我很忙',
    year: 2007,
    track: 8,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「別再跟我扯這些有的沒的……」俐落乾脆的鼓點粉碎了一切拖泥帶水！',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2007-09] 甜甜的
  // ==========================================
  {
    id: 'C2007-09', //已完成
    name: '甜甜的',
    album: '我很忙',
    year: 2007,
    track: 9,
    type: '物品',
    maxDraws: 1,
    weight: 10, // 抽卡機率 10%
    route: '通用',
    flavorText: '「我輕輕的嚐一口 妳說的愛我，還在回味妳給過的溫柔……」蜂蜜口味的生活，滿溢著初戀的甜美。',
    options: [
      {
        text: '這香濃的誘惑，收入行囊',
        resultText: '我輕輕的嚐一口！獲得【甜甜的】調味料！',
        effect: {
          addItem: '甜甜的',
        },
      },
    ],
  },
  // ==========================================
  // [C2007-10] 最長的電影
  // ==========================================
  {
    id: 'C2007-10',
    name: '最長的電影',
    album: '我很忙',
    year: 2007,
    track: 10,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「再給我兩分鐘 讓我把記憶結成冰……」電影院散場的微光中，膠卷轉動著最後的依戀。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2007-SS] 《我很忙》
  // ==========================================
  {
    id: 'C2007-SS',
    name: '《我很忙》',
    album: '我很忙',
    year: 2007,
    track: 'SS',
    type: '線索',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '【傳奇神專・《我很忙》】西元 2007 年震撼發行的經典之作，收錄眾多傳世名曲！凝聚了周杰倫音樂宇宙的無上瑰寶。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },

  // =========================================================================
  // 【2008 年・第九張專輯《魔杰座》】
  // =========================================================================
  {
    id: 'C2008-01', //已完成
    name: '龍戰騎士',
    album: '魔杰座',
    year: 2008,
    track: 1,
    type: '遭遇',
    maxDraws: 2,
    weight: 2, // 遭遇機率設定為 2% 相對權重
    route: '太陽之子',
    condition: (state) => !state.inventory['龍戰騎士'] && !state.inventory['龍戰騎士的遺言'],
    flavorText: '「守門之獸展翼將飛，龍戰騎士跨衝破這一場浩劫，這世界誰被狩獵！」',
    options: [
      // (1) 直接抽卡出現
      {
        text: '迎戰',
        require: { notFlag: 'dragon_awakened' },
        resultText: '迎向龍戰騎士嘗試交手，被火燄吞噬無名碑！行動力 -8。',
        effect: { apChange: -8 },
      },
      {
        text: '用黑色毛衣抵擋攻擊',
        require: { notFlag: 'dragon_awakened', item: '黑色毛衣', hideWhenUnavailable: true },
        resultText: '黑色毛衣成功抵擋攻擊，行動力不減！',
        effect: { removeItem: '黑色毛衣' },
      },
      // (2) 龍拳觸發或決戰
      {
        text: '雙刀與雙截棍齊出，以溫柔削鐵！',
        require: { flag: 'dragon_awakened', items: ['雙刀', '雙截棍'], hideWhenUnavailable: true },
        resultText: '龍戰騎士：「你終於擊敗了我，當四個對手你都遭遇，戰亂時代才正要開始！」',
        effect: {
          removeItems: ['雙刀', '雙截棍'],
          addItem: '龍戰騎士的遺言',
          setFlag: { defeated_dragon_knight: true, defeat_龍戰騎士: true, dragon_awakened: false },
        },
      },
      {
        text: '使用雙刀攻擊',
        require: { flag: 'dragon_awakened' },
        resultText: '單憑這點攻擊是對我沒用的，損耗雙刀，被打敗，行動力 -8',
        effect: {
          removeItem: '雙刀',
          apChange: -8,
        },
      },
      {
        text: '使用雙截棍攻擊',
        require: { flag: 'dragon_awakened' },
        resultText: '單憑這點攻擊是對我沒用的，損耗雙截棍，被打敗，行動力 -8',
        effect: {
          removeItem: '雙截棍',
          apChange: -8,
        },
      },
      {
        text: '用黑色毛衣抵擋攻擊',
        require: { flag: 'dragon_awakened', item: '黑色毛衣', hideWhenUnavailable: true },
        resultText: '黑色毛衣成功抵擋攻擊，回合結束，行動力不減！',
        effect: {
          removeItem: '黑色毛衣',
        },
      },
      {
        text: '英雄催動無雙一擊，擊敗龍戰騎士',
        require: { flag: 'dragon_awakened', character: '英雄', item: '無雙', hideWhenUnavailable: true },
        resultText: '龍戰騎士：「你終於擊敗了我，當四個對手你都遭遇，戰亂時代才正要開始！」',
        effect: {
          addItem: '龍戰騎士的遺言',
          setFlag: { defeated_dragon_knight: true, defeat_龍戰騎士: true, dragon_awakened: false },
        },
      },
    ],
  },
  // ==========================================
  // [C2008-02] 給我一首歌的時間
  // ==========================================
  {
    id: 'C2008-02',
    name: '給我一首歌的時間',
    album: '魔杰座',
    year: 2008,
    track: 2,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「給我一首歌的時間，緊緊擁抱這最後的溫存……」在時光的沙漏漏盡前，緊緊牽住彼此的手。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2008-03] 蛇舞
  // ==========================================
  {
    id: 'C2008-03',
    name: '蛇舞',
    album: '魔杰座',
    year: 2008,
    track: 3,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「尼羅河畔神秘的蛇舞，引誘著迷失的靈魂……」古埃及神廟前，曼妙的蛇舞伴隨鈴鐺聲起伏。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2008-04] 花海
  // ==========================================
  {
    id: 'C2008-04',
    name: '花海',
    album: '魔杰座',
    year: 2008,
    track: 4,
    type: '物品',
    maxDraws: 1,
    weight: 0,
    route: '通用',
    isSynthesizedOnly: true,
    acquisitionSource: '梯田耕種盛開',
    hintText: '花香撲鼻，微風拂面，靈魂受到前所未有的療癒。獲得卡牌《花海》！',
    specialAcquisitionNote:
      '此卡牌為專屬特殊機制卡牌，在常規抽卡池中無法抽卡獲得。\n於梯田悉心培育綻放，已永久記錄至你的冒險手冊與音樂圖鑑！',
    flavorText: '「不要這麼容易就想放棄 就像我說的……」滿山遍野的花海在風中搖曳，帶走所有的疲憊與悲傷。',
    options: [],
  },
  // ==========================================
  // [C2008-05] 魔術先生
  // ==========================================
  {
    id: 'C2008-05',
    name: '魔術先生',
    album: '魔杰座',
    year: 2008,
    track: 5,
    type: '事件',
    maxDraws: 1,
    weight: 0,
    route: '通用',
    flavorText: '「手中握著神奇的撲克牌，見證奇蹟的發生……」魔術師在聚光燈下一揮手，白鴿自禮帽中翩然飛出！',
    options: [
      {
        text: '見證奇蹟的時刻：禮帽變出白鴿',
        resultText: '聚光燈聚焦在你手掌心，啪的一聲，一隻雪白信鴿撲棱飛出，博得滿堂彩！行動力 +3！',
        effect: { apChange: 3 },
      },
      {
        text: '手法俐落的撲克牌魔術，洞悉牌局',
        resultText: '你靈活地切牌洗牌，洞悉了命運牌堆的微妙奧妙！行動力 +3！',
        effect: { apChange: 3 },
      },
    ],
  },
  // ==========================================
  // [C2008-06] 說好的幸福呢
  // ==========================================
  {
    id: 'C2008-06',
    name: '說好的幸福呢',
    album: '魔杰座',
    year: 2008,
    track: 6,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「說好的幸福呢？承諾在風中消逝……」翻開泛黃的日記本，寫滿了未曾實現的約定。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2008-07] 蘭亭序
  // ==========================================
  {
    id: 'C2008-07', //已完成
    name: '蘭亭序',
    album: '魔杰座',
    year: 2008,
    track: 7,
    type: '物品',
    maxDraws: 1,
    weight: 0,
    route: '周杰倫家庭',
    isSynthesizedOnly: true,
    acquisitionSource: '淘金小鎮探勘發掘',
    badgeTitle: '✦ 秘寶現世 ✦',
    hintText: '獲得【蘭亭序】，千古書法風骨躍然紙上。',
    specialAcquisitionNote:
      '此卡牌為專屬特殊機制卡牌，在常規抽卡池中無法抽卡獲得。\n在淘金小鎮探勘發掘出土，已永久記錄至你的冒險手冊與音樂圖鑑！',
    flavorText: '「蘭亭臨帖 行書如行雲流水。」',
    options: [],
  },
  // ==========================================
  // [C2008-08] 流浪詩人
  // ==========================================
  {
    id: 'C2008-08',
    name: '流浪詩人',
    album: '魔杰座',
    year: 2008,
    track: 8,
    type: '事件',
    maxDraws: 1,
    weight: 0,
    route: '通用',
    flavorText: '「流浪的詩人在街頭彈唱，訴說著遠方的冒險……」背著吉他的浪人穿梭在石板路上，留下不羈的歌聲。',
    options: [
      {
        text: '背著吉他唱起海邊的歌謠',
        resultText: '海風徐徐拂面，你撥動琴弦引來過客駐足聆聽，心情無比舒暢！行動力 +3！',
        effect: { apChange: 3 },
      },
      {
        text: '浪跡天涯，結交志同道合的音樂知音',
        resultText: '海闊天空，你結識了多位熱愛音樂的流浪過客！行動力 +3！',
        effect: { apChange: 3 },
      },
    ],
  },
  {
    id: 'C2008-09', //已完成
    name: '時光機',
    album: '魔杰座',
    year: 2008,
    track: 9,
    type: '物品',
    maxDraws: 1,
    weight: 2,
    route: '通用',
    flavorText: '「那童年的希望是一台時光機，我可以一路開心到底都不換氣……」真正的時空控制器！',
    options: [
      {
        text: '收納至行囊中',
        resultText: '你獲得了神器【時光機】！自此後續若遭遇《回到過去》或《愛在西元前》時，可憑藉時光機自主決定是否時光逆流。',
        effect: {
          addItem: '時光機',
          setFlag: { hasTimeMachine: true },
        },
      },
    ],
  },
  // ==========================================
  // [C2008-10] 喬克叔叔
  // ==========================================
  {
    id: 'C2008-10',
    name: '喬克叔叔',
    album: '魔杰座',
    year: 2008,
    track: 10,
    type: '事件',
    maxDraws: 1,
    weight: 0,
    route: '通用',
    flavorText: '「小丑在舞台上面帶微笑，背後卻藏著落寞的淚水……」馬戲團華麗的大帳篷下，喬克叔叔表演著滑稽的把戲。',
    options: [
      {
        text: '小丑拋球把戲，逗樂所有圍觀群眾',
        resultText: '三顆彩球在空中飛舞，觀眾歡呼雀躍，掌聲雷動！行動力 +3！',
        effect: { apChange: 3 },
      },
      {
        text: '卸下油彩，體會孤獨把戲大師的堅韌',
        resultText: '即使身處孤獨的幕後，依然保持著最真摯純粹的表演初心！行動力 +3！',
        effect: { apChange: 3 },
      },
    ],
  },
  // ==========================================
  // [C2008-11] 稻香
  // ==========================================
  {
    id: 'C2008-11', //已完成
    name: '稻香',
    album: '魔杰座',
    year: 2008,
    track: 11,
    type: '物品',
    maxDraws: 3,
    weight: 15,
    route: '太陽之子',
    flavorText: '「還記得你說家是唯一的城堡，隨著稻香河流繼續奔跑……」金黃色的稻浪在陽光下起伏，是否願意花費 5 點行動力來收割稻麥？',
    options: [
      {
        text: '願意（花費 5 點行動力收割稻麥）',
        require: { minAp: 6, unavailableReason: '行動力不足' },
        resultText: '「隨著稻香河流繼續奔跑……」你辛勤收割金黃的稻穗\n\n行動力 -5，獲得【稻香】卡片！',
        effect: {
          apChange: -5,
          addItem: '稻香',
        },
      },
      {
        text: '不願意，結束這回合',
        resultText: '珍惜一切 就算沒有擁有，結束了這回合。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2008-SS] 《魔杰座》
  // ==========================================
  {
    id: 'C2008-SS',
    name: '《魔杰座》',
    album: '魔杰座',
    year: 2008,
    track: 'SS',
    type: '線索',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '【傳奇神專・《魔杰座》】西元 2008 年震撼發行的經典之作，收錄眾多傳世名曲！凝聚了周杰倫音樂宇宙的無上瑰寶。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },

  // =========================================================================
  // 【2010 年・第十張專輯《跨時代》】
  // =========================================================================
  {
    id: 'C2010-01', //已完成
    name: '跨時代',
    album: '跨時代',
    year: 2010,
    track: 1,
    type: '事件',
    maxDraws: 2,
    weight: 6,
    route: '最偉大的作品',
    flavorText: '「鐘逆時針而繞，惡物猙獰的傾巢……」',
    options: [
      {
        text: '「我謙卑安靜的於城堡下的晚禱」',
        resultText: '迷霧漸散，巍峨肅穆的黑色城堡巍然矗立在眼前！\n威廉古堡大門為你敞開！',
        effect: {
          setFlag: { castle_unlocked: true },
          forceNextCardId: 'C2001-08',
        },
      },
      {
        text: '「我跨越過世代 如獸般的姿態」',
        resultText: '咆哮聲震碎夜空，野獸般的氣息呼嘯而來，驚動了嗜血的半獸人！',
        effect: {
          forceNextCardId: 'C2002-01',
        },
      },
      {
        text: '「我的樂器在環繞 時代無法淘汰我霸氣的皇朝」',
        resultText: '悠揚深沉的琴聲響徹雲霄，你獲得了樂器【比較大的大提琴】！',
        effect: {
          addItem: '比較大的大提琴',
        },
      },
    ],
  },
  // ==========================================
  // [C2010-02] 說了再見
  // ==========================================
  {
    id: 'C2010-02',
    name: '說了再見',
    album: '跨時代',
    year: 2010,
    track: 2,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「說了再見 才發現再也見不到，能不能就這樣輕易忘掉……」寂靜的站台上，列車緩緩駛向迷霧深處。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2010-03] 煙花易冷
  // ==========================================
  {
    id: 'C2010-03', //已完成
    name: '煙花易冷',
    album: '跨時代',
    year: 2010,
    track: 3,
    type: '物品',
    maxDraws: 1, // 上限1
    weight: 15, // 抽卡機率 15%
    route: '通用',
    flavorText: '「雨紛紛 舊故里草木深，我聽聞 妳始終一個人……」洛陽城殘破的城門下，石碑上青苔斑駁，等不回歸人。',
    options: [
      {
        text: '引洛陽舊城淒美冷雨澆滅烈火，解除【煙火燃燒】狀態',
        require: { flag: 'fireworks_burning', hideWhenUnavailable: true },
        resultText: '「雨紛紛 舊故里草木深……」洛陽舊城的冷雨傾瀉，澆滅了四周竄起的花火！\n成功解除【煙火燃燒】環境狀態，不再每三回合燒毀物品！\n獲得道具【煙花易冷】。',
        effect: {
          addItem: '煙花易冷',
          setFlag: { fireworks_burning: false },
        },
      },
      {
        text: '感受舊故里飄散的氣息，化作信物入行囊',
        require: { notFlag: 'fireworks_burning', hideWhenUnavailable: true },
        resultText: '洛陽城外的寒雨透著微涼，石碑的苔痕宛若故人淚。\n獲得了【煙花易冷】信物！',
        effect: {
          addItem: '煙花易冷',
        },
      },
    ],
  },
  {
    id: 'C2010-04', //已完成
    name: '免費教學錄影帶',
    album: '跨時代',
    year: 2010,
    track: 4,
    type: '線索',
    maxDraws: 1,
    weight: 50,
    route: '通用',
    flavorText: '「你是不是 啊哈感覺到了」\n錄影帶在播放機中旋轉，揭曉了些資訊。',
    options: [
      {
        text: '舉起你的單手給他個啵!',
        resultText: 'ohoh 還沒 不急我先教你彈！\n角色欄位顯現特殊能力與成就名稱揭曉！',
        effect: { addItem: '免費教學錄影帶' },
      },
    ],
  },
  {
    id: 'C2010-05',
    name: '好久不見',
    album: '跨時代',
    year: 2010,
    track: 5,
    type: '線索',
    maxDraws: 1,
    weight: 2,
    route: '周杰倫家庭',
    flavorText: '「好久不見，你還好嗎？簡單的一句話，卻道盡了歲月的滄桑……」',
    options: [
      {
        text: '向舊日好友熱情招手，道一聲久違的問候',
        resultText: '心中的冰霜融化，獲得珍貴羈絆線索【好久不見】！',
        effect: { addItem: '好久不見' },
      },
    ],
  },
  // ==========================================
  // [C2010-06] 雨下一整晚
  // ==========================================
  {
    id: 'C2010-06',
    name: '雨下一整晚',
    album: '跨時代',
    year: 2010,
    track: 6,
    type: '事件',
    maxDraws: 1,
    weight: 0,
    route: '通用',
    isSynthesizedOnly: true,
    acquisitionSource: '始終下雨・維持下雨天狀態至第30回合結束獲得',
    hintText: '夜色深沉，雨聲如箏，時光悄悄流逝。獲得卡牌《雨下一整晚》！',
    flavorText: '「雨下一整晚，街燈下斑駁的倒影……」一把古箏在細雨濛濛的屋簷下輕輕撥響，穿越百年光陰。',
    options: [],
  },
  {
    id: 'C2010-07',
    name: '嘻哈空姐',
    album: '跨時代',
    year: 2010,
    track: 7,
    type: '遭遇',
    maxDraws: 2,
    weight: 0, // 暫不啟用
    route: '通用',
    flavorText: '「頭等艙內的優雅問候，嘻哈空姐遞來一杯香檳，微笑道出高空中的秘密。」',
    options: [
      {
        text: '向空姐打聽傳奇時空與古典樂章的秘辛',
        resultText: '空姐遞過香檳，指尖輕觸雲霧謎語：「古堡深處沉睡著逆流的刻度，唯有伴隨安眠之音方能悄然揭示；四座橫跨世紀的神聖豐碑若能匯聚於同一個行囊，時間將為極致的藝術停滯。」',
        effect: { addItem: '空姐的雲端密語' },
      },
    ],
  },
  // ==========================================
  // [C2010-08] 我落淚情緒零碎
  // ==========================================
  {
    id: 'C2010-08',
    name: '我落淚情緒零碎',
    album: '跨時代',
    year: 2010,
    track: 8,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「我落淚 情緒零碎，滿地落花無人撿拾……」落紅遍地，細雨無聲打濕了窗櫺。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2010-09] 愛的飛行日記
  // ==========================================
  {
    id: 'C2010-09', //已完成
    name: '愛的飛行日記',
    album: '跨時代',
    year: 2010,
    track: 9,
    type: '物品',
    maxDraws: 1,
    weight: 2, // 上限1張，抽卡機率2%
    route: '通用',
    flavorText: '「為愛飛行 脫離地心引力的熱情 我在宇宙無重力的環境 為妳降臨」',
    options: [
      {
        text: '收入行囊',
        resultText: '獲得了【愛的飛行日記】！',
        effect: {
          addItem: '愛的飛行日記',
        },
      },
    ],
  },
  // ==========================================
  // [C2010-09-EX] 飛行時光機
  // ==========================================
  {
    id: 'C2010-09-EX',
    name: '飛行時光機',
    album: '跨時代',
    year: 2010,
    track: 'EX',
    type: '物品',
    maxDraws: 1,
    weight: 0, // 僅能透過小鐵匠強化獲得
    route: '通用',
    isSynthesizedOnly: true,
    acquisitionSource: '米蘭的小鐵匠巧手強化',
    hintText: '獲得【飛行時光機】，似乎是更多功能的時光機！',
    specialAcquisitionNote:
      '此卡牌為專屬特殊強化道具，在常規抽卡池中無法抽卡獲得。\n透過小鐵匠將時光機與愛的飛行日記強化結合，已永久記錄至你的冒險手冊與音樂圖鑑！',
    flavorText: '「升空對抗 重力反應！」',
    options: [],
  },
  // ==========================================
  // [C2010-10] 自導自演
  // ==========================================
  {
    id: 'C2010-10',
    name: '自導自演',
    album: '跨時代',
    year: 2010,
    track: 10,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「一場自導自演的戲碼，劇本早已註定了結局……」攝影棚昏暗的聚光燈下，劇本散落一地。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  {
    id: 'C2010-11',
    name: '超人不會飛',
    album: '跨時代',
    year: 2010,
    track: 11,
    type: '線索',
    maxDraws: 1,
    weight: 5,
    route: '最偉大的作品',
    flavorText: '「拯救地球好累，雖然有些疲憊，但我還是會微笑面對每一道期待的眼光。」',
    options: [
      {
        text: '收入行囊細細研讀',
        resultText: '你接納了身為凡人卻甘願扛起時代重擔的心志，獲得【超人不會飛】。',
        effect: { addItem: '超人不會飛' },
      },
    ],
  },
  {
    id: 'C2010-SS',
    name: '《超時代》',
    album: '跨時代',
    year: 2010,
    track: 'SS',
    type: '線索',
    maxDraws: 1,
    weight: 1,
    route: '最偉大的作品',
    flavorText: '【傳奇演唱會・超時代】十週年巡迴的輝煌紀錄，象徵跨越時代的王者霸氣。',
    options: [
      {
        text: '登臨超時代舞台之巔',
        resultText: '萬人歡呼聲中，你領悟了跨時代的真諦！',
        effect: { addItem: '《超時代》', apChange: 15 },
      },
    ],
  },

  // =========================================================================
  // 【2011 年・第十一張專輯《驚嘆號》】
  // =========================================================================
  // ==========================================
  // [C2011-01] 驚嘆號
  // ==========================================
  {
    id: 'C2011-01',
    name: '驚嘆號',
    album: '驚嘆號',
    year: 2011,
    track: 1,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「驚嘆號劃破沉寂，用速度證明王者的歸來……」巨大的感嘆號呼嘯而過，震撼整個宇宙！',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2011-02] 迷魂曲
  // ==========================================
  {
    id: 'C2011-02',
    name: '迷魂曲',
    album: '驚嘆號',
    year: 2011,
    track: 2,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「迷魂曲響起，神秘的催眠音波掌控了意識……」迷幻的電子合成器旋律在空曠的舞廳迴盪。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2011-03] Mine Mine
  // ==========================================
  {
    id: 'C2011-03',
    name: 'Mine Mine',
    album: '驚嘆號',
    year: 2011,
    track: 3,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「Mine Mine 哭泣也無法挽回，節奏在指尖碎裂……」強烈的碎拍節奏中夾雜著無奈的呼喚。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  {
    id: 'C2011-04', //已完成
    name: '公主病',
    album: '驚嘆號',
    year: 2011,
    track: 4,
    type: '物品',
    maxDraws: 1,
    weight: 6,
    route: '周杰倫家庭',
    flavorText: '「哎呦哥哥 嗨 你好！」',
    options: [
      {
        text: '收藏這枚任性信物',
        resultText: '獲得【公主病】！若是純真男孩持有，血脈將受到共鳴，迎來終極進化！',
        effect: { addItem: '公主病' },
      },
    ],
  },
  // ==========================================
  // [C2011-05] 你好嗎
  // ==========================================
  {
    id: 'C2011-05',
    name: '你好嗎',
    album: '驚嘆號',
    year: 2011,
    track: 5,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「你好嗎？這句簡單的問候跨越了無數光年……」老式信箱裡滑落一張未署名的明信片。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  {
    id: 'C2011-06', //已完成
    name: '療傷燒肉粽',
    album: '驚嘆號',
    year: 2011,
    track: 6,
    type: '物品',
    maxDraws: 2,
    weight: 0,
    route: '最偉大的作品',
    isSynthesizedOnly: true,
    acquisitionSource: '小鐵匠跟你交換',
    hintText: '獲得【療傷燒肉粽】，這東西還有比吃飽更重要的事！',
    specialAcquisitionNote:
      '此卡牌為專屬特殊機制卡牌，在常規抽卡池中無法抽卡獲得。\n透過跟小鐵匠交換獲得，已永久記錄至你的冒險手冊與音樂圖鑑！',
    flavorText: '「燒~肉~粽~ 酸甜苦辣的愛情請把它忘記。」',
    options: [],
  },
  {
    id: 'C2011-07', 
    name: '琴傷',
    album: '驚嘆號',
    year: 2011,
    track: 7,
    type: '日記',
    maxDraws: 1,
    weight: 0, // 唯一取得方式只能透過威廉古堡的豬管家，無法直接抽到
    route: '通用',
    isSynthesizedOnly: true,
    acquisitionSource: '安撫了豬管家的哀傷',
    hintText: '獲得日記《琴傷》！全域日記已解鎖篇章【琴傷】，局外劇情推進。',
    specialAcquisitionNote:
      '此卡牌為專屬特殊機制卡牌，在常規抽卡池中無法抽卡獲得。\n以【療傷燒肉粽】安撫了威廉古堡豬管家，他傾訴情傷後獲得，已永久記錄至你的冒險手冊與音樂圖鑑！',
    flavorText: '「我不忍為難 問誰在等你靠岸。一圈戒痕 在你指上 目送你 越走越遠的 悲傷」豬管家憶起了過往',
    options: [],
  },
  // ==========================================
  // [C2011-08] 水手怕水
  // ==========================================
  {
    id: 'C2011-08',
    name: '水手怕水',
    album: '驚嘆號',
    year: 2011,
    track: 8,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「水手怕水？這可是航海史上最大的幽默……」波濤洶湧的甲板上，水手們滑稽地抓著欄杆。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2011-09] 世界未末日
  // ==========================================
  {
    id: 'C2011-09',
    name: '世界未末日',
    album: '驚嘆號',
    year: 2011,
    track: 9,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「就算世界未末日，我們也要緊緊相擁……」末日警報在城市的防空洞外鳴響，但內心無比堅定。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2011-10] 皮影戲
  // ==========================================
  {
    id: 'C2011-10',
    name: '皮影戲',
    album: '驚嘆號',
    year: 2011,
    track: 10,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「燈光打在白布上，皮影人偶翻飛跳躍……」雕花皮影在唱腔中躍動，演繹著忠奸傳奇。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  {
    id: 'C2011-11', //已完成
    name: '超跑女神',
    album: '驚嘆號',
    year: 2011,
    track: 11,
    type: '遭遇',
    maxDraws: 1,
    weight: 20, // 上限1，抽卡機率7%
    route: '太陽之子',
    flavorText: '「你專心在畫睫毛 我專心在等你笑。」',
    options: [
      {
        text: '聆聽超跑女神指引的賽道',
        resultText: '真的嗎真的嗎 我竟在結巴 老半天嘴裡蹦不出一句話！手握方向盤跟著你髮香～',
        effect: { addItem: '超跑女神指引的賽道' },
      },
    ],
  },
  // ==========================================
  // [C2011-SS] 《驚嘆號》
  // ==========================================
  {
    id: 'C2011-SS',
    name: '《驚嘆號》',
    album: '驚嘆號',
    year: 2011,
    track: 'SS',
    type: '線索',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '【傳奇神專・《驚嘆號》】西元 2011 年震撼發行的經典之作，收錄眾多傳世名曲！凝聚了周杰倫音樂宇宙的無上瑰寶。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },

  // =========================================================================
  // 【2012 年・第十二張專輯《12新作》】
  // =========================================================================
  // ==========================================
  // [C2012-01] 四季列車
  // ==========================================
  {
    id: 'C2012-01',
    name: '四季列車',
    album: '12新作',
    year: 2012,
    track: 1,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「四季列車穿梭在春夏秋冬，窗外的風景永不重複……」蒸氣火車鳴響汽笛，疾馳過漫天風雪與花海。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2012-02] 手語
  // ==========================================
  {
    id: 'C2012-02',
    name: '手語',
    album: '12新作',
    year: 2012,
    track: 2,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「手語在指尖比劃，無聲的交流勝過千言萬語……」指尖輕巧跳動，流轉出最純粹的默契。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2012-03] 公公偏頭痛
  // ==========================================
  {
    id: 'C2012-03', //已完成
    name: '公公偏頭痛',
    album: '12新作',
    year: 2012,
    track: 3,
    type: '遭遇',
    maxDraws: 1,
    weight: 0,
    route: '周杰倫家庭',
    hasEnvironmentEffect: true,
    environmentEffectName: '偏頭痛',
    flavorText: '「公公他偏頭痛，公公他偏頭痛...」雖然你不是公公，但也被小男孩搞得頭好痛。',
    options: [
      {
        text: '揉揉太陽穴，無奈嘆氣',
        resultText: '「公公他偏頭痛，公公他偏頭痛...」被小男孩一弄，變成【偏頭痛】狀態\n\n後續每回合行動力 -2！',
        effect: { setFlag: { headache_active: true } },
      },
    ],
  },
  // ==========================================
  // [C2012-04] 明明就
  // ==========================================
  {
    id: 'C2012-04',
    name: '明明就',
    album: '12新作',
    year: 2012,
    track: 4,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「明明就他比較溫柔，我也知道你放不下……」孤獨的琴鍵在空曠的客廳低語。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2012-05] 傻笑
  // ==========================================
  {
    id: 'C2012-05',
    name: '傻笑',
    album: '12新作',
    year: 2012,
    track: 5,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「看著你傻笑的模樣，所有煩惱瞬間消散……」午後咖啡廳的玻璃窗前，灑滿了金黃色的陽光。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  {
    id: 'C2012-06', //已完成
    name: '比較大的大提琴',
    album: '12新作',
    year: 2012,
    track: 6,
    type: '物品',
    maxDraws: 1,
    weight: 0, // 由《跨時代》選項獲得，或特殊事件觸發
    route: '最偉大的作品',
    isSynthesizedOnly: true,
    acquisitionSource: '《跨時代》樂器環繞霸氣皇朝',
    hintText: '獲得【比較大的大提琴】，話說這可以拿來表演嗎？',
    specialAcquisitionNote:
      '此卡牌為專屬特殊機制卡牌，在常規抽卡池中無法抽卡獲得。\n於《跨時代》中選擇獲得，已永久記錄至你的冒險手冊與音樂圖鑑！',
    flavorText: '「小傻瓜這不是大提琴！」',
    options: [],
  },
  // ==========================================
  // [C2012-07] 愛你沒差
  // ==========================================
  {
    id: 'C2012-07',
    name: '愛你沒差',
    album: '12新作',
    year: 2012,
    track: 7,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「愛你沒差，那一點時差……跨越時區的愛戀無怨無悔。」即使時鐘指向不同的刻度，心跳依然同頻。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2012-08] 紅塵客棧
  // ==========================================
  {
    id: 'C2012-08',
    name: '紅塵客棧',
    album: '12新作',
    year: 2012,
    track: 8,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「紅塵客棧風似刀 驟雨落 宿命敲……」黃沙古道旁的木造客棧裡，俠客飲盡碗中濁酒。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  {
    id: 'C2012-09',
    name: '夢想啟動',
    album: '12新作',
    year: 2012,
    track: 9,
    type: '事件',
    maxDraws: 1,
    weight: 6,
    route: '最偉大的作品',
    flavorText: '「微笑吧，就算逆著風；狂奔吧，就算大雨滂沱！」夢想的引擎正在轟鳴！',
    options: [
      {
        text: '「微笑吧，狂奔吧！」點燃三道精神基石，煉成神專《杰倫》',
        require: { items: ['完美主義', '我不配', '超人不會飛'] },
        resultText: '三道光芒沖天而起，匯聚成第一張傳世神卡——SS卡【《杰倫》】！',
        effect: {
          removeItems: ['完美主義', '我不配', '超人不會飛'],
          addItem: '《杰倫》',
          setFlag: { has_album_jay: true },
        },
      },
      {
        text: '心潮澎湃，默默堅定心志',
        resultText: '你感到體內熱血沸騰，但尚未集齊三張精神基石，暫且無法點燃神卡。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2012-10] 大笨鐘
  // ==========================================
  {
    id: 'C2012-10', //已完成
    name: '大笨鐘',
    album: '12新作',
    year: 2012,
    track: 10,
    type: '物品',
    maxDraws: 1,
    weight: 0, // 上限1張，抽卡機率0%(只能改造)
    route: '通用',
    isSynthesizedOnly: true,
    acquisitionSource: '米蘭的小鐵匠巧手改造',
    hintText: '獲得【大笨鐘】，鐘聲響亮，是否能傳到情人耳裡？現在又是幾點鐘呢.....',
    specialAcquisitionNote:
      '此卡牌為專屬特殊機制卡牌，在常規抽卡池中無法抽卡獲得。\n透過跟小鐵匠改造獲得，已永久記錄至你的冒險手冊與音樂圖鑑！',
    flavorText: '「你說我比大笨鐘還笨 要怎麼比……」',
    options: [],
  },
  // ==========================================
  // [C2012-11] 哪裡都是你
  // ==========================================
  {
    id: 'C2012-11',
    name: '哪裡都是你',
    album: '12新作',
    year: 2012,
    track: 11,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「哪裡都是你，轉過身依然看見你的身影……」喧囂的人潮中，每一個回眸都像極了記憶裡的你。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2012-12] 烏克麗麗
  // ==========================================
  {
    id: 'C2012-12', //已完成
    name: '烏克麗麗',
    album: '12新作',
    year: 2012,
    track: 12,
    type: '物品',
    maxDraws: 1,
    weight: 20, // 抽卡機率 20%
    route: '通用',
    flavorText: '「烏克麗麗在你身上就像一把放大的Guitar」\n一把夏威夷風情的烏克麗麗。',
    options: [
      {
        text: '撥動琴弦，將烏克麗麗收入行囊',
        resultText: '獲得【烏克麗麗】，有沒有人需要這把琴呢？',
        effect: {
          addItem: '烏克麗麗',
        },
      },
    ],
  },
  // ==========================================
  // [C2012-SS] 《12新作》
  // ==========================================
  {
    id: 'C2012-SS',
    name: '《12新作》',
    album: '12新作',
    year: 2012,
    track: 'SS',
    type: '線索',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '【傳奇神專・《12新作》】西元 2012 年震撼發行的經典之作，收錄眾多傳世名曲！凝聚了周杰倫音樂宇宙的無上瑰寶。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },

  // =========================================================================
  // 【2014 年・第十三張專輯《哎呦，不錯哦》】
  // =========================================================================
  // ==========================================
  // [C2014-01] 陽明山
  // ==========================================
  {
    id: 'C2014-01',
    name: '陽明山',
    album: '哎呦，不錯哦',
    year: 2014,
    track: 1,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「陽明山夜景迷人，機車引擎在山路上咆哮……」夜色籠罩的陽明山頂，俯瞰著繁星般閃爍的城市燈火。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2014-02] 竊愛
  // ==========================================
  {
    id: 'C2014-02',
    name: '竊愛',
    album: '哎呦，不錯哦',
    year: 2014,
    track: 2,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「竊取了誰的真心？在威尼斯的假面舞會上……」面具下的眼眸流轉，華麗的探戈旋律在大廳流淌。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2014-03] 算什麼男人
  // ==========================================
  {
    id: 'C2014-03',
    name: '算什麼男人',
    album: '哎呦，不錯哦',
    year: 2014,
    track: 3,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「算什麼男人，眼睜睜看著她走向別人……」深夜昏暗的酒吧裡，酒杯中的冰塊漸漸消融。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2014-04] 天涯過客
  // ==========================================
  {
    id: 'C2014-04',
    name: '天涯過客',
    album: '哎呦，不錯哦',
    year: 2014,
    track: 4,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「天涯過客匆匆走過，留下煙雨江南的嘆息……」烏篷船輕輕搖過青石橋，漣漪在碧波中散開。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2014-05] 怎麼了
  // ==========================================
  {
    id: 'C2014-05',
    name: '怎麼了',
    album: '哎呦，不錯哦',
    year: 2014,
    track: 5,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「怎麼了 你累了 說好的幸福呢……」車窗外掠過沉悶的灰色天空。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2014-06] 一口氣全唸對
  // ==========================================
  {
    id: 'C2014-06',
    name: '一口氣全唸對',
    album: '哎呦，不錯哦',
    year: 2014,
    track: 6,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「一口氣全唸對，繞口令展現極致饒舌實力……」舌尖如機關槍般連珠砲發，韻律如行雲流水！',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2014-07] 我要夏天
  // ==========================================
  {
    id: 'C2014-07',
    name: '我要夏天',
    album: '哎呦，不錯哦',
    year: 2014,
    track: 7,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「我要夏天！衝向沙灘衝向浪花……」火熱的驕陽下，海浪將歡笑聲衝上沙灘。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2014-08] 手寫的從前
  // ==========================================
  {
    id: 'C2014-08',
    name: '手寫的從前',
    album: '哎呦，不錯哦',
    year: 2014,
    track: 8,
    type: '物品',
    maxDraws: 99,
    weight: 0, // 抽卡機率0%，無法翻卡抽到，只能由《蘭亭序》於煙火中燃燒轉化獲得
    route: '通用',
    isSynthesizedOnly: true,
    acquisitionSource: '蘭亭序於煙火中燃燒轉化獲得',
    badgeTitle: '✦ 浴火重生 ✦',
    hintText: '獲得【手寫的從前】！這我唱的。我看著你的臉，輕刷著和弦……',
    specialAcquisitionNote:
      '此卡牌為專屬特殊機制卡牌，在常規抽卡池中無法抽卡獲得。\n由《蘭亭序》於煙火烈焰中燃燒轉化獲得，已永久記錄至你的冒險手冊與音樂圖鑑！',
    flavorText: '「這我唱的。我看著你的臉 輕刷著和弦……」',
    options: [],
  },
  {
    id: 'C2014-09',
    name: '鞋子特大號',
    album: '哎呦，不錯哦',
    year: 2014,
    track: 9,
    type: '物品',
    maxDraws: 1,
    weight: 6,
    route: '最偉大的作品',
    flavorText: '「別什麼都裝懂，幽默是這世上最棒的解藥！滑稽的大鞋踩出踢踏節奏。」',
    options: [{ text: '拾起收入行囊', resultText: '獲得【鞋子特大號】。', effect: { addItem: '鞋子特大號' } }],
  },
  {
    id: 'C2014-10',
    name: '聽爸爸的話',
    album: '哎呦，不錯哦',
    year: 2014,
    track: 10,
    type: '事件',
    maxDraws: 2,
    weight: 8,
    route: '周杰倫家庭',
    flavorText: '「一個人走在街頭，想著爸爸說過的話，學會頂天立地承擔責任。」',
    options: [
      {
        text: '銘記父親的教誨',
        resultText: '父親堅毅的身影化為前進的力量！',
        effect: { addItem: '聽爸爸的話' },
      },
    ],
  },
  {
    id: 'C2014-11',
    name: '美人魚',
    album: '哎呦，不錯哦',
    year: 2014,
    track: 11,
    type: '遭遇',
    maxDraws: 2,
    weight: 0, // 暫不啟用
    route: '通用',
    flavorText: '「蔚藍深海中游動著美麗的倩影，美人魚浮出水面，歌聲如天籟般動聽。」',
    options: [
      {
        text: '傾聽美人魚歌聲中隱藏的深海絮語',
        resultText: '美人魚輕吐氣泡，海風中幽幽傳唱：「三代溫存的絮語交織在潮汐深處……沉睡在角落的宅心，若被任性的刺痛輕輕喚醒，真摯的淚水終將化作冠冕上的明珠。」',
        effect: { addItem: '美人魚的深海呢喃' },
      },
    ],
  },
  {
    id: 'C2014-12',
    name: '聽見下雨的聲音',
    album: '哎呦，不錯哦',
    year: 2014,
    track: 12,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 抽卡機率 0%，需在下雨天持續 5 回合後觸發單卡過場獲得
    route: '周杰倫家庭',
    isSynthesizedOnly: true,
    acquisitionSource: '下雨天持續5回合後觸發獲得',
    badgeTitle: '✦ 雨幕低語・心境豁達 ✦',
    hintText: '在下雨天許久，你聽見了下雨的聲音……獲得關鍵卡牌【聽見下雨的聲音】！',
    specialAcquisitionNote:
      '此卡牌為專屬特殊機制卡牌，在常規抽卡池中無法抽卡獲得。\n在下雨天環境下持續 5 回合後觸發單卡過場獲得，已永久記錄至你的冒險手冊與音樂圖鑑！',
    flavorText: '「竹籬上停留著蜻蜓，玻璃瓶裡插著小蔥，百葉窗折射著雨滴的思念……」\n雨滴落在青石板上，清脆綿長，洗滌著世間塵囂。',
    options: [
      {
        text: '在雨幕中靜靜聆聽雨滴的聲音',
        resultText: '你閉上雙眼靜靜聆聽雨聲，心中豁然開朗。獲得卡牌《聽見下雨的聲音》放入行囊！',
        effect: { addItem: '聽見下雨的聲音' },
      },
    ],
  },
  // ==========================================
  // [C2014-SS] 《哎呦，不錯哦》
  // ==========================================
  {
    id: 'C2014-SS',
    name: '《哎呦，不錯哦》',
    album: '哎呦，不錯哦',
    year: 2014,
    track: 'SS',
    type: '線索',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '【傳奇神專・《哎呦，不錯哦》】西元 2014 年震撼發行的經典之作，收錄眾多傳世名曲！凝聚了周杰倫音樂宇宙的無上瑰寶。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },

  // =========================================================================
  // 【2016 年・第十四張專輯《周杰倫的床邊故事》】
  // =========================================================================
  {
    id: 'C2016-01', //已完成
    name: '床邊故事',
    album: '周杰倫的床邊故事',
    year: 2016,
    track: 1,
    type: '物品',
    maxDraws: 2,
    weight: 7,
    route: '最偉大的作品',
    flavorText: '「乖乖睡啊 不要害怕」',
    options: [
      {
        text: '收下床邊故事',
        resultText: '獲得【床邊故事】！\n這故事非常容易讓人入睡，尤其是會一直打呼的人。',
        effect: { addItem: '床邊故事' },
      },
    ],
  },
  // ==========================================
  // [C2016-02] 說走就走
  // ==========================================
  {
    id: 'C2016-02', //已完成
    name: '說走就走',
    album: '周杰倫的床邊故事',
    year: 2016,
    track: 2,
    type: '事件',
    maxDraws: 1,
    weight: 10, // 上限1張，抽卡機率10%
    route: '通用',
    condition: (state) => Boolean((state.blacksmithUnlocked || state.flags['blacksmith_unlocked']) && !state.inventory['說走就走']),
    flavorText: '「路兩旁是單調的顏色 卻有種遼闊的快樂 我還記得。」',
    options: [
      {
        text: '這就是年輕，該瀟灑一次的決定',
        resultText: '【說走就走】這就是年輕，該瀟灑一次的決定！',
        effect: {
          addItem: '說走就走',
        },
      },
    ],
  },
  // ==========================================
  // [C2016-03] 一點點
  // ==========================================
  {
    id: 'C2016-03',
    name: '一點點',
    album: '周杰倫的床邊故事',
    year: 2016,
    track: 3,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「一點點的心動，就能掀起滔天巨浪……」平靜的湖面滴下一滴水珠，激起層層漣漪。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2016-04] 前世情人
  // ==========================================
  {
    id: 'C2016-04', //已完成
    name: '前世情人',
    album: '周杰倫的床邊故事',
    year: 2016,
    track: 4,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 0% 只能由魔術先生通過浪漫手機考驗獲得
    route: '周杰倫家庭',
    isSynthesizedOnly: true,
    acquisitionSource: '浪漫手機連線・魔術師通過考驗',
    badgeTitle: '✦ 親情守護・前世誓約 ✦',
    hintText: '「什麼愛 不說 就已經存在 什麼愛 望著 就全都明白\n妳笑 一點一點一滴漾開 一字一句 形容不來 是星空上的銀海」 \n獲得關鍵卡牌',
    specialAcquisitionNote:
      '此卡牌為專屬特殊機制卡牌，在常規抽卡池中無法抽卡獲得。\n在通過前世情人考驗後獲得，已永久記錄至你的冒險手冊與音樂圖鑑！',
    flavorText: '「小公主 過來過來約定好 未來的城堡 將來我們一起造……\n我會 當妳晝夜騎士 烈陽的樹蔭 讓花朵為妳吟遊的魔術師」',
    options: [],
  },
  // ==========================================
  // [C2016-05] 英雄
  // ==========================================
  {
    id: 'C2016-05',
    name: '英雄',
    album: '周杰倫的床邊故事',
    year: 2016,
    track: 5,
    type: '事件',
    maxDraws: 1,
    weight: 0,
    route: '通用',
    flavorText: '「英雄出少年，披荊斬棘守護最後的希望……」激昂的戰歌擂響戰鼓，熱血在胸膛中奔湧！',
    options: [
      {
        text: '擊殺、雙殺、三殺！擂響澎湃戰鼓',
        resultText: '「旋轉 跳躍 你閉著眼！」激昂的戰歌擂響戰鼓，熱血沸騰！行動力大幅提升 +4！',
        effect: { apChange: 4 },
      },
      {
        text: '披荊斬棘守護最後的希望',
        resultText: '你在戰火中堅守信念，立下不朽英雄誓約！行動力 +3！',
        effect: { apChange: 3 },
      },
    ],
  },
  // ==========================================
  // [C2016-06] 不該
  // ==========================================
  {
    id: 'C2016-06',
    name: '不該',
    album: '周杰倫的床邊故事',
    year: 2016,
    track: 6,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '「不該牽起你的手，若結局註定是遺憾……」雪山之巔的冰晶在夕陽下閃爍著刺目的寒光。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2016-07] 土耳其冰淇淋
  // ==========================================
  {
    id: 'C2016-07', //已完成
    name: '土耳其冰淇淋',
    album: '周杰倫的床邊故事',
    year: 2016,
    track: 7,
    type: '物品',
    maxDraws: 1,
    weight: 0,
    route: '周杰倫家庭',
    isSynthesizedOnly: true,
    acquisitionSource: '園遊會冰品攤位購買',
    badgeTitle: '✦ 園遊會奇遇 ✦',
    hintText: '我耍你耍的就像土耳其的冰淇淋，獲得【土耳其冰淇淋】，賣個冰還能秀雜技？',
    specialAcquisitionNote:
      '此卡牌為專屬特殊機制卡牌，在常規抽卡池中無法抽卡獲得。\n由園遊會攤位購買獲得，已永久記錄至你的冒險手冊與音樂圖鑑！',
    flavorText: '「你猜不透也想不到摸不著頭緒，我總是為了什麼出奇不意」到底？',
    options: [],
  },
  {
    id: 'C2016-08',
    name: '告白氣球',
    album: '周杰倫的床邊故事',
    year: 2016,
    track: 8,
    type: '物品',
    maxDraws: 3,
    weight: 8,
    route: '通用',
    flavorText: '「塞納河畔，左岸的咖啡，我手一杯，品嚐你的美……」',
    options: [
      {
        text: '握住飄揚的粉紅氣球，漫步塞納河畔',
        resultText: '浪漫氛圍湧上心頭，心境澄澈，行動力+8！',
        effect: { addItem: '告白氣球', apChange: 8 },
      },
    ],
  },
  {
    id: 'C2016-09',
    name: 'Now You See Me',
    album: '周杰倫的床邊故事',
    year: 2016,
    track: 9,
    type: '事件',
    maxDraws: 1,
    weight: 6,
    route: '最偉大的作品',
    flavorText: '「出神入化，神乎其技！撲克牌在指尖翻飛，魔幻的幻象能無中生有！」',
    options: [
      {
        text: '「將指尖的憂傷拼圖重組！」解構記憶，化作神專《范特西》',
        require: { items: ['爸我回來了', '對不起', '安靜'] },
        resultText: '奇蹟魔術上演！三張憂傷的拼圖在幻影中重組，綻放出無與倫比的赤紅光芒——SS卡【《范特西》】現世！',
        effect: {
          removeItems: ['爸我回來了', '對不起', '安靜'],
          addItem: '《范特西》',
          setFlag: { has_album_fantasy: true },
        },
      },
      {
        text: '觀賞這場眼花繚亂的近景魔術',
        resultText: '魔術精彩絕倫，但你手中尚缺關鍵拼圖，未能在虛無中變出神卡。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2016-10] 愛情廢柴
  // ==========================================
  {
    id: 'C2016-10',
    name: '愛情廢柴',
    album: '周杰倫的床邊故事',
    year: 2016,
    track: 10,
    type: '事件',
    maxDraws: 1,
    weight: 0,
    route: '通用',
    flavorText: '「愛情廢柴也能在雪地裡堆出最真的雪人……」寒冬的巴黎街頭，圍著厚厚的毛巾對著雙手哈氣。',
    options: [
      {
        text: '對著雙手哈氣，在雪地堆出最真的雪人',
        resultText: '厚厚的一圈圍巾圍在雪人脖子上，雖然笨拙卻充滿真情實感。行動力 +3！',
        effect: { apChange: 3 },
      },
      {
        text: '承認自己是愛情的廢柴，淡然自嘲',
        resultText: '「我為你哈氣，手套丟一邊……」雖然平淡無奇，卻逍遙自在！行動力 +3！',
        effect: { apChange: 3 },
      },
    ],
  },
  // ==========================================
  // [C2016-SS] 《周杰倫的床邊故事》
  // ==========================================
  {
    id: 'C2016-SS',
    name: '《周杰倫的床邊故事》',
    album: '周杰倫的床邊故事',
    year: 2016,
    track: 'SS',
    type: '線索',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '通用',
    flavorText: '【傳奇神專・《周杰倫的床邊故事》】西元 2016 年震撼發行的經典之作，收錄眾多傳世名曲！凝聚了周杰倫音樂宇宙的無上瑰寶。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },

  // =========================================================================
  // 【2022 年・第十五張專輯《最偉大的作品》】
  // =========================================================================
  // ==========================================
  // [C2022-01] Intro
  // ==========================================
  {
    id: 'C2022-01',
    name: 'Intro',
    album: '最偉大的作品',
    year: 2022,
    track: 1,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '最偉大的作品',
    flavorText: '「Intro，古董鋼琴前奏響起，時空穿梭即將展開……」黑白琴鍵在月光下泛起微光，時間裂痕悄然打開。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2022-02] 最偉大的作品
  // ==========================================
  {
    id: 'C2022-02',
    name: '最偉大的作品',
    album: '最偉大的作品',
    year: 2022,
    track: 2,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '最偉大的作品',
    flavorText: '「這世上最偉大的作品，將在指尖浴火重生……」巴黎凡爾賽宮金碧輝煌的長廊中，野獸派與達利的時空交錯！',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  {
    id: 'C2022-03',
    name: '還在流浪',
    album: '最偉大的作品',
    year: 2022,
    track: 3,
    type: '事件',
    maxDraws: 5,
    weight: 10,
    route: '通用',
    flavorText: '「老街坊小弄堂，你是否還在流浪？異國的燈火闌珊處，吉他聲隱隱迴盪……」',
    options: [
      {
        text: '在夜色中的異國街巷沈澱過度一回合',
        resultText: '靜謐的夜色洗去了塵囂。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2022-04] 說好不哭
  // ==========================================
  {
    id: 'C2022-04',
    name: '說好不哭',
    album: '最偉大的作品',
    year: 2022,
    track: 4,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '最偉大的作品',
    flavorText: '「說好不哭，微笑著送你走向更好的未來……」東京鐵塔下的斜陽染紅了天空，按下快門定格最後的笑容。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2022-05] 紅顏如霜
  // ==========================================
  {
    id: 'C2022-05',
    name: '紅顏如霜',
    album: '最偉大的作品',
    year: 2022,
    track: 5,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '最偉大的作品',
    flavorText: '「紅顏如霜，淚水凝結成冰冷的雕塑……」寒江孤舟之上，琵琶聲穿透漫天寒霜。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2022-06] 不愛我就拉倒
  // ==========================================
  {
    id: 'C2022-06',
    name: '不愛我就拉倒',
    album: '最偉大的作品',
    year: 2022,
    track: 6,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '最偉大的作品',
    flavorText: '「不愛我就拉倒，離開之前請把外套脫掉……」重低音的吉他切音撕裂了曖昧的黏膩。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2022-07] Mojito
  // ==========================================
  {
    id: 'C2022-07',
    name: 'Mojito',
    album: '最偉大的作品',
    year: 2022,
    track: 7,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '最偉大的作品',
    flavorText: '「Mojito，古巴老爺車駛過哈瓦那海濱大道……」薄荷葉與蘭姆酒的清冽香氣在夏夜的微風中飄蕩。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2022-08] 錯過的煙火
  // ==========================================
  {
    id: 'C2022-08', //已完成
    name: '錯過的煙火',
    album: '最偉大的作品',
    year: 2022,
    track: 8,
    type: '遭遇',
    maxDraws: 1,
    weight: 15, // 上限1，抽卡機率15%
    route: '最偉大的作品',
    hasEnvironmentEffect: true, // 具備環境變化效果（煙火燃燒狀態）
    environmentEffectName: '煙火燃燒',
    flavorText: '「煙火美得稍縱即逝，但錯過的煙火依然在你左右……」',
    options: [
      {
        text: '收下錯過的煙火',
        resultText: '煙火飄散在你四週，每回合燃燒著你……',
        effect: {
          addItem: '錯過的煙火',
          setFlag: { fireworks_burning: true },
        },
      },
    ],
  },
  // ==========================================
  // [C2022-09] 等你下課
  // ==========================================
  {
    id: 'C2022-09',
    name: '等你下課',
    album: '最偉大的作品',
    year: 2022,
    track: 9,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '最偉大的作品',
    flavorText: '「等你下課，在那個熟悉的操場邊默默守候……」單車後座載著微風，校園鐘聲悠揚敲響。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2022-10] 粉色海洋
  // ==========================================
  {
    id: 'C2022-10', //已完成
    name: '粉色海洋',
    album: '最偉大的作品',
    year: 2022,
    track: 10,
    type: '事件',
    maxDraws: 1,
    weight: 0,
    route: '周杰倫家庭',
    isSynthesizedOnly: true,
    acquisitionSource: '園遊會為小男孩拍攝MV獲得',
    badgeTitle: '✦ 園遊會終曲・親情見證 ✦',
    hintText: '獲得關鍵卡牌【粉色海洋】Hi～小妞！要上我車嗎？。',
    specialAcquisitionNote:
      '此卡牌為專屬特殊機制卡牌，在常規抽卡池中無法抽卡獲得。\n在園遊會滿足小男孩願望並為其拍攝MV後獲得，已永久記錄至你的冒險手冊與音樂圖鑑！',
    flavorText: '「粉色海洋 你回頭望 笑得像天空裡的棉花糖」Romeo笑著。',
    options: [],
  },
  // ==========================================
  // [C2022-11] 倒影
  // ==========================================
  {
    id: 'C2022-11',
    name: '倒影',
    album: '最偉大的作品',
    year: 2022,
    track: 11,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '最偉大的作品',
    flavorText: '「水面上的倒影究竟是真實還是幻覺……」莫內的睡蓮池泛起層層微瀾，倒映著另一個奇幻世界。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2022-12] 我是如此相信
  // ==========================================
  {
    id: 'C2022-12',
    name: '我是如此相信',
    album: '最偉大的作品',
    year: 2022,
    track: 12,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '最偉大的作品',
    flavorText: '「我是如此相信，黑暗之後必將迎來黎明……」廢墟荒漠中，希望的嫩芽正破土而出，迎接拂曉曙光！',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2022-SS] 《最偉大的作品》
  // ==========================================
  {
    id: 'C2022-SS',
    name: '《最偉大的作品》',
    album: '最偉大的作品',
    year: 2022,
    track: 'SS',
    type: '線索',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '最偉大的作品',
    flavorText: '【傳奇神專・《最偉大的作品》】西元 2022 年震撼發行的經典之作，收錄眾多傳世名曲！凝聚了周杰倫音樂宇宙的無上瑰寶。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },

  // =========================================================================
  // 【2026 年・第十六張專輯《太陽之子》】
  // =========================================================================
  // ==========================================
  // [C2026-01] 太陽之子
  // ==========================================
  {
    id: 'C2026-01',
    name: '太陽之子',
    album: '太陽之子',
    year: 2026,
    track: 1,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '太陽之子',
    flavorText: '「太陽之子自烈陽中甦醒，神聖的光輝照徹萬物大地……」遠古太陽圖騰發出刺目金芒，王者正式降臨！',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2026-02] 西西里
  // ==========================================
  {
    id: 'C2026-02',
    name: '西西里',
    album: '太陽之子',
    year: 2026,
    track: 2,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '太陽之子',
    flavorText: '「西西里島蔚藍的海岸邊，海風吹拂著檸檬香氣……」地中海的微風拂過古老的石砌別墅，教父的傳奇在靜謐中蔓延。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2026-03] 那天下雨了
  // ==========================================
  {
    id: 'C2026-03', //已完成
    name: '那天下雨了',
    album: '太陽之子',
    year: 2026,
    track: 3,
    type: '遭遇',
    maxDraws: 1,
    weight: 15,
    route: '周杰倫家庭',
    hasEnvironmentEffect: true,
    environmentEffectName: '那天下雨了',
    flavorText: '「消失的下雨天，我想再淋一遍，我應該對你唱著晴天。」',
    options: [
      {
        text: '進入下雨天環境狀態',
        resultText: '雪白的天空等待彩虹出現，不然會雨下一整晚',
        effect: {
          setFlag: { rainy_weather_active: true },
        },
      },
    ],
  },
  // ==========================================
  // [C2026-04] 湘女多情
  // ==========================================
  {
    id: 'C2026-04',
    name: '湘女多情',
    album: '太陽之子',
    year: 2026,
    track: 4,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '太陽之子',
    flavorText: '「湘女多情，洞庭湖畔瀟湘水雲間……」洞庭湖上水霧濛濛，古琴悠悠，寄託著千年相思。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2026-05] 誰稀罕
  // ==========================================
  {
    id: 'C2026-05',
    name: '誰稀罕',
    album: '太陽之子',
    year: 2026,
    track: 5,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '太陽之子',
    flavorText: '「誰稀罕虛偽的施捨，我自有一片浩瀚天空……」昂首闊步走向荒野，骨子裡流淌著不妥協的傲氣！',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2026-06] 七月的極光
  // ==========================================
  {
    id: 'C2026-06',
    name: '七月的極光',
    album: '太陽之子',
    year: 2026,
    track: 6,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '太陽之子',
    flavorText: '「七月的極光照耀極晝之夜，奇蹟在天幕流動……」冰島冰川之巔，炫目的綠色光帶在天際變幻舞動。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2026-07] 愛琴海
  // ==========================================
  {
    id: 'C2026-07',
    name: '愛琴海',
    album: '太陽之子',
    year: 2026,
    track: 7,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '太陽之子',
    flavorText: '「愛琴海的白牆藍頂，沉醉在愛琴文明的深邃中……」純白的風車在蔚藍愛琴海旁緩緩轉動，希臘神話的殘章隱現。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2026-08] I Do
  // ==========================================
  {
    id: 'C2026-08',
    name: 'I Do',
    album: '太陽之子',
    year: 2026,
    track: 8,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '太陽之子',
    flavorText: '「I Do，在神聖的誓約前獻上一生的守護……」教堂鐘聲悠揚回盪，潔白的婚紗映照著永恆的承諾。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2026-09] 聖徒
  // ==========================================
  {
    id: 'C2026-09',
    name: '聖徒',
    album: '太陽之子',
    year: 2026,
    track: 9,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '太陽之子',
    flavorText: '「聖徒在荒野中冥想，心靈在磨難中千錘百煉……」苦行僧走過炙熱的戈壁，每一步都踏出金石之聲。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2026-10] 女兒殿下
  // ==========================================
  {
    id: 'C2026-10',
    name: '女兒殿下',
    album: '太陽之子',
    year: 2026,
    track: 10,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 抽卡機率 0%，需身為女兒殿下並成功完成第 30 回合終局方可獲得
    route: '周杰倫家庭',
    isSynthesizedOnly: true,
    acquisitionSource: '守護女兒殿下完成冒險終局獲得',
    badgeTitle: '✦ 親情摯愛・真愛守護 ✦',
    hintText: '父愛如山，你守護著女兒殿下平安度過 30 回合！獲得關鍵卡牌【女兒殿下】！',
    specialAcquisitionNote:
      '此卡牌為專屬特殊機制卡牌，在常規抽卡池中無法抽卡獲得。\n以【女兒殿下】身分成功完成第 30 回合終局冒險後獲得，已永久記錄至你的冒險手冊與音樂圖鑑！',
    flavorText: '「女兒殿下，父愛如山守護著你純真的夢想……」城堡花園裡盛開著玫瑰，琴鍵上跳動著父親深沈的愛意。',
    options: [],
  },
  // ==========================================
  // [C2026-11] 淘金小鎮
  // ==========================================
  {
    id: 'C2026-11', //已完成
    name: '淘金小鎮',
    album: '太陽之子',
    year: 2026,
    track: 11,
    type: '遭遇',
    maxDraws: 3,
    weight: 10,
    route: '周杰倫家庭',
    flavorText: '「口哨聲 誰一路跟 一雙雙貪婪的眼神，乾杯的人們 狂歡那金很沉」淘金熱浪席捲而來，沙金河始終蜿蜒著你我。',
    options: [
      {
        text: '花費 5 點行動力進入淘金小鎮挖寶',
        resultText: '你邁步踏入淘金小鎮礦區，用雙手淘洗一切想要的生活！',
        require: { minAp: 5 },
        effect: { apChange: -5 },
      },
      {
        text: '花費 5 枚金幣獲得淘金小鎮門票',
        resultText: '你花費 5 枚金幣購得永久通行門票，淘金小鎮自此為你常駐開放！',
        require: { minCoins: 5 },
        effect: { coinChange: -5, setFlag: { gold_town_unlocked: true } },
      },
      {
        text: '沒錢沒力，離開淘金小鎮',
        resultText: 'Hey!!有人篩選泥土卻篩選出孤獨。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2026-12] 鄉間的路
  // ==========================================
  {
    id: 'C2026-12', //已完成
    name: '鄉間的路',
    album: '太陽之子',
    year: 2026,
    track: 12,
    type: '物品',
    maxDraws: 1,
    weight: 10, // 抽卡機率 10%
    route: '太陽之子',
    condition: (state) => !state.blacksmithUnlocked && !state.flags['blacksmith_unlocked'] && !(state.inventory['鄉間的路'] > 0),
    flavorText: '「鄉間的路延伸向遠方，這趟旅途 開著車 經過了 兒時那棵樹」似乎能幫誰指引方向....。',
    options: [
      {
        text: '鄉間的路 熟悉的 小木屋 在那轉彎處',
        resultText: '你一步 我一步 走到了幸福，獲得【鄉間的路】！',
        effect: {
          addItem: '鄉間的路',
        },
      },
    ],
  },
  // ==========================================
  // [C2026-13] 聖誕星
  // ==========================================
  {
    id: 'C2026-13',
    name: '聖誕星',
    album: '太陽之子',
    year: 2026,
    track: 13,
    type: '事件',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '太陽之子',
    flavorText: '「聖誕星在平安夜的松樹頂端閃耀，溫暖整座寒冬雪城……」壁爐中火星劈啪作響，槲寄生下洋溢著團聚的溫馨。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
  // ==========================================
  // [C2026-SS] 《太陽之子》
  // ==========================================
  {
    id: 'C2026-SS',
    name: '《太陽之子》',
    album: '太陽之子',
    year: 2026,
    track: 'SS',
    type: '線索',
    maxDraws: 1,
    weight: 0, // 尚未開放抽卡 (待第二階段實裝效果與選項)
    route: '太陽之子',
    flavorText: '【傳奇神專・《太陽之子》】西元 2026 年震撼發行的經典之作，收錄眾多傳世名曲！凝聚了周杰倫音樂宇宙的無上瑰寶。',
    // TODO: 第二階段效果、機制、選項實裝
    options: [
      {
        text: '聆聽旋律（待第二階段實裝）',
        resultText: '旋律在耳畔流淌，等待未來的宿命共鳴。',
        effect: {},
      },
    ],
  },
];

/**
 * 取得與某張卡牌關聯的所有行囊物品名稱 (包含卡名自身與選項中產出的物品)
 */
export function getCardItemNames(card: CardDefinition): string[] {
  const names = new Set<string>();
  if (card.name) {
    names.add(card.name);
    if (card.name.includes(' ')) {
      names.add(card.name.replace(/\s+/g, ''));
    }
  }
  card.options?.forEach((opt) => {
    if (opt.effect?.addItem) {
      names.add(opt.effect.addItem);
    }
  });
  return Array.from(names);
}

/**
 * 依據行囊物品名稱尋找對應的來源卡牌 ID
 */
export function getCardIdByItemName(itemName: string): string | null {
  const cleanName = itemName.trim();
  const match = CARD_DATABASE.find((c) => {
    if (c.name === cleanName) return true;
    if (c.name.replace(/\s+/g, '') === cleanName) return true;
    return c.options?.some((opt) => opt.effect?.addItem === cleanName);
  });
  return match ? match.id : null;
}
