const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { sendRecoveryEmail } = require('../utils/email');

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Get user from database
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    
    // Hash the stored plain text password and update it in the database
    if (!user.password.startsWith('$2')) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id]);
      user.password = hashedPassword;
    }

    // Compare password
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register route
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user already exists
    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user with hashed password
    const [result] = await db.query(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [email, hashedPassword]
    );

    res.status(201).json({
      message: 'User registered successfully',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Password recovery route
router.post('/recover', async (req, res) => {
  try {
    const { email } = req.body;
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'Email not found' });
    }

    const code = Math.random().toString().substr(2, 6);
    const expiresAt = new Date(Date.now() + 30 * 60000); // 30 minutes

    await db.query(
      'INSERT INTO recovery_codes (user_id, code, expires_at) VALUES (?, ?, ?)',
      [users[0].id, code, expiresAt]
    );

    await sendRecoveryEmail(email, code);
    res.json({ message: 'Recovery code sent' });
  } catch (error) {
    console.error('Recovery error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'Email not found' });
    }

    const [codes] = await db.query(
      'SELECT * FROM recovery_codes WHERE user_id = ? AND code = ? AND expires_at > NOW() AND used = FALSE',
      [users[0].id, code]
    );

    if (codes.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, users[0].id]);
    await db.query('UPDATE recovery_codes SET used = TRUE WHERE id = ?', [codes[0].id]);

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;