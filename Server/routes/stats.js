import express from 'express';
import { pool } from '../config/database.js';

const router = express.Router();

// Track visitor
const trackVisit = async (ip) => {
  const today = new Date().toISOString().split('T')[0];
  await pool.query(
    'INSERT INTO visits (visitor_ip, visit_date) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [ip, today]
  );
};

router.get('/', async (req, res) => {
  try {
    // Track current visit
    await trackVisit(req.ip);

    // Get total unique visitors
    const visitsResult = await pool.query(
      'SELECT COUNT(DISTINCT visitor_ip) as total FROM visits'
    );
    
    // Get total questions
    const questionsResult = await pool.query(
      'SELECT COUNT(*) as total FROM questions'
    );
    
    // Get most asked question
    const mostAskedResult = await pool.query(`
      SELECT question, usage_count 
      FROM questions 
      WHERE usage_count = (
        SELECT MAX(usage_count) 
        FROM questions
      )
      LIMIT 1
    `);
    
    // Get least asked question
    const leastAskedResult = await pool.query(`
      SELECT question, usage_count 
      FROM questions 
      WHERE usage_count = (
        SELECT MIN(usage_count) 
        FROM questions 
        WHERE usage_count > 0
      )
      LIMIT 1
    `);
    
    // Get recent activity with formatted timestamps
    const activityResult = await pool.query(`
      SELECT 
        id,
        action,
        to_char(created_at, 'YYYY-MM-DD HH24:MI:SS') as timestamp
      FROM activity_log 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    res.json({
      totalVisits: visitsResult.rows[0].total,
      totalQuestions: questionsResult.rows[0].total,
      mostAskedQuestion: mostAskedResult.rows[0]?.question || 'No questions asked yet',
      leastAskedQuestion: leastAskedResult.rows[0]?.question || 'No questions asked yet',
      recentActivity: activityResult.rows
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;