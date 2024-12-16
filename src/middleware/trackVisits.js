import { pool } from '../config/database.js';

export const trackVisits = async (req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api/')) {
    const today = new Date().toISOString().split('T')[0];
    try {
      await pool.query(
        'INSERT INTO visits (visitor_ip, visit_date) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [req.ip, today]
      );
    } catch (error) {
      console.error('Error tracking visit:', error);
    }
  }
  next();
};