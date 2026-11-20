import Notification from '../models/Notification.js';
import Report from '../models/Report.js';
import Collection from '../models/Collection.js';
import Download from '../models/Download.js';
import Document from '../models/Document.js';

export async function listNotifications(req, res) {
  const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(100);
  const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
  res.json({ notifications, unreadCount });
}

export async function markNotificationRead(req, res) {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true }
  );
  res.json({ message: 'Đã đánh dấu đã đọc' });
}

export async function markAllNotificationsRead(req, res) {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
  res.json({ message: 'Đã đánh dấu tất cả là đã đọc' });
}

export async function createReport(req, res) {
  const document = await Document.findById(req.params.id);
  if (!document) return res.status(404).json({ message: 'Không tìm thấy tài liệu' });
  const allowed = ['copyright', 'spam', 'wrong_subject', 'inappropriate', 'other'];
  if (!allowed.includes(req.body.reason)) return res.status(400).json({ message: 'Loại báo cáo không hợp lệ' });
  try {
    await Report.create({
      document: document._id,
      reporter: req.user._id,
      reason: req.body.reason,
      details: String(req.body.details || '').trim().slice(0, 1000)
    });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ message: 'Bạn đã báo cáo tài liệu này trước đó' });
    throw error;
  }
  res.status(201).json({ message: 'Đã gửi báo cáo cho quản trị viên' });
}

export async function listCollections(req, res) {
  const collections = await Collection.find({ owner: req.user._id })
    .populate({ path: 'documents', match: { status: 'approved' }, select: 'title documentType subject downloads averageRating' })
    .sort({ updatedAt: -1 });
  res.json({ collections });
}

export async function createCollection(req, res) {
  const name = String(req.body.name || '').trim();
  if (!name) return res.status(400).json({ message: 'Tên bộ sưu tập là bắt buộc' });
  try {
    const collection = await Collection.create({
      owner: req.user._id,
      name,
      description: String(req.body.description || '').trim().slice(0, 500)
    });
    res.status(201).json({ collection });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ message: 'Tên bộ sưu tập đã tồn tại' });
    throw error;
  }
}

export async function updateCollection(req, res) {
  const collection = await Collection.findOne({ _id: req.params.id, owner: req.user._id });
  if (!collection) return res.status(404).json({ message: 'Không tìm thấy bộ sưu tập' });
  if (req.body.name !== undefined) {
    const name = String(req.body.name).trim();
    if (!name) return res.status(400).json({ message: 'Tên bộ sưu tập là bắt buộc' });
    collection.name = name;
  }
  if (req.body.description !== undefined) collection.description = String(req.body.description).trim().slice(0, 500);
  await collection.save();
  res.json({ collection });
}

export async function deleteCollection(req, res) {
  const collection = await Collection.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
  if (!collection) return res.status(404).json({ message: 'Không tìm thấy bộ sưu tập' });
  res.json({ message: 'Đã xóa bộ sưu tập' });
}

export async function toggleCollectionDocument(req, res) {
  const collection = await Collection.findOne({ _id: req.params.id, owner: req.user._id });
  if (!collection) return res.status(404).json({ message: 'Không tìm thấy bộ sưu tập' });
  const document = await Document.findOne({ _id: req.params.documentId, status: 'approved' });
  if (!document) return res.status(404).json({ message: 'Không tìm thấy tài liệu đã duyệt' });
  const key = document._id.toString();
  const exists = collection.documents.some((item) => item.toString() === key);
  collection.documents = exists
    ? collection.documents.filter((item) => item.toString() !== key)
    : [...collection.documents, document._id];
  await collection.save();
  res.json({ isInCollection: !exists });
}

export async function downloadHistory(req, res) {
  const history = await Download.find({ user: req.user._id })
    .populate({ path: 'document', match: { status: 'approved' }, populate: { path: 'owner', select: 'name' } })
    .sort({ downloadedAt: -1 })
    .limit(100);
  res.json({ documents: history.map((item) => item.document).filter(Boolean) });
}
