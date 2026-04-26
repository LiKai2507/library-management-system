const express = require('express'); // express框架
const cors = require('cors'); // 引入 cors
const bcrypt = require('bcrypt'); // 引入 bcrypt
const jwt = require('jsonwebtoken'); // 引入 jwt
require('dotenv').config(); // 引入 dotenv

// 1. 引入模組化後的 db 與 路由
const db = require('./db'); // database
const userRoutes = require('./routes/user'); // user routes
const bookRoutes = require('./routes/books'); // book routes
const reservationRoutes = require('./routes/reservations'); // reservation routes
const adminRoutes = require('./routes/admin'); // admin routes
const auth = require('./middleware/auth'); // auth middleware

const app = express(); // express
app.use(cors()); // cors
app.use(express.json()); // json

// 2. 掛載路由
app.use('/api/admin', adminRoutes); // admin routes
app.use('/api/loans', userRoutes); // loans routes
app.use('/api/user', userRoutes); // user routes
app.use('/api/books', bookRoutes); // books routes
app.use('/api/reservations', reservationRoutes); // reservations routes

// 建議從 .env 讀取，若無則使用預設值
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

// 測試 API
app.get('/api/health', async (req, res) => {
    try {
        const [results] = await db.query('SELECT 1 + 1 AS solution');

        res.json({ message: '後端與資料庫連線成功！', solution: results[0].solution });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 註冊 API
app.post('/api/register', async (req, res) => {
    const { username, password, email } = req.body; // body

    const normalizedEmail = (email && String(email).trim().length > 0) ? String(email).trim() : null; // email
    const normalizedRole = 'member'; // role

    try {
        // 明文密碼存入
        const query = "INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)";
        await db.query(query, [username, password, normalizedEmail, normalizedRole]);
        res.json({ message: '註冊成功！' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: '帳號已存在' }); // 如果帳號已存在，回傳400
        res.status(500).json({ error: err.message }); // 如果發生錯誤，回傳500
    }
});

// 登入 API
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const query = "SELECT * FROM users WHERE username = ?";
        const [results] = await db.query(query, [username]);

        if (results.length === 0) return res.status(401).json({ message: '帳號或密碼錯誤' }); // 如果帳號或密碼錯誤，回傳401

        const user = results[0];

        // 檢查帳號狀態
        if (user.status === 'inactive') return res.status(403).json({ message: '此帳號已被註銷，無法登入' }); // 如果帳號被註銷，回傳403

        // 檢查密碼
        if (password !== user.password) return res.status(401).json({ message: '帳號或密碼錯誤' }); // 如果密碼錯誤，回傳401

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role }, // 簽名資料
            JWT_SECRET, // 簽名密鑰
            { expiresIn: '24h' } // 簽名時間
        );

        res.json({ message: '登入成功', token, role: user.role, username: user.username }); // 如果登入成功，回傳200 
    } catch (err) {
        res.status(500).json({ message: '伺服器錯誤', error: err.message }); // 如果發生錯誤，回傳500
    }
});

const PORT = 3000;

// 啟動伺服器
const startServer = async () => {
    try {
        app.listen(PORT, () => {
            console.log(`伺服器運行於埠號 ${PORT}`);
        });
    } catch (err) {
        console.error('資料庫連線失敗或啟動錯誤:', err);
    }
};

startServer();
