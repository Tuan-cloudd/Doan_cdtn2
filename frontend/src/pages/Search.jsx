import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DocumentGrid from '../components/DocumentGrid.jsx';
import { api, getErrorMessage } from '../services/api.js';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const filters = {
    q: searchParams.get('q') || '',
    faculty: searchParams.get('faculty') || '',
    major: searchParams.get('major') || '',
    subject: searchParams.get('subject') || '',
    type: searchParams.get('type') || '',
    sort: searchParams.get('sort') || 'newest',
    page: searchParams.get('page') || '1'
  };
  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.categories)).catch(() => {});
  }, []);
  useEffect(() => {
    setLoading(true);
    api.get('/documents', { params: Object.fromEntries(Object.entries(filters).filter(([, value]) => value)) })
      .then(({ data }) => { setDocuments(data.documents); setPagination(data.pagination); setError(''); })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [searchParams.toString()]);
  const update = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };
  const types = (type) => categories.filter((category) => category.type === type);
  return (
    <div className="page-wrap py-12">
      <div className="mb-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-[.15em] text-brand-600">Tìm trong thư viện</p>
        <h1 className="section-title">Khám phá tài liệu</h1>
        <p className="mt-2 text-sm text-muted">Tìm kiếm theo tên, từ khóa, môn học hoặc chuyên ngành.</p>
      </div>
      <div className="mb-7 grid gap-3 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm md:grid-cols-[1.6fr_repeat(4,1fr)]">
        <input aria-label="Từ khóa" className="field" placeholder="Tên tài liệu hoặc từ khóa…" value={filters.q} onChange={(event) => update('q', event.target.value)} />
        {[
          ['faculty', 'Tất cả khoa', 'faculty'],
          ['major', 'Tất cả ngành', 'major'],
          ['subject', 'Tất cả môn học', 'subject'],
          ['type', 'Tất cả loại', 'documentType']
        ].map(([key, label, type]) => <select key={key} className="field text-sm" aria-label={label} value={filters[key]} onChange={(event) => update(key, event.target.value)}><option value="">{label}</option>{types(type).map((category) => <option value={category.name} key={category._id}>{category.name}</option>)}</select>)}
      </div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">{pagination.total} tài liệu được tìm thấy</p>
        <select className="field !w-auto !py-2 text-sm" aria-label="Sắp xếp" value={filters.sort} onChange={(event) => update('sort', event.target.value)}>
          <option value="newest">Mới nhất</option><option value="popular">Tải nhiều</option><option value="rated">Đánh giá cao</option>
        </select>
      </div>
      {error && <div className="notice-error mb-4">{error}</div>}
      <DocumentGrid documents={documents} loading={loading} />
      {pagination.pages > 1 && <div className="mt-8 flex justify-center gap-3">
        <button className="button-secondary" disabled={pagination.page <= 1} onClick={() => update('page', String(pagination.page - 1))}>← Trước</button>
        <span className="self-center text-sm text-muted">Trang {pagination.page} / {pagination.pages}</span>
        <button className="button-secondary" disabled={pagination.page >= pagination.pages} onClick={() => update('page', String(pagination.page + 1))}>Tiếp →</button>
      </div>}
    </div>
  );
}
