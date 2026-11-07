import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api, fileUrl, getErrorMessage } from '../services/api.js';

export default function DocumentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const load = () => api.get(`/documents/${id}`).then(({ data: result }) => setData(result)).catch((err) => setError(getErrorMessage(err)));
  useEffect(() => { load(); }, [id]);
  async function submitComment(event) {
    event.preventDefault(); setBusy(true); setNotice('');
    const form = event.currentTarget;
    try {
      await api.post(`/documents/${id}/comments`, { text: new FormData(form).get('text') });
      form.reset(); setNotice('Bình luận đã được đăng.'); await load();
    } catch (err) { setNotice(getErrorMessage(err)); }
    finally { setBusy(false); }
  }
  async function rate(value) {
    try { await api.put(`/documents/${id}/rating`, { value }); setNotice('Cảm ơn bạn đã đánh giá!'); await load(); }
    catch (err) { setNotice(getErrorMessage(err)); }
  }
  async function favorite() {
    try {
      const { data: result } = await api.post(`/documents/${id}/favorite`);
      setData((current) => ({ ...current, isFavorite: result.isFavorite }));
    } catch (err) { setNotice(getErrorMessage(err)); }
  }
  if (error) return <div className="page-wrap py-20"><p className="notice-error">{error}</p><Link className="mt-4 inline-block text-brand-600" to="/search">← Quay lại tìm kiếm</Link></div>;
  if (!data) return <div className="page-wrap py-24 text-center text-muted">Đang tải tài liệu…</div>;
  const { document, comments } = data;
  const pdf = document.mimeType === 'application/pdf';
  return <div className="page-wrap py-10">
    <Link to="/search" className="mb-6 inline-block text-sm font-semibold text-muted hover:text-brand-600">← Quay lại thư viện</Link>
    <div className="grid items-start gap-7 lg:grid-cols-[1fr_340px]">
      <div>
        <div className="card p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl"><div className="mb-3 flex flex-wrap gap-2"><span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">{document.documentType || 'Tài liệu'}</span><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Đã duyệt</span></div>
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-ink">{document.title}</h1>
              <p className="mt-3 text-sm text-muted">Đăng bởi <strong className="text-ink">{document.owner?.name}</strong> · {new Date(document.createdAt).toLocaleDateString('vi-VN')}</p>
            </div>
            <button onClick={favorite} disabled={!user} title={!user ? 'Đăng nhập để lưu yêu thích' : ''} className="button-secondary !px-3 !py-2 text-lg">{data.isFavorite ? '♥' : '♡'}</button>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4 text-sm sm:grid-cols-4">
            <Meta label="Môn học" value={document.subject || '—'} /><Meta label="Ngành" value={document.major || '—'} /><Meta label="Lượt tải" value={document.downloads} /><Meta label="Đánh giá" value={`${Number(document.averageRating || 0).toFixed(1)} / 5`} />
          </div>
          <h2 className="mt-7 font-bold text-ink">Mô tả tài liệu</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-muted">{document.description || 'Chưa có mô tả.'}</p>
          {document.keywords?.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{document.keywords.map((keyword) => <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs text-brand-700" key={keyword}>#{keyword}</span>)}</div>}
        </div>
        {pdf ? <div className="card mt-6 overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-3"><h2 className="font-bold">Xem trước PDF</h2><a href={`${fileUrl(document._id)}#toolbar=1`} target="_blank" rel="noreferrer" className="text-sm font-bold text-brand-600">Mở toàn màn hình ↗</a></div><iframe title={`Xem trước ${document.title}`} src={`${fileUrl(document._id)}#toolbar=0`} className="h-[620px] w-full bg-slate-100" /></div> : <div className="card mt-6 flex items-center gap-4 p-5"><span className="grid h-12 w-12 place-items-center rounded-xl bg-amber-50 text-2xl">▱</span><div><h2 className="font-bold text-ink">Tệp {document.originalName}</h2><p className="mt-1 text-xs text-muted">Xem trước trực tuyến chưa hỗ trợ định dạng này.</p></div></div>}
        <section className="card mt-6 p-6">
          <div className="flex items-center justify-between"><h2 className="text-lg font-extrabold">Đánh giá & bình luận</h2><span className="text-amber-500">★ {Number(document.averageRating || 0).toFixed(1)} <span className="text-xs text-muted">({document.ratingCount})</span></span></div>
          <div className="mt-4 flex items-center gap-2"><span className="text-sm text-muted">Đánh giá tài liệu:</span>{[1, 2, 3, 4, 5].map((value) => <button key={value} aria-label={`Đánh giá ${value} sao`} disabled={!user} onClick={() => rate(value)} className="text-2xl text-amber-400 transition hover:scale-110 disabled:opacity-40">★</button>)}</div>
          {notice && <p className="mt-3 text-sm text-brand-700">{notice}</p>}
          {user ? <form onSubmit={submitComment} className="mt-5 flex flex-col gap-3 sm:flex-row"><input className="field flex-1" name="text" maxLength="2000" required placeholder="Chia sẻ nhận xét của bạn…" /><button className="button-primary" disabled={busy}>{busy ? 'Đang gửi…' : 'Gửi bình luận'}</button></form> : <p className="mt-4 text-sm text-muted"><Link to="/login" className="font-bold text-brand-600">Đăng nhập</Link> để đánh giá và bình luận.</p>}
          <div className="mt-6 divide-y divide-slate-100">{comments.map((comment) => <article key={comment._id} className="py-4 first:pt-0"><div className="flex items-center justify-between"><strong className="text-sm text-ink">{comment.user?.name || 'Thành viên'}</strong><time className="text-xs text-muted">{new Date(comment.createdAt).toLocaleDateString('vi-VN')}</time></div><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{comment.text}</p></article>)}{!comments.length && <p className="py-5 text-sm text-muted">Chưa có bình luận nào.</p>}</div>
        </section>
      </div>
      <aside className="card sticky top-24 p-5">
        <h2 className="font-extrabold text-ink">Tải tài liệu</h2>
        <p className="mt-2 break-all text-sm text-muted">{document.originalName}</p>
        <p className="mt-1 text-xs text-muted">{(document.size / (1024 * 1024)).toFixed(2)} MB · {document.downloads} lượt tải</p>
        <a href={`${api.defaults.baseURL}/documents/${document._id}/download`} className="button-primary mt-5 w-full" download={document.originalName}>↓ Tải xuống</a>
        <div className="mt-5 border-t border-slate-100 pt-4 text-xs leading-5 text-muted">Tài liệu được cộng đồng chia sẻ. Vui lòng tôn trọng bản quyền và quy định học thuật.</div>
      </aside>
    </div>
  </div>;
}

function Meta({ label, value }) {
  return <div><p className="text-[11px] uppercase tracking-wide text-muted">{label}</p><p className="mt-1 truncate font-semibold text-ink">{value}</p></div>;
}
