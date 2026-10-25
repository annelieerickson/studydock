import { useId } from 'react'
import { paint, LIGHT_COLORS, useTheme } from '../theme'
import { useStore } from '../store'
import { asset, fmtDue, urgency } from '../data'
import { createPortal } from 'react-dom'
import { NavLink, useNavigate } from 'react-router-dom'
import { House, BookOpen, Users, UserRound, ChevronLeft, X, Check } from 'lucide-react'

// Brand mark: four-point sparkle (Seashell) or five-petal flower (Bloom)
export function Star({ size = 24, color = 'currentColor', className = '' }) {
  const { theme } = useTheme()
  const maskId = useId()
  if (theme === 'bloom') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <mask id={maskId}>
          <rect width="64" height="64" fill="#fff" />
          <circle cx="32" cy="32" r="6.5" fill="#000" />
        </mask>
        <g fill={color} mask={`url(#${maskId})`}>
          {PETALS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="14" />)}
          <circle cx="32" cy="32" r="16" />
        </g>
      </svg>
    )
  }
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <path d="M32 2 C34.5 24 40 29.5 62 32 C40 34.5 34.5 40 32 62 C29.5 40 24 34.5 2 32 C24 29.5 29.5 24 32 2Z" fill={color} />
    </svg>
  )
}

export function Avatar({ name = '', color = '#A6BCC9', size = 48, ring, img }) {
  const initials = name.replace('@', '').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  color = paint(color)
  ring = paint(ring)
  const light = LIGHT_COLORS.includes(color.toUpperCase())
  return (
    <span
      className={`avatar ${img ? 'has-img' : ''}`}
      style={{
        width: size, height: size, fontSize: size * 0.38,
        // Drawn portraits show on their own, with no circle behind them
        background: img ? 'transparent' : color,
        color: light ? 'var(--violet)' : 'var(--seashell)',
        boxShadow: ring && !img ? `0 0 0 3px var(--seashell), 0 0 0 6px ${ring}` : undefined,
      }}
    >
      {img ? <img src={asset(img)} alt="" draggable="false" /> : initials}
    </span>
  )
}

export function Screen({ children, className = '', tabs = false }) {
  return <div className={`screen ${tabs ? 'with-tabs' : ''} ${className}`}>{children}</div>
}

export function TopBar({ title, right, onBack, dark }) {
  const nav = useNavigate()
  return (
    <div className={`topbar ${dark ? 'dark' : ''}`}>
      <button className="icon-btn" aria-label="Back" onClick={onBack || (() => nav(-1))}>
        <ChevronLeft size={24} />
      </button>
      {title && <h2 className="topbar-title">{title}</h2>}
      <span className="topbar-right">{right}</span>
    </div>
  )
}

export function CloseButton({ onClick }) {
  return (
    <button className="icon-btn" aria-label="Close" onClick={onClick}>
      <X size={22} />
    </button>
  )
}

export function Segmented({ options, value, onChange }) {
  const idx = options.findIndex((o) => o.value === value)
  return (
    <div className="segmented" style={{ '--n': options.length, '--i': idx }}>
      <span className="seg-thumb" />
      {options.map((o) => (
        <button key={o.value} className={o.value === value ? 'on' : ''} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function CheckCircle({ on, onClick, label }) {
  return (
    <button className={`check-circle ${on ? 'on' : ''}`} onClick={onClick} aria-pressed={on} aria-label={label}>
      {on && <Check size={16} strokeWidth={3} />}
    </button>
  )
}

export function CheckBox({ on, onClick, label, decorative = false }) {
  // Inside a larger clickable card, render a plain visual box (no nested button)
  if (decorative) {
    return <span className={`check-box ${on ? 'on' : ''}`} aria-hidden="true">{on && <Check size={16} strokeWidth={3} />}</span>
  }
  return (
    <button className={`check-box ${on ? 'on' : ''}`} onClick={onClick} aria-pressed={on} aria-label={label}>
      {on && <Check size={16} strokeWidth={3} />}
    </button>
  )
}

export function TabBar() {
  const nav = useNavigate()
  const { s, beginPlanSession } = useStore()
  const tab = (to, Icon, label) => (
    <NavLink to={to} end={to === '/'} className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>
      <Icon size={24} strokeWidth={2} />
      <span>{label}</span>
    </NavLink>
  )
  return (
    <nav className="tabbar" aria-label="Main">
      {tab('/', House, 'Home')}
      {tab('/projects', BookOpen, 'Projects')}
      <button className="tab-center" aria-label="Start a session" onClick={() => { if (s.plan) { beginPlanSession(); nav('/start/1') } else nav('/plan/1') }}>
        <Star size={34} color="var(--wheat)" />
      </button>
      {tab('/friends', Users, 'Friends')}
      {tab('/profile', UserRound, 'Profile')}
    </nav>
  )
}

export function Sheet({ open, onClose, title, children }) {
  if (!open) return null
  return portal(
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={title}>
        <div className="sheet-grabber" />
        <div className="sheet-head">
          <h3>{title}</h3>
          <CloseButton onClick={onClose} />
        </div>
        {children}
      </div>
    </div>
  )
}

export function Toast({ text }) {
  if (!text) return null
  return portal(<div className="toast">{text}</div>)
}

// Render overlays on the phone screen itself so they ignore page scroll
function portal(node) {
  const host = document.querySelector('.device-screen')
  return host ? createPortal(node, host) : node
}

// Centers of five round petals
const PETALS = [0, 1, 2, 3, 4].map((i) => {
  const a = (i * 72 - 90) * Math.PI / 180
  return [32 + 17 * Math.cos(a), 32 + 17 * Math.sin(a)]
})

// Due date colored by urgency. 'block' is the stacked badge used on selection cards.
export function DueBadge({ hrs, block = false }) {
  if (hrs == null) return null
  const level = urgency(hrs)
  if (block) {
    return (
      <span className={`due-block ${level}`}>
        Due in<b>{fmtDue(hrs)}</b>
      </span>
    )
  }
  return <span className={`due-pill ${level}`}>Due in {fmtDue(hrs)}</span>
}

// Hand-drawn class icon, tinted by CSS so it follows the active palette
export function ClassIcon({ sub, size = 40 }) {
  if (!sub?.icon) return null
  return (
    <span className="class-icon" style={{ width: size, height: size, '--c': paint(sub.color) }} aria-hidden="true">
      <span style={{ WebkitMaskImage: `url(${asset(sub.icon)})`, maskImage: `url(${asset(sub.icon)})` }} />
    </span>
  )
}

// Line drawing tinted to the current text color (e.g. the empty desk)
export function Doodle({ src, className = '', label }) {
  const url = `url(${asset(src)})`
  return <span className={`doodle ${className}`} role={label ? 'img' : undefined} aria-label={label} style={{ WebkitMaskImage: url, maskImage: url }} />
}
