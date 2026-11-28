import multer from 'multer';
import path from 'node:path';

const allowedTypes = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation'
]);
const allowedExtensions = new Set(['.pdf', '.docx', '.pptx']);
const maxBytes = Number(process.env.MAX_FILE_SIZE_MB || 20) * 1024 * 1024;

export const uploadDocument = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxBytes, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!allowedTypes.has(file.mimetype) || !allowedExtensions.has(path.extname(file.originalname).toLowerCase())) {
      return callback(new Error('Chỉ chấp nhận PDF, DOCX hoặc PPTX'));
    }
    callback(null, true);
  }
}).single('file');
