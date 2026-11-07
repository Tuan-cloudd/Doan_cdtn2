import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getErrorMessage } from '../services/api.js';

export default function Upload() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  useEffect(() => { api.get('/categories').then(({ data }) => setCategories(data.categories)).catch((err) => setError(getErrorMessage(err))); }, []);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError(''); setSuccess('');
    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      const { data } = await api.post('/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess(data.message);
      form.reset();
      window.setTimeout(() => navigate('/profile'), 1400);
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setBusy(false); }
  }
  const options = (type) => categories.filter((category) => category.type === type);
  return <div className="page-wrap max-w-4xl py-12">
    <div className="mb-8"><p className="mb-2 text-xs font-bold uppercase tracking-[.15em] text-brand-600">Đóng góp cho cộng đồng</p><h1 className="section-title">Chia sẻ tài liệu</h1><p className="mt-2 text-sm text-muted">Tài liệu sẽ được quản trị viên kiểm duyệt trước khi xuất hiện công khai.</p></div>
    <form onSubmit={submit} className="card space-y-6 p-6 sm:p-8">
      {error && <p className="notice-error">{error}</p>}{success && <p className="notice-success">{success}</p>}
      <label className="block"><span className="label">Tệp tài liệu *</span><input className="field file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-bold file:text-brand-700" type="file" name="file" accept=".pdf,.docx,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation" required /><span className="mt-2 block text-xs text-muted">PDF, DOCX hoặc PPTX · tối đa 20 MB</span></label>
      <label className="block"><span className="label">Tiêu đề *</span><input className="field" name="title" required maxLength="180" placeholder="Ví dụ: Giáo trình Cơ sở dữ liệu nâng cao" /></label>
      <label className="block"><span className="label">Mô tả</span><textarea className="field min-h-28 resize-y" name="description" maxLength="3000" placeholder="Giới thiệu nội dung và đối tượng phù hợp…" /></label>
      <div className="grid gap-5 sm:grid-cols-2">
        <CategoryField name="faculty" label="Khoa" options={options('faculty')} />
        <CategoryField name="major" label="Ngành học" options={options('major')} />
        <CategoryField name="subject" label="Môn học" options={options('subject')} />
        <CategoryField name="documentType" label="Loại tài liệu" options={options('documentType')} />
      </div>
      <label className="block"><span className="label">Từ khóa</span><input className="field" name="keywords" placeholder="cơ sở dữ liệu, SQL, ôn tập (cách nhau bằng dấu phẩy)" /></label>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
        <Link to="/search" className="text-sm font-semibold text-muted hover:text-ink">Hủy</Link>
        <button className="button-primary" disabled={busy}>{busy ? 'Đang tải lên…' : 'Gửi duyệt tài liệu →'}</button>
      </div>
    </form>
  </div>;
}

function CategoryField({ name, label, options }) {
  return <label className="block"><span className="label">{label}</span>{options.length
    ? <select className="field" name={name}><option value="">Chọn {label.toLowerCase()}</option>{options.map((item) => <option key={item._id} value={item.name}>{item.name}</option>)}</select>
    : <input className="field" name={name} placeholder={label} />}</label>;
}
