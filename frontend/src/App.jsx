import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout, ProtectedRoute } from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Search from './pages/Search.jsx';
import DocumentDetail from './pages/DocumentDetail.jsx';
import Upload from './pages/Upload.jsx';
import Profile from './pages/Profile.jsx';
import Favorites from './pages/Favorites.jsx';
import Admin from './pages/Admin.jsx';
import { Login, Register } from './pages/Auth.jsx';

export default function App() {
  return <Routes><Route element={<Layout />}>
    <Route index element={<Home />} />
    <Route path="search" element={<Search />} />
    <Route path="documents/:id" element={<DocumentDetail />} />
    <Route path="login" element={<Login />} />
    <Route path="register" element={<Register />} />
    <Route path="upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
    <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    <Route path="favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
    <Route path="admin" element={<ProtectedRoute admin><Admin /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Route></Routes>;
}
