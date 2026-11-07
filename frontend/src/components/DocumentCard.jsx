import { Link } from 'react-router-dom';

const typeIcon = (type = '') => type.toLowerCase().includes('đề') ? '▤' : type.toLowerCase().includes('bài') ? '▧' : '▱';

export default function DocumentCard({ document }) {
  return (
    <article className="card group flex h-full flex-col p-5 transition duration-200 hover:-translate-y-1 hover:shadow-card">
      <div className="flex items-start justify-between">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-2xl text-brand-600">{typeIcon(document.documentType)}</span>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700">{document.documentType || 'Tài liệu'}</span>
      </div>
      <Link to={`/documents/${document._id}`} className="mt-5 line-clamp-2 text-lg font-bold leading-snug text-ink group-hover:text-brand-600">{document.title}</Link>
      <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-6 text-muted">{document.description || 'Tài liệu học tập được chia sẻ bởi cộng đồng.'}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {[document.subject, document.major].filter(Boolean).slice(0, 2).map((tag) => <span key={tag} className="rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-600">{tag}</span>)}
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 mt-5 text-xs text-muted">
        <span>{document.owner?.name || 'Thành viên'} · {new Date(document.createdAt).toLocaleDateString('vi-VN')}</span>
        <span className="font-semibold text-amber-500">★ {Number(document.averageRating || 0).toFixed(1)} <span className="font-normal text-muted">({document.ratingCount || 0})</span></span>
      </div>
    </article>
  );
}
