import { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react'
import { SHOW_PALETTE_SWITCH, THEMES, useTheme } from '../theme'

// iPhone 16 / 17 Pro logical resolution, matches the wireframe artboards
const W = 402
const H = 874
const BEZEL = 14

const ToneCtx = createContext(() => {})

// Screens call this to switch the status bar to light text on dark backgrounds
export function useStatusTone(tone) {
  const set = useContext(ToneCtx)
  useEffect(() => {
    set(tone)
    return () => set('dark')
  }, [tone, set])
}

function isRealPhone() {
  return window.matchMedia('(max-width: 500px) and (pointer: coarse)').matches
}

function Clock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 10_000)
    return () => clearInterval(id)
  }, [])
  return now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M/i, '')
}

function StatusBar({ tone }) {
  return (
    <div className={`status-bar ${tone}`}>
      <span className="sb-time"><Clock /></span>
      <span className="sb-icons">
        <svg width="19" height="12" viewBox="0 0 19 12" aria-hidden="true">
          <rect x="0" y="8" width="3.2" height="4" rx="1" fill="currentColor" />
          <rect x="5" y="5.5" width="3.2" height="6.5" rx="1" fill="currentColor" />
          <rect x="10" y="3" width="3.2" height="9" rx="1" fill="currentColor" />
          <rect x="15" y="0" width="3.2" height="12" rx="1" fill="currentColor" />
        </svg>
        <svg width="17" height="12" viewBox="0 0 17 12" aria-hidden="true">
          <path d="M8.5 2.3c2.4 0 4.6.9 6.3 2.5l1.2-1.2C14 1.6 11.4.6 8.5.6S3 1.6 1 3.6l1.2 1.2C3.9 3.2 6.1 2.3 8.5 2.3Z" fill="currentColor" />
          <path d="M8.5 5.6c1.5 0 2.9.6 4 1.6l1.2-1.2A7.4 7.4 0 0 0 8.5 4 7.4 7.4 0 0 0 3.3 6l1.2 1.2c1.1-1 2.5-1.6 4-1.6Z" fill="currentColor" />
          <path d="M8.5 8.9c.7 0 1.3.3 1.8.7L8.5 11.5 6.7 9.6c.5-.4 1.1-.7 1.8-.7Z" fill="currentColor" />
        </svg>
        <svg width="27" height="13" viewBox="0 0 27 13" aria-hidden="true">
          <rect x="0.5" y="0.5" width="23" height="12" rx="3.8" fill="none" stroke="currentColor" opacity=".4" />
          <rect x="2" y="2" width="17" height="9" rx="2.5" fill="currentColor" />
          <path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2Z" fill="currentColor" opacity=".45" />
        </svg>
      </span>
    </div>
  )
}

function ThemeSwitch() {
  const { theme, setTheme } = useTheme()
  return (
    <div className="theme-switch" role="group" aria-label="Brand palette">
      <span>Palette</span>
      {THEMES.map((t) => (
        <button key={t.id} className={theme === t.id ? 'on' : ''} aria-pressed={theme === t.id} onClick={() => setTheme(t.id)}>
          {t.label}
        </button>
      ))}
    </div>
  )
}

export default function PhoneFrame({ children }) {
  const [tone, setTone] = useState('dark')
  const [real, setReal] = useState(isRealPhone)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const fit = () => {
      setReal(isRealPhone())
      const s = Math.min(1, (window.innerHeight - (SHOW_PALETTE_SWITCH ? 100 : 48)) / (H + BEZEL * 2), (window.innerWidth - 32) / (W + BEZEL * 2))
      setScale(Math.max(0.4, s))
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  // On an actual phone, skip the fake hardware and use the whole screen
  if (real) {
    return (
      <ToneCtx.Provider value={setTone}>
        <div className="device-screen real-phone">{children}</div>
      </ToneCtx.Provider>
    )
  }

  return (
    <ToneCtx.Provider value={setTone}>
      <div className={`stage ${SHOW_PALETTE_SWITCH ? '' : 'no-switch'}`}>
        <div className="stage-glow" aria-hidden="true" />
        {SHOW_PALETTE_SWITCH && <ThemeSwitch />}
        <div className="phone-wrap" style={{ width: (W + BEZEL * 2) * scale, height: (H + BEZEL * 2) * scale }}>
        <div
          className="phone"
          style={{ width: W + BEZEL * 2, height: H + BEZEL * 2, transform: `scale(${scale})` }}
        >
          <span className="btn-side action" />
          <span className="btn-side vol-up" />
          <span className="btn-side vol-down" />
          <span className="btn-side power" />
          <div className="device-screen" style={{ width: W, height: H }}>
            <StatusBar tone={tone} />
            <div className="island" />
            {children}
            <div className={`home-indicator ${tone}`} />
          </div>
        </div>
        </div>
      </div>
    </ToneCtx.Provider>
  )
}
