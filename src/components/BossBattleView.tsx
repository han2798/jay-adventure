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
  const [timedSeconds, setTimedSeconds] = useState<number | null>(null);
  const [battleMessage, setBattleMessage] = useState<string>(
    '看我把客廳變成戰場！殘局楚河漢界，將軍端坐棋局對面，殺氣如霜。'
  );

  const hasWushuang = Boolean(gameState.inventory['無雙']);
  const isHero = gameState.character?.name === '英雄';
  const hasClock = Boolean(gameState.inventory['反方向的鐘'] && gameState.reversedClockUsesRemaining > 0);

  // 3-second countdown logic for Step 8: 兵臨城下
  useEffect(() => {
    let timer: any = null;
    if (timedSeconds !== null && timedSeconds > 0) {
      timer = setTimeout(() => {
        setTimedSeconds((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (timedSeconds === 0) {
      // 3 seconds expired without clicking "逃" -> Victory!
      setTimedSeconds(null);
      setBattleMessage('三秒過去，你巋然不動！將軍全力大招落空，氣血翻湧陷入重度虛弱！你提氣發動最後一擊！');
      onAddLog('【終局】將軍兵臨城下力竭反噬！你給予了致命最後一擊！', 'milestone');
      setTimeout(() => {
        onVictory('太陽之子');
      }, 1800);
    }
    return () => clearTimeout(timer);
  }, [timedSeconds, onVictory, onAddLog]);

  const handleAction = (action: 'attack' | 'cannon' | 'horse' | 'idle') => {
    if (step === 6) {
      if (action === 'idle') {
        // Winning route 1 trigger:
        setBossStunned(true);
        setBattleMessage('【第六回合・靜止】你放下了棋子與兵刃，選擇不動作。將軍對你的沉默感到前所未有的訝異與震撼，陣腳出現破綻！');
        onAddLog('【第六回合】你選擇不動作，將軍駭然陷入短暫沉默！', 'combat');
        setStep(7);
        return;
      }

      if (action === 'attack' && isHero && hasWushuang) {
        // Winning route 2 trigger:
        setBossHp(0);
        setBattleMessage(
          '「我仰望著夕陽 你低頭黯然離場 聽我說勝敗是兵家之常 你不用放在心上 是因為我只適合無雙！」'
        );
        onAddLog('【無雙秒殺】英雄催動無雙神威，第六回合直接終結將軍！', 'milestone');
        setTimeout(() => {
          onVictory('太陽之子');
        }, 2000);
        return;
      }
    }

    if (step === 7 && bossStunned) {
      // Massive 50 damage opportunity
      const newHp = Math.max(0, bossHp - 50);
      setBossHp(newHp);
      setBattleMessage('【第七回合・破綻】你抓住將軍心神震動的破綻全力一擊，震撼重創將軍 50 點生命值！');
      onAddLog('【第七回合】趁其不備造成 50 點巨額破綻傷害！', 'combat');
      setStep(8);
      // Start 3 second timer immediately for Step 8!
      setTimedSeconds(3);
      return;
    }

    if (step === 8 && timedSeconds !== null) {
      // User pressed "逃" -> Defeat!
      setTimedSeconds(null);
      onAddLog('【終局】你在將軍兵臨城下的威壓中按下了逃跑，棋局崩潰，功虧一簣！', 'warning');
      if (hasClock) {
        setBattleMessage('你臨陣逃脫，將軍長槍貫穿而過！幸而反方向的鐘秒針逆轉！');
        setTimeout(() => {
          onRewindWithClock();
        }, 1500);
      } else {
        onDefeat('在將軍「兵臨城下」終極殺招中未能抵擋威壓而逃跑，挑戰失敗。');
      }
      return;
    }

    // Regular combat math
    let dmg = 1;
    let desc = '普通攻擊';
    if (action === 'cannon') {
      dmg = 5;
      desc = '當頭炮轟擊';
    } else if (action === 'horse') {
      dmg = 2;
      desc = '屏風馬防禦兼反擊';
    } else if (action === 'idle') {
      dmg = 0;
      desc = '觀察不動';
    }

    const nextHp = Math.max(0, bossHp - dmg);
    setBossHp(nextHp);
    setBattleMessage(`第 ${step} 回合：你施展【${desc}】，對將軍造成 ${dmg} 點傷害。將軍冷哼反擊！`);
    onAddLog(`對決將軍 (輪次 ${step})：${desc}，將軍剩餘 ${nextHp} HP`, 'combat');

    if (nextHp <= 0) {
      onVictory('太陽之子');
      return;
    }

    if (step >= 8) {
      // Reached round 8 without winning condition
      if (hasClock) {
        setBattleMessage('八回合已盡，棋局陷入死局，將軍絕殺！幸有反方向的鐘！');
        setTimeout(() => {
          onRewindWithClock();
        }, 1500);
      } else {
        onDefeat('八回合棋局結束，未能徹底擊倒將軍，氣力竭盡落敗。');
      }
      return;
    }

    setStep(step + 1);
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col bg-gradient-to-b from-[#200c0c] via-[#140808] to-[#0a0505] border-2 border-red-800/80 rounded-2xl p-6 shadow-[0_0_50px_rgba(220,38,38,0.3)]">
      {/* Boss Header */}
      <div className="flex items-center justify-between border-b border-red-900/60 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-black px-2.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-700">
            決戰將軍
          </span>
          <span className="text-xs text-stone-400 font-serif">
            楚河漢界・第 {step} / 8 回合
          </span>
        </div>
        {hasClock && (
          <span className="text-xs text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
            反方向的鐘 (剩 {gameState.reversedClockUsesRemaining} 次)
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

      {/* Lyric & Combat Narrator Box */}
      <div className="my-5 bg-black/60 p-4 rounded-xl border border-red-950 min-h-[100px] flex items-center justify-center text-center">
        <p className="text-sm text-stone-200 leading-relaxed font-serif">
          {battleMessage}
        </p>
      </div>

      {/* Special Step 8 Timer Bar */}
      {timedSeconds !== null && (
        <div className="mb-4 bg-red-950/80 border border-red-600 p-3 rounded-xl flex flex-col items-center gap-2 animate-pulse">
          <div className="text-xs font-bold text-red-200">
            ⚠ 將軍施展終極奧義【兵臨城下】！倒數計時：{timedSeconds} 秒
          </div>
          <div className="w-full h-2 bg-stone-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 transition-all duration-1000"
              style={{ width: `${(timedSeconds / 3) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-stone-400 italic">
            提示：三秒內若按「逃」必輸；沉住氣不按，將軍力竭即可反擊獲勝！
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {timedSeconds !== null ? (
          <button
            id="boss-escape-btn"
            onClick={() => handleAction('attack')}
            className="col-span-2 py-4 bg-red-600 hover:bg-red-700 text-white font-black text-lg rounded-xl shadow-lg cursor-pointer tracking-widest active:scale-95 transition-all"
          >
            逃！（危險）
          </button>
        ) : (
          <>
            <button
              id="boss-normal-attack"
              onClick={() => handleAction('attack')}
              className="py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition-all"
            >
              <span>普通攻擊 (-1)</span>
              {step === 6 && isHero && hasWushuang && (
                <span className="text-[10px] text-amber-400">★ 英雄無雙秒殺！</span>
              )}
            </button>

            <button
              id="boss-cannon-attack"
              onClick={() => handleAction('cannon')}
              className="py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 border border-amber-900/60 font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition-all"
            >
              <span>當頭炮 (-5)</span>
              <span className="text-[10px] text-stone-500">猛烈轟擊</span>
            </button>

            <button
              id="boss-horse-attack"
              onClick={() => handleAction('horse')}
              className="py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-blue-300 border border-blue-900/60 font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition-all"
            >
              <span>屏風馬 (守禦)</span>
              <span className="text-[10px] text-stone-500">固若金湯</span>
            </button>

            <button
              id="boss-idle-action"
              onClick={() => handleAction('idle')}
              className={`py-3 px-4 rounded-xl font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition-all ${
                step === 6
                  ? 'bg-purple-950/80 text-purple-200 border border-purple-600 animate-pulse'
                  : 'bg-stone-900 hover:bg-stone-800 text-stone-400 border border-stone-800'
              }`}
            >
              <span>不動作</span>
              {step === 6 ? (
                <span className="text-[10px] text-purple-300 font-mono">✦ 察言觀色</span>
              ) : (
                <span className="text-[10px] text-stone-600">靜待時機</span>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
