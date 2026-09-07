import React, { useState } from 'react';
import { CARD_DATABASE } from '../data/cards';
import { ALL_CHARACTERS } from '../data/characters';
import { CardDefinition } from '../types';

interface DevModalProps {
  onClose: () => void;
  onForceDrawCard: (card: CardDefinition) => void;
  onAddItem: (itemName: string) => void;
  onChangeCharacter: (characterId: string) => void;
  onSetRound: (round: number) => void;
  onTriggerBoss: () => void;
  onTriggerVictory: (type: '太陽之子' | '最偉大的作品' | '周杰倫家庭') => void;
}

export const DevModal: React.FC<DevModalProps> = ({
  onClose,
  onForceDrawCard,
  onAddItem,
  onChangeCharacter,
  onSetRound,
  onTriggerBoss,
  onTriggerVictory,
}) => {
  const [filterType, setFilterType] = useState<string>('全部');
  const [search, setSearch] = useState<string>('');

  const filteredCards = CARD_DATABASE.filter((card) => {
    if (filterType !== '全部' && card.type !== filterType) return false;
    if (search && !card.name.includes(search) && !card.album.includes(search)) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[#141214] border-2 border-red-800/80 rounded-2xl p-6 shadow-[0_0_50px_rgba(220,38,38,0.2)] flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-red-900/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-red-400 font-mono tracking-wider">
              🔧 開發者測試控制台 (DEV MODE)
            </span>
            <span className="text-xs text-stone-500">
              專為測試任意卡牌效果與劇情分歧而設
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white text-sm px-2 py-1 rounded hover:bg-stone-800 cursor-pointer font-bold"
          >
            關閉 ✕
          </button>
        </div>

        {/* Quick Shortcut Buttons */}
        <div className="flex flex-wrap gap-2 my-3 p-3 bg-black/50 border border-stone-800 rounded-xl">
          <button
            onClick={onTriggerBoss}
            className="text-xs bg-red-950 hover:bg-red-800 text-red-200 border border-red-700 px-3 py-1.5 rounded-lg cursor-pointer font-bold"
          >
            ⚡ 直跳第30回合決戰【將軍】
          </button>
          <button
            onClick={() => onTriggerVictory('太陽之子')}
            className="text-xs bg-amber-950 hover:bg-amber-800 text-amber-200 border border-amber-700 px-3 py-1.5 rounded-lg cursor-pointer font-bold"
          >
            🏆 直接達成《太陽之子》通關
          </button>
          <button
            onClick={() => onTriggerVictory('最偉大的作品')}
            className="text-xs bg-purple-950 hover:bg-purple-800 text-purple-200 border border-purple-700 px-3 py-1.5 rounded-lg cursor-pointer font-bold"
          >
            🏆 直接達成《最偉大的作品》通關
          </button>
          <button
            onClick={() => onSetRound(1)}
            className="text-xs bg-stone-900 hover:bg-stone-700 text-stone-300 border border-stone-700 px-3 py-1.5 rounded-lg cursor-pointer"
          >
            設為第 1 回合
          </button>
          <button
            onClick={() => onSetRound(29)}
            className="text-xs bg-stone-900 hover:bg-stone-700 text-stone-300 border border-stone-700 px-3 py-1.5 rounded-lg cursor-pointer"
          >
            設為第 29 回合
          </button>
        </div>

        {/* Character Switcher */}
        <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-stone-400 shrink-0 font-bold">切換化身：</span>
          {ALL_CHARACTERS.map((char) => (
            <button
              key={char.id}
              onClick={() => onChangeCharacter(char.id)}
              className="px-2 py-1 rounded bg-stone-900 hover:bg-stone-700 text-stone-300 border border-stone-800 shrink-0 cursor-pointer"
            >
              {char.name}
            </button>
          ))}
        </div>

        {/* Quick Item Injector */}
        <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-stone-400 shrink-0 font-bold">獲取關鍵物：</span>
          {['雙刀', '雙截棍', '黑色毛衣', '無雙', '時光機', '半島鐵盒', '反方向的鐘', '我的地盤', '鞋子特大號', '紅模仿', '床邊故事', '療傷燒肉粽'].map(
            (item) => (
              <button
                key={item}
                onClick={() => onAddItem(item)}
                className="px-2 py-1 rounded bg-amber-950/40 hover:bg-amber-900/60 text-amber-200 border border-amber-800/60 shrink-0 cursor-pointer"
              >
                + {item}
              </button>
            )
          )}
        </div>

        {/* Card Filters & Search */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="搜尋曲名或專輯..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-stone-900 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-red-600"
          />
          <div className="flex gap-1 text-xs">
            {['全部', '遭遇', '物品', '事件', '線索', '日記'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                  filterType === t ? 'bg-red-700 text-white font-bold' : 'bg-stone-900 text-stone-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Card List with Force Draw Button */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          {filteredCards.map((card) => (
            <div
              key={card.id}
              className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 flex flex-col justify-between hover:border-red-700/60 transition-colors"
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className="font-bold text-stone-200 truncate">{card.name}</span>
                  <span className="text-[10px] text-amber-400 font-mono px-1 rounded bg-stone-900">
                    {card.type}
                  </span>
                </div>
                <div className="text-[10px] text-stone-500 font-mono mt-0.5">
                  {card.album}・{card.id}
                </div>
              </div>
              <button
                onClick={() => {
                  onForceDrawCard(card);
                  onClose();
                }}
                className="mt-2 w-full py-1 bg-red-950/80 hover:bg-red-800 text-red-200 border border-red-800/80 rounded text-[11px] font-bold cursor-pointer transition-colors"
              >
                ⚡ 強制翻開抽取此卡
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
