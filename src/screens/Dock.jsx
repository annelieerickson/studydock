import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Radio } from 'lucide-react'
import { useStore } from '../store'
import { Screen, Sheet, TopBar } from '../components/ui'

const DEFAULTS = [
  { id: 'pomodoro', name: 'Pomodoro', sub: '25/5' },
  { id: 'deep', name: 'Deep work', sub: '50/10' },
  { id: 'open', name: 'Open timer', sub: 'Count up' },
]

export default function Dock() {
  const { s, setDock, setDraft } = useStore()
  const nav = useNavigate()
  const [form, setForm] = useState(s.dock)
  const [renaming, setRenaming] = useState(false)
  const [name, setName] = useState(s.dock.name)
  const dirty = JSON.stringify(form) !== JSON.stringify(s.dock)

  return (
    <Screen className="flow">
      <TopBar title="Dock setup" />
      <div className="flow-body">
        <section className="card dock-card">
          <span className="dock-thumb lg"><Radio size={24} /></span>
          <div className="grow">
            <div className="row-title">{form.name}</div>
            <div className="row-sub"><span className="ok">●</span> Connected</div>
          </div>
          <button className="chip-btn" onClick={() => { setName(form.name); setRenaming(true) }}>Rename</button>
        </section>

        <section className="card">
          <p className="label">Default timing</p>
          <div className="grid-3 tight">
            {DEFAULTS.map((d) => (
              <button key={d.id} className={`opt-card ${form.timing === d.id ? 'on' : ''}`} onClick={() => setForm({ ...form, timing: d.id })} aria-pressed={form.timing === d.id}>
                <b>{d.name}</b><span>{d.sub}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="card">
          <p className="label">Lock mode</p>
          {[
            { id: 'gentle', name: 'Gentle', sub: 'Lifting the phone pauses the timer' },
            { id: 'strict', name: 'Strict', sub: 'Lifting the phone ends the session early' },
          ].map((m) => (
            <button key={m.id} className={`radio-row ${form.lock === m.id ? 'on' : ''}`} onClick={() => setForm({ ...form, lock: m.id })} aria-pressed={form.lock === m.id}>
              <span className="radio" />
              <span className="grow"><span className="row-title sm block">{m.name}</span><span className="row-sub">{m.sub}</span></span>
            </button>
          ))}
        </section>
      </div>
      <div className="flow-foot">
        <button
          className="btn btn-primary"
          disabled={!dirty}
          onClick={() => { setDock(form); setDraft({ timing: form.timing }); nav(-1) }}
        >{dirty ? 'Save to dock' : 'Saved'}</button>
      </div>

      <Sheet open={renaming} onClose={() => setRenaming(false)} title="Rename dock">
        <input className="field" autoFocus value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn btn-primary" disabled={!name.trim()} onClick={() => { setForm({ ...form, name: name.trim() }); setRenaming(false) }}>Done</button>
      </Sheet>
    </Screen>
  )
}
