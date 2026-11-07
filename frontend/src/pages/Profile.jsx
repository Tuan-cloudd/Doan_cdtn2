import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api, getErrorMessage } from '../services/api.js';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [passwordNotice, setPasswordNotice] = useState('');
  useEffect(() => { api.get('/users/documents').then(({ data }) => setDocuments(data.documents)).catch((err) => setError(getErrorMessage(err))); }, []);
  async function updateProfile(event) {
    event.preventDefault(); setNotice('');
    try {
      const { data } = await api.put('/users/profile', Object.fromEntries(new FormData(event.currentTarget)));
      setUser(data.user); setNotice('Thông tin đã được cập nhật.');
    } catch (err) { setNotice(getErrorMessage(err)); }
  }
  async function updatePassword(event) {
    event.preventDefault(); setPasswordNotice('');
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    if (values.newPassword !== values.confirmPassword) return setPasswordNotice('Mật khẩu mới xác nhận chưa khớp.');
    try {
      await api.put('/users/password', { currentPassword: values.currentPassword, newPassword: values.newPassword });
      form.reset(); setPasswordNotice('Đã đổi mật khẩu.');
    } catch (err) { setPasswordNotice(getErrorMessage(err)); }
  }
  async function deleteDocument(document) {
    if (!window.confirm(`Xóa tài liệu "${document.title}"?`)) return;
    try {
      await api.delete(`/users/documents/${document._id}`);
      setDocuments((items) => items.filter((item) => item._id !== document._id));
      setError('');
    } catch (err) { setError(getErrorMessage(err)); }
  }
  return <div className="page-wrap py-12">
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-xs font-bold uppercase tracking-[.15em] text-brand-600">Tài khoản của bạn</p><h1 className="section-title">Xin chào, {user.name}</h1></div><Link to="/favorites" className="button-secondary">♡ Tài liệu yêu thích</Link></div>
    <div className="grid items-start gap-6 lg:grid-cols-[.8fr_1.2fr]">
      <div className="space-y-6">
        <form className="card space-y-4 p-6" onSubmit={updateProfile}>
          <h2 className="text-lg font-extrabold">Thông tin cá nhân</h2>{notice && <p className="notice-success">{notice}</p>}
          <label className="block"><span className="label">Họ tên</span><input className="field" name="name" defaultValue={user.name} required maxLength="80" /></label>
          <label className="block"><span className="label">Email</span><input className="field bg-slate-50" value={user.email} disabled /></label>
          <label className="block"><span className="label">Giới thiệu</span><textarea className="field min-h-24" name="bio" defaultValue={user.bio} maxLength="500" /></label>
          <button className="button-primary">Lưu thay đổi</button>
        </form>
        <form className="card space-y-4 p-6" onSubmit={updatePassword}>
          <h2 className="text-lg font-extrabold">Đổi mật khẩu</h2>{passwordNotice && <p className="notice-success">{passwordNotice}</p>}
          <label className="block"><span className="label">Mật khẩu hiện tại</span><input className="field" name="currentPassword" type="password" autoComplete="current-password" required /></label>
          <label className="block"><span className="label">Mật khẩu mới</span><input className="field" name="newPassword" type="password" minLength="8" autoComplete="new-password" required /></label>
          <label className="block"><span className="label">Xác nhận mật khẩu mới</span><input className="field" name="confirmPassword" type="password" minLength="8" autoComplete="new-password" required /></label>
          <button className="button-secondary">Cập nhật mật khẩu</button>
        </form>
      </div>
      <section className="card p-6">
        <div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-extrabold">Tài liệu đã đăng tải</h2><p className="mt-1 text-sm text-muted">{documents.length} tài liệu</p></div><Link to="/upload" className="button-primary !px-4 !py-2.5">+ Tải lên</Link></div>
        {error && <p className="notice-error">{error}</p>}
        <div className="divide-y divide-slate-100">{documents.map((document) => <article key={document._id} className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0">
          <div className="min-w-0 flex-1"><h3 className="truncate font-bold text-ink">{document.title}</h3><p className="mt-1 text-xs text-muted">{document.subject || document.documentType || 'Tài liệu'} · {new Date(document.createdAt).toLocaleDateString('vi-VN')}</p>{document.status === 'rejected' && document.rejectionReason && <p className="mt-1 text-xs text-rose-600">Lý do: {document.rejectionReason}</p>}</div>
          <StatusBadge status={document.status} />
          {document.status === 'approved' && <Link to={`/documents/${document._id}`} className="text-sm font-bold text-brand-600">Xem</Link>}
          <button onClick={() => deleteDocument(document)} className="text-sm font-bold text-rose-600 hover:text-rose-700">Xóa</button>
        </article>)}
        {!documents.length && !error && <div className="rounded-xl bg-slate-50 py-12 text-center text-sm text-muted">Bạn chưa đăng tải tài liệu nào.</div>}
        </div>
      </section>
    </div>
  </div>;
}

export function StatusBadge({ status }) {
  const styles = { pending: 'bg-amber-50 text-amber-700', approved: 'bg-emerald-50 text-emerald-700', rejected: 'bg-rose-50 text-rose-700' };
  const labels = { pending: 'Chờ duyệt', approved: 'Đã duyệt', rejected: 'Từ chối' };
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${styles[status] || 'bg-slate-100 text-slate-600'}`}>{labels[status] || status}</span>;
}
