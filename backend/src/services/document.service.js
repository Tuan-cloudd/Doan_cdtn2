import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Comment from '../models/Comment.js';
import Rating from '../models/Rating.js';
import Favorite from '../models/Favorite.js';
import Download from '../models/Download.js';

const uploadDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', process.env.UPLOAD_DIR || 'uploads');

export async function removeDocumentData(document) {
  await Promise.all([
    Comment.deleteMany({ document: document._id }),
    Rating.deleteMany({ document: document._id }),
    Favorite.deleteMany({ document: document._id }),
    Download.deleteMany({ document: document._id })
  ]);
  await fs.unlink(path.join(uploadDir, path.basename(document.storedName))).catch((error) => {
    if (error.code !== 'ENOENT') throw error;
  });
}
