import { createContext, useContext, useMemo, useState } from 'react'
import { SUBJECTS, FRIENDS, REQUESTS, SENT, HISTORY, TIMING } from './data'

const Ctx = createContext(null)

const clone = (x) => JSON.parse(JSON.stringify(x))

function initialState() {
  return {
    subjects: clone(SUBJECTS),
    friends: clone(FRIENDS),
    requests: clone(REQUESTS),
    sent: clone(SENT),
    history: clone(HISTORY),
    profile: {
      name: 'Annie Erickson',
      first: 'Annie',
      handle: 'aericks',
      img: 'avatar-annie.png',
      color: '#3E4B8E',
      totalMins: 142 * 60 + 30,
      sessions: 96,
      streak: 12,
      bestStreak: 19,
    },
    dock: { name: 'Desk Dock', connected: true, timing: 'pomodoro', lock: 'gentle' },
    todayMins: 0,
    sessionDoneToday: false,
    // Today's plan (projects + tasks): null until the user finalizes one
    plan: null,
    planDraft: { projects: [], tasks: null },
    // The session about to start / running: projects, tasks, timing, blocks
    session: null,
    paused: false,
    // Session setup draft (used by both session flows)
    draft: { projects: ['ps7', 'p1b'], tasks: null, timing: 'pomodoro', blocks: 4, setLength: 60 },
  }
}

export function StoreProvider({ children }) {
  const [s, setS] = useState(initialState)

  const api = useMemo(() => {
    const update = (fn) => setS((prev) => {
      const next = clone(prev)
      fn(next)
      return next
    })

    const allProjects = (state) =>
      state.subjects.flatMap((sub) => sub.projects.map((p) => ({ ...p, subject: sub })))

    const findTask = (state, taskId) => {
      for (const sub of state.subjects)
        for (const p of sub.projects)
          for (const t of p.tasks) if (t.id === taskId) return { t, p, sub }
      return null
    }

    return {
      allProjects,
      findTask,
      reset: () => setS(initialState()),
      toggleTask: (taskId) => update((d) => {
        const hit = findTask(d, taskId)
        if (hit) hit.t.done = !hit.t.done
      }),
      addTask: (projectId, title) => update((d) => {
        for (const sub of d.subjects) for (const p of sub.projects)
          if (p.id === projectId) p.tasks.push({ id: `${projectId}-${Date.now()}`, title, mins: 20, done: false })
      }),
      addProject: (subjectId, name) => update((d) => {
        const sub = d.subjects.find((x) => x.id === subjectId)
        sub.projects.push({ id: `p-${Date.now()}`, name, minutes: 0, sessions: 0, dueHrs: null, active: true, tasks: [] })
      }),
      setDraft: (patch) => update((d) => { Object.assign(d.draft, patch) }),
      setPlanDraft: (patch) => update((d) => { Object.assign(d.planDraft, patch) }),
      togglePlanProject: (id) => update((d) => {
        const list = d.planDraft.projects
        const adding = !list.includes(id)
        d.planDraft.projects = adding ? [...list, id] : list.filter((x) => x !== id)
        if (d.planDraft.tasks) {
          const proj = d.subjects.flatMap((x) => x.projects).find((p) => p.id === id)
          const ids = proj.tasks.map((t) => t.id)
          // A newly added project's tasks start unchecked
          if (!adding) d.planDraft.tasks = d.planDraft.tasks.filter((t) => !ids.includes(t))
        }
      }),
      // Load the saved plan into the draft so it can be edited
      beginPlanEdit: () => update((d) => {
        d.planDraft = d.plan ? clone(d.plan) : { projects: [], tasks: null }
      }),
      savePlan: (plan) => update((d) => { d.plan = plan }),
      // Start a session from today's plan with no tasks checked yet
      beginPlanSession: () => update((d) => {
        if (!d.plan) return
        d.draft.tasks = []
        d.draft.timing = d.dock.timing === 'open' ? 'open' : d.dock.timing
      }),
      toggleDraftProject: (id) => update((d) => {
        const list = d.draft.projects
        d.draft.projects = list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
        d.draft.tasks = null // re-derive tasks from the new project list
      }),
      setDock: (patch) => update((d) => { Object.assign(d.dock, patch) }),
      setProfile: (patch) => update((d) => { Object.assign(d.profile, patch) }),
      acceptRequest: (id) => update((d) => {
        const r = d.requests.find((x) => x.id === id)
        d.requests = d.requests.filter((x) => x.id !== id)
        if (r) d.friends.push({ id: r.id, name: r.name, studying: false, last: 'Just added', color: r.color, weekMins: 0 })
      }),
      declineRequest: (id) => update((d) => { d.requests = d.requests.filter((x) => x.id !== id) }),
      cancelSent: (id) => update((d) => { d.sent = d.sent.filter((x) => x.id !== id) }),
      sendRequest: (handle) => update((d) => {
        const name = handle.replace(/^@/, '')
        d.sent.unshift({ id: `s-${Date.now()}`, name: '@' + name, note: 'Pending, sent just now', color: '#A6BCC9' })
      }),
      // countedSec = focus seconds already added to today's total (from an earlier pause)
      startSession: (session) => update((d) => { d.session = { ...session, elapsed: 0, countedSec: 0 }; d.paused = false }),
      // Leave a session partway: bank the focus time so far and remember where the timer was
      pauseSession: ({ elapsed, focusSec }) => update((d) => {
        if (!d.session) return
        const addMins = Math.max(0, (focusSec - d.session.countedSec) / 60)
        d.todayMins += addMins
        d.profile.totalMins += addMins
        d.session.countedSec = focusSec
        d.session.elapsed = elapsed
        d.paused = true
      }),
      resumeSession: () => update((d) => { d.paused = false }),
      finishSession: ({ mins, label, mode, doneTasks }) => update((d) => {
        const m = Math.max(0, Math.round(mins))
        d.todayMins += m
        d.profile.totalMins += m
        d.profile.sessions += 1
        if (!d.sessionDoneToday) {
          d.profile.streak += 1
          d.profile.bestStreak = Math.max(d.profile.bestStreak, d.profile.streak)
        }
        d.sessionDoneToday = true
        for (const id of doneTasks) { const hit = findTask(d, id); if (hit) hit.t.done = true }
        if (d.session) for (const id of d.session.projects) {
          for (const sub of d.subjects) for (const p of sub.projects) if (p.id === id) {
            p.minutes += m / d.session.projects.length
            p.sessions += 1
          }
        }
        const now = new Date()
        d.history.unshift({
          id: `h-${Date.now()}`, day: 'Today',
          time: now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
          mins: m, label, mode,
        })
        d.session = null
        d.paused = false
      }),
    }
  }, [])

  return <Ctx.Provider value={{ s, ...api }}>{children}</Ctx.Provider>
}

export const useStore = () => useContext(Ctx)

// Total planned minutes for a timing choice
export function sessionLength(draft) {
  const t = TIMING[draft.timing]
  if (draft.timing === 'set') return draft.setLength
  if (draft.timing === 'open') return null
  return draft.blocks * t.focus + (draft.blocks - 1) * t.rest
}

export function buildBlocks(draft) {
  const t = TIMING[draft.timing]
  if (draft.timing === 'set') return [{ kind: 'focus', mins: draft.setLength }]
  if (draft.timing === 'open') return [{ kind: 'open', mins: 0 }]
  const out = []
  for (let i = 0; i < draft.blocks; i++) {
    out.push({ kind: 'focus', mins: t.focus })
    if (i < draft.blocks - 1) out.push({ kind: 'break', mins: t.rest })
  }
  return out
}
