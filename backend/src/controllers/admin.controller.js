import User from '../models/User.js';
import Document from '../models/Document.js';
import Comment from '../models/Comment.js';
import Download from '../models/Download.js';
import { removeDocumentData } from '../services/document.service.js';

export async function dashboard(_req, res) {
  const [users, documents, pending, downloads, popularDocuments, latestDocuments] = await Promise.all([
    User.countDocuments(),
    Document.countDocuments({ status: 'approved' }),
    Document.countDocuments({ status: 'pending' }),
    Download.countDocuments(),
    Document.find({ status: 'approved' }).populate('owner', 'name').sort({ downloads: -1 }).limit(5),
    Document.find({ status: 'approved' }).populate('owner', 'name').sort({ createdAt: -1 }).limit(5)
  ]);
  res.json({ stats: { users, documents, pending, downloads }, popularDocuments, latestDocuments });
}

export async function listUsers(_req, res) {
  const users = await User.find().select('name email role isActive createdAt').sort({ createdAt: -1 }).limit(200);
  res.json({ users });
}

export async function setUserStatus(req, res) {
  if (req.params.id === req.user._id.toString()) return res.status(400).json({ message: 'Không thể khóa tài khoản đang sử dụng' });
  if (typeof req.body.isActive !== 'boolean') return res.status(400).json({ message: 'Trạng thái tài khoản không hợp lệ' });
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
  user.isActive = req.body.isActive;
  await user.save();
  res.json({ user: { id: user._id, name: user.name, isActive: user.isActive } });
}

export async function listPendingDocuments(_req, res) {
  const documents = await Document.find({ status: 'pending' }).populate('owner', 'name email').sort({ createdAt: 1 });
  res.json({ documents });
}

export async function moderateDocument(req, res) {
  const status = req.body.status;
  if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ message: 'Trạng thái duyệt không hợp lệ' });
  const document = await Document.findById(req.params.id);
  if (!document) return res.status(404).json({ message: 'Không tìm thấy tài liệu' });
  document.status = status;
  document.rejectionReason = status === 'rejected' ? String(req.body.reason || '').trim().slice(0, 500) : '';
  await document.save();
  res.json({ document });
}

export async function deleteDocument(req, res) {
  const document = await Document.findByIdAndDelete(req.params.id);
  if (!document) return res.status(404).json({ message: 'Không tìm thấy tài liệu' });
  await removeDocumentData(document);
  res.json({ message: 'Đã xóa tài liệu và dữ liệu liên quan' });
}

export async function listComments(_req, res) {
  const comments = await Comment.find().populate('user', 'name').populate('document', 'title').sort({ createdAt: -1 }).limit(200);
  res.json({ comments });
}

export async function deleteComment(req, res) {
  const comment = await Comment.findByIdAndDelete(req.params.commentId);
  if (!comment) return res.status(404).json({ message: 'Không tìm thấy bình luận' });
  res.json({ message: 'Đã xóa bình luận' });
}
