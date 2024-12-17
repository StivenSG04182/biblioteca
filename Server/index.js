import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import questionRoutes from './routes/questions.js';
import chatRoutes from './routes/chats.js';
import settingsRoutes from './routes/settings.js';
import statsRoutes from './routes/stats.js';
import userRoutes from './routes/users.js';
import { pool } from './config/database.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(cors({
  origin: [
    'https://gleaming-florentine-d99de8.netlify.app',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static(join(__dirname, 'public', 'uploads')));

// Track visits middleware
app.use(async (req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api/')) {
    const today = new Date().toISOString().split('T')[0];
    try {
      await pool.query(
        'INSERT INTO visits (visitor_ip, visit_date) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [req.ip, today]
      );
    } catch (error) {
      console.error('Error tracking visit:', error);
      // Continue execution even if tracking fails
    }
  }
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/users', userRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

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

// Verify database connection and tables
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Database connection successful. Current time:', res.rows[0].now);
    
    // Check if 'visits' table exists
    pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'visits'
      )
    `, (err, res) => {
      if (err) {
        console.error('Error checking visits table:', err);
      } else {
        console.log('Visits table exists:', res.rows[0].exists);
      }
    });
  }
});
