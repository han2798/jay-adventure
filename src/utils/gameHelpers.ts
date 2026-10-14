import { getCardIdByItemName } from '../data/cards';

/**
 * 依據失去/被偷/燒毀的物品名稱，恢復對應卡牌的當局抽取上限額度
 */
export function restoreCardQuotaOnItemLost(
  itemName: string,
  drawnCount: Record<string, number>,
  peninsulaCounts?: Record<string, number>,
  count: number = 1
): { nextDrawnCount: Record<string, number>; nextPeninsulaCounts: Record<string, number> } {
  const cardId = getCardIdByItemName(itemName);
  const nextDrawn = { ...drawnCount };
  const nextPen = { ...(peninsulaCounts || {}) };
  if (!cardId) {
    return { nextDrawnCount: nextDrawn, nextPeninsulaCounts: nextPen };
  }
  let remainingToRestore = count;
  // 若該物品在開局由半島鐵盒繼承而佔據了名額，先扣除繼承佔額
  if ((nextPen[cardId] || 0) > 0) {
    const deduct = Math.min(nextPen[cardId], remainingToRestore);
    nextPen[cardId] = Math.max(0, nextPen[cardId] - deduct);
    remainingToRestore -= deduct;
  }
  // 若當局曾抽取過，再扣除當局已抽取次數，恢復抽取上限
  if (remainingToRestore > 0 && (nextDrawn[cardId] || 0) > 0) {
    const deduct = Math.min(nextDrawn[cardId], remainingToRestore);
    nextDrawn[cardId] = Math.max(0, nextDrawn[cardId] - deduct);
  }
  return { nextDrawnCount: nextDrawn, nextPeninsulaCounts: nextPen };
}

/**
 * 判定物品是否為「紙類物品」（在下雨天環境下每回合有機率被雨水淋濕損毀）
 */
export function isPaperItem(name: string): boolean {
  const paperItems = new Set([
    '蘭亭序', // 晉朝書法紙張墨寶
    '手寫的從前', // 手寫信紙
    '超跑女神指引的賽道', // 紙質賽道地圖指引
    '床邊故事', // 故事書冊
    '愛的飛行日記', // 日記本
    '第一頁', // 鐵盒書頁紙張
    '第六頁', // 鐵盒書頁紙張
    '第七頁', // 鐵盒書頁紙張
    '序', // 鐵盒前言書頁
    '廢紙', // 淘金小鎮廢紙（雨天消耗/替死）
  ]);
  return paperItems.has(name);
}

/**
 * 通用背包道具交換/重鑄/合成處理函數
 * 統一扣除消耗道具、自動還原抽取配額、增加產出道具，並同步維護道具順序
 */
export function exchangeInventoryItems(
  inventory: Record<string, number>,
  drawnCount: Record<string, number>,
  peninsulaCounts: Record<string, number> | undefined,
  currentOrder: string[] | undefined,
  deducts: { item: string; count: number }[],
  adds: { item: string; count: number }[]
): {
  nextInventory: Record<string, number>;
  nextDrawnCount: Record<string, number>;
  nextPeninsulaCounts: Record<string, number>;
  nextItemOrder: string[];
} {
  const nextInv = { ...inventory };
  let nextDrawn = { ...drawnCount };
  let nextPen = { ...(peninsulaCounts || {}) };

  for (const d of deducts) {
    const cur = nextInv[d.item] || 0;
    const deductCount = Math.min(cur, d.count);
    if (deductCount > 0) {
      nextInv[d.item] = cur - deductCount;
      if (nextInv[d.item] <= 0) {
        delete nextInv[d.item];
      }
      const quota = restoreCardQuotaOnItemLost(d.item, nextDrawn, nextPen, deductCount);
      nextDrawn = quota.nextDrawnCount;
      nextPen = quota.nextPeninsulaCounts;
    }
  }

  for (const a of adds) {
    nextInv[a.item] = (nextInv[a.item] || 0) + a.count;
  }

  const baseOrder = currentOrder || Object.keys(nextInv);
  let nextOrder = baseOrder.filter((k) => (nextInv[k] || 0) > 0);
  for (const a of adds) {
    nextOrder = [...nextOrder.filter((k) => k !== a.item), a.item];
  }
  nextOrder = nextOrder.filter((k) => (nextInv[k] || 0) > 0);

  return {
    nextInventory: nextInv,
    nextDrawnCount: nextDrawn,
    nextPeninsulaCounts: nextPen,
    nextItemOrder: nextOrder,
  };
}

import { CARD_DATABASE } from '../data/cards';

/**
 * 判定物品是否受到半島鐵盒限制（不可透過半島鐵盒跨局繼承，如《最後的戰役》）
 */
export function isItemPeninsulaRestricted(itemName: string): boolean {
  if (itemName === '最後的戰役') return true;
  const cardDef = CARD_DATABASE.find((c) => c.name === itemName);
  return Boolean(cardDef?.isPeninsulaRestricted);
}

/**
 * 計算鐵盒傳承容量
 */
export function getIronBoxCapacity(pages?: any): number {
  if (typeof pages === 'number') {
    return Math.max(1, pages);
  }
  if (pages && typeof pages === 'object') {
    const pageCount = Object.values(pages).filter(Boolean).length;
    return Math.max(1, pageCount);
  }
  return 1;
}
