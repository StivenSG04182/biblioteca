require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');
const chatRoutes = require('./routes/chats');
const settingsRoutes = require('./routes/settings');
const statsRoutes = require('./routes/stats');
const userRoutes = require('./routes/users');
const db = require('./config/database');

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded files from the public directory
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Track visits middleware
app.use(async (req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api/')) {
    const today = new Date().toISOString().split('T')[0];
    try {
      await db.query(
        'INSERT IGNORE INTO visits (visitor_ip, visit_date) VALUES (?, ?)',
        [req.ip, today]
      );
    } catch (error) {
      console.error('Error tracking visit:', error);
    }
  }
  next();
});

// Enable CORS for file uploads
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error del servidor:', err);
  res.status(500).json({ 
    message: 'Error del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});