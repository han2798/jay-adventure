import React from 'react';

interface InventoryGridProps {
  inventory: Record<string, number>;
  onItemClick?: (itemName: string) => void;
}

export const InventoryGrid: React.FC<InventoryGridProps> = ({
  inventory,
  onItemClick,
}) => {
  const items = Object.entries(inventory).filter(([_, count]) => Number(count) > 0);

  return (
    <div className="w-full flex-1 bg-[#141417] border border-stone-800 rounded-xl p-4 flex flex-col gap-3 shadow-md min-h-[460px] lg:min-h-[540px]">
      {/* Title - Strictly Chinese, no INVENTORY */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-300 tracking-wider">
            行囊狀態
          </span>
          <span className="text-[11px] text-stone-500 font-mono">
            ({items.length} 件物品)
          </span>
        </div>
        <span className="text-[10px] text-stone-500">點擊查看或互動</span>
      </div>

      {/* Fixed 3-Column Uniform Grid Layout without '持有中' text */}
      {items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-xs text-stone-300/90 font-medium border border-dashed border-stone-800/80 rounded-lg p-6 text-center leading-relaxed">
          行囊空空如也，請抽取卡牌獲取隨身道具
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2.5 content-start">
          {items.map(([name, count]) => (
            <button
              key={name}
              onClick={() => onItemClick?.(name)}
              className="h-11 bg-[#1b1a1f] hover:bg-[#25232b] border border-stone-800 hover:border-[#d4af37]/70 rounded-lg px-2.5 flex items-center justify-between transition-all cursor-pointer text-left group overflow-hidden active:scale-95 shadow-sm"
            >
              <span className="text-xs font-bold text-stone-200 truncate font-sans group-hover:text-amber-200">
                {name}
              </span>
              {Number(count) > 1 && (
                <span className="text-[10px] bg-amber-950/90 text-amber-300 border border-amber-800/80 px-1.5 py-0.5 rounded-full font-mono font-bold shrink-0 ml-1">
                  x{count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
