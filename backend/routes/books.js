const express = require('express'); // express框架
const router = express.Router(); // router
const db = require('../db'); // database
const auth = require('../middleware/auth'); // auth middleware
const optionalAuth = require('../middleware/optionalAuth'); // optional auth middleware

// 取得館藏
router.get('/', async (req, res) => {
    const q = String(req.query.q || '').trim(); // 搜尋
    const page = Math.max(1, parseInt(req.query.page || '1', 10)); // 頁碼
    const limit = Math.max(1, parseInt(req.query.limit || '10', 10)); // 每頁數量
    const offset = (page - 1) * limit; // 起始位置

    try {
        let where = '';
        let params = [];
        if (q) {
            where = `WHERE (title LIKE ? OR author LIKE ? OR isbn LIKE ?) AND status != 'deleted'`; // 搜尋
            params = [`%${q}%`, `%${q}%`, `%${q}%`];
        } else {
            where = `WHERE status != 'deleted'`; // 過濾已刪除
        }

        const [countRows] = await db.query(
            `SELECT COUNT(*) as total FROM books ${where}`, // 總數量
            params
        );
        const total = countRows?.[0]?.total ?? 0; // 總數量
        const totalPages = Math.max(1, Math.ceil(total / limit)); // 總頁數

        // 取得館藏
        const [rows] = await db.query(
            `SELECT id, title, author, isbn, status 
       FROM books
       ${where}
       ORDER BY id ASC
       LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        res.json({ data: rows, totalPages });
    } catch (err) {
        res.status(500).json({ message: '取得館藏失敗', error: err.message }); // 如果發生錯誤，回傳500
    }
});

// 取得單本館藏
router.get('/:id', optionalAuth, async (req, res) => {
    const bookId = req.params.id; // 書籍ID
    const userId = req.user?.id; // 使用者ID

    try {
        // 取得單本館藏
        const [bookRows] = await db.query(
            `SELECT id, title, author, isbn, status
       FROM books
       WHERE id = ?`,
            [bookId]
        );
        if (!bookRows.length) return res.status(404).json({ message: '找不到書籍' }); // 如果沒有找到書籍，回傳404

        const book = bookRows[0]; // 取得單本館藏

        // 取得借閱紀錄
        const [myLoanRows] = await db.query(
            `SELECT id, due_date
       FROM loans
       WHERE book_id = ? AND user_id = ? AND return_date IS NULL
       ORDER BY borrow_date DESC
       LIMIT 1`,
            [bookId, userId]
        );

        const myBorrowing = myLoanRows.length > 0; // 是否借閱中
        const myDueDate = myBorrowing ? myLoanRows[0].due_date : null; // 借閱到期日

        // 取得預約紀錄
        const [waitingCountRows] = await db.query(
            `SELECT COUNT(*) AS c
       FROM reservations
       WHERE book_id = ? AND status = 'waiting'`,
            [bookId]
        );
        const waitingCount = waitingCountRows?.[0]?.c ?? 0; // 預約人數

        // 取得預約紀錄
        const [myResRows] = await db.query(
            `SELECT id
       FROM reservations
       WHERE book_id = ? AND user_id = ? AND status = 'waiting'
       ORDER BY reserved_at ASC
       LIMIT 1`,
            [bookId, userId]
        );
        const myWaitingReservation = myResRows.length > 0; // 是否預約中
        const myReservationId = myWaitingReservation ? myResRows[0].id : null; // 預約ID

        const canReserve = (book.status !== 'available') && !myBorrowing && !myWaitingReservation; // 是否可以預約

        res.json({
            ...book,
            myBorrowing,
            myDueDate,
            waitingCount,
            myWaitingReservation,
            myReservationId,
            canReserve
        });
    } catch (err) {
        console.error('Error in /books/:id:', err);
        res.status(500).json({ message: '載入書籍失敗', error: err.message }); // 如果發生錯誤，回傳500
    }
});

module.exports = router;