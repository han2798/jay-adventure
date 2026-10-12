import React, { useState, useEffect } from 'react';

interface RomanticPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: Record<string, number>;
  characterName: string;
  hasCipher: boolean; // 是否持有【暗號】(C2002-03)
  hasBigBen: boolean; // 是否持有【大笨鐘】(C2012-10)
  hasStarryMood: boolean; // 是否持有【星晴】(C2000-03)
  hasIstanbul: boolean; // 是否持有【伊斯坦堡】(C2000-07)
  alreadyHasPastLover: boolean; // 是否已獲得【前世情人】(C2016-04)
  onCompleteLoverTrial: () => void;
}

type PhoneScreenMode =
  | 'DIAL' // 撥號輸入畫面
  | 'CONTACTS' // 電話簿切換
  | 'CALLING' // 撥號中
  | 'PAST_CONNECTED_NO_SOUND' // 附圖四第1階段：接通，前世答聲，但聽不到
  | 'STATIC_NOISE' // 附圖四第2階段：搜尋不到（雜訊太多，停止收訊號）
  | 'NOT_MAGICIAN' // 角色非魔術先生警告
  | 'TRIAL' // 魔術先生雙槽考驗
  | 'ALREADY_COMPLETED' // 已完成前世情人的考驗
  | 'WRONG_NUMBER' // 撥錯號碼
  | 'PROMPT_DIAL_CIPHER'; // 附圖三：電話簿選取撥往前世按通話，提示「請撥打0000」

export const RomanticPhoneModal: React.FC<RomanticPhoneModalProps> = ({
  isOpen,
  onClose,
  inventory,
  characterName,
  hasCipher,
  hasBigBen,
  hasStarryMood,
  hasIstanbul,
  alreadyHasPastLover,
  onCompleteLoverTrial,
}) => {
  const [screenMode, setScreenMode] = useState<PhoneScreenMode>('DIAL');
  const [inputDigits, setInputDigits] = useState<string>('');
  const [selectedContactIndex, setSelectedContactIndex] = useState<number>(0);

  // 雙槽考驗狀態
  const [slot1Item, setSlot1Item] = useState<string | null>(null); // 第一欄：星晴
  const [slot2Item, setSlot2Item] = useState<string | null>(null); // 第二欄：伊斯坦堡
  const [trialError, setTrialError] = useState<string | null>(null);

  // 監聽鍵盤 ESC 關閉
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 重置狀態
  useEffect(() => {
    if (isOpen) {
      setScreenMode('DIAL');
      setInputDigits('');
      setSelectedContactIndex(0);
      setSlot1Item(null);
      setSlot2Item(null);
      setTrialError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 電話簿聯絡人清單：抽到暗號才插入《撥往前世》，抽到湘女多情才插入《打給今生》
  const dynamicContacts: Array<{ name: string; number: string; available: boolean }> = [];
  if (hasCipher) {
    dynamicContacts.push({
      name: '《撥往前世》',
      number: hasBigBen ? '1111' : '0000',
      available: true,
    });
  }
  if (Boolean(inventory['湘女多情'])) {
    dynamicContacts.push({
      name: '《打給今生》',
      number: '????',
      available: true,
    });
  }

  // 按下數字鍵
  const handlePressDigit = (d: string) => {
    if (screenMode !== 'DIAL') {
      setScreenMode('DIAL');
    }
    if (inputDigits.length < 8) {
      setInputDigits((prev) => prev + d);
    }
  };

  // 刪除/返回鍵 (C) - 只要不是在DIAL首頁輸入狀態，按下立刻返回DIAL首頁；DIAL有字則退格
  const handleClear = () => {
    if (screenMode !== 'DIAL') {
      setScreenMode('DIAL');
      setInputDigits('');
    } else {
      if (inputDigits.length > 0) {
        setInputDigits((prev) => prev.slice(0, -1));
      }
    }
  };

  // 上下切換鍵（支援電話簿聯絡人切換 ＆ 0000 兩階段通話上下頁手動翻頁）
  const handleScrollUp = () => {
    if (screenMode === 'STATIC_NOISE') {
      // 點上頁切回第 1 階段「接通，前世答聲，但聽不到」
      setScreenMode('PAST_CONNECTED_NO_SOUND');
    } else if (screenMode === 'PAST_CONNECTED_NO_SOUND') {
      // 在第 1 階段按上鍵無其他前頁，保持
    } else if (screenMode !== 'CONTACTS') {
      setScreenMode('CONTACTS');
      setSelectedContactIndex(0);
    } else if (dynamicContacts.length > 0) {
      setSelectedContactIndex((prev) => (prev > 0 ? prev - 1 : dynamicContacts.length - 1));
    }
  };

  const handleScrollDown = () => {
    if (screenMode === 'PAST_CONNECTED_NO_SOUND') {
      // 點下頁切換至第 2 階段「搜尋不到（停止收訊號）」
      setScreenMode('STATIC_NOISE');
    } else if (screenMode === 'STATIC_NOISE') {
      // 在第 2 階段按下鍵無其他次頁，保持
    } else if (screenMode !== 'CONTACTS') {
      setScreenMode('CONTACTS');
      setSelectedContactIndex(0);
    } else if (dynamicContacts.length > 0) {
      setSelectedContactIndex((prev) => (prev < dynamicContacts.length - 1 ? prev + 1 : 0));
    }
  };

  // 按下綠色通話鍵撥號
  const handleCall = () => {
    // 附圖三：若在電話簿選取《撥往前世》，無法直接按通話鍵撥出，跳轉資訊為「請撥打0000」，必須在鍵盤按下0000才能撥出
    if (screenMode === 'CONTACTS') {
      if (dynamicContacts.length > 0) {
        const curContact = dynamicContacts[selectedContactIndex];
        if (curContact && curContact.name === '《撥往前世》') {
          setScreenMode('PROMPT_DIAL_CIPHER');
          return;
        } else if (curContact && curContact.name === '《打給今生》') {
          setScreenMode('WRONG_NUMBER');
          return;
        }
      } else {
        setScreenMode('WRONG_NUMBER');
        return;
      }
    }

    const targetNum = inputDigits.trim();
    if (!targetNum) return;

    setScreenMode('CALLING');

    setTimeout(() => {
      // 撥出 0000 給前世（需持有暗號）：進入第 1 階段，由玩家按 ▲/▼ 手動切換
      if (targetNum === '0000') {
        if (hasCipher) {
          setScreenMode('PAST_CONNECTED_NO_SOUND');
        } else {
          setScreenMode('WRONG_NUMBER');
        }
      }
      // 1111 修正號碼：大笨鐘指引接通前世情人
      else if (targetNum === '1111') {
        if (hasCipher) {
          // 若已經完成過前世情人的考驗（已持有卡牌），不再進入選擇物品，而是提示已完成
          if (alreadyHasPastLover || Boolean(inventory['前世情人'])) {
            setScreenMode('ALREADY_COMPLETED');
          } else if (characterName === '魔術先生') {
            setScreenMode('TRIAL');
          } else {
            setScreenMode('NOT_MAGICIAN');
          }
        } else {
          setScreenMode('WRONG_NUMBER');
        }
      } else {
        setScreenMode('WRONG_NUMBER');
      }
    }, 600);
  };

  // 僅限拖曳放入第一槽
  const handleDropSlot1 = (e: React.DragEvent) => {
    e.preventDefault();
    const itemName = e.dataTransfer.getData('text/plain');
    if (itemName === '星晴') {
      setSlot1Item('星晴');
      setTrialError(null);
    } else {
      setTrialError('放置之物與誓約不符！');
    }
  };

  // 僅限拖曳放入第二槽
  const handleDropSlot2 = (e: React.DragEvent) => {
    e.preventDefault();
    const itemName = e.dataTransfer.getData('text/plain');
    if (itemName === '伊斯坦堡') {
      setSlot2Item('伊斯坦堡');
      setTrialError(null);
    } else {
      setTrialError('放置之物與誓約不符！');
    }
  };

  // 提交考驗
  const handleConfirmTrial = () => {
    if (slot1Item === '星晴' && slot2Item === '伊斯坦堡') {
      onCompleteLoverTrial();
      onClose();
    } else {
      setTrialError('考驗信物未齊！需將信物拖曳放入兩個欄位中。');
    }
  };

  // 取出行囊中的物品清單供拖曳
  const heldItems = Object.keys(inventory).filter((name) => (inventory[name] || 0) > 0);

  // 若處於 TRIAL 模式，移除底部 3×4 數字鍵盤，做成半隻手機造型
  const isTrialMode = screenMode === 'TRIAL';

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* 雙欄主容器：左側手機 + 右側隨伴行囊 */}
      <div className="relative flex flex-col md:flex-row items-center justify-center gap-5 max-w-4xl w-full max-h-[95vh] overflow-y-auto p-2">
        
        {/* 手機外殼造型 - 移除品牌名稱 */}
        <div
          className={`relative w-full max-w-[340px] bg-gradient-to-b from-[#2a2c33] via-[#1e2026] to-[#121317] border-4 border-[#434753] shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_25px_rgba(100,116,139,0.2)] p-5 flex flex-col items-center shrink-0 transition-all ${
            isTrialMode ? 'rounded-[32px]' : 'rounded-[42px]'
          }`}
        >
          {/* 聽筒孔 */}
          <div className="w-12 h-1.5 bg-[#0f1013] rounded-full mb-3.5 shadow-inner border border-stone-700/50" />

          {/* 液晶螢幕外框 */}
          <div className="w-full bg-[#343a46] rounded-2xl p-2.5 border-2 border-[#1c1e24] shadow-inner mb-4">
            {/* 綠色復古單色 LCD 螢幕 - 尺寸剛好塞滿，絕不出現捲軸 (overflow-hidden) */}
            <div className="w-full h-[196px] bg-[#9eb68a] rounded-lg border-2 border-[#768a64] shadow-inner p-2.5 flex flex-col justify-between text-[#1d2715] font-mono select-none overflow-hidden relative">
              
              {/* 螢幕頂部狀態列 */}
              <div className="flex items-center justify-between text-[11px] font-bold border-b border-[#768a64]/60 pb-1 shrink-0">
                <span>📶 訊號良好</span>
                <span>🔋 滿電</span>
              </div>

              {/* 螢幕核心內容切換 (flex-1 完全置中塞滿，無捲軸) */}
              <div className="flex-1 flex flex-col justify-center items-center text-center w-full px-1 overflow-hidden">
                {/* 1. 手機初始畫面 */}
                {screenMode === 'DIAL' && (
                  <div className="w-full space-y-1.5">
                    <div className="text-sm font-bold text-[#1a2413]">請輸入號碼 / 按通話鍵</div>
                    <div className="text-3xl font-black tracking-widest h-9 flex items-center justify-center font-mono text-[#0e170a]">
                      {inputDigits || '____'}
                    </div>
                    <div className="text-xs text-[#2c3a21] font-medium">
                      提示：按▲▼切換電話簿
                    </div>
                  </div>
                )}

                {/* 電話簿切換畫面 */}
                {screenMode === 'CONTACTS' && (
                  <div className="w-full text-left space-y-1 text-xs">
                    <div className="text-[11px] text-center font-bold border-b border-[#768a64]/40 pb-0.5 mb-1">
                      📖 電話簿 ({dynamicContacts.length > 0 ? `${selectedContactIndex + 1}/${dynamicContacts.length}` : '0/0'})
                    </div>
                    {dynamicContacts.length === 0 ? (
                      <div className="text-center py-2 space-y-1">
                        <div className="text-sm font-black text-[#1a2413]">（查無此人）</div>
                        <div className="text-[10px] text-[#2f3d24] leading-tight">
                          目前電話簿尚無任何已記錄之聯絡人
                        </div>
                      </div>
                    ) : (
                      dynamicContacts.map((c, idx) => (
                        <div
                          key={idx}
                          className={`px-2 py-1.5 rounded flex justify-between items-center ${
                            selectedContactIndex === idx
                              ? 'bg-[#768a64] text-[#f4fbf0] font-black'
                              : 'text-[#202b17]'
                          }`}
                        >
                          <span className="font-bold text-xs">{c.name}</span>
                          <span className="font-mono text-xs">{c.number}</span>
                        </div>
                      ))
                    )}
                    <div className="text-[10px] text-center pt-1 text-[#334227]">
                      按通話鍵查看 / 按C退出
                    </div>
                  </div>
                )}

                {/* 點選《撥往前世》通話鍵後提示請撥打號碼 */}
                {screenMode === 'PROMPT_DIAL_CIPHER' && (
                  <div className="w-full space-y-1.5 text-center">
                    <div className="text-sm font-black text-[#141d0e]">《撥往前世》</div>
                    <div className="text-xs font-bold text-[#1f2b16] bg-[#8da579] py-1 px-2 rounded border border-[#768a64]/50">
                      請撥打【{hasBigBen ? '1111' : '0000'}】
                    </div>
                    <div className="text-[10px] text-[#3e5030] pt-0.5">
                      按【C鍵】返回鍵盤手動輸入撥打
                    </div>
                  </div>
                )}

                {screenMode === 'CALLING' && (
                  <div className="space-y-1.5 animate-pulse py-1">
                    <div className="text-sm font-black">正在撥號……</div>
                    <div className="text-2xl font-mono tracking-widest">{inputDigits}</div>
                    <div className="text-xs">嘟…… 嘟…… 嘟……</div>
                  </div>
                )}

                {/* 0000 第 1 階段：接通，前世答聲，但聽不到（支援點擊螢幕按鈕或按鍵盤▼切換） */}
                {screenMode === 'PAST_CONNECTED_NO_SOUND' && (
                  <div className="w-full flex flex-col justify-between h-full py-0.5 text-center select-none">
                    <div className="text-[11px] font-bold text-[#2a381f] flex items-center justify-between border-b border-[#768a64]/40 pb-0.5">
                      <span>📞 通話中 (1/2)</span>
                      <span className="text-[10px] text-[#3e5030]">第 1 頁</span>
                    </div>
                    <div className="py-1">
                      <div className="text-sm font-black text-[#141d0e]">
                        「喂……喂？……」
                      </div>
                      <div className="text-xs text-[#2c3a21] leading-snug mt-1">
                        隱約聽見微弱的前世答聲，但雜訊漫天，完全聽不清楚……
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-0.5 border-t border-[#768a64]/30">
                      <span className="text-[9px] text-[#3e5030]">可按鍵盤 ▼ 切換</span>
                      <button
                        onClick={() => setScreenMode('STATIC_NOISE')}
                        className="px-2 py-0.5 bg-[#788d66] hover:bg-[#687d56] text-[#f4fbf0] text-[10px] font-bold rounded shadow-sm cursor-pointer transition-all active:scale-95"
                      >
                        下一頁 ▶
                      </button>
                    </div>
                  </div>
                )}

                {/* 0000 第 2 階段：搜尋不到（停止收訊號，支援點擊螢幕按鈕或按鍵盤▲切換） */}
                {screenMode === 'STATIC_NOISE' && (
                  <div className="w-full flex flex-col justify-between h-full py-0.5 text-left select-none">
                    <div className="text-[11px] font-bold text-[#2a381f] flex items-center justify-between border-b border-[#768a64]/40 pb-0.5">
                      <span className="text-red-950 font-black">⚠️ 搜尋不到 (2/2)</span>
                      <span className="text-[10px] text-[#3e5030]">第 2 頁</span>
                    </div>
                    <div className="py-0.5 leading-snug">
                      <div className="text-xs font-bold text-[#1a2413]">
                        「你停止收訊號 我開始搜尋不到……前世雜訊太多，停止收訊號！」
                      </div>
                      <div className="text-[11px] text-[#2d3a22] mt-1 font-semibold">
                        到底有誰知道，是幾點鐘方向你才會收到暗號？
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-0.5 border-t border-[#768a64]/30">
                      <button
                        onClick={() => setScreenMode('PAST_CONNECTED_NO_SOUND')}
                        className="px-2 py-0.5 bg-[#788d66] hover:bg-[#687d56] text-[#f4fbf0] text-[10px] font-bold rounded shadow-sm cursor-pointer transition-all active:scale-95"
                      >
                        ◀ 上一頁
                      </button>
                      <span className="text-[9px] text-[#3e5030]">按 C 鍵返回撥號</span>
                    </div>
                  </div>
                )}

                {/* 撥錯號碼畫面 */}
                {screenMode === 'WRONG_NUMBER' && (
                  <div className="w-full space-y-1.5 text-center py-1">
                    <div className="text-sm font-black text-[#141d0e]">空號或線路忙碌</div>
                    <div className="text-xs text-[#202c17] px-1 font-sans">
                      您撥的號碼目前無法接通。
                    </div>
                    <div className="text-[10px] text-[#3e5030] pt-0.5">
                      按【C鍵】返回撥號首頁
                    </div>
                  </div>
                )}

                {/* 已完成過前世情人的考驗提示 - 緊湊高度完美塞滿，絕不超出 */}
                {screenMode === 'ALREADY_COMPLETED' && (
                  <div className="w-full flex flex-col items-center justify-center text-center py-0 space-y-0.5 select-none">
                    <div className="text-[11px] font-black text-[#141d0e] tracking-wider border-b border-[#768a64]/60 pb-0.5 px-2">
                      ✦ 誓約已達成 ✦
                    </div>
                    <div className="text-[11px] font-black text-[#1a2413] leading-snug pt-0.5">
                      恭喜你已經完成前世情人的考驗！
                    </div>
                    <div className="text-[10px] text-[#2c3a21] leading-tight px-1 pt-0.5">
                      守護的承諾已化為永恆誓約，毋需再次進行考驗。
                    </div>
                    <div className="text-[10px] text-[#28391d] font-bold pt-1">
                      按【C鍵】返回撥號首頁
                    </div>
                  </div>
                )}

                {screenMode === 'NOT_MAGICIAN' && (
                  <div className="space-y-1 text-left text-xs leading-tight">
                    <div className="font-black text-center text-amber-900 text-xs">✨ 訊號接通，但……</div>
                    <div className="text-[11px] leading-snug text-[#1a2413]">
                      前世情人感應到了你的呼喚！但唯有【魔術先生】的浪漫魔法才能真正破譯誓約！
                    </div>
                    <div className="text-[10px] font-bold text-red-950 pt-0.5">
                      （當前化身非魔術先生）
                    </div>
                  </div>
                )}

                {/* 考驗提示畫面 - 文字放大強調 */}
                {screenMode === 'TRIAL' && (
                  <div className="space-y-1.5 text-left w-full">
                    <div className="font-black text-center text-emerald-950 text-sm">✦ 前世情人的考驗 ✦</div>
                    <div className="text-xs text-[#141e0f] font-medium leading-relaxed font-sans">
                      小公主約定好未來的城堡……請從右側行囊拖曳信物放入對應欄位：
                    </div>
                    <div className="text-xs text-[#1c2815] font-bold bg-[#8da579]/70 py-1 px-2 rounded border border-[#768a64]/50">
                      1. 星空上的銀海　2. 一起造城堡
                    </div>
                  </div>
                )}
              </div>

              {/* 螢幕底部軟鍵提示 */}
              <div className="flex justify-between items-center text-[10px] font-bold pt-1 border-t border-[#768a64]/60 shrink-0">
                <span>功能</span>
                <span>返回</span>
              </div>
            </div>
          </div>

          {/* 若進入魔術先生考驗模式，在螢幕下方展示雙拖曳槽 - 中央資訊文字與框體放大 */}
          {isTrialMode && (
            <div className="w-full bg-[#1b1d24] border-2 border-amber-500/70 rounded-2xl p-4 mb-3 shadow-xl flex flex-col gap-3 animate-in fade-in duration-150">
              <div className="text-base font-black text-amber-200 text-center font-serif tracking-wide">
                ✦ 拖曳誓約信物至下方欄位 ✦
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                {/* 第一欄：星晴 */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'copy';
                  }}
                  onDrop={handleDropSlot1}
                  className={`p-3 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center gap-1.5 transition-all min-h-[96px] ${
                    slot1Item
                      ? 'bg-amber-950/70 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
                      : 'bg-black/60 border-stone-600 text-stone-300 hover:border-amber-500/50'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-black text-amber-300">第一欄・星空上的銀海</span>
                  <span className="font-black text-sm sm:text-base text-amber-100">{slot1Item || '拖入信物'}</span>
                </div>

                {/* 第二欄：伊斯坦堡 */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'copy';
                  }}
                  onDrop={handleDropSlot2}
                  className={`p-3 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center gap-1.5 transition-all min-h-[96px] ${
                    slot2Item
                      ? 'bg-amber-950/70 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
                      : 'bg-black/60 border-stone-600 text-stone-300 hover:border-amber-500/50'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-black text-amber-300">第二欄・約定造城堡</span>
                  <span className="font-black text-sm sm:text-base text-amber-100">{slot2Item || '拖入信物'}</span>
                </div>
              </div>

              {trialError && (
                <div className="text-xs text-red-400 text-center font-sans font-medium">
                  {trialError}
                </div>
              )}

              <button
                onClick={handleConfirmTrial}
                className="w-full py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:brightness-110 text-stone-950 font-black rounded-xl text-sm sm:text-base shadow-lg transition-all cursor-pointer tracking-wider active:scale-98"
              >
                ✦ 完成考驗・迎回前世情人 ✦
              </button>
            </div>
          )}

          {/* 導航與功能按鍵群 */}
          <div className="w-full flex items-center justify-between px-3 mb-2.5">
            {/* 通話鍵 (綠色弧形鍵) */}
            <button
              id="phone-btn-call"
              onClick={handleCall}
              title="撥號 / 通話"
              className="w-12 h-8 rounded-full bg-emerald-700 hover:bg-emerald-600 border border-emerald-400 text-white font-black text-xs flex items-center justify-center shadow-md active:scale-95 cursor-pointer"
            >
              📞
            </button>

            {/* 上下切換鍵 (電話簿 & 0000 兩階段通話翻頁) */}
            <div className="flex flex-col gap-1">
              <button
                id="phone-btn-up"
                onClick={handleScrollUp}
                title="向上切換 / 上頁"
                className="w-10 h-4 bg-stone-700 hover:bg-stone-600 rounded-t-md text-[9px] text-stone-200 font-bold flex items-center justify-center border border-stone-500 active:scale-95 cursor-pointer"
              >
                ▲
              </button>
              <button
                id="phone-btn-down"
                onClick={handleScrollDown}
                title="向下切換 / 下頁"
                className="w-10 h-4 bg-stone-700 hover:bg-stone-600 rounded-b-md text-[9px] text-stone-200 font-bold flex items-center justify-center border border-stone-500 active:scale-95 cursor-pointer"
              >
                ▼
              </button>
            </div>

            {/* 清除/返回鍵 (紅色弧形鍵 C) - 點下立即返回撥號首頁 */}
            <button
              id="phone-btn-clear"
              onClick={handleClear}
              title="清除 / 返回首頁"
              className="w-12 h-8 rounded-full bg-red-800 hover:bg-red-700 border border-red-500 text-white font-black text-xs flex items-center justify-center shadow-md active:scale-95 cursor-pointer font-mono"
            >
              C
            </button>
          </div>

          {/* 若不是考驗模式才顯示 3×4 數字鍵盤；考驗模式時隱藏鍵盤做成半隻手機 */}
          {!isTrialMode && (
            <div className="grid grid-cols-3 gap-2 w-full px-2 mb-2 animate-in fade-in duration-150">
              {[
                { num: '1', sub: 'oo' },
                { num: '2', sub: 'abc' },
                { num: '3', sub: 'def' },
                { num: '4', sub: 'ghi' },
                { num: '5', sub: 'jkl' },
                { num: '6', sub: 'mno' },
                { num: '7', sub: 'pqrs' },
                { num: '8', sub: 'tuv' },
                { num: '9', sub: 'wxyz' },
                { num: '*', sub: '+' },
                { num: '0', sub: '_' },
                { num: '#', sub: '⇧' },
              ].map((keyItem) => (
                <button
                  key={keyItem.num}
                  onClick={() => handlePressDigit(keyItem.num)}
                  className="h-10 rounded-xl bg-gradient-to-b from-[#3a3d46] to-[#252830] hover:from-[#474b56] hover:to-[#2e323c] border border-stone-600/80 text-stone-200 flex flex-col items-center justify-center shadow-md active:scale-95 cursor-pointer transition-all"
                >
                  <span className="text-sm font-bold font-mono leading-none">{keyItem.num}</span>
                  <span className="text-[8px] text-stone-400 font-mono scale-90">{keyItem.sub}</span>
                </button>
              ))}
            </div>
          )}

          {/* 底部關閉按鈕 */}
          <button
            onClick={onClose}
            className="w-full mt-1.5 py-2 bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-stone-200 rounded-xl text-xs font-mono transition-all border border-stone-700/60 cursor-pointer"
          >
            收起手機
          </button>
        </div>

        {/* 右側行囊物品拖曳支援區（當處於魔術先生考驗時展開） */}
        {isTrialMode && (
          <div className="w-full max-w-[320px] bg-[#141418] border-2 border-amber-600/80 rounded-3xl p-4 flex flex-col gap-3 shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <span className="text-sm font-bold text-amber-200 font-serif">
                🎒 隨身行囊（按住拖曳）
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                {heldItems.length} 件物品
              </span>
            </div>

            <p className="text-[11px] text-stone-300 leading-relaxed font-sans">
              請從下方點住卡牌並<span className="text-amber-300 font-bold">拖曳</span>至手機欄位：
            </p>

            <div className="grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-1">
              {heldItems.length === 0 ? (
                <div className="col-span-2 text-center py-6 text-stone-500 text-xs font-sans">
                  行囊空無一物
                </div>
              ) : (
                heldItems.map((itemName) => {
                  return (
                    <div
                      key={itemName}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', itemName);
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      className="p-2.5 rounded-xl border border-stone-700 bg-stone-900/90 text-stone-200 text-center text-xs font-bold cursor-grab active:cursor-grabbing hover:border-stone-500 hover:text-stone-100 transition-all select-none"
                    >
                      <span className="block truncate">{itemName}</span>
                      <span className="text-[9px] text-stone-400 font-mono">
                        ×{inventory[itemName]}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
