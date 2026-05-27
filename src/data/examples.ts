import { TemplateOption, LanguageOption, ExampleTranscript } from "../types";

export const TEMPLATE_OPTIONS: TemplateOption[] = [
  {
    id: "standard",
    name: "標準會議總結",
    description: "全面、經典的排版。包含會議摘要、重點討論、決議與待辦事項清單。",
    icon: "FileText"
  },
  {
    id: "todo",
    name: "待辦清單導向",
    description: "焦點偏向「任務追蹤」。列出極具行動力的任務、明確的推測負責人與時程表格。",
    icon: "CheckSquare"
  },
  {
    id: "agile",
    name: "敏捷每日站會",
    description: "依循 Scrum 開發：分為「昨日成果」、「今日計畫」與「目前遭遇阻礙(Blocker)」。",
    icon: "Layers"
  },
  {
    id: "brainstorm",
    name: "腦力激盪彙整",
    description: "適合企劃、行銷、產品發想。提取「創意庫」、「特色金句」、「可行性分析」等想法。",
    icon: "Lightbulb"
  },
  {
    id: "technical",
    name: "技術深探與架構",
    description: "適合工程團隊。聚焦「架構決策」、「技術堆疊」、「核心挑戰(技術債)」與「資安運維」。",
    icon: "Cpu"
  }
];

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { id: "none", name: "僅生成中文（不需翻譯）" },
  { id: "en", name: "翻譯成 英文 (English)" },
  { id: "ja", name: "翻譯成 日文 (Japanese)" },
  { id: "ko", name: "翻譯成 韓文 (Korean)" },
  { id: "zh-cn", name: "翻譯成 簡體中文 (Simplified Chinese)" },
  { id: "de", name: "翻譯成 德文 (German)" },
  { id: "fr", name: "翻譯成 法文 (French)" },
  { id: "es", name: "翻譯成 西班牙文 (Spanish)" }
];

export const EXAMPLE_TRANSCRIPTS: ExampleTranscript[] = [
  {
    id: "marketing-brainstorm",
    title: "💡 夏季新品冰咖啡行銷腦力激盪",
    category: "行銷提案",
    content: `時間：下午 2:00
與會人員：行銷總監 Leo、品牌經理 Sharon、社群企劃 Vic

Leo: 大家好，今天主要來聊聊我們 7 月份要推出的「椰椰冷萃冰咖啡」新品上市方案。行銷預算大概是 30 萬。 Sharon，妳那邊有沒有什麼初步想法？

Sharon: 有，我建議這次以「清涼海島避暑」做主視覺主題。現在大家工作壓力大，我們包裝可以做成半透明的漸層天藍色，吸管杯上也印「一杯飛到沖繩」的標語。針對主力群眾 20 到 35 歲，我們可以在信義區辦一場快閃「沙灘躺椅體驗展」，只要在現場拍照打卡，就可以免費兌換一整杯新品，限時 3 天，這樣一來社群擴散度會很高。

Vic:Sharon 那個快閃店聽起來超棒！我覺得可以再結合社群的 UGC。我們在 Instagram 辦一個「找回你的島嶼生活」濾鏡活動，使用者只要拍自己最想念的海灘，然後 Tag 我們品牌。被抽中的 5 位幸運兒送「整個月免費冰咖啡」兌換券。這樣一來不用花大錢，口碑就很驚人。

Leo:vic 這個點子不賴，那快閃店估計要花掉多少預算？Sharon 妳這禮拜內做個活動企劃跟預算表給我，最好控制在 20 萬以內，剩下 10 萬留給 KOL / KOC 的開箱合作。

Sharon: 沒問題，我週五下班前會把企劃案、場地報價單整理成簡報寄給 Leo。

Vic: 那 KOL 的名單我這邊先拉一個 Excel，主要找生活美食、海洋運動或旅遊類的微型網紅（粉絲數 1 到 5 萬），因為他們的導購率跟觸及互動最真實。我預計下週一找 Leo 跟 Sharon 開會核對名單。

Leo: 好，Vic 的名單下週一提，那這次行銷的 KPI 我希望在 7 月底全台銷量突破 5 萬杯。今天的會議先到這邊，謝謝。`
  },
  {
    id: "scrum-standup",
    title: "⚡ 跨部門敏捷專案每日站會 (Daily Standup)",
    category: "Scrum 站會",
    content: `日期: 2026-05-27
成員：前端工程師 Hank、後端工程師 Ian、產品經理 (PM) Joy

Joy: 各位早，今天快速對一下「智慧旅遊排程 App」的開發進度。Hank 請先幫我們回顧一下，謝謝。

Hank: 大家早，昨天我完成了「拖拉景點卡片」的動畫微調，並解決了在 Safari 瀏覽器上拖曳時，陰影會卡住的 bug。測試後體驗很流暢。
預計今天要做的是「景點卡片與地圖標記的 API 雙向綁定」，在卡片拖動調整順序後，重新運算地圖上的路徑。
目前遇到一個棘手事情：後端景點更新路由 API 回傳的資料格式，跟前端 TypeScript 定義的 MapPoint 介面有一點出入，經度跟緯度的欄位變成了 lat / lng，但前端需要的是 latitude / longitude。這個晚點要麻煩 Ian 對一下。

Ian: 喔對，Hank，關於那個 GPS 格式，昨天我為了降低資料傳輸量，調整了資料庫欄位名稱。抱歉沒提早跟你說，我等一下 11 點跑一個相容性 middleware 轉接器，把 latitude/longitude 給補上。
另外我昨天工作是把「AI 最佳化排程算法」發布到測試環境了，現在每次調用已經能控制在 2 秒內。
預計今天要把「用戶歷史排程儲存」的功能在資料庫開 Table，並寫好對應的 CRUD 路由。
目前沒有其他阻礙。

Joy: 收到，感謝兩位。Hank，等 Ian 在 11 點修復完後，你們倆直接在 Slack 上核對一次。沒問題我就通知 QA 團隊明天開始對 AI 路徑優化作壓力測試。今天站會先到這邊，大家加把勁！`
  },
  {
    id: "technical-discussion",
    title: "⚙️ 資料庫轉移雲端與 API 安全架構會議",
    category: "技術決策",
    content: `與會人：架構師 Alex、資安負責人 Charles、DBA Nicole

Alex: 感謝大家抽空，由於我們現在在地端機房的 Server 面臨硬體老化的狀況，今天我們要敲定將「核心交易 DB」轉移至雲端，以及後續 API 串接與密鑰保護的具體作法。 Nicole，先講資料庫這塊。

Nicole: 好的。地端交易資料量大概在 800GB 左右。為了確保零停機或最少停機（Minimize Downtime），我建議採用 Cloud SQL for PostgreSQL 搭配 Database Migration Service。我們會先做一輪試轉移、估算網路頻寬占用，並將正式轉移時間定在 6/15（週日）凌晨 2:00 到 4:00。
有個重大限制：資料實體不能保留在公網上。我們需要在 VPC 設定 Private IP 進行連接，並關閉資料庫的 Public IP。

Charles: Nicole 做得好，關閉 Public IP 非常重要。那 AP 伺服器這端，Alex，你們微服務呼叫 DB 還有第三方 API 金鑰的保護機制打算怎麼設計？

Alex:Charles 放心，我們所有 API 密鑰（包括 AWS, Google Cloud, 還有簡訊服務金鑰）絕對不允許放到 git repository 或任何 client-side。
我們預計部署在 Cloud Run 並啟用 Secret Manager。程式在運行時，透過服務帳戶 (Service Account) 的 IAM 最小授權，動態從環境變數拉取 Secret。這樣前端就完全碰不到金鑰。
微服務 API 本身，我們使用 JWT 進行驗證，時效性設為 15 分鐘。

Charles: 安全度聽起來很高。但我建議另外配置 Secret "Auto-rotation"（自動輪替）機制，例如每 90 天自動更新一次簡訊服務金鑰，以免洩漏。這項請 Alex 列去待辦，由 Alex 負責在 6/1 之前寫好 Cloud Function 的輪替腳本。

Alex: 沒問題，這個我來寫，我們能在 6/15 轉移前部署上去。Nicole，轉移計畫的詳細 SOP 文件在什麼時候可以對外？

Nicole: 我會在下週三（6/3）整理出 Step-by-Step 的復原及驗證計畫，包括萬一轉移失敗如何 rollback。我會上傳到 Confluence 並通知兩位。

Alex: 太好了。這是一項大工程，感謝大家的努力。今天的會先開到這。`
  }
];
