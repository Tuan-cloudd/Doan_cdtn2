import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../services/api.js';
import DocumentGrid from '../components/DocumentGrid.jsx';

const tabs = [['overview', 'Tổng quan'], ['queue', 'Duyệt tài liệu'], ['users', 'Người dùng'], ['categories', 'Danh mục'], ['comments', 'Bình luận']];

export default function Admin() {
  const [tab, setTab] = useState('overview');
  const [dashboard, setDashboard] = useState(null);
  const [pending, setPending] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [comments, setComments] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const load = async (target = tab) => {
    setError('');
    try {
      if (target === 'overview') setDashboard((await api.get('/admin/dashboard')).data);
      if (target === 'queue') setPending((await api.get('/admin/documents/pending')).data.documents);
      if (target === 'users') setUsers((await api.get('/admin/users')).data.users);
      if (target === 'categories') setCategories((await api.get('/categories')).data.categories);
      if (target === 'comments') setComments((await api.get('/admin/comments')).data.comments);
    } catch (err) { setError(getErrorMessage(err)); }
  };
  useEffect(() => { load(tab); }, [tab]);
  async function moderate(id, status) {
    try { await api.patch(`/admin/documents/${id}/moderate`, { status }); setPending((items) => items.filter((item) => item._id !== id)); setMessage(status === 'approved' ? 'Đã duyệt tài liệu.' : 'Đã từ chối tài liệu.'); }
    catch (err) { setError(getErrorMessage(err)); }
  }
  async function removeDocument(id) {
    if (!window.confirm('Xóa tài liệu và dữ liệu liên quan?')) return;
    try { await api.delete(`/admin/documents/${id}`); setPending((items) => items.filter((item) => item._id !== id)); setMessage('Đã xóa tài liệu.'); }
    catch (err) { setError(getErrorMessage(err)); }
  }
  async function toggleUser(user) {
    try { await api.patch(`/admin/users/${user._id}/status`, { isActive: !user.isActive }); setUsers((items) => items.map((item) => item._id === user._id ? { ...item, isActive: !item.isActive } : item)); }
    catch (err) { setError(getErrorMessage(err)); }
  }
  async function deleteComment(id) {
    if (!window.confirm('Xóa bình luận này?')) return;
    try { await api.delete(`/admin/comments/${id}`); setComments((items) => items.filter((item) => item._id !== id)); }
    catch (err) { setError(getErrorMessage(err)); }
  }
  return <div className="page-wrap py-10">
    <div className="mb-8"><p className="mb-2 text-xs font-bold uppercase tracking-[.15em] text-brand-600">Bảng điều khiển</p><h1 className="section-title">Quản trị hệ thống</h1></div>
    <div className="mb-6 flex gap-2 overflow-x-auto border-b border-blue-100 pb-3">{tabs.map(([key, label]) => <button key={key} onClick={() => setTab(key)} className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-bold ${tab === key ? 'bg-brand-600 text-white' : 'bg-white text-muted hover:text-ink'}`}>{label}</button>)}</div>
    {error && <p className="notice-error mb-4">{error}</p>}{message && <p className="notice-success mb-4">{message}</p>}
    {tab === 'overview' && <Overview data={dashboard} />}
    {tab === 'queue' && <div className="space-y-4">{pending.map((doc) => <article className="card flex flex-wrap items-center justify-between gap-4 p-5" key={doc._id}><div className="min-w-0 flex-1"><h2 className="font-bold text-ink">{doc.title}</h2><p className="mt-1 text-sm text-muted">{doc.owner?.name} · {doc.owner?.email} · {doc.originalName}</p><p className="mt-2 line-clamp-2 text-sm text-slate-600">{doc.description}</p></div><div className="flex gap-2"><button className="button-primary !px-3 !py-2" onClick={() => moderate(doc._id, 'approved')}>Duyệt</button><button className="button-secondary !px-3 !py-2" onClick={() => moderate(doc._id, 'rejected')}>Từ chối</button><button className="rounded-lg px-3 text-rose-600 hover:bg-rose-50" onClick={() => removeDocument(doc._id)}>Xóa</button></div></article>)}{!pending.length && <Empty text="Không có tài liệu nào đang chờ duyệt." />}</div>}
    {tab === 'users' && <div className="card overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-muted"><tr><th className="p-4">Người dùng</th><th className="p-4">Vai trò</th><th className="p-4">Trạng thái</th><th className="p-4">Ngày tham gia</th><th className="p-4"></th></tr></thead><tbody className="divide-y divide-slate-100">{users.map((user) => <tr key={user._id}><td className="p-4"><strong>{user.name}</strong><p className="text-xs text-muted">{user.email}</p></td><td className="p-4">{user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</td><td className="p-4">{user.isActive ? 'Đang hoạt động' : 'Đã khóa'}</td><td className="p-4">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td><td className="p-4">{user.role !== 'admin' && <button className="font-bold text-brand-600" onClick={() => toggleUser(user)}>{user.isActive ? 'Khóa' : 'Mở khóa'}</button>}</td></tr>)}</tbody></table></div></div>}
    {tab === 'categories' && <CategoryManager categories={categories} reload={() => load('categories')} setError={setError} setMessage={setMessage} />}
    {tab === 'comments' && <div className="card divide-y divide-slate-100 p-5">{comments.map((comment) => <article key={comment._id} className="flex items-start justify-between gap-4 py-4 first:pt-0"><div><p className="text-sm font-bold">{comment.user?.name} <span className="font-normal text-muted">trên</span> {comment.document?.title || 'Tài liệu đã xóa'}</p><p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{comment.text}</p><time className="mt-1 block text-xs text-muted">{new Date(comment.createdAt).toLocaleDateString('vi-VN')}</time></div><button onClick={() => deleteComment(comment._id)} className="text-sm font-bold text-rose-600">Xóa</button></article>)}{!comments.length && <Empty text="Chưa có bình luận." />}</div>}
  </div>;
}

function Overview({ data }) {
  if (!data) return <p className="py-16 text-center text-muted">Đang tải thống kê…</p>;
  const statCards = [['Người dùng', data.stats.users, '♙'], ['Tài liệu công khai', data.stats.documents, '▱'], ['Chờ duyệt', data.stats.pending, '◷'], ['Lượt tải', data.stats.downloads, '↓']];
  return <><div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{statCards.map(([label, value, icon]) => <div className="card p-5" key={label}><div className="flex justify-between text-sm font-semibold text-muted"><span>{label}</span><span className="text-xl text-brand-500">{icon}</span></div><p className="mt-4 text-3xl font-black text-ink">{value.toLocaleString('vi-VN')}</p></div>)}</div>
    <div className="grid gap-6 lg:grid-cols-2"><section><h2 className="mb-4 text-lg font-extrabold">Tài liệu phổ biến</h2><DocumentGrid documents={data.popularDocuments} /></section><section><h2 className="mb-4 text-lg font-extrabold">Tài liệu mới nhất</h2><DocumentGrid documents={data.latestDocuments} /></section></div></>;
}

function CategoryManager({ categories, reload, setError, setMessage }) {
  const [formError, setFormError] = useState('');
  async function submit(event) {
    event.preventDefault(); setFormError(''); setError('');
    const form = event.currentTarget;
    try {
      await api.post('/categories', Object.fromEntries(new FormData(form)));
      form.reset(); setMessage('Đã thêm danh mục.'); reload();
    } catch (err) { setFormError(getErrorMessage(err)); }
  }
  async function remove(id) {
    if (!window.confirm('Xóa danh mục?')) return;
    try { await api.delete(`/categories/${id}`); setMessage('Đã xóa danh mục.'); reload(); }
    catch (err) { setError(getErrorMessage(err)); }
  }
  return <div className="grid items-start gap-6 lg:grid-cols-[340px_1fr]">
    <form className="card space-y-4 p-5" onSubmit={submit}><h2 className="font-extrabold">Thêm danh mục</h2>{formError && <p className="notice-error">{formError}</p>}
      <label className="block"><span className="label">Tên</span><input className="field" name="name" required /></label>
      <label className="block"><span className="label">Nhóm danh mục</span><select className="field" name="type"><option value="faculty">Khoa</option><option value="major">Ngành học</option><option value="subject">Môn học</option><option value="documentType">Loại tài liệu</option></select></label>
      <label className="block"><span className="label">Mô tả</span><input className="field" name="description" /></label><button className="button-primary">Thêm danh mục</button>
    </form>
    <div className="card divide-y divide-slate-100 p-5">{categories.map((category) => <div key={category._id} className="flex items-center justify-between gap-3 py-3 first:pt-0"><div><strong className="text-sm">{category.name}</strong><p className="mt-1 text-xs text-muted">{category.type}</p></div><button onClick={() => remove(category._id)} className="text-sm font-bold text-rose-600">Xóa</button></div>)}{!categories.length && <Empty text="Chưa có danh mục." />}</div>
  </div>;
}

function Empty({ text }) {
  return <div className="rounded-2xl border border-dashed border-blue-200 bg-white py-12 text-center text-sm text-muted">{text}</div>;
}
