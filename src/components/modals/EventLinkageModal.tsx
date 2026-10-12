import React from 'react';
import { CardDefinition, CharacterDefinition, PlayerStats } from '../../types';

export interface EventTransitionData {
  sourceCardName: string;
  targetCard: CardDefinition;
  effectNarrative: string;
  nextRound: number;
  nextInventory: Record<string, number>;
  nextItemOrder?: string[];
  nextFlags: Record<string, any>;
  nextStats: PlayerStats;
  nextCharacter: CharacterDefinition | null;
}

export interface EventLinkageModalProps {
  transition: EventTransitionData | null;
  onConfirm: (transition: EventTransitionData) => void;
}

export const EventLinkageModal: React.FC<EventLinkageModalProps> = ({
  transition,
  onConfirm,
}) => {
  if (!transition) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg sm:max-w-xl bg-gradient-to-b from-[#1c1822] via-[#14121a] to-[#0c0a10] border-2 border-purple-500/80 rounded-2xl p-7 sm:p-9 shadow-[0_0_50px_rgba(168,85,247,0.4)] flex flex-col items-center text-center gap-5 sm:gap-6">
        <div className="w-full flex items-center justify-between border-b border-purple-900/60 pb-3">
          <span className="text-sm sm:text-base text-purple-300 font-mono tracking-widest uppercase font-bold flex items-center gap-2">
            <span>✦</span>
            <span>劇情連動觸發</span>
            <span>✦</span>
          </span>
          <span className="text-xs text-purple-400/80 font-mono bg-purple-950/80 border border-purple-800/60 px-2.5 py-0.5 rounded">
            EVENT LINKAGE
          </span>
        </div>

        {/* Sequence flow indication */}
        <div className="flex items-center gap-3 text-base sm:text-lg font-serif bg-black/60 px-6 py-3 rounded-xl border border-purple-700/60 shadow-inner">
          <span className="text-stone-300 font-bold">
            【{transition.sourceCardName}】
          </span>
          <span className="text-purple-400 font-bold text-lg sm:text-xl">➔</span>
          <span className="text-amber-300 font-bold">
            【{transition.targetCard?.name || '未知卡牌'}】
          </span>
        </div>

        {/* Narrative explanation */}
        <div className="w-full bg-purple-950/30 border border-purple-800/60 rounded-xl p-5 sm:p-6 text-sm sm:text-base text-purple-100 leading-relaxed text-left font-sans shadow-sm">
          <p className="font-medium text-stone-100 mb-3 leading-relaxed whitespace-pre-line">
            {transition.effectNarrative}
          </p>
          <p className="text-xs sm:text-sm text-purple-300/80 border-t border-purple-800/40 pt-2.5 font-mono">
            ※ 時序進入至第 {Math.min(30, transition.nextRound)} 回合，引領你直接邁入下一張連動卡牌！
          </p>
        </div>

        <button
          id="confirm-event-transition-btn"
          onClick={() => onConfirm(transition)}
          className="w-full py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-700 hover:brightness-110 text-white font-black text-base sm:text-lg tracking-wider shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all cursor-pointer active:scale-98 mt-1"
        >
          下回合進入【{transition.targetCard?.name || '下一卡牌'}】
        </button>
      </div>
    </div>
  );
};
