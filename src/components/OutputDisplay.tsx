import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Clipboard, ClipboardCheck, ArrowDownToLine, FileDown, 
  Sparkles, Coffee, Clock, RotateCcw, MessageSquareCode 
} from 'lucide-react';

interface OutputDisplayProps {
  result: string;
  loading: boolean;
  generatedAt?: string | null;
  onClearResult: () => void;
}

const LOADING_STEPS = [
  "🔍 正在細讀逐字稿語音脈絡與發言者邏輯...",
  "🧠 正在由 AI 會議特助提取一分鐘核心重大結論...",
  "📋 正在將討論零碎點轉化為高可執行度的待辦事項表格...",
  "🌐 正在將生硬用語調整為尊榮專業的臺灣商務繁體...",
  "✨ 正在進行全盤校對與對照多語系級別的高水準翻譯..."
];

export default function OutputDisplay({
  result,
  loading,
  generatedAt,
  onClearResult
}: OutputDisplayProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const [stepIndex, setStepIndex] = useState<number>(0);

  // 隨時間輪播載入訊息，消除等待疲勞
  useEffect(() => {
    let interval: any;
    if (loading) {
      setStepIndex(0);
      interval = setInterval(() => {
        setStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("無法複製到剪貼簿", err);
    }
  };

  const handleDownload = (format: 'md' | 'txt') => {
    if (!result) return;
    const blob = new Blob([result], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // 取出標題為檔名
    let fileName = "AI-會議記錄總結";
    const titleMatch = result.match(/#\s+📅\s+【?([^【\]\n]+)】?/);
    if (titleMatch && titleMatch[1]) {
      fileName = titleMatch[1].trim().replace(/\s+/g, '-');
    }

    link.href = url;
    link.download = `${fileName}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs h-full flex flex-col min-h-[480px]">
      
      {/* 頂部控制面板 */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-800">會議記錄生成成果</h3>
          {generatedAt && (
            <span className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-1.5 py-0.5 rounded flex items-center gap-1 font-mono">
              <Clock className="h-3 w-3" />
              {new Date(generatedAt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })} 生成
            </span>
          )}
        </div>

        {result && !loading && (
          <div className="flex items-center space-x-1.5">
            {/* 複製按鈕 */}
            <button
              onClick={handleCopy}
              type="button"
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all text-xs font-medium text-slate-700 flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {copied ? (
                <>
                  <ClipboardCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">已複製！</span>
                </>
              ) : (
                <>
                  <Clipboard className="h-3.5 w-3.5 text-slate-500" />
                  <span>複製全文</span>
                </>
              )}
            </button>

            {/* 下載下拉按鈕群組 */}
            <div className="flex items-center rounded-lg border border-slate-200 divide-x divide-slate-200 overflow-hidden bg-white shadow-2xs">
              <button
                onClick={() => handleDownload('md')}
                title="下載為 Markdown 檔案"
                className="px-2.5 py-1.5 hover:bg-slate-50 transition-all text-xs font-medium text-slate-700 flex items-center gap-1 cursor-pointer"
              >
                <ArrowDownToLine className="h-3.5 w-3.5 text-slate-500" />
                <span>下載 MD</span>
              </button>
              <button
                onClick={() => handleDownload('txt')}
                title="下載為 純文字 檔案"
                className="px-2.5 py-1.5 hover:bg-slate-50 transition-all text-xs font-medium text-slate-700 flex items-center gap-1 cursor-pointer"
              >
                <span>TXT</span>
              </button>
            </div>

            {/* 清除重置按鈕 */}
            <button
              onClick={onClearResult}
              title="清除當前結果"
              className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

          </div>
        )}
      </div>

      {/* 成果與 Loading 顯示主區 */}
      <div className="p-6 flex-1 overflow-y-auto bg-slate-50/30">
        {loading ? (
          /* Loading 動態展示 */
          <div className="h-full flex flex-col items-center justify-center py-16 space-y-6 text-center">
            <div className="relative">
              <div className="h-16 w-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-1 shadow-sm">
                <Coffee className="h-6 w-6 text-indigo-500 animate-bounce" />
              </div>
            </div>
            <div className="space-y-2.5 max-w-sm">
              <h4 className="text-sm font-bold text-slate-800 animate-pulse">
                AI 會議智囊大腦全力總結中
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium transition-all duration-300 min-h-[32px]">
                {LOADING_STEPS[stepIndex]}
              </p>
            </div>
            
            {/* 進度裝飾線 */}
            <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-progress" 
                style={{ width: "70%" }}
              />
            </div>
          </div>
        ) : result ? (
          /* Markdown 渲染渲染 */
          <div className="prose max-w-none text-slate-800 leading-relaxed font-sans text-sm pb-10 space-y-4">
            <ReactMarkdown
              components={{
                h1: ({node, ...props}) => <h1 className="text-2xl font-black text-slate-900 border-b border-slate-200 pb-2.5 mt-6 mb-4 flex items-center gap-1.5" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-lg font-bold text-slate-800 border-l-4 border-indigo-500 pl-3.5 mt-8 mb-3.5" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-base font-bold text-slate-800 mt-6 mb-2" {...props} />,
                p: ({node, ...props}) => <p className="mb-4 text-slate-700 leading-relaxed" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-1.5 text-slate-700" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-1.5 text-slate-700" {...props} />,
                li: ({node, ...props}) => <li className="pl-0.5" {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-slate-300 pl-4 py-1 italic bg-slate-50 text-slate-600 rounded-r-lg my-4" {...props} />,
                table: ({node, ...props}) => (
                  <div className="overflow-x-auto my-6 border border-slate-200 rounded-xl shadow-2xs">
                    <table className="min-w-full divide-y divide-slate-200 border-collapse bg-white" {...props} />
                  </div>
                ),
                thead: ({node, ...props}) => <thead className="bg-slate-50/80" {...props} />,
                tbody: ({node, ...props}) => <tbody className="divide-y divide-slate-100" {...props} />,
                tr: ({node, ...props}) => <tr className="hover:bg-slate-50/50 transition-colors" {...props} />,
                th: ({node, ...props}) => <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 tracking-wider" {...props} />,
                td: ({node, ...props}) => <td className="px-4 py-3 text-xs text-slate-600 leading-relaxed" {...props} />,
                hr: ({node, ...props}) => <hr className="my-8 border-t border-slate-200" {...props} />,
                code: ({node, ...props}) => <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono text-[11px]" {...props} />
              }}
            >
              {result}
            </ReactMarkdown>
          </div>
        ) : (
          /* 空白狀態 */
          <div className="h-full flex flex-col items-center justify-center py-20 text-center text-slate-400">
            <div className="bg-slate-100 p-4 rounded-2xl mb-4 text-slate-400 shadow-3xs">
              <MessageSquareCode className="h-8 w-8 stroke-[1.5]" />
            </div>
            <h4 className="text-sm font-semibold text-slate-700 mb-1">
              尚無產出紀錄
            </h4>
            <p className="text-xs text-slate-400 max-w-[280px] leading-relaxed">
              請在左側貼上您的會議文字，挑選您偏好的排版大綱，並點擊下方「生成會議記錄」按鈕。
            </p>
          </div>
        )}
      </div>

      {/* Geometric Balance 美麗的經典三色精細漸變裝飾條 */}
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-full shrink-0"></div>

    </div>
  );
}
