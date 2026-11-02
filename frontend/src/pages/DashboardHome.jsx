import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { FiUpload, FiClock, FiDownload, FiCheckCircle, FiArrowRight, FiFileText } from 'react-icons/fi'
import GlassCard from '../components/GlassCard'
import { useAuth } from '../contexts/AuthContext'
import { getHistory } from '../api'

export default function DashboardHome() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [stats, setStats] = useState({ total: 0, completed: 0, downloaded: 0 })
  const [recent, setRecent] = useState([])

  useEffect(() => {
    getHistory({ limit: 5, sort: '-createdAt' }).then(data => {
      setStats({ total: data.total, completed: data.items.filter(i => i.status === 'completed').length, downloaded: 0 })
      setRecent(data.items.slice(0, 5))
    }).catch(() => {})
  }, [])

  const cards = [
    { icon: <FiUpload size={28} />, label: t('dashboard.totalUploads'), value: stats.total, color: '#A78BFA' },
    { icon: <FiCheckCircle size={28} />, label: t('dashboard.completed'), value: stats.completed, color: '#4ADE80' },
    { icon: <FiDownload size={28} />, label: t('dashboard.downloads'), value: stats.downloaded, color: '#60A5FA' },
  ]

  return (
    <div className="dashboard-page">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="dashboard-title">{t('dashboard.title', { name: user?.name || t('sidebar.user') })}</h1>
        <p className="dashboard-subtitle">{t('dashboard.subtitle')}</p>
      </motion.div>

      <div className="stats-grid">
        {cards.map((card, i) => (
          <motion.div key={i} className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <div className="stat-icon" style={{ color: card.color }}>{card.icon}</div>
            <div className="stat-value">{card.value}</div>
            <div className="stat-label">{card.label}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 30 }}>
        <GlassCard>
          <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiClock /> {t('dashboard.recentActivity')}
          </h3>
          {recent.length === 0 ? (
            <p style={{ opacity: 0.6, textAlign: 'center', padding: '20px 0' }}>{t('dashboard.noTranslations')}</p>
          ) : (
            <div className="recent-list">
              {recent.map(item => (
                <div key={item._id} className="recent-item">
                  <FiFileText size={16} color="#A78BFA" />
                  <div className="recent-info">
                    <div className="recent-name">{item.originalFilename || t('dashboard.document')}</div>
                    <div className="recent-meta">{item.targetLangName || item.targetLang} • {new Date(item.createdAt).toLocaleDateString()}</div>
                  </div>
                  <FiCheckCircle size={16} color="#4ADE80" />
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard>
          <h3 style={{ marginBottom: 16 }}>{t('dashboard.quickActions')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link to="/dashboard/translate" className="quick-action">
              <FiUpload size={20} /> {t('dashboard.translateDoc')} <FiArrowRight size={16} style={{ marginLeft: 'auto' }} />
            </Link>
            <Link to="/dashboard/history" className="quick-action">
              <FiClock size={20} /> {t('dashboard.viewHistory')} <FiArrowRight size={16} style={{ marginLeft: 'auto' }} />
            </Link>
            <Link to="/dashboard/profile" className="quick-action">
              <FiCheckCircle size={20} /> {t('dashboard.updateProfile')} <FiArrowRight size={16} style={{ marginLeft: 'auto' }} />
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
