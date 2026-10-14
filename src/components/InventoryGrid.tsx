import React, { useState } from 'react';
import { getItemInfo, SpecialItemInfo } from '../data/itemDescriptions';

interface InventoryGridProps {
  inventory: Record<string, number>;
  onItemClick?: (itemName: string) => void;
}

export const InventoryGrid: React.FC<InventoryGridProps> = ({
  inventory,
  onItemClick,
}) => {
  const items = Object.entries(inventory).filter(([_, count]) => Number(count) > 0);
  const hasHerbBook = (inventory['本草綱目'] || 0) > 0;
  const [hoveredItem, setHoveredItem] = useState<{ name: string; info: SpecialItemInfo; x: number; y: number } | null>(null);

  const handleMouseEnter = (name: string, e: React.MouseEvent<HTMLDivElement>) => {
    // 只有持有本草綱目才開啟說明視窗
    if (!hasHerbBook) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const info = getItemInfo(name);
    setHoveredItem({
      name,
      info,
      x: rect.left,
      y: rect.top,
    });
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  return (
    <div className="w-full flex-1 bg-[#141417] border border-stone-800 rounded-xl p-4 flex flex-col gap-3.5 shadow-md min-h-[460px] lg:min-h-[540px] relative">
      {/* Title Area - 放大字體，排版寬敞不折行 */}
      <div className="flex flex-col gap-2 border-b border-stone-800 pb-2.5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-bold text-stone-200 tracking-wider">
              行囊狀態
            </span>
            <span className="text-xs text-stone-400 font-mono">
              ({items.length} 件物品)
            </span>
          </div>
          <span className="text-xs text-stone-500 font-sans">可拖曳物品使用</span>
        </div>

        {/* 本草知識標籤：顯示於行囊狀態下方並排 */}
        {hasHerbBook && (
          <div className="flex items-center gap-2 pt-0.5">
            <span className="text-xs bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 shadow-sm">
              <span>🌿</span>
              <span className="font-bold">本草知識</span>
              <span className="text-[11px] text-emerald-400/80">（已開啟物品說明與進階功能）</span>
            </span>
          </div>
        )}
      </div>

      {/* 3-Column Grid Layout */}
      {items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-sm text-stone-400 font-medium border border-dashed border-stone-800/80 rounded-lg p-6 text-center leading-relaxed">
          行囊空空如也，請抽取卡牌獲取隨身道具
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2.5 content-start">
          {items.map(([name, count]) => (
            <div
              key={name}
              draggable={true}
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', name);
                e.dataTransfer.effectAllowed = 'copyMove';
              }}
              onMouseEnter={(e) => handleMouseEnter(name, e)}
              onMouseLeave={handleMouseLeave}
              onClick={() => onItemClick?.(name)}
              title={
                hasHerbBook
                  ? `【${name}】已開啟本草知識說明`
                  : `尚未解鎖物品說明與進階功能`
              }
              className={`h-12 bg-[#1b1a1f] hover:bg-[#25232b] border rounded-lg px-2.5 flex items-center justify-between transition-all cursor-grab active:cursor-grabbing text-left group overflow-hidden active:scale-95 shadow-sm select-none ${
                hasHerbBook
                  ? 'border-stone-800 hover:border-emerald-500/70 hover:shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                  : 'border-stone-800 hover:border-[#d4af37]/70'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <span className="text-xs text-stone-600 group-hover:text-amber-400 shrink-0 select-none font-mono">
                  ⋮⋮
                </span>
                <span className="text-xs sm:text-[13px] font-bold text-stone-200 truncate font-sans group-hover:text-amber-200">
                  {name}
                </span>
              </div>
              {Number(count) > 1 && (
                <span className="text-xs bg-amber-950/90 text-amber-300 border border-amber-800/80 px-1.5 py-0.5 rounded-full font-mono font-bold shrink-0 ml-1">
                  x{count}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Floating Hover Tooltip: 僅在持有「本草綱目」時開啟 */}
      {hasHerbBook && hoveredItem && (
        <div
          className="fixed z-50 pointer-events-none transition-opacity duration-150 max-w-xs sm:max-w-sm"
          style={{
            left: Math.min(window.innerWidth - 320, Math.max(16, hoveredItem.x - 20)),
            top: Math.max(16, hoveredItem.y - (hoveredItem.info.description ? 120 : 50)),
          }}
        >
          {(hoveredItem.info.description || hoveredItem.info.category || (hoveredItem.info.name && hoveredItem.info.name !== hoveredItem.name)) ? (
            /* 指定的特殊物品：顯示完整詳細介紹視窗 */
            <div className="bg-[#121215] border border-emerald-500/70 rounded-xl p-3.5 shadow-[0_10px_25px_rgba(0,0,0,0.85)] backdrop-blur-md flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-stone-800 pb-1.5 gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-emerald-400 text-sm">🌿</span>
                  <span className="font-bold text-stone-100 text-sm font-serif truncate">
                    {hoveredItem.info.name || hoveredItem.name}
                  </span>
                </div>
                {hoveredItem.info.category && (
                  <span className="text-[11px] text-emerald-300/90 bg-emerald-950/90 px-2 py-0.5 rounded border border-emerald-800/50 font-mono font-medium shrink-0">
                    {hoveredItem.info.category}
                  </span>
                )}
              </div>
              {hoveredItem.info.description && (
                <p className="text-xs text-stone-300 leading-relaxed font-sans">
                  {hoveredItem.info.description}
                </p>
              )}
            </div>
          ) : (
            /* 未指定之一般物品：視窗只顯示卡牌名稱 */
            <div className="bg-[#141418] border border-emerald-700/60 rounded-lg px-3 py-2 shadow-xl backdrop-blur-md flex items-center gap-2">
              <span className="text-emerald-400 text-xs">🌿</span>
              <span className="font-bold text-stone-200 text-xs sm:text-sm font-sans">
                【{hoveredItem.name}】
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
