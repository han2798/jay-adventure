import React from 'react';
import { CardDefinition } from '../../types';
import { NinjaIcon } from '../NinjaIcon';

export interface NinjaCaughtNoticeData {
  round: number;
  ninjaCard: CardDefinition;
}

export interface NinjaCaughtNoticeModalProps {
  notice: NinjaCaughtNoticeData | null;
  onConfirm: (ninjaCard: CardDefinition) => void;
}

export const NinjaCaughtNoticeModal: React.FC<NinjaCaughtNoticeModalProps> = ({
  notice,
  onConfirm,
}) => {
  if (!notice) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg sm:max-w-xl bg-gradient-to-b from-[#221316] via-[#170e10] to-[#0c0809] border-2 border-red-600/80 rounded-2xl p-7 sm:p-9 shadow-[0_0_50px_rgba(239,68,68,0.4)] flex flex-col items-center text-center gap-5 sm:gap-6">
        <div className="w-full flex items-center justify-between border-b border-red-900/60 pb-3">
          <span className="text-sm sm:text-base text-red-400 font-mono tracking-widest uppercase font-bold flex items-center gap-2">
            <span>✦</span>
            <span>疾風追逐・追上了！</span>
            <span>✦</span>
          </span>
          <span className="text-xs text-red-400/80 font-mono bg-red-950/80 border border-red-800/60 px-2.5 py-0.5 rounded">
            SPECIAL EVENT
          </span>
        </div>

        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-red-950/50 border border-red-600/70 flex items-center justify-center shadow-[0_0_25px_rgba(239,68,68,0.3)] my-1">
          <NinjaIcon className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>

        <div className="flex flex-col gap-1.5">
          <h3 className="text-2xl sm:text-3xl font-black text-stone-100 font-serif tracking-wide">
            追上了！
          </h3>
          <p className="text-sm sm:text-base text-red-300 font-serif font-bold">
            你在第 {notice.round} 回合成功追上了伊賀忍者！
          </p>
        </div>

        <div className="w-full bg-black/60 border border-red-900/60 rounded-xl p-5 sm:p-6 text-sm sm:text-base text-stone-100 leading-relaxed text-left font-sans">
          飛掠的急促黑影驟然停駐，瞬間櫻花落地，神秘感凝結了空氣。伊賀忍者黑夜裡偷襲，以煙霧當武器，目光鎖定著你，一觸即發！
        </div>

        <button
          id="confirm-ninja-caught-modal-btn"
          onClick={() => onConfirm(notice.ninjaCard)}
          className="w-full py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-amber-600 text-stone-100 font-black text-base sm:text-lg tracking-wider hover:brightness-110 transition-all shadow-[0_4px_20px_rgba(239,68,68,0.4)] cursor-pointer mt-2 active:scale-98"
        >
          確定（進入遭遇戰）
        </button>
      </div>
    </div>
  );
};
