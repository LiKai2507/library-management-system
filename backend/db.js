const mysql = require('mysql2');
require('dotenv').config();

// 建立資料庫連線池 (使用 Promise 版本以支援 await)
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'library_mysql', // Docker 環境建議用服務名稱
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'password123',
    database: process.env.DB_NAME || 'library_db',
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10,
    dateStrings: true // 強制將日期轉為字串，避免時區問題
});

// 匯出 promise() 版本，方便在 async/await 中使用
module.exports = pool.promise();