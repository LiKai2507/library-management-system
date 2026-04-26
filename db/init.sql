-- db/init.sql
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE DATABASE IF NOT EXISTS library_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE library_db;

-- 1. 使用者表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    role ENUM('member', 'admin') DEFAULT 'member',
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. 館藏表
CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(100),
    isbn VARCHAR(20) UNIQUE,
    status ENUM('available', 'borrowed', 'reserved', 'deleted') DEFAULT 'available'
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;;

-- 3. 借閱紀錄表
CREATE TABLE IF NOT EXISTS loans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    book_id INT,
    borrow_date DATE DEFAULT (CURRENT_DATE),
    due_date DATE,
    return_date DATE DEFAULT NULL,
    renew_count INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (book_id) REFERENCES books(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. 預約表
CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    user_id INT NOT NULL,
    reserved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('waiting', 'notified', 'expired') DEFAULT 'waiting',
    FOREIGN KEY (book_id) REFERENCES books(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. 罰款表
CREATE TABLE IF NOT EXISTS fines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    loan_id INT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('unpaid', 'paid') DEFAULT 'unpaid',

    INDEX idx_fines_user_id (user_id),
    INDEX idx_fines_loan_id (loan_id),

    CONSTRAINT fk_fines_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_fines_loan
        FOREIGN KEY (loan_id) REFERENCES loans(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入測試資料
INSERT INTO users (username, password, email, role) 
VALUES ('admin', 'admin123', 'admin@example.com', 'admin');
INSERT INTO books (title, author, isbn, status) VALUES 
('深度學習入門', '齋藤康毅', '9789864764846', 'available'),
('Clean Code 代碼整潔之道', 'Robert C. Martin', '9789862017050', 'available'),
('被討厭的勇氣', '岸見一郎', '9789861371955', 'available'),
('原子習慣', 'James Clear', '9789571378244', 'available'),
('精通 Vue.js 3', 'Evan You', '9781119247192', 'available'),
('Node.js 實戰', 'Mike Cantelon', '9781617290572', 'available'),
('人類大歷史', 'Yuval Noah Harari', '9789863205391', 'available'),
('富爸爸，窮爸爸', 'Robert Kiyosaki', '9789862725139', 'available'),
('演算法圖解', 'Aditya Bhargava', '9789864761425', 'available'),
('嫌疑犯X的獻身', '東野圭吾', '9789573331818', 'available'),
('當下的力量', 'Eckhart Tolle', '9789861750804', 'available'),
('JavaScript 大全', 'David Flanagan', '9789862014493', 'available'),
('刻意練習', 'Anders Ericsson', '9789571369747', 'available'),
('蛤蟆先生去看心理師', 'Robert de Board', '9789571385426', 'available'),
('解憂雜貨店', '東野圭吾', '9789573330127', 'available'),
('槍炮、病菌與鋼鐵', 'Jared Diamond', '9789571321455', 'available'),
('思考的藝術', 'Rolf Dobelli', '9789862722107', 'available'),
('快思慢想', 'Daniel Kahneman', '9789862415795', 'available'),
('原則：生活和工作', 'Ray Dalio', '9789573281245', 'available'),
('惡血', 'John Carreyrou', '9789863445831', 'available'),
('大數據時代', 'Viktor Mayer', '9789863202561', 'available'),
('自私的基因', 'Richard Dawkins', '9789573215882', 'available'),
('黑天鵝效應', 'Nassim Taleb', '9789862130761', 'available'),
('人類大命運', 'Yuval Noah Harari', '9789863205392', 'available'),
('21世紀的21堂課', 'Yuval Noah Harari', '9789863205393', 'available'),
('矽谷架構師之路', '唐先波', '9789864769018', 'available'),
('重構：改善既有程式設計', 'Martin Fowler', '9789865003531', 'available'),
('電腦程式設計藝術', 'Donald Knuth', '9780201896831', 'available'),
('SQL 反模式', 'Bill Karwin', '9789862762011', 'available'),
('敏捷軟體開發', 'Robert C. Martin', '9789861515222', 'available'),
('Python 程式設計', 'Tony Gaddis', '9789864761111', 'available'),
('Rust 程式設計', 'Steve Klabnik', '9789864762222', 'available'),
('微服務架構', 'Chris Richardson', '9789864763333', 'available'),
('單元測試之道', 'Vladimir Khorikov', '9789864764444', 'available'),
('零規則：網飛', 'Reed Hastings', '9789571383569', 'available'),
('小王子', 'Antoine de Saint-Exupéry', '9789571178226', 'available'),
('百年孤寂', 'Gabriel García Márquez', '978957皇332998', 'available'),
('牧羊少年奇幻之旅', 'Paulo Coelho', '9789573314226', 'available'),
('1Q84', '村上春樹', '9789573325791', 'available'),
('挪威的森林', '村上春樹', '9789573325792', 'available'),
('海邊的卡夫卡', '村上春樹', '9789573325793', 'available'),
('白夜行', '東野圭吾', '9789573331819', 'available'),
('幻夜', '東野圭吾', '9789573331820', 'available'),
('流星之絆', '東野圭吾', '9789573331821', 'available'),
('伽利略的苦惱', '東野圭吾', '9789573331822', 'available'),
('新參者', '東野圭吾', '9789573331823', 'available'),
('麒麟之翼', '東野圭吾', '9789573331824', 'available'),
('祈禱落幕時', '東野圭吾', '9789573331825', 'available'),
('假面飯店', '東野圭吾', '9789573331826', 'available'),
('假面飯店：前夜', '東野圭吾', '9789573331827', 'available'),
('假面飯店：假面之夜', '東野圭吾', '9789573331828', 'available'),
('達文西密碼', 'Dan Brown', '9789571340159', 'available'),
('天使與魔鬼', 'Dan Brown', '9789571343167', 'available'),
('失落的符號', 'Dan Brown', '9789571351650', 'available'),
('地獄', 'Dan Brown', '9789571357638', 'available'),
('起源', 'Dan Brown', '9789571373515', 'available'),
('大亨小傳', 'F. Scott Fitzgerald', '9789571170114', 'available'),
('傲慢與偏見', 'Jane Austen', '9789571170115', 'available'),
('理性與感性', 'Jane Austen', '9789571170116', 'available'),
('雙城記', 'Charles Dickens', '9789571170117', 'available'),
('孤星血淚', 'Charles Dickens', '9789571170118', 'available'),
('哈利波特：神秘的魔法石', 'J.K. Rowling', '9789573317241', 'available'),
('哈利波特：消失的密室', 'J.K. Rowling', '9789573317586', 'available'),
('哈利波特：阿茲卡班的逃犯', 'J.K. Rowling', '9789573318002', 'available'),
('哈利波特：火盃的考驗', 'J.K. Rowling', '9789573318316', 'available'),
('哈利波特：鳳凰會的密令', 'J.K. Rowling', '9789573319689', 'available'),
('哈利波特：混血王子的背叛', 'J.K. Rowling', '9789573321526', 'available'),
('哈利波特：死神的聖物', 'J.K. Rowling', '9789573323575', 'available'),
('魔戒現身', 'J.R.R. Tolkien', '9789570823301', 'available'),
('雙城奇謀', 'J.R.R. Tolkien', '9789570823302', 'available'),
('王者再臨', 'J.R.R. Tolkien', '9789570823303', 'available'),
('精靈寶鑽', 'J.R.R. Tolkien', '9789570823304', 'available'),
('哈比人', 'J.R.R. Tolkien', '9789570823305', 'available'),
('物種起源', 'Charles Darwin', '9789570518771', 'available'),
('宇宙', 'Carl Sagan', '9789571302836', 'available'),
('時間簡史', 'Stephen Hawking', '9789571301228', 'available'),
('胡桃裡的宇宙', 'Stephen Hawking', '9789571335261', 'available'),
('大設計', 'Stephen Hawking', '9789571352930', 'available'),
('上帝不擲骰子嗎？', '曹天元', '9789866782527', 'available'),
('量子物理史話', '曹天元', '9789866782528', 'available'),
('費曼物理學講義 I', 'Richard Feynman', '9789573252416', 'available'),
('費曼物理學講義 II', 'Richard Feynman', '9789573252417', 'available'),
('費曼物理學講義 III', 'Richard Feynman', '9789573252418', 'available'),
('別鬧了，費曼先生', 'Richard Feynman', '9789573252419', 'available'),
('你管別人怎麼想', 'Richard Feynman', '9789573252420', 'available'),
('平行宇宙', 'Michio Kaku', '9789571348322', 'available'),
('未來物理學', 'Michio Kaku', '9789571354828', 'available'),
('人類大思考', 'Yuval Noah Harari', '9789863205394', 'available'),
('槍炮病菌與鋼鐵', 'Jared Diamond', '9789571321456', 'available'),
('大崩壞', 'Jared Diamond', '9789571344409', 'available'),
('昨日世界', 'Jared Diamond', '9789571358055', 'available'),
('動盪', 'Jared Diamond', '9789571379437', 'available'),
('財富自由', '理財教練', '9789869876543', 'available'),
('投資金律', 'William Bernstein', '9789866032127', 'available'),
('致富心態', 'Morgan Housel', '9789573288459', 'available'),
('金錢心理學', 'Dan Ariely', '9789864794263', 'available'),
('怪誕行為學', 'Dan Ariely', '9789862130549', 'available'),
('這就是行銷', 'Seth Godin', '9789863414070', 'available'),
('獲利世代', 'Alexander Osterwalder', '9789866032066', 'available'),
('價值主張年代', 'Alexander Osterwalder', '9789866032899', 'available');