import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const baseDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', process.env.UPLOAD_DIR || 'uploads');
fs.mkdirSync(baseDir, { recursive: true });

const allowedTypes = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation'
]);
const allowedExtensions = new Set(['.pdf', '.docx', '.pptx']);
const maxBytes = Number(process.env.MAX_FILE_SIZE_MB || 20) * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, baseDir),
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${Date.now()}-${randomUUID()}${extension}`);
  }
});

export const uploadDocument = multer({
  storage,
  limits: { fileSize: maxBytes, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!allowedTypes.has(file.mimetype) || !allowedExtensions.has(path.extname(file.originalname).toLowerCase())) {
      return callback(new Error('Chỉ chấp nhận PDF, DOCX hoặc PPTX'));
    }
    callback(null, true);
  }
}).single('file');
