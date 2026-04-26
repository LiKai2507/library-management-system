# 專案概況 (Project Summary)

## 1. 網站功能 (Website Functions)
本專案是一個圖書館管理系統，主要功能包含：
- **首頁 (Home)**: 瀏覽圖書館藏書及最新資訊。
- **書籍詳情 (Book Detail)**: 查看書籍詳細資訊，可能包含借閱狀態。
- **使用者認證**: 包含使用者註冊 (Register) 與登入 (Login) 功能。
- **一般使用者介面 (User Dashboard)**: 一般使用者可查看個人借閱紀錄、預約狀況或管理個人資料。
- **管理員後台 (Admin Panel)**: 管理員專用的介面，用於管理書籍（新增、刪除）、管理使用者及查看借閱狀況。

## 2. 所使用的前端 Framework (Frontend Framework)
- **核心框架**: Vue.js 3 (使用 Composition API 與 `<script setup>`)
- **建構工具**: Vite
- **路由管理**: Vue Router 4
- **CSS 框架**: Bootstrap 5 (依賴 `bootstrap` 套件)
- **HTTP 請求**: Axios

## 3. 網頁所使用的組件 (Web Components)
主要分為頁面視圖 (Views) 與共用組件 (Components)：

### 頁面視圖 (Views)
位於 `frontend/src/views/`：
- **Home.vue**: 首頁
- **BookDetail.vue**: 書籍詳細頁面
- **Login.vue**: 登入頁面
- **Register.vue**: 註冊頁面
- **UserDashboard.vue**: 一般使用者介面(會員中心)
- **AdminPanel.vue**: 管理員後台介面

### 共用組件 (Components)
位於 `frontend/src/components/`：
- **Navbar.vue**: 導覽列，處理網站導航與登入/登出狀態顯示。

## 4. 資料儲存方式 (Data Storage)
- **資料庫**: MySQL
- **連線驅動**: 後端使用 `mysql2` 套件連接資料庫。
- **部署方式**: 透過 Docker Container 運行 MySQL 服務 (`library_mysql`)，相關設定位於 `docker-compose.yml`。

## 5. 運行方式 (How to Run)
本專案透過 **Docker Compose** 進行容器化部署，將前端、後端與資料庫整合為三個獨立的服務容器，實現了一鍵啟動的現代化開發環境。

詳細運行架構如下：
- **服務編排 (Orchestration)**: `docker-compose.yml` 定義了 `frontend` (Vue)、`backend` (Express) 與 `db` (MySQL) 三個服務，並自動處理服務間的網路連線與啟動順序。
- **環境隔離**: 所有依賴 (如 Node.js 套件、MySQL 資料庫) 皆封裝在 Docker 容器內，確保開發環境與本機系統隔離，避免版本衝突。
- **熱重載 (Hot Reload)**: 前後端服務皆掛載了本地目錄 (Volumes)，當您修改程式碼時，容器內的服務會即時偵測並更新，無需重新啟動容器，大幅提升開發效率。
- **資料持久化**: 資料庫設有 Volume 掛載，確保容器重啟或移除後，圖書館的書籍與使用者資料依然保留（除非使用 `-v` 參數強制刪除）。


## 6. 執行指令 (Execution Commands)
確保您的電腦已安裝 [Docker Desktop](https://www.docker.com/products/docker-desktop/)，接著在專案根目錄開啟終端機 (Terminal) 並執行以下指令：

### 啟動專案
```bash
docker-compose up --build
```
此指令會重新建置 Docker 映像檔並啟動所有服務 (Frontend, Backend, Database)。
- 前端網址: http://localhost:8080
- 後端 API: http://localhost:3000

### 停止專案
```bash
docker-compose down
```
此指令會停止並移除相關的 Containers。
```bash
docker-compose down -v
```
此指令會停止並移除相關的 Containers，並刪除所有相關的 Volumes。

## 7. 在這個專案所有的API弄表格 (All APIs in this project)

| 網址 (URL) | Method | 用途 (Usage) | 在哪個Vue中 (Used in Vue) |
| :--- | :--- | :--- | :--- |
| `/api/register` | POST | 使用者註冊 (User Register) | `Register.vue` |
| `/api/login` | POST | 使用者登入 (User Login) | `Login.vue` |
| `/api/loans/status` | GET | 取得個人借閱/預約/罰款狀態 | `UserDashboard.vue` |
| `/api/user/renew/:loanId` | POST | 書籍續借 (Renew Book) | `UserDashboard.vue` |
| `/api/reservations/:id` | DELETE | 取消預約 (Cancel Reservation) | `UserDashboard.vue`, `BookDetail.vue` |
| `/api/books` | GET | 取得書籍列表 (Get Books) | `Home.vue`, `AdminPanel.vue` |
| `/api/books/:id` | GET | 取得書籍詳細資訊 (Get Book Detail) | `BookDetail.vue` |
| `/api/loans/borrow` | POST | 借閱書籍 (Borrow Book) | `BookDetail.vue` |
| `/api/reservations` | POST | 預約書籍 (Reserve Book) | `BookDetail.vue` |
| `/api/admin/books` | POST | 新增書籍 (Add Book - Admin) | `AdminPanel.vue` |
| `/api/admin/books/:id` | DELETE | 刪除書籍 (Delete Book - Admin) | `AdminPanel.vue` |
| `/api/admin/return/:loanId` | POST | 管理員還書 (Return Book - Admin) | `AdminPanel.vue` |
| `/api/admin/loans` | GET | 取得所有借閱紀錄 (Get All Loans - Admin) | `AdminPanel.vue` |
| `/api/admin/clear-fine/:loanId` | POST | 核銷罰款 (Clear Fine - Admin) | `AdminPanel.vue` |
| `/api/admin/users` | GET | 取得會員列表 (Get Users - Admin) | `AdminPanel.vue` |
| `/api/admin/users/:id/deactivate` | PATCH | 註銷會員 (Deactivate User - Admin) | `AdminPanel.vue` |
