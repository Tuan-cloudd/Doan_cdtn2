import { useEffect, useRef, useState } from 'react';
import { api } from '../services/api.js';

export default function OfficeDocumentPreview({ documentId, format }) {
  const containerRef = useRef(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;
    let viewer = null;
    const controller = new AbortController();
    const container = containerRef.current;

    setStatus('loading');
    container?.replaceChildren();

    async function renderPreview() {
      try {
        const { data } = await api.get(`/documents/${encodeURIComponent(documentId)}/file`, {
          responseType: 'arraybuffer',
          signal: controller.signal
        });
        if (cancelled) return;

        if (format === 'docx') {
          const { renderAsync } = await import('docx-preview');
          await renderAsync(data, container, container, { renderAltChunks: false });
          restrictDocumentLinks(container);
        } else {
          const { PptxViewer, RECOMMENDED_ZIP_LIMITS } = await import('@aiden0z/pptx-renderer');
          if (cancelled) return;

          const nextViewer = await PptxViewer.open(data, container, {
            externalMedia: 'block',
            lazyMedia: true,
            lazySlides: true,
            listOptions: { windowed: true, initialSlides: 4, batchSize: 4 },
            zipLimits: RECOMMENDED_ZIP_LIMITS
          });
          if (cancelled) nextViewer.destroy();
          else viewer = nextViewer;
        }

        if (!cancelled) setStatus('ready');
      } catch (error) {
        if (cancelled || controller.signal.aborted) return;
        if (error.response?.status === 404) setStatus('missing');
        else {
          console.error('Không thể tạo bản xem trước tài liệu:', error);
          setStatus('error');
        }
      }
    }

    renderPreview();
    return () => {
      cancelled = true;
      controller.abort();
      viewer?.destroy();
      container?.replaceChildren();
    };
  }, [documentId, format]);

  return <section className="card mt-6 overflow-hidden">
    <div className="border-b border-slate-100 px-5 py-3">
      <h2 className="font-bold">Xem trước {format.toUpperCase()}</h2>
    </div>
    {status === 'loading' && <p className="px-5 py-4 text-sm text-muted" role="status">Đang tạo bản xem trước…</p>}
    {status === 'missing' && <p className="px-5 py-4 text-sm text-rose-600" role="alert">Không tìm thấy tệp gốc trên máy chủ. Hãy tải tài liệu lên lại hoặc liên hệ quản trị viên.</p>}
    {status === 'error' && <p className="px-5 py-4 text-sm text-rose-600" role="alert">Không thể xem trước tệp này. Bạn vẫn có thể tải xuống bằng nút bên cạnh.</p>}
    <div
      ref={containerRef}
      className="max-h-[720px] min-h-[320px] overflow-auto bg-slate-100 p-3 sm:p-6"
      aria-busy={status === 'loading'}
    />
  </section>;
}

function restrictDocumentLinks(container) {
  for (const link of container.querySelectorAll('a[href]')) {
    let protocol;
    try {
      protocol = new URL(link.href, window.location.href).protocol;
    } catch {
      link.removeAttribute('href');
      continue;
    }

    if (!['http:', 'https:', 'mailto:'].includes(protocol)) {
      link.removeAttribute('href');
    } else {
      link.rel = 'noopener noreferrer';
    }
  }
}
