// 開發者密碼驗證對話框組件
import React, { useState } from 'react';

interface DevPasswordModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function DevPasswordModal({ onClose, onSuccess }: DevPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 開發者管理密碼：1028
    if (password.trim() === '1028') {
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#141418] border-2 border-stone-800 rounded-2xl p-6 text-stone-200 shadow-2xl relative">
        <div className="w-12 h-12 rounded-full bg-stone-900 border border-stone-700 flex items-center justify-center mx-auto mb-4 text-amber-400 font-bold text-xl shadow-inner">
          🔑
        </div>
        <h3 className="text-lg font-bold text-center text-amber-200 mb-1">開發者權限驗證</h3>
        <p className="text-xs text-stone-400 text-center mb-5">請輸入開發者管理密碼以開啟測試工具選單</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="請輸入開發管理密碼..."
              className="w-full bg-stone-900/90 border border-stone-700 rounded-xl px-4 py-3 text-center text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500/80 transition-colors tracking-widest text-lg font-mono"
              autoFocus
            />
            {error && (
              <p className="text-xs text-red-400 text-center mt-2 font-medium animate-shake">
                ⚠️ 密碼錯誤，請重新輸入
              </p>
            )}
          </div>
          <div className="flex gap-2.5 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium py-2.5 rounded-xl transition-colors text-sm border border-stone-700"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-amber-950 font-bold py-2.5 rounded-xl transition-all shadow-md text-sm border border-amber-400/30"
            >
              確認驗證
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


