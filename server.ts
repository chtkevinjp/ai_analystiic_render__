import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// 載入環境變數
dotenv.config();

const app = express();
const PORT = 3000;

// 設置加大限制，以防會議逐字稿內容超長
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// 預設的精美繁體中文 System Instructions
export const DEFAULT_SYSTEM_INSTRUCTION = `你是一位專業的高級行政特助與多語系專業口譯專家。你的任務是將使用者提供的「會議逐字稿」或「重點筆記」進行深度分析、結構化重組，生成兼具專業度、精準度與易讀性的「繁體中文」會議記錄與摘要。

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

---
(如果有啟用翻譯功能，後續在此生成外語對照版，標題例如：## 🌐 英文版會議記錄與翻譯 / English Meeting Minutes)
`;

// 延遲初始化 @google/genai client，避免在啟動時因為缺乏 Key 而造成 Container 崩潰
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("尚未設定 GEMINI_API_KEY 環境變數。請在 AI Studio 中點擊 Settings > Secrets 設定您的金鑰。");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 1. API: 檢查服務健康狀態與金鑰狀態
app.get("/api/health", (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";
  res.json({
    status: "ok",
    apiKeyConfigured: hasKey,
    time: new Date().toISOString()
  });
});

// 2. API: 生成記錄與翻譯核心端點
app.post("/api/generate", async (req, res) => {
  try {
    const { transcript, template, language, customInstruction } = req.body;

    if (!transcript || transcript.trim() === "") {
      return res.status(400).json({ error: "請輸入或貼上會議逐字稿、重點筆記。" });
    }

    const ai = getAiClient();

    // 彙整最終的 System Instruction 
    let systemInstruction = customInstruction || DEFAULT_SYSTEM_INSTRUCTION;

    // 針對不同範本附加一些特定指示
    let promptAddition = "\n\n";
    if (template === "todo") {
      promptAddition += "【特別要求：此會議重點放在「代辦事項(Action Items)」與「項目進度追蹤」，請大幅度並精確地列出待辦事項表格，並著重細節，將模糊的討論轉換為具體且可執行的明確事項。】\n";
    } else if (template === "agile") {
      promptAddition += "【特別要求：請以敏捷開發(Agile/Scrum/Standup)格式撰寫：分為「昨天完成了什麼」、「今天計畫做什麼」、「面臨的阻礙/需要協助的事項」，並精準摘要。】\n";
    } else if (template === "brainstorm") {
      promptAddition += "【特別要求：這是一場腦力激盪、創意或行銷企劃探討。請聚焦在「提出的創意想法/點子庫」、「可行性評估」、「突出的金句或亮點」，不要隱藏任何具有潛力的天馬行空想法。】\n";
    } else if (template === "technical") {
      promptAddition += "【特別要求：這是技術深對談或架構討論。請使用專業理性的工程師筆吻，著重在「系統架構決議」、「技術棧選擇」、「核心挑戰與解決方案」、「資安/運維考量」以及「技術債與限制」。】\n";
    }

    if (language && language !== "none") {
      let langName = "應對之語言";
      switch (language) {
        case "en": langName = "英文 (English)"; break;
        case "ja": langName = "日文 (Japanese)"; break;
        case "ko": langName = "韓文 (Korean)"; break;
        case "zh-cn": langName = "簡體中文 (Simplified Chinese)"; break;
        case "de": langName = "德文 (German)"; break;
        case "fr": langName = "法文 (French)"; break;
        case "es": langName = "西班牙文 (Spanish)"; break;
      }
      promptAddition += `\n【重要翻译指示】：本會議要求額外進行翻譯。請將所生成的「完整會議記錄」（包含標題、摘要、討論要點、表格與後續步驟），以完美的翻譯品質翻譯為「${langName}」，並在主中文會議記錄最下方，新增「## 🌐 ${langName} 對照版會議記錄與翻譯」區塊來進行完整呈現。請確保翻譯句型自然、格式一模一樣，並符合目標語系的商務用語。`;
    }

    const userPrompt = `${transcript}\n${promptAddition}`;

    // 呼叫 Gemini 3.5 Flash Model
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.35, // 稍低可以使資訊整理更精準、更具一致性
      }
    });

    const resultTxt = response.text || "生成的結果為空，請檢查輸入內容是否過於簡略。";

    return res.json({
      success: true,
      result: resultTxt,
      modelUsed: "gemini-3.5-flash",
      generatedAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "呼叫 AI 引擎時發生未知錯誤，請檢視伺服器日誌。"
    });
  }
});

// Vite & Static file handling
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // 開發階段：掛載 Vite Middleware 來維持快速反應
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware integrated.");
  } else {
    // 生產階段：直接 Serving 靜態編譯結果 (dist/)
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Static files directory served in production mode.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server startup completed on: http://0.0.0.0:${PORT}`);
  });
}

startServer();
