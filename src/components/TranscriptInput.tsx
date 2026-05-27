import React, { useState } from 'react';
import { 
  FileText, CheckSquare, Layers, Lightbulb, Cpu, 
  Trash2, Play, Sparkles, BookOpen, Settings2, Info, AlertTriangle 
} from 'lucide-react';
import { TemplateType, TemplateOption, LanguageOption, ExampleTranscript } from '../types';
import { TEMPLATE_OPTIONS, LANGUAGE_OPTIONS, EXAMPLE_TRANSCRIPTS } from '../data/examples';

// 預設的精美繁體中文 System Instructions 常數，提供給使用者前端編輯或一鍵還原使用
export const FRONTEND_DEFAULT_SYSTEM_INSTRUCTION = `你是一位專業的高級行政特助與多語系專業口譯專家。你的任務是將使用者提供的「會議逐字稿」或「重點筆記」進行深度分析、結構化重組，生成兼具專業度、精準度與易讀性的「繁體中文」會議記錄與摘要。

請務必嚴格遵守以下格式規範，當你撰寫內容時：
1. 使用「臺灣標準繁體中文」用語，語氣務必專業、優雅、精準、客氣且得體（例如使用「專案」而非「項目」、「代辦事項」或「待辦事項」而非「待辦項目」、「資訊」而非「信息」、「軟體」而非「軟件」）。
2. 使用 Markdown 語法呈現，讓排版條理分明。使用粗體、清單、表格與引用區塊來加強層次。
3. 如果輸入的文本雜亂無章、口語化或有拼字錯誤，請在不改變原意的前提下，進行流暢的潤飾。
4. 如果逐字稿包含不同發言人（例如 A: ..., B: ...），請在內容中保留或推斷發言者，使討論背景更加完整。
5. 若使用者有特別指定翻譯目標語言，請在生成完美的繁體中文會議記錄後，於最底部額外附上一份「[指定目標語言] 版本的完整會議記錄翻譯」，其中翻譯的標題與格式需與中文版一致。

會議記錄基本結構：
# 📅 【會議記錄標題】(請根據內容產生一個專業的標題)
## 📌 會議基本資訊
- **AI 摘要時間**：(填寫目前時間或產出時間)
- **核心關鍵字**：(提取 3-5 個關鍵字)
- **發言人/與會代表(推測)**：(整理發言人名單，若無則標示「未在文本中明確提及」)

## ⚡ 一分鐘核心摘要 (Quick Summary)
- (使用 3-5 個高含金量的條列句，精確提煉會議的重大成果與核心共識)

## 💬 關鍵討論與決議事項 (Core Topics)
- **[討論主題一]**
  - **討論背景/內容**：詳細摘要討論的脈絡與各方觀點。
  - **達成的共識/決定**：本項目的決議。
- **[討論主題二]**
  - **討論背景/內容**：詳細摘要。
  - **達成的共識/決定**：決議點。

## 📋 待辦事項 (Action Items)
| 待辦任務與細節 | 負責人/推測執行者 | 狀態/時程 (若提及) |
| :--- | :--- | :--- |
| (項次一) | (負責人) | (例如：儘速完成/未註明) |

## 🔮 後續追蹤與里程碑 (Next Steps)
- (如果有，請列出後續規劃或下次會議安排，若無則填寫「無特殊後續追蹤事項」)
`;

interface TranscriptInputProps {
  transcript: string;
  setTranscript: (text: string) => void;
  selectedTemplate: TemplateType;
  setSelectedTemplate: (tpl: TemplateType) => void;
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  customInstruction: string;
  setCustomInstruction: (ins: string) => void;
  onSubmit: () => void;
  loading: boolean;
  apiKeyConfigured: boolean;
}

export default function TranscriptInput({
  transcript,
  setTranscript,
  selectedTemplate,
  setSelectedTemplate,
  selectedLanguage,
  setSelectedLanguage,
  customInstruction,
  setCustomInstruction,
  onSubmit,
  loading,
  apiKeyConfigured
}: TranscriptInputProps) {
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // 渲染 Lucide 圖像的對應
  const renderTemplateIcon = (iconName: string) => {
    const iconClass = "h-5 w-5 text-indigo-600";
    switch (iconName) {
      case "FileText": return <FileText className={iconClass} />;
      case "CheckSquare": return <CheckSquare className={iconClass} />;
      case "Layers": return <Layers className={iconClass} />;
      case "Lightbulb": return <Lightbulb className={iconClass} />;
      case "Cpu": return <Cpu className={iconClass} />;
      default: return <FileText className={iconClass} />;
    }
  };

  // 載入預設的會議範例
  const handleLoadExample = (example: ExampleTranscript) => {
    setTranscript(example.content);
    // 依據範例貼心匹配最適用的範本
    if (example.id === "marketing-brainstorm") {
      setSelectedTemplate("brainstorm");
    } else if (example.id === "scrum-standup") {
      setSelectedTemplate("agile");
    } else if (example.id === "technical-discussion") {
      setSelectedTemplate("technical");
    }
  };

  const handleResetInstruction = () => {
    setCustomInstruction(FRONTEND_DEFAULT_SYSTEM_INSTRUCTION);
  };

  return (
    <div className="space-y-6">
      
      {/* 範例快速載入 */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <label className="text-xs font-semibold text-slate-700 tracking-wider uppercase mb-2.5 flex items-center gap-1.5">
          <BookOpen className="h-4 w-4 text-indigo-500" />
          💡 快速雙擊或單擊載入會議逐字稿範本 
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {EXAMPLE_TRANSCRIPTS.map((example) => (
            <button
              key={example.id}
              onClick={() => handleLoadExample(example)}
              type="button"
              className="flex flex-col items-start p-3 text-left bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 active:bg-indigo-50/50 rounded-lg transition-all shadow-xs cursor-pointer group"
            >
              <span className="text-xs font-semibold text-slate-800 group-hover:text-indigo-700 truncate w-full">
                {example.title}
              </span>
              <span className="text-[10px] bg-slate-100 group-hover:bg-indigo-100 text-slate-500 group-hover:text-indigo-700 px-1.5 py-0.5 rounded mt-1.5 font-medium transition-colors">
                {example.category}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 逐字稿大文字方塊 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
            📝 會議逐字稿或重點筆記
            <span className="text-rose-500">*</span>
          </label>
          {transcript && (
            <button
              onClick={() => setTranscript("")}
              type="button"
              className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer transition-colors px-2 py-1 rounded hover:bg-rose-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>清空全部</span>
            </button>
          )}
        </div>
        <div className="relative">
          <textarea
            id="transcript-textarea"
            className="w-full min-h-[280px] p-4 text-sm text-slate-800 bg-white border border-slate-300 rounded-xl shadow-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans leading-relaxed resize-y"
            placeholder="請在此貼上您的會議錄音逐字稿、團隊討論的凌亂發言紀錄，或是隨手寫下的會議大綱點子...

提供越清晰的文字內容，AI 會議特助生成的總結與翻譯品質越加完美！"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            disabled={loading}
          />
          {transcript && (
            <div className="absolute bottom-3 right-4 text-[10px] text-slate-400 font-mono pointer-events-none">
              已輸入 {transcript.length} 字
            </div>
          )}
        </div>
      </div>

      {/* 範本格式選擇 (五種客製化卡片) */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
          🎯 選擇會議輸出範本格式
        </label>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
          {TEMPLATE_OPTIONS.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => setSelectedTemplate(tpl.id)}
              type="button"
              className={`flex flex-col items-center justify-between p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                selectedTemplate === tpl.id
                  ? 'bg-gradient-to-b from-indigo-50 to-white border-indigo-600 shadow-md shadow-indigo-100 ring-1 ring-indigo-500/50'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className={`p-2 rounded-lg mb-2 ${selectedTemplate === tpl.id ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100'}`}>
                {renderTemplateIcon(tpl.icon)}
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-800">{tpl.name}</h4>
                <p className="text-[10px] text-slate-500 leading-snug line-clamp-2 md:line-clamp-3">
                  {tpl.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 翻譯目標語言設置 */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
          🌐 額外多語系專業級翻譯對照
        </label>
        <div className="relative">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            disabled={loading}
            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-700 shadow-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-hidden cursor-pointer"
          >
            {LANGUAGE_OPTIONS.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 進階：自定義 System Instructions 折疊項目 */}
      <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-xs">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          type="button"
          className="w-full flex items-center justify-between px-4 py-3.5 bg-slate-50 border-b border-slate-100 hover:bg-slate-100/50 transition-colors cursor-pointer text-left"
        >
          <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-slate-500" />
            🧠 進階 AI 角色與行動指令客製化 (System Instructions)
          </span>
          <span className="text-xs text-indigo-600 font-medium">
            {showAdvanced ? "收合設定 ▴" : "展開自訂 ▾"}
          </span>
        </button>

        {showAdvanced && (
          <div className="p-4 space-y-3 bg-white">
            <div className="flex items-start gap-2 bg-indigo-50/50 border border-indigo-100 rounded-lg p-3 text-xs text-slate-600 leading-relaxed">
              <Info className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                這是底層傳遞給 Google Gemini AI 模型的系統行為指示 (System Instructions)。您可以依照貴公司的會議特徵與術語需求，於此客製 AI 的引導規則與語言標準。
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">系統提示設定值 (System Prompt)</span>
                <button
                  type="button"
                  onClick={handleResetInstruction}
                  className="text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                >
                  重設為預設特助提示
                </button>
              </div>
              <textarea
                className="w-full min-h-[220px] p-3 text-xs text-slate-700 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                disabled={loading}
                placeholder="在此編輯底層 System Prompt..."
              />
            </div>
          </div>
        )}
      </div>

      {/* 注意提示若 API Key 未設定 */}
      {!apiKeyConfigured && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 flex gap-3 text-xs">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-bold">提醒您：Gemini API 安全金鑰尚未設定</strong>
            <p className="text-amber-700 leading-relaxed">
              系統目前未偵測到您的服務金鑰。要解決此問題，請回到 AI Studio 右上角，點擊 <span className="font-semibold text-slate-900">Settings &gt; Secrets</span> 並新增 <span className="font-semibold text-slate-900">GEMINI_API_KEY</span> 才能正常使用生成功能。
            </p>
          </div>
        </div>
      )}

      {/* 送出與生成按鈕 */}
      <button
        onClick={onSubmit}
        type="button"
        disabled={loading || !transcript.trim()}
        className={`w-full py-4 px-6 rounded-xl font-bold text-white flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md select-none ${
          loading 
            ? 'bg-slate-400 shadow-none cursor-not-allowed' 
            : !transcript.trim()
              ? 'bg-indigo-300 shadow-none cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-indigo-100 active:scale-[0.99]'
        }`}
      >
        {loading ? (
          <>
            <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
            <span className="animate-pulse">特助正在認真理解與生成中，請稍候... (約需數秒)</span>
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5 animate-bounce" />
            <span>生成總結與翻譯會議記錄</span>
          </>
        )}
      </button>

    </div>
  );
}
