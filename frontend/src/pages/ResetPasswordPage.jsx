import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiGlobe, FiLock, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi'
import GlassCard from '../components/GlassCard'
import { client } from '../api'
import { useToast } from '../components/Toast'
import { useTranslation } from 'react-i18next'

export default function ResetPasswordPage() {
  const { t } = useTranslation()
  const { token } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password || !confirm) { setError(t('auth.fillAllFields')); return }
    if (password.length < 6) { setError(t('auth.passwordTooShort')); return }
    if (password !== confirm) { setError(t('auth.passwordsDoNotMatch')); return }
    setSubmitting(true)
    setError('')
    try {
      await client.post('/auth/reset-password', { token, password })
      setDone(true)
      addToast(t('auth.passwordResetToast'), 'success')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.error || t('auth.failedResetPassword'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-container">
      <GlassCard>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <FiGlobe size={48} color="#A78BFA" />
            {done ? (
              <><FiCheckCircle size={48} color="#4ADE80" style={{ marginTop: 16 }} /><h1 className="title" style={{ marginTop: 12 }}>{t('auth.passwordResetSuccess')}</h1><p className="subtitle">{t('auth.redirectingToLogin')}</p></>
            ) : (
              <><h1 className="title" style={{ marginTop: 12 }}>{t('auth.resetPassword')}</h1><p className="subtitle">{t('auth.resetPasswordSubtitle')}</p></>
            )}
          </div>
        </motion.div>

        {!done && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label><FiLock size={14} /> {t('auth.newPassword')}</label>
              <div className="input-wrapper">
                <input type={showPassword ? 'text' : 'password'} className="glass-input" placeholder={t('auth.newPasswordPlaceholder')} value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" className="input-toggle" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}</button>
              </div>
            </div>
            <div className="form-group">
              <label><FiLock size={14} /> {t('auth.confirmPassword')}</label>
              <input type="password" className="glass-input" placeholder={t('auth.confirmNewPasswordPlaceholder')} value={confirm} onChange={e => setConfirm(e.target.value)} />
            </div>
            {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="form-error">{error}</motion.p>}
            <button className="glass-button" disabled={submitting} style={{ marginTop: 20, width: '100%' }}>
              {submitting ? t('auth.resetting') : t('auth.resetPassword')}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: 20, opacity: 0.7 }}>
          <Link to="/login" style={{ color: '#A78BFA' }}>{t('auth.backToSignIn')}</Link>
        </p>
      </GlassCard>
    </div>
  )
}
