const jwt = require('jsonwebtoken'); // 1. 引入 jwt
require('dotenv').config(); // 2. 引入 dotenv

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key'; // 3. 讀取 JWT_SECRET

// 4. 匯出中介軟體函式
module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization || ''; // 5. 從請求標頭讀取 Authorization
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null; // 6. 提取 token

    if (!token) {
        // 7. 沒有 token，視為訪客，直接放行 (req.user 為 undefined)
        return next();
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET); // 8. 驗證 token
        req.user = decoded; // 9. 將解碼後的使用者資訊附加到 req.user
        next();
    } catch (err) {
        // Token 無效，也視為訪客 (或者要嚴格一點回傳錯誤也可以，這邊配合需求選寬鬆)
        // 為了避免前端送錯 token 導致無法看書，這裡選擇「無效 token = 訪客」
        console.warn('OptionalAuth: Invalid token, treating as guest.', err.message);
        next();
    }
};
