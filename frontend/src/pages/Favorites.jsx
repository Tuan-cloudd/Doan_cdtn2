import { useEffect, useState } from 'react';
import DocumentGrid from '../components/DocumentGrid.jsx';
import { api, getErrorMessage } from '../services/api.js';

export default function Favorites() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    api.get('/users/favorites').then(({ data }) => setDocuments(data.documents))
      .catch((err) => setError(getErrorMessage(err))).finally(() => setLoading(false));
  }, []);
  return <div className="page-wrap py-12"><div className="mb-8"><p className="mb-2 text-xs font-bold uppercase tracking-[.15em] text-brand-600">Thư viện cá nhân</p><h1 className="section-title">Tài liệu yêu thích</h1></div>{error && <p className="notice-error mb-5">{error}</p>}<DocumentGrid documents={documents} loading={loading} empty="Bạn chưa lưu tài liệu yêu thích nào." /></div>;
}
