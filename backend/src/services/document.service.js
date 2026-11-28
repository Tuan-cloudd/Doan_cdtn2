import Comment from '../models/Comment.js';
import Rating from '../models/Rating.js';
import Favorite from '../models/Favorite.js';
import Download from '../models/Download.js';
import { deleteDocumentFile } from './document-file.service.js';

export async function removeDocumentData(document) {
  await Promise.all([
    Comment.deleteMany({ document: document._id }),
    Rating.deleteMany({ document: document._id }),
    Favorite.deleteMany({ document: document._id }),
    Download.deleteMany({ document: document._id })
  ]);
  await deleteDocumentFile(document.storedName);
}
