import { useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { MapPin, Minus, Plus, Undo2 } from 'lucide-react'
import { useStore, sessionLength, buildBlocks } from '../store'
import { STUDY_SPOTS, TIMING, fmt } from '../data'
import { CheckBox, ClassIcon, CloseButton, DueBadge, Screen } from '../components/ui'

/* ---------- Shared pieces ---------- */

function Steps({ step, total }) {
  const nav = useNavigate()
  return (
    <>
      <div className="steps-head">
        <CloseButton onClick={() => nav('/')} />
        <div className="steps" style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }}>
          {Array.from({ length: total }, (_, i) => <span key={i} className={i < step ? 'on' : ''} />)}
        </div>
      </div>
      <p className="eyebrow">Step {step} of {total}</p>
    </>
  )
}

function ProjectSelect({ selected, onToggle }) {
  const { s } = useStore()
  return s.subjects.map((sub) => {
    const ps = sub.projects.filter((p) => p.active || selected.includes(p.id))
    if (!ps.length) return null
    return (
      <div key={sub.id}>
        <p className="group-label"><ClassIcon sub={sub} size={28} />{sub.code}</p>
        {ps.map((p) => {
          const on = selected.includes(p.id)
          return (
            <button key={p.id} className={`select-card ${on ? 'on' : ''}`} onClick={() => onToggle(p.id)} aria-pressed={on}>
              <CheckBox on={on} decorative />
              <span className="grow">
                <span className="row-title">{p.name}</span>
                <span className="row-sub block">{p.tasks.filter((t) => !t.done).length} open tasks</span>
              </span>
              <DueBadge hrs={p.dueHrs} block />
            </button>
          )
        })}
      </div>
    )
  })
}

function SwipeRow({ children, onSwipe }) {
  const start = useRef(null)
  const [dx, setDx] = useState(0)
  return (
    <div
      className="swipe-row"
      onPointerDown={(e) => { if (e.target.closest('button')) return; start.current = e.clientX; e.currentTarget.setPointerCapture(e.pointerId) }}
      onPointerMove={(e) => { if (start.current != null) setDx(Math.min(0, e.clientX - start.current)) }}
      onPointerUp={() => {
        if (dx < -90) onSwipe()
        start.current = null
        setDx(0)
      }}
      onPointerCancel={() => { start.current = null; setDx(0) }}
    >
      <div className="swipe-under">Save for later</div>
      <div className="swipe-top" style={{ transform: `translateX(${dx}px)`, transition: start.current == null ? 'transform .2s' : 'none' }}>
        {children}
      </div>
    </div>
  )
}

// Task checklist grouped by project. `groups` = [{ project, tasks }]
function TaskSelect({ groups, selected, onToggle, swipe }) {
  const [hidden, setHidden] = useState([])
  const later = (id) => {
    setHidden((h) => [...h, id])
    if (selected.includes(id)) onToggle(id)
  }
  return (
    <>
      {groups.map(({ project: p, tasks }) => (
        <section key={p.id} className="card task-group">
          <div className="task-group-head">
            <span className="row-title with-icon"><ClassIcon sub={p.subject} size={28} />{p.name}</span>
            <span className="muted sm">{p.subject.code}</span>
          </div>
          {tasks.filter((t) => !hidden.includes(t.id)).map((t) => {
            const row = (
              <div className="task-row">
                <span className="grow">{t.title}</span>
                <span className="task-meta">{t.mins}m</span>
                <CheckBox on={selected.includes(t.id)} onClick={() => onToggle(t.id)} label={`Include ${t.title}`} />
              </div>
            )
            return swipe
              ? <SwipeRow key={t.id} onSwipe={() => later(t.id)}>{row}</SwipeRow>
              : <div key={t.id} className="swipe-top">{row}</div>
          })}
          {tasks.length === 0 && <div className="swipe-top"><div className="task-row row-sub">No open tasks</div></div>}
        </section>
      ))}
      {hidden.length > 0 && (
        <button className="link-btn" onClick={() => setHidden([])}>
          <Undo2 size={14} /> Bring back {hidden.length} saved task{hidden.length > 1 ? 's' : ''}
        </button>
      )}
    </>
  )
}

function workSummary(tasks) {
  const mins = tasks.reduce((a, t) => a + t.mins, 0)
  return { mins, text: <>{tasks.length} task{tasks.length === 1 ? '' : 's'}, about <b>{fmt(mins)}</b> of work</> }
}

// Seed timing defaults from the chosen workload
function timingFor(draft, mins) {
  const t = TIMING[draft.timing]
  return {
    blocks: t.focus ? Math.max(1, Math.ceil(mins / t.focus)) : draft.blocks,
    setLength: Math.max(15, Math.ceil(mins / 5) * 5),
  }
}

function TimingStep({ step, total, next }) {
  const { s, setDraft } = useStore()
  const nav = useNavigate()
  const d = s.draft
  const len = sessionLength(d)
  const blocks = buildBlocks(d)
  const change = (dir) => {
    if (d.timing === 'set') setDraft({ setLength: Math.min(240, Math.max(10, d.setLength + dir * 5)) })
    else setDraft({ blocks: Math.min(8, Math.max(1, d.blocks + dir)) })
  }
  const focusCount = blocks.filter((b) => b.kind === 'focus').length
  const breakCount = blocks.filter((b) => b.kind === 'break').length

  return (
    <Screen className="flow">
      <Steps step={step} total={total} />
      <h1 className="flow-title">How do you want to time it?</h1>
      <div className="flow-body">
        <div className="grid-2">
          {Object.values(TIMING).map((t) => (
            <button key={t.id} className={`timing-card ${d.timing === t.id ? 'on' : ''}`} onClick={() => setDraft({ timing: t.id })} aria-pressed={d.timing === t.id}>
              <span className="radio" />
              <span className="row-title">{t.name}</span>
              <span className="row-sub">{t.desc}</span>
            </button>
          ))}
        </div>
        <section className="card total-card">
          <div className="row-between">
            <span className="label">Total session</span>
            {len != null ? (
              <span className="stepper">
                <button onClick={() => change(-1)} aria-label="Shorter"><Minus size={16} /></button>
                <b>{fmt(len)}</b>
                <button onClick={() => change(1)} aria-label="Longer"><Plus size={16} /></button>
              </span>
            ) : <b>Open-ended</b>}
          </div>
          <div className="timeline">
            {blocks.map((b, i) => (
              <span key={i} className={`tl ${b.kind}`} style={{ flex: b.kind === 'open' ? 1 : b.mins }} />
            ))}
          </div>
          <p className="row-sub">
            {d.timing === 'open' ? 'Timer counts up. Stop whenever you’re done.'
              : `${focusCount} focus block${focusCount > 1 ? 's' : ''}${breakCount ? `, ${breakCount} break${breakCount > 1 ? 's' : ''}` : ', no breaks'}`}
          </p>
        </section>
      </div>
      <div className="flow-foot">
        <button className="btn btn-primary" onClick={() => nav(next)}>Continue</button>
      </div>
    </Screen>
  )
}

function ReviewStep({ step, total, projects, tasks, edit }) {
  const { s, startSession, setDraft } = useStore()
  const nav = useNavigate()
  const len = sessionLength(s.draft)
  const t = TIMING[s.draft.timing]
  const EditBtn = ({ to }) => <button className="edit-btn" onClick={() => nav(to)}>Edit</button>

  return (
    <Screen className="flow">
      <Steps step={step} total={total} />
      <h1 className="flow-title">Ready to get started?</h1>
      <div className="flow-body">
        <section className="card review">
          <div className="review-sec">
            <div className="row-between"><span className="label">Projects</span><EditBtn to={edit.projects} /></div>
            {projects.map((p) => (
              <div key={p.id} className="review-line">
                <b>{p.name}</b>
                <span className="pill powder xs">{p.subject.code}</span>
              </div>
            ))}
          </div>
          <div className="review-sec">
            <div className="row-between"><span className="label">Tasks</span><EditBtn to={edit.tasks} /></div>
            {projects.map((p) => {
              const ts = tasks.filter((x) => x.p.id === p.id)
              return ts.length ? <div key={p.id} className="review-line"><b>{ts.map((x) => x.t.title).join(' · ')}</b></div> : null
            })}
          </div>
          <div className="review-sec">
            <div className="row-between"><span className="label">Timing</span><EditBtn to={edit.timing} /></div>
            <div className="review-line"><b>{t.name}{len ? ` · ${fmt(len)} total` : ' · counts up'}</b></div>
          </div>
          <div className="review-sec">
            <div className="row-between"><span className="label">Dock</span><EditBtn to="/dock" /></div>
            <div className="review-line"><b>{s.dock.name} · {s.dock.lock === 'strict' ? 'Strict' : 'Gentle'} lock</b></div>
          </div>
        </section>

        {/* Off by default: location is only shared when the student opts in */}
        <div className="share-row">
          <label className="share-check">
            <input
              type="checkbox"
              checked={s.draft.shareLocation}
              onChange={(e) => setDraft({ shareLocation: e.target.checked })}
            />
            <CheckBox on={s.draft.shareLocation} decorative />
            <span>Show friends where you’re working</span>
          </label>
          {s.draft.shareLocation && (
            <label className="share-place">
              <MapPin size={14} />
              <span className="sr-only">Study location</span>
              <select value={s.draft.location} onChange={(e) => setDraft({ location: e.target.value })}>
                {STUDY_SPOTS.map((spot) => <option key={spot} value={spot}>{spot}</option>)}
              </select>
            </label>
          )}
        </div>
      </div>
      <div className="flow-foot">
        <button
          className="btn btn-primary"
          disabled={!tasks.length}
          onClick={() => {
            startSession({
              projects: projects.map((p) => p.id),
              tasks: tasks.map((x) => x.t.id),
              timing: s.draft.timing,
              blocks: buildBlocks(s.draft),
              location: s.draft.shareLocation ? s.draft.location : null,
            })
            nav('/session/dock')
          }}
        >Start Session</button>
      </div>
    </Screen>
  )
}

/* ---------- Create (or edit) today's plan ---------- */

export function CreatePlan() {
  const { step } = useParams()
  return Number(step) === 2 ? <PlanTasks /> : <PlanProjects />
}

function PlanProjects() {
  const { s, togglePlanProject } = useStore()
  const nav = useNavigate()
  const count = s.planDraft.projects.length
  return (
    <Screen className="flow">
      <Steps step={1} total={2} />
      <h1 className="flow-title">{s.plan ? 'Edit today’s plan' : 'What do you want to work on today?'}</h1>
      <p className="muted sm">Pick one or more projects for today’s plan.</p>
      <div className="urgency-key" aria-hidden="true">
        <span><i className="urgent" />Under 12 hrs</span>
        <span><i className="soon" />Today</span>
        <span><i className="upcoming" />This week</span>
      </div>
      <div className="flow-body">
        <ProjectSelect selected={s.planDraft.projects} onToggle={togglePlanProject} />
      </div>
      <div className="flow-foot">
        <button className="btn btn-primary" disabled={!count} onClick={() => nav('/create/2')}>
          {count ? `Continue with ${count} project${count > 1 ? 's' : ''}` : 'Pick a project'}
        </button>
      </div>
    </Screen>
  )
}

function PlanTasks() {
  const { s, allProjects, setPlanDraft, savePlan } = useStore()
  const nav = useNavigate()
  const projects = allProjects(s).filter((p) => s.planDraft.projects.includes(p.id))
  const selected = s.planDraft.tasks ?? []
  const toggle = (id) => setPlanDraft({ tasks: selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id] })
  const chosen = projects.flatMap((p) => p.tasks).filter((t) => selected.includes(t.id))
  const sum = workSummary(chosen)

  return (
    <Screen className="flow">
      <Steps step={2} total={2} />
      <h1 className="flow-title">Set today’s tasks</h1>
      <p className="muted sm">Keep it realistic. Swipe a task left to save it for later.</p>
      <div className="flow-body">
        <TaskSelect
          swipe
          groups={projects.map((p) => ({ project: p, tasks: p.tasks.filter((t) => !t.done || selected.includes(t.id)) }))}
          selected={selected}
          onToggle={toggle}
        />
      </div>
      <div className="flow-foot">
        <p className="center sm">{sum.text}</p>
        <button
          className="btn btn-primary"
          disabled={!chosen.length}
          onClick={() => {
            savePlan({
              projects: projects.filter((p) => chosen.some((t) => p.tasks.includes(t))).map((p) => p.id),
              tasks: chosen.map((t) => t.id),
            })
            nav('/', { replace: true })
          }}
        >Finalize Plan</button>
      </div>
    </Screen>
  )
}

/* ---------- Start a session from today's plan ---------- */

export function PlanSession() {
  const { step } = useParams()
  const n = Number(step)
  const { s, allProjects, findTask } = useStore()
  // Sessions always start from a plan; without one, send the student to the dashboard
  if (!s.plan) return <Navigate to="/" replace />

  // Group the plan's open tasks under their projects
  const planTasks = s.plan.tasks.map((id) => findTask(s, id)).filter((x) => x && !x.t.done)
  const projects = allProjects(s).filter((p) => planTasks.some((x) => x.p.id === p.id))
  const groups = projects.map((p) => ({ project: p, tasks: planTasks.filter((x) => x.p.id === p.id).map((x) => x.t) }))
  const selected = (s.draft.tasks ?? []).filter((id) => planTasks.some((x) => x.t.id === id))

  if (n === 2) return <TimingStep step={2} total={3} next="/start/3" />
  if (n === 3) {
    const tasks = selected.map((id) => findTask(s, id)).filter(Boolean)
    return (
      <ReviewStep
        step={3} total={3}
        projects={projects.filter((p) => tasks.some((x) => x.p.id === p.id))}
        tasks={tasks}
        edit={{ projects: '/start/1', tasks: '/start/1', timing: '/start/2' }}
      />
    )
  }
  return <PickFromPlan groups={groups} selected={selected} all={planTasks.map((x) => x.t.id)} />
}

function PickFromPlan({ groups, selected, all }) {
  const { s, setDraft } = useStore()
  const nav = useNavigate()
  const allOn = all.length > 0 && all.every((id) => selected.includes(id))
  const toggle = (id) => setDraft({ tasks: selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id] })
  const chosen = groups.flatMap((g) => g.tasks).filter((t) => selected.includes(t.id))
  const sum = workSummary(chosen)

  return (
    <Screen className="flow">
      <Steps step={1} total={3} />
      <h1 className="flow-title">What are you working on?</h1>
      <div className="row-between">
        <p className="muted sm">Pick tasks from today’s plan.</p>
        <button className="chip-btn" onClick={() => setDraft({ tasks: allOn ? [] : all })}>
          {allOn ? 'Clear all' : 'Select all'}
        </button>
      </div>
      <div className="flow-body">
        {all.length === 0 ? (
          <section className="card center">
            <p className="row-title sm">Everything in today’s plan is done.</p>
            <p className="row-sub">Edit your plan to add more, or start a quick session.</p>
          </section>
        ) : (
          <TaskSelect groups={groups} selected={selected} onToggle={toggle} />
        )}
      </div>
      <div className="flow-foot">
        <p className="center sm">{sum.text}</p>
        <button
          className="btn btn-primary"
          disabled={!chosen.length}
          onClick={() => { setDraft({ ...timingFor(s.draft, sum.mins) }); nav('/start/2') }}
        >Continue</button>
      </div>
    </Screen>
  )
}
