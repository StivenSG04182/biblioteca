import express from 'express';
import { pool } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Create new chat
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.user.id;
    
    const result = await pool.query(
      'INSERT INTO chats (user_id, title) VALUES ($1, $2) RETURNING id',
      [userId, title]
    );
    
    res.status(201).json({
      id: result.rows[0].id,
      title
    });
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update chat title
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { title } = req.body;
    await pool.query(
      'UPDATE chats SET title = $1 WHERE id = $2 AND user_id = $3',
      [title, req.params.id, req.user.id]
    );
    
    res.json({ message: 'Chat updated' });
  } catch (error) {
    console.error('Error updating chat:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete chat
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM chats WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ message: 'Chat deleted' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
