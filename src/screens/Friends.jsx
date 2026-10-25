import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Search, Trophy, UserPlus } from 'lucide-react'
import { useStore } from '../store'
import { fmt } from '../data'
import { Avatar, Screen, Segmented, Toast, TopBar } from '../components/ui'

export function FriendsList() {
  const { s } = useStore()
  const [tab, setTab] = useState('friends')
  const studying = s.friends.filter((f) => f.studying)
  const idle = s.friends.filter((f) => !f.studying)
  const n = s.requests.length

  const me = { id: 'me', name: s.profile.first + ' (you)', color: s.profile.color, img: s.profile.img, weekMins: 520 + s.todayMins, me: true }
  const board = [...s.friends, me].sort((a, b) => b.weekMins - a.weekMins)

  return (
    <Screen tabs>
      <header className="page-head">
        <h1 className="display">Friends</h1>
        <Link to="/friends/add" className="icon-btn round" aria-label="Add friends"><UserPlus size={20} /></Link>
      </header>
      <Segmented value={tab} onChange={setTab} options={[{ value: 'friends', label: 'My friends' }, { value: 'board', label: 'Leaderboard' }]} />

      {tab === 'friends' ? (
        <>
          {n > 0 && (
            <Link to="/friends/add" className="card banner-row">
              <span className="badge-num">{n}</span>
              <span className="grow">{n} friend request{n > 1 ? 's' : ''} waiting</span>
              <ChevronRight size={18} />
            </Link>
          )}
          <h3 className="section-title caps"><span className="dot-live" /> Studying now: {studying.length}</h3>
          <section className="card list">
            {studying.map((f) => (
              <div key={f.id} className="person-row">
                <Avatar name={f.name} color={f.color} img={f.img} size={52} />
                <div className="grow">
                  <div className="row-title sm">{f.name}</div>
                  <div className="row-sub">{f.subject} · {fmt(f.mins)}</div>
                </div>
                <span className="pill powder xs">Focusing</span>
              </div>
            ))}
          </section>
          <h3 className="section-title caps">Not studying</h3>
          <section className="card list">
            {idle.map((f) => (
              <div key={f.id} className="person-row">
                <Avatar name={f.name} color={f.color} img={f.img} size={52} />
                <div className="grow">
                  <div className="row-title sm">{f.name}</div>
                  <div className="row-sub">{f.last}</div>
                </div>
              </div>
            ))}
          </section>
        </>
      ) : (
        <>
          <p className="muted sm">Hours studied this week. Resets Monday.</p>
          <div className="podium">
            {[board[1], board[0], board[2]].filter(Boolean).map((f) => {
              const place = board.indexOf(f) + 1
              return (
                <div key={f.id} className={`podium-spot p${place}`}>
                  <Avatar name={f.name.replace(' (you)', '')} color={f.color} img={f.img} size={place === 1 ? 64 : 52} />
                  <span className="sm"><b>{f.name}</b></span>
                  <span className="podium-block">{place === 1 ? <Trophy size={18} /> : place}</span>
                </div>
              )
            })}
          </div>
          <section className="card list">
            {board.map((f, i) => (
              <div key={f.id} className={`person-row ${f.me ? 'me' : ''}`}>
                <span className="rank">{i + 1}</span>
                <Avatar name={f.name.replace(' (you)', '')} color={f.color} img={f.img} size={40} />
                <span className="grow row-title sm">{f.name}</span>
                <span className="row-time">{fmt(f.weekMins)}</span>
              </div>
            ))}
          </section>
        </>
      )}
    </Screen>
  )
}

export function AddFriends() {
  const { s, acceptRequest, declineRequest, cancelSent, sendRequest } = useStore()
  const [handle, setHandle] = useState('')
  const [toast, setToast] = useState('')
  const flash = (t) => { setToast(t); setTimeout(() => setToast(''), 1800) }

  return (
    <Screen>
      <TopBar title="Add friends" />
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!handle.trim()) return
          sendRequest(handle.trim())
          flash(`Request sent to @${handle.trim().replace(/^@/, '')}`)
          setHandle('')
        }}
      >
        <label className="label" htmlFor="handle">Search by username</label>
        <div className="search-field">
          <Search size={18} />
          <input id="handle" placeholder="@username" value={handle} onChange={(e) => setHandle(e.target.value)} autoCapitalize="none" />
          {handle && <button className="chip-btn solid">Send</button>}
        </div>
      </form>

      <h3 className="section-title">Requests for you</h3>
      <section className="card list">
        {s.requests.length === 0 && <div className="row-sub center pad">You’re all caught up.</div>}
        {s.requests.map((r) => (
          <div key={r.id} className="person-row">
            <Avatar name={r.name} color={r.color} size={52} />
            <div className="grow">
              <div className="row-title sm">{r.name}</div>
              <div className="row-sub">{r.handle}</div>
            </div>
            <button className="icon-btn soft" aria-label={`Decline ${r.name}`} onClick={() => declineRequest(r.id)}>✕</button>
            <button className="chip-btn solid" onClick={() => { acceptRequest(r.id); flash(`You and ${r.name} are now friends`) }}>Accept</button>
          </div>
        ))}
      </section>

      <h3 className="section-title">Sent</h3>
      <section className="card list">
        {s.sent.length === 0 && <div className="row-sub center pad">No pending requests.</div>}
        {s.sent.map((r) => (
          <div key={r.id} className="person-row">
            <Avatar name={r.name} color={r.color} size={52} />
            <div className="grow">
              <div className="row-title sm">{r.name}</div>
              <div className="row-sub">{r.note}</div>
            </div>
            <button className="chip-btn" onClick={() => cancelSent(r.id)}>Cancel</button>
          </div>
        ))}
      </section>
      <Toast text={toast} />
    </Screen>
  )
}
