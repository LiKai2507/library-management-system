const auth = require('./auth');

// 1. 先使用 auth 中介軟體驗證身份
module.exports = (req, res, next) => {
    auth(req, res, () => {
        // 2. 檢查使用者角色是否為 admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: '權限不足，僅限管理員操作' }); // 3. 權限不足回傳 403 錯誤
        }
        next(); // 4. 身份驗證通過且為 admin，繼續處理請求
    });
};