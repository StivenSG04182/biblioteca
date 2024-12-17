import express from 'express';
import multer from 'multer';
import path from 'path';
import { pool } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { saveFile, deleteFile, getFileInfo } from '../utils/fileHandler.js';

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'video/mp4',
      'video/webm',
      'audio/mpeg',
      'audio/wav',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no válido'));
    }
  }
});

// File upload endpoint
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se subió ningún archivo' });
    }

    const fileInfo = await saveFile(req.file, null);
    res.json({ 
      url: fileInfo.path,
      fileName: fileInfo.originalName,
      mimeType: fileInfo.mimeType
    });
  } catch (error) {
    console.error('Error al subir archivo:', error);
    res.status(500).json({ message: 'Error al subir archivo' });
  }
});

// Get all questions with file info
router.get('/', async (req, res) => {
  try {
    const [questions] = await db.query(`
      SELECT q.*, m.file_path, m.file_name, m.mime_type
      FROM questions q
      LEFT JOIN media_files m ON q.id = m.question_id
      ORDER BY q.created_at DESC
    `);
    res.json(questions);
  } catch (error) {
    console.error('Error al obtener preguntas:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Create question with file
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { question, answer, content, content_type } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO questions (question, answer, content, content_type) VALUES (?, ?, ?, ?)',
      [question, answer, content || null, content_type || null]
    );

    const questionId = result.insertId;

    // If there's a file path in content, associate it with the question
    if (content && content_type) {
      await db.query(
        'UPDATE media_files SET question_id = ? WHERE file_path = ?',
        [questionId, content]
      );
    }
    
    await db.query(
      'INSERT INTO activity_log (action) VALUES (?)',
      [`Nueva pregunta agregada: ${question}`]
    );
    
    res.status(201).json({
      id: questionId,
      question,
      answer,
      content,
      content_type
    });
  } catch (error) {
    console.error('Error al crear pregunta:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Update question
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { question, answer, content, content_type } = req.body;
    const questionId = req.params.id;
    
    // Get current question and file info
    const [currentQuestion] = await db.query(
      'SELECT * FROM questions WHERE id = ?',
      [questionId]
    );

    const currentFile = await getFileInfo(questionId);

    // If there's a new file and an old file exists, delete the old one
    if (currentFile && content && currentFile.file_path !== content) {
      await deleteFile(currentFile.file_path);
    }

    // Update question
    await db.query(
      'UPDATE questions SET question = ?, answer = ?, content = ?, content_type = ? WHERE id = ?',
      [question, answer, content || null, content_type || null, questionId]
    );

    // If there's a new file path in content, update its association
    if (content && content_type) {
      await db.query(
        'UPDATE media_files SET question_id = ? WHERE file_path = ?',
        [questionId, content]
      );
    }
    
    await db.query(
      'INSERT INTO activity_log (action) VALUES (?)',
      [`Pregunta actualizada: ${question}`]
    );
    
    res.json({ message: 'Pregunta actualizada' });
  } catch (error) {
    console.error('Error al actualizar pregunta:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Delete question
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [question] = await db.query(
      'SELECT * FROM questions WHERE id = ?',
      [req.params.id]
    );

    const fileInfo = await getFileInfo(req.params.id);
    if (fileInfo) {
      await deleteFile(fileInfo.file_path);
    }
    
    await db.query('DELETE FROM questions WHERE id = ?', [req.params.id]);
    
    await db.query(
      'INSERT INTO activity_log (action) VALUES (?)',
      [`Pregunta eliminada: ${question[0]?.question}`]
    );
    
    res.json({ message: 'Pregunta eliminada' });
  } catch (error) {
    console.error('Error al eliminar pregunta:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Track question usage
router.post('/:id/usage', async (req, res) => {
  try {
    await db.query(
      'UPDATE questions SET usage_count = usage_count + 1 WHERE id = ?',
      [req.params.id]
    );
    res.json({ message: 'Uso registrado' });
  } catch (error) {
    console.error('Error al registrar uso:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

export default router;