import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { FiClock, FiSearch, FiDownload, FiTrash2, FiFileText, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import GlassCard from '../components/GlassCard'
import { useToast } from '../components/Toast'
import { getHistory, deleteHistory, getDownloadUrl } from '../api'

export default function HistoryPage() {
  const { t } = useTranslation()
  const { addToast } = useToast()
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const limit = 20

  const fetchData = async (p = page, s = search) => {
    setLoading(true)
    try {
      const data = await getHistory({ page: p, limit, search: s, sort: '-createdAt' })
      setItems(data.items)
      setTotal(data.total)
      setPages(data.pages)
    } catch {
      addToast(t('history.loadFailed'), 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData(page, search) }, [page])

  const handleSearch = () => { setPage(1); fetchData(1, search) }

  const handleDelete = async (id) => {
    if (!confirm(t('history.deleteConfirm'))) return
    try {
      await deleteHistory(id)
      addToast(t('history.entryDeleted'), 'success')
      fetchData(page, search)
    } catch {
      addToast(t('history.deleteFailed'), 'error')
    }
  }

  return (
    <div className="dashboard-page">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FiClock /> {t('history.title')}
        </h1>
        <p className="dashboard-subtitle">{t('history.subtitle')}</p>
      </motion.div>

      <div className="search-bar" style={{ marginTop: 20 }}>
        <FiSearch size={18} />
        <input
          placeholder={t('history.searchPlaceholder')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button className="glass-button" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={handleSearch}>{t('history.search')}</button>
      </div>

      <GlassCard style={{ marginTop: 20 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" /></div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, opacity: 0.6 }}>
            <FiFileText size={40} style={{ marginBottom: 12 }} />
            <p>{t('history.noResults')}</p>
          </div>
        ) : (
          <>
            <div className="history-table">
              <div className="history-header">
                <span>{t('history.filename')}</span>
                <span>{t('history.source')}</span>
                <span>{t('history.target')}</span>
                <span>{t('history.date')}</span>
                <span>{t('history.actions')}</span>
              </div>
              {items.map(item => (
                <div key={item._id} className="history-row">
                  <span className="history-filename"><FiFileText size={14} /> {item.originalFilename || t('history.documentFallback')}</span>
                  <span>{item.sourceLangName || item.sourceLang}</span>
                  <span>{item.targetLangName || item.targetLang}</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  <span className="history-actions">
                    <a href={getDownloadUrl(item.taskId)} download className="history-btn" title="Download"><FiDownload size={16} /></a>
                    <button className="history-btn danger" onClick={() => handleDelete(item._id)} title="Delete"><FiTrash2 size={16} /></button>
                  </span>
                </div>
              ))}
            </div>

            {pages > 1 && (
              <div className="pagination">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}><FiChevronLeft /></button>
                <span>{page} / {pages}</span>
                <button disabled={page >= pages} onClick={() => setPage(p => p + 1)}><FiChevronRight /></button>
              </div>
            )}
          </>
        )}
      </GlassCard>
    </div>
  )
}
