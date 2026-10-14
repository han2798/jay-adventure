import React, { useState } from 'react';

interface BlacksmithModalProps {
  inventory: Record<string, number>;
  onClose: () => void;
  onTrade: (
    type:
      | 'nunchucks_to_blades'
      | 'blades_to_nunchucks'
      | 'nunchucks_to_shovel'
      | 'craft_maltose'
      | 'trade_ukulele'
      | 'upgrade_clock'
      | 'upgrade_time_machine'
      | 'expand_iron_box'
  ) => boolean;
  ironBoxPages?: {
    firstPage?: boolean;
    sixthPage?: boolean;
    seventhPage?: boolean;
    preface?: boolean;
  };
}

export const BlacksmithModal: React.FC<BlacksmithModalProps> = ({
  inventory,
  onClose,
  onTrade,
  ironBoxPages,
}) => {
  const [activeTab, setActiveTab] = useState<'weapon' | 'food' | 'machine'>('weapon');
  const [notification, setNotification] = useState<{ type: 'success'; text: string } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<
    'craft_maltose' | 'trade_ukulele' | 'upgrade_clock' | 'upgrade_time_machine' | 'expand_iron_box' | null
  >(null);

  const nunchucksCount = inventory['雙截棍'] || 0;
  const bladesCount = inventory['雙刀'] || 0;
  const sweetCount = inventory['甜甜的'] || 0;
  const riceCount = inventory['稻香'] || 0;
  const ukuleleCount = inventory['烏克麗麗'] || 0;
  const clockCount = inventory['反方向的鐘'] || 0;
  const timeMachineCount = inventory['時光機'] || 0;
  const flightDiaryCount = inventory['愛的飛行日記'] || 0;
  const ironBoxCount = inventory['半島鐵盒'] || 0;
  const firstPageCount = inventory['第一頁'] || 0;
  const sixthPageCount = inventory['第六頁'] || 0;
  const seventhPageCount = inventory['第七頁'] || 0;
  const prefaceCount = inventory['序'] || 0;

  // 半島鐵盒嚴格順序擴充：第一頁 -> 第六頁 -> 第七頁 -> 序
  const pages = ironBoxPages || {};
  let nextStageName = '第一頁';
  let nextStageBonus = '+1 格容量';
  let hasRequiredNextPage = false;
  let isFullyUpgraded = false;

  const hasFirstPage = Boolean(pages.firstPage || (pages as any).page1 || (pages as any).first_page);
  const hasSixthPage = Boolean(pages.sixthPage || (pages as any).page6 || (pages as any).sixth_page);
  const hasSeventhPage = Boolean(pages.seventhPage || (pages as any).page7 || (pages as any).seventh_page);
  const hasPreface = Boolean(pages.preface);

  if (!hasFirstPage) {
    nextStageName = '第一頁';
    nextStageBonus = '+1 格容量';
    hasRequiredNextPage = firstPageCount >= 1;
  } else if (!hasSixthPage) {
    nextStageName = '第六頁';
    nextStageBonus = '+6 格容量';
    hasRequiredNextPage = sixthPageCount >= 1;
  } else if (!hasSeventhPage) {
    nextStageName = '第七頁';
    nextStageBonus = '+7 格容量';
    hasRequiredNextPage = seventhPageCount >= 1;
  } else if (!hasPreface) {
    nextStageName = '序';
    nextStageBonus = '啟動跨局繼承角色';
    hasRequiredNextPage = prefaceCount >= 1;
  } else {
    isFullyUpgraded = true;
  }

  const hasIronBox = ironBoxCount >= 1 || hasFirstPage || hasSixthPage || hasSeventhPage || hasPreface;
  const canExpandIronBox = hasIronBox && hasRequiredNextPage && !isFullyUpgraded;

  const handleAction = (
    type:
      | 'nunchucks_to_blades'
      | 'blades_to_nunchucks'
      | 'nunchucks_to_shovel'
      | 'craft_maltose'
      | 'trade_ukulele'
      | 'upgrade_clock'
      | 'upgrade_time_machine'
      | 'expand_iron_box',
    successText: string
  ) => {
    const ok = onTrade(type);
    if (ok) {
      setNotification({
        type: 'success',
        text: successText,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#141418] border-2 border-amber-600/70 rounded-2xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.9)] flex flex-col gap-5 text-stone-200 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">⚒️</span>
            <div>
              <h2 className="text-lg font-bold text-amber-200 font-serif">
                米蘭的小鐵鋪
              </h2>
              <p className="text-xs text-stone-400">
                「在寧靜鄉村路旁，一間小鐵鋪熱情為你打造！」
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-100 p-1.5 rounded-lg hover:bg-stone-800/60 transition-colors text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex rounded-xl bg-stone-900/80 p-1 border border-stone-800 gap-1">
          <button
            onClick={() => {
              setActiveTab('weapon');
              setNotification(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'weapon'
                ? 'bg-amber-600 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            ⚔️ 改造武器
          </button>
          <button
            onClick={() => {
              setActiveTab('food');
              setNotification(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'food'
                ? 'bg-amber-600 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            🍲 製作與交換
          </button>
          <button
            onClick={() => {
              setActiveTab('machine');
              setNotification(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'machine'
                ? 'bg-amber-600 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            ⚙️ 改造物品
          </button>
        </div>

        {/* Success Feedback Notification Banner */}
        {notification && (
          <div className="p-3 rounded-xl text-xs font-sans leading-relaxed flex items-center justify-between gap-2 animate-in fade-in duration-150 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300">
            <span>{notification.text}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-xs opacity-70 hover:opacity-100 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tab 1: 改造武器 */}
        {activeTab === 'weapon' && (
          <div className="flex flex-col gap-3">
            {/* 選擇 1: 雙截棍*2 -> 雙刀 */}
            <div className="bg-[#1b1a1f] border border-stone-800 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-amber-100">
                  重鑄改造：【雙截棍 × 2】➔ 【雙刀 × 1】
                </span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                熊熊爐火，合適的兩把鈍器，能重新鍛造成鋒芒畢露的利刃
              </p>
              <div className="flex justify-end pt-1">
                <button
                  disabled={nunchucksCount < 2}
                  onClick={() =>
                    handleAction(
                      'nunchucks_to_blades',
                      '改造成功！已消耗 2 把【雙截棍】，改造成 1 把【雙刀】！'
                    )
                  }
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                    nunchucksCount >= 2
                      ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 cursor-pointer'
                      : 'bg-stone-900/60 text-stone-600 border border-stone-800/80 cursor-not-allowed opacity-45 pointer-events-none'
                  }`}
                >
                  選擇改造（雙截棍 ➔ 雙刀）
                </button>
              </div>
            </div>

            {/* 選擇 2: 雙刀 -> 雙截棍*2 */}
            <div className="bg-[#1b1a1f] border border-stone-800 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-amber-100">
                  拆解改造：【雙刀 × 1】➔ 【雙截棍 × 2】
                </span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                若是將利刃重新拆解後銜接，便能成為揮灑自如的靈活兵器
              </p>
              <div className="flex justify-end pt-1">
                <button
                  disabled={bladesCount < 1}
                  onClick={() =>
                    handleAction(
                      'blades_to_nunchucks',
                      '改造成功！已消耗 1 把【雙刀】，改造成 2 把【雙截棍】！'
                    )
                  }
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                    bladesCount >= 1
                      ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 cursor-pointer'
                      : 'bg-stone-900/60 text-stone-600 border border-stone-800/80 cursor-not-allowed opacity-45 pointer-events-none'
                  }`}
                >
                  選擇改造（雙刀 ➔ 雙截棍）
                </button>
              </div>
            </div>

            {/* 選擇 3: 雙截棍*1 -> 鐵鏟*1 */}
            <div className="bg-[#1b1a1f] border border-stone-800 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-amber-100">
                  重鑄改造：【雙截棍 x 1】→【鐵鏟 x 1】
                </span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                熊熊爐火，武器也能重新鍛造成合適的工具
              </p>
              <div className="flex justify-end pt-1">
                <button
                  disabled={nunchucksCount < 1}
                  onClick={() =>
                    handleAction(
                      'nunchucks_to_shovel',
                      '改造成功！已消耗 1 把【雙截棍】，改造成 1 把【鐵鏟】！'
                    )
                  }
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                    nunchucksCount >= 1
                      ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 cursor-pointer'
                      : 'bg-stone-900/60 text-stone-600 border border-stone-800/80 cursor-not-allowed opacity-45 pointer-events-none'
                  }`}
                >
                  選擇改造（雙截棍 ➔ 鐵鏟）
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: 製作食物 */}
        {activeTab === 'food' && (
          <div className="flex flex-col gap-3">
            {/* 選擇 1: 甜甜的 + 稻香 -> 麥芽糖 */}
            <div className="bg-[#1b1a1f] border border-stone-800 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-amber-100">
                  慢火熬製：【原物料】+【調味】➔ 【甜甜的糖】
                </span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                金黃稻麥濃郁香氣與鮮甜滋味，在溫火中細細慢熬，能做出誰都愛吃的甜點
              </p>
              <div className="flex justify-end pt-1">
                <button
                  disabled={sweetCount < 1 || riceCount < 1}
                  onClick={() => setConfirmDialog('craft_maltose')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                    sweetCount >= 1 && riceCount >= 1
                      ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 cursor-pointer'
                      : 'bg-stone-900/60 text-stone-600 border border-stone-800/80 cursor-not-allowed opacity-45 pointer-events-none'
                  }`}
                >
                  選擇熬製成糖
                </button>
              </div>
            </div>

            {/* 選擇 2: 烏克麗麗 -> 療傷燒肉粽 */}
            <div className="bg-[#1b1a1f] border border-stone-800 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-amber-100">
                  小鐵匠的心願：【心中最想要的東西】
                </span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                小鐵匠一直渴望能有一把隨興彈唱的樂器，請替他圓夢，贈予給他
              </p>
              <div className="flex justify-end pt-1">
                <button
                  disabled={ukuleleCount < 1}
                  onClick={() => setConfirmDialog('trade_ukulele')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                    ukuleleCount >= 1
                      ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 cursor-pointer'
                      : 'bg-stone-900/60 text-stone-600 border border-stone-800/80 cursor-not-allowed opacity-45 pointer-events-none'
                  }`}
                >
                  贈予小鐵匠
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: 改造機械 */}
        {activeTab === 'machine' && (
          <div className="flex flex-col gap-3">
            {/* 選擇 1: 反方向的鐘 -> 大笨鐘 */}
            <div className="bg-[#1b1a1f] border border-stone-800 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-amber-100">
                  重鑄鐘錶
                </span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                用不到的逆轉時光之物，就給小鐵匠重新鑄造看看吧……
              </p>
              <div className="flex justify-end pt-1">
                <button
                  disabled={clockCount < 1}
                  onClick={() => setConfirmDialog('upgrade_clock')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                    clockCount >= 1
                      ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 cursor-pointer'
                      : 'bg-stone-900/60 text-stone-600 border border-stone-800/80 cursor-not-allowed opacity-45 pointer-events-none'
                  }`}
                >
                  選擇重鑄鐘表
                </button>
              </div>
            </div>

            {/* 選擇 2: 時光機 + 愛的飛行日記 -> 飛行時光機 */}
            <div className="bg-[#1b1a1f] border border-stone-800 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-amber-100">
                  扭轉時空神器：【時光機】還能升級？
                </span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                記錄著飛越穿梭的日記，小鐵匠的鬼斧神工，能將其融入時光機器，或許能有更強大的功能產生
              </p>
              <div className="flex justify-end pt-1">
                <button
                  disabled={timeMachineCount < 1 || flightDiaryCount < 1}
                  onClick={() => setConfirmDialog('upgrade_time_machine')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                    timeMachineCount >= 1 && flightDiaryCount >= 1
                      ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 cursor-pointer'
                      : 'bg-stone-900/60 text-stone-600 border border-stone-800/80 cursor-not-allowed opacity-45 pointer-events-none'
                  }`}
                >
                  選擇改造時光機
                </button>
              </div>
            </div>

            {/* 選擇 3: 擴充半島鐵盒 */}
            <div className="bg-[#1b1a1f] border border-stone-800 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-amber-100">
                  封存物品的格子不夠？功能太少嗎？
                </span>
                {canExpandIronBox && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-600/40 px-2 py-0.5 rounded font-mono font-bold">
                    可擴充
                  </span>
                )}
                {isFullyUpgraded && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-600/40 px-2 py-0.5 rounded font-mono font-bold">
                    已完全擴充
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                是否有挖到能擴充跨局神器的東西？
              </p>
              <div className="flex justify-end pt-1">
                <button
                  disabled={!canExpandIronBox}
                  onClick={() => setConfirmDialog('expand_iron_box')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                    canExpandIronBox
                      ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 cursor-pointer'
                      : 'bg-stone-900/60 text-stone-600 border border-stone-800/80 cursor-not-allowed opacity-45 pointer-events-none'
                  }`}
                  title={
                    !canExpandIronBox
                      ? ironBoxCount < 1
                        ? '未持有【半島鐵盒】'
                        : isFullyUpgraded
                        ? '半島鐵盒已達最高擴充上限'
                        : `當前順位需先取得並裝訂【${nextStageName}】`
                      : `點擊裝訂【${nextStageName}】擴充鐵盒`
                  }
                >
                  {isFullyUpgraded ? '已完全擴充' : '選擇擴充'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-stone-800">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            關閉小鐵鋪
          </button>
        </div>
      </div>

      {/* 慢火熬製麥芽糖確認視窗 */}
      {confirmDialog === 'craft_maltose' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#141418] border-2 border-amber-500/70 rounded-2xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.9)] flex flex-col gap-4 text-stone-200 font-sans">
            <div className="flex items-center gap-2.5 border-b border-stone-800 pb-3">
              <span className="text-2xl">🍯</span>
              <div>
                <h3 className="text-lg font-bold text-amber-200 font-serif">
                  ✦ 慢火熬製・麥芽糖 ✦
                </h3>
                <p className="text-xs text-stone-400">
                  米蘭的小鐵鋪・製作食物
                </p>
              </div>
            </div>

            <p className="text-base text-stone-300 leading-relaxed">
              你身上正備齊【甜甜的】與【稻香】！
              <br />
              是否讓小鐵匠慢火熬製成香甜可口的【麥芽糖】？
            </p>

            <div className="bg-amber-950/30 border border-amber-600/40 rounded-xl p-3 text-xs text-amber-200/90 leading-relaxed">
              💡 <span className="font-bold">製作說明：</span>
              消耗【甜甜的】× 1 與【稻香】× 1，熬製出【麥芽糖】。
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmDialog(null)}
                className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                暫不熬製
              </button>
              <button
                onClick={() => {
                  setConfirmDialog(null);
                  handleAction(
                    'craft_maltose',
                    '熬製成功！消耗【甜甜的】與【稻香】，獲得香甜黏手的【麥芽糖】！'
                  );
                }}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer hover:scale-102 active:scale-98"
              >
                確認製作
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 小鐵匠心願：烏克麗麗交換燒肉粽確認視窗 */}
      {confirmDialog === 'trade_ukulele' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#141418] border-2 border-amber-500/70 rounded-2xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.9)] flex flex-col gap-4 text-stone-200 font-sans">
            <div className="flex items-center gap-2.5 border-b border-stone-800 pb-3">
              <span className="text-2xl">🎸</span>
              <div>
                <h3 className="text-lg font-bold text-amber-200 font-serif">
                  ✦ 小鐵匠的心願・一把吉他 ✦
                </h3>
                <p className="text-xs text-stone-400">
                  米蘭的小鐵鋪・小鐵匠的心願
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
                onClick={() => setConfirmDialog(null)}
                className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                保留【烏克麗麗】
              </button>
              <button
                onClick={() => {
                  setConfirmDialog(null);
                  handleAction(
                    'trade_ukulele',
                    '交換成功！贈予【烏克麗麗】，獲得熱氣騰騰的【療傷燒肉粽】！'
                  );
                }}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer hover:scale-102 active:scale-98"
              >
                確認交換
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 重鑄鐘錶：反方向的鐘改造成大笨鐘確認視窗 */}
      {confirmDialog === 'upgrade_clock' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#141418] border-2 border-amber-500/70 rounded-2xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.9)] flex flex-col gap-4 text-stone-200 font-sans">
            <div className="flex items-center gap-2.5 border-b border-stone-800 pb-3">
              <span className="text-2xl">🕰️</span>
              <div>
                <h3 className="text-lg font-bold text-amber-200 font-serif">
                  ✦ 重鑄鐘錶・大笨鐘 ✦
                </h3>
                <p className="text-xs text-stone-400">
                  米蘭的小鐵鋪・改造鐘錶
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
              消耗【反方向的鐘】× 1，重鑄改造成【大笨鐘】。
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmDialog(null)}
                className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                暫不改造
              </button>
              <button
                onClick={() => {
                  setConfirmDialog(null);
                  handleAction(
                    'upgrade_clock',
                    '改造成功！消耗【反方向的鐘】，成功改造成【大笨鐘】！'
                  );
                }}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer hover:scale-102 active:scale-98"
              >
                確認改造
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 強化時光機確認視窗 */}
      {confirmDialog === 'upgrade_time_machine' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#141418] border-2 border-amber-500/70 rounded-2xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.9)] flex flex-col gap-4 text-stone-200 font-sans">
            <div className="flex items-center gap-2.5 border-b border-stone-800 pb-3">
              <span className="text-2xl">🚀</span>
              <div>
                <h3 className="text-lg font-bold text-amber-200 font-serif">
                  ✦ 強化時光機・飛行時光機 ✦
                </h3>
                <p className="text-xs text-stone-400">
                  米蘭的小鐵鋪・強化機械
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
                onClick={() => setConfirmDialog(null)}
                className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                暫不強化
              </button>
              <button
                onClick={() => {
                  setConfirmDialog(null);
                  handleAction(
                    'upgrade_time_machine',
                    '改造成功！融合【時光機】與【愛的飛行日記】，成功強化為【飛行時光機】！'
                  );
                }}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer hover:scale-102 active:scale-98"
              >
                確認強化
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 擴充半島鐵盒確認視窗 */}
      {confirmDialog === 'expand_iron_box' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#141418] border-2 border-amber-500/70 rounded-2xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.9)] flex flex-col gap-4 text-stone-200 font-sans">
            <div className="flex items-center gap-2.5 border-b border-stone-800 pb-3">
              <span className="text-2xl">📻</span>
              <div>
                <h3 className="text-lg font-bold text-amber-200 font-serif">
                  ✦ 擴充跨局神器・半島鐵盒 ✦
                </h3>
                <p className="text-xs text-stone-400">
                  米蘭的小鐵鋪・改造物品
                </p>
              </div>
            </div>

            <p className="text-base text-stone-300 leading-relaxed">
              小鐵匠接過你的【半島鐵盒】與挖掘出的泛黃頁籤：
              <br />
              是否將持有的頁籤融入半島鐵盒中進行擴充？
            </p>

            <div className="bg-amber-950/30 border border-amber-600/40 rounded-xl p-3 text-xs text-amber-200/90 leading-relaxed space-y-2">
              <div className="font-bold text-amber-300">📦 本次裝訂擴充頁籤：</div>
              <div className="space-y-1.5 pl-1">
                {firstPageCount > 0 && (
                  <div className="flex items-center justify-between text-cyan-300 bg-cyan-950/40 px-2 py-1 rounded border border-cyan-800/40">
                    <span className="flex items-center gap-1.5">
                      <span>📑</span>
                      <span className="font-bold">【第一頁】</span>
                    </span>
                    <span className="font-mono text-cyan-200">擴充鐵盒容量 +1 格</span>
                  </div>
                )}
                {sixthPageCount > 0 && (
                  <div className="flex items-center justify-between text-indigo-300 bg-indigo-950/40 px-2 py-1 rounded border border-indigo-800/40">
                    <span className="flex items-center gap-1.5">
                      <span>📑</span>
                      <span className="font-bold">【第六頁】</span>
                    </span>
                    <span className="font-mono text-indigo-200">擴充鐵盒容量 +6 格</span>
                  </div>
                )}
                {seventhPageCount > 0 && (
                  <div className="flex items-center justify-between text-purple-300 bg-purple-950/40 px-2 py-1 rounded border border-purple-800/40">
                    <span className="flex items-center gap-1.5">
                      <span>📑</span>
                      <span className="font-bold">【第七頁】</span>
                    </span>
                    <span className="font-mono text-purple-200">擴充鐵盒容量 +7 格</span>
                  </div>
                )}
                {prefaceCount > 0 && (
                  <div className="flex items-center justify-between text-yellow-300 bg-yellow-950/40 px-2 py-1 rounded border border-yellow-700/50 font-bold">
                    <span className="flex items-center gap-1.5">
                      <span>📖</span>
                      <span>【序】</span>
                    </span>
                    <span className="text-yellow-200 text-[11px]">啟動跨局「繼承角色化身」</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmDialog(null)}
                className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                暫不擴充
              </button>
              <button
                onClick={() => {
                  setConfirmDialog(null);
                  handleAction(
                    'expand_iron_box',
                    '擴充成功！小鐵匠以純熟工藝將頁籤裝訂鍛造入半島鐵盒，容量與能力大幅躍升！'
                  );
                }}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer hover:scale-102 active:scale-98"
              >
                確認擴充
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
