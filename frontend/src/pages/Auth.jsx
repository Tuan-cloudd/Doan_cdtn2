import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../services/api.js';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try { await login(values); navigate('/'); } catch (err) { setError(getErrorMessage(err)); } finally { setBusy(false); }
  }
  return <AuthFrame title="Chào mừng trở lại" subtitle="Đăng nhập để tiếp tục hành trình học tập."><form onSubmit={submit} className="space-y-4">
    {error && <p className="notice-error">{error}</p>}
    <label className="block"><span className="label">Email</span><input className="field" name="email" type="email" autoComplete="email" required placeholder="ban@email.com" /></label>
    <label className="block"><span className="label">Mật khẩu</span><input className="field" name="password" type="password" autoComplete="current-password" required placeholder="Nhập mật khẩu" /></label>
    <button className="button-primary w-full" disabled={busy}>{busy ? 'Đang đăng nhập…' : 'Đăng nhập'}</button>
    <p className="pt-1 text-center text-sm text-muted">Chưa có tài khoản? <Link to="/register" className="font-bold text-brand-600">Đăng ký ngay</Link></p>
  </form></AuthFrame>;
}

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (values.password !== values.confirmPassword) { setBusy(false); setError('Mật khẩu xác nhận chưa khớp'); return; }
    delete values.confirmPassword;
    try { await register(values); navigate('/'); } catch (err) { setError(getErrorMessage(err)); } finally { setBusy(false); }
  }
  return <AuthFrame title="Tạo tài khoản mới" subtitle="Tham gia cộng đồng chia sẻ tri thức."><form onSubmit={submit} className="space-y-4">
    {error && <p className="notice-error">{error}</p>}
    <label className="block"><span className="label">Họ và tên</span><input className="field" name="name" required maxLength="80" placeholder="Nguyễn Minh Anh" /></label>
    <label className="block"><span className="label">Email</span><input className="field" name="email" type="email" autoComplete="email" required placeholder="ban@email.com" /></label>
    <label className="block"><span className="label">Mật khẩu</span><input className="field" name="password" type="password" autoComplete="new-password" minLength="8" required placeholder="Tối thiểu 8 ký tự" /></label>
    <label className="block"><span className="label">Nhập lại mật khẩu</span><input className="field" name="confirmPassword" type="password" autoComplete="new-password" minLength="8" required placeholder="Nhập lại mật khẩu" /></label>
    <button className="button-primary w-full" disabled={busy}>{busy ? 'Đang tạo tài khoản…' : 'Tạo tài khoản'}</button>
    <p className="pt-1 text-center text-sm text-muted">Đã có tài khoản? <Link to="/login" className="font-bold text-brand-600">Đăng nhập</Link></p>
  </form></AuthFrame>;
}

function AuthFrame({ title, subtitle, children }) {
  return <div className="page-wrap grid min-h-[70vh] place-items-center py-12"><div className="w-full max-w-[460px] rounded-3xl border border-blue-100 bg-white p-7 shadow-card sm:p-9">
    <div className="mb-7 text-center"><span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-xl font-black text-brand-600">S</span><h1 className="text-2xl font-extrabold text-ink">{title}</h1><p className="mt-2 text-sm text-muted">{subtitle}</p></div>
    {children}
  </div></div>;
}
