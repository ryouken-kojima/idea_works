import { Router } from 'express';
import db from '../utils/db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get development detail
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  const developmentId = parseInt(req.params.id);
  const userId = req.user!.id;

  db.get(
    `SELECT 
      d.*,
      i.title as idea_title,
      i.description as idea_description,
      i.thumbnail as idea_thumbnail,
      i.user_id as client_id,
      c.username as client_username,
      dev.username as developer_username,
      dr.title as request_title,
      dr.description as request_description,
      dr.proposed_budget,
      dr.proposed_deadline
     FROM developments d
     JOIN ideas i ON d.idea_id = i.id
     JOIN users c ON i.user_id = c.id
     JOIN users dev ON d.developer_id = dev.id
     LEFT JOIN development_requests dr ON d.request_id = dr.id
     WHERE d.id = ?`,
    [developmentId],
    (err, development: any) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!development) {
        return res.status(404).json({ error: 'Development not found' });
      }
      
      // Check access rights
      if (development.client_id !== userId && development.developer_id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      res.json(development);
    }
  );
});

// Get threads for a development
router.get('/:id/threads', authenticateToken, async (req: AuthRequest, res) => {
  const developmentId = parseInt(req.params.id);
  const userId = req.user!.id;

  // First check access rights
  db.get(
    `SELECT d.*, i.user_id as client_id 
     FROM developments d 
     JOIN ideas i ON d.idea_id = i.id 
     WHERE d.id = ?`,
    [developmentId],
    (err, development: any) => {
      if (err || !development) {
        return res.status(404).json({ error: 'Development not found' });
      }
      
      if (development.client_id !== userId && development.developer_id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // Get threads
      db.all(
        `SELECT t.*, u.username as created_by_username,
          (SELECT COUNT(*) FROM thread_messages WHERE thread_id = t.id) as message_count,
          (SELECT MAX(created_at) FROM thread_messages WHERE thread_id = t.id) as last_message_at
         FROM threads t
         JOIN users u ON t.created_by = u.id
         WHERE t.development_id = ?
         ORDER BY t.updated_at DESC`,
        [developmentId],
        (err, threads) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
          }
          res.json(threads);
        }
      );
    }
  );
});

// Create a new thread
router.post('/:id/threads', authenticateToken, async (req: AuthRequest, res) => {
  const developmentId = parseInt(req.params.id);
  const { title } = req.body;
  const userId = req.user!.id;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  // Check access rights
  db.get(
    `SELECT d.*, i.user_id as client_id 
     FROM developments d 
     JOIN ideas i ON d.idea_id = i.id 
     WHERE d.id = ?`,
    [developmentId],
    (err, development: any) => {
      if (err || !development) {
        return res.status(404).json({ error: 'Development not found' });
      }
      
      if (development.client_id !== userId && development.developer_id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // Create thread
      db.run(
        'INSERT INTO threads (development_id, title, created_by) VALUES (?, ?, ?)',
        [developmentId, title, userId],
        function(err) {
          if (err) {
            console.error('Error creating thread:', err);
            return res.status(500).json({ error: 'Failed to create thread' });
          }
          
          res.status(201).json({ 
            id: this.lastID,
            message: 'Thread created successfully' 
          });
        }
      );
    }
  );
});

// Get messages for a thread
router.get('/:developmentId/threads/:threadId/messages', authenticateToken, async (req: AuthRequest, res) => {
  const threadId = parseInt(req.params.threadId);
  const developmentId = parseInt(req.params.developmentId);
  const userId = req.user!.id;

  // Check access rights
  db.get(
    `SELECT d.*, i.user_id as client_id 
     FROM threads t
     JOIN developments d ON t.development_id = d.id
     JOIN ideas i ON d.idea_id = i.id 
     WHERE t.id = ? AND t.development_id = ?`,
    [threadId, developmentId],
    (err, result: any) => {
      if (err || !result) {
        return res.status(404).json({ error: 'Thread not found' });
      }
      
      if (result.client_id !== userId && result.developer_id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // Get messages
      db.all(
        `SELECT tm.*, u.username as sender_username, u.role as sender_role
         FROM thread_messages tm
         JOIN users u ON tm.sender_id = u.id
         WHERE tm.thread_id = ?
         ORDER BY tm.created_at ASC`,
        [threadId],
        (err, messages) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
          }
          res.json(messages);
        }
      );
    }
  );
});

// Send a message to a thread
router.post('/:developmentId/threads/:threadId/messages', authenticateToken, async (req: AuthRequest, res) => {
  const threadId = parseInt(req.params.threadId);
  const developmentId = parseInt(req.params.developmentId);
  const { message } = req.body;
  const userId = req.user!.id;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Check access rights
  db.get(
    `SELECT d.*, i.user_id as client_id 
     FROM threads t
     JOIN developments d ON t.development_id = d.id
     JOIN ideas i ON d.idea_id = i.id 
     WHERE t.id = ? AND t.development_id = ?`,
    [threadId, developmentId],
    (err, result: any) => {
      if (err || !result) {
        return res.status(404).json({ error: 'Thread not found' });
      }
      
      if (result.client_id !== userId && result.developer_id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // Insert message
      db.run(
        'INSERT INTO thread_messages (thread_id, sender_id, message) VALUES (?, ?, ?)',
        [threadId, userId, message],
        function(err) {
          if (err) {
            console.error('Error sending message:', err);
            return res.status(500).json({ error: 'Failed to send message' });
          }
          
          // Update thread's updated_at
          db.run(
            'UPDATE threads SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [threadId],
            (err) => {
              if (err) {
                console.error('Error updating thread:', err);
              }
            }
          );
          
          res.status(201).json({ 
            id: this.lastID,
            message: 'Message sent successfully' 
          });
        }
      );
    }
  );
});

export default router;