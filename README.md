# Library Management System

本專案是一個前後端分離的圖書館管理系統，使用 Vue.js、Node.js / Express、MySQL 與 Docker Compose 開發。系統支援會員註冊登入、館藏查詢、書籍借閱與預約、會員中心，以及管理員後台的館藏、借閱紀錄與會員管理功能。

## 專案特色

- 採用前後端分離架構，前端負責畫面與操作流程，後端提供 RESTful API。
- 使用 MySQL 儲存會員、書籍、借閱、預約與罰款相關資料。
- 透過 Docker Compose 整合 frontend、backend、database 三個服務。
- 支援一般使用者與管理員兩種角色，提供不同操作權限與功能介面。

## 系統架構

```text
Vue.js Frontend  →  Express RESTful API  →  MySQL Database
        Docker Compose 統一啟動 frontend / backend / db 三個服務
```

## 使用技術

### Frontend

- Vue.js 3
- Vite
- Vue Router
- Axios
- Bootstrap 5
- HTML / CSS

### Backend

- Node.js
- Express
- RESTful API
- JSON Web Token / Middleware 驗證
- mysql2

### Database / Deployment

- MySQL
- Docker
- Docker Compose

## 主要功能

### 一般使用者功能

- 會員註冊與登入
- 瀏覽圖書館藏書
- 查看書籍詳細資訊
- 借閱書籍
- 預約書籍
- 取消預約
- 書籍續借
- 查看個人借閱紀錄、預約狀態與罰款狀態

### 管理員功能

- 新增書籍
- 刪除書籍
- 查看所有借閱紀錄
- 處理還書
- 核銷罰款
- 查看會員列表
- 註銷會員帳號

## 專案結構

```text
LibraryManagementSystem/
├── backend/                        # 後端服務，負責 API 與資料庫連線
│   ├── middleware/                 # Express 中介層
│   │   ├── adminAuth.js            # 管理員權限驗證
│   │   ├── auth.js                 # 使用者登入驗證
│   │   └── optionalAuth.js         # 選擇性登入驗證
│   │
│   ├── routes/                     # API 路由
│   │   ├── admin.js                # 管理員相關 API
│   │   ├── books.js                # 書籍查詢與詳情 API
│   │   ├── reservations.js         # 預約相關 API
│   │   └── user.js                 # 使用者、借閱與會員相關 API
│   │
│   ├── db.js                       # MySQL 資料庫連線設定
│   ├── server.js                   # Express 伺服器入口
│   ├── Dockerfile                  # 後端 Docker 設定
│   ├── package.json                # 後端套件設定
│   ├── package-lock.json           # 後端套件版本鎖定
│   └── .env.example                # 環境變數範例
│
├── db/                             # 資料庫初始化設定
│   ├── Dockerfile                  # MySQL Docker 設定
│   └── init.sql                    # 資料表與初始資料
│
├── frontend/                       # 前端 Vue 專案
│   ├── public/                     # 靜態公開資源
│   │   └── vite.svg
│   │
│   ├── src/                        # 前端主要程式碼
│   │   ├── assets/                 # 圖片與靜態資源
│   │   │   └── images.png
│   │   ├── components/             # 共用元件
│   │   │   └── Navbar.vue          # 導覽列元件
│   │   ├── router/                 # Vue Router 設定
│   │   │   └── index.js
│   │   ├── views/                  # 頁面元件
│   │   │   ├── AdminPanel.vue      # 管理員後台
│   │   │   ├── BookDetail.vue      # 書籍詳細頁
│   │   │   ├── Home.vue            # 首頁
│   │   │   ├── Login.vue           # 登入頁
│   │   │   ├── Register.vue        # 註冊頁
│   │   │   └── UserDashboard.vue   # 會員中心
│   │   ├── App.vue                 # Vue 根元件
│   │   ├── main.js                 # Vue 入口檔
│   │   └── style.css               # 全站樣式
│   │
│   ├── .gitignore                  # 前端忽略檔設定
│   ├── Dockerfile                  # 前端 Docker 設定
│   ├── index.html                  # Vite HTML 入口
│   ├── package.json                # 前端套件設定
│   ├── package-lock.json           # 前端套件版本鎖定
│   └── vite.config.js              # Vite 設定
│
├── .gitignore                      # Git 忽略設定
├── docker-compose.yml              # 前後端與資料庫容器編排
└── README.md                       # 專案說明文件

## 前端頁面說明

| 頁面 / 元件 | 說明 |
|---|---|
| `Home.vue` | 首頁，顯示館藏書籍列表與基本查詢功能 |
| `BookDetail.vue` | 書籍詳細頁面，提供借閱與預約操作 |
| `Login.vue` | 使用者登入頁面 |
| `Register.vue` | 使用者註冊頁面 |
| `UserDashboard.vue` | 會員中心，顯示借閱紀錄、預約狀態與罰款資訊 |
| `AdminPanel.vue` | 管理員後台，提供館藏、借閱與會員管理功能 |
| `Navbar.vue` | 共用導覽列，處理頁面導覽與登入狀態顯示 |

## 資料儲存方式

本系統使用 MySQL 作為主要資料庫，後端透過 `mysql2` 套件連接資料庫。資料庫服務由 Docker Compose 建立與管理，並透過 `db/init.sql` 初始化基本資料表與測試資料。

資料庫主要負責儲存：

- 使用者資料
- 書籍資料
- 借閱紀錄
- 預約紀錄
- 罰款狀態
- 管理員相關操作資料

## 執行方式

請先確認電腦已安裝 Docker Desktop。

### 1. 複製專案

```bash
git clone https://github.com/LiKai2507/library-management-system.git
cd library-management-system
```

### 2. 建立後端環境變數檔案

請在 `backend` 資料夾內建立 `.env` 檔案，或參考 `.env.example`。

範例：

```env
DB_HOST=db
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=library_db
DB_PORT=3306
JWT_SECRET=your_jwt_secret
PORT=3000
```

### 3. 啟動專案

```bash
docker-compose up --build
```

啟動後可開啟：

```text
Frontend: http://localhost:8080
Backend API: http://localhost:3000
```

### 4. 停止專案

```bash
docker-compose down
```

如果要同時刪除資料庫 Volume：

```bash
docker-compose down -v
```

## API 一覽表

| URL | Method | 用途 | 使用頁面 |
|---|---|---|---|
| `/api/register` | POST | 使用者註冊 | `Register.vue` |
| `/api/login` | POST | 使用者登入 | `Login.vue` |
| `/api/loans/status` | GET | 取得個人借閱、預約與罰款狀態 | `UserDashboard.vue` |
| `/api/user/renew/:loanId` | POST | 書籍續借 | `UserDashboard.vue` |
| `/api/reservations/:id` | DELETE | 取消預約 | `UserDashboard.vue`, `BookDetail.vue` |
| `/api/books` | GET | 取得書籍列表 | `Home.vue`, `AdminPanel.vue` |
| `/api/books/:id` | GET | 取得書籍詳細資訊 | `BookDetail.vue` |
| `/api/loans/borrow` | POST | 借閱書籍 | `BookDetail.vue` |
| `/api/reservations` | POST | 預約書籍 | `BookDetail.vue` |
| `/api/admin/books` | POST | 新增書籍 | `AdminPanel.vue` |
| `/api/admin/books/:id` | DELETE | 刪除書籍 | `AdminPanel.vue` |
| `/api/admin/return/:loanId` | POST | 管理員還書 | `AdminPanel.vue` |
| `/api/admin/loans` | GET | 取得所有借閱紀錄 | `AdminPanel.vue` |
| `/api/admin/clear-fine/:loanId` | POST | 核銷罰款 | `AdminPanel.vue` |
| `/api/admin/users` | GET | 取得會員列表 | `AdminPanel.vue` |
| `/api/admin/users/:id/deactivate` | PATCH | 註銷會員 | `AdminPanel.vue` |

## 學習重點

透過本專案練習前後端分離 Web 系統開發，包含 Vue 前端頁面設計、Express API 開發、MySQL 資料表設計、JWT / Middleware 權限驗證，以及 Docker Compose 多服務整合。此專案也強化了 RESTful API 設計、資料庫操作與系統部署流程的實作經驗。

## 後續可改進方向

- 增加書籍搜尋與分類篩選功能
- 增加表單驗證與錯誤提示
- 優化管理員後台的資料呈現
- 加入單元測試或 API 測試
- 增加系統畫面截圖與 Demo 說明