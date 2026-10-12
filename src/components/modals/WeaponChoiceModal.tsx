import React from 'react';

export interface WeaponChoiceModalProps {
  isOpen: boolean;
  onSelect: (craftType: 'nunchucks_to_blades' | 'blades_to_nunchucks') => void;
  onCancel: () => void;
}

export const WeaponChoiceModal: React.FC<WeaponChoiceModalProps> = ({
  isOpen,
  onSelect,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#141418] border-2 border-amber-600/70 rounded-2xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.9)] flex flex-col gap-4 text-stone-200 font-sans">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">⚔️</span>
            <h3 className="text-lg font-bold text-amber-200 font-serif">
              請選擇重鑄武器方向
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="text-stone-400 hover:text-stone-100 text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-stone-300 leading-relaxed">
          你身上同時備有充足的雙截棍與雙刀，小鐵匠詢問你希望進行哪一種改造：
        </p>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => onSelect('nunchucks_to_blades')}
            className="p-3 bg-[#1b1a1f] hover:bg-amber-950/40 border border-stone-800 hover:border-amber-600/60 rounded-xl text-left transition-all cursor-pointer group"
          >
            <div className="text-xs font-bold text-amber-200 group-hover:text-amber-100">
              【雙截棍 × 2】➔ 【雙刀 × 1】
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5">
              消耗 2 把雙截棍，重鑄改造為 1 把雙刀
            </div>
          </button>

          <button
            onClick={() => onSelect('blades_to_nunchucks')}
            className="p-3 bg-[#1b1a1f] hover:bg-amber-950/40 border border-stone-800 hover:border-amber-600/60 rounded-xl text-left transition-all cursor-pointer group"
          >
            <div className="text-xs font-bold text-amber-200 group-hover:text-amber-100">
              【雙刀 × 1】➔ 【雙截棍 × 2】
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5">
              消耗 1 把雙刀，拆解改造為 2 把雙截棍
            </div>
          </button>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
};
