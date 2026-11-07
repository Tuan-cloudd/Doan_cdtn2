import DocumentCard from './DocumentCard.jsx';

export default function DocumentGrid({ documents, loading, empty = 'Chưa có tài liệu phù hợp.' }) {
  if (loading) return <div className="py-16 text-center text-muted">Đang tải tài liệu…</div>;
  if (!documents.length) return <div className="rounded-2xl border border-dashed border-blue-200 bg-white py-14 text-center text-muted">{empty}</div>;
  return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{documents.map((document) => <DocumentCard key={document._id} document={document} />)}</div>;
}
