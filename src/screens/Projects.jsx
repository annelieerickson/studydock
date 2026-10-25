import { paint } from '../theme'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronRight, Plus, Search } from 'lucide-react'
import { useStore } from '../store'
import { fmt } from '../data'
import { CheckBox, ClassIcon, DueBadge, Screen, Segmented, Sheet, TopBar } from '../components/ui'

const RANGE_MULT = { week: 1, semester: 7.4, all: 11.2 }

export function ProjectsList() {
  const { s } = useStore()
  const [range, setRange] = useState('week')
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const mult = RANGE_MULT[range]
  const rows = s.subjects.map((sub) => ({
    ...sub,
    mins: sub.projects.reduce((a, p) => a + p.minutes, 0) * mult,
    open: sub.projects.reduce((a, p) => a + p.tasks.filter((t) => !t.done).length, 0),
  }))
  const total = rows.reduce((a, r) => a + r.mins, 0)
  const q = query.toLowerCase()
  const shown = rows.filter((r) => !q || (r.code + r.name + r.projects.map((p) => p.name).join()).toLowerCase().includes(q))

  return (
    <Screen tabs>
      <header className="page-head">
        <h1 className="display">Projects</h1>
        <button className="icon-btn round" aria-label="Search" onClick={() => setSearching((v) => !v)}>
          <Search size={20} />
        </button>
      </header>
      {searching && (
        <input className="field" autoFocus placeholder="Search classes and projects" value={query} onChange={(e) => setQuery(e.target.value)} />
      )}
      <Segmented
        value={range}
        onChange={setRange}
        options={[{ value: 'week', label: 'This week' }, { value: 'semester', label: 'Semester' }, { value: 'all', label: 'All time' }]}
      />
      <section className="card">
        <div className="row-between">
          <span className="label">Time per subject</span>
          <span className="big-num">{fmt(total)}</span>
        </div>
        <div className="stacked-bar">
          {rows.map((r) => <span key={r.id} style={{ flex: r.mins, background: paint(r.color) }} title={r.code} />)}
        </div>
        <div className="legend">
          {rows.map((r) => <span key={r.id}><i style={{ background: paint(r.color) }} />{r.code}</span>)}
        </div>
      </section>

      <h3 className="section-title">Subjects & classes</h3>
      <div className="stack">
        {shown.map((r) => (
          <Link key={r.id} to={`/projects/${r.id}`} className="card subject-row">
            <ClassIcon sub={r} size={46} />
            <div className="grow">
              <div className="row-title sm">{r.code} - {r.name}</div>
              <div className="row-sub">{r.projects.length} projects, {r.open} open tasks</div>
            </div>
            <span className="row-time">{fmt(r.mins)}</span>
            <ChevronRight size={18} className="muted" />
          </Link>
        ))}
      </div>
    </Screen>
  )
}

export function SubjectDetail() {
  const { id } = useParams()
  const { s, addProject } = useStore()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const sub = s.subjects.find((x) => x.id === id)
  if (!sub) return <Screen><TopBar /><p>Not found</p></Screen>
  const total = sub.week.reduce((a, b) => a + b, 0)
  const max = Math.max(...sub.week, 1)
  const maxProj = Math.max(...sub.projects.map((p) => p.minutes), 1)
  const today = (new Date().getDay() + 6) % 7

  return (
    <Screen>
      <TopBar />
      <div className="subject-title">
        <ClassIcon sub={sub} size={64} />
        <div>
          <h1 className="display sm">{sub.code}</h1>
          <p className="muted">{sub.name}</p>
        </div>
      </div>
      <section className="card">
        <div className="row-between">
          <span className="label">Time spent this week</span>
          <span className="big-num">{fmt(total)}</span>
        </div>
        <div className="bars">
          {sub.week.map((m, i) => (
            <div key={i} className="bar-col">
              <span className="bar" style={{ height: `${Math.max(6, (m / max) * 100)}%`, background: i === today ? paint(sub.color) : undefined }} title={fmt(m)} />
              <span className="week-label">{'MTWTFSS'[i]}</span>
            </div>
          ))}
        </div>
      </section>
      <div className="row-between section-row">
        <h3 className="section-title">Projects</h3>
        <button className="chip-btn" onClick={() => setAdding(true)}><Plus size={14} /> New project</button>
      </div>
      <div className="stack">
        {sub.projects.map((p) => (
          <Link key={p.id} to={`/projects/${sub.id}/${p.id}`} className="card project-row">
            <div className="row-between">
              <span className="row-title sm">{p.name}</span>
              <span className="row-time">{fmt(p.minutes)}</span>
            </div>
            <div className="thin-bar"><span style={{ width: `${(p.minutes / maxProj) * 100}%`, background: paint(sub.color) }} /></div>
            <div className="row-between"><span className="row-sub">{p.tasks.filter((t) => t.done).length}/{p.tasks.length} tasks done</span><DueBadge hrs={p.dueHrs} /></div>
          </Link>
        ))}
      </div>
      <Sheet open={adding} onClose={() => setAdding(false)} title="New project">
        <input className="field" autoFocus placeholder="Project name" value={name} onChange={(e) => setName(e.target.value)} />
        <button
          className="btn btn-primary"
          disabled={!name.trim()}
          onClick={() => { addProject(sub.id, name.trim()); setName(''); setAdding(false) }}
        >Add project</button>
      </Sheet>
    </Screen>
  )
}

export function ProjectDetail() {
  const { id, pid } = useParams()
  const { s, toggleTask, addTask } = useStore()
  const nav = useNavigate()
  const [text, setText] = useState('')
  const sub = s.subjects.find((x) => x.id === id)
  const p = sub?.projects.find((x) => x.id === pid)
  if (!p) return <Screen><TopBar /><p>Not found</p></Screen>
  const done = p.tasks.filter((t) => t.done).length

  const submit = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    addTask(p.id, text.trim())
    setText('')
  }

  return (
    <Screen>
      <TopBar right={<button className="pill powder" onClick={() => nav(`/projects/${sub.id}`)}>{sub.code}</button>} />
      <h1 className="display sm">{p.name}</h1>
      <div className="due-line"><DueBadge hrs={p.dueHrs} /></div>
      <div className="grid-3">
        <div className="card stat"><b>{fmt(p.minutes)}</b><span>Time spent</span></div>
        <div className="card stat"><b>{p.sessions}</b><span>Sessions</span></div>
        <div className="card stat"><b>{done} / {p.tasks.length}</b><span>Tasks done</span></div>
      </div>
      <section className="card list">
        {p.tasks.length === 0 && <div className="row-sub center">No tasks yet. Add one below.</div>}
        {p.tasks.map((t) => (
          <div key={t.id} className="task-row divided">
            <CheckBox on={t.done} onClick={() => toggleTask(t.id)} label={`Toggle ${t.title}`} />
            <span className={`grow ${t.done ? 'struck' : ''}`}>{t.title}</span>
            <span className="task-meta">{t.mins}m</span>
          </div>
        ))}
      </section>
      <form onSubmit={submit}>
        <label className="label" htmlFor="newtask">Add a task</label>
        <div className="input-row">
          <input id="newtask" className="field" placeholder="e.g. Problem 4" value={text} onChange={(e) => setText(e.target.value)} />
          <button className="btn btn-primary small" disabled={!text.trim()}>Add</button>
        </div>
      </form>
    </Screen>
  )
}
