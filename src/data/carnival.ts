import { CardOption } from '../types';
import { CARD_DATABASE } from './cards';

export interface CarnivalStageData {
  stage: string;
  name: string;
  flavorText: string;
  options: CardOption[];
}

/**
 * 園遊會 (C2004-09) 多層分支狀態機資料庫 //已完成
 */
export function getCarnivalStageData(
  stage: string,
  _flags: Record<string, boolean | string | number> = {}
): CarnivalStageData {
  switch (stage) {
    case 'carnival_layer_2':
      return {
        stage: 'carnival_layer_2',
        name: '園遊會攤位',
        flavorText: '「我頂著大太陽，只想為妳撐傘。」多希望話題不斷園遊會永不打烊，人潮開始變多，也有各式各樣的攤位，歡笑聲不絕於耳。',
        options: [
          {
            text: '離開園遊會',
            resultText: '你穿過喧鬧的人潮，轉身離開了園遊會。',
            effect: {},
          },
          {
            text: '繼續逛園遊會',
            resultText: '',
            effect: {},
          },
        ],
      };

    case 'carnival_layer_3':
      return {
        stage: 'carnival_layer_3',
        name: '冰品攤位與小男孩',
        flavorText: '冰品攤位前，傳來老闆吆喝聲與遊客歡笑聲。攤位旁有個可愛的小男孩在人群中跑跑跳跳穿梭著。',
        options: [
          {
            text: '離開園遊會',
            resultText: '你沒有買任何東西，轉身離開了園遊會。',
            effect: {},
          },
          {
            text: '花費 3 枚金幣購買土耳其冰淇淋',
            resultText: '老闆幾番花式戲耍後，你接過了香濃黏稠的【土耳其冰淇淋】！隨後心滿意足地離開了園遊會。',
            require: { minCoins: 3, unavailableReason: '金幣不足（需 3 金幣）' },
            effect: { coinChange: -3, addItem: '土耳其冰淇淋' },
          },
          {
            text: '繼續逛園遊會',
            resultText: '',
            effect: {},
          },
          {
            text: '遇到小男孩，追上他',
            resultText: '',
            effect: {},
          },
        ],
      };

    case 'carnival_boy_ice':
      return {
        stage: 'carnival_boy_ice',
        name: '小男孩想吃冰',
        flavorText: '小男孩停下腳步，巴著大眼睛拉拉你的衣角：「那邊的冰淇淋看起來好好吃，我好想吃冰……」',
        options: [
          {
            text: '給他冰',
            resultText: '',
            require: { item: '土耳其冰淇淋', hideWhenUnavailable: true },
            effect: {},
          },
          {
            text: '沒有冰，回去買冰',
            resultText: '',
            effect: {},
          },
        ],
      };

    case 'carnival_boy_toy':
      return {
        stage: 'carnival_boy_toy',
        name: '小男孩想要玩具',
        flavorText: '小男孩吃完冰淇淋擦了擦嘴，開心地笑了，隨即又指著遠處的攤位：「我還想要玩具！那個轉啊轉的風車好漂亮！」',
        options: [
          {
            text: '給他玩具',
            resultText: '',
            require: { item: '白色風車', hideWhenUnavailable: true },
            effect: {},
          },
          {
            text: '沒有玩具，回去買玩具',
            resultText: '',
            effect: {},
          },
          {
            text: '抱怨他一直要東西',
            resultText: '你忍不住抱怨他怎麼一直討東西，小男孩卻大哭回嘴：「小氣鬼！小氣鬼！」，哭聲引起遊客注意，感到好頭痛！',
            effect: { forceNextCardId: 'C2012-03' },
          },
        ],
      };

    case 'carnival_boy_mv':
      return {
        stage: 'carnival_boy_mv',
        name: '小男孩想要拍MV',
        flavorText: '小男孩拿著風車手舞足蹈，時而擺出小巨星的帥氣架勢：「嗯～我很帥喔！幫我拍個帥氣MV！你有拍攝道具嗎？」',
        options: [
          {
            text: '給他拍攝道具',
            resultText: '你遞上夏威夷風情的烏克麗麗。小男孩興奮地跳起來，又說著：「準備好了嗎？要去兜風嗎？」，笑著感受這般園遊會奇遇！獲得【粉色海洋】！',
            require: { item: '烏克麗麗', hideWhenUnavailable: true },
            effect: { removeItem: '烏克麗麗', addItem: '粉色海洋' },
          },
          {
            text: '沒有道具，去找找',
            resultText: '你答應小男孩會替他尋找拍攝道具，揮了揮手轉身離開了園遊會。',
            effect: {},
          },
        ],
      };

    case 'carnival_layer_4':
      return {
        stage: 'carnival_layer_4',
        name: '玩具攤位',
        flavorText: '玩具攤位上掛滿了五顏六色的風車，你看著風車被風一吹發出沙沙輕響。小男孩的身影又在人群中閃過。',
        options: [
          {
            text: '離開園遊會',
            resultText: '你望著隨風轉動的風車，轉身離開了園遊會。',
            effect: {},
          },
          {
            text: '花費 3 枚金幣購買白色風車',
            resultText: '你花費 3 枚金幣挑選好看的【白色風車】，它安靜地轉著，你心滿意足地離開了園遊會。',
            require: { minCoins: 3, unavailableReason: '金幣不足（需 3 金幣）' },
            effect: { coinChange: -3, addItem: '白色風車' },
          },
          {
            text: '繼續逛園遊會',
            resultText: '',
            effect: {},
          },
          {
            text: '遇到小男孩，追上他',
            resultText: '',
            effect: {},
          },
        ],
      };

    case 'carnival_boy_chase_fail':
      return {
        stage: 'carnival_boy_chase_fail',
        name: '追不上小男孩追逐',
        flavorText: '小男孩在人群中靈巧地鑽來鑽去，你追得滿頭大汗卻怎麼也追不上！小男孩回頭看著你，吐著舌頭做鬼臉。',
        options: [
          {
            text: '抱怨他一直跑追不上',
            resultText: '你氣喘吁吁地抱怨他一直亂跑根本追不上，小男孩卻笑嘻嘻地嘲笑著你！被他戲弄真是感到頭痛！',
            effect: { forceNextCardId: 'C2012-03' },
          },
          {
            text: '不追了，返回玩具攤位',
            resultText: '',
            effect: {},
          },
        ],
      };

    case 'carnival_layer_5':
      return {
        stage: 'carnival_layer_5',
        name: '樂器攤位',
        flavorText: '漫步到園遊會深處，這裡有賣樂器的攤位，木吉他、烏克麗麗、小鼓應有盡有，有些畫面與音樂在你腦海中浮現。',
        options: [
          {
            text: '離開園遊會',
            resultText: '你閉上眼聽著悠揚的樂音，轉身離開了園遊會。',
            effect: {},
          },
          {
            text: '花費 3 枚金幣購買烏克麗麗',
            resultText: '你花費 3 枚金幣買下了一把夏威夷風情的【烏克麗麗】！心滿意足地離開了園遊會。',
            require: { minCoins: 3, unavailableReason: '金幣不足（需 3 金幣）' },
            effect: { coinChange: -3, addItem: '烏克麗麗' },
          },
          {
            text: '繼續逛園遊會',
            resultText: '',
            effect: {},
          },
        ],
      };

    case 'carnival_layer_1':
    default: {
      const baseCard = CARD_DATABASE.find((c) => c.id === 'C2004-09');
      return {
        stage: 'carnival_layer_1',
        name: '園遊會入口',
        flavorText: baseCard?.flavorText || '',
        options: baseCard?.options || [],
      };
    }
  }
}
