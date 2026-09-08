import { RouteVictoryRecord } from '../types';

export interface SettlementData {
  route: string;
  gameNumber: number;
  round: number;
  totalRounds: number;
  characterName: string;
  allRecords?: Record<string, RouteVictoryRecord>;
  isAllCompleted?: boolean;
}

export function getSettlementGrade(gameNumber: number): {
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  title: string;
  color: string;
  desc: string;
} {
  if (gameNumber <= 6) {
    return {
      grade: 'S',
      title: '嘉年華神話',
      color: '#fbbf24', // amber-400
      desc: '極致掌控時空韻律，以驚世之速與完美策略貫通所有主線！',
    };
  }
  if (gameNumber <= 10) {
    return {
      grade: 'A',
      title: '地表最強傳說',
      color: '#38bdf8', // sky-400
      desc: '沉著面對命運考驗，在極少局數內勘破周杰倫音樂宇宙！',
    };
  }
  if (gameNumber <= 15) {
    return {
      grade: 'B',
      title: '超時代王者',
      color: '#c084fc', // purple-400
      desc: '步步為營，將經典樂章化作前行力量，登頂傳奇王座！',
    };
  }
  if (gameNumber <= 22) {
    return {
      grade: 'C',
      title: '無與倫比的奇蹟',
      color: '#34d399', // emerald-400
      desc: '經歷重整與考驗，憑藉堅定意志譜寫出無與倫比的樂章！',
    };
  }
  return {
    grade: 'D',
    title: '唯一的范特西',
    color: '#94a3b8', // slate-400
    desc: '百折不撓、歷盡千帆，用最純粹的執著完成了這場奇幻冒險！',
  };
}

export function generateSettlementText(data: SettlementData): string {
  const gradeInfo = getSettlementGrade(data.gameNumber);
  const divider = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  
  const lines: string[] = [
    '🎵【周杰倫音樂宇宙・冒險者傳奇戰報】🎵',
    divider,
    `👑 達成路線：【${data.route}】`,
    `📜 命運戰績：恭喜你 經歷 ${data.gameNumber} 局 ${data.round} 回合後 成為了【${data.route}】！`,
    `⏱️ 累計總消耗回合：${data.totalRounds} 回合`,
    `🎭 終局化身：${data.characterName}`,
  ];

  if (data.isAllCompleted) {
    lines.push(`🏅 全通關終極評級：【${gradeInfo.grade} 級・${gradeInfo.title}】`);
    lines.push(`   (${gradeInfo.desc})`);
  } else {
    lines.push(`🎯 探索進度：已成功攻克此路線！（全通關綜合評級將於 3 條主線大滿貫後正式結算）`);
  }
  lines.push(divider);

  if (data.isAllCompleted && data.allRecords) {
    lines.push('🏆【全路線大滿貫・全通關歷程】🏆');
    const sunRecord = data.allRecords['太陽之子'];
    const magnumRecord = data.allRecords['最偉大的作品'];
    const familyRecord = data.allRecords['周杰倫家庭'];

    if (sunRecord) {
      lines.push(`  ☀️《太陽之子》：經歷 ${sunRecord.gameNumber} 局 ${sunRecord.round} 回合完成`);
    }
    if (magnumRecord) {
      lines.push(`  🎨《最偉大的作品》：經歷 ${magnumRecord.gameNumber} 局 ${magnumRecord.round} 回合完成`);
    }
    if (familyRecord) {
      lines.push(`  🏠《周杰倫家庭》：經歷 ${familyRecord.gameNumber} 局 ${familyRecord.round} 回合完成`);
    }
    lines.push(`🌟 全數通關總花費：共經歷 ${data.gameNumber} 局 ${data.totalRounds} 回合完成大滿貫！`);
    lines.push(divider);
  }

  lines.push('「穿梭時間的畫面的鐘，從反方向開始移動……每一段旋律都是奇蹟的證明。」');
  lines.push('🎮 周杰倫音樂宇宙卡牌冒險・傳奇紀錄');

  return lines.join('\n');
}

export async function copySettlementToClipboard(data: SettlementData): Promise<boolean> {
  const text = generateSettlementText(data);
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn('Clipboard write failed:', err);
  }
  return false;
}

export function downloadSettlementImage(data: SettlementData): void {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = data.isAllCompleted ? 1080 : 960;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  const gradeInfo = getSettlementGrade(data.gameNumber);

  // Background gradient (Dark Obsidian & Deep Vinyl Gold)
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#1a160d');
  bgGrad.addColorStop(0.3, '#12100a');
  bgGrad.addColorStop(0.7, '#0a0907');
  bgGrad.addColorStop(1, '#050504');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Outer Gold Border & Accents
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 3;
  ctx.strokeRect(24, 24, width - 48, height - 48);

  ctx.strokeStyle = '#856417';
  ctx.lineWidth = 1;
  ctx.strokeRect(32, 32, width - 64, height - 64);

  // Corner ornaments
  const corners = [
    [32, 32],
    [width - 32, 32],
    [32, height - 32],
    [width - 32, height - 32],
  ];
  corners.forEach(([cx, cy]) => {
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(cx - 6, cy - 6, 12, 12);
  });

  // Header Title
  ctx.fillStyle = '#d4af37';
  ctx.font = 'bold 16px "Noto Serif TC", "Songti TC", serif';
  ctx.textAlign = 'center';
  ctx.fillText('✦  JAY CHOU MUSIC UNIVERSE  ✦', width / 2, 80);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px "Noto Serif TC", "Songti TC", serif';
  ctx.fillText('周杰倫音樂宇宙・冒險者戰報', width / 2, 130);

  ctx.fillStyle = '#a8a29e';
  ctx.font = '14px sans-serif';
  ctx.fillText('多周目宿命探索・最終成績結算', width / 2, 160);

  // Divider
  ctx.strokeStyle = '#3f3f46';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, 180);
  ctx.lineTo(width - 60, 180);
  ctx.stroke();

  // Route Achieved Box
  const routeBoxY = 205;
  ctx.fillStyle = 'rgba(212, 175, 55, 0.08)';
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 1.5;
  ctx.fillRect(60, routeBoxY, width - 120, 160);
  ctx.strokeRect(60, routeBoxY, width - 120, 160);

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('🏆 傳奇通關路線解鎖', 85, routeBoxY + 35);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px "Noto Serif TC", "Songti TC", serif';
  ctx.fillText(`【${data.route}】`, 85, routeBoxY + 75);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '17px "Noto Serif TC", sans-serif';
  ctx.fillText(
    `恭喜你 經歷 ${data.gameNumber} 局 ${data.round} 回合後 成為了【${data.route}】！`,
    85,
    routeBoxY + 115
  );

  ctx.fillStyle = '#94a3b8';
  ctx.font = '13px sans-serif';
  ctx.fillText(
    `終局化身：${data.characterName}   ｜   跨局累計總消耗回合：${data.totalRounds} 回合`,
    85,
    routeBoxY + 140
  );

  // Performance Rating or Milestone Card
  const ratingBoxY = 385;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.strokeStyle = data.isAllCompleted ? '#d4af37' : '#44403c';
  ctx.lineWidth = data.isAllCompleted ? 1.5 : 1;
  ctx.fillRect(60, ratingBoxY, width - 120, 120);
  ctx.strokeRect(60, ratingBoxY, width - 120, 120);

  if (data.isAllCompleted) {
    // Big Grade Seal
    ctx.fillStyle = gradeInfo.color;
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(gradeInfo.grade, 130, ratingBoxY + 75);

    ctx.fillStyle = '#a8a29e';
    ctx.font = '12px sans-serif';
    ctx.fillText('全通關總評級', 130, ratingBoxY + 98);

    // Rating Details
    ctx.textAlign = 'left';
    ctx.fillStyle = gradeInfo.color;
    ctx.font = 'bold 20px "Noto Serif TC", sans-serif';
    ctx.fillText(`【${gradeInfo.title}】`, 200, ratingBoxY + 45);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '14px sans-serif';
    ctx.fillText(gradeInfo.desc, 200, ratingBoxY + 75);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText('※ 全通關大滿貫終極評價：總局數與回合消耗越少，評級越高！', 200, ratingBoxY + 100);
  } else {
    // Milestone Notice (No single route grade)
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎯', 130, ratingBoxY + 75);

    ctx.fillStyle = '#a8a29e';
    ctx.font = '12px sans-serif';
    ctx.fillText('階段進度', 130, ratingBoxY + 98);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 19px "Noto Serif TC", sans-serif';
    ctx.fillText('【階段性主線探索里程碑】', 200, ratingBoxY + 45);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '14px sans-serif';
    ctx.fillText(`已成功攻克此條傳奇路線，進度已全數寫入全域圖鑑！`, 200, ratingBoxY + 73);

    ctx.fillStyle = '#fbbf24';
    ctx.font = '12px sans-serif';
    ctx.fillText('💡 【全路線綜合評級】將於 3 條主線全數通關達成大滿貫後正式結算評定！', 200, ratingBoxY + 100);
  }

  let curY = 525;

  // If All Routes Completed, show Grand Slam Breakdown
  if (data.isAllCompleted && data.allRecords) {
    ctx.fillStyle = 'rgba(217, 119, 6, 0.12)';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.fillRect(60, curY, width - 120, 210);
    ctx.strokeRect(60, curY, width - 120, 210);

    ctx.fillStyle = '#fde68a';
    ctx.font = 'bold 16px "Noto Serif TC", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('👑 全路線大滿貫・總通關歷程', 85, curY + 35);

    const routesList = [
      { key: '太陽之子', icon: '☀️', name: '《太陽之子》' },
      { key: '最偉大的作品', icon: '🎨', name: '《最偉大的作品》' },
      { key: '周杰倫家庭', icon: '🏠', name: '《周杰倫家庭》' },
    ];

    routesList.forEach((r, idx) => {
      const rec = data.allRecords![r.key];
      const itemY = curY + 70 + idx * 35;
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '15px sans-serif';
      ctx.fillText(`${r.icon} ${r.name}`, 90, itemY);

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'right';
      if (rec) {
        ctx.fillText(`經歷 ${rec.gameNumber} 局 ${rec.round} 回合完成`, width - 90, itemY);
      } else {
        ctx.fillText('已達成', width - 90, itemY);
      }
      ctx.textAlign = 'left';
    });

    const summaryLineY = curY + 185;
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(85, summaryLineY - 12);
    ctx.lineTo(width - 85, summaryLineY - 12);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px "Noto Serif TC", sans-serif';
    ctx.fillText(`★ 全通關總花費：共歷經 ${data.gameNumber} 局、累計 ${data.totalRounds} 回合完成全路線！`, 85, summaryLineY + 8);

    curY += 230;
  } else {
    // Single route milestone box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.strokeStyle = '#33333b';
    ctx.lineWidth = 1;
    ctx.fillRect(60, curY, width - 120, 110);
    ctx.strokeRect(60, curY, width - 120, 110);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🌟 冒險者探索提示：', 85, curY + 35);
    ctx.fillText('周杰倫音樂宇宙中蘊藏著多條通關主線（《太陽之子》、《最偉大的作品》、《周杰倫家庭》等）。', 85, curY + 65);
    ctx.fillText('善用跨局繼承與行囊機制，探索全部主線，解鎖全通關大滿貫戰報！', 85, curY + 90);

    curY += 130;
  }

  // Footer / Vintage Quote
  ctx.fillStyle = '#d4af37';
  ctx.font = 'italic 15px "Noto Serif TC", serif';
  ctx.textAlign = 'center';
  ctx.fillText('「想回到過去，試著讓故事繼續……每一段旋律，都是跨越時空的證明。」', width / 2, curY + 40);

  ctx.fillStyle = '#71717a';
  ctx.font = '12px font-mono, sans-serif';
  ctx.fillText(
    `結算日期：${new Date().toLocaleDateString('zh-TW')}   ｜   周杰倫宇宙存檔紀錄碼 #${Math.floor(100000 + Math.random() * 900000)}`,
    width / 2,
    curY + 70
  );

  // Trigger Download
  const link = document.createElement('a');
  link.download = `周杰倫冒險戰績結算_${data.route}_第${data.gameNumber}局.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
