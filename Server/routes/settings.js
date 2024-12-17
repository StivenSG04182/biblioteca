import express from 'express';
const router = express.Router();
import { pool } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

// Get user settings
router.get('/', authMiddleware, async (req, res) => {
  try {
    const settings = await pool.query(
      'SELECT * FROM user_settings WHERE user_id = $1',
      [req.user.id]
    );
    
    if (settings.rows.length === 0) {
      return res.json({
        dark_mode: true,
        voice_enabled: true
      });
    }

    res.json(settings.rows[0]);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user settings
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { dark_mode, voice_enabled } = req.body;
    
    await pool.query(
      `INSERT INTO user_settings (user_id, dark_mode, voice_enabled) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (user_id) DO UPDATE SET 
       dark_mode = EXCLUDED.dark_mode, 
       voice_enabled = EXCLUDED.voice_enabled`,
      [req.user.id, dark_mode, voice_enabled]
    );
    
    res.json({ message: 'Settings updated' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

