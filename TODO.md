# TAIFEX Web & Ecosystem To-Do List

這份清單統整 `taifex_web`、`taifex_daily` 與 `taifex_infra` 的改善路徑圖（Roadmap）與後續待辦事項。

---

## 2026-10-22：最終檢查完成，前端提交

10/20 發現的前端金額重複換算已修正；10/22 本機更新與自動測試已確認通過。使用者已確認桌機／手機互動、圖表載入及快取觀察正常，並授權前端提交。完整資料匯出核對及現貨修訂原因留待後端處理；本次不 push。

### 今日狀況紀錄（2026/10/20）

- 修正前端將後端「億元」金額再次除以 10 的錯誤，涵蓋外資現貨、現貨前日差額與主圖期貨／現貨／選擇權金額。使用者確認今日外資現貨為 −795.40 億；程式計算前日差額為 −27.97 億。
- 新增金額單位回歸測試，先確認修正前失敗；修正後 `node tests/metrics.cjs`、`node tests/summary-disclosure.cjs`、`node --check style/main.js`、`git diff --check` 均通過。後端 8 項測試亦通過。
- 四份 JSON 已確認排序且無重複日期，最新交易日均為 2026/10/20；FUT_TX／data／data_MTX 各 1,651 筆，FUT_MTX 為 1,559 筆。外資部位歷史共 2,386 日，當日 TX／TXO CALL／TXO PUT 三組完整；尚未完成全歷史逐日資料庫核對與實際資料同日重跑驗證。
- 實際排程位於 Selenium 容器，法人資料於 17:00、20:00 更新；今日日誌顯示 17:02 匯出成功。宿主機 TAIFEX cron 已註解，未據此判定排程異常。
- 網站資料 HTTP 200 且與磁碟一致，公開網站 JS 已確認包含修正。自動瀏覽器在公開／內網網址均因外部 Highcharts 腳本載入受阻（HTTP 403／ERR_BLOCKED_BY_ORB）而無法完成圖表互動驗證；此結果不列為已確認的網站 bug，圖表與桌機／手機互動由使用者協助檢查。
- 快取量測：四份 JSON 合計 793,399 bytes，三次平行下載中位數內網約 15 ms、公開網址約 36 ms；這不是完整頁面繪製時間。ETag 條件請求均回應 304，未觀察到舊資料或因缺少快取導致的明顯下載延遲；實際瀏覽器刷新快取行為仍未完整驗證。
- 使用者決定暫不調整 Cache-Control，也不升級 Python；Python 3.8 支援到期提醒保留為後續環境改善事項。目前沒有其他已確認、尚未修復的功能錯誤，2026/10/21、2026/10/22 繼續觀察。

### 追加檢查紀錄（2026/10/21）

- 本機四份 JSON 最新交易日均為 2026/10/21，日期排序正確且無重複；FUT_TX／data／data_MTX 各 1,652 筆，FUT_MTX 為 1,560 筆。根目錄三份前端資料連結均指向對應的 web_json/ 檔案。
- 摘要計算結果交易日為 2026/10/21：TX 收盤 46,648、外資 TX 淨部位 −86,072 口、外資現貨 +9.60 億，較前日增加 805.00 億。
- foreign_positions.json 共 2,387 日，最新日期為 2026-10-21；TX 買／賣 9,410／95,482 口、TXO CALL 11,365／11,308 口、TXO PUT 8,672／6,594 口。三組資料完整，TX 買賣差額與摘要 −86,072 口一致。
- 重新執行 `node tests/metrics.cjs`、`node tests/summary-disclosure.cjs`、`node --check style/main.js` 與 `git diff --check`，全部通過。
- 首輪僅核對本機資料與前端自動檢查；本次追加核對前端修改與後端匯出流程，後端 foreign_positions 與 json_exports 兩組共 8 項測試全部通過。前端兩組測試、JS 語法與 whitespace 檢查亦重新通過。尚未重新驗證公開網站、排程日誌或實際瀏覽器互動，尚未 commit／push。
- 已檢查 index.html、style/main.css、style/main.js、README.md 與前端 tests/：同日明細讀取、億元單位、比例分界、3 秒倒數與取消條件均有實作；測試使用模擬 DOM／Highcharts，不能代替桌機與手機實測或裁切檢查。後端匯出器具備唯讀資料庫、保留其他日期、不完整資料不發布及原子替換流程，pipeline 已呼叫同日部位匯出。
- 全歷史唯讀比對與實際資料暫存匯出檢查已嘗試，但指令在一次正常等待後仍無輸出；依 Bash 停滯規則停止等待，不重試，本項不列為通過。2026/10/22 觀察、全歷史資料庫核對及同日重跑驗證仍待完成。
- 後端資料完整性 TODO 已確認位於 ../taifex_daily/TODO_backend_data_integrity.md，已修正下方連結。

### 最終檢查紀錄（2026/10/22）

- 四份主要 JSON 均已更新至 2026/10/22，日期排序且無重複：FUT_TX／data／data_MTX 各 1,653 筆，FUT_MTX 為 1,561 筆。相對 HEAD 各新增 351 個日期，既有日期差異數仍為 FUT_TX 0、FUT_MTX 0、data 3、data_MTX 0。
- 摘要交易日為 2026/10/22：TX 收盤 46,272、成交量 54,398 口、外資 TX 淨部位 −87,297 口、現貨 −816.57 億。10/21 現貨目前檔案為 +22.39 億，與前次檢查的 +9.60 億不同，因此最新前日差額為 −838.96 億；此處記錄資料變更，未據此認定前端單位錯誤，現貨修訂原因仍待後端確認。
- foreign_positions.json 共 2,388 日；逐日唯讀比對已發布日期的所有部位數值，與 II_DB.db 一致。2,341 日含三組商品，47 個早期日期僅含 TX，與資料庫的缺項一致；資料庫中三組完整的日期均已發布。這項核對不代表四份主要 JSON 均已完成全歷史資料庫比對。
- 10/22 三組部位完整：TX 買／賣 8,126／95,423、TXO CALL 14,300／14,125、TXO PUT 11,371／9,474 口；TX 差額與摘要一致。
- 使用實際資料庫，在暫存目錄重跑 10/22 部位匯出兩次：與發布檔語意一致、保留其他日期，兩次輸出逐 byte 相同；未覆寫正式 JSON。四份主要 JSON 的實際資料重跑仍未完成。
- 前端兩組測試、`node --check style/main.js`、`git diff --check` 及後端 foreign_positions／json_exports 共 8 項測試全部通過。
- 內網 http://192.168.10.27:8080/data.json 下載成功，內容與本機發布檔一致；這不代表圖表渲染、公開網址或瀏覽器刷新快取已驗證。
- 已啟動桌機／手機模擬 Chrome 檢查，但進入桌機網址後一次正常等待仍無新輸出；依 Bash 規則停止等待、不重試，未取得通過結果。實體手機、比例圖裁切及瀏覽器快取仍待手動確認。
- 使用者後續確認桌機／手機互動、圖表載入及快取觀察目前均正常；前端未有已確認且未修復的功能錯誤，已授權建立 commit。後端未完成驗證及現貨修訂原因保留待辦。
- 本次前端提交包含程式、文件、兩份測試及 foreign_positions.json；四份主要 JSON 的歷史修正／新增資料與 8 份原始匯出檔保留工作目錄，另行處理，不將資料更新混入本次前端提交。
- 提交前再次執行前端測試通過；當時 10/22 現貨資料已更新為 −815.82 億，前日差額 −838.21 億。上方 −816.57 億為稍早檢查快照，資料修訂原因仍交由後端確認。

### 提交範圍核對（2026/10/21，尚未 stage）

- 前端程式／文件：index.html、style/main.css、style/main.js、README.md、TODO.md；測試為 tests/metrics.cjs、tests/summary-disclosure.cjs，新增發布資料為 web_json/foreign_positions.json。
- 相對目前 HEAD，四份主要 JSON 各新增 350 個日期，因此差異不只是 10/20、10/21 的每日資料。FUT_TX 與 data_MTX 的既有日期內容未變；FUT_MTX 移除 699 筆重複且保留日期內容未變；data.json 有 3 個既有日期內容變更。這是相對 HEAD 的提交差異，不等同前述修正作業曾處理的 6 個日期。
- 歷史修正與新增日期位於相同 JSON 檔案，提交前需決定是否一併納入或另外產生分階段資料快照，不能只按檔名視為已分離。
- web_json/TX_20261020、TX_20261020_full、TX_20261021、TX_20261021_full 與對應 MTX 共 8 份原始匯出檔先排除於前端程式提交，待確認資料保存範圍。
- 後端另行處理 README.md、get_data.py、mining_rpt.py、lib/export_utils.py、新增 lib/foreign_positions.py、tests/test_foreign_positions.py、tests/test_json_exports.py；後端資料庫、日誌、devices/ 憑證及其他未追蹤檔不因本次檢查而加入提交。

### 本次已完成

- [x] 頂部聚焦 TX 收盤、外資 TX 淨部位、TX 成交量，保留前日比較；成交量增加 20 日均量比。
- [x] 移除 120 日百分位，改以外資 TX／TXO CALL／TXO PUT 三條買賣比例圖顯示未平倉結構。
- [x] 買方藍色、賣方琥珀色，圓點標示比例分界；各列保留口數及百分比，增加底部留白避免裁切。
- [x] 明細預設展開，載入完成後 3 秒自動收合；滑鼠停留／移入、操作摘要、捲到主圖或切換分頁會取消倒數。手動展開後當次不再倒數，重新整理可再次啟動。
- [x] 卡片可點擊展開／收合；卡片內小型 SVG 圓角按鈕及上滑收合動畫支援桌機與手機，保留減少動態效果設定。
- [x] 主圖預設 6M，簡化文字與裝飾；中文字型優先思源黑體系列，網站載入 Noto Sans TC，後備標楷體。
- [x] 外資現貨顯示前日金額變化；明細依頂部摘要交易日讀取 foreign_positions.json。
- [x] 每日與手動匯出均集中於 taifex_daily/lib/foreign_positions.py；前端移除手動匯出包裝腳本，保留前端測試及發布 JSON。
- [x] FUT_MTX.json 清除 699 筆重複；data.json 修正 6 個歷史日期的期貨金額。四份既有 JSON 已確認無重複日期。
- [x] 修正前後端億元單位契約，移除前端重複除以 10；補上摘要、現貨差額及主圖金額回歸測試。

### 觀察結果與剩餘驗證

- [x] 2026/10/20：完成測試、JSON 日期與重複檢查、排程日誌及 HTTP 核對；修正金額單位錯誤，使用者確認外資現貨顯示正確。
- [x] 2026/10/21：本機資料已更新，摘要交易日與三組留倉明細均為當日；自動檢查通過，公開網站與互動驗證另列待辦。
- [x] 2026/10/22：確認本機資料更新、摘要與當日三組明細一致，自動測試通過；現貨修訂差異及未完成驗證已記錄於上方。
- [x] 桌機 Chrome 與手機檢查 3 秒收合、滑鼠取消、卡片點擊、說明區獨立操作及比例圖裁切；使用者確認目前正常。
- [x] 確認圖表與最新資料可載入，沒有快取導致日期落後或資料不一致；使用者確認目前正常。
- [ ] 完成全歷史逐日資料庫核對及實際資料同日重跑一致性驗證。
- [x] 部位 JSON 全歷史已發布日期與資料庫數值核對，以及 10/22 部位匯出暫存重跑一致性驗證；47 個早期缺項日期已記錄。
- [ ] 完成 FUT_TX／FUT_MTX／data／data_MTX 全歷史資料庫核對與實際資料重跑；前項整體驗證因此保留未完成。
- [ ] 確認 10/21 現貨由 +9.60 億變為 +22.39 億的後端資料修訂原因。

### 觀察後待提交

後端資料完整性改善另列於 [TODO_backend_data_integrity.md](../taifex_daily/TODO_backend_data_integrity.md)。先完成兩天觀察與本清單的提交，再處理該檔事項；目前不進行後端防護修改。

- [x] 2026/10/22 已執行 `node tests/metrics.cjs`、`node tests/summary-disclosure.cjs`、`node --check style/main.js` 與 `git diff --check`，全部通過；若內容有變更，提交前重跑。
- [x] 檢查前端與說明檔：index.html、style/main.css、style/main.js、README.md、TODO.md；完成程式與文件核對，實際瀏覽器驗證另列。
- [x] 檢查前端 tests/ 及 web_json/foreign_positions.json；已檢查後端 lib/foreign_positions.py、tests/test_foreign_positions.py、tests/test_json_exports.py 與相關 pipeline，8 項後端測試通過；後端提交仍另於 taifex_daily 處理，全歷史驗證另列。
- [x] 已區分歷史修正、新增日期與原始匯出檔範圍，詳見上方提交範圍核對；未 stage 任何檔案，最終拆分與提交仍待觀察後確認。
- [x] 使用者已確認觀察結果並授權依 commit skill 提交前端；taifex_daily 與主要 JSON 資料更新另行提交。

---

## 🗺️ 專案改善路徑圖 (Roadmap Recap)

| 階段 | 主軸 | 範圍 | 狀態 |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **前端 UI/UX 現代化翻新** | `taifex_web` | ✅ **已完成** (`b4394c7`) |
| **Phase 2** | **資料契約與檔案分片** | `taifex_web`, `taifex_daily` | 📋 待處理 |
| **Phase 3** | **爬蟲輕量化與監控告警** | `taifex_daily` | 📋 待處理 |
| **Phase 4** | **完全容器化與環境解耦** | `taifex_infra`, `taifex_daily` | 📋 待處理 |

---

## 📋 詳細待辦事項 (Tasks)

### Phase 1: 前端 UI/UX 翻新 (Completed)
- [x] **頂部 KPI 數據卡片**：台指期收盤價、漲跌點數、外資期貨淨未平倉、外資現貨買賣超、小台三大法人合計、台指期成交量。
- [x] **深色金融終端視覺**：升級為半透明磨砂導航列、卡片式邊框陰影、台灣市場紅漲綠跌標準配色。
- [x] **快捷時間區間切換**：在圖表卡片右上角新增 1月、3月、6月、1年、全時間範圍快速過濾鍵。
- [x] **載入狀態與防禦性處理**：實作流動光感骨架屏（Skeleton Screen）與抓取失敗重試橫幅。
- [x] **響應式佈局 (RWD)**：彈性網格適配行動裝置，改善原版固定外距造成的畫面擠壓。

---

### Phase 2: 資料契約與檔案分片 (Data Contracts & Slicing)
- [ ] **資料契約具名化 (Domain Modeling)**
  - 現狀：JSON 採純多維陣列（如 `data[i][0]`, `data[i][1]`），缺乏型別與欄位名稱保護。
  - 目標：改為包含欄位宣告的結構或具名物件陣列（如 `{ timestamp, txLots, spotAmount, ... }`），防止欄位位移時前端靜默出錯。
- [ ] **歷史資料分片 (Data Slicing & Lazy Loading)**
  - 現狀：`FUT_TX.json` 與 `data.json` 包含 2020 年以來的全歷史資料，單檔體積持續成長。
  - 目標：拆分為「近一年常駐檔」與「歷史封存檔」，前端預設僅下載近一年，使用者切換長週期時按需載入。
- [ ] **瀏覽器快取策略 (Cache-Control & Cache Busting)**
  - 現狀：檔案名固定且直接 fetch，易因瀏覽器本地快取讀到舊盤後資料。
  - 目標：在 fetch 請求時加入時間戳/版本號查詢參數（如 `?v=YYYYMMDD`），並在 Apache 配置中針對 `web_json/` 設定合理的快取標頭。

---

### Phase 3: 爬蟲輕量化與監控告警 (Crawler Optimization & Alerting)
- [ ] **以輕量 HTTP 請求取代 Selenium**
  - 現狀：`taifex_daily/get_data.py` 使用 Selenium 無頭 Chrome 抓取三大法人網頁，資源開銷大且易受 ChromeDriver 版本升級影響。
  - 目標：直接以 `requests` 或 `httpx` 呼叫台期所提供之 CSV 或查詢 POST 介面，將執行時間降至數秒內並免除瀏覽器依賴。
- [ ] **錯誤監控與推播告警 (Notification & Alerting)**
  - 現狀：每日排程錯誤僅寫入本機 `log.txt`，資料斷更不易即時發現。
  - 目標：串接 Telegram Bot 或 Discord Webhook，當下載失敗或資料校驗異常時發送即時通知。
- [ ] **夜盤視覺化支援評估**
  - 現狀：夜盤資料目前僅產出 CSV 檔，未進入 Web 展示。
  - 目標：評估是否在前端增加「全日盤 / 夜盤」切換選項或子圖表。

---

### Phase 4: 完全容器化與基礎架構 (Full Containerization)
- [ ] **排程服務容器化 (Containerized Scheduler)**
  - 現狀：仰賴宿主機作業系統的 crontab（`taifex_cron.txt`）。
  - 目標：在 `taifex_infra/docker-compose.yml` 中新增輕量 cron/scheduler 容器，讓資料抓取與網站託管能一鍵整體啟動。
- [ ] **消除絕對路徑硬編碼**
  - 現狀：腳本內含 `$HOME/git/...` 或特定家目錄絕對路徑。
  - 目標：全面使用環境變數（如 `DATA_DIR`, `WEB_DIR`）與專案相對路徑，降低遷移部署摩擦。
- [ ] **容器健康檢查 (Docker Healthcheck)**
  - 為 `taifex-web` 與資料處理容器設定健康檢查狀態監控。
