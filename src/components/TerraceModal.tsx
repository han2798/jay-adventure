import React, { useEffect } from 'react';
import { TerracePlotState } from '../types';
import { ShovelIcon } from './ShovelIcon';

interface TerraceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRound: number;
  inventory: Record<string, number>;
  terracePlot?: TerracePlotState;
  onPlant: (crop: 'tea' | 'flower_sea') => void;
  onTill: () => void;
  onWater: () => void;
  onHarvest: () => void;
  onClearPlot?: () => void;
}

export const TerraceModal: React.FC<TerraceModalProps> = ({
  isOpen,
  onClose,
  currentRound,
  inventory,
  terracePlot,
  onPlant,
  onTill,
  onWater,
  onHarvest,
  onClearPlot,
}) => {
  // ESC key listener
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

  if (!isOpen) return null;

  const step = terracePlot?.step || 'idle';
  const targetCrop = terracePlot?.targetCrop || null;
  // 累積制生長判定：以 growthRounds 計算，經歷滿 5 回合即可收成
  const growthRounds =
    terracePlot?.growthRounds ??
    (terracePlot?.matureRound ? Math.max(0, currentRound - (terracePlot.completedRound || currentRound)) : 0);
  const isMature = step === 'watered' && growthRounds >= 5;
  const roundsLeft = Math.max(0, 5 - growthRounds);
  const progressPercent = Math.min(100, Math.round((growthRounds / 5) * 100));

  // Items held
  const soilCount = inventory['泥土'] || 0;
  const shovelCount = inventory['鐵鏟'] || 0;
  const waterCount = inventory['水'] || 0;
  const chrysanthemumCount = inventory['菊花'] || 0;
  const rosemaryCount = inventory['迷迭香'] || 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-gradient-to-b from-[#101b13] via-[#0c150e] to-[#070c08] border-2 border-emerald-600/70 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.3)] flex flex-col max-h-[92vh] overflow-hidden text-stone-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-900/60 px-5 py-4 bg-emerald-950/40">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl sm:text-3xl">🌾</span>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-emerald-200 font-serif tracking-wider">
                高山青青・翠綠梯田
              </h3>
              <p className="text-xs text-emerald-400/80 font-sans mt-0.5">
                山嵐繚繞的翠綠梯田，耕種珍貴茶葉與培育漫山花海
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Status Visual Banner */}
          <div className="relative rounded-xl overflow-hidden border border-emerald-700/50 bg-gradient-to-r from-emerald-950/80 via-emerald-900/40 to-emerald-950/80 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
            <div className="flex items-center gap-4 w-full">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-black/40 border border-emerald-500/40 flex items-center justify-center text-3xl sm:text-4xl shadow-md shrink-0">
                {step === 'idle' && '🏞️'}
                {step === 'tilled' && '🌿'}
                {step === 'seeded' && (targetCrop === 'tea' ? '🌱' : '🌸')}
                {step === 'watered' && !isMature && '🌱'}
                {step === 'watered' && isMature && (targetCrop === 'tea' ? '🍵' : '💐')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>
                    {step === 'idle' && '梯田狀態：待翻土'}
                    {step === 'tilled' && '梯田狀態：已翻土・待播種'}
                    {step === 'seeded' && '梯田狀態：已播種・待灌溉'}
                    {step === 'watered' && !isMature && `梯田狀態：成長中`}
                    {step === 'watered' && isMature && '梯田狀態：作物成熟・可收成！'}
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-bold text-white mt-1">
                  {step === 'idle' && '荒蕪待耕・請深耕翻土'}
                  {step === 'tilled' && '土壤已深耕鬆軟・開始播種'}
                  {step === 'seeded' && (targetCrop === 'tea' ? '已播撒泥土茶籽，土壤正渴求甘霖滋養' : '已播撒菊花與迷迭香花種，花圃正渴求甘霖滋養')}
                  {step === 'watered' && !isMature && (targetCrop === 'tea' ? '雨露滋潤茶樹嫩苗，靜候歲月生長' : '甘霖浸潤百花花圃，靜候綻放花海')}
                  {step === 'watered' && isMature && (targetCrop === 'tea' ? '嫩葉初綻，茶香撲鼻，大獲豐收！' : '滿山繁花爛漫，繽紛花海隨風搖曳！')}
                </h4>
              </div>
            </div>
          </div>

          {/* Sequential Step Timeline */}
          <div className="bg-black/30 border border-emerald-900/50 rounded-xl p-3.5 sm:p-4">
            <div className="text-xs font-bold text-emerald-400/90 mb-2.5 flex items-center justify-between">
              <span>🌾 耕耘順序守則：翻土 ➔ 播種 ➔ 灌溉 ➔ 成長 ➔ 收成</span>
              {step !== 'idle' && onClearPlot && (
                <button
                  onClick={onClearPlot}
                  className="text-[11px] text-stone-400 hover:text-red-300 underline cursor-pointer transition-colors"
                  title="放棄當前作物並重置梯田（原料不予退還）"
                >
                  重置清空田畦
                </button>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-sans">
              <div
                className={`p-2 rounded-lg border transition-all ${
                  step === 'idle'
                    ? 'border-amber-500/80 bg-amber-950/40 text-amber-200 font-bold'
                    : 'border-emerald-600/40 bg-emerald-950/30 text-emerald-300'
                }`}
              >
                <div className="text-[10px] text-stone-400 mb-0.5">步驟 1</div>
                <div className="flex items-center justify-center gap-1">
                  <ShovelIcon className="w-3.5 h-3.5 shrink-0" />
                  <span>翻土</span>
                </div>
              </div>
              <div
                className={`p-2 rounded-lg border transition-all ${
                  step === 'tilled'
                    ? 'border-amber-500/80 bg-amber-950/40 text-amber-200 font-bold'
                    : step === 'seeded' || step === 'watered'
                    ? 'border-emerald-600/40 bg-emerald-950/30 text-emerald-300'
                    : 'border-stone-800 bg-stone-900/40 text-stone-500'
                }`}
              >
                <div className="text-[10px] text-stone-400 mb-0.5">步驟 2</div>
                <div>🌱 播種原料</div>
              </div>
              <div
                className={`p-2 rounded-lg border transition-all ${
                  step === 'seeded'
                    ? 'border-amber-500/80 bg-amber-950/40 text-amber-200 font-bold'
                    : step === 'watered'
                    ? 'border-emerald-600/40 bg-emerald-950/30 text-emerald-300'
                    : 'border-stone-800 bg-stone-900/40 text-stone-500'
                }`}
              >
                <div className="text-[10px] text-stone-400 mb-0.5">步驟 3</div>
                <div>💧 水源灌溉</div>
              </div>
              <div
                className={`p-2 rounded-lg border transition-all ${
                  isMature
                    ? 'border-amber-400 bg-amber-950/80 text-amber-200 font-black animate-pulse'
                    : step === 'watered'
                    ? 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300'
                    : 'border-stone-800 bg-stone-900/40 text-stone-500'
                }`}
              >
                <div className="text-[10px] text-stone-400 mb-0.5">步驟 4</div>
                <div>{isMature ? '✨ 採摘收成' : '⏳ 成長'}</div>
              </div>
            </div>
          </div>

          {/* Interactive Action Panels depending on Step */}

          {/* ============================================================== */}
          {/* STEP 1: IDLE - TILLING WITH SHOVEL */}
          {/* ============================================================== */}
          {step === 'idle' && (
            <div className="bg-[#142017] border border-emerald-700/60 rounded-xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                  <ShovelIcon className="w-4 h-4 shrink-0" />
                  <span>第一步：深耕翻土</span>
                </span>
                <span className="text-xs text-stone-400 font-mono">
                  (農具不消耗）
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
                梯田目前處於荒蕪待耕狀態，栽種前必須先翻動田地，方能覆蓋新土播種。
              </p>

              <button
                onClick={onTill}
                disabled={shovelCount < 1}
                className={`w-full py-3 rounded-xl font-bold text-sm tracking-wider transition-all flex items-center justify-center gap-2 ${
                  shovelCount >= 1
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_2px_15px_rgba(217,119,6,0.3)] cursor-pointer active:scale-98'
                    : 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed'
                }`}
              >
                <ShovelIcon className="w-4 h-4 shrink-0" />
                <span>{shovelCount >= 1 ? '開始深耕翻土' : '缺少農具（要不要找小鐵匠幫忙？）'}</span>
              </button>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 2: TILLED - CHOOSE WHAT TO PLANT */}
          {/* ============================================================== */}
          {step === 'tilled' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                  <span>🌱</span>
                  <span>第二步：覆土播種</span>
                </span>
                <span className="text-xs text-stone-400 font-mono">土壤已深耕完成</span>
              </div>
              <div className="text-xs text-stone-300 leading-relaxed">
                梯田土壤已翻整鬆軟，請從選擇播種作物：
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Option A: Tea Leaves */}
                <div className="bg-[#142017] border-2 border-emerald-700/60 rounded-xl p-4 flex flex-col justify-between gap-3 hover:border-emerald-500 transition-all shadow-md">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-base font-bold text-white flex items-center gap-1.5 font-serif">
                        <span>🍵</span>
                        <span>種【茶】</span>
                      </span>
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed font-sans">
                      以純淨泥土孕育茶樹嫩苗，可收成珍貴茶葉。
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-emerald-900/40">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-400">所需原料：【泥土】× 1</span>
                      <span className={soilCount >= 1 ? 'text-emerald-400 font-bold' : 'text-stone-500'}>
                        持有 {soilCount}/1
                      </span>
                    </div>

                    <button
                      onClick={() => onPlant('tea')}
                      disabled={soilCount < 1}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                        soilCount >= 1
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_2px_12px_rgba(16,185,129,0.3)] cursor-pointer active:scale-98'
                          : 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed'
                      }`}
                    >
                      <span>🌱</span>
                      <span>{soilCount >= 1 ? '投入【泥土】播種茶苗' : '缺少【泥土】'}</span>
                    </button>
                  </div>
                </div>

                {/* Option B: Flower Sea */}
                <div className="bg-[#1c1822] border-2 border-purple-800/60 rounded-xl p-4 flex flex-col justify-between gap-3 hover:border-purple-600 transition-all shadow-md">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-base font-bold text-white flex items-center gap-1.5 font-serif">
                        <span>💐</span>
                        <span>育《花》</span>
                      </span>
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed font-sans">
                      結合兩種花卉，在山嶺間培育漫山遍野的花海。
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-purple-900/40">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-400">所需原料：【黃色的花】＋【香氣的花】</span>
                      <span
                        className={
                          chrysanthemumCount >= 1 && rosemaryCount >= 1
                            ? 'text-purple-300 font-bold'
                            : 'text-stone-500'
                        }
                      >
                        黃花:{chrysanthemumCount}/1 香花:{rosemaryCount}/1
                      </span>
                    </div>

                    <button
                      onClick={() => onPlant('flower_sea')}
                      disabled={chrysanthemumCount < 1 || rosemaryCount < 1}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                        chrysanthemumCount >= 1 && rosemaryCount >= 1
                          ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_2px_12px_rgba(168,85,247,0.3)] cursor-pointer active:scale-98'
                          : 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed'
                      }`}
                    >
                      <span>🌸</span>
                      <span>
                        {chrysanthemumCount >= 1 && rosemaryCount >= 1
                          ? '投入花卉培育花海'
                          : chrysanthemumCount < 1
                          ? '缺少【黃花】'
                          : '缺少【香花】'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 3: SEEDED - NEED WATERING */}
          {/* ============================================================== */}
          {step === 'seeded' && (
            <div className="bg-[#101c24] border border-sky-700/60 rounded-xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-sky-300 flex items-center gap-2">
                  <span>💧</span>
                  <span>第三步：灌溉</span>
                </span>
                <span className="text-xs text-stone-400 font-mono">
                  持有水：{waterCount} 瓶（澆灌將消耗 1 瓶）
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
                {targetCrop === 'tea'
                  ? '泥土茶苗已妥善播入鬆軟田畦，澆水完成後，作物將進入生長期！'
                  : '菊花與迷迭香花種已播入鬆軟田畦，澆水完成後，花圃將進入生長期！'}
              </p>

              <button
                onClick={onWater}
                disabled={waterCount < 1}
                className={`w-full py-3 rounded-xl font-bold text-sm tracking-wider transition-all flex items-center justify-center gap-2 ${
                  waterCount >= 1
                    ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-[0_2px_15px_rgba(14,165,233,0.3)] cursor-pointer active:scale-98'
                    : 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed'
                }`}
              >
                <span>💧</span>
                <span>{waterCount >= 1 ? '倒【水】灌溉田畦（歷時 5 回合生長）' : '缺少【水】'}</span>
              </button>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 4: WATERED - GROWING PROGRESS OR MATURE HARVEST */}
          {/* ============================================================== */}
          {step === 'watered' && (
            <div className="space-y-4">
              {!isMature ? (
                /* Still Growing */
                <div className="bg-[#142017] border border-emerald-700/60 rounded-xl p-5 space-y-4 text-center">
                  <div className="text-4xl animate-bounce">🌱</div>
                  <div>
                    <h4 className="text-lg font-bold text-white font-serif">
                      作物正在茁壯生長中
                    </h4>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-stone-900 rounded-full h-3 overflow-hidden border border-emerald-800/80 p-0.5">
                    <div
                      className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs font-mono text-stone-400 px-1 pt-1">
                    <span>已歷經：{growthRounds} 回合</span>
                    <span className="text-sm sm:text-base font-black text-amber-300 border border-amber-500/50 bg-amber-950/60 px-3 py-1 rounded-lg shadow-sm">
                      還需：{roundsLeft} 回合
                    </span>
                    <span>總需：5 回合</span>
                  </div>

                  <p className="text-xs text-emerald-300/80 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-800/40 font-sans">
                    💡 提示：請關閉此視窗，繼續進行冒險抽卡推進回合。當歷經滿 5 回合後，再次進入梯田即可收成！
                  </p>
                </div>
              ) : (
                /* Mature - Harvest! */
                <div className="bg-gradient-to-b from-[#1b2b1e] to-[#0f1b11] border-2 border-emerald-400 rounded-xl p-5 sm:p-6 space-y-5 text-center shadow-[0_0_30px_rgba(52,211,153,0.3)] animate-in zoom-in-95">
                  <div className="text-5xl animate-pulse">
                    {targetCrop === 'tea' ? '🍵' : '💐'}
                  </div>

                  <div>
                    <span className="text-xs uppercase tracking-widest font-mono text-emerald-400 font-bold">
                      熟成豐收
                    </span>
                    <h4 className="text-xl sm:text-2xl font-black text-amber-200 font-serif mt-1">
                      {targetCrop === 'tea' ? '✦ 高山翠嶺・茶葉熟成 ✦' : '✦ 漫山花開・花海盛放 ✦'}
                    </h4>
                    <p className="text-xs sm:text-sm text-stone-300 mt-1.5 leading-relaxed font-sans max-w-md mx-auto">
                      {targetCrop === 'tea'
                        ? '汲取了泥土的厚重與甘霖的灌溉，新芽青翠欲滴，已至最佳採摘時機！'
                        : '菊花與迷迭香在梯田相互輝映，繁花錦簇！滿山遍野化作了無盡的浪漫花海！'}
                    </p>
                  </div>

                  <button
                    onClick={onHarvest}
                    className={`w-full py-3.5 sm:py-4 rounded-xl text-white font-black text-base sm:text-lg tracking-wider transition-all shadow-lg cursor-pointer active:scale-98 flex items-center justify-center gap-2 ${
                      targetCrop === 'tea'
                        ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 hover:brightness-110 shadow-[0_4px_20px_rgba(16,185,129,0.4)]'
                        : 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 hover:brightness-110 shadow-[0_4px_20px_rgba(168,85,247,0.4)]'
                    }`}
                  >
                    <span>{targetCrop === 'tea' ? '🍵' : '💐'}</span>
                    <span>
                      {targetCrop === 'tea' ? '採摘收成【茶葉】（放入行囊）' : '採擷綻放《花海》（獲得卡牌）'}
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-emerald-900/60 bg-emerald-950/20 flex items-center justify-between text-xs text-stone-400">
          <span>當前冒險：第 {currentRound} 回合</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors cursor-pointer"
          >
            返回冒險
          </button>
        </div>
      </div>
    </div>
  );
};
