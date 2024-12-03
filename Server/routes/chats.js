const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

// Create new chat
router.post('/', async (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.user?.id; // Optional user ID if authenticated
    
    const [result] = await db.query(
      'INSERT INTO chats (user_id, title) VALUES (?, ?)',
      [userId, title]
    );
    
    res.status(201).json({
      id: result.insertId,
      title
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update chat title
router.patch('/:id', async (req, res) => {
  try {
    const { title } = req.body;
    await db.query(
      'UPDATE chats SET title = ? WHERE id = ?',
      [title, req.params.id]
    );
    
    res.json({ message: 'Chat updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete chat
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM chats WHERE id = ?', [req.params.id]);
    res.json({ message: 'Chat deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;