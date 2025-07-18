import { Router } from 'express';
import db from '../utils/db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', (req, res) => {
  const status = req.query.status || 'open';
  
  db.all(
    `SELECT i.*, u.email as user_email 
     FROM ideas i 
     JOIN users u ON i.user_id = u.id 
     WHERE i.status = ? 
     ORDER BY i.created_at DESC`,
    [status],
    (err, ideas) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(ideas);
    }
  );
});

router.get('/:id', (req, res) => {
  db.get(
    `SELECT i.*, u.email as user_email,
            d.id as development_id, d.status as development_status,
            d.deliverable_url, dev.email as developer_email
     FROM ideas i 
     JOIN users u ON i.user_id = u.id
     LEFT JOIN developments d ON i.id = d.idea_id
     LEFT JOIN users dev ON d.developer_id = dev.id
     WHERE i.id = ?`,
    [req.params.id],
    (err, idea) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!idea) {
        return res.status(404).json({ error: 'Idea not found' });
      }
      res.json(idea);
    }
  );
});

router.post('/', authenticateToken, (req: AuthRequest, res) => {
  if (req.user?.role !== 'client') {
    return res.status(403).json({ error: 'Only clients can post ideas' });
  }

  const { title, description, budget } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description required' });
  }

  db.run(
    'INSERT INTO ideas (user_id, title, description, budget) VALUES (?, ?, ?, ?)',
    [req.user.id, title, description, budget || null],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ 
        id: this.lastID, 
        user_id: req.user!.id,
        title, 
        description, 
        budget,
        status: 'open',
        created_at: new Date().toISOString()
      });
    }
  );
});

router.get('/my/ideas', authenticateToken, (req: AuthRequest, res) => {
  db.all(
    `SELECT * FROM ideas WHERE user_id = ? ORDER BY created_at DESC`,
    [req.user!.id],
    (err, ideas) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(ideas);
    }
  );
});

export default router;