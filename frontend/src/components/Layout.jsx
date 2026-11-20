import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  useEffect(() => {
    if (!user) return;
    api.get('/features/notifications').then(({ data }) => {
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    }).catch(() => {});
  }, [user]);
  async function readAll() {
    await api.patch('/features/notifications/read-all');
    setNotifications((items) => items.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
  }
  const navClass = ({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`;
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-blue-100/70 bg-white/90 backdrop-blur-xl">
        <div className="page-wrap flex h-[76px] items-center justify-between gap-5">
          <Link to="/" className="flex shrink-0 items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-lg font-black text-white shadow-lg shadow-blue-200">S</span>
            <span className="text-[19px] font-extrabold tracking-tight text-ink">Study<span className="text-brand-600">Share</span></span>
          </Link>
          <nav className="hidden items-center gap-7 md:flex">
            <NavLink to="/" className={navClass} end>Tổng quan</NavLink>
            <NavLink to="/search" className={navClass}>Khám phá</NavLink>
            <NavLink to="/upload" className={navClass}>Chia sẻ tài liệu</NavLink>
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="relative">
                  <button aria-label="Thông báo" onClick={() => setShowNotifications((current) => !current)} className="relative grid h-10 w-10 place-items-center rounded-full bg-slate-50 text-lg text-ink">
                    🔔
                    {unreadCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{unreadCount}</span>}
                  </button>
                  {showNotifications && <div className="absolute right-0 mt-2 w-[320px] max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-100 bg-white p-3 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-100 px-2 pb-3"><strong>Thông báo</strong><button onClick={readAll} className="text-xs font-bold text-brand-600">Đánh dấu đã đọc</button></div>
                    <div className="max-h-80 overflow-y-auto">{notifications.length ? notifications.map((item) => <Link key={item._id} to={item.link || '/profile'} onClick={() => setShowNotifications(false)} className={`block rounded-xl px-3 py-3 text-sm ${item.isRead ? 'text-muted' : 'bg-brand-50 text-ink'}`}>
                      <strong className="block">{item.title}</strong><span className="mt-1 block text-xs">{item.message}</span>
                    </Link>) : <p className="py-8 text-center text-sm text-muted">Chưa có thông báo.</p>}</div>
                  </div>}
                </div>
                <Link to="/profile" className="hidden items-center gap-2 rounded-full bg-slate-50 py-1.5 pl-1.5 pr-3 text-sm font-semibold text-ink sm:flex">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-brand-700">{user.name?.[0]?.toUpperCase()}</span>
                  {user.name}
                </Link>
                {user.role === 'admin' && <Link className="button-secondary hidden sm:inline-flex" to="/admin">Quản trị</Link>}
                <button className="text-sm font-semibold text-muted hover:text-ink" onClick={() => { logout(); navigate('/'); }}>Thoát</button>
              </>
            ) : (
              <>
                <Link to="/login" className="hidden text-sm font-semibold text-ink hover:text-brand-600 sm:block">Đăng nhập</Link>
                <Link to="/register" className="button-primary !px-4 !py-2.5">Tạo tài khoản</Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main><Outlet /></main>
      <footer className="mt-24 border-t border-blue-100 bg-white">
        <div className="page-wrap flex flex-col justify-between gap-3 py-8 text-sm text-muted sm:flex-row">
          <span>© {new Date().getFullYear()} StudyShare · Cùng học tốt hơn.</span>
          <span>Chia sẻ tri thức, lan tỏa cơ hội.</span>
        </div>
      </footer>
    </div>
  );
}

export function ProtectedRoute({ children, admin = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-wrap py-24 text-center text-muted">Đang kiểm tra phiên đăng nhập…</div>;
  if (!user) return <div className="page-wrap py-24 text-center"><h2 className="section-title">Bạn cần đăng nhập</h2><Link to="/login" className="button-primary mt-5">Đăng nhập</Link></div>;
  if (admin && user.role !== 'admin') return <div className="page-wrap py-24 text-center"><h2 className="section-title">Bạn không có quyền truy cập</h2><Link to="/" className="button-primary mt-5">Về trang chủ</Link></div>;
  return children;
}
