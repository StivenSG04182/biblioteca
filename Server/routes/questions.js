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
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { question, answer, content, content_type } = req.body;
    const questionId = req.params.id;

    // Verificar si la pregunta existe
    const existingQuestion = await client.query(
      'SELECT * FROM questions WHERE id = $1',
      [questionId]
    );

    if (existingQuestion.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Pregunta no encontrada' });
    }

    // Obtener información del archivo actual
    const currentFile = await client.query(
      'SELECT * FROM media_files WHERE question_id = $1',
      [questionId]
    );

    // Si hay un archivo nuevo y diferente al actual, eliminar el archivo anterior
    if (currentFile.rows[0] && content && currentFile.rows[0].file_path !== content) {
      await deleteFile(currentFile.rows[0].file_path);
    }

    // Actualizar la pregunta
    await client.query(
      `UPDATE questions 
       SET question = $1, 
           answer = $2, 
           content = $3, 
           content_type = $4,
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5`,
      [question, answer, content || null, content_type || null, questionId]
    );

    // Si hay contenido nuevo, actualizar o insertar en media_files
    if (content) {
      await client.query(
        `INSERT INTO media_files (file_path, question_id) 
         VALUES ($1, $2)
         ON CONFLICT (question_id) 
         DO UPDATE SET file_path = EXCLUDED.file_path`,
        [content, questionId]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Pregunta actualizada correctamente' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al actualizar pregunta:', error);
    res.status(500).json({ message: 'Error del servidor al actualizar la pregunta' });
  } finally {
    client.release();
  }
});

// Eliminar pregunta
router.delete('/:id', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const questionId = req.params.id;

    // Verificar si la pregunta existe
    const question = await client.query(
      'SELECT * FROM questions WHERE id = $1',
      [questionId]
    );

    if (question.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Pregunta no encontrada' });
    }

    // Obtener y eliminar archivo asociado
    const fileInfo = await client.query(
      'SELECT * FROM media_files WHERE question_id = $1',
      [questionId]
    );

    if (fileInfo.rows[0]) {
      await deleteFile(fileInfo.rows[0].file_path);
    }

    // Eliminar registros en orden correcto
    await client.query('DELETE FROM media_files WHERE question_id = $1', [questionId]);
    await client.query('DELETE FROM questions WHERE id = $1', [questionId]);

    await client.query('COMMIT');
    res.json({ message: 'Pregunta eliminada correctamente' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al eliminar pregunta:', error);
    res.status(500).json({ message: 'Error del servidor al eliminar la pregunta' });
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
