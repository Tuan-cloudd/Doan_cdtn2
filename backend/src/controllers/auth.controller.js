import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import User from '../models/User.js';
import { createToken } from '../utils/token.js';
import { sendPasswordResetEmail } from '../utils/mailer.js';

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  bio: user.bio,
  createdAt: user.createdAt
});

export async function register(req, res) {
  const { name, email, password } = req.body;
  if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ message: 'Họ tên, email hợp lệ và mật khẩu tối thiểu 8 ký tự là bắt buộc' });
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ message: 'Email đã được sử dụng' });
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: await bcrypt.hash(password, 12)
  });
  res.status(201).json({ token: createToken(user._id.toString()), user: publicUser(user) });
}

export async function login(req, res) {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = req.body.password;
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !user.isActive || !await bcrypt.compare(password || '', user.passwordHash)) {
    return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
  }
  res.json({ token: createToken(user._id.toString()), user: publicUser(user) });
}

export function getCurrentUser(req, res) {
  res.json({ user: publicUser(req.user) });
}

export async function forgotPassword(req, res) {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const user = await User.findOne({ email }).select('+passwordResetTokenHash +passwordResetExpires');
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    user.passwordResetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();

    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${baseUrl}/reset-password/${token}`;
    await sendPasswordResetEmail(user.email, resetUrl);

    if (process.env.NODE_ENV !== 'production' && !process.env.SMTP_HOST) {
      return res.json({ message: 'Liên kết đặt lại đã được tạo ở môi trường demo.', demoResetUrl: resetUrl });
    }
  }
  res.json({ message: 'Nếu email tồn tại trong hệ thống, liên kết đặt lại mật khẩu sẽ được gửi.' });
}

export async function resetPassword(req, res) {
  const { token, password } = req.body;
  if (typeof token !== 'string' || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ message: 'Mã đặt lại không hợp lệ hoặc mật khẩu cần ít nhất 8 ký tự' });
  }
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpires: { $gt: new Date() }
  }).select('+passwordHash +passwordResetTokenHash +passwordResetExpires');
  if (!user) return res.status(400).json({ message: 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn' });
  user.passwordHash = await bcrypt.hash(password, 12);
  user.passwordResetTokenHash = '';
  user.passwordResetExpires = null;
  await user.save();
  res.json({ message: 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.' });
}
