import express from 'express';
const router = express.Router();
import { pool } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

// Get user settings
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [settings] = await db.query(
      'SELECT * FROM user_settings WHERE user_id = ?',
      [req.user.id]
    );
    
    if (settings.length === 0) {
      return res.json({
        dark_mode: true,
        voice_enabled: true
      });
    }

    res.json(settings[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user settings
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { dark_mode, voice_enabled } = req.body;
    
    await db.query(
      `INSERT INTO user_settings (user_id, dark_mode, voice_enabled) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
       dark_mode = VALUES(dark_mode), 
       voice_enabled = VALUES(voice_enabled)`,
      [req.user.id, dark_mode, voice_enabled]
    );
    
    res.json({ message: 'Settings updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;