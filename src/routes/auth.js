import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';
import { sendRecoveryEmail } from '../utils/email.js';

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Hash the stored plain text password and update it in the database
    if (!user.password.startsWith('$2')) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, user.id]);
      user.password = hashedPassword;
    }

    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

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

    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id',
      [email, hashedPassword]
    );

    res.status(201).json({
      message: 'User registered successfully',
      userId: result.rows[0].id
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
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Email not found' });
    }

    const code = Math.random().toString().substr(2, 6);
    const expiresAt = new Date(Date.now() + 30 * 60000); // 30 minutes

    await pool.query(
      'INSERT INTO recovery_codes (user_id, code, expires_at) VALUES ($1, $2, $3)',
      [result.rows[0].id, code, expiresAt]
    );

    await sendRecoveryEmail(email, code);
    res.json({ message: 'Recovery code sent' });
  } catch (error) {
    console.error('Recovery error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;