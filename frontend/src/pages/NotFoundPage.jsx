import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiHome } from 'react-icons/fi'
import GlassCard from '../components/GlassCard'

export default function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <div className="page-container">
      <GlassCard>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <h1 style={{ fontSize: '6rem', color: '#A78BFA', margin: 0 }}>{t('notFound.code')}</h1>
          <h2 className="title" style={{ marginTop: 10 }}>{t('notFound.heading')}</h2>
          <p className="subtitle">{t('notFound.message')}</p>
          <Link to="/" className="glass-button" style={{ display: 'inline-flex', textDecoration: 'none', marginTop: 20 }}>
            <FiHome style={{ marginRight: 8 }} /> {t('notFound.goHome')}
          </Link>
        </div>
      </GlassCard>
    </div>
  )
}
