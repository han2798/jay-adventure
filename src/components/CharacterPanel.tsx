import React from 'react';
import { CharacterDefinition, JokerEquipment } from '../types';

interface CharacterPanelProps {
  character?: CharacterDefinition | null;
  stats?: { hp: number; atk: number };
  jokerSlots?: JokerEquipment;
  inventory?: Record<string, number>;
  onEquipJokerSlot?: (slot: keyof JokerEquipment, itemName: string) => void;
  onUnequipJokerSlot?: (slot: keyof JokerEquipment) => void;
}

export const CharacterPanel: React.FC<CharacterPanelProps> = ({
  character,
  stats,
  jokerSlots,
  inventory = {},
  onEquipJokerSlot,
  onUnequipJokerSlot,
}) => {
  const isJoker = character?.id === 'char_joker';
  const hasTutorialTape = Boolean(inventory['免費教學錄影帶']);

  return (
    <div className="w-full bg-[#141417] border border-stone-800 rounded-xl p-4 flex flex-col gap-3 shadow-lg">
      {/* Title - strictly Chinese */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-2">
        <span className="text-xs font-bold text-stone-400 tracking-wider">
          當前化身
        </span>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-red-400">體力 {stats?.hp ?? '--'}</span>
          <span className="text-amber-400">戰力 {stats?.atk ?? '--'}</span>
        </div>
      </div>

      {character ? (
        <>
          {/* Character Identity */}
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${character.avatarColor} flex items-center justify-center text-white font-serif font-black text-xl shadow-md border border-white/10 shrink-0`}
            >
              {character.name.slice(0, 1)}
            </div>
            <div className="flex flex-col overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-stone-100 font-serif truncate">
                  {character.name}
                </span>
                {character.isSecret && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-mono">
                    SS傳奇
                  </span>
                )}
              </div>
              <span className="text-xs text-[#d4af37] truncate font-sans">
                {character.title}
              </span>
            </div>
          </div>

          {/* Trait Description */}
          <div className="bg-[#19191d] p-3 rounded-lg border border-stone-800/80 text-xs text-stone-400 leading-relaxed font-sans">
            {character.description}
          </div>

          {/* Special Trait: Only revealed when holding 【免費教學錄影帶】 */}
          {hasTutorialTape && character.specialTrait && (
            <div className="text-[11px] text-amber-300/90 bg-amber-950/30 border border-amber-900/60 p-2.5 rounded-lg font-sans leading-relaxed shadow-sm animate-in fade-in">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
                <span>📼【免費教學錄影帶】特質揭示：</span>
              </div>
              {character.specialTrait}
            </div>
          )}

          {/* Uncle Joker Specific Equipment Slot */}
          {isJoker && jokerSlots && (
            <div className="mt-1 bg-purple-950/20 border border-purple-900/40 p-3 rounded-lg flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300 font-serif">
                  喬克叔叔的心願詰問
                </span>
                <span className="text-[10px] text-stone-400 font-mono">裝備槽</span>
              </div>

              {/* Slot 1: 在＿＿＿ */}
              <div className="flex items-center justify-between text-xs bg-black/40 p-2 rounded border border-purple-900/30">
                <span className="text-purple-200 font-serif">
                  在【{jokerSlots.place || '＿＿＿'}】
                </span>
                {jokerSlots.place ? (
                  <button
                    onClick={() => onUnequipJokerSlot?.('place')}
                    className="text-[10px] text-stone-400 hover:text-red-400 cursor-pointer"
                  >
                    卸下
                  </button>
                ) : (
                  inventory['我的地盤'] && (
                    <button
                      onClick={() => onEquipJokerSlot?.('place', '我的地盤')}
                      className="text-[10px] bg-purple-900/80 text-purple-200 px-2 py-0.5 rounded hover:bg-purple-800 cursor-pointer"
                    >
                      填入
                    </button>
                  )
                )}
              </div>

              {/* Slot 2: 穿＿＿＿ */}
              <div className="flex items-center justify-between text-xs bg-black/40 p-2 rounded border border-purple-900/30">
                <span className="text-purple-200 font-serif">
                  穿【{jokerSlots.shoes || '＿＿＿'}】
                </span>
                {jokerSlots.shoes ? (
                  <button
                    onClick={() => onUnequipJokerSlot?.('shoes')}
                    className="text-[10px] text-stone-400 hover:text-red-400 cursor-pointer"
                  >
                    卸下
                  </button>
                ) : (
                  inventory['鞋子特大號'] && (
                    <button
                      onClick={() => onEquipJokerSlot?.('shoes', '鞋子特大號')}
                      className="text-[10px] bg-purple-900/80 text-purple-200 px-2 py-0.5 rounded hover:bg-purple-800 cursor-pointer"
                    >
                      填入
                    </button>
                  )
                )}
              </div>

              {/* Slot 3: 表演＿＿＿ */}
              <div className="flex items-center justify-between text-xs bg-black/40 p-2 rounded border border-purple-900/30">
                <span className="text-purple-200 font-serif">
                  表演【{jokerSlots.performance || '＿＿＿'}】
                </span>
                {jokerSlots.performance ? (
                  <button
                    onClick={() => onUnequipJokerSlot?.('performance')}
                    className="text-[10px] text-stone-400 hover:text-red-400 cursor-pointer"
                  >
                    卸下
                  </button>
                ) : (
                  inventory['紅模仿'] && (
                    <button
                      onClick={() => onEquipJokerSlot?.('performance', '紅模仿')}
                      className="text-[10px] bg-purple-900/80 text-purple-200 px-2 py-0.5 rounded hover:bg-purple-800 cursor-pointer"
                    >
                      填入
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Empty / Placeholder state before character lottery draw */
        <div className="flex flex-col items-center justify-center py-6 text-center gap-2 border border-dashed border-stone-800/80 rounded-lg">
          <div className="w-12 h-12 rounded-xl bg-stone-900 border border-stone-700 flex items-center justify-center text-stone-400 font-serif text-xl font-bold">
            ？
          </div>
          <span className="text-sm font-bold text-stone-200 font-serif">
            尚未抽取化身
          </span>
          <span className="text-xs text-stone-300/90 px-4 leading-relaxed font-sans">
            命運迷霧籠罩，請於中央舞台點選命運之籤盲抽本局化身
          </span>
        </div>
      )}
    </div>
  );
};
