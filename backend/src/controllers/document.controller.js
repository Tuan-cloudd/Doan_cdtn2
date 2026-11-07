import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Document from '../models/Document.js';
import Comment from '../models/Comment.js';
import Rating from '../models/Rating.js';
import Favorite from '../models/Favorite.js';
import Download from '../models/Download.js';

const uploadDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', process.env.UPLOAD_DIR || 'uploads');
const cardPopulate = { path: 'owner', select: 'name' };

export async function listDocuments(req, res) {
  const { q, subject, major, faculty, type, sort = 'newest', page = '1', limit = '12' } = req.query;
  const pageNumber = Math.max(1, Number.parseInt(page, 10) || 1);
  const pageSize = Math.min(40, Math.max(1, Number.parseInt(limit, 10) || 12));
  const filter = { status: 'approved' };
  if (q?.trim()) filter.$text = { $search: q.trim() };
  for (const [key, value] of Object.entries({ subject, major, faculty, documentType: type })) {
    if (value) filter[key] = value;
  }
  const sortBy = sort === 'popular' ? { downloads: -1, createdAt: -1 } : sort === 'rated' ? { averageRating: -1, ratingCount: -1 } : { createdAt: -1 };
  const [documents, total] = await Promise.all([
    Document.find(filter).populate(cardPopulate).sort(sortBy).skip((pageNumber - 1) * pageSize).limit(pageSize),
    Document.countDocuments(filter)
  ]);
  res.json({ documents, pagination: { page: pageNumber, limit: pageSize, total, pages: Math.ceil(total / pageSize) } });
}

export async function getDocument(req, res) {
  const document = await Document.findOne({ _id: req.params.id, status: 'approved' }).populate(cardPopulate);
  if (!document) return res.status(404).json({ message: 'Không tìm thấy tài liệu' });
  const [comments, ratings, isFavorite] = await Promise.all([
    Comment.find({ document: document._id }).populate('user', 'name').sort({ createdAt: -1 }).limit(100),
    Rating.find({ document: document._id }).select('user value'),
    req.user ? Favorite.exists({ document: document._id, user: req.user._id }) : false
  ]);
  res.json({ document, comments, ratings, isFavorite: Boolean(isFavorite) });
}

export async function createDocument(req, res) {
  if (!req.file) return res.status(400).json({ message: 'Vui lòng chọn tệp tài liệu' });
  const { title, description, faculty, major, subject, documentType, keywords } = req.body;
  if (!title?.trim()) {
    fs.unlink(req.file.path, () => {});
    return res.status(400).json({ message: 'Tiêu đề là bắt buộc' });
  }
  const keywordList = typeof keywords === 'string'
    ? keywords.split(',').map((word) => word.trim().toLowerCase()).filter(Boolean).slice(0, 20)
    : [];
  const document = await Document.create({
    title: title.trim(), description, faculty, major, subject, documentType,
    keywords: keywordList,
    owner: req.user._id,
    originalName: req.file.originalname,
    storedName: req.file.filename,
    mimeType: req.file.mimetype,
    size: req.file.size
  });
  res.status(201).json({ document, message: 'Tài liệu đã được gửi để quản trị viên duyệt' });
}

export async function downloadDocument(req, res) {
  const document = await Document.findOne({ _id: req.params.id, status: 'approved' });
  if (!document) return res.status(404).json({ message: 'Không tìm thấy tài liệu' });
  const filePath = path.join(uploadDir, path.basename(document.storedName));
  if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'Tệp tài liệu không còn tồn tại' });
  document.downloads += 1;
  await Promise.all([
    document.save(),
    Download.create({ document: document._id, user: req.user?._id || null })
  ]);
  res.download(filePath, document.originalName);
}

export async function previewDocument(req, res) {
  const document = await Document.findOne({ _id: req.params.id, status: 'approved' });
  if (!document) return res.status(404).json({ message: 'Không tìm thấy tài liệu' });
  const filePath = path.join(uploadDir, path.basename(document.storedName));
  if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'Tệp tài liệu không còn tồn tại' });
  res.setHeader('Content-Type', document.mimeType);
  res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(document.originalName)}`);
  res.sendFile(filePath);
}

export async function addComment(req, res) {
  const document = await Document.findOne({ _id: req.params.id, status: 'approved' });
  if (!document) return res.status(404).json({ message: 'Không tìm thấy tài liệu' });
  const text = req.body.text?.trim();
  if (!text || text.length > 2000) return res.status(400).json({ message: 'Bình luận phải từ 1 đến 2000 ký tự' });
  const comment = await Comment.create({ document: document._id, user: req.user._id, text });
  await comment.populate('user', 'name');
  res.status(201).json({ comment });
}

export async function rateDocument(req, res) {
  const document = await Document.findOne({ _id: req.params.id, status: 'approved' });
  if (!document) return res.status(404).json({ message: 'Không tìm thấy tài liệu' });
  const value = Number(req.body.value);
  if (!Number.isInteger(value) || value < 1 || value > 5) return res.status(400).json({ message: 'Điểm đánh giá phải từ 1 đến 5' });
  await Rating.findOneAndUpdate(
    { document: document._id, user: req.user._id },
    { value },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );
  const aggregate = await Rating.aggregate([
    { $match: { document: document._id } },
    { $group: { _id: null, average: { $avg: '$value' }, count: { $sum: 1 } } }
  ]);
  document.averageRating = aggregate[0]?.average || 0;
  document.ratingCount = aggregate[0]?.count || 0;
  await document.save();
  res.json({ averageRating: document.averageRating, ratingCount: document.ratingCount });
}

export async function toggleFavorite(req, res) {
  const document = await Document.findOne({ _id: req.params.id, status: 'approved' });
  if (!document) return res.status(404).json({ message: 'Không tìm thấy tài liệu' });
  const favorite = await Favorite.findOne({ document: document._id, user: req.user._id });
  if (favorite) {
    await favorite.deleteOne();
    return res.json({ isFavorite: false });
  }
  await Favorite.create({ document: document._id, user: req.user._id });
  res.json({ isFavorite: true });
}
