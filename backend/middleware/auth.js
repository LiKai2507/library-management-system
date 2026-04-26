// 詳細解釋
const jwt = require('jsonwebtoken'); // 1. 引入 jwt
require('dotenv').config(); // 2. 引入 dotenv

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key'; // 3. 讀取 JWT_SECRET

// 4. 匯出中介軟體函式
module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization || ''; // 5. 從請求標頭讀取 Authorization
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null; // 6. 提取 token

    if (!token) {
        return res.status(401).json({ message: '未提供 token' }); // 7. 若無 token，回傳 401 錯誤
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET); // 8. 驗證 token
        req.user = decoded; // 9. 將解碼後的使用者資訊附加到 req.user
        next();
    } catch (err) {
        return res.status(401).json({
            message: 'Token 無效或已過期', // 10. 若驗證失敗，回傳 401 錯誤
            error: err.message
        });
    }
};
