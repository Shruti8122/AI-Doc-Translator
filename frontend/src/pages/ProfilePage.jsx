import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { FiUser, FiMail, FiCamera, FiLock, FiSave } from 'react-icons/fi'
import GlassCard from '../components/GlassCard'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/Toast'
import { updateProfile, uploadAvatar, changePassword } from '../api'

export default function ProfilePage() {
  const { t } = useTranslation()
  const { user, updateUser } = useAuth()
  const { addToast } = useToast()
  const fileRef = useRef()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [saving, setSaving] = useState(false)
  const [cpw, setCpw] = useState({ current: '', newPwd: '', confirm: '' })
  const [changingPwd, setChangingPwd] = useState(false)

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const { user: updated } = await updateProfile(name, email)
      updateUser(updated)
      addToast(t('profile.updated'), 'success')
    } catch (err) {
      addToast(err.response?.data?.error || t('profile.updateFailed'), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const { user: updated } = await uploadAvatar(file)
      updateUser(updated)
      addToast(t('profile.avatarUpdated'), 'success')
    } catch (err) {
      addToast(err.response?.data?.error || t('profile.avatarUploadFailed'), 'error')
    }
  }

  const handleChangePassword = async () => {
    if (!cpw.current || !cpw.newPwd) { addToast(t('profile.fillAllFields'), 'error'); return }
    if (cpw.newPwd.length < 6) { addToast(t('profile.passwordMinLength'), 'error'); return }
    if (cpw.newPwd !== cpw.confirm) { addToast(t('profile.passwordsDoNotMatch'), 'error'); return }
    setChangingPwd(true)
    try {
      await changePassword(cpw.current, cpw.newPwd)
      addToast(t('profile.passwordChanged'), 'success')
      setCpw({ current: '', newPwd: '', confirm: '' })
    } catch (err) {
      addToast(err.response?.data?.error || t('profile.changePasswordFailed'), 'error')
    } finally {
      setChangingPwd(false)
    }
  }

  return (
    <div className="dashboard-page">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="dashboard-title">{t('profile.title')}</h1>
        <p className="dashboard-subtitle">{t('profile.subtitle')}</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
        <GlassCard>
          <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}><FiUser /> {t('profile.information')}</h3>

          <div className="avatar-section">
            <div className="avatar-large">
              {user?.avatar ? <img src={user.avatar} alt="avatar" /> : <span>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>}
              <button className="avatar-edit" onClick={() => fileRef.current?.click()}><FiCamera size={16} /></button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
          </div>

          <div className="form-group">
            <label><FiUser size={14} /> {t('profile.name')}</label>
            <input className="glass-input" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label><FiMail size={14} /> {t('profile.email')}</label>
            <input className="glass-input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <button className="glass-button" onClick={handleSaveProfile} disabled={saving} style={{ width: '100%', marginTop: 10 }}>
            <FiSave size={16} /> {saving ? t('profile.saving') : t('profile.saveChanges')}
          </button>
        </GlassCard>

        <GlassCard>
          <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}><FiLock /> {t('profile.changePassword')}</h3>

          <div className="form-group">
            <label>{t('profile.currentPassword')}</label>
            <input className="glass-input" type="password" placeholder={t('profile.currentPassword')} value={cpw.current} onChange={e => setCpw(p => ({ ...p, current: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>{t('profile.newPassword')}</label>
            <input className="glass-input" type="password" placeholder={t('profile.newPassword')} value={cpw.newPwd} onChange={e => setCpw(p => ({ ...p, newPwd: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>{t('profile.confirmNewPassword')}</label>
            <input className="glass-input" type="password" placeholder={t('profile.confirmNewPassword')} value={cpw.confirm} onChange={e => setCpw(p => ({ ...p, confirm: e.target.value }))} />
          </div>

          <button className="glass-button" onClick={handleChangePassword} disabled={changingPwd} style={{ width: '100%', marginTop: 10 }}>
            {changingPwd ? t('profile.changing') : t('profile.changePassword')}
          </button>
        </GlassCard>
      </div>
    </div>
  )
}
