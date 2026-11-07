import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authenticate = asyncHandler(async (req, _res, next) => {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;
  if (!token) return resUnauthorized(next);
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return next(Object.assign(new Error('Phiên đăng nhập không hợp lệ hoặc đã hết hạn'), { status: 401 }));
  }
  const user = await User.findById(payload.sub).select('-passwordHash');
  if (!user || !user.isActive) return next(Object.assign(new Error('Tài khoản không tồn tại hoặc đã bị khóa'), { status: 401 }));
  req.user = user;
  next();
});

export async function optionalAuthenticate(req, _res, next) {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;
  if (!token) return next();
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(payload.sub).select('-passwordHash');
    if (req.user && !req.user.isActive) req.user = null;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') return next();
    next(error);
  }
}

function resUnauthorized(next) {
  return next(Object.assign(new Error('Vui lòng đăng nhập để tiếp tục'), { status: 401 }));
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(Object.assign(new Error('Bạn không có quyền thực hiện thao tác này'), { status: 403 }));
    }
    next();
  };
}
