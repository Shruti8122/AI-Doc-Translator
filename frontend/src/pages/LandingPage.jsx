import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiGlobe, FiCpu, FiFileText, FiCheckCircle, FiArrowRight, FiShield, FiCloud, FiDownload } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { useTranslation, Trans } from 'react-i18next'

export default function LandingPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const features = [
    { icon: <FiCpu size={28} />, title: t('landing.features.ocr'), desc: t('landing.features.ocr.desc') },
    { icon: <FiGlobe size={28} />, title: t('landing.features.languages'), desc: t('landing.features.languages.desc') },
    { icon: <FiFileText size={28} />, title: t('landing.features.format'), desc: t('landing.features.format.desc') },
    { icon: <FiCloud size={28} />, title: t('landing.features.cloud'), desc: t('landing.features.cloud.desc') },
    { icon: <FiDownload size={28} />, title: t('landing.features.download'), desc: t('landing.features.download.desc') },
    { icon: <FiShield size={28} />, title: t('landing.features.privacy'), desc: t('landing.features.privacy.desc') },
  ]

  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-nav-brand">
          <FiGlobe size={28} color="#A78BFA" />
          <span>{t('app.name')}</span>
        </div>
        <div className="landing-nav-links">
          {user ? (
            <Link to="/dashboard" className="landing-btn primary">{t('nav.dashboard')}</Link>
          ) : (
            <>
              <Link to="/login" className="landing-btn ghost">{t('nav.signIn')}</Link>
              <Link to="/register" className="landing-btn primary">{t('nav.getStarted')}</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <motion.div className="landing-hero-content" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="landing-badge">{t('landing.badge')}</div>
          <h1 className="landing-hero-title">
            <Trans i18nKey="landing.hero.title" />
          </h1>
          <p className="landing-hero-desc">
            {t('app.description')}
          </p>
          <div className="landing-hero-actions">
            {user ? (
              <Link to="/dashboard" className="landing-btn primary large">
                {t('landing.hero.dashboard')} <FiArrowRight size={20} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="landing-btn primary large">
                  {t('landing.hero.start')} <FiArrowRight size={20} />
                </Link>
                <Link to="/login" className="landing-btn secondary large">
                  {t('landing.hero.signIn')}
                </Link>
              </>
            )}
          </div>
        </motion.div>

        <motion.div className="landing-hero-visual" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <div className="hero-card">
            <div className="hero-card-header">
              <FiFileText size={20} color="#A78BFA" />
              <span>{t('landing.hero.documentPdf')}</span>
              <FiCheckCircle size={18} color="#4ADE80" style={{ marginLeft: 'auto' }} />
            </div>
            <div className="hero-card-body">
              <div className="hero-lang-row">
                <span>{t('landing.hero.english')}</span>
                <FiArrowRight size={14} />
                <span>{t('landing.hero.japanese')}</span>
              </div>
              <div className="hero-progress">
                <div className="hero-progress-bar" />
              </div>
              <div className="hero-status">{t('landing.hero.complete')}</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="landing-features">
        <motion.div className="landing-section-header" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2>{t('landing.features.title')}</h2>
          <p>{t('landing.features.subtitle')}</p>
        </motion.div>
        <div className="landing-features-grid">
          {features.map((f, i) => (
            <motion.div key={i} className="landing-feature-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <div className="landing-feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="landing-steps">
        <motion.div className="landing-section-header" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2>{t('landing.steps.title')}</h2>
          <p>{t('landing.steps.subtitle')}</p>
        </motion.div>
        <div className="landing-steps-grid">
          {[
            { step: '1', title: t('landing.steps.upload'), desc: t('landing.steps.upload.desc') },
            { step: '2', title: t('landing.steps.languages'), desc: t('landing.steps.languages.desc') },
            { step: '3', title: t('landing.steps.download'), desc: t('landing.steps.download.desc') },
          ].map((s, i) => (
            <motion.div key={i} className="landing-step-card" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
              <div className="landing-step-number">{s.step}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2>{t('landing.cta.title')}</h2>
          <p>{t('landing.cta.subtitle')}</p>
          {user ? (
            <Link to="/dashboard" className="landing-btn primary large">{t('landing.cta.dashboard')} <FiArrowRight size={20} /></Link>
          ) : (
            <Link to="/register" className="landing-btn primary large">{t('landing.cta.start')} <FiArrowRight size={20} /></Link>
          )}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-content">
          <div className="landing-footer-brand">
            <FiGlobe size={20} color="#A78BFA" />
            <span>{t('app.name')}</span>
          </div>
          <p>{t('landing.footer.copyright', { year: new Date().getFullYear() })}</p>
        </div>
      </footer>
    </div>
  )
}
