import React from 'react';
import { Cpu, RefreshCw, CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react';
import { HealthResponse } from '../types';

interface HeaderProps {
  health: HealthResponse | null;
  checking: boolean;
  onCheckHealth: () => void;
}

export default function Header({ health, checking, onCheckHealth }: HeaderProps) {
  return (
    <header className="md:h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0 sticky top-0 z-50 shadow-xs">
      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between py-3 md:py-0 gap-3">
        
        {/* Logo & title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-xs">
            <Cpu className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-800 flex items-center gap-2">
              AI 會議記錄智囊
              <span className="text-[10px] bg-indigo-50 text-indigo-600 font-semibold px-2 py-0.5 rounded-full border border-indigo-100">
                v3.5 Flash 驅動
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 -mt-0.5 hidden sm:block">
              一鍵匯入逐字稿，AI 自動分析會議焦點、決議待辦、敏捷分工與多語系對照翻譯
            </p>
          </div>
        </div>

        {/* Health status widget */}
        <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-full px-3.5 py-1 text-[11px] self-start md:self-auto">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">狀態:</span>
            
            {checking ? (
              <div className="flex items-center space-x-1 text-amber-600">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>檢測中</span>
              </div>
            ) : health?.status === "ok" ? (
              <div className="flex items-center space-x-1 text-emerald-600 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-ping mr-0.5" />
                <span>系統就緒</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-rose-500 font-semibold">
                <AlertTriangle className="h-3 w-3" />
                <span>與伺服器斷線</span>
              </div>
            )}
          </div>

          <div className="h-3.5 w-[1px] bg-slate-200" />

          <div className="flex items-center space-x-1">
            <span className="text-slate-400">金鑰:</span>
            {checking ? (
              <span className="text-slate-400">確認中</span>
            ) : health?.apiKeyConfigured ? (
              <span className="text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.2 rounded hover:opacity-90">
                已載入
              </span>
            ) : (
              <span className="text-amber-700 font-medium bg-amber-50 px-1.5 py-0.2 rounded animate-pulse">
                未偵測
              </span>
            )}
          </div>

          <button 
            onClick={onCheckHealth} 
            disabled={checking}
            title="點擊重新檢測伺服器連線與儲存設定"
            className="p-1 hover:bg-slate-200/60 rounded-full transition-all text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <RefreshCw className={`h-3 w-3 ${checking ? 'animate-spin' : ''}`} />
          </button>
        </div>

      </div>
    </header>
  );
}
