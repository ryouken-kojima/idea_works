import { Router } from 'express';
import db from '../utils/db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticateToken, (req: AuthRequest, res) => {
  if (req.user?.role !== 'developer') {
    return res.status(403).json({ error: 'Only developers can start developments' });
  }

  const { idea_id } = req.body;

  if (!idea_id) {
    return res.status(400).json({ error: 'idea_id required' });
  }

  db.get(
    'SELECT * FROM ideas WHERE id = ? AND status = ? AND is_public = 1',
    [idea_id, 'open'],
    (err, idea) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!idea) {
        return res.status(404).json({ error: 'Idea not found or not available' });
      }

      db.run(
        'INSERT INTO developments (idea_id, developer_id) VALUES (?, ?)',
        [idea_id, req.user!.id],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          db.run(
            'UPDATE ideas SET status = ? WHERE id = ?',
            ['in_progress', idea_id],
            (err) => {
              if (err) {
                return res.status(500).json({ error: 'Database error' });
              }
              res.json({ 
                id: this.lastID,
                idea_id,
                developer_id: req.user!.id,
                status: 'started',
                created_at: new Date().toISOString()
              });
            }
          );
        }
      );
    }
  );
});

router.put('/:id', authenticateToken, (req: AuthRequest, res) => {
  const { deliverable_url } = req.body;

  if (!deliverable_url) {
    return res.status(400).json({ error: 'deliverable_url required' });
  }

  db.get(
    'SELECT * FROM developments WHERE id = ? AND developer_id = ?',
    [req.params.id, req.user!.id],
    (err, development: any) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!development) {
        return res.status(404).json({ error: 'Development not found' });
      }

      const completed_at = new Date().toISOString();
      
      db.run(
        'UPDATE developments SET deliverable_url = ?, status = ?, completed_at = ? WHERE id = ?',
        [deliverable_url, 'completed', completed_at, req.params.id],
        (err) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          db.run(
            'UPDATE ideas SET status = ? WHERE id = ?',
            ['delivered', development.idea_id],
            (err) => {
              if (err) {
                return res.status(500).json({ error: 'Database error' });
              }
              res.json({ 
                message: 'Development completed',
                deliverable_url,
                completed_at
              });
            }
          );
        }
      );
    }
  );
});

router.get('/my/developments', authenticateToken, (req: AuthRequest, res) => {
  db.all(
    `SELECT d.*, i.title, i.description 
     FROM developments d
     JOIN ideas i ON d.idea_id = i.id
     WHERE d.developer_id = ?
     ORDER BY d.created_at DESC`,
    [req.user!.id],
    (err, developments) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(developments);
    }
  );
});

export default router;