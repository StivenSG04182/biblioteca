const path = require('path');
const fs = require('fs').promises;
const db = require('../config/database');

const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads');

const ensureUploadDir = async () => {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
};

const saveFile = async (file, questionId) => {
  await ensureUploadDir();

  const fileInfo = {
    originalName: file.originalname,
    fileName: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    path: `/uploads/${file.filename}`
  };

  const [result] = await db.query(
    'INSERT INTO media_files (question_id, file_path, file_name, file_size, mime_type) VALUES (?, ?, ?, ?, ?)',
    [questionId, fileInfo.path, fileInfo.originalName, fileInfo.size, fileInfo.mimeType]
  );

  return {
    id: result.insertId,
    ...fileInfo
  };
};

const deleteFile = async (filePath) => {
  if (!filePath) return;

  const fullPath = path.join(__dirname, '..', 'public', filePath);
  try {
    await fs.access(fullPath);
    await fs.unlink(fullPath);
    await db.query('DELETE FROM media_files WHERE file_path = ?', [filePath]);
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

const getFileInfo = async (questionId) => {
  const [files] = await db.query(
    'SELECT * FROM media_files WHERE question_id = ?',
    [questionId]
  );
  return files[0];
};

module.exports = {
  saveFile,
  deleteFile,
  getFileInfo
};