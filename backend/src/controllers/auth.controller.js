import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { createToken } from '../utils/token.js';

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
