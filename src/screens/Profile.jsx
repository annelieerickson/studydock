import { SHOW_PALETTE_SWITCH, THEMES, paint, useTheme } from '../theme'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, Clock, Flame, History, Palette, Radio, RotateCcw } from 'lucide-react'
import { useStore } from '../store'
import { fmt } from '../data'
import { Avatar, Screen, Sheet, Star, TopBar } from '../components/ui'

const COLORS = ['#3E4B8E', '#3D1534', '#A6BCC9', '#F6E0B6', '#7A5C8E', '#B08A4A']

export function Profile() {
  const { s, setProfile, reset } = useStore()
  const { theme, setTheme } = useTheme()
  const nav = useNavigate()
  const p = s.profile
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: p.name, handle: p.handle, color: p.color })

  const open = () => { setForm({ name: p.name, handle: p.handle, color: p.color }); setEditing(true) }

  return (
    <Screen tabs>
      <div className="profile-head">
        <Avatar name={p.name} color={p.color} img={p.img} size={132} />
        <h1 className="display sm center">
          {p.name}
        </h1>
        <p className="muted sm center">@{p.handle} · studying since May 2026</p>
        <button className="chip-btn" onClick={open}>Edit username & avatar</button>
      </div>

      <section className="hero-card total">
        <span className="label light">Total time studied</span>
        <span className="hero-huge">{fmt(p.totalMins)}</span>
        <span className="hero-sub">{p.sessions} sessions · best streak {p.bestStreak} days</span>
      </section>
      <div className="grid-2">
        <div className="card stat-lg wheat">
          <Flame size={20} />
          <b>{p.streak} days</b><span>Current streak</span>
        </div>
        <div className="card stat-lg powder">
          <Clock size={20} />
          <b>{fmt(Math.round(s.todayMins))}</b><span>Studied today</span>
        </div>
      </div>

      <section className="card list menu">
        <Link to="/history" className="menu-row"><History size={20} /><span className="grow">Session history</span><ChevronRight size={18} /></Link>
        <Link to="/dock" className="menu-row"><Radio size={20} /><span className="grow">Dock setup</span><ChevronRight size={18} /></Link>
        {SHOW_PALETTE_SWITCH && (
          <button className="menu-row" onClick={() => setTheme(THEMES[(THEMES.findIndex((t) => t.id === theme) + 1) % THEMES.length].id)}>
            <Palette size={20} /><span className="grow">Brand palette</span>
            <span className="muted sm">{THEMES.find((t) => t.id === theme).label}</span>
          </button>
        )}
        <button className="menu-row" onClick={() => { reset(); nav('/') }}><RotateCcw size={20} /><span className="grow">Reset prototype</span></button>
      </section>

      <Sheet open={editing} onClose={() => setEditing(false)} title="Edit profile">
        <div className="center"><Avatar name={form.name} color={form.color} img={p.img} size={88} /></div>
        <div className="swatches">
          {COLORS.map((c) => (
            <button key={c} className={`swatch ${form.color === c ? 'on' : ''}`} style={{ background: paint(c) }} onClick={() => setForm({ ...form, color: c })} aria-label={`Avatar color ${c}`} />
          ))}
        </div>
        <label className="label" htmlFor="pname">Name</label>
        <input id="pname" className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <label className="label" htmlFor="phandle">Username</label>
        <div className="search-field"><span>@</span><input id="phandle" value={form.handle} onChange={(e) => setForm({ ...form, handle: e.target.value.replace(/[^\w.]/g, '') })} /></div>
        <button
          className="btn btn-primary"
          disabled={!form.name.trim() || !form.handle.trim()}
          onClick={() => { setProfile({ ...form, first: form.name.trim().split(' ')[0] }); setEditing(false) }}
        >Save</button>
      </Sheet>
    </Screen>
  )
}

export function SessionHistory() {
  const { s } = useStore()
  const groups = {}
  for (const h of s.history) (groups[h.day] ||= []).push(h)
  const total = s.history.reduce((a, h) => a + h.mins, 0)
  return (
    <Screen>
      <TopBar title="Session history" />
      <section className="hero-card total">
        <span className="label light">Last 7 days</span>
        <span className="hero-huge">{fmt(total)}</span>
        <span className="hero-sub">{s.history.length} sessions · {s.profile.streak} day streak</span>
      </section>
      {Object.entries(groups).map(([day, items]) => (
        <div key={day}>
          <h3 className="section-title">{day}</h3>
          <section className="card list">
            {items.map((h) => (
              <div key={h.id} className="task-row divided">
                <span className="hist-icon"><Star size={16} color="var(--violet)" /></span>
                <div className="grow">
                  <div className="row-title sm">{h.label}</div>
                  <div className="row-sub">{h.time} · {h.mode}</div>
                </div>
                <span className="row-time">{fmt(h.mins)}</span>
              </div>
            ))}
          </section>
        </div>
      ))}
    </Screen>
  )
}
