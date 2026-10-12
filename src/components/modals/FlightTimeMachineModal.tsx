import React from 'react';

export interface FlightTimeMachineModalProps {
  isOpen: boolean;
  currentRound: number;
  selectedRound: number;
  onSelectRound: (round: number) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export const FlightTimeMachineModal: React.FC<FlightTimeMachineModalProps> = ({
  isOpen,
  currentRound,
  selectedRound,
  onSelectRound,
  onCancel,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#141418] border-2 border-cyan-500/70 rounded-2xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.9)] flex flex-col gap-4 text-stone-200 font-sans">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🚀</span>
            <div>
              <h3 className="text-lg font-bold text-cyan-200 font-serif">
                ✦ 飛行時光機・跳轉時空 ✦
              </h3>
              <p className="text-xs text-stone-400">
                啟動了行囊進階功能・自由穿梭時空
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-stone-400 hover:text-stone-100 text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-stone-300 leading-relaxed">
          目前身處第 <span className="font-bold text-amber-300 font-mono">{currentRound}</span> 回合。請選擇欲穿梭前往的目的地回合數（1 ~ 30）：
        </p>

        {/* 回合按鈕網格 (1~30) */}
        <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5 p-3 bg-black/50 border border-stone-800 rounded-xl max-h-56 overflow-y-auto">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((r) => {
            const isSelected = selectedRound === r;
            const isCurrent = currentRound === r;
            return (
              <button
                key={r}
                onClick={() => onSelectRound(r)}
                className={`py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-cyan-500 text-stone-950 shadow-md ring-2 ring-cyan-300 font-black'
                    : isCurrent
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-600/70'
                    : 'bg-stone-900/90 hover:bg-stone-800 text-stone-300 border border-stone-800'
                }`}
              >
                <span>R{r}</span>
                {isCurrent && <span className="text-[9px] text-amber-400 font-sans">當前</span>}
              </button>
            );
          })}
        </div>

        <div className="bg-cyan-950/30 border border-cyan-700/40 rounded-xl p-3 text-xs text-cyan-200/90 leading-relaxed">
          💡 <span className="font-bold">穿梭說明：</span>
          確認後將立即啟動飛行時光機，時空跳躍前往目標第 <span className="font-bold text-white font-mono">{selectedRound}</span> 回合！
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-stone-950 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer hover:scale-102 active:scale-98 font-serif"
          >
            啟動穿梭（前往第 {selectedRound} 回合）
          </button>
        </div>
      </div>
    </div>
  );
};
