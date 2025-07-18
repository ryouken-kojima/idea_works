import { Router } from 'express';
import db from '../utils/db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get dashboard data for the logged-in user
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const userRole = req.user!.role;

  try {
    if (userRole === 'client') {
      // Get client's ideas with request counts
      db.all(
        `SELECT i.*, 
          (SELECT COUNT(*) FROM development_requests dr 
           WHERE dr.idea_id = i.id AND dr.status = 'pending') as pending_requests_count,
          (SELECT COUNT(*) FROM development_requests dr 
           WHERE dr.idea_id = i.id AND dr.status = 'in_progress') as active_requests_count,
          (SELECT COUNT(*) FROM development_requests dr 
           WHERE dr.idea_id = i.id) as total_requests_count
         FROM ideas i 
         WHERE i.user_id = ? AND i.deleted = 0
         ORDER BY i.created_at DESC`,
        [userId],
        (err, ideas) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
          }
          // Also get active developments for client's ideas
          db.all(
            `SELECT d.*, i.title as idea_title, i.thumbnail as idea_thumbnail,
                    dev.username as developer_username
             FROM developments d
             JOIN ideas i ON d.idea_id = i.id
             JOIN users dev ON d.developer_id = dev.id
             WHERE i.user_id = ? AND d.status = 'started'
             ORDER BY d.created_at DESC`,
            [userId],
            (err2, developments) => {
              if (err2) {
                console.error('Database error:', err2);
                return res.status(500).json({ error: 'Database error' });
              }
              res.json({ ideas, developments });
            }
          );
        }
      );
    } else {
      // Get developer's active requests and developments
      db.all(
        `SELECT dr.*, i.title as idea_title, i.thumbnail as idea_thumbnail,
                u.username as client_username
         FROM development_requests dr
         JOIN ideas i ON dr.idea_id = i.id
         JOIN users u ON i.user_id = u.id
         WHERE dr.developer_id = ?
         ORDER BY dr.created_at DESC`,
        [userId],
        (err, requests) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
          }
          
          db.all(
            `SELECT d.*, i.title as idea_title, i.thumbnail as idea_thumbnail,
                    u.username as client_username
             FROM developments d
             JOIN ideas i ON d.idea_id = i.id
             JOIN users u ON i.user_id = u.id
             WHERE d.developer_id = ?
             ORDER BY d.created_at DESC`,
            [userId],
            (err2, developments) => {
              if (err2) {
                console.error('Database error:', err2);
                return res.status(500).json({ error: 'Database error' });
              }
              res.json({ requests, developments });
            }
          );
        }
      );
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;