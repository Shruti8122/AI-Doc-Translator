import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMenu, FiX, FiHome, FiUpload, FiClock, FiDownload, FiUser, FiSettings, FiLogOut, FiGlobe } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'

export default function DashboardLayout() {
  const { t } = useTranslation()
  const navItems = [
    { to: '/dashboard', icon: <FiHome size={20} />, label: t('sidebar.dashboard'), end: true },
    { to: '/dashboard/translate', icon: <FiUpload size={20} />, label: t('sidebar.translate'), end: false },
    { to: '/dashboard/history', icon: <FiClock size={20} />, label: t('sidebar.history'), end: false },
    { to: '/dashboard/downloads', icon: <FiDownload size={20} />, label: t('sidebar.downloads'), end: false },
    { to: '/dashboard/profile', icon: <FiUser size={20} />, label: t('sidebar.profile'), end: false },
    { to: '/dashboard/settings', icon: <FiSettings size={20} />, label: t('sidebar.settings'), end: false },
  ]
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="dashboard-layout">
      <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      <AnimatePresence>
        {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      </AnimatePresence>

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <FiGlobe size={28} color="#A78BFA" />
          <span className="sidebar-brand">{t('app.name')}</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || 'User'}</div>
              <div className="sidebar-user-email">{user?.email || ''}</div>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout}>
            <FiLogOut size={18} />
            <span>{t('sidebar.logout')}</span>
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  )
}
