import React, { useEffect, useRef } from 'react';

interface AdventureLogProps {
  logs: Array<{
    round: number;
    text: string;
    type?: 'draw' | 'action' | 'combat' | 'milestone' | 'warning';
  }>;
  jayQuote?: string | null;
}

export const AdventureLog: React.FC<AdventureLogProps> = ({ logs, jayQuote }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="w-full flex-1 flex flex-col gap-3">
      {/* 冒險日誌本體 */}
      <div className="w-full flex-1 bg-[#141417] border border-stone-800 rounded-xl p-4 flex flex-col min-h-[380px] lg:min-h-[500px] lg:max-h-[640px] shadow-md">
        {/* Title - strictly Chinese */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-2 mb-2 shrink-0">
          <span className="text-xs font-bold text-stone-300 tracking-wider">
            冒險日誌
          </span>
          <span className="text-[10px] text-stone-500 font-mono">
            即時記錄 ({logs.length})
          </span>
        </div>

        {/* Scrollable logs */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto pr-1.5 flex flex-col gap-2 text-xs font-sans text-stone-300 leading-relaxed"
        >
          {logs.length === 0 ? (
            <div className="text-stone-600 italic py-6 text-center">
              尚無冒險紀錄，點擊中央卡牌開始探索...
            </div>
          ) : (
            logs.map((log, index) => {
              let badgeClass = 'text-stone-500 border-stone-800';
              if (log.type === 'draw') badgeClass = 'text-amber-400 border-amber-900/60 bg-amber-950/20';
              if (log.type === 'combat') badgeClass = 'text-red-400 border-red-900/60 bg-red-950/20';
              if (log.type === 'milestone') badgeClass = 'text-purple-300 border-purple-900/60 bg-purple-950/20';
              if (log.type === 'warning') badgeClass = 'text-yellow-400 border-yellow-900/60 bg-yellow-950/20';

              return (
                <div
                  key={index}
                  className="flex items-start gap-2 p-1.5 rounded hover:bg-stone-900/40 transition-colors"
                >
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${badgeClass}`}>
                    {log.round > 0 ? `第${log.round}回` : '序章'}
                  </span>
                  <span className="flex-1 break-words leading-relaxed text-stone-200">
                    {log.text}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 周杰倫專屬評語欄位 (僅在抽中稀有卡觸發評語時顯現，平時不佔位存在) */}
      {jayQuote && (
        <div className="w-full bg-gradient-to-r from-[#171412] via-[#141210] to-[#0f0e0d] border border-amber-600/70 rounded-xl p-3 shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-500/80 flex items-center justify-center text-lg shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
            🕶️
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-400 font-mono tracking-wider flex items-center gap-1">
                <span>✦</span>
                <span>周董即時評語</span>
              </span>
              <span className="text-[9px] text-amber-500/80 font-mono">
                JAY'S COMMENT
              </span>
            </div>
            <p className="text-xs font-serif font-black text-amber-200 mt-0.5 truncate tracking-wide">
              {jayQuote}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
