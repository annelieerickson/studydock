import { useEffect, useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Flame, Gauge, Hand, LogOut, Pause, Play, Square } from 'lucide-react'
import { useStore } from '../store'
import { TIMING, fmt } from '../data'
import { CheckBox, CloseButton, Doodle, Screen, Sheet, Star, HandIcon } from '../components/ui'
import { useStatusTone } from '../components/PhoneFrame'

export function DockInstructions() {
  const { s } = useStore()
  const nav = useNavigate()
  const [docking, setDocking] = useState(false)

  useEffect(() => {
    if (!docking) return
    const id = setTimeout(() => nav('/session/active', { replace: true }), 1600)
    return () => clearTimeout(id)
  }, [docking, nav])

  if (!s.session) {
    return (
      <Screen className="flow">
        <div className="steps-head"><CloseButton onClick={() => nav('/')} /></div>
        <div className="dock-empty">
          <h1 className="flow-title">No session set up</h1>
          <p>Pick what you’re working on first so StudyDock can time it.</p>
          <button className="btn btn-primary" onClick={() => nav('/plan/1')}>Set up a session</button>
        </div>
      </Screen>
    )
  }

  return (
    <Screen className="flow dock-screen">
      <div className="steps-head"><CloseButton onClick={() => nav(-1)} /></div>
      <h1 className="flow-title dock-title">{docking ? 'Docked! Starting your session…' : 'Place your phone in the dock'}</h1>
      <Doodle src="dock.png" className={`dock-drawing ${docking ? 'docked' : ''}`} label="The StudyDock phone dock" />
      <ol className="dock-list">
        <li><span className="num">1</span>Assemble the dock.</li>
        <li><span className="num">2</span>Place phone inside.</li>
        <li><span className="num">3</span>Your session automatically starts.</li>
      </ol>
      <p className="dock-note">
        <Star size={16} color="var(--violet)" />
        <span>Removing the phone {s.dock.lock === 'strict' ? 'ends' : 'pauses'} the current session.</span>
      </p>
      <div className="flow-foot">
        <button className="btn btn-primary" disabled={docking} onClick={() => setDocking(true)}>
          {docking ? 'Starting…' : 'Simulate docking phone'}
        </button>
      </div>
    </Screen>
  )
}

const SPEEDS = [1, 30, 120]

export function ActiveSession() {
  const { s, findTask, toggleTask, pauseSession, resumeSession } = useStore()
  const nav = useNavigate()
  // A paused session picks up where the timer stopped
  const [elapsed, setElapsed] = useState(() => s.session?.elapsed ?? 0) // seconds
  const [paused, setPaused] = useState(false)
  const [lifted, setLifted] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [confirmEnd, setConfirmEnd] = useState(false)
  const elapsedRef = useRef(s.session?.elapsed ?? 0)
  useStatusTone('light')

  useEffect(() => { resumeSession() }, [resumeSession])

  const plan = s.session
  const blocks = plan?.blocks ?? []
  const open = plan?.timing === 'open'
  const totalSec = blocks.reduce((a, b) => a + b.mins * 60, 0)

  useEffect(() => {
    if (!plan || paused || lifted) return
    const id = setInterval(() => {
      setElapsed((e) => {
        const next = open ? e + speed : Math.min(totalSec, e + speed)
        elapsedRef.current = next
        return next
      })
    }, 1000)
    return () => clearInterval(id)
  }, [plan, paused, lifted, speed, open, totalSec])

  const finish = (early = false) => {
    const focusSec = focusSeconds(blocks, elapsedRef.current, open)
    // Only credit time not already banked by an earlier pause
    const credit = focusSec - (plan?.countedSec ?? 0)
    nav('/session/done', { replace: true, state: { mins: credit / 60, total: focusSec / 60, early } })
  }

  const leave = () => {
    pauseSession({ elapsed: elapsedRef.current, focusSec: focusSeconds(blocks, elapsedRef.current, open) })
    nav('/', { replace: true })
  }

  useEffect(() => {
    if (!open && totalSec && elapsed >= totalSec) finish()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed])

  if (!plan) return <Navigate to="/" replace />

  // Where are we in the block list?
  let acc = 0, idx = 0
  for (; idx < blocks.length; idx++) {
    if (elapsed < acc + blocks[idx].mins * 60) break
    acc += blocks[idx].mins * 60
  }
  idx = Math.min(idx, blocks.length - 1)
  const block = blocks[idx]
  const blockSec = block.mins * 60
  const inBlock = elapsed - acc
  const remaining = open ? elapsed : Math.max(0, blockSec - inBlock)
  const pct = open ? (elapsed % 3600) / 3600 : inBlock / blockSec
  const focusIdx = blocks.slice(0, idx + 1).filter((b) => b.kind === 'focus').length
  const focusTotal = blocks.filter((b) => b.kind === 'focus').length
  const isBreak = block.kind === 'break'
  const tasks = plan.tasks.map((id) => findTask(s, id)).filter(Boolean)
  const R = 120, C = 2 * Math.PI * R

  const lift = () => {
    if (s.dock.lock === 'strict') finish(true)
    else setLifted(true)
  }

  return (
    <Screen className={`dark-screen session ${isBreak ? 'on-break' : ''}`}>
      <div className="session-top">
        <span className="pill glass"><span className="dot-live" /> Docked · {s.dock.lock === 'strict' ? 'Strict' : 'Gentle'}</span>
        <button className="pill glass" onClick={() => setSpeed(SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length])} title="Speeds up the timer for demos">
          <Gauge size={14} /> {speed}×
        </button>
      </div>

      {paused && <p className="paused-note">Paused. Resume when you’re ready, or leave and pick it up later.</p>}
      <p className="phase">
        {open ? 'Open session' : isBreak ? 'Break time. Stretch, sip water.' : `Focus ${focusIdx} of ${focusTotal}`}
      </p>
      <div className="ring-wrap">
        <svg viewBox="0 0 280 280" className="ring">
          <circle cx="140" cy="140" r={R} className="ring-bg" />
          <circle cx="140" cy="140" r={R} className="ring-fg" strokeDasharray={C} strokeDashoffset={C * (1 - pct)} />
        </svg>
        <div className="ring-center">
          <span className="clock">{mmss(remaining)}</span>
          <span className="ring-sub">{open ? 'elapsed' : isBreak ? 'until next focus' : 'remaining'}</span>
        </div>
      </div>

      {!open && (
        <div className="timeline dark">
          {blocks.map((b, i) => (
            <span key={i} className={`tl ${b.kind} ${i < idx ? 'past' : i === idx ? 'now' : ''}`} style={{ flex: b.mins }} />
          ))}
        </div>
      )}

      <section className="session-tasks">
        <p className="label light">This session · {TIMING[plan.timing].name}</p>
        {tasks.map(({ t, p }) => (
          <div key={t.id} className="task-row">
            <CheckBox on={t.done} onClick={() => toggleTask(t.id)} label={`Toggle ${t.title}`} />
            <span className={`grow ${t.done ? 'struck' : ''}`}>{t.title}<span className="row-sub block">{p.name}</span></span>
          </div>
        ))}
      </section>

      <div className="session-actions">
        <button className="round-btn" onClick={() => setPaused((p) => !p)} aria-label={paused ? 'Resume' : 'Pause'}>
          {paused ? <Play size={22} /> : <Pause size={22} />}
        </button>
        {paused
          ? <button className="btn btn-glass" onClick={leave}><LogOut size={16} /> Leave for now</button>
          : <button className="btn btn-glass" onClick={lift}><Hand size={16} /> Simulate lifting phone</button>}
        <button className="round-btn danger" onClick={() => setConfirmEnd(true)} aria-label="End session"><Square size={18} /></button>
      </div>

      {lifted && (
        <div className="overlay">
          <Hand size={40} />
          <h2>Timer paused</h2>
          <p>Your phone left the dock. Put it back to keep your focus going.</p>
          <button className="btn btn-wheat" onClick={() => setLifted(false)}>Put phone back in dock</button>
          <button className="btn btn-glass" onClick={leave}><LogOut size={16} /> Leave for now</button>
          <button className="link-btn light" onClick={() => finish(true)}>End session instead</button>
        </div>
      )}

      <Sheet open={confirmEnd} onClose={() => setConfirmEnd(false)} title="End session early?">
        <p className="muted">You’ve focused for {fmt(focusSeconds(blocks, elapsed, open) / 60)}. Time so far still counts toward your streak.</p>
        <button className="btn btn-primary" onClick={() => finish(true)}>End session</button>
        <button className="btn btn-ghost" onClick={() => setConfirmEnd(false)}>Keep going</button>
      </Sheet>
    </Screen>
  )
}

function focusSeconds(blocks, elapsed, open) {
  if (open) return elapsed
  let acc = 0, focus = 0
  for (const b of blocks) {
    const len = b.mins * 60
    const used = Math.max(0, Math.min(len, elapsed - acc))
    if (b.kind === 'focus') focus += used
    acc += len
  }
  return focus
}

function mmss(sec) {
  const s = Math.floor(sec)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const r = String(s % 60).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${r}` : `${m}:${r}`
}

export function SessionDone() {
  const { s, findTask, finishSession } = useStore()
  const nav = useNavigate()
  const { state } = useLocation()
  // mins = time not yet counted today; total = whole session including time before a pause
  const mins = Math.max(0, Math.round(state?.mins ?? 0))
  const total = Math.max(1, Math.round(state?.total ?? state?.mins ?? 0))
  const plan = s.session
  const tasks = (plan?.tasks ?? []).map((id) => findTask(s, id)).filter(Boolean)
  const [done, setDone] = useState(() => tasks.filter((x) => x.t.done).map((x) => x.t.id))
  const label = [...new Set(tasks.map((x) => x.p.name))].join(' + ') || 'Study session'

  const save = () => {
    finishSession({ mins, label, mode: TIMING[plan?.timing ?? 'open'].name, doneTasks: done })
    nav('/', { replace: true })
  }

  return (
    <Screen className="flow done-screen">
      <div className="done-hero">
        <Star size={56} color="var(--wheat)" className="spin-in" />
        <h1 className="flow-title center">{state?.early ? 'Session ended' : 'Session complete!'}</h1>
        <p className="muted center">{state?.early ? 'Every minute counts. Nice effort.' : 'You stayed off your phone the whole time.'}</p>
      </div>
      <div className="grid-2">
        <div className="card stat"><b>{fmt(total)}</b><span>Focused</span></div>
        <div className="card stat"><b className="stat-icon"><HandIcon name="icon-flame.png" size={20} fallback={Flame} />{s.profile.streak + (s.sessionDoneToday ? 0 : 1)}</b><span>Day streak</span></div>
      </div>
      <h3 className="section-title">What did you finish?</h3>
      <section className="card list">
        {tasks.map(({ t, p }) => {
          const on = done.includes(t.id)
          return (
            <div key={t.id} className="task-row divided">
              <CheckBox on={on} onClick={() => setDone((d) => (on ? d.filter((x) => x !== t.id) : [...d, t.id]))} label={`Toggle ${t.title}`} />
              <span className={`grow ${on ? 'struck' : ''}`}>{t.title}<span className="row-sub block">{p.name}</span></span>
            </div>
          )
        })}
      </section>
      <div className="flow-foot">
        <button className="btn btn-primary" onClick={save}>Save & go home</button>
      </div>
    </Screen>
  )
}
