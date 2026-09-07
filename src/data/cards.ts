import { CardDefinition, GameState, MetaProgress } from '../types';

export const CARD_DATABASE: CardDefinition[] = [
  // ==========================================
  // 【時空三神卡 & 跨局關鍵神器】
  // ==========================================
  {
    id: 'C2001-01',
    name: '愛在西元前',
    album: '范特西',
    year: 2001,
    track: 1,
    type: '事件',
    maxDraws: 2,
    weight: 4,
    route: '通用',
    flavorText: '「古巴比倫王頒布了漢摩拉比法典，刻在黑色的玄武岩，距今已經三千七百多年……」狂暴的時空亂流撕扯著一切物質！',
    options: [
      {
        text: '肉身穿越回西元前',
        resultText: '身邊所有現代武器與物品在泥板歲月中化為塵埃！你只憑藉靈魂記憶重返最初的起點。',
        effect: {
          rewindRound: 1,
          clearItems: true,
        },
      },
      {
        text: '啟動【時光機】防護罩',
        require: { item: '時光機' },
        resultText: '時光機發出璀璨的護盾，將你牢牢固定在當前的時空節點，未被時空狂瀾捲走。',
        effect: {},
      },
    ],
  },
  {
    id: 'C2002-08',
    name: '回到過去',
    album: '八度空間',
    year: 2002,
    track: 8,
    type: '事件',
    maxDraws: 2,
    weight: 5,
    route: '通用',
    flavorText: '「想回到過去，試著讓故事繼續，至少不再讓妳離我而去……」孤單的音符化為逆流的光陰。',
    options: [
      {
        text: '順著旋律逆轉光陰',
        resultText: '身上的器物飄落時空長河，但你的心中保留了所有冒險的記憶與悔恨，重新回到第 1 回合！',
        effect: {
          rewindRound: 1,
          clearItems: true,
        },
      },
      {
        text: '憑藉【時光機】自主選擇',
        require: { item: '時光機' },
        resultText: '時光機懸浮運轉，你從容地撫平了時間裂痕，選擇繼續當前的冒險。',
        effect: {},
      },
    ],
  },
  {
    id: 'C2008-09',
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
        resultText: '你獲得了至高神器【時光機】！自此任何時空倒流皆由你自主定奪，甚至可主動回溯歲月。',
        effect: {
          addItem: '時光機',
          setFlag: { hasTimeMachine: true },
        },
      },
      {
        text: '立即發動時光機',
        resultText: '你握緊時光機操縱桿，帶著滿載的行囊與線索，毫髮無傷地重新回到第 1 回合！人生得以重啟！',
        effect: {
          addItem: '時光機',
          rewindRound: 1,
          clearItems: false,
        },
      },
    ],
  },
  {
    id: 'C2002-02',
    name: '半島鐵盒',
    album: '八度空間',
    year: 2002,
    track: 2,
    type: '物品',
    maxDraws: 1,
    weight: 3,
    route: '最偉大的作品',
    flavorText: '「這是一種可以把你的秘密都裝進去的盒子，永遠不會隨時光的流逝而丟失……」',
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
  {
    id: 'C2000-10',
    name: '反方向的鐘',
    album: 'Jay',
    year: 2000,
    track: 10,
    type: '物品',
    maxDraws: 1,
    weight: 0, // 只能從威廉古堡威廉二世處獲得
    route: '太陽之子',
    flavorText: '「穿梭時間的畫面的鐘，從反方向開始移動……」秒針逆轉，能抵禦一次死劫。',
    options: [
      {
        text: '慎重收下反方向的鐘',
        resultText: '獲得【反方向的鐘】！若不幸在決戰將軍時惜敗，可藉由此鐘回到第 29 回合重整旗鼓（最多 3 次機會）！',
        effect: {
          addItem: '反方向的鐘',
        },
      },
    ],
  },

  // ==========================================
  // 【《太陽之子》主線核心組件】
  // ==========================================
  {
    id: 'C2000-08',
    name: '印地安老斑鳩',
    album: 'Jay',
    year: 2000,
    track: 8,
    type: '遭遇',
    maxDraws: 30,
    weight: 18,
    route: '太陽之子',
    flavorText: '「印地安老斑鳩，腿短毛長，在仙人掌中飛揚跋扈地擋住去路，眼神桀驁不馴。」',
    options: [
      {
        text: '揮舞拳腳或兵器逼退老斑鳩',
        resultText: '老斑鳩怪叫數聲，撲騰著翅膀敗退！你獲得了印地安老斑鳩的認可標記。',
        effect: {
          addItem: '印地安老斑鳩',
          setFlag: { defeated_spotted_dove: true },
        },
      },
    ],
  },
  {
    id: 'C2001-04',
    name: '忍者',
    album: '范特西',
    year: 2001,
    track: 4,
    type: '遭遇',
    maxDraws: 1,
    weight: 8,
    route: '太陽之子',
    flavorText: '「居合斬！身穿黑衣的忍者無聲無息自陰影中掠出，手握手裏劍，眼神冷冽如冰。」',
    options: [
      {
        text: '正面迎擊忍者的暗器與影刀',
        resultText: '你識破了忍者的替身之術，雙方刀光交錯！忍者收刀鞠躬，化作一陣青煙散去，留下忍道信物。',
        effect: {
          addItem: '忍者',
          setFlag: { defeated_ninja: true },
        },
      },
    ],
  },
  {
    id: 'C2002-01',
    name: '半獸人',
    album: '八度空間',
    year: 2002,
    track: 1,
    type: '遭遇',
    maxDraws: 1,
    weight: 7,
    route: '太陽之子',
    flavorText: '「昏暗的石窟深處，粗重的咆哮迴盪，嗜血的半獸人正揮舞著沉重的石斧怒目而視！」',
    options: [
      {
        text: '以強悍戰意強行正面擊倒半獸人',
        resultText: '你以驚人的毅力壓制住半獸人的狂暴衝擊，重創巨獸！半獸人嘶吼倒地，你奪得戰魂印記。',
        effect: {
          addItem: '半獸人',
          setFlag: { defeated_orc: true },
        },
      },
    ],
  },
  {
    id: 'C2002-04',
    name: '龍拳',
    album: '八度空間',
    year: 2002,
    track: 4,
    type: '事件',
    maxDraws: 3,
    weight: 5,
    route: '太陽之子',
    condition: (state) => !state.inventory['龍戰騎士'],
    flavorText: '「以敦煌為圓心的東北東，這民族的海岸線像一隻弓，渴望著飛騰的宿命之龍！」',
    options: [
      {
        text: '「等待英雄我就是那條龍」',
        require: { character: '英雄' },
        resultText: '金色的龍影自你雙拳升騰而起！天地共鳴，宿命之戰已被引動！',
        effect: {
          setFlag: { dragon_awakened: true },
          forceNextCardId: 'C2008-01', // 強制下一回合遭遇龍戰騎士
        },
      },
      {
        text: '「我右拳打開了天化身為龍」',
        require: { notCharacter: '英雄' },
        resultText: '狂暴的龍魂湧入全身！你體內的潛能被徹底點燃，宿命之戰即將降臨！',
        effect: {
          setFlag: { dragon_awakened: true },
          forceNextCardId: 'C2008-01', // 強制下一回合遭遇龍戰騎士
        },
      },
      {
        text: '「將東方的日出調整了時空」',
        require: { notCharacter: '英雄' },
        resultText: '時空指針發生逆流偏轉，周遭景致急速褪色，你被吸入光陰漩渦！',
        effect: {
          forceNextCardId: 'C2002-08', // 強制遭遇 回到過去
        },
      },
      {
        text: '「我把天地拆封將長江水掏空」',
        require: { notCharacter: '英雄' },
        resultText: '天地反噬，浩蕩水氣潰散！你體力大幅透支，陷入沉重的心境深淵。',
        effect: {
          forceNextCardId: 'C2004-06', // 強制遭遇 擱淺
        },
      },
    ],
  },
  {
    id: 'C2008-01',
    name: '龍戰騎士',
    album: '魔杰座',
    year: 2008,
    track: 1,
    type: '遭遇',
    maxDraws: 2,
    weight: 3,
    route: '太陽之子',
    condition: (state) => !state.inventory['龍戰騎士'],
    flavorText: '「末日遠方戰火燃燒，龍戰騎士跨坐在機械巨龍之上，熾熱的龍息封鎖了一切退路。」',
    options: [
      {
        text: '「我已化身為龍，迎戰宿命！」揮動雙刀斬擊',
        require: { flag: 'dragon_awakened', flagValue: true, item: '雙刀' },
        resultText: '雙刀流星般交錯劈砍！龍戰騎士佩劍震顫，讚嘆道：「我認可你了，但你終會被將一軍！」你成功贏得龍戰騎士卡片！',
        effect: {
          removeItem: '雙刀',
          addItem: '龍戰騎士',
          setFlag: { defeated_dragon_knight: true },
        },
      },
      {
        text: '「我已化身為龍，迎戰宿命！」揮動雙截棍狂擊',
        require: { flag: 'dragon_awakened', flagValue: true, item: '雙截棍' },
        resultText: '雙截棍呼嘯破空，快如疾電！龍戰騎士單膝跪地，收起巨劍：「我認可你了，但你終會被將一軍！」你成功奪得龍戰騎士卡片！',
        effect: {
          removeItem: '雙截棍',
          addItem: '龍戰騎士',
          setFlag: { defeated_dragon_knight: true },
        },
      },
      {
        text: '英雄天威・降龍拔劍',
        require: { character: '英雄', flag: 'dragon_awakened', flagValue: true },
        resultText: '身為天命真龍，英雄雙掌平推硬生生接下巨龍衝擊！龍戰騎士動容折服，奉上專屬戰卡！',
        effect: {
          addItem: '龍戰騎士',
          setFlag: { defeated_dragon_knight: true },
        },
      },
      {
        text: '穿上【黑色毛衣】抵擋龍息並退走',
        require: { item: '黑色毛衣' },
        resultText: '黑色毛衣溫柔地化解了致命灼燒，你在煙塵中全身而退，但未能折服龍戰騎士。',
        effect: {
          removeItem: '黑色毛衣',
        },
      },
      {
        text: '正面迎戰機械巨龍',
        resultText: '龍戰騎士居高臨下冷冷凝視你：「你還不是宿命之人，退下吧！」勁風將你震退，無法獲得此卡。',
        effect: {},
      },
    ],
  },
  {
    id: 'C2004-07',
    name: '亂舞春秋',
    album: '七里香',
    year: 2004,
    track: 7,
    type: '事件',
    maxDraws: 1,
    weight: 100, // 滿足條件後必定進入抽卡池
    route: '太陽之子',
    condition: (state) =>
      Boolean(
        state.inventory['忍者'] &&
        state.inventory['印地安老斑鳩'] &&
        state.inventory['半獸人'] &&
        state.inventory['龍戰騎士'] &&
        !state.flags['chaos_era_triggered']
      ),
    flavorText: '「那場景千軍萬馬，刀光劍影，歷史的齒輪在此刻劇烈顛簸，戰國烽火跨越時空席捲而來！」',
    options: [
      {
        text: '踏入烽火長卷，啟動時代變革',
        resultText: '烽煙四起！天地時空在此定格，【亂舞春秋時代】正式降臨！',
        effect: {
          setFlag: { chaos_era_triggered: true, chaos_era_active: true },
          setMetaFlag: { next_game_chaos_era: true },
        },
      },
    ],
  },
  {
    id: 'C2002-10',
    name: '最後的戰役',
    album: '八度空間',
    year: 2002,
    track: 10,
    type: '事件',
    maxDraws: 1,
    weight: 100, // 亂舞春秋後每回合極高機率出現
    route: '太陽之子',
    condition: (state, meta) =>
      Boolean(
        (state.flags['chaos_era_active'] || meta.nextGameFlags['next_game_chaos_era']) &&
        !state.flags['ready_for_general']
      ),
    flavorText: '「機槍掃射聲中，戰友倒在身旁，你在硝煙瀰漫的戰壕中，接到了一封來自敵軍統帥的親筆決戰書……」',
    options: [
      {
        text: '拆開決戰信函，應戰將軍！',
        resultText: '決戰號角吹響！已鎖定第 30 回合終局對決，統帥【將軍】將在第 30 回合親自下場與你一局定乾坤！',
        effect: {
          addItem: '最後的戰役',
          setFlag: { ready_for_general: true },
        },
      },
    ],
  },
  {
    id: 'C2004-05',
    name: '將軍',
    album: '七里香',
    year: 2004,
    track: 5,
    type: '遭遇',
    maxDraws: 1,
    weight: 0, // 只能在第30回合強制遭遇
    route: '太陽之子',
    condition: (state) => state.round === 30 && Boolean(state.flags['ready_for_general']),
    flavorText: '「看我把客廳變成戰場！殘局楚河漢界，將軍端坐棋局對面，殺氣貫穿天地九重！」',
    options: [
      {
        text: '擺開陣勢，正式進入決戰棋局！',
        resultText: '將軍冷笑：「知道這局棋，你怎麼下才對？」進入八回合棋道死鬥！',
        effect: {
          setFlag: { in_boss_battle: true, boss_hp: 100, boss_step: 1 },
        },
      },
    ],
  },

  // ==========================================
  // 【《最偉大的作品》主線核心組件】
  // ==========================================
  {
    id: 'C2010-01',
    name: '跨時代',
    album: '跨時代',
    year: 2010,
    track: 1,
    type: '事件',
    maxDraws: 2,
    weight: 6,
    route: '最偉大的作品',
    flavorText: '「鐘逆時針而繞，惡菊對月而笑。黑色的披風獵獵作響，時代的巨輪呼嘯跨越……」',
    options: [
      {
        text: '「我謙卑安靜的於城堡下的晚禱」',
        resultText: '迷霧漸散，巍峨肅穆的哥德式黑色城堡巍然矗立在眼前！威廉古堡大門為你敞開！',
        effect: {
          setFlag: { castle_unlocked: true },
          forceNextCardId: 'C2001-08',
        },
      },
      {
        text: '「我跨越過世代如獸般的姿態」',
        resultText: '咆哮聲震碎夜空，野獸般的氣息呼嘯而來，驚動了嗜血的半獸人！',
        effect: {
          forceNextCardId: 'C2002-01',
        },
      },
      {
        text: '「我的樂器在環繞時代無法淘汰我霸氣的皇朝」',
        resultText: '悠揚深沉的琴聲響徹雲霄，你獲得了樂器【比較大的大提琴】！',
        effect: {
          addItem: '比較大的大提琴',
        },
      },
    ],
  },
  {
    id: 'C2001-08',
    name: '威廉古堡',
    album: '范特西',
    year: 2001,
    track: 8,
    type: '事件',
    maxDraws: 2,
    weight: 5,
    route: '最偉大的作品',
    flavorText: '「藤蔓爬滿了伯爵的墳墓，古堡深處傳來古怪的私語。四名各懷秘密的古堡人物正注視著你……」',
    options: [
      {
        text: '晉見威廉二世',
        require: { item: '床邊故事' },
        resultText: '你輕輕吟唱床邊故事，威廉二世沉沉睡去，你悄悄自他腰間取下了【反方向的鐘】！',
        effect: {
          removeItem: '床邊故事',
          addItem: '反方向的鐘',
          setFlag: { got_reversed_clock: true },
        },
      },
      {
        text: '向凱薩琳公主問安',
        resultText: '凱薩琳公主勃然大怒：「大膽！竟敢說本宮有公主病！」憤怒的魔法降臨，你被詛咒化身為【陽光宅男】！',
        effect: {
          changeCharacter: 'char_sunshine',
          addItem: '公主病',
        },
      },
      {
        text: '拜訪胖女巫',
        resultText: '胖女巫冷眼打量著你。若你已解鎖【詠物調】神曲，她將為你呈上失落的【時光機】；若無，則觸發時空亂流《愛在西元前》！',
        effect: {
          setFlag: { visited_witch: true },
        },
      },
      {
        text: '慰勞豬管家',
        require: { item: '療傷燒肉粽' },
        resultText: '熱騰騰的燒肉粽讓豬管家感動得熱淚盈眶，傷感地回憶起往事，贈予你泛黃的日記《琴傷》！',
        effect: {
          removeItem: '療傷燒肉粽',
          addItem: '琴傷',
        },
      },
      {
        text: '摸摸鼻子從古堡離開',
        resultText: '城堡裡的僕役與幽靈冷漠地看著你。沒有對應信物，你只能暫且退回迷霧之中。',
        effect: {},
      },
    ],
  },

  // ==========================================
  // 【四大 SS 專輯卡合成途徑】
  // ==========================================
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
        text: '融合【完美主義】+【我不配】+【超人不會飛】煉成 SS卡《杰倫》',
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

  // 《范特西》合成路徑
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
        text: '解構【爸我回來了】+【對不起】+【安靜】化作 SS卡《范特西》',
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

  // 喬克叔叔與《可愛女人》
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

  // 常用兵器與防具
  {
    id: 'C2001-09',
    name: '雙截棍',
    album: '范特西',
    year: 2001,
    track: 9,
    type: '物品',
    maxDraws: 3,
    weight: 12,
    route: '通用',
    flavorText: '「哼哼哈兮！東亞病夫的招牌已被我一腳踢開，帶著陽光般的炙熱剛猛。」',
    options: [
      {
        text: '拾起雙截棍掛在腰間',
        resultText: '獲得武器【雙截棍】！可於對手戰中充當猛烈攻擊手段。',
        effect: { addItem: '雙截棍', atkChange: 2 },
      },
    ],
  },
  {
    id: 'C2003-11',
    name: '雙刀',
    album: '葉惠美',
    year: 2003,
    track: 11,
    type: '物品',
    maxDraws: 3,
    weight: 10,
    route: '通用',
    flavorText: '「刀光閃爍，正義在此刻出鞘！快意恩仇的利刃。」',
    options: [
      {
        text: '拔起雙刀收入刀鞘',
        resultText: '獲得利刃【雙刀】！鋒芒畢露，對手防禦在其面前形同虛設。',
        effect: { addItem: '雙刀', atkChange: 3 },
      },
    ],
  },
  {
    id: 'C2005-04',
    name: '黑色毛衣',
    album: '11月的蕭邦',
    year: 2005,
    track: 4,
    type: '物品',
    maxDraws: 2,
    weight: 8,
    route: '通用',
    flavorText: '「一件黑色毛衣，兩個人的回憶……厚實的針織帶來了抵禦寒風的溫暖。」',
    options: [
      {
        text: '穿上黑色毛衣',
        resultText: '穿上【黑色毛衣】！能溫和地替你抵禦一次強大敵人的致命暴擊。',
        effect: { addItem: '黑色毛衣', hpChange: 5 },
      },
    ],
  },
  {
    id: 'C2007-06',
    name: '無雙',
    album: '我很忙',
    year: 2007,
    track: 6,
    type: '物品',
    maxDraws: 1,
    weight: 4,
    route: '太陽之子',
    flavorText: '「命格無雙，一騎當千！長戟劃破晚霞，唯我獨尊。」',
    options: [
      {
        text: '握住無雙戰意',
        resultText: '獲得神級兵魄【無雙】！若化身為英雄，將在最終將軍棋局爆發毀天滅地的終結技！',
        effect: { addItem: '無雙', atkChange: 5 },
      },
    ],
  },

  // 古堡NPC物品
  {
    id: 'C2016-01',
    name: '床邊故事',
    album: '周杰倫的床邊故事',
    year: 2016,
    track: 1,
    type: '物品',
    maxDraws: 2,
    weight: 7,
    route: '最偉大的作品',
    flavorText: '「從前從前，有座古堡，睡美人在等待輕柔的晚安吻……」',
    options: [
      {
        text: '收錄童話書卷',
        resultText: '獲得【床邊故事】！可使威廉二世入眠，盜取其守護的神器。',
        effect: { addItem: '床邊故事' },
      },
    ],
  },
  {
    id: 'C2011-04',
    name: '公主病',
    album: '驚嘆號',
    year: 2011,
    track: 4,
    type: '物品',
    maxDraws: 2,
    weight: 6,
    route: '周杰倫家庭',
    flavorText: '「說我愛你，要天天說；說我不美，你就死定了……」帶著嬌蠻與純真的魔法氣息。',
    options: [
      {
        text: '收藏這枚粉色任性信物',
        resultText: '獲得【公主病】！若是陽光宅男持有，血脈將受到純真共鳴，迎來終極進化！',
        effect: { addItem: '公主病' },
      },
    ],
  },
  {
    id: 'C2011-06',
    name: '療傷燒肉粽',
    album: '驚嘆號',
    year: 2011,
    track: 6,
    type: '物品',
    maxDraws: 2,
    weight: 7,
    route: '最偉大的作品',
    flavorText: '「香氣撲鼻的古早味燒肉粽，一口咬下，能撫慰受傷的心靈。」',
    options: [
      {
        text: '買下熱氣騰騰的燒肉粽',
        resultText: '獲得【療傷燒肉粽】！可用來餵食威廉古堡那位常常思鄉哀傷的豬管家。',
        effect: { addItem: '療傷燒肉粽' },
      },
    ],
  },
  {
    id: 'C2011-07',
    name: '琴傷',
    album: '驚嘆號',
    year: 2011,
    track: 7,
    type: '日記',
    maxDraws: 1,
    weight: 4,
    route: '通用',
    flavorText: '「海風把記憶吹得好遠，琴聲在波浪中漸漸哀愁……記錄著古堡管家前世秘密的樂譜日記。」',
    options: [
      {
        text: '將琴傷日記收納入劇情本中',
        resultText: '全域日記已解鎖篇章【琴傷】！局外劇情深度推進。',
        effect: { addItem: '琴傷' },
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

  // 奇遇 NPC 遭遇
  {
    id: 'C2010-07',
    name: '嘻哈空姐',
    album: '跨時代',
    year: 2010,
    track: 7,
    type: '遭遇',
    maxDraws: 2,
    weight: 7,
    route: '通用',
    flavorText: '「頭等艙內的優雅問候，嘻哈空姐遞來一杯香檳，微笑道出高空中的秘密。」',
    options: [
      {
        text: '向空姐請教《最偉大的作品》路線秘辛',
        resultText: '空姐低語道：「尋找城堡吧……威廉二世枕下的指針，能扭轉光陰；唯有四張SS傳世專輯合一，方能通往藝術巔峰。」',
        effect: { addItem: '空姐的提示' },
      },
    ],
  },
  {
    id: 'C2011-11',
    name: '超跑女神',
    album: '驚嘆號',
    year: 2011,
    track: 11,
    type: '遭遇',
    maxDraws: 2,
    weight: 7,
    route: '通用',
    flavorText: '「引擎咆哮，敞篷跑車疾馳而至，超跑女神摘下墨鏡，給予你銳利的審視。」',
    options: [
      {
        text: '向超跑女神請教《太陽之子》路線秘辛',
        resultText: '女神踩下油門笑言：「打倒四個對手只是開胃菜。若想攻克將軍，必須在第六回合沉住氣『不動作』，大招時更萬萬不可點擊『逃』！」',
        effect: { addItem: '超跑女神的提示' },
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
    weight: 7,
    route: '通用',
    flavorText: '「蔚藍深海中游動著美麗的倩影，美人魚浮出水面，歌聲如天籟般動聽。」',
    options: [
      {
        text: '向美人魚請教《周杰倫家庭》路線秘辛',
        resultText: '美人魚輕聲唱道：「親情是最溫暖的避風港……外婆的微笑、父母的叮嚀，當陽光宅男得到任性公主病的眷顧，真愛將化為女兒殿下降臨。」',
        effect: { addItem: '美人魚的提示' },
      },
    ],
  },

  // 雜項歌曲補齊（豐富30回合牌池）
  {
    id: 'C2003-03',
    name: '晴天',
    album: '葉惠美',
    year: 2003,
    track: 3,
    type: '事件',
    maxDraws: 3,
    weight: 12,
    route: '通用',
    flavorText: '「故事的小黃花，從出生那年就飄著……童年的紙飛機，現在終於飛回我手裡。」',
    options: [
      {
        text: '在操場邊迎風仰望晴空，回滿體力',
        resultText: '春風拂面，心情豁然開朗，體力獲得極大恢復！',
        effect: { hpChange: 10 },
      },
    ],
  },
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
        resultText: '你對蕭邦音樂精髓的領會更上一層樓，靈感暴漲！',
        effect: { atkChange: 2 },
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
        effect: { hpChange: 3 },
      },
      {
        text: '「讀完了依賴，我很快就離開」',
        resultText: '掙脫情感羈絆，轉身踏上新的旅程。',
        effect: {},
      },
    ],
  },
  {
    id: 'C2004-04',
    name: '外婆',
    album: '七里香',
    year: 2004,
    track: 4,
    type: '遭遇',
    maxDraws: 2,
    weight: 8,
    route: '周杰倫家庭',
    flavorText: '「今天是外婆的生日，外婆笑得像個天真的孩子……滿桌親手做的好菜透著樸實的溫暖。」',
    options: [
      {
        text: '陪外婆吃頓溫馨家常便飯',
        resultText: '外婆慈祥地撫摸著你的額頭，家庭親情進度大幅推進！',
        effect: { addItem: '外婆' },
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
    id: 'C2014-12',
    name: '聽見下雨的聲音',
    album: '哎呦，不錯哦',
    year: 2014,
    track: 12,
    type: '事件',
    maxDraws: 2,
    weight: 8,
    route: '周杰倫家庭',
    flavorText: '「竹籬上停留著蜻蜓，玻璃瓶裡插著小蔥，百葉窗折射著雨滴的思念……」',
    options: [
      {
        text: '在雨幕中聆聽雨滴滴落青石的聲音',
        resultText: '洗滌靈魂的雨聲，喚醒了心靈深處最純淨的記憶。',
        effect: { addItem: '聽見下雨的聲音' },
      },
    ],
  },

  // ==========================================
  // 【新擴充歌曲與物品資料庫】
  // ==========================================
  {
    id: 'C2012-06',
    name: '比較大的大提琴',
    album: '12新作',
    year: 2012,
    track: 6,
    type: '物品',
    maxDraws: 1,
    weight: 0, // 由《跨時代》選項C獲得，或特殊事件觸發
    route: '最偉大的作品',
    flavorText: '「小提琴在泰晤士河畔悲鳴，而這把龐大的低音大提琴，沉穩而霸氣地主宰了整座時代的旋律。」',
    options: [
      {
        text: '扛起巨型大提琴彈撥厚重的低音線',
        resultText: '低沉渾厚的共鳴震懾四方，生命力+10，攻擊力+3！',
        effect: { addItem: '比較大的大提琴', hpChange: 10, atkChange: 3 },
      },
    ],
  },
  {
    id: 'C2006-08',
    name: '白色風車',
    album: '依然范特西',
    year: 2006,
    track: 8,
    type: '物品',
    maxDraws: 3,
    weight: 3,
    route: '通用',
    flavorText: '「白色的風車，安靜地轉著，真實的感覺，夢境般遙遠……」',
    options: [
      {
        text: '在微風中收集隨風旋轉的風車碎片',
        resultText: '溫暖的微風拂去傷痛，生命力恢復 5 點！',
        effect: { addItem: '白色風車', hpChange: 5 },
      },
    ],
  },
  {
    id: 'C2010-04',
    name: '免費教學錄影帶',
    album: '跨時代',
    year: 2010,
    track: 4,
    type: '線索',
    maxDraws: 1,
    weight: 50,
    route: '通用',
    flavorText: '「要不要我用吉他教你點特別的？聽我的副歌，不用錢隨便學！」錄影帶在播放機中旋轉，浮現神祕技巧。',
    options: [
      {
        text: '按下播放鍵，觀看錄影帶的特別指導',
        resultText: '你掌握了周董獨門指法！角色欄位即刻顯現當前化身的特殊能力與隱藏特質！',
        effect: { addItem: '免費教學錄影帶' },
      },
    ],
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
        resultText: '浪漫氛圍湧上心頭，心境澄澈，生命力+8！',
        effect: { addItem: '告白氣球', hpChange: 8 },
      },
    ],
  },
  {
    id: 'C2002-09',
    name: '米蘭的小鐵匠',
    album: '八度空間',
    year: 2002,
    track: 9,
    type: '遭遇',
    maxDraws: 3,
    weight: 6,
    route: '通用',
    flavorText: '「米蘭的小鐵匠，為了買一把吉他，每天在鐵砧上揮汗如雨……」',
    options: [
      {
        text: '協助小鐵匠拉風箱打鐵，淬鍊兵器',
        resultText: '鐵匠感激你的幫忙，為你的武器打磨開鋒，攻擊力+3！',
        effect: { atkChange: 3 },
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
        resultText: '靜謐的夜色洗去了塵囂。若是【流浪詩人】化身，將在下一回合直接遭遇強者！',
        effect: {},
      },
    ],
  },
  {
    id: 'C2000-07',
    name: '伊斯坦堡',
    album: 'Jay',
    year: 2000,
    track: 7,
    type: '事件',
    maxDraws: 1,
    weight: 5,
    route: '通用',
    flavorText: '「走在伊斯坦堡的市集，旋轉的土耳其進行曲帶來了異域的芬芳……」',
    options: [
      {
        text: '品嚐土耳其冰淇淋，聆聽古老琴音',
        resultText: '悠揚的異國情調讓靈魂雀躍，生命力+6！',
        effect: { hpChange: 6 },
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
        resultText: '狂風淬鍊了意志，精神更為堅韌，攻擊力+2！',
        effect: { atkChange: 2 },
      },
    ],
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
        resultText: '最單純的快樂湧上心頭，生命力恢復滿值！',
        effect: { hpChange: 15 },
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
        resultText: '沉默孕育了堅忍，心神專注度提升，攻擊力+2！',
        effect: { atkChange: 2 },
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
        effect: { hpChange: 4, atkChange: 2 },
      },
    ],
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
        effect: { addItem: '《杰倫》', hpChange: 15, atkChange: 5 },
      },
    ],
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
        effect: { addItem: '《范特西》', hpChange: 15, atkChange: 5 },
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
        effect: { addItem: '《葉惠美》', hpChange: 20 },
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
        effect: { addItem: '《超時代》', hpChange: 10, atkChange: 5 },
      },
    ],
  },
];
