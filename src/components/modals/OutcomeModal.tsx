import React from 'react';

export interface OutcomeBadge {
  label: string;
  value: string;
  color?: string;
}

export interface OutcomeModalData {
  title: string;
  icon?: string;
  subtitle?: string;
  narrative: React.ReactNode;
  badges?: OutcomeBadge[];
  confirmText?: string;
  onConfirm: () => void;
}

export interface OutcomeModalProps {
  modal: OutcomeModalData | null;
}

export const OutcomeModal: React.FC<OutcomeModalProps> = ({ modal }) => {
  if (!modal) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg sm:max-w-xl bg-gradient-to-b from-[#1e1c26] via-[#15141c] to-[#0c0c12] border-2 border-amber-600/80 rounded-2xl p-7 sm:p-9 shadow-[0_0_50px_rgba(217,119,6,0.4)] flex flex-col items-center text-center gap-5 sm:gap-6">
        <div className="w-full flex items-center justify-between border-b border-stone-800 pb-2.5">
          <span className="text-sm sm:text-base text-amber-400 font-mono tracking-widest uppercase font-bold flex items-center gap-2">
            <span>✦</span>
            <span>{modal.title}</span>
            <span>✦</span>
          </span>
          <span className="text-xs text-stone-500 font-mono">
            OUTCOME
          </span>
        </div>

        {modal.icon && (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-950/40 border border-amber-700/60 flex items-center justify-center text-4xl sm:text-5xl shadow-[0_0_25px_rgba(245,158,11,0.25)] my-1">
            <span>{modal.icon}</span>
          </div>
        )}

        {modal.subtitle && (
          <p className="text-sm sm:text-base text-amber-200 font-serif font-bold">
            {modal.subtitle}
          </p>
        )}

        <div className="w-full bg-black/60 border border-stone-800 rounded-xl p-5 sm:p-6 text-sm sm:text-base text-stone-100 leading-relaxed text-left font-sans whitespace-pre-line">
          {modal.narrative}
        </div>

        {modal.badges && modal.badges.length > 0 && (
          <div className="w-full flex flex-wrap gap-2.5 justify-center">
            {modal.badges.map((b, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-stone-900 border border-stone-700 text-sm"
              >
                <span className="text-stone-400 text-xs sm:text-sm font-sans">{b.label}：</span>
                <span className={`font-bold font-serif ${b.color || 'text-amber-300'}`}>
                  {b.value}
                </span>
              </div>
            ))}
          </div>
        )}

        <button
          id="confirm-outcome-modal-btn"
          onClick={modal.onConfirm}
          className="w-full py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-amber-600 via-[#d4af37] to-amber-500 text-stone-950 font-black text-base sm:text-lg tracking-wider hover:brightness-110 transition-all shadow-[0_4px_20px_rgba(212,175,55,0.4)] cursor-pointer mt-2 active:scale-98"
        >
          {modal.confirmText || '確定'}
        </button>
      </div>
    </div>
  );
};
