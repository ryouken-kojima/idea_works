import { Router } from 'express';
import db from '../utils/db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { generateRequirements } from '../utils/openai.js';

const router = Router();

router.get('/', (req, res) => {
  const status = req.query.status;
  
  let query = `SELECT i.*, u.username, u.email as user_email,
     (SELECT COUNT(*) FROM development_requests dr 
      WHERE dr.idea_id = i.id AND dr.status = 'pending') as pending_requests_count,
     (SELECT COUNT(*) FROM development_requests dr 
      WHERE dr.idea_id = i.id AND dr.status = 'in_progress') as active_requests_count
     FROM ideas i 
     JOIN users u ON i.user_id = u.id 
     WHERE i.deleted = 0 AND i.is_public = 1`;
  
  const params = [];
  
  if (status) {
    query += ` AND i.status = ?`;
    params.push(status);
  }
  
  query += ` ORDER BY i.created_at DESC`;
  
  db.all(query, params, (err, ideas) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(ideas);
  });
});

// 自分のアイディア一覧を取得（この位置に移動：/:idより前に配置）
router.get('/my-ideas', authenticateToken, (req: AuthRequest, res) => {
  const status = req.query.status;
  
  let query = `SELECT i.*, 
     (SELECT COUNT(*) FROM development_requests dr 
      WHERE dr.idea_id = i.id AND dr.status = 'pending') as pending_requests_count,
     (SELECT COUNT(*) FROM development_requests dr 
      WHERE dr.idea_id = i.id AND dr.status = 'in_progress') as active_requests_count,
     (SELECT d.id FROM developments d 
      WHERE d.idea_id = i.id AND d.status = 'started' 
      ORDER BY d.created_at DESC LIMIT 1) as active_development_id,
     (SELECT d.created_at FROM developments d 
      WHERE d.idea_id = i.id AND d.status = 'started' 
      ORDER BY d.created_at DESC LIMIT 1) as development_started_at
     FROM ideas i 
     WHERE i.user_id = ? AND i.deleted = 0`;
  
  const params = [req.user!.id];
  
  if (status) {
    query += ` AND i.status = ?`;
    params.push(status);
  }
  
  query += ` ORDER BY i.created_at DESC`;
  
  db.all(query, params, (err, ideas) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // activeDevelopmentオブジェクトを追加
    const ideasWithDevelopment = ideas.map((idea: any) => ({
      ...idea,
      activeDevelopment: idea.active_development_id ? {
        id: idea.active_development_id
      } : null
    }));
    
    res.json(ideasWithDevelopment);
  });
});

// Get development requests for a specific idea
router.get('/:id/requests', (req, res) => {
  const ideaId = req.params.id;
  
  db.all(
    `SELECT dr.*, u.username as developer_username, u.email as developer_email
     FROM development_requests dr
     JOIN users u ON dr.developer_id = u.id
     WHERE dr.idea_id = ?
     ORDER BY dr.created_at DESC`,
    [ideaId],
    (err, requests) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(requests);
    }
  );
});

router.get('/:id', (req, res) => {
  db.get(
    `SELECT i.*, u.username, u.email as user_email,
            d.id as development_id, d.status as development_status,
            d.deliverable_url, dev.username as developer_username, dev.email as developer_email,
            (SELECT COUNT(*) FROM development_requests dr 
             WHERE dr.idea_id = i.id AND dr.status = 'pending') as pending_requests_count,
            (SELECT COUNT(*) FROM development_requests dr 
             WHERE dr.idea_id = i.id AND dr.status = 'in_progress') as active_requests_count
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
      // Also get active development if exists
      db.get(
        `SELECT d.*, dev.username as developer_username
         FROM developments d
         JOIN users dev ON d.developer_id = dev.id
         WHERE d.idea_id = ? AND d.status = 'started'`,
        [req.params.id],
        (err, activeDevelopment) => {
          res.json({ ...idea, activeDevelopment });
        }
      );
    }
  );
});

// Generate AI requirements for an idea
router.post('/:id/generate-requirements', authenticateToken, async (req: AuthRequest, res) => {
  const ideaId = req.params.id;
  
  // Check if user owns the idea
  db.get(
    'SELECT * FROM ideas WHERE id = ? AND user_id = ?',
    [ideaId, req.user!.id],
    async (err, idea: any) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!idea) {
        return res.status(404).json({ error: 'Idea not found or unauthorized' });
      }
      
      try {
        // OpenAI APIを使用して要件定義を生成
        const generatedRequirements = await generateRequirements(
          idea.title,
          idea.description,
          idea.budget
        );
        
        res.json({ requirements: generatedRequirements });
      } catch (error) {
        console.error('Error generating requirements:', error);
        res.status(500).json({ 
          error: error instanceof Error ? error.message : 'Failed to generate requirements',
          details: 'OpenAI APIキーが設定されていない可能性があります。.envファイルにOPENAI_API_KEYを設定してください。'
        });
      }
    }
  );
});

// Generate AI thumbnail from title (no idea ID required)
router.post('/generate-thumbnail', authenticateToken, async (req: AuthRequest, res) => {
  const { title } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  try {
    // Generate thumbnail URL using OpenAI DALL-E
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `A professional, modern thumbnail image for: ${title}. Style: clean, minimalist, tech-oriented, suitable for a web application showcase.`,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      }),
    });
    
    if (!response.ok) {
      throw new Error(`DALL-E API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    const thumbnailUrl = data.data[0].url;
    
    res.json({ thumbnail: thumbnailUrl });
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to generate thumbnail',
      details: 'DALL-E API error or configuration issue'
    });
  }
});

// Generate AI thumbnail for an idea
router.post('/:id/generate-thumbnail', authenticateToken, async (req: AuthRequest, res) => {
  const ideaId = req.params.id;
  
  // Check if user owns the idea
  db.get(
    'SELECT * FROM ideas WHERE id = ? AND user_id = ?',
    [ideaId, req.user!.id],
    async (err, idea: any) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!idea) {
        return res.status(404).json({ error: 'Idea not found or unauthorized' });
      }
      
      try {
        // Generate thumbnail URL using OpenAI DALL-E
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: `A professional, modern thumbnail image for: ${idea.title}. Style: clean, minimalist, tech-oriented, suitable for a web application showcase.`,
            n: 1,
            size: '1024x1024',
            quality: 'standard',
          }),
        });
        
        if (!response.ok) {
          throw new Error(`DALL-E API error: ${response.statusText}`);
        }
        
        const data = await response.json();
        const thumbnailUrl = data.data[0].url;
        
        res.json({ thumbnail: thumbnailUrl });
      } catch (error) {
        console.error('Error generating thumbnail:', error);
        res.status(500).json({ 
          error: error instanceof Error ? error.message : 'Failed to generate thumbnail',
          details: 'DALL-E API error or configuration issue'
        });
      }
    }
  );
});

// Update requirements for an idea
router.put('/:id/requirements', authenticateToken, (req: AuthRequest, res) => {
  const { requirements } = req.body;
  const ideaId = req.params.id;
  
  if (!requirements) {
    return res.status(400).json({ error: 'Requirements are required' });
  }
  
  // Check if user owns the idea
  db.get(
    'SELECT * FROM ideas WHERE id = ? AND user_id = ?',
    [ideaId, req.user!.id],
    (err, idea) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!idea) {
        return res.status(404).json({ error: 'Idea not found or unauthorized' });
      }
      
      // Update requirements
      db.run(
        'UPDATE ideas SET requirements = ? WHERE id = ?',
        [requirements, ideaId],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to update requirements' });
          }
          res.json({ success: true, requirements });
        }
      );
    }
  );
});

router.post('/', authenticateToken, (req: AuthRequest, res) => {
  if (req.user?.role !== 'client') {
    return res.status(403).json({ error: 'Only clients can post ideas' });
  }

  const { title, description, budget, thumbnail } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description required' });
  }

  db.run(
    'INSERT INTO ideas (user_id, title, description, budget, thumbnail, status, is_public) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [req.user.id, title, description, budget || null, thumbnail || null, 'open', 1],
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
        thumbnail,
        status: 'open',
        is_public: true,
        created_at: new Date().toISOString()
      });
    }
  );
});

// Update thumbnail for an idea
router.put('/:id/thumbnail', authenticateToken, (req: AuthRequest, res) => {
  const { thumbnail } = req.body;
  const ideaId = req.params.id;
  
  if (!thumbnail) {
    return res.status(400).json({ error: 'Thumbnail URL is required' });
  }
  
  // Check if user owns the idea
  db.get(
    'SELECT * FROM ideas WHERE id = ? AND user_id = ?',
    [ideaId, req.user!.id],
    (err, idea) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!idea) {
        return res.status(404).json({ error: 'Idea not found or unauthorized' });
      }
      
      // Update thumbnail
      db.run(
        'UPDATE ideas SET thumbnail = ?, updated_at = ? WHERE id = ?',
        [thumbnail, new Date().toISOString(), ideaId],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to update thumbnail' });
          }
          res.json({ success: true, thumbnail });
        }
      );
    }
  );
});

// Update idea visibility and budget
router.put('/:id', authenticateToken, (req: AuthRequest, res) => {
  const { is_public, budget } = req.body;
  const ideaId = req.params.id;
  
  // Check if user owns the idea
  db.get(
    'SELECT * FROM ideas WHERE id = ? AND user_id = ?',
    [ideaId, req.user!.id],
    (err, idea) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!idea) {
        return res.status(404).json({ error: 'Idea not found or unauthorized' });
      }
      
      const updates: string[] = [];
      const values: any[] = [];
      
      if (is_public !== undefined) {
        updates.push('is_public = ?');
        values.push(is_public ? 1 : 0);
      }
      
      if (budget !== undefined) {
        updates.push('budget = ?');
        values.push(budget);
      }
      
      if (updates.length === 0) {
        return res.status(400).json({ error: 'No updates provided' });
      }
      
      updates.push('updated_at = ?');
      values.push(new Date().toISOString());
      
      values.push(ideaId);
      
      db.run(
        `UPDATE ideas SET ${updates.join(', ')} WHERE id = ?`,
        values,
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to update idea' });
          }
          res.json({ success: true });
        }
      );
    }
  );
});

// Delete idea (soft delete)
router.delete('/:id', authenticateToken, (req: AuthRequest, res) => {
  const ideaId = req.params.id;
  
  // Check if user owns the idea
  db.get(
    'SELECT * FROM ideas WHERE id = ? AND user_id = ?',
    [ideaId, req.user!.id],
    (err, idea) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!idea) {
        return res.status(404).json({ error: 'Idea not found or unauthorized' });
      }
      
      db.run(
        'UPDATE ideas SET deleted = 1, updated_at = ? WHERE id = ?',
        [new Date().toISOString(), ideaId],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to delete idea' });
          }
          res.json({ success: true });
        }
      );
    }
  );
});

export default router;