import { useState } from 'react'
import { useGameStore } from '../../store/useGameStore'

const LANGUAGES = ['EN', 'FR', 'ES', 'IT', 'NL', 'DE', 'RU']

export default function SettingsScreen() {
  const navigate = useGameStore(s => s.navigate)
  const [soundOn, setSoundOn]     = useState(true)
  const [language, setLanguage]   = useState('EN')
  const [adsToast, setAdsToast]   = useState(false)

  function handleRemoveAds() {
    setAdsToast(true)
    setTimeout(() => setAdsToast(false), 2500)
  }

  return (
    <div className="animate-enter" style={{
      display: 'flex', flexDirection: 'column',
      minHeight: '100svh', padding: '48px 24px 48px',
      maxWidth: 480, margin: '0 auto', width: '100%',
      gap: 28,
    }}>
      <button onClick={() => navigate('home')}
        className="label"
        style={{ background: 'none', border: 'none', cursor: 'pointer', alignSelf: 'flex-start', padding: '4px 0' }}>
        ← Back
      </button>

      <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--on-surface)' }}>
        Settings
      </h2>

      {/* Sound */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--on-surface)' }}>Sound</p>
            <p className="type-body-md" style={{ marginTop: 2, color: 'var(--on-surface-variant)' }}>
              {soundOn ? 'On' : 'Off'}
            </p>
          </div>
          {/* Toggle switch */}
          <button
            onClick={() => setSoundOn(s => !s)}
            style={{
              width: 52, height: 30, borderRadius: 15,
              background: soundOn ? 'var(--primary)' : 'var(--outline)',
              border: 'none', cursor: 'pointer', position: 'relative',
              transition: `background var(--dur-medium1) var(--ease-standard)`,
              flexShrink: 0,
            }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', background: '#fff',
              position: 'absolute', top: 4,
              left: soundOn ? 26 : 4,
              transition: `left var(--dur-medium1) var(--ease-standard)`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </button>
        </div>
      </div>

      {/* Language */}
      <div className="card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--on-surface)' }}>Language</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {LANGUAGES.map(lang => (
            <button key={lang} onClick={() => setLanguage(lang)}
              className="chip"
              data-active={language === lang ? 'true' : 'false'}
              style={{ padding: '8px 14px', fontSize: '0.8rem', fontWeight: 700 }}>
              {lang}
            </button>
          ))}
        </div>
        <p className="type-body-md" style={{ color: 'var(--on-surface-variant)' }}>
          Full localisation coming soon. Currently English only.
        </p>
      </div>

      {/* Remove Ads */}
      <div className="card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--on-surface)' }}>Remove Ads</p>
          <p className="type-body-md" style={{ marginTop: 2, color: 'var(--on-surface-variant)' }}>
            Enjoy an ad-free experience.
          </p>
        </div>
        <button onClick={handleRemoveAds}
          className="btn-outlined"
          style={{ width: '100%', borderRadius: 'var(--shape-sm)', height: 48 }}>
          Remove Ads — Coming Soon
        </button>
      </div>

      {/* Toast */}
      {adsToast && (
        <div className="animate-enter" style={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--surface-container-highest)',
          border: '1px solid var(--outline-variant)',
          borderRadius: 'var(--shape-md)', padding: '12px 20px',
          boxShadow: 'var(--shadow-3)', whiteSpace: 'nowrap',
          color: 'var(--on-surface)', fontWeight: 600, fontSize: '0.875rem',
        }}>
          Coming soon!
        </div>
      )}
    </div>
  )
}
