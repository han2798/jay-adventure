import React, { useState, useEffect } from 'react';
import { GameState } from '../types';

interface BossBattleViewProps {
  gameState: GameState;
  onVictory: (type: '太陽之子') => void;
  onDefeat: (reason: string) => void;
  onRewindWithClock: () => void;
  onAddLog: (text: string, type?: 'combat' | 'milestone' | 'warning') => void;
}

export const BossBattleView: React.FC<BossBattleViewProps> = ({
  gameState,
  onVictory,
  onDefeat,
  onRewindWithClock,
  onAddLog,
}) => {
  const [step, setStep] = useState<number>(1);
  const [bossHp, setBossHp] = useState<number>(100);
  const [bossStunned, setBossStunned] = useState<boolean>(false);
  const [bossWeakened, setBossWeakened] = useState<boolean>(false);
  const [timedSeconds, setTimedSeconds] = useState<number | null>(null);
  const [victoryModalData, setVictoryModalData] = useState<{
    title: string;
    lyric: string;
    narrative: string;
  } | null>(null);
  const [battleMessage, setBattleMessage] = useState<string>(
    '看我把客廳變成戰場！殘局楚河漢界，將軍端坐棋局對面，殺氣如霜。'
  );

  const hasWushuang = Boolean(gameState.inventory['無雙']);
  const isHero = gameState.character?.name === '英雄';
  const hasClock = Boolean(
    gameState.inventory['反方向的鐘'] && gameState.reversedClockUsesRemaining > 0
  );

  // 3-second countdown logic for Step 8: 兵臨城下
  useEffect(() => {
    let timer: any = null;
    if (timedSeconds !== null && timedSeconds > 0) {
      timer = setTimeout(() => {
        setTimedSeconds((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (timedSeconds === 0) {
      // 3 seconds expired without clicking "逃" -> Boss becomes weakened!
      setTimedSeconds(null);
      setBossWeakened(true);
      setBattleMessage(
        '三秒過去，兵臨城下之勢未能動搖你的心志！將軍傾力大招落空，氣血翻湧陷入極度【虛弱】！'
      );
      onAddLog('【終局轉折】你頂住了兵臨城下的威壓！將軍大招反噬，陷入虛弱狀態！', 'milestone');
    }
    return () => clearTimeout(timer);
  }, [timedSeconds, onAddLog]);

  const triggerVictoryModal = (title: string, lyric: string, narrative: string) => {
    setBossHp(0);
    setVictoryModalData({ title, lyric, narrative });
  };

  useEffect(() => {
    if (!victoryModalData) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') {
        e.preventDefault();
        onVictory('太陽之子');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [victoryModalData, onVictory]);

  const handleAction = (action: 'attack' | 'cannon' | 'horse' | 'idle') => {
    // 1. If currently in Step 8 and boss is weakened:
    if (step === 8 && bossWeakened) {
      if (action === 'attack' || action === 'cannon') {
        onAddLog('【一擊制勝】你趁將軍大招力竭虛弱之際發動終結一擊，徹底擊潰將軍！', 'milestone');
        triggerVictoryModal(
          '✦ 擊敗將軍・棋局定乾坤 ✦',
          '「看我把客廳變成戰場，棋盤裡，車馬炮短兵相接，終成定局！」',
          '你以沉著冷靜看穿了將軍的千層殺陣，在兵臨城下的漫天烽火中屹立不搖，最終一擊逆轉乾坤，徹底擊敗統帥將軍！'
        );
        return;
      }
    }

    // 2. Step 6 Special Winning Routes
    if (step === 6) {
      // Winning Route 2: Hero + Wushuang with ANY attack (except idle/horse)
      if ((action === 'attack' || action === 'cannon') && isHero && hasWushuang) {
        onAddLog('【無雙秒殺】英雄催動無雙神威，第六回合直接終結將軍！', 'milestone');
        triggerVictoryModal(
          '✦ 擊敗將軍・唯我無雙 ✦',
          '「我仰望著夕陽 你低頭黯然離場 聽我說勝敗是兵家之常 你不用放在心上 是因為我只適合無雙」',
          '天地歸於一片死寂，狂暴的無雙霸氣自英雄周身震盪而開，將軍長戟折斷，俯首認輸。'
        );
        return;
      }

      // Winning Route 1: Idle in Step 6
      if (action === 'idle') {
        setBossStunned(true);
        setBattleMessage(
          '放下了棋子與兵刃，選擇不動作。將軍對你的沉默感到前所未有的訝異，破天荒選擇了沉默……'
        );
        onAddLog('【第六回合】你選擇不動作，將軍駭然陷入沉默！', 'combat');
        setStep(7);
        return;
      }
    }

    // 3. Step 7 follow-up for Winning Route 1
    if (step === 7 && bossStunned) {
      if (action === 'attack' || action === 'cannon') {
        const nextHp = Math.max(0, bossHp - 50);
        setBossHp(nextHp);
        setBattleMessage(
          '敏銳抓住將軍心神震動的致命破綻全力一擊，震撼重創將軍 50 點生命值！'
        );
        onAddLog('【第七回合】趁將軍心神動搖，轟出 50 點巨額破綻傷害！', 'combat');
        setStep(8);
        // Step 8: 将军 casts 兵臨城下 with 3-second countdown
        setTimedSeconds(3);
        setBattleMessage(
          '將軍怒髮衝冠，孤注一擲施展終極大招【兵臨城下】！漫天殺氣如黑雲壓頂！'
        );
        return;
      }
    }

    // 4. Regular Combat Math (Normal attack -1, Cannon -5, Horse damage halved)
    let dmg = 1;
    let desc = '普通攻擊';
    if (action === 'cannon') {
      dmg = 5;
      desc = '當頭炮轟擊';
    } else if (action === 'horse') {
      dmg = 0; // 屏風馬守禦，不造成傷害，減半反震
      desc = '屏風馬防守';
    } else if (action === 'idle') {
      dmg = 0;
      desc = '不動作';
    }

    const nextHp = Math.max(0, bossHp - dmg);
    setBossHp(nextHp);
    setBattleMessage(`選擇【${desc}】，將軍陣勢森嚴冷哼反擊！`);
    onAddLog(`對決將軍 (輪次 ${step})：${desc}，將軍剩餘 ${nextHp} HP`, 'combat');

    if (nextHp <= 0) {
      triggerVictoryModal(
        '✦ 擊敗將軍・功成名就 ✦',
        '「殘局楚河漢界，勝負已分！」',
        '你成功擊潰了將軍的所有守衛，贏得了整盤棋局的勝利！'
      );
      return;
    }

    if (step >= 8) {
      // Reached round 8 without triggering winning conditions -> Defeat
      if (hasClock) {
        setBattleMessage('棋局陷入絕境！將軍長戟絕殺！幸有反方向的鐘！');
        setTimeout(() => {
          onRewindWithClock();
        }, 1500);
      } else {
        onDefeat('八回合棋局結束，未能破開將軍森嚴大陣，氣力竭盡落敗。');
      }
      return;
    }

    setStep(step + 1);
  };

  const handleEscapeClick = () => {
    // Player clicked "逃" during 3-second countdown -> Defeat!
    setTimedSeconds(null);
    onAddLog('【臨陣動搖】你在將軍「兵臨城下」終極威壓下選擇了逃跑，陣腳潰敗！', 'warning');
    if (hasClock) {
      setBattleMessage('你在大招威壓下退縮逃跑，將軍絕殺！幸而【反方向的鐘】指針瘋狂倒轉！');
      setTimeout(() => {
        onRewindWithClock();
      }, 1500);
    } else {
      onDefeat('在將軍「兵臨城下」終極威壓下選擇了逃跑，兵敗如山倒。');
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col bg-gradient-to-b from-[#200c0c] via-[#140808] to-[#0a0505] border-2 border-red-800/80 rounded-2xl p-6 shadow-[0_0_50px_rgba(220,38,38,0.3)]">
      {/* Boss Header */}
      <div className="flex items-center justify-between border-b border-red-900/60 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-black px-2.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-700">
            決戰將軍
          </span>
          <span className="text-xs text-stone-300 font-serif">
            時間的箭頭指向 第 {step} / 8 回合
          </span>
        </div>
        {hasClock && (
          <span className="text-xs text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
            反方向的鐘 (剩 {gameState.reversedClockUsesRemaining} 次機會)
          </span>
        )}
      </div>

      {/* Boss HP Bar */}
      <div className="mt-4 flex flex-col gap-1.5">
        <div className="flex justify-between text-xs font-mono font-bold text-red-300">
          <span>將軍生命值</span>
          <span>{bossHp} / 100</span>
        </div>
        <div className="w-full h-3 bg-stone-900 rounded-full border border-red-900/40 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-700 to-amber-500 transition-all duration-300"
            style={{ width: `${Math.max(0, Math.min(100, bossHp))}%` }}
          />
        </div>
      </div>

      {/* Combat Narrator Box */}
      <div className="my-5 bg-black/60 p-4 rounded-xl border border-red-950 min-h-[95px] flex items-center justify-center text-center">
        <p className="text-sm text-stone-200 leading-relaxed font-serif">
          {battleMessage}
        </p>
      </div>

      {/* Step 8 Timer / Escape Alert (Without spoiler hints, purely dramatic tension) */}
      {timedSeconds !== null && (
        <div className="mb-4 bg-red-950/90 border-2 border-red-600 p-4 rounded-xl flex flex-col items-center gap-3 animate-pulse">
          <div className="text-sm font-black text-red-100 tracking-wider">
            ⚠ 將軍終極奧義【兵臨城下】爆發！倒數：{timedSeconds} 秒
          </div>
          <div className="w-full h-2.5 bg-stone-950 rounded-full overflow-hidden border border-red-800">
            <div
              className="h-full bg-red-500 transition-all duration-1000"
              style={{ width: `${(timedSeconds / 3) * 100}%` }}
            />
          </div>
          {/* Emergency Escape Button */}
          <button
            id="boss-escape-btn"
            onClick={handleEscapeClick}
            className="w-full py-3 bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-white font-black text-base rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.5)] cursor-pointer tracking-widest active:scale-98 transition-all border border-red-500"
          >
            逃！（危險）
          </button>
        </div>
      )}

      {/* Standard 4 Action Buttons: strictly uniform, no spoiler hints, clean layout */}
      <div className="grid grid-cols-2 gap-3">
        <button
          id="boss-normal-attack"
          onClick={() => handleAction('attack')}
          className="py-4 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 hover:text-amber-200 border border-stone-700 font-bold text-sm flex items-center justify-center cursor-pointer transition-all active:scale-98 shadow-sm hover:border-amber-500/50"
        >
          <span>普通攻擊</span>
        </button>

        <button
          id="boss-idle-action"
          onClick={() => handleAction('idle')}
          className="py-4 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 hover:text-emerald-300 border border-stone-700 font-bold text-sm flex items-center justify-center cursor-pointer transition-all active:scale-98 shadow-sm hover:border-emerald-500/50"
        >
          <span>不動作</span>
        </button>

        <button
          id="boss-cannon-attack"
          onClick={() => handleAction('cannon')}
          className="py-4 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 hover:text-amber-200 border border-stone-700 font-bold text-sm flex items-center justify-center cursor-pointer transition-all active:scale-98 shadow-sm hover:border-amber-500/50"
        >
          <span>當頭炮</span>
        </button>

        <button
          id="boss-horse-attack"
          onClick={() => handleAction('horse')}
          className="py-4 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 hover:text-sky-300 border border-stone-700 font-bold text-sm flex items-center justify-center cursor-pointer transition-all active:scale-98 shadow-sm hover:border-sky-500/50"
        >
          <span>屏風馬</span>
        </button>
      </div>

      {/* 擊敗將軍的獲勝畫面 Modal (擊敗後先跳出此視窗，確認後再跳出太陽之子通關畫面) */}
      {victoryModalData && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-gradient-to-b from-[#2a1212] via-[#1a0a0a] to-[#0d0505] border-2 border-amber-500/80 rounded-2xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.35)] flex flex-col items-center text-center gap-4">
            <div className="w-full flex items-center justify-between border-b border-red-900/60 pb-2">
              <span className="text-xs text-amber-400 font-mono tracking-widest uppercase font-bold flex items-center gap-1.5">
                <span>✦</span>
                <span>{victoryModalData.title}</span>
                <span>✦</span>
              </span>
              <span className="text-[10px] text-stone-400 font-mono">VICTORY</span>
            </div>

            {/* Icon Graphic */}
            <div className="w-16 h-16 rounded-2xl bg-amber-950/50 border border-amber-500/60 flex items-center justify-center text-3xl shadow-[0_0_25px_rgba(245,158,11,0.25)] my-1">
              <span>⚔️</span>
            </div>

            {/* Lyric Quote */}
            <div className="w-full bg-black/60 border border-amber-900/50 rounded-xl p-4 text-xs sm:text-sm text-amber-200 font-serif leading-relaxed italic">
              {victoryModalData.lyric}
            </div>

            {/* Narrative text */}
            <p className="text-xs text-stone-300 font-sans leading-relaxed text-left">
              {victoryModalData.narrative}
            </p>

            <button
              id="confirm-defeat-general-btn"
              onClick={() => onVictory('太陽之子')}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 text-stone-950 font-black text-sm tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:brightness-110 active:scale-98 transition-all cursor-pointer mt-1"
            >
              確認・晉升《太陽之子》通關
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
