import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { saveFile, deleteFile, getFileInfo } from '../utils/fileHandler.js';

// Reemplazar __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configuración de multer para la carga de archivos
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

// Endpoint para cargar archivos
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

// Obtener todas las preguntas
router.get('/', async (req, res) => {
  try {
    const questions = await pool.query(`
      SELECT q.*, m.file_path, m.file_name, m.mime_type
      FROM questions q
      LEFT JOIN media_files m ON q.id = m.question_id
      ORDER BY q.created_at DESC
    `);
    res.json(questions.rows);
  } catch (error) {
    console.error('Error al obtener preguntas:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Crear una pregunta
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { question, answer, content, content_type } = req.body;
    
    const result = await pool.query(
      'INSERT INTO questions (question, answer, content, content_type) VALUES ($1, $2, $3, $4) RETURNING id',
      [question, answer, content || null, content_type || null]
    );

    const questionId = result.rows[0].id;

    if (content && content_type) {
      await pool.query(
        'UPDATE media_files SET question_id = $1 WHERE file_path = $2',
        [questionId, content]
      );
    }

    await pool.query(
      'INSERT INTO activity_log (action) VALUES ($1)',
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

// Actualizar pregunta
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { question, answer, content, content_type } = req.body;
    const questionId = req.params.id;

    const currentQuestion = await pool.query('SELECT * FROM questions WHERE id = $1', [questionId]);
    if (currentQuestion.rowCount === 0) return res.status(404).json({ message: 'Pregunta no encontrada' });

    const currentFile = await getFileInfo(questionId);

    // Si el archivo cambia, eliminar el anterior
    if (currentFile && content && currentFile.file_path !== content) {
      await deleteFile(currentFile.file_path);
    }

    // Actualizar pregunta
    await pool.query(
      'UPDATE questions SET question = $1, answer = $2, content = $3, content_type = $4 WHERE id = $5',
      [question, answer, content || null, content_type || null, questionId]
    );

    res.json({ message: 'Pregunta actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar pregunta:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Eliminar pregunta
router.delete('/:id', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const questionId = req.params.id;

    const question = await client.query('SELECT * FROM questions WHERE id = $1', [questionId]);
    if (question.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Pregunta no encontrada' });
    }

    const fileInfo = await getFileInfo(questionId);
    if (fileInfo) {
      await deleteFile(fileInfo.file_path);
    }

    await client.query('DELETE FROM media_files WHERE question_id = $1', [questionId]);
    await client.query('DELETE FROM questions WHERE id = $1', [questionId]);

    await client.query('COMMIT');

    res.json({ message: 'Pregunta eliminada correctamente' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al eliminar pregunta:', error);
    res.status(500).json({ message: 'Error del servidor' });
  } finally {
    client.release();
  }
});

// Registrar el uso de una pregunta
router.post('/:id/usage', async (req, res) => {
  try {
    await pool.query(
      'UPDATE questions SET usage_count = usage_count + 1 WHERE id = $1',
      [req.params.id]
    );
    res.json({ message: 'Uso registrado' });
  } catch (error) {
    console.error('Error al registrar uso:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

export default router;
