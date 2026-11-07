import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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
