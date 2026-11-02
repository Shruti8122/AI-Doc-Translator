import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { FiDownload, FiFileText } from 'react-icons/fi'
import GlassCard from '../components/GlassCard'
import { getHistory, getDownloadUrl } from '../api'

export default function DownloadsPage() {
  const { t } = useTranslation()
  const [items, setItems] = useState([])

  useEffect(() => {
    getHistory({ limit: 50, sort: '-createdAt' }).then(data => {
      setItems(data.items.filter(i => i.status === 'completed'))
    }).catch(() => {})
  }, [])

  return (
    <div className="dashboard-page">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FiDownload /> {t('downloads.title')}
        </h1>
        <p className="dashboard-subtitle">{t('downloads.subtitle')}</p>
      </motion.div>

      <GlassCard style={{ marginTop: 20 }}>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, opacity: 0.6 }}>
            <FiDownload size={40} style={{ marginBottom: 12 }} />
            <p>{t('downloads.noResults')}</p>
          </div>
        ) : (
          <div className="history-table">
            <div className="history-header">
              <span>{t('downloads.filename')}</span>
              <span>{t('downloads.targetLanguage')}</span>
              <span>{t('downloads.date')}</span>
              <span>{t('downloads.download')}</span>
            </div>
            {items.map(item => (
              <div key={item._id} className="history-row">
                <span className="history-filename"><FiFileText size={14} /> {item.originalFilename || t('downloads.documentFallback')}</span>
                <span>{item.targetLangName || item.targetLang}</span>
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                <span>
                  <a href={getDownloadUrl(item.taskId)} download className="glass-button" style={{ padding: '6px 14px', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <FiDownload size={14} /> {t('downloads.download')}
                  </a>
                </span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  )
}
