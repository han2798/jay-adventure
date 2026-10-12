import React from 'react';

export interface SimpleActionModalProps {
  isOpen: boolean;
  icon: string;
  title: string;
  subtitle: string;
  description: React.ReactNode;
  tip?: React.ReactNode;
  cancelText: string;
  confirmText: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export const SimpleActionModal: React.FC<SimpleActionModalProps> = ({
  isOpen,
  icon,
  title,
  subtitle,
  description,
  tip,
  cancelText,
  confirmText,
  onCancel,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#141418] border-2 border-amber-500/70 rounded-2xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.9)] flex flex-col gap-4 text-stone-200 font-sans">
        <div className="flex items-center gap-2.5 border-b border-stone-800 pb-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className="text-lg font-bold text-amber-200 font-serif">
              {title}
            </h3>
            <p className="text-xs text-stone-400">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="text-base text-stone-300 leading-relaxed">
          {description}
        </div>

        {tip && (
          <div className="bg-amber-950/30 border border-amber-600/40 rounded-xl p-3 text-xs text-amber-200/90 leading-relaxed">
            {tip}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer hover:scale-102 active:scale-98"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
