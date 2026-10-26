import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { HandIcon } from './ui'

// Brand colors, as CSS variables so confetti follows the theme
const COLORS = ['var(--wheat)', 'var(--powder)', 'var(--blue)', 'var(--violet)', '#A8789A', '#D08A5A']
const SHAPES = ['strip', 'square', 'dot', 'star']

// One burst of paper confetti over the phone screen. Removes itself when done.
export default function Confetti({ count = 70, duration = 3600, onDone }) {
  const [alive, setAlive] = useState(true)
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const pieces = useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 600,
    fall: 2200 + Math.random() * 1200,
    drift: (Math.random() - 0.5) * 140,
    spin: (Math.random() - 0.5) * 1080,
    size: 7 + Math.random() * 7,
    color: COLORS[i % COLORS.length],
    shape: SHAPES[Math.floor(Math.random() * (i % 7 === 0 ? 4 : 3))],
  })), [count])

  useEffect(() => {
    const id = setTimeout(() => { setAlive(false); onDone?.() }, duration)
    return () => clearTimeout(id)
  }, [duration, onDone])

  const host = typeof document !== 'undefined' && document.querySelector('.device-screen')
  if (!alive || reduced || !host) return null

  return createPortal(
    <div className="confetti" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className={`confetti-piece ${p.shape}`}
          style={{
            left: `${p.left}%`,
            '--size': `${p.size}px`,
            '--drift': `${p.drift}px`,
            '--spin': `${p.spin}deg`,
            animationDuration: `${p.fall}ms`,
            animationDelay: `${p.delay}ms`,
            color: p.color,
          }}
        >
          {p.shape === 'star' && <HandIcon name="icon-star.png" size={p.size * 1.8} />}
        </span>
      ))}
    </div>,
    host,
  )
}
