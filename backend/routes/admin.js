const express = require('express');
const router = express.Router();
const db = require('../db');
const adminAuth = require('../middleware/adminAuth');

router.use(adminAuth);

// [POST] 新增書籍（上架新書一律可借閱）
router.post('/books', async (req, res) => {
    const { title, author, isbn } = req.body;
    const finalStatus = 'available';
    try {
        await db.query(
            'INSERT INTO books (title, author, isbn, status) VALUES (?, ?, ?, ?)',
            [title, author, isbn, finalStatus]
        );
        res.json({ message: '書籍新增成功' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// [DELETE] 刪除書籍 (Soft Delete)
router.delete('/books/:id', async (req, res) => {
    try {
        // 1. 檢查書籍狀態
        const [book] = await db.query('SELECT status FROM books WHERE id = ?', [req.params.id]);
        // 2. 如果找不到書籍，回傳 404
        if (!book.length) return res.status(404).json({ message: '找不到書籍' });
        // 3. 只有在書籍狀態為 available 或 deleted 時，才允許刪除
        if (book[0].status === 'borrowed') {
            return res.status(400).json({ message: '該書籍目前被借閱中，無法刪除' });
        }
        // 4. 執行 Soft Delete (標記為 deleted)
        await db.query('UPDATE books SET status = "deleted" WHERE id = ?', [req.params.id]);
        // 5. 回傳成功訊息
        res.json({ message: '書籍已刪除' });
    } catch (err) {
        res.status(500).json({ error: err.message }); // 系統錯誤
    }
});

// [POST] 還書
router.post('/return/:loanId', async (req, res) => {
    try {
        const [loan] = await db.query('SELECT * FROM loans WHERE id = ?', [req.params.loanId]); // 取得借閱紀錄
        if (!loan.length) return res.status(404).json({ message: '找不到借閱紀錄（請確認 Loan ID）' }); // 檢查借閱紀錄是否存在

        if (loan[0].return_date) {
            return res.status(400).json({ message: '此書籍已歸還，請勿重複還書' }); // 檢查是否已還書
        }

        const bookId = loan[0].book_id; // 取得書籍 ID
        const dueDate = new Date(loan[0].due_date); // 取得應還日期
        const today = new Date(); // 取得今天日期
        let message = '還書成功'; // 預設成功訊息

        // 1. 更新舊的借閱紀錄為已歸還
        await db.query('UPDATE loans SET return_date = NOW() WHERE id = ?', [req.params.loanId]);

        // 2. 檢查是否有「等待中」的預約
        const [reservations] = await db.query(
            'SELECT * FROM reservations WHERE book_id = ? AND status = "waiting" ORDER BY reserved_at ASC LIMIT 1',
            [bookId]
        );

        // [有預約] -> 自動借閱給預約者
        if (reservations.length > 0) {
            // 
            const nextUserReservation = reservations[0]; // 取得下一位預約者
            const nextUserId = nextUserReservation.user_id; // 取得預約者的 user_id

            // 建立新借閱紀錄（預設借 30 天）
            await db.query(
                `INSERT INTO loans (user_id, book_id, borrow_date, due_date) 
                 VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY))`,
                [nextUserId, bookId]
            );

            // 更新預約狀態為 notified (已處理)
            await db.query('UPDATE reservations SET status = "notified" WHERE id = ?', [nextUserReservation.id]);

            // 書籍狀態保持 borrowed (或改成 reserved 也可以，但邏輯上是已借出給下一位)
            await db.query('UPDATE books SET status = "borrowed" WHERE id = ?', [bookId]);

            // 取得預約者姓名以便顯示
            const [nextUser] = await db.query('SELECT username FROM users WHERE id = ?', [nextUserId]);
            const nextUserName = nextUser[0]?.username || 'User';

            message += `，並已自動借閱給順位第一的預約者：${nextUserName}`;

        } else {
            // [無預約] -> 書籍變回可借閱
            await db.query('UPDATE books SET status = "available" WHERE id = ?', [bookId]);
        }

        // 3. 逾期罰款計算 (針對原本的借閱者)
        if (today > dueDate) {
            const diffDays = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24)); // 計算逾期天數
            const amount = diffDays * 10; // 每天 10 元罰款
            // 建立罰款紀錄
            await db.query(
                'INSERT INTO fines (user_id, loan_id, amount, status) VALUES (?, ?, ?, "unpaid")',
                [loan[0].user_id, loan[0].id, amount]
            );
            message += ` (逾期 ${diffDays} 天，產生罰金 $${amount})`;
        }

        res.json({ message });
    } catch (err) {
        res.status(500).json({ error: err.message }); // 系統錯誤
    }
});

// [POST] 依 Loan ID 核銷罰款
router.post('/clear-fine/:loanId', async (req, res) => {
    try {
        const [result] = await db.query(
            'UPDATE fines SET status = "paid" WHERE loan_id = ? AND status = "unpaid"', // 核銷未繳罰款
            [req.params.loanId] // 取得 Loan ID
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '找不到未繳罰款（請確認 Loan ID / 是否有未繳）' }); // 無更新表示找不到未繳罰款
        }

        res.json({ message: '罰款已核銷成功' });
    } catch (err) {
        res.status(500).json({ error: err.message }); // 系統錯誤
    }
});

// [GET] 取得所有目前借閱中列表 (Active Loans)
router.get('/loans', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                l.id AS loanId,
                l.user_id AS userId,
                u.username,
                l.book_id AS bookId,
                b.title AS bookTitle,
                DATE_FORMAT(l.borrow_date, '%Y-%m-%d') AS borrowDate,
                DATE_FORMAT(l.due_date, '%Y-%m-%d') AS dueDate,
                DATEDIFF(NOW(), l.due_date) AS overdueDays
            FROM loans l
            JOIN users u ON l.user_id = u.id
            JOIN books b ON l.book_id = b.id
            WHERE l.return_date IS NULL
            ORDER BY l.id ASC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: '取得借閱列表失敗', error: err.message });
    }
});

// [GET] 取得會員列表（可用 q 搜尋 username 或 id）
router.get('/users', async (req, res) => {
    const q = String(req.query.q || '').trim();

    try {
        // DB 如已新增 status 欄位，直接撈
        const [rows] = await db.query(
            `SELECT id, username, role, status
                 FROM users
                 WHERE (? = '' OR username LIKE CONCAT('%', ?, '%') OR CAST(id AS CHAR) = ?)
                 ORDER BY id DESC`,
            [q, q, q]
        );
        res.json({ data: rows, total: rows.length });
    } catch (err) {
        res.status(500).json({ message: '取得會員列表失敗', error: err.message });
    }
});

// [PATCH] 註銷會員 (Soft Delete)
router.patch('/users/:id/deactivate', async (req, res) => {
    const userId = req.params.id; // 1. 取得會員 ID

    const connection = await db.getConnection(); // 2. 取得資料庫連線
    try {
        await connection.beginTransaction(); // 3. 開始交易

        const [uRows] = await connection.query('SELECT id, role FROM users WHERE id = ?', [userId]); // 4. 檢查使用者
        if (!uRows.length) {
            await connection.rollback();
            return res.status(404).json({ message: '找不到會員' });
        }
        if (uRows[0].role === 'admin') {
            await connection.rollback();
            return res.status(400).json({ message: '不可註銷管理員帳號' });
        }

        const [activeLoans] = await connection.query('SELECT id FROM loans WHERE user_id = ? AND return_date IS NULL', [userId]); // 5. 檢查借閱情形

        if (activeLoans.length > 0) {
            await connection.rollback();
            return res.status(400).json({ message: '該會員仍有未歸還書籍，請先還書後再註銷' });
        }

        await connection.query('UPDATE reservations SET status = "expired" WHERE user_id = ? AND status = "waiting"', [userId]); // 6. 取消預約
        const [result] = await connection.query('UPDATE users SET status = "inactive" WHERE id = ?', [userId]); // 7. 執行 Soft Delete

        await connection.commit(); // 8. 提交交易

        if (result.affectedRows === 0) return res.status(404).json({ message: '找不到會員或更新失敗' });

        return res.json({ message: '會員已註銷成功 (已被標記為 Inactive)' });

    } catch (err) {
        await connection.rollback(); // 9. 交易失敗，回滾
        res.status(500).json({ message: '註銷會員失敗', error: err.message });
    } finally {
        connection.release(); // 10. 釋放連線
    }
});

module.exports = router;
