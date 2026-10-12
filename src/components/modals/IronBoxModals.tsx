import React, { useState } from 'react';
import { CharacterDefinition } from '../../types';

export interface IronBoxInheritModalProps {
  isOpen: boolean;
  capacity: number;
  inventory: Record<string, number>;
  character: CharacterDefinition | null;
  hasPreface: boolean;
  isItemRestricted: (itemName: string) => boolean;
  onConfirm: (itemsToInherit: string[], retainCharacter: boolean) => void;
  onWarning: (message: string) => void;
}

export const IronBoxInheritModal: React.FC<IronBoxInheritModalProps> = ({
  isOpen,
  capacity,
  inventory,
  character,
  hasPreface,
  isItemRestricted,
  onConfirm,
  onWarning,
}) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [retainCharacter, setRetainCharacter] = useState<boolean>(true);

  if (!isOpen) return null;

  const validItems = Object.keys(inventory).filter(
    (name) => (inventory[name] || 0) > 0 && !isItemRestricted(name)
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-gradient-to-b from-[#221c13] via-[#16130d] to-[#0c0a07] border-2 border-amber-600/90 rounded-2xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.35)] flex flex-col items-center text-center gap-4">
        <div className="w-full flex items-center justify-between border-b border-amber-900/60 pb-2">
          <span className="text-xs text-amber-400 font-mono tracking-widest uppercase font-bold flex items-center gap-1.5">
            <span>📻</span>
            <span>半島鐵盒・時空傳承</span>
            <span>✦</span>
          </span>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-600/40 px-2 py-0.5 rounded font-mono font-bold">
            已選 {selectedItems.length} / {capacity} 樣
          </span>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-amber-950/60 border border-amber-500/80 flex items-center justify-center text-3xl shadow-[0_0_25px_rgba(245,158,11,0.3)] my-0.5">
          <span>📻</span>
        </div>

        <div>
          <h3 className="text-lg sm:text-xl font-black text-amber-100 font-serif tracking-wide">
            第 30 回合結束・半島鐵盒開啟
          </h3>
          <p className="text-xs text-amber-300/80 font-serif mt-1 italic">
            「鐵盒的序變成了日記 變成了空氣 演化成回憶，而鐵盒封存物品記憶」
          </p>
        </div>

        <div className="w-full bg-black/50 border border-amber-900/40 rounded-xl p-3 text-xs text-stone-200 leading-relaxed text-left font-sans">
          <p>
            你在此局持有神物【半島鐵盒】！請挑選至多 <span className="text-amber-300 font-bold">{capacity} 樣</span> 獲得的卡牌/道具放入鐵盒中（包含半島鐵盒本身亦需勾選方可帶入下一局，無法攜帶的不會出現在下方），它們將跨越時空，於下一局冒險初始時直接隨身出現在你的行囊中：
          </p>
        </div>

        {/* 序・角色時空傳承區塊（當已擴充「序」且有角色時展示） */}
        {hasPreface && character && (
          <div className="w-full bg-amber-950/40 border border-yellow-500/60 rounded-xl p-3 text-xs text-left space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-bold text-yellow-300 flex items-center gap-1.5 font-serif">
                <span>📖</span>
                <span>【序・角色時空傳承】已啟動</span>
              </span>
              <span className="text-[10px] bg-yellow-500/20 text-yellow-200 border border-yellow-600/40 px-1.5 py-0.5 rounded font-mono font-bold">
                傳奇功能
              </span>
            </div>
            <p className="text-stone-300 text-[11px] leading-relaxed">
              你已將【序】裝訂融入半島鐵盒！可選擇於下一局直接維持當前角色化身，跳過隨機抽選角色。
            </p>
            <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={retainCharacter}
                onChange={(e) => setRetainCharacter(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-amber-600 bg-stone-900 cursor-pointer"
              />
              <span className="text-xs font-bold text-amber-100 flex items-center gap-1.5">
                <span>維持當前角色：</span>
                <span className="text-yellow-300">【{character.name}】（{character.title}）</span>
              </span>
            </label>
          </div>
        )}

        {/* 可選物品清單 */}
        <div className="w-full max-h-52 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2 pr-1 text-left">
          {validItems.map((itemName) => {
            const isSelected = selectedItems.includes(itemName);
            const count = inventory[itemName];
            return (
              <button
                key={itemName}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    setSelectedItems((prev) => prev.filter((it) => it !== itemName));
                  } else {
                    if (selectedItems.length >= capacity) {
                      onWarning(`【半島鐵盒】最多只能挑選 ${capacity} 樣卡牌繼承至下一局！`);
                      return;
                    }
                    setSelectedItems((prev) => [...prev, itemName]);
                  }
                }}
                className={`py-2 px-2.5 rounded-lg border transition-all text-xs font-sans flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-amber-950/80 border-amber-400 text-amber-100 shadow-[0_0_12px_rgba(245,158,11,0.3)] ring-1 ring-amber-400/50'
                    : 'bg-black/40 border-stone-800 text-stone-300 hover:border-stone-600 hover:bg-stone-900/50'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs font-mono">{isSelected ? '✅' : '▫️'}</span>
                  <span className="truncate font-bold">{itemName}</span>
                </div>
                {count > 1 && (
                  <span className="text-[10px] text-stone-400 font-mono shrink-0 ml-1">
                    x{count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="w-full flex gap-2.5 mt-1">
          <button
            type="button"
            onClick={() => onConfirm(selectedItems, retainCharacter)}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 via-[#d4af37] to-amber-500 text-stone-950 font-black text-sm tracking-wider hover:brightness-110 transition-all shadow-[0_4px_18px_rgba(212,175,55,0.35)] cursor-pointer active:scale-98"
          >
            確認封存（{selectedItems.length}/{capacity}）・邁向下一局冒險
          </button>
        </div>
      </div>
    </div>
  );
};

export interface ExpandIronBoxModalProps {
  isOpen: boolean;
  inventory: Record<string, number>;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ExpandIronBoxModal: React.FC<ExpandIronBoxModalProps> = ({
  isOpen,
  inventory,
  onCancel,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#141418] border-2 border-amber-500/70 rounded-2xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.9)] flex flex-col gap-4 text-stone-200 font-sans">
        <div className="flex items-center gap-2.5 border-b border-stone-800 pb-3">
          <span className="text-2xl">📻</span>
          <div>
            <h3 className="text-lg font-bold text-amber-200 font-serif">
              ✦ 擴充跨局神器・半島鐵盒 ✦
            </h3>
            <p className="text-xs text-stone-400">
              遭遇米蘭的小鐵匠・擴充鐵盒
            </p>
          </div>
        </div>

        <p className="text-base text-stone-300 leading-relaxed">
          小鐵匠接過你身上的【半島鐵盒】與發掘出的泛黃頁籤：
          <br />
          是否將持有的頁籤融入鐵盒中進行全方位鍛造擴充？
        </p>

        <div className="bg-amber-950/30 border border-amber-600/40 rounded-xl p-3 text-xs text-amber-200/90 leading-relaxed space-y-2">
          <div className="font-bold text-amber-300">📦 本次預計裝訂擴充頁籤：</div>
          <div className="space-y-1.5 pl-1">
            {(inventory['第一頁'] || 0) > 0 && (
              <div className="flex items-center justify-between text-cyan-300 bg-cyan-950/40 px-2 py-1 rounded border border-cyan-800/40">
                <span className="flex items-center gap-1.5">
                  <span>📑</span>
                  <span className="font-bold">【第一頁】</span>
                </span>
                <span className="font-mono text-cyan-200">擴充鐵盒容量 +1 格</span>
              </div>
            )}
            {(inventory['第六頁'] || 0) > 0 && (
              <div className="flex items-center justify-between text-indigo-300 bg-indigo-950/40 px-2 py-1 rounded border border-indigo-800/40">
                <span className="flex items-center gap-1.5">
                  <span>📑</span>
                  <span className="font-bold">【第六頁】</span>
                </span>
                <span className="font-mono text-indigo-200">擴充鐵盒容量 +6 格</span>
              </div>
            )}
            {(inventory['第七頁'] || 0) > 0 && (
              <div className="flex items-center justify-between text-purple-300 bg-purple-950/40 px-2 py-1 rounded border border-purple-800/40">
                <span className="flex items-center gap-1.5">
                  <span>📑</span>
                  <span className="font-bold">【第七頁】</span>
                </span>
                <span className="font-mono text-purple-200">擴充鐵盒容量 +7 格</span>
              </div>
            )}
            {(inventory['序'] || 0) > 0 && (
              <div className="flex items-center justify-between text-yellow-300 bg-yellow-950/40 px-2 py-1 rounded border border-yellow-700/50 font-bold">
                <span className="flex items-center gap-1.5">
                  <span>📖</span>
                  <span className="font-bold">【序】</span>
                </span>
                <span className="text-yellow-200 text-[11px]">啟動跨局「繼承角色化身」</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            暫不擴充
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer hover:scale-102 active:scale-98"
          >
            確認擴充
          </button>
        </div>
      </div>
    </div>
  );
};
