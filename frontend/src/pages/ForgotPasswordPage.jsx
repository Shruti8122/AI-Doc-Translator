import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiGlobe, FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi'
import GlassCard from '../components/GlassCard'
import { client } from '../api'
import { useTranslation } from 'react-i18next'

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) { setError(t('auth.enterEmail')); return }
    setSubmitting(true)
    setError('')
    try {
      await client.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.error || t('auth.failedSendReset'))
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
            {sent ? (
              <>
                <FiCheckCircle size={48} color="#4ADE80" style={{ marginTop: 16 }} />
                <h1 className="title" style={{ marginTop: 12 }}>{t('auth.checkEmail')}</h1>
                <p className="subtitle">{t('auth.checkEmailSubtitle', { email })}</p>
              </>
            ) : (
              <>
                <h1 className="title" style={{ marginTop: 12 }}>{t('auth.forgotPasswordTitle')}</h1>
                <p className="subtitle">{t('auth.forgotPasswordSubtitle')}</p>
              </>
            )}
          </div>
        </motion.div>

        {!sent && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label><FiMail size={14} /> {t('auth.email')}</label>
              <input type="email" className="glass-input" placeholder={t('auth.emailPlaceholder')} value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="form-error">{error}</motion.p>}
            <button className="glass-button" disabled={submitting} style={{ marginTop: 20, width: '100%' }}>
              {submitting ? t('auth.sending') : t('auth.sendResetLink')}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: 20, opacity: 0.7 }}>
          <Link to="/login" style={{ color: '#A78BFA', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <FiArrowLeft size={14} /> {t('auth.backToSignIn')}
          </Link>
        </p>
      </GlassCard>
    </div>
  )
}
