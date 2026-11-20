import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getErrorMessage } from '../services/api.js';

export default function Collections() {
  const [collections, setCollections] = useState([]);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => {
    Promise.all([api.get('/features/collections'), api.get('/features/history/downloads')])
      .then(([collectionsResult, historyResult]) => {
        setCollections(collectionsResult.data.collections);
        setHistory(historyResult.data.documents);
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, []);
  async function createCollection(event) {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      const { data } = await api.post('/features/collections', Object.fromEntries(new FormData(form)));
      setCollections((items) => [data.collection, ...items]);
      setMessage('Đã tạo bộ sưu tập.');
      form.reset();
    } catch (err) { setError(getErrorMessage(err)); }
  }
  async function removeCollection(id) {
    if (!window.confirm('Xóa bộ sưu tập này?')) return;
    await api.delete(`/features/collections/${id}`);
    setCollections((items) => items.filter((item) => item._id !== id));
  }
  return <div className="page-wrap py-12">
    <div className="mb-8"><p className="mb-2 text-xs font-bold uppercase tracking-[.15em] text-brand-600">Không gian học tập</p><h1 className="section-title">Bộ sưu tập & lịch sử</h1></div>
    {error && <p className="notice-error mb-4">{error}</p>}
    {message && <p className="notice-success mb-4">{message}</p>}
    <div className="grid items-start gap-6 lg:grid-cols-[360px_1fr]">
      <div className="space-y-6">
        <form onSubmit={createCollection} className="card space-y-4 p-5">
          <h2 className="font-extrabold">Tạo bộ sưu tập mới</h2>
          <input className="field" name="name" required maxLength="100" placeholder="Tên bộ sưu tập" />
          <textarea className="field min-h-20" name="description" maxLength="500" placeholder="Mô tả ngắn" />
          <button className="button-primary w-full">Tạo bộ sưu tập</button>
        </form>
        <div className="card p-5">
          <h2 className="mb-3 font-extrabold">Danh sách bộ sưu tập</h2>
          <div className="space-y-2">{collections.map((item) => <article key={item._id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
            <div><strong className="block text-sm">{item.name}</strong><span className="text-xs text-muted">{item.documents?.length || 0} tài liệu</span></div>
            <button onClick={() => removeCollection(item._id)} className="text-xs font-bold text-rose-600">Xóa</button>
          </article>)}{!collections.length && <p className="py-6 text-center text-sm text-muted">Chưa có bộ sưu tập.</p>}</div>
        </div>
      </div>
      <section className="card p-6">
        <h2 className="mb-5 text-lg font-extrabold">Lịch sử tải gần đây</h2>
        <div className="divide-y divide-slate-100">{history.map((document) => <Link key={document._id} to={`/documents/${document._id}`} className="flex items-center justify-between gap-3 py-4 first:pt-0">
          <div><strong className="text-ink">{document.title}</strong><p className="mt-1 text-xs text-muted">{document.subject || document.documentType || 'Tài liệu'}</p></div>
          <span className="text-sm font-bold text-brand-600">Xem →</span>
        </Link>)}
        {!history.length && <p className="py-12 text-center text-sm text-muted">Bạn chưa tải tài liệu nào.</p>}</div>
      </section>
    </div>
  </div>;
}
