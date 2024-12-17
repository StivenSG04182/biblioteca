import express from 'express';
const router = express.Router();
import { pool } from '../config/database.js';

// Track visitor
const trackVisit = async (ip) => {
  const today = new Date().toISOString().split('T')[0];
  await db.query(
    'INSERT IGNORE INTO visits (visitor_ip, visit_date) VALUES (?, ?)',
    [ip, today]
  );
};

router.get('/', async (req, res) => {
  try {
    // Track current visit
    await trackVisit(req.ip);

    // Get total unique visitors
    const [visitsResult] = await db.query(
      'SELECT COUNT(DISTINCT visitor_ip) as total FROM visits'
    );
    
    // Get total questions
    const [questionsResult] = await db.query(
      'SELECT COUNT(*) as total FROM questions'
    );
    
    // Get most asked question
    const [mostAskedResult] = await db.query(`
      SELECT question, usage_count 
      FROM questions 
      WHERE usage_count = (
        SELECT MAX(usage_count) 
        FROM questions
      )
      LIMIT 1
    `);
    
    // Get least asked question
    const [leastAskedResult] = await db.query(`
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
    const [activityResult] = await db.query(`
      SELECT 
        id,
        action,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as timestamp
      FROM activity_log 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    res.json({
      totalVisits: visitsResult[0].total,
      totalQuestions: questionsResult[0].total,
      mostAskedQuestion: mostAskedResult[0]?.question || 'No questions asked yet',
      leastAskedQuestion: leastAskedResult[0]?.question || 'No questions asked yet',
      recentActivity: activityResult
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;