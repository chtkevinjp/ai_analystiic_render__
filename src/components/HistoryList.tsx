import React from 'react';
import { History, Trash2, Calendar, ChevronRight, FileText, CheckSquare, Layers, Lightbulb, Cpu } from 'lucide-react';
import { GeneratedRecord, TemplateType } from '../types';

interface HistoryListProps {
  history: GeneratedRecord[];
  onSelectRecord: (record: GeneratedRecord) => void;
  onDeleteRecord: (id: string) => void;
  onClearHistory: () => void;
  activeId?: string;
}

export default function HistoryList({
  history,
  onSelectRecord,
  onDeleteRecord,
  onClearHistory,
  activeId
}: HistoryListProps) {

  const getTemplateBadge = (type: TemplateType) => {
    let name = "標準";
    let style = "bg-slate-100 text-slate-700";
    switch (type) {
      case 'standard':
        name = "標準模式";
        style = "bg-blue-50 text-blue-700 border border-blue-100";
        break;
      case 'todo':
        name = "任務追蹤";
        style = "bg-emerald-50 text-emerald-700 border border-emerald-100";
        break;
      case 'agile':
        name = "敏捷站會";
        style = "bg-amber-50 text-amber-700 border border-amber-100";
        break;
      case 'brainstorm':
        name = "腦力激盪";
        style = "bg-purple-50 text-purple-700 border border-purple-100";
        break;
      case 'technical':
        name = "技術深探";
        style = "bg-slate-100 text-slate-800 border border-slate-200";
        break;
    }
    return <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${style}`}>{name}</span>;
  };

  const getLanguageLabel = (langCode: string) => {
    switch (langCode) {
      case "en": return "譯:英";
      case "ja": return "譯:日";
      case "ko": return "譯:韓";
      case "zh-cn": return "譯:簡中";
      case "de": return "譯:德";
      case "fr": return "譯:法";
      case "es": return "譯:西";
      default: return "";
    }
  };

  if (history.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-400">
        <div className="flex justify-center mb-2">
          <History className="h-5 w-5 text-slate-300" />
        </div>
        <p className="text-xs">尚無瀏覽器歷史會議記錄</p>
        <p className="text-[10px] text-slate-400 mt-1">
          成果生成後會自動儲存於此，方便再次調用
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      
      {/* 標頭 */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-1.5 text-slate-700">
          <History className="h-4 w-4" />
          <h4 className="text-xs font-bold">近期歷史紀錄 ({history.length})</h4>
        </div>
        <button
          onClick={onClearHistory}
          type="button"
          className="text-[10px] text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded transition-colors font-medium flex items-center gap-1 cursor-pointer"
        >
          <Trash2 className="h-3 w-3" />
          <span>清空紀錄</span>
        </button>
      </div>

      {/* 歷史列表 */}
      <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
        {history.map((record) => {
          const langLabel = getLanguageLabel(record.language);
          return (
            <div
              key={record.id}
              className={`flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors group cursor-pointer ${
                activeId === record.id ? 'bg-indigo-50/40 border-l-4 border-indigo-500' : ''
              }`}
              onClick={() => onSelectRecord(record)}
            >
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  {getTemplateBadge(record.template)}
                  {langLabel && (
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-1 rounded">
                      {langLabel}
                    </span>
                  )}
                  <span className="text-[9px] text-slate-400 flex items-center font-mono">
                    <Calendar className="h-2.5 w-2.5 mr-0.5" />
                    {new Date(record.createdAt).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' })}
                  </span>
                </div>
                <h5 className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                  {record.title || "未命名會議"}
                </h5>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  {record.transcript}
                </p>
              </div>

              <div className="flex items-center space-x-1 shrink-0">
                {/* 輕量級單項清除 */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteRecord(record.id);
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-100 rounded transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                  title="刪除"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
