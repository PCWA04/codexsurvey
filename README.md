# Vibe Coding Workshop Feedback

這是一個正式課後意見回饋問卷。前端是 React / Vite，資料可透過 Google Apps Script 寫入 Google Sheet。

## 本機執行

```bash
npm install
npm run dev
```

開啟終端機顯示的本機網址，例如 `http://127.0.0.1:5173/`。

## 正式部署建議

建議使用：

- 前端：Vercel、Netlify 或 GitHub Pages
- 收表：Google Sheet + Apps Script Web App

這樣學員填表時不需要登入，也不需要你架設資料庫。

## 步驟 1：建立 Google Sheet 收表

1. 建立一個新的 Google Sheet。
2. 點選「擴充功能」→「Apps Script」。
3. 將 `google-apps-script/Code.gs` 的內容貼到 Apps Script。
4. 儲存專案。
5. 點選「部署」→「新增部署作業」。
6. 類型選「網頁應用程式」。
7. 設定：
   - Execute as：Me
   - Who has access：Anyone
8. 部署後複製 Web App URL。

## 步驟 2：設定前端環境變數

在本機專案根目錄建立 `.env`：

```bash
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

重新啟動：

```bash
npm run dev
```

完成一筆測試送出後，確認 Google Sheet 的 `Responses` 工作表有新增資料。

## 步驟 3：部署前端

### Vercel

1. 將這個專案上傳到 GitHub。
2. 到 Vercel 新增 Project，匯入該 GitHub repo。
3. Framework Preset 選 Vite。
4. Build Command：`npm run build`
5. Output Directory：`dist`
6. 在 Environment Variables 加入：
   - Name：`VITE_GOOGLE_SCRIPT_URL`
   - Value：你的 Apps Script Web App URL
7. Deploy。

### Netlify

1. 將這個專案上傳到 GitHub。
2. 到 Netlify 新增 Site，匯入該 GitHub repo。
3. Build command：`npm run build`
4. Publish directory：`dist`
5. 在 Environment variables 加入 `VITE_GOOGLE_SCRIPT_URL`。
6. Deploy。

## Google Sheet 欄位

- SubmittedAt
- Name
- Q1_UnderstandCodex
- Q2_ValueForManagers
- Q3_CanBuildPrototype
- Q4_EaseOfUse
- Q5_CourseStructure
- Q6_InstructorClarity
- Q7_MostValuablePractice
- Q8_UseCases
- Q9_AdoptionIntent
- Q10_RecommendScore
- UserAgent

## 注意事項

- 沒有設定 `VITE_GOOGLE_SCRIPT_URL` 時，送出只會存在瀏覽器 localStorage，適合測試，不適合正式收表。
- Apps Script Web App 如果重新部署，請確認前端使用的是最新的 Web App URL。
- 正式發給學員前，請先用手機填一筆測試資料，確認 Google Sheet 有收到。
