import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Document from '../models/Document.js';
import Favorite from '../models/Favorite.js';
import { removeDocumentData } from '../services/document.service.js';

export async function updateProfile(req, res) {
  const { name, bio } = req.body;
  if (typeof name !== 'string' || !name.trim()) return res.status(400).json({ message: 'Họ tên không được để trống' });
  req.user.name = name.trim();
  req.user.bio = typeof bio === 'string' ? bio.trim().slice(0, 500) : req.user.bio;
  await req.user.save();
  res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role, bio: req.user.bio } });
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+passwordHash');
  if (!await bcrypt.compare(currentPassword || '', user.passwordHash)) return res.status(400).json({ message: 'Mật khẩu hiện tại không chính xác' });
  if (typeof newPassword !== 'string' || newPassword.length < 8) return res.status(400).json({ message: 'Mật khẩu mới cần ít nhất 8 ký tự' });
  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();
  res.json({ message: 'Đã đổi mật khẩu' });
}

export async function myDocuments(req, res) {
  const documents = await Document.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.json({ documents });
}

export async function deleteMyDocument(req, res) {
  const document = await Document.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
  if (!document) return res.status(404).json({ message: 'Không tìm thấy tài liệu của bạn' });
  await removeDocumentData(document);
  res.json({ message: 'Đã xóa tài liệu đã đăng tải' });
}

export async function myFavorites(req, res) {
  const favorites = await Favorite.find({ user: req.user._id }).populate({
    path: 'document',
    match: { status: 'approved' },
    populate: { path: 'owner', select: 'name' }
  }).sort({ createdAt: -1 });
  res.json({ documents: favorites.map((item) => item.document).filter(Boolean) });
}
