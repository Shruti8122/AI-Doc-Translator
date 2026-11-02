import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { FiSettings, FiSun, FiMoon, FiGlobe, FiBell, FiBellOff } from 'react-icons/fi'
import GlassCard from '../components/GlassCard'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/Toast'
import { updateSettings } from '../api'

export default function SettingsPage() {
  const { t, i18n } = useTranslation()
  const { user, updateUser } = useAuth()
  const { addToast } = useToast()
  const [language, setLanguage] = useState(user?.settings?.language || 'en')

  useEffect(() => {
    i18n.changeLanguage(language)
  }, [language])
  const [notifications, setNotifications] = useState(user?.settings?.notifications !== false)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const settings = { language, notifications }
      const { user: updated } = await updateSettings(settings)
      updateUser(updated)
      addToast(t('settings.saved'), 'success')
    } catch (err) {
      addToast(err.response?.data?.error || t('settings.failedToSave'), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="dashboard-page">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FiSettings /> {t('settings.title')}
        </h1>
        <p className="dashboard-subtitle">{t('settings.subtitle')}</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
        <GlassCard>
          <h3 style={{ marginBottom: 20 }}>{t('settings.appearance')}</h3>

          <div className="form-group">
            <label><FiGlobe size={14} /> {t('settings.language')}</label>
            <select className="glass-select" value={language} onChange={e => setLanguage(e.target.value)}>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="fr">French</option>
              <option value="es">Spanish</option>
              <option value="de">German</option>
              <option value="ja">Japanese</option>
              <option value="ko">Korean</option>
              <option value="zh">Chinese</option>
            </select>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 style={{ marginBottom: 20 }}>{t('settings.notifications')}</h3>

          <div className="form-group">
            <label><FiBell size={14} /> {t('settings.emailNotifications')}</label>
            <div className="toggle-group">
              <button className={`toggle-btn ${notifications ? 'active' : ''}`} onClick={() => setNotifications(true)}><FiBell /> {t('settings.on')}</button>
              <button className={`toggle-btn ${!notifications ? 'active' : ''}`} onClick={() => setNotifications(false)}><FiBellOff /> {t('settings.off')}</button>
            </div>
          </div>

          <div style={{ marginTop: 30 }}>
            <h3 style={{ marginBottom: 12 }}>{t('settings.account')}</h3>
            <div className="info-row">
              <span>{t('settings.role')}</span>
              <span className="badge">{user?.role || 'user'}</span>
            </div>
            <div className="info-row">
              <span>{t('settings.memberSince')}</span>
              <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : t('settings.na')}</span>
            </div>
          </div>
        </GlassCard>
      </div>

      <button className="glass-button" onClick={handleSave} disabled={saving} style={{ marginTop: 20 }}>
        {saving ? t('settings.saving') : t('settings.save')}
      </button>
    </div>
  )
}
