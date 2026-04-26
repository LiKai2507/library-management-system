const express = require('express'); // express框架
const router = express.Router(); // router
const db = require('../db'); // database
const auth = require('../middleware/auth'); // auth middleware

router.use(auth); // 使用auth middleware

// [POST] 新增預約
router.post('/', async (req, res) => {
    const { book_id } = req.body; // 書籍ID
    const userId = req.user.id; // 使用者ID

    try {
        const [book] = await db.query('SELECT status FROM books WHERE id = ?', [book_id]); // 取得書籍狀態
        if (book.length === 0) return res.status(404).json({ message: '找不到書籍' }); // 如果沒有找到書籍，回傳404

        if (book[0].status === 'available') {
            return res.status(400).json({ message: '書籍目前可借閱，請直接借閱' }); // 如果書籍狀態為可借閱，回傳400
        }

        // 檢查是否已預約 Or 已借閱
        const [existing] = await db.query(
            'SELECT id FROM reservations WHERE book_id = ? AND user_id = ? AND status = "waiting"',
            [book_id, userId]
        );
        if (existing.length > 0) return res.status(400).json({ message: '你已預約此書' }); // 如果已經預約，回傳400

        // 取得使用者借閱紀錄
        const [myLoan] = await db.query(
            'SELECT id FROM loans WHERE book_id = ? AND user_id = ? AND return_date IS NULL',
            [book_id, userId]
        );

        if (myLoan.length > 0) return res.status(400).json({ message: '你已借閱此書' }); // 如果已經借閱，回傳400
        // 新增預約
        await db.query(
            'INSERT INTO reservations (book_id, user_id) VALUES (?, ?)',
            [book_id, userId]
        );

        res.json({ message: '預約成功' });
    } catch (err) {
        res.status(500).json({ message: '系統錯誤', error: err.message }); // 如果發生錯誤，回傳500
    }
});

// [DELETE] 取消預約
router.delete('/:id', async (req, res) => {
    const reservationId = req.params.id; // 預約ID
    const userId = req.user.id; // 使用者ID

    try {
        const [result] = await db.query(
            'DELETE FROM reservations WHERE id = ? AND user_id = ? AND status = "waiting"',
            [reservationId, userId]
        ); // 取消預約

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '找不到可取消的預約紀錄' }); // 如果找不到可取消的預約紀錄，回傳404
        }

        res.json({ message: '已取消預約' }); // 如果成功取消預約，回傳200
    } catch (err) {
        res.status(500).json({ message: '系統錯誤', error: err.message }); // 如果發生錯誤，回傳500
    }
});

module.exports = router;
