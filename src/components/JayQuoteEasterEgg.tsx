import React from 'react';

interface JayQuoteEasterEggProps {
  quote: string | null;
}

export const JayQuoteEasterEgg: React.FC<JayQuoteEasterEggProps> = ({ quote }) => {
  if (!quote) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#2a1a08]/95 via-[#1a1205]/95 to-[#0e0a02]/95 border-2 border-amber-500/80 shadow-[0_0_30px_rgba(245,158,11,0.4)] backdrop-blur-md">
        <div className="w-8 h-8 rounded-full bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-base shadow-inner">
          <span>🕶️</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-amber-400 font-mono tracking-wider font-bold">
            JAY CHOU CATCHPHRASE
          </span>
          <span className="text-sm font-black text-amber-100 font-serif tracking-wide drop-shadow">
            {quote}
          </span>
        </div>
      </div>
    </div>
  );
};
