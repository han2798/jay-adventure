import React from 'react';
import { CharacterDefinition, JokerEquipment } from '../types';
import { CharacterAvatarIcon } from './CharacterAvatarIcon';
import { GoldCoinIcon } from './GoldCoinIcon';

interface CharacterPanelProps {
  character?: CharacterDefinition | null;
  stats?: { ap: number; coins?: number };
  jokerSlots?: JokerEquipment;
  inventory?: Record<string, number>;
  blacksmithUnlocked?: boolean;
  goldTownUnlocked?: boolean;
  hasDiscoveredCoins?: boolean;
  terraceUnlocked?: boolean;
  terraceStatusBadge?: { text: string; isMature: boolean } | null;
  romanticPhoneUnlocked?: boolean;
  onOpenBlacksmith?: () => void;
  onOpenGoldTown?: () => void;
  onOpenTerrace?: () => void;
  onOpenRomanticPhone?: () => void;
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
  blacksmithUnlocked = false,
  goldTownUnlocked = false,
  hasDiscoveredCoins = false,
  terraceUnlocked = false,
  terraceStatusBadge = null,
  romanticPhoneUnlocked = false,
  onOpenBlacksmith,
  onOpenGoldTown,
  onOpenTerrace,
  onOpenRomanticPhone,
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
        <span className="text-sm font-bold text-stone-300 tracking-wider">
          當前化身
        </span>
        <div className="flex items-center gap-2 text-xs sm:text-sm font-mono">
          {stats?.ap === 1 ? (
            <span className="text-red-300 font-bold bg-red-950/90 px-2.5 py-1 rounded border border-red-600 animate-pulse flex items-center gap-1">
              <span>⚠️</span>
              <span>⚡ 行動力 1（瀕危）</span>
            </span>
          ) : (
            <span className="text-amber-300 font-bold bg-amber-950/40 px-2.5 py-1 rounded border border-amber-800/60">
              ⚡ 行動力 {stats?.ap ?? '--'}
            </span>
          )}
          {hasDiscoveredCoins && (
            <span className="text-yellow-300 font-bold bg-yellow-950/40 px-2.5 py-1 rounded border border-yellow-700/60 flex items-center gap-1.5 shadow-sm">
              <GoldCoinIcon className="w-3.5 h-3.5" />
              <span>金幣 {stats?.coins ?? 0}</span>
            </span>
          )}
        </div>
      </div>

      {/* Stamina 1 Warning Notice */}
      {stats?.ap === 1 && (
        <div className="bg-red-950/60 border border-red-600/80 rounded-lg p-2.5 text-xs text-red-200 flex items-start gap-2 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.25)]">
          <span className="text-base shrink-0 mt-0.5">⚠️</span>
          <div className="font-sans leading-tight space-y-0.5">
            <span className="font-bold text-red-100 block">行動力瀕危警告</span>
            <span>行動力僅剩 1 點！下一回合行動力將歸 0 進入下一局（若未獲行動力補充）。</span>
          </div>
        </div>
      )}

      {character ? (
        <>
          {/* Character Identity */}
          <div className="flex items-center gap-3.5 overflow-hidden">
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${character.avatarColor} flex items-center justify-center shadow-md border border-white/10 shrink-0`}
            >
              <div className="filter drop-shadow select-none">
                <CharacterAvatarIcon character={character} size="lg" />
              </div>
            </div>
            <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
              <div className="flex items-center gap-2 flex-wrap">
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

          {/* Trait Description - 放大一階至 text-[15px] */}
          <div className="bg-[#19191d] p-3 rounded-lg border border-stone-800/80 text-[15px] text-stone-300 leading-relaxed font-sans">
            {character.description}
          </div>

          {/* Special Trait: Only revealed when holding 【免費教學錄影帶】 - 放大一階至 text-sm */}
          {hasTutorialTape && character.specialTrait && (
            <div className="text-sm text-amber-200/95 bg-amber-950/30 border border-amber-900/60 p-2.5 rounded-lg font-sans leading-relaxed shadow-sm animate-in fade-in">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
                <span>📼【免費教學錄影帶】特質揭示啟動：</span>
              </div>
              {character.specialTrait}
            </div>
          )}

          {/* 常駐環境設施專屬按鈕列 (小鐵鋪、淘金小鎮、梯田、浪漫手機) */}
          {(blacksmithUnlocked || goldTownUnlocked || terraceUnlocked || romanticPhoneUnlocked) && (
            <div className="flex items-center gap-2 flex-wrap bg-[#141418] p-2 rounded-xl border border-stone-800/80 shadow-inner">
              {romanticPhoneUnlocked && (
                <button
                  id="btn-open-romantic-phone"
                  onClick={onOpenRomanticPhone}
                  title="開啟浪漫手機通訊介面"
                  className="flex-1 min-w-[95px] flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-pink-950/80 hover:bg-pink-900 border border-pink-500/80 text-pink-200 text-xs font-bold transition-all shadow-[0_0_10px_rgba(236,72,153,0.25)] hover:scale-102 active:scale-98 cursor-pointer"
                >
                  <span>📱</span>
                  <span>浪漫手機</span>
                </button>
              )}

              {blacksmithUnlocked && (
                <button
                  id="btn-open-blacksmith"
                  onClick={onOpenBlacksmith}
                  title="隨時拜訪小鐵鋪改造物品"
                  className="flex-1 min-w-[90px] flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-600/80 text-amber-200 text-xs font-bold transition-all shadow-[0_0_10px_rgba(217,119,6,0.25)] hover:scale-102 active:scale-98 cursor-pointer"
                >
                  <span>⚒️</span>
                  <span>小鐵鋪</span>
                </button>
              )}

              {goldTownUnlocked && (
                <button
                  id="btn-open-gold-town"
                  onClick={onOpenGoldTown}
                  title="花費 5 點行動力前往淘金小鎮挖寶"
                  className="flex-1 min-w-[95px] flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-yellow-950/80 hover:bg-yellow-900 border border-yellow-500/80 text-yellow-300 text-xs font-bold transition-all shadow-[0_0_10px_rgba(234,179,8,0.25)] hover:scale-102 active:scale-98 cursor-pointer"
                >
                  <span>⛏️</span>
                  <span>淘金小鎮</span>
                </button>
              )}

              {terraceUnlocked && (
                <button
                  id="btn-open-terrace"
                  onClick={onOpenTerrace}
                  title="前往高山梯田耕作與收成"
                  className={`flex-1 min-w-[105px] flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all hover:scale-102 active:scale-98 cursor-pointer ${
                    terraceStatusBadge?.isMature
                      ? 'bg-emerald-900 border-emerald-400 text-emerald-200 shadow-[0_0_12px_rgba(52,211,153,0.5)] animate-pulse'
                      : 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-600/80 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                  }`}
                >
                  <span>🌾</span>
                  <span>梯田</span>
                  {terraceStatusBadge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        terraceStatusBadge.isMature
                          ? 'bg-emerald-400 text-emerald-950 font-black'
                          : 'bg-emerald-950/90 text-emerald-300 border border-emerald-700/80'
                      }`}
                    >
                      {terraceStatusBadge.text}
                    </span>
                  )}
                </button>
              )}
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
