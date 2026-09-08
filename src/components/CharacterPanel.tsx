import React from 'react';
import { CharacterDefinition, JokerEquipment } from '../types';

interface CharacterPanelProps {
  character?: CharacterDefinition | null;
  stats?: { ap: number };
  jokerSlots?: JokerEquipment;
  inventory?: Record<string, number>;
  onEquipJokerSlot?: (slot: keyof JokerEquipment, itemName: string) => void;
  onUnequipJokerSlot?: (slot: keyof JokerEquipment) => void;
}

interface JokerEquipmentSlotProps {
  slotKey: keyof JokerEquipment;
  labelPrefix: string;
  equippedItem: string | null;
  onDropItem: (slot: keyof JokerEquipment, itemName: string) => void;
  onUnequip: (slot: keyof JokerEquipment) => void;
}

const JokerEquipmentSlot: React.FC<JokerEquipmentSlotProps> = ({
  slotKey,
  labelPrefix,
  equippedItem,
  onDropItem,
  onUnequip,
}) => {
  const [isDragOver, setIsDragOver] = React.useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        const itemName = e.dataTransfer.getData('text/plain');
        if (itemName) {
          onDropItem(slotKey, itemName);
        }
      }}
      className={`flex items-center justify-between text-xs p-2 rounded border transition-all ${
        isDragOver
          ? 'bg-purple-900/50 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)] scale-[1.01]'
          : 'bg-black/40 border-purple-900/30'
      }`}
    >
      <div className="flex items-center gap-1.5 truncate">
        <span className="text-purple-200 font-serif">
          {labelPrefix}【
          <span className={equippedItem ? 'text-amber-200 font-bold' : 'text-stone-500'}>
            {equippedItem || '＿＿＿＿＿'}
          </span>
          】
        </span>
        {!equippedItem && (
          <span className="text-[10px] text-stone-500 font-sans hidden sm:inline">
            (拖移行囊物品至此)
          </span>
        )}
      </div>

      {equippedItem ? (
        <button
          onClick={() => onUnequip(slotKey)}
          className="text-[10px] text-stone-400 hover:text-red-400 cursor-pointer px-2 py-0.5 rounded hover:bg-red-950/40 transition-colors shrink-0 ml-2"
        >
          卸下
        </button>
      ) : (
        <span className="text-[10px] text-purple-400/50 font-mono shrink-0 ml-2">
          待拖入
        </span>
      )}
    </div>
  );
};

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

  const handleSlotDrop = (slot: keyof JokerEquipment, itemName: string) => {
    onEquipJokerSlot?.(slot, itemName);
  };

  return (
    <div className="w-full bg-[#141417] border border-stone-800 rounded-xl p-4 flex flex-col gap-3 shadow-lg">
      {/* Title - strictly Chinese */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-2">
        <span className="text-xs font-bold text-stone-400 tracking-wider">
          當前化身
        </span>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-amber-300 font-bold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/60">
            ⚡ 行動力 {stats?.ap ?? '--'}
          </span>
        </div>
      </div>

      {character ? (
        <>
          {/* Character Identity */}
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${character.avatarColor} flex items-center justify-center shadow-md border border-white/10 shrink-0`}
            >
              <span className="text-2xl filter drop-shadow select-none">
                {character.avatarIcon || '🪵'}
              </span>
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
              <JokerEquipmentSlot
                slotKey="place"
                labelPrefix="在"
                equippedItem={jokerSlots.place}
                onDropItem={handleSlotDrop}
                onUnequip={() => onUnequipJokerSlot?.('place')}
              />

              {/* Slot 2: 穿＿＿＿ */}
              <JokerEquipmentSlot
                slotKey="shoes"
                labelPrefix="穿"
                equippedItem={jokerSlots.shoes}
                onDropItem={handleSlotDrop}
                onUnequip={() => onUnequipJokerSlot?.('shoes')}
              />

              {/* Slot 3: 表演＿＿＿ */}
              <JokerEquipmentSlot
                slotKey="performance"
                labelPrefix="表演"
                equippedItem={jokerSlots.performance}
                onDropItem={handleSlotDrop}
                onUnequip={() => onUnequipJokerSlot?.('performance')}
              />
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
