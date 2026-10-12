import React from 'react';

export interface GoldTownConfirmModalProps {
  isOpen: boolean;
  ap: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export const GoldTownConfirmModal: React.FC<GoldTownConfirmModalProps> = ({
  isOpen,
  ap,
  onCancel,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#1c1917] via-[#141210] to-[#0c0a09] border-2 border-amber-600/70 rounded-2xl p-6 shadow-[0_0_50px_rgba(217,119,6,0.3)] flex flex-col gap-4 text-stone-200 font-sans">
        <div className="flex items-center gap-3 border-b border-amber-800/40 pb-3">
          <span className="text-3xl">⛏️</span>
          <div>
            <h3 className="text-lg font-bold text-amber-200 font-serif tracking-wider">
              ✦ 淘金小鎮・礦區探勘 ✦
            </h3>
            <p className="text-xs text-amber-400/80">荒野金礦區入場確認</p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <p className="text-stone-300">
            是否花費 <span className="text-amber-300 font-bold">5 點行動力</span> 踏入荒野礦區進行淘金探勘？
          </p>

          <div className="bg-amber-950/40 border border-amber-800/50 rounded-xl p-3 flex items-center justify-between text-xs">
            <span className="text-stone-400">當前行動力：</span>
            <span className={`font-mono font-bold text-sm ${ap < 5 ? 'text-red-400' : 'text-amber-300'}`}>
              ⚡ {ap} 點
            </span>
          </div>

          {ap < 5 && (
            <div className="bg-red-950/60 border border-red-600/80 rounded-lg p-2.5 text-xs text-red-200 flex items-start gap-2 animate-pulse shadow-sm">
              <span className="text-base shrink-0 mt-0.5">⚠️</span>
              <div className="font-sans leading-tight space-y-0.5">
                <span className="font-bold text-red-100 block">行動力不足！</span>
                <span>前往淘金小鎮需消耗 5 點行動力，您當前僅剩 {ap} 點行動力，無法進入。</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-amber-900/40">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold transition-all cursor-pointer"
          >
            稍後再來
          </button>

          {ap >= 5 ? (
            <button
              onClick={onConfirm}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black text-xs font-black shadow-lg shadow-amber-900/40 transition-all cursor-pointer active:scale-95"
            >
              確定前往（消耗 5 點行動力）
            </button>
          ) : (
            <button
              disabled
              className="px-5 py-2 rounded-xl bg-stone-800 text-stone-500 border border-stone-700 text-xs font-bold cursor-not-allowed"
            >
              行動力不足（需 5 點）
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
