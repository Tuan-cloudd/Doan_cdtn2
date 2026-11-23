
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DocumentGrid from '../components/DocumentGrid.jsx';
import { api, getErrorMessage } from '../services/api.js';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Các bộ lọc tìm kiếm
  const filters = {
    q: searchParams.get('q') || '',
    faculty: searchParams.get('faculty') || '',
    major: searchParams.get('major') || '',
    subject: searchParams.get('subject') || '',
    type: searchParams.get('type') || '',
    fileFormat: searchParams.get('fileFormat') || '',
    sort: searchParams.get('sort') || 'newest',
    page: searchParams.get('page') || '1'
  };

  // Lấy danh sách danh mục
  useEffect(() => {
    api.get('/categories')
      .then(({ data }) => {
        setCategories(data.categories || []);
      })
      .catch(() => {
        setCategories([]);
      });
  }, []);

  // Tìm kiếm tài liệu khi bộ lọc thay đổi
  useEffect(() => {
    let active = true;

    setLoading(true);
    setError('');

    const params = Object.fromEntries(
      [...searchParams.entries()].filter(([, value]) => value)
    );

    api.get('/documents', { params })
      .then(({ data }) => {
        if (!active) return;

        setDocuments(data.documents || []);
        setPagination(data.pagination || {
          page: 1,
          pages: 1,
          total: 0
        });
      })
      .catch((err) => {
        if (!active) return;

        setError(getErrorMessage(err));
        setDocuments([]);
        setPagination({ page: 1, pages: 1, total: 0 });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [searchParams]);

  // Cập nhật bộ lọc trên URL
  const update = (key, value) => {
    const next = new URLSearchParams(searchParams);

    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }

    // Giữ nguyên trang khi chuyển trang
    if (key !== 'page') {
      next.delete('page');
    }

    setSearchParams(next);
  };

  const types = (type) =>
    categories.filter((category) => category.type === type);

  return (
    <div className="page-wrap py-12">

      {/* Tiêu đề trang */}
      <div className="mb-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-[.15em] text-brand-600">
          Tìm trong thư viện
        </p>

        <h1 className="section-title">
          Khám phá tài liệu
        </h1>

        <p className="mt-2 text-sm text-muted">
          Tìm kiếm tài liệu theo tên, từ khóa, môn học,
          chuyên ngành và định dạng file.
        </p>
      </div>

      {/* Khu vực bộ lọc */}
      <div className="mb-7 grid gap-3 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm md:grid-cols-3 lg:grid-cols-6">

        {/* Tìm kiếm từ khóa */}
        <input
          aria-label="Từ khóa"
          className="field"
          placeholder="Tên tài liệu hoặc từ khóa..."
          value={filters.q}
          onChange={(event) =>
            update('q', event.target.value)
          }
        />

        {/* Các bộ lọc có sẵn */}
        {[
          ['faculty', 'Tất cả khoa', 'faculty'],
          ['major', 'Tất cả ngành', 'major'],
          ['subject', 'Tất cả môn học', 'subject'],
          ['type', 'Tất cả loại', 'documentType']
        ].map(([key, label, type]) => (
          <select
            key={key}
            className="field text-sm"
            aria-label={label}
            value={filters[key]}
            onChange={(event) =>
              update(key, event.target.value)
            }
          >
            <option value="">{label}</option>

            {types(type).map((category) => (
              <option
                value={category.name}
                key={category._id}
              >
                {category.name}
              </option>
            ))}
          </select>
        ))}

        {/* Chức năng mới: Lọc định dạng file */}
        <select
          className="field text-sm"
          aria-label="Định dạng file"
          value={filters.fileFormat}
          onChange={(event) =>
            update('fileFormat', event.target.value)
          }
        >
          <option value="">Tất cả định dạng</option>
          <option value="pdf">PDF (.pdf)</option>
          <option value="word">Word (.doc, .docx)</option>
          <option value="powerpoint">
            PowerPoint (.ppt, .pptx)
          </option>
        </select>
      </div>

      {/* Kết quả tìm kiếm và sắp xếp */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

        <p className="text-sm text-muted">
          {pagination.total} tài liệu được tìm thấy
        </p>

        <select
          className="field !w-auto !py-2 text-sm"
          aria-label="Sắp xếp"
          value={filters.sort}
          onChange={(event) =>
            update('sort', event.target.value)
          }
        >
          <option value="newest">Mới nhất</option>
          <option value="popular">Tải nhiều</option>
          <option value="rated">Đánh giá cao</option>
        </select>
      </div>

      {/* Thông báo lỗi */}
      {error && (
        <div className="notice-error mb-4">
          {error}
        </div>
      )}

      {/* Danh sách tài liệu */}
      <DocumentGrid
        documents={documents}
        loading={loading}
      />

      {/* Phân trang */}
      {pagination.pages > 1 && (
        <div className="mt-8 flex justify-center gap-3">

          <button
            className="button-secondary"
            disabled={pagination.page <= 1}
            onClick={() =>
              update('page', String(pagination.page - 1))
            }
          >
            ← Trước
          </button>

          <span className="self-center text-sm text-muted">
            Trang {pagination.page} / {pagination.pages}
          </span>

          <button
            className="button-secondary"
            disabled={pagination.page >= pagination.pages}
            onClick={() =>
              update('page', String(pagination.page + 1))
            }
          >
            Tiếp →
          </button>

        </div>
      )}

    </div>
  );
}
