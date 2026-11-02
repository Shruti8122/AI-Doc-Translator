import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiGlobe, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import GlassCard from '../components/GlassCard'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/Toast'
import { useTranslation } from 'react-i18next'

export default function LoginPage() {
  const { t } = useTranslation()
  const { user, login, loading } = useAuth()
  const { addToast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) { setError(t('auth.fillAllFields')); return }
    setSubmitting(true)
    setError('')
    try {
      await login(email, password)
      addToast(t('auth.welcomeBackToast'), 'success')
    } catch (err) {
      setError(err.response?.data?.error || t('auth.loginFailed'))
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
            <h1 className="title" style={{ marginTop: 12 }}>{t('auth.welcomeBack')}</h1>
            <p className="subtitle">{t('auth.signInSubtitle')}</p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label><FiMail size={14} /> {t('auth.email')}</label>
            <input type="email" className="glass-input" placeholder={t('auth.emailPlaceholder')} value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div className="form-group">
            <label><FiLock size={14} /> {t('auth.password')}</label>
            <div className="input-wrapper">
              <input type={showPassword ? 'text' : 'password'} className="glass-input" placeholder={t('auth.passwordPlaceholder')} value={password} onChange={e => setPassword(e.target.value)} />
              <button type="button" className="input-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginTop: -12, marginBottom: 8 }}>
            <Link to="/forgot-password" style={{ color: '#A78BFA', fontSize: '0.85rem' }}>{t('auth.forgotPassword')}</Link>
          </div>

          {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="form-error">{error}</motion.p>}

          <button className="glass-button" disabled={submitting} style={{ marginTop: 10, width: '100%' }}>
            {submitting ? t('auth.signingIn') : t('auth.signIn')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, opacity: 0.7 }}>
          {t('auth.noAccount')} <Link to="/register" style={{ color: '#A78BFA' }}>{t('auth.register')}</Link>
        </p>

        <p style={{ textAlign: 'center', marginTop: 8, opacity: 0.5, fontSize: '0.85rem' }}>
          <Link to="/" style={{ color: '#A78BFA' }}>{t('auth.backToHome')}</Link>
        </p>
      </GlassCard>
    </div>
  )
}
