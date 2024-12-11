import React from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, User, MessageSquare, LogOut } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import DashboardHome from '../components/dashboard/DashboardHome';
import DashboardProfile from '../components/dashboard/DashboardProfile';
import DashboardChat from '../components/dashboard/DashboardChat';

function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-700">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white">ODILA</h1>
          <p className="text-gray-400 text-sm">Admin Dashboard</p>
        </div>

        <nav className="mt-6">
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 px-6 py-3 text-sm ${
              isActive('/dashboard')
                ? 'text-white bg-cyan-600'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Home className="w-5 h-5" />
            Home
          </Link>

          <Link
            to="/dashboard/profile"
            className={`flex items-center gap-3 px-6 py-3 text-sm ${
              isActive('/dashboard/profile')
                ? 'text-white bg-cyan-600'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <User className="w-5 h-5" />
            Profile
          </Link>

          <Link
            to="/dashboard/chat"
            className={`flex items-center gap-3 px-6 py-3 text-sm ${
              isActive('/dashboard/chat')
                ? 'text-white bg-cyan-600'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            Chat Management
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-6 py-3 text-sm text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-800">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/profile" element={<DashboardProfile />} />
          <Route path="/chat" element={<DashboardChat />} />
        </Routes>
      </div>
    </div>
  );
}

export default Dashboard;