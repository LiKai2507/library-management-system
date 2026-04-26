const express = require('express'); // express框架
const router = express.Router(); // router
const db = require('../db'); // database
const auth = require('../middleware/auth'); // auth middleware

// [GET] 我的帳戶狀態：借閱中 / 逾期 / 已歸還 / 預約中 / 罰款
router.get('/status', auth, async (req, res) => {
    try {
        const userId = req.user.id; // 使用者ID

        // 借閱中（未逾期）
        const [borrowing] = await db.query(`
            SELECT 
                l.id AS loanId,
                l.book_id AS bookId,
                l.renew_count AS renewCount,
                b.title,
                b.author,
                DATE_FORMAT(l.due_date, '%Y-%m-%d') AS dueDate,
                (SELECT COUNT(*) FROM reservations r WHERE r.book_id = l.book_id AND r.status = 'waiting') AS reservationCount
            FROM loans l
            JOIN books b ON l.book_id = b.id
            WHERE l.user_id = ?
              AND l.return_date IS NULL
              AND l.due_date >= NOW()
            ORDER BY l.id ASC
        `, [userId]);

        // 逾期（未還）
        const [overdue] = await db.query(`
            SELECT
                l.id AS loanId,
                l.book_id AS bookId,
                b.title,
                b.author,
                DATEDIFF(NOW(), l.due_date) AS overdueDays
            FROM loans l
            JOIN books b ON l.book_id = b.id
            WHERE l.user_id = ?
              AND l.return_date IS NULL
              AND l.due_date < NOW()
            ORDER BY l.id ASC
        `, [userId]);

        // 已歸還（最近 50 筆）
        const [returned] = await db.query(`
            SELECT
                l.id AS loanId,
                l.book_id AS bookId,
                b.title,
                b.author,
                DATE_FORMAT(l.return_date, '%Y-%m-%d') AS returnDate
            FROM loans l
            JOIN books b ON l.book_id = b.id
            WHERE l.user_id = ?
              AND l.return_date IS NOT NULL
            ORDER BY l.id ASC
            LIMIT 50
        `, [userId]);

        // 預約中（waiting）
        const [reservations] = await db.query(`
            SELECT
                r.id AS reservationId,
                r.book_id AS bookId,
                b.title,
                b.author,
                DATE_FORMAT(r.reserved_at, '%Y-%m-%d') AS reserveDate
            FROM reservations r
            JOIN books b ON r.book_id = b.id
            WHERE r.user_id = ?
              AND r.status = 'waiting'
            ORDER BY r.id ASC
        `, [userId]);

        // 未繳罰款
        const [fines] = await db.query(
            'SELECT SUM(amount) AS totalFines FROM fines WHERE user_id = ? AND status = "unpaid"',
            [userId]
        );

        res.json({
            borrowing,
            overdue,
            returned,
            reservations,
            fines: fines[0].totalFines || 0
        });
    } catch (err) {
        console.error('Error in /status:', err);
        res.status(500).json({ message: '取得帳戶狀態失敗', error: err.message }); // 如果發生錯誤，回傳500
    }
});

// [POST] 借閱書籍
router.post('/borrow', auth, async (req, res) => {
    const { book_id } = req.body; // 書籍ID
    const userId = req.user.id; // 使用者ID

    try {
        const [book] = await db.query('SELECT status FROM books WHERE id = ?', [book_id]); // 取得書籍狀態
        if (book.length === 0) return res.status(404).json({ message: '找不到該書籍' }); // 如果找不到該書籍，回傳404

        if (book[0].status !== 'available') {
            return res.status(400).json({ message: '該書目前無法借閱' }); // 如果該書目前無法借閱，回傳400
        }
        // 建立借閱紀錄
        await db.query(
            'INSERT INTO loans (book_id, user_id, borrow_date, due_date) VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 14 DAY))',
            [book_id, userId]
        );
        // 更新書籍狀態
        await db.query('UPDATE books SET status = "borrowed" WHERE id = ?', [book_id]);

        res.json({ message: '借閱成功！' }); // 如果借閱成功，回傳200
    } catch (err) {
        res.status(500).json({ message: '系統錯誤', error: err.message }); // 如果發生錯誤，回傳500
    }
});

// [GET] 借閱歷史：查詢已還書籍（保留原本）
router.get('/history', auth, async (req, res) => {
    try {
        const userId = req.user.id; // 使用者ID
        const [history] = await db.query(
            'SELECT l.*, b.title, b.author FROM loans l JOIN books b ON l.book_id = b.id WHERE l.user_id = ? AND l.return_date IS NOT NULL ORDER BY l.return_date DESC',
            [userId]
        ); // 取得借閱歷史
        res.json(history); // 回傳借閱歷史
    } catch (err) {
        res.status(500).json({ message: '取得歷史紀錄失敗' }); // 如果發生錯誤，回傳500
    }
});

// [POST] 線上續借：增加續借次數與預約檢查邏輯（保留原本）
router.post('/renew/:loanId', auth, async (req, res) => {
    const loanId = req.params.loanId; // 借閱紀錄ID
    const userId = req.user.id; // 使用者ID

    try {
        const [loan] = await db.query('SELECT * FROM loans WHERE id = ? AND user_id = ?', [loanId, userId]); // 取得借閱紀錄
        if (loan.length === 0) return res.status(404).json({ message: '找不到借閱紀錄' }); // 如果找不到借閱紀錄，回傳404

        if (loan[0].renew_count >= 2) {
            return res.status(400).json({ message: '已達續借次數上限 (2次)' }); // 如果已達續借次數上限，回傳400
        }

        const [reservation] = await db.query(
            'SELECT * FROM reservations WHERE book_id = ? AND status = "waiting"',
            [loan[0].book_id]
        ); // 取得預約紀錄
        if (reservation.length > 0) {
            return res.status(400).json({ message: '此書已有讀者預約，無法續借' }); // 如果已有預約，回傳400
        }

        await db.query(
            'UPDATE loans SET due_date = DATE_ADD(due_date, INTERVAL 7 DAY), renew_count = renew_count + 1 WHERE id = ?',
            [loanId]
        ); // 更新借閱紀錄

        res.json({ message: '續借成功！' }); // 回傳續借成功
    } catch (err) {
        res.status(500).json({ message: '續借失敗', error: err.message }); // 如果發生錯誤，回傳500
    }
});

module.exports = router;
