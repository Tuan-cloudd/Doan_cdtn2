import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../services/api.js';
import DocumentGrid from '../components/DocumentGrid.jsx';

export default function Home() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    api.get('/documents', { params: { limit: 6 } })
      .then(({ data }) => setDocuments(data.documents))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-[#eef5ff] via-[#f7faff] to-[#e9f2ff]">
        <div className="pointer-events-none absolute -right-32 -top-32 h-[430px] w-[430px] rounded-full border-[70px] border-white/40" />
        <div className="page-wrap relative grid min-h-[490px] items-center gap-8 py-16 md:grid-cols-[1.05fr_.95fr]">
          <div className="max-w-[620px]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1.5 text-xs font-bold text-brand-700">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> CỘNG ĐỒNG HỌC TẬP MỞ
            </div>
            <h1 className="text-[clamp(42px,6.6vw,68px)] font-black leading-[1.08] tracking-[-.055em] text-ink">
              Học tốt hơn<br />cùng <span className="text-brand-600">tri thức</span><br />được sẻ chia.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-muted sm:text-lg">Khám phá giáo trình, bài giảng và đề thi chất lượng do cộng đồng sinh viên đóng góp.</p>
            <form action="/search" className="mt-8 flex max-w-[570px] gap-2 rounded-2xl border border-blue-100 bg-white p-2 shadow-card" onSubmit={(event) => { event.preventDefault(); window.location.href = `/search?q=${encodeURIComponent(new FormData(event.currentTarget).get('q'))}`; }}>
              <span className="grid w-10 shrink-0 place-items-center text-xl text-brand-500">⌕</span>
              <input name="q" className="min-w-0 flex-1 outline-none placeholder:text-slate-400" placeholder="Tìm tài liệu, môn học, từ khóa…" />
              <button className="button-primary !rounded-xl !px-5">Tìm kiếm</button>
            </form>
            <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted">
              <span>Gợi ý:</span>
              {['Cơ sở dữ liệu', 'Lập trình Web', 'Đề thi'].map((term) => <Link key={term} to={`/search?q=${encodeURIComponent(term)}`} className="font-semibold text-brand-600 hover:underline">{term}</Link>)}
            </div>
          </div>
          <div className="relative hidden min-h-[350px] items-center justify-center md:flex">
            <div className="absolute h-[300px] w-[300px] rounded-full bg-blue-200/30 blur-2xl" />
            <div className="relative w-[340px] rotate-[-3deg] rounded-[30px] border border-white bg-white p-5 shadow-[0_35px_80px_rgba(47,93,160,.17)]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4"><span className="text-sm font-bold text-ink">Tài liệu nổi bật</span><span className="text-xs text-brand-600">•••</span></div>
              <div className="mt-5 space-y-3">
                {[
                  ['▱', 'Giáo trình Cơ sở dữ liệu', 'Bài giảng · 12.4 MB', 'bg-blue-100 text-blue-600'],
                  ['▤', 'Đề cương ôn tập học kỳ', 'Đề thi · 2.8 MB', 'bg-amber-100 text-amber-600'],
                  ['▧', 'Nhập môn lập trình Web', 'Tài liệu · 6.1 MB', 'bg-violet-100 text-violet-600']
                ].map(([icon, title, caption, color]) => <div key={title} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3"><span className={`grid h-11 w-11 place-items-center rounded-xl ${color} text-xl`}>{icon}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-ink">{title}</p><p className="mt-1 text-[11px] text-muted">{caption}</p></div><span className="text-amber-500">★</span></div>)}
              </div>
              <div className="mt-5 rounded-2xl bg-brand-600 p-4 text-white"><p className="text-xs text-blue-100">Cùng nhau xây dựng kho tri thức</p><p className="mt-1 font-bold">Một tài liệu hay · Ngàn cơ hội học tập</p></div>
            </div>
            <div className="absolute bottom-8 left-0 rounded-2xl border border-blue-50 bg-white px-4 py-3 shadow-card"><span className="text-lg">✦</span><span className="ml-2 text-sm font-bold">Chia sẻ dễ dàng</span></div>
          </div>
        </div>
      </section>
      <section className="page-wrap py-16">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div><p className="mb-2 text-xs font-bold uppercase tracking-[.15em] text-brand-600">Thư viện cộng đồng</p><h2 className="section-title">Tài liệu mới nhất</h2></div>
          <Link to="/search" className="text-sm font-bold text-brand-600 hover:underline">Khám phá tất cả <span aria-hidden>→</span></Link>
        </div>
        {error && <p className="notice-error mb-5">{error}</p>}
        <DocumentGrid documents={documents} loading={loading} />
      </section>
      <section className="page-wrap pb-16">
        <div className="flex flex-col items-start justify-between gap-5 rounded-3xl bg-ink px-7 py-9 text-white sm:flex-row sm:items-center sm:px-10">
          <div><p className="text-sm font-semibold text-blue-200">Bạn có tài liệu hữu ích?</p><h2 className="mt-2 text-2xl font-extrabold">Chia sẻ để cùng tiến bộ.</h2></div>
          <Link className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-ink hover:bg-blue-50" to="/upload">Đăng tải tài liệu <span aria-hidden>→</span></Link>
        </div>
      </section>
    </>
  );
}
