import express from 'express';
import db from '../utils/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// メッセージを取得
router.get('/messages/:ideaId', authenticateToken, (req, res) => {
  const { ideaId } = req.params;
  const userId = req.user.id;

  // アイデアの詳細とユーザーの関係を確認
  db.get(
    `SELECT i.*, 
            CASE 
              WHEN i.user_id = ? THEN 1
              WHEN EXISTS (SELECT 1 FROM developments WHERE idea_id = i.id AND developer_id = ?) THEN 1
              WHEN i.status = 'open' AND ? IN (SELECT id FROM users WHERE role = 'developer') THEN 1
              ELSE 0
            END as has_access
     FROM ideas i
     WHERE i.id = ?`,
    [userId, userId, userId, ideaId],
    (err, idea) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!idea || !idea.has_access) {
        return res.status(403).json({ error: 'アクセス権限がありません' });
      }

      // メッセージを取得
      db.all(
        `SELECT m.*, u.email, u.username 
         FROM messages m
         JOIN users u ON m.sender_id = u.id
         WHERE m.idea_id = ?
         ORDER BY m.created_at ASC`,
        [ideaId],
        (err, messages) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }
          res.json(messages);
        }
      );
    }
  );
});

// メッセージを送信
router.post('/messages', authenticateToken, (req, res) => {
  const { idea_id, message } = req.body;
  const sender_id = req.user.id;

  if (!idea_id || !message || !message.trim()) {
    return res.status(400).json({ error: 'メッセージを入力してください' });
  }

  // アイデアの詳細とユーザーの関係を確認
  db.get(
    `SELECT i.*, 
            CASE 
              WHEN i.user_id = ? THEN 1
              WHEN EXISTS (SELECT 1 FROM developments WHERE idea_id = i.id AND developer_id = ?) THEN 1
              WHEN i.status = 'open' AND ? IN (SELECT id FROM users WHERE role = 'developer') THEN 1
              ELSE 0
            END as has_access
     FROM ideas i
     WHERE i.id = ?`,
    [sender_id, sender_id, sender_id, idea_id],
    (err, idea) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!idea || !idea.has_access) {
        return res.status(403).json({ error: 'アクセス権限がありません' });
      }

      // メッセージを保存
      db.run(
        'INSERT INTO messages (idea_id, sender_id, message) VALUES (?, ?, ?)',
        [idea_id, sender_id, message.trim()],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          // 保存したメッセージを返す
          db.get(
            `SELECT m.*, u.email, u.username 
             FROM messages m
             JOIN users u ON m.sender_id = u.id
             WHERE m.id = ?`,
            [this.lastID],
            (err, newMessage) => {
              if (err) {
                return res.status(500).json({ error: 'Database error' });
              }
              res.json(newMessage);
            }
          );
        }
      );
    }
  );
});

export default router;