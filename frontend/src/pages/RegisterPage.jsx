import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiGlobe, FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import GlassCard from '../components/GlassCard'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/Toast'
import { useTranslation } from 'react-i18next'

export default function RegisterPage() {
  const { t } = useTranslation()
  const { user, register, loading } = useAuth()
  const { addToast } = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !email || !password) { setError(t('auth.fillAllFields')); return }
    if (password.length < 6) { setError(t('auth.passwordTooShort')); return }
    if (password !== confirmPassword) { setError(t('auth.passwordsDoNotMatch')); return }
    setSubmitting(true)
    setError('')
    try {
      await register(name, email, password)
      addToast(t('auth.accountCreated'), 'success')
    } catch (err) {
      setError(err.response?.data?.error || t('auth.registrationFailed'))
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
            <h1 className="title" style={{ marginTop: 12 }}>{t('auth.createAccount')}</h1>
            <p className="subtitle">{t('auth.registerSubtitle')}</p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label><FiUser size={14} /> {t('auth.name')}</label>
            <input type="text" className="glass-input" placeholder={t('auth.namePlaceholder')} value={name} onChange={e => setName(e.target.value)} />
          </div>

          <div className="form-group">
            <label><FiMail size={14} /> {t('auth.email')}</label>
            <input type="email" className="glass-input" placeholder={t('auth.emailPlaceholder')} value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div className="form-group">
            <label><FiLock size={14} /> {t('auth.password')}</label>
            <div className="input-wrapper">
              <input type={showPassword ? 'text' : 'password'} className="glass-input" placeholder={t('auth.createPasswordPlaceholder')} value={password} onChange={e => setPassword(e.target.value)} />
              <button type="button" className="input-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label><FiLock size={14} /> {t('auth.confirmPassword')}</label>
            <input type="password" className="glass-input" placeholder={t('auth.confirmPasswordPlaceholder')} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          </div>

          {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="form-error">{error}</motion.p>}

          <button className="glass-button" disabled={submitting} style={{ marginTop: 20, width: '100%' }}>
            {submitting ? t('auth.creatingAccount') : t('auth.createAccount')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, opacity: 0.7 }}>
          {t('auth.alreadyHaveAccount')} <Link to="/login" style={{ color: '#A78BFA' }}>{t('auth.signIn')}</Link>
        </p>

        <p style={{ textAlign: 'center', marginTop: 8, opacity: 0.5, fontSize: '0.85rem' }}>
          <Link to="/" style={{ color: '#A78BFA' }}>{t('auth.backToTranslator')}</Link>
        </p>
      </GlassCard>
    </div>
  )
}
