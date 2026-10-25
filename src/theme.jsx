import { createContext, useContext, useEffect, useState } from 'react'

// Brand directions to compare:
//  - 'doodle':   hand-drawn look; muted orange / yellow / purple on paper, Patrick Hand + Nunito (default)
//  - 'seashell': Seashell / Wheat / Powder Blue / French Blue / Midnight Violet, Young Serif
//  - 'bloom':    Light Blue / Twitter Blue / Midnight Violet on cream, Anton + Michroma
//  - 'spring':   Praxeti White / Spring lime / Mantis / Picture Book Green / Nuit Blanche / Midnight Mirage,
//                Space Grotesk + Space Mono
// Doodle is the app's theme. Flip this to true to bring back the palette switchers
// (above the phone and on Profile) for comparing the other directions.
export const SHOW_PALETTE_SWITCH = false

export const THEMES = [
  { id: 'doodle', label: 'Doodle' },
  { id: 'seashell', label: 'Seashell' },
  { id: 'bloom', label: 'Bloom' },
  { id: 'spring', label: 'Spring' },
]

// Seed data uses Seashell hex values; Bloom swaps each for its closest match
const BLOOM_MAP = {
  '#3E4B8E': '#0072BB',
  '#3D1534': '#3B1F2B',
  '#A6BCC9': '#B7D5D4',
  '#F6E0B6': '#ECE6C2',
  '#FFF4EB': '#FFFDEB',
  '#7A5C8E': '#6E4A5C',
  '#B08A4A': '#4F97C4',
  '#5D8AA8': '#5E9E9C',
  '#E2B65C': '#0072BB',
}

const SPRING_MAP = {
  '#3E4B8E': '#1E488F',
  '#3D1534': '#001F3F',
  '#A6BCC9': '#74C365',
  '#F6E0B6': '#DBE64C',
  '#FFF4EB': '#F6F7ED',
  '#7A5C8E': '#00804C',
  '#B08A4A': '#5E8F2F',
  '#5D8AA8': '#3C6FB8',
  '#E2B65C': '#DBE64C',
}

// Muted oranges, yellows and purples pulled from Annie's drawings
const DOODLE_MAP = {
  '#3E4B8E': '#8C5A70',
  '#3D1534': '#4A2E3A',
  '#A6BCC9': '#E9B98F',
  '#F6E0B6': '#F2D28A',
  '#FFF4EB': '#FBF4E8',
  '#7A5C8E': '#A8789A',
  '#B08A4A': '#D08A5A',
  '#5D8AA8': '#C9A24E',
  '#E2B65C': '#E0A94A',
}

const MAPS = { doodle: DOODLE_MAP, bloom: BLOOM_MAP, spring: SPRING_MAP }

let current = 'doodle'

// Translate a stored hex color into the active palette
export function paint(hex) {
  const map = MAPS[current]
  if (!map || !hex) return hex
  return map[hex.toUpperCase()] || hex
}

export const LIGHT_COLORS = ['#F6E0B6', '#A6BCC9', '#FFF4EB', '#B7D5D4', '#ECE6C2', '#FFFDEB', '#74C365', '#DBE64C', '#F6F7ED', '#E9B98F', '#F2D28A', '#FBF4E8', '#E0A94A', '#C9A24E']

const Ctx = createContext({ theme: 'doodle', setTheme: () => {} })

function saved() {
  if (!SHOW_PALETTE_SWITCH) return 'doodle'
  try {
    const t = localStorage.getItem('studydock-theme')
    return THEMES.some((x) => x.id === t) ? t : 'doodle'
  } catch {
    return 'doodle'
  }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(saved)
  current = theme

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem('studydock-theme', theme) } catch { /* private mode */ }
  }, [theme])

  return (
    <Ctx.Provider value={{ theme, setTheme: setThemeState }}>
      {/* key remounts the screens so every inline color repaints */}
      <div key={theme} style={{ display: 'contents' }}>{children}</div>
    </Ctx.Provider>
  )
}

export const useTheme = () => useContext(Ctx)
