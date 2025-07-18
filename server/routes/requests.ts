import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import db from '../utils/db.js';

const router = express.Router();

// Get all development requests for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const query = userRole === 'client' ? `
      SELECT 
        dr.*,
        i.title as idea_title,
        i.thumbnail as idea_thumbnail,
        u.username as developer_username,
        (SELECT COUNT(*) FROM request_messages 
         WHERE request_id = dr.id AND is_read = 0 AND sender_id != ?) as unread_count
      FROM development_requests dr
      JOIN ideas i ON dr.idea_id = i.id
      JOIN users u ON dr.developer_id = u.id
      WHERE dr.client_id = ?
      ORDER BY dr.created_at DESC
    ` : `
      SELECT 
        dr.*,
        i.title as idea_title,
        i.thumbnail as idea_thumbnail,
        u.username as client_username,
        (SELECT COUNT(*) FROM request_messages 
         WHERE request_id = dr.id AND is_read = 0 AND sender_id != ?) as unread_count
      FROM development_requests dr
      JOIN ideas i ON dr.idea_id = i.id
      JOIN users u ON dr.client_id = u.id
      WHERE dr.developer_id = ?
      ORDER BY dr.created_at DESC
    `;

    db.all(query, [userId, userId], (err, requests) => {
      if (err) {
        console.error('Error fetching requests:', err);
        return res.status(500).json({ message: 'Failed to fetch requests' });
      }
      res.json(requests);
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Failed to fetch requests' });
  }
});

// Get a specific development request
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const userId = req.user!.id;

    db.get(`
      SELECT 
        dr.*,
        i.title as idea_title,
        i.description as idea_description,
        i.thumbnail as idea_thumbnail,
        c.username as client_username,
        d.username as developer_username
      FROM development_requests dr
      JOIN ideas i ON dr.idea_id = i.id
      JOIN users c ON dr.client_id = c.id
      LEFT JOIN users d ON dr.developer_id = d.id
      WHERE dr.id = ?
    `, [requestId], (err, request: any) => {
      if (err) {
        console.error('Error fetching request:', err);
        return res.status(500).json({ message: 'Failed to fetch request' });
      }
      
      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }

      // Check if user has access to this request
      if (request.client_id !== userId && request.developer_id !== userId && req.user!.role !== 'developer') {
        return res.status(403).json({ message: 'Access denied' });
      }

      res.json(request);
    });
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ message: 'Failed to fetch request' });
  }
});

// Create a new development request (開発者が依頼者に送る)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { idea_id, title, description, proposed_budget, proposed_deadline } = req.body;
    const developerId = req.user!.id;

    // Verify the user is a developer
    if (req.user!.role !== 'developer') {
      console.log('User role:', req.user!.role, 'Expected: developer');
      return res.status(403).json({ message: 'Only developers can send development requests. Current role: ' + req.user!.role });
    }

    // Get the idea and its owner (client)
    db.get('SELECT * FROM ideas WHERE id = ?', [idea_id], (err, idea: any) => {
      if (err) {
        console.error('Error fetching idea:', err);
        return res.status(500).json({ message: 'Failed to fetch idea' });
      }
      
      if (!idea) {
        return res.status(404).json({ message: 'Idea not found' });
      }

      // Check if developer already sent a request for this idea
      db.get(
        'SELECT * FROM development_requests WHERE idea_id = ? AND developer_id = ? AND status NOT IN ("rejected", "cancelled")',
        [idea_id, developerId],
        (err, existingRequest) => {
          if (err) {
            console.error('Error checking existing request:', err);
            return res.status(500).json({ message: 'Failed to check existing request' });
          }
          
          if (existingRequest) {
            return res.status(400).json({ message: 'You already have an active request for this idea' });
          }

          db.run(`
            INSERT INTO development_requests (idea_id, client_id, developer_id, title, description, proposed_budget, proposed_deadline)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [idea_id, idea.user_id, developerId, title, description, proposed_budget, proposed_deadline], function(err) {
            if (err) {
              console.error('Error creating request:', err);
              return res.status(500).json({ message: 'Failed to create request' });
            }
            
            res.status(201).json({ 
              id: this.lastID,
              message: 'Development request sent successfully' 
            });
          });
        }
      );
    });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ message: 'Failed to create request' });
  }
});

// Update development request status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const { status, developer_id } = req.body;
    const userId = req.user!.id;

    // Get the request
    db.get('SELECT * FROM development_requests WHERE id = ?', [requestId], (err, request: any) => {
      if (err) {
        console.error('Error fetching request:', err);
        return res.status(500).json({ message: 'Failed to fetch request' });
      }
      
      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }

      // Check permissions based on status change
      if (status === 'accepted' || status === 'rejected') {
        // Only client can accept/reject
        if (request.client_id !== userId) {
          return res.status(403).json({ message: 'Only the client can accept or reject requests' });
        }
      } else if (status === 'cancelled') {
        // Developer can cancel their own request
        if (request.developer_id !== userId) {
          return res.status(403).json({ message: 'Only the developer can cancel their request' });
        }
      } else {
        return res.status(400).json({ message: 'Invalid status change' });
      }

      // If accepting, change to 'in_progress'
      const finalStatus = status === 'accepted' ? 'in_progress' : status;

      // Update the request
      const updateQuery = 'UPDATE development_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      const params = [finalStatus, requestId];

      db.run(updateQuery, params, (err) => {
        if (err) {
          console.error('Error updating request:', err);
          return res.status(500).json({ message: 'Failed to update request' });
        }

        // If accepted, create development record and update idea status
        if (finalStatus === 'in_progress') {
          // Create development record
          db.run(
            'INSERT INTO developments (idea_id, developer_id, request_id, status) VALUES (?, ?, ?, ?)',
            [request.idea_id, request.developer_id, requestId, 'started'],
            function(err) {
              if (err) {
                console.error('Error creating development:', err);
                return res.status(500).json({ message: 'Failed to create development record' });
              }
              
              const developmentId = this.lastID;
              
              // Update idea status
              db.run(
                'UPDATE ideas SET status = ? WHERE id = ?',
                ['in_progress', request.idea_id],
                (err) => {
                  if (err) {
                    console.error('Error updating idea status:', err);
                  }
                }
              );
              
              // Create initial thread
              db.run(
                'INSERT INTO threads (development_id, title, created_by) VALUES (?, ?, ?)',
                [developmentId, '開発に関する相談', userId],
                function(err) {
                  if (err) {
                    console.error('Error creating thread:', err);
                  }
                  
                  res.json({ 
                    message: 'Request updated successfully',
                    developmentId: developmentId
                  });
                }
              );
            }
          );
        } else {
          res.json({ message: 'Request updated successfully' });
        }
      });
    });
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ message: 'Failed to update request' });
  }
});

// Get messages for a development request
router.get('/:id/messages', authenticateToken, async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const userId = req.user!.id;

    // Verify access
    db.get('SELECT * FROM development_requests WHERE id = ?', [requestId], (err, request: any) => {
      if (err) {
        console.error('Error fetching request:', err);
        return res.status(500).json({ message: 'Failed to fetch request' });
      }
      
      if (!request || (request.client_id !== userId && request.developer_id !== userId)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Mark messages as read
      db.run(`
        UPDATE request_messages 
        SET is_read = 1 
        WHERE request_id = ? AND sender_id != ?
      `, [requestId, userId], (err) => {
        if (err) {
          console.error('Error marking messages as read:', err);
        }
        
        // Get messages
        db.all(`
          SELECT 
            rm.*,
            u.username as sender_username,
            u.role as sender_role
          FROM request_messages rm
          JOIN users u ON rm.sender_id = u.id
          WHERE rm.request_id = ?
          ORDER BY rm.created_at ASC
        `, [requestId], (err, messages) => {
          if (err) {
            console.error('Error fetching messages:', err);
            return res.status(500).json({ message: 'Failed to fetch messages' });
          }
          
          res.json(messages);
        });
      });
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// Send a message
router.post('/:id/messages', authenticateToken, async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const { message } = req.body;
    const senderId = req.user!.id;

    // Verify access
    db.get('SELECT * FROM development_requests WHERE id = ?', [requestId], (err, request: any) => {
      if (err) {
        console.error('Error fetching request:', err);
        return res.status(500).json({ message: 'Failed to fetch request' });
      }
      
      if (!request || (request.client_id !== senderId && request.developer_id !== senderId)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      db.run(`
        INSERT INTO request_messages (request_id, sender_id, message)
        VALUES (?, ?, ?)
      `, [requestId, senderId, message], function(err) {
        if (err) {
          console.error('Error sending message:', err);
          return res.status(500).json({ message: 'Failed to send message' });
        }
        
        res.status(201).json({ 
          id: this.lastID,
          message: 'Message sent successfully' 
        });
      });
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

export default router;