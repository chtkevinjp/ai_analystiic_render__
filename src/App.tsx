import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TranscriptInput, { FRONTEND_DEFAULT_SYSTEM_INSTRUCTION } from './components/TranscriptInput';
import OutputDisplay from './components/OutputDisplay';
import HistoryList from './components/HistoryList';
import { HealthResponse, TemplateType, GeneratedRecord } from './types';
import { Sparkles, HelpCircle, AlertCircle, RefreshCw, FileText, FileDown, BookOpen } from 'lucide-react';

export default function App() {
  const [transcript, setTranscript] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("standard");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("none");
  const [customInstruction, setCustomInstruction] = useState<string>(FRONTEND_DEFAULT_SYSTEM_INSTRUCTION);
  
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 健康狀態與 API Key 偵測
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [checkingHealth, setCheckingHealth] = useState<boolean>(false);

  // 歷史紀錄狀態
  const [history, setHistory] = useState<GeneratedRecord[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<string | undefined>(undefined);

  // 1. 初始化健康檢查與讀取 LocalStorage 歷史
  useEffect(() => {
    checkServerHealth();
    
    try {
      const stored = localStorage.getItem('ai_meeting_notes_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("無法讀取 LocalStorage 歷史紀錄", e);
    }
  }, []);

  const checkServerHealth = async () => {
    setCheckingHealth(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data: HealthResponse = await res.json();
        setHealth(data);
      } else {
        setHealth(null);
      }
    } catch (e) {
      console.error("健康檢查失敗", e);
      setHealth(null);
    } finally {
      setCheckingHealth(false);
    }
  };

  // 2. 觸發 AI 會議記錄生成
  const handleGenerate = async () => {
    if (!transcript.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setResult("");
    setGeneratedAt(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: transcript,
          template: selectedTemplate,
          language: selectedLanguage,
          customInstruction: customInstruction
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "生成失敗，請檢驗您的伺服器網路連線。");
      }

      // 生成成功，進行儲存與結果顯現
      setResult(data.result);
      const currentTime = new Date().toISOString();
      setGeneratedAt(currentTime);

      // 自動估算一個會議紀錄標題
      let possibleTitle = "會議記錄";
      const titleMatch = data.result.match(/#\s+📅\s+【?([^【\]\n]+)】?/);
      if (titleMatch && titleMatch[1]) {
        possibleTitle = titleMatch[1].trim();
      } else {
        // 沒有匹配到時，拿原文的前 15 個字
        possibleTitle = "📝 " + (transcript.substring(0, 15).replace(/\n/g, " ") + "...");
      }

      const newRecord: GeneratedRecord = {
        id: 'rec_' + Date.now(),
        title: possibleTitle,
        transcript: transcript.substring(0, 100) + (transcript.length > 100 ? '...' : ''),
        result: data.result,
        template: selectedTemplate,
        language: selectedLanguage,
        createdAt: currentTime,
      };

      const updatedHistory = [newRecord, ...history].slice(0, 50); // 最多保留 50 筆
      setHistory(updatedHistory);
      localStorage.setItem('ai_meeting_notes_history', JSON.stringify(updatedHistory));
      setActiveHistoryId(newRecord.id);

      // 自動滾動到結果顯示區域，便利使用者快速閱讀
      setTimeout(() => {
        const element = document.getElementById('output-area');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);

    } catch (err: any) {
      setErrorMsg(err.message || "發生未知錯誤，請檢視金鑰並修正。");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 3. 歷史紀錄操作
  const handleSelectHistory = (record: GeneratedRecord) => {
    setTranscript(record.transcript && record.transcript.endsWith('...') ? "" : record.transcript); // 如果被截斷過，我們提醒用戶這可能只是預覽，不完全清空；如果能在歷史載入，為了完全還原，歷史記錄能完全儲存最好。
    // 注意：歷史記錄在 data 定義時我們是用 transcript.substring(0, 100) 存成歷史預覽，為了流暢與完整度，如果是載入歷史，主要功能是還原當時產出的「result」與所有的範本、翻譯細節。我們此處將結果及語系回填。
    setResult(record.result);
    setSelectedTemplate(record.template);
    setSelectedLanguage(record.language);
    setGeneratedAt(record.createdAt);
    setActiveHistoryId(record.id);
    setErrorMsg(null);

    // 提醒使用者我們載回了之前的生成結果
    setTimeout(() => {
      const element = document.getElementById('output-area');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleDeleteHistory = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('ai_meeting_notes_history', JSON.stringify(updated));
    if (activeHistoryId === id) {
      setActiveHistoryId(undefined);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('ai_meeting_notes_history');
    setActiveHistoryId(undefined);
  };

  const handleClearResult = () => {
    setResult("");
    setGeneratedAt(null);
    setActiveHistoryId(undefined);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col">
      
      {/* 標頭導覽區 */}
      <Header 
        health={health} 
        checking={checkingHealth} 
        onCheckHealth={checkServerHealth} 
      />

      {/* 主要工作區 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* 全域錯誤提示 Banner */}
        {errorMsg && (
          <div className="mb-6 bg-rose-50 border-l-4 border-rose-500 rounded-r-xl p-4 shadow-sm flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-bold text-rose-900 text-sm">生成過程中發生錯誤</strong>
              <p className="text-xs text-rose-700 leading-relaxed">{errorMsg}</p>
              <div className="pt-1.5 flex gap-2">
                <button 
                  onClick={handleGenerate}
                  className="bg-rose-100 hover:bg-rose-200 text-rose-800 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-sm transition-colors cursor-pointer"
                >
                  🚀 重新嘗試
                </button>
                <button 
                  onClick={() => setErrorMsg(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] px-2.5 py-1 rounded-sm transition-colors cursor-pointer"
                >
                  關閉提示
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* 左側輸入控制側欄 (幾何平衡 45% 佔比設計，佔 5 格) */}
          <section className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                    會議逐字稿輸入
                  </h2>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono">
                    臺式商務語氣精研
                  </span>
                </div>
                
                <TranscriptInput 
                  transcript={transcript}
                  setTranscript={setTranscript}
                  selectedTemplate={selectedTemplate}
                  setSelectedTemplate={setSelectedTemplate}
                  selectedLanguage={selectedLanguage}
                  setSelectedLanguage={setSelectedLanguage}
                  customInstruction={customInstruction}
                  setCustomInstruction={setCustomInstruction}
                  onSubmit={handleGenerate}
                  loading={loading}
                  apiKeyConfigured={!!health?.apiKeyConfigured}
                />
              </div>
            </div>
          </section>

          {/* 右側結果與歷史側欄 (幾何平衡 55% 佔比設計，佔 7 格) */}
          <section className="lg:col-span-7 space-y-6 flex flex-col justify-between">
            
            <div className="space-y-6 flex-1">
              {/* 結果展示區 */}
              <div id="output-area" className="scroll-mt-20">
                <OutputDisplay 
                  result={result}
                  loading={loading}
                  generatedAt={generatedAt}
                  onClearResult={handleClearResult}
                />
              </div>

              {/* 歷史快取紀錄 */}
              <div>
                <HistoryList 
                  history={history}
                  onSelectRecord={handleSelectHistory}
                  onDeleteRecord={handleDeleteHistory}
                  onClearHistory={handleClearHistory}
                  activeId={activeHistoryId}
                />
              </div>

              {/* 新手貼心指南，加強專業度 */}
              <div className="bg-gradient-to-tr from-slate-800 to-indigo-950 text-slate-300 rounded-2xl p-5 shadow-sm">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4 text-indigo-400" />
                  💡 完美的逐字稿處理密技
                </h4>
                <ul className="space-y-2 text-[11px] text-slate-300 leading-relaxed list-disc list-inside">
                  <li>
                    <strong className="text-white">保留發言者前綴</strong>：如 A:、B:、陳經理: 等，AI 特助能精準自動追隨發言脈絡，分析其任務成果與派工。
                  </li>
                  <li>
                    <strong className="text-white">善用範本與語調</strong>：腦力激盪、每日站會、技術規格等範本，會微調底層 AI 的思考維度，給您最合適的結果呈現。
                  </li>
                  <li>
                    <strong className="text-white">一鍵外銷多語系</strong>：設定翻譯語系後，您會獲得一份中外語對照的雙語會議紀錄，最適合跨國團隊協同工作。
                  </li>
                </ul>
              </div>
            </div>

          </section>

        </div>
      </main>

      {/* 頁尾 - 符合 Geometric Balance 極致俐落商務風格 */}
      <footer className="h-12 bg-slate-800 text-slate-400 flex flex-col sm:flex-row items-center justify-between px-4 sm:px-8 py-2 sm:py-0 text-[10px] uppercase tracking-widest shrink-0 border-t border-slate-700/60 mt-16 mt-auto">
        <div>© 2026 AI 會議記錄智囊 - Powered by Gemini</div>
        <div className="flex gap-4">
          <span className="text-slate-500 font-medium">安全金鑰隱私保護</span>
          <span className="text-indigo-400">臺灣標準商務格式</span>
        </div>
      </footer>

    </div>
  );
}
