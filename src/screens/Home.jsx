import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronRight, Flame, Pause, Pencil, Play } from 'lucide-react'
import { useStore } from '../store'
import Confetti from '../components/Confetti'
import { fmt } from '../data'
import { Avatar, CheckCircle, Doodle, DueBadge, Screen, Star, HandIcon } from '../components/ui'

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

// "Oliver", "Oliver and Max", "Oliver, Max and Marge"
function listNames(names) {
  if (names.length <= 1) return names[0] ?? ''
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

export function WeekStreak({ done }) {
  // index of today with Monday = 0
  const today = (new Date().getDay() + 6) % 7
  return (
    <div className="week-row">
      {DAYS.map((d, i) => {
        const state = i < today ? 'done' : i === today ? (done ? 'done today' : 'today') : 'future'
        return (
          <div key={i} className="week-day">
            <span className="week-label">{d}</span>
            <span className={`week-dot ${state}`}>
              {state.startsWith('done') && <Star size={18} color="var(--violet)" />}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function Home() {
  const { s, findTask, markCelebrated } = useStore()
  const [burst, setBurst] = useState(false)

  // Confetti once, the first time every task in today's plan is checked off
  const planTasks = s.plan ? s.plan.tasks.map((id) => findTask(s, id)).filter(Boolean) : []
  const allDone = planTasks.length > 0 && planTasks.every((x) => x.t.done)
  const sig = s.plan ? s.plan.tasks.join('|') : null
  useEffect(() => {
    if (allDone && s.celebrated !== sig) { setBurst(true); markCelebrated(sig) }
    if (!allDone && s.celebrated) markCelebrated(null)
  }, [allDone, sig, s.celebrated, markCelebrated])
  const date = new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })
  const studying = s.friends.filter((f) => f.studying)

  // After finishing or pausing a session with plan tasks still open, show the focused "Welcome back" view
  const openLeft = s.plan ? s.plan.tasks.some((id) => !findTask(s, id)?.t.done) : false
  if (s.plan && openLeft && (s.paused || s.sessionDoneToday)) return <WelcomeBack date={date} />

  return (
    <Screen tabs>
      {burst && <Confetti onDone={() => setBurst(false)} />}
      <header className="home-head">
        <div>
          <p className="eyebrow-date">{date}</p>
          <h1 className="display">Hi, {s.profile.first}</h1>
        </div>
        <Link to="/profile" aria-label="Profile">
          <Avatar name={s.profile.name} color={s.profile.color} img={s.profile.img} size={52} />
        </Link>
      </header>

      <TodayCard />

      <section className="card streak-card">
        <div className="streak-head">
          <span className="streak-icon"><HandIcon name="icon-flame.png" size={26} fallback={Flame} /></span>
          <div>
            <div className="big-num">{s.profile.streak} days</div>
            <div className="muted sm">Current streak</div>
          </div>
          <Link to="/history" className="link-sm">History <ChevronRight size={14} /></Link>
        </div>
        <WeekStreak done={s.sessionDoneToday} />
      </section>

      <Link to="/friends" className="card mini-card friends-wide">
        <div className="mini-head"><span>Friends studying now</span><span className="chip">See all</span></div>
        {studying.length ? (
          <div className="stack-row">
            <div className="avatar-stack">
              {studying.slice(0, 4).map((f) => <Avatar key={f.id} name={f.name} color={f.color} img={f.img} size={46} />)}
            </div>
            <div className="grow">
              <div className="sm"><b>{studying.length} studying</b> now</div>
              <div className="muted xs">{listNames(studying.map((f) => f.name))}</div>
            </div>
          </div>
        ) : (
          <div className="muted sm">None of your friends are studying right now.</div>
        )}
      </Link>
    </Screen>
  )
}

function TodayCard() {
  const { s, toggleTask, findTask, beginPlanEdit, beginPlanSession } = useStore()
  const nav = useNavigate()
  const [expanded, setExpanded] = useState(false)

  const editPlan = () => { beginPlanEdit(); nav('/create/1') }

  if (!s.plan) {
    return (
      <section className="hero-card">
        <div className="progress-head">
          <h2 className="hero-title">Today’s progress</h2>
          <span className="hero-num">{s.todayMins ? fmt(s.todayMins) : '0h 0m'}</span>
        </div>
        <div className="empty-plan">
          <p className="empty-top">You haven’t created a plan for today yet.</p>
          <Doodle src="empty-desk.png" className="empty-desk" label="An empty desk" />
          <p className="empty-bottom">Create a plan to see your progress and keep your streak!</p>
        </div>
        <button className="btn btn-wheat" onClick={editPlan}>
          <Star size={16} color="var(--violet)" /> Create Plan
        </button>
      </section>
    )
  }

  const tasks = s.plan.tasks.map((id) => findTask(s, id)).filter(Boolean)
  const doneCount = tasks.filter((x) => x.t.done).length
  const pct = tasks.length ? (doneCount / tasks.length) * 100 : 0
  // Open tasks first, most urgent at the top
  const open = tasks.filter((x) => !x.t.done).sort((a, b) => (a.p.dueHrs ?? 999) - (b.p.dueHrs ?? 999))
  const done = tasks.filter((x) => x.t.done)
  const ordered = [...open, ...done]
  const shown = expanded ? ordered : open.slice(0, 2)
  const hiddenCount = ordered.length - shown.length

  return (
    <section className="hero-card">
      <div className="progress-head">
        <h2 className="hero-title">Today’s progress</h2>
        <span className="hero-num">{s.todayMins ? fmt(s.todayMins) : '0h 0m'}</span>
      </div>
      <div className="progress-bar">
        <span style={{ width: `${pct}%` }} />
        <b>{doneCount}/{tasks.length} Tasks</b>
      </div>
      <div className="inner-card list">
        {open.length === 0 && !expanded && (
          <div className="all-done">
            <Star size={30} color="var(--blue)" />
            <b>All done for today!</b>
            <span className="row-sub">You finished every task in your plan.</span>
          </div>
        )}
        {shown.map(({ t, p }) => (
          <div className="task-row divided" key={t.id}>
            <div className="grow">
              <div className={`row-title sm ${t.done ? 'struck' : ''}`}>{t.title}</div>
              <div className="row-sub">{p.name}</div>
            </div>
            {!t.done && <DueBadge hrs={p.dueHrs} />}
            <CheckCircle on={t.done} onClick={() => toggleTask(t.id)} label={`Mark ${t.title} done`} />
          </div>
        ))}
        {(hiddenCount > 0 || expanded) && (
          <button className="task-row divided more-row" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>
            <span className="grow">{expanded ? 'Show less' : open.length === 0 ? `Show ${done.length} finished task${done.length > 1 ? 's' : ''}` : `And ${hiddenCount} more…`}</span>
            <ChevronDown size={18} className={expanded ? 'flip' : ''} />
          </button>
        )}
      </div>
      <div className="hero-actions">
        <button className="btn btn-glass-light" onClick={editPlan}><Pencil size={16} /> Edit plan</button>
        <button className="btn btn-wheat" disabled={open.length === 0} onClick={() => { beginPlanSession(); nav('/start/1') }}>
          <Star size={16} color="var(--violet)" /> Start Session
        </button>
      </div>
    </section>
  )
}

function WelcomeBack({ date }) {
  const { s, findTask, toggleTask, beginPlanEdit, beginPlanSession } = useStore()
  const nav = useNavigate()
  const tasks = s.plan.tasks.map((id) => findTask(s, id)).filter(Boolean)
  const open = tasks.filter((x) => !x.t.done).sort((a, b) => (a.p.dueHrs ?? 999) - (b.p.dueHrs ?? 999))
  const done = tasks.filter((x) => x.t.done)
  const planned = tasks.reduce((a, x) => a + x.t.mins, 0)
  const mins = Math.round(s.todayMins)
  const pct = planned ? Math.min(1, mins / planned) : 0
  const R = 92, C = 2 * Math.PI * R

  const resume = () => {
    if (s.paused) nav('/session/dock') // continue the paused timer
    else { beginPlanSession(); nav('/start/1') } // pick the next tasks from the plan
  }

  return (
    <Screen tabs>
      <header className="home-head">
        <div>
          <p className="eyebrow-date">{date}</p>
          <h1 className="display">Welcome back, {s.profile.first}</h1>
        </div>
        <Link to="/profile" aria-label="Profile">
          <Avatar name={s.profile.name} color={s.profile.color} img={s.profile.img} size={52} />
        </Link>
      </header>
      <hr className="rule" />

      <p className="ring-title">Today’s progress</p>
      <div className="today-ring" role="img" aria-label={`${fmt(mins)} studied today`}>
        <svg viewBox="0 0 220 220">
          <circle cx="110" cy="110" r={R} className="tr-bg" />
          <circle cx="110" cy="110" r={R} className="tr-fg" strokeDasharray={C} strokeDashoffset={C * (1 - pct)} />
        </svg>
        <div className="tr-center">
          <span className="tr-h">{Math.floor(mins / 60)}h</span>
          <span className="tr-m">{mins % 60}m</span>
        </div>
      </div>
      <p className="muted sm center ring-sub-text">
        {s.paused ? <><Pause size={13} /> Session paused</> : `of about ${fmt(planned)} planned`}
      </p>

      <button className="btn btn-primary resume-btn" onClick={resume}>
        <Play size={18} /> Resume Session
      </button>

      <div className="row-between tasks-head">
        <h3 className="section-title">Today’s tasks</h3>
        <span className="tasks-count">{done.length}/{tasks.length}</span>
      </div>
      <section className="card list">
        {[...open, ...done].map(({ t, p }) => (
          <div className="task-row divided" key={t.id}>
            <div className="grow">
              <div className={`row-title sm ${t.done ? 'struck' : ''}`}>{t.title}</div>
              <div className="row-sub">{p.name}</div>
            </div>
            {!t.done && <DueBadge hrs={p.dueHrs} />}
            <CheckCircle on={t.done} onClick={() => toggleTask(t.id)} label={`Mark ${t.title} done`} />
          </div>
        ))}
      </section>
      <button className="link-btn center-self" onClick={() => { beginPlanEdit(); nav('/create/1') }}>
        <Pencil size={14} /> Edit plan
      </button>
    </Screen>
  )
}
