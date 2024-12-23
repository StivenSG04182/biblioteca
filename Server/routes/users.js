import express from 'express';
const router = express.Router();
import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

// Update user email
router.put('/email', authMiddleware, async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if email is already taken
    const existingUsers = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [email, req.user.id]
    );
    
    if (existingUsers.rows.length > 0) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    // Update email
    await pool.query(
      'UPDATE users SET email = $1 WHERE id = $2',
      [email, req.user.id]
    );
    
    // Log activity
    await pool.query(
      'INSERT INTO activity_log (action) VALUES ($1)',
      [`User ${req.user.id} updated email`]
    );
    
    res.json({ message: 'Email updated successfully' });
  } catch (error) {
    console.error('Error updating email:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user password
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Get current user
    const users = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (users.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, users.rows[0].password);
    if (!isValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, req.user.id]
    );
    
    // Log activity
    await pool.query(
      'INSERT INTO activity_log (action) VALUES ($1)',
      [`User ${req.user.id} changed password`]
    );
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
