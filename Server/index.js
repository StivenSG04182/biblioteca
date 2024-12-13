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

// CORS configuration
app.use(cors({
  origin: [
    'https://gleaming-florentine-d99de8.netlify.app',
    'http://localhost:5173' // For local development
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Serve uploaded files from the public directory
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Track visits middleware
app.use(async (req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api/')) {
    const today = new Date().toISOString().split('T')[0];
    try {
      await db.query(
        'INSERT INTO visits (visitor_ip, visit_date) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [req.ip, today]
      );
    } catch (error) {
      console.error('Error tracking visit:', error);
    }
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
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
  console.error('Server Error:', err);
  res.status(500).json({ 
    message: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});