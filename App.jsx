import { useState, useEffect, useRef } from 'react'
import { schedule, insights, PRI, toHM } from './engine.js'
import './styles.css'

const KEY = 'lifeos-v1', GOAL = 60
const pad = (n) => String(n).padStart(2, '0')
const day = (d = new Date()) => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10)
const ago = (n) => day(new Date(Date.now() - n * 864e5))
const fmt = (s) => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`
const hm = (m) => `${Math.floor(m / 60)}h ${m % 60}m`
const uid = () => Math.random().toString(36).slice(2, 9)
const sum = (a) => a.reduce((x, y) => x + y, 0)
const SUBJ = ['Mathematics', 'Programming', 'Reading', 'Science']
const COL = ['#8b5cf6', '#22d3ee', '#3b82f6', '#f472b6']
const FR = [
  { n: 'Maya', e: '🦋', c: '#a78bfa', m: 620, s: 12, x: 2410 }, { n: 'Leo', e: '🦊', c: '#22d3ee', m: 540, s: 7, x: 1980 },
  { n: 'Sara', e: '🌸', c: '#f472b6', m: 480, s: 9, x: 1760 }, { n: 'Dawit', e: '🚀', c: '#60a5fa', m: 390, s: 4, x: 1330 },
  { n: 'Hana', e: '🐼', c: '#34d399', m: 300, s: 3, x: 960 },
]
const NAV = [['overview', 'Overview', '🏠'], ['focus', 'Focus', '⏱️'], ['rooms', 'Study Rooms', '📚'], ['community', 'Community', '💬'], ['plan', 'My Plan', '🗓️'], ['challenges', 'Challenges', '🏆'], ['leaderboard', 'Leaderboard', '📊'], ['stats', 'Statistics', '📈'], ['coach', 'AI Coach', '🧠']]
const ROOMS = [
  { id: 'r1', n: 'Late Night Library', sub: 'Reading', m: [0, 1, 2, 4], e: '🌙' }, { id: 'r2', n: 'Programming Zone', sub: 'Programming', m: [1, 3, 4], e: '💻' },
  { id: 'r3', n: 'Exam Preparation Room', sub: 'Mathematics', m: [0, 2, 3], e: '📝' }, { id: 'r4', n: 'Silent Study Hall', sub: 'Science', m: [2, 4], e: '🤫' },
  { id: 'r5', n: 'Deep Work Lounge', sub: 'Programming', m: [0, 1, 3, 4], e: '🌊' },
]
const CH = [
  { id: 'c1', t: 'Weekend Study Challenge', goal: 300, left: '2d 4h', o: [['Maya', 210], ['Leo', 150], ['Sara', 90]] },
  { id: 'c2', t: '10-Hour Weekly Focus', goal: 600, left: '4d 11h', o: [['Maya', 380], ['Dawit', 300], ['Hana', 120]] },
  { id: 'c3', t: 'First to 5 Hours', goal: 300, left: '6d', o: [['Leo', 200], ['Sara', 140]] },
  { id: 'c4', t: 'Daily 2-Hour Challenge', goal: 120, left: '9h', o: [['Sara', 75], ['Hana', 50], ['Maya', 100]] },
  { id: 'c5', t: 'Programming Marathon', goal: 480, left: '5d', sub: 'Programming', o: [['Leo', 330], ['Dawit', 260]] },
]
const BADGES = [
  ['First Focus', '🌱', (d, s) => d.sessions.length > 0], ['3-Day Streak', '🔥', (d, s) => s.streak >= 3], ['7-Day Streak', '⚡', (d, s) => s.streak >= 7],
  ['10 Hours', '⏳', (d, s) => s.total >= 600], ['Level 3', '👑', (d, s) => s.lvl >= 3], ['Social Star', '⭐', (d) => d.posts.some((p) => p.me)],
]

const seed = () => ({
  user: { name: 'Edom', e: '🍄', c: '#8b5cf6' }, xp: 380, coins: 95, active: null, last: null, room: null, sched: null, lock: null, joined: {}, chProg: {},
  sessions: [[1, 'Programming', 50], [2, 'Mathematics', 25], [2, 'Reading', 50], [3, 'Science', 90], [4, 'Programming', 50], [5, 'Mathematics', 25], [6, 'Reading', 50]].map(([d, subject, mins]) => ({ id: uid(), subject, mins, date: ago(d), shared: true })),
  tasks: [['Finish calculus problem set', 'High', 60, true], ['Review React hooks notes', 'High', 45], ['Read biology chapter 4', 'Medium', 40], ['Plan weekend project', 'Low', 20], ['Practice DSA: two pointers', 'Medium', 50]].map(([title, pri, dur, done]) => ({ id: uid(), title, pri, dur, done: !!done, rw: !!done, date: day() })),
  goals: [{ id: uid(), t: 'Focus 10 hours this week', done: false }, { id: uid(), t: 'Finish the DSA roadmap', done: false }],
  habits: [{ id: uid(), t: 'Morning review', log: [ago(1), ago(2)] }],
  prefs: { sound: true },
  posts: [
    { id: 'p1', u: 'Maya', sub: 'Biology', mins: 120, msg: 'Maya completed 2 hours of Biology! 📚🔥', ago: '2h ago', likes: 14, comments: [{ u: 'Leo', t: 'Beast mode!' }] },
    { id: 'p2', u: 'Leo', sub: 'Programming', mins: 90, msg: 'Shipped a feature during a 90-minute deep work block 🚀', ago: '4h ago', likes: 9, comments: [] },
    { id: 'p3', u: 'Sara', sub: 'Mathematics', mins: 50, msg: 'Integrals finally clicked. Streak day 9! 🌸', ago: '6h ago', likes: 21, comments: [{ u: 'Hana', t: 'Congrats Sara 🎉' }] },
    { id: 'p4', u: 'Dawit', sub: 'Reading', mins: 25, msg: 'Quick reading sprint before class 📖', ago: 'Yesterday', likes: 5, comments: [] },
  ],
})
const load = () => { try { return { ...seed(), ...JSON.parse(localStorage.getItem(KEY)) } } catch { return seed() } }
const remaining = (a) => (a ? Math.max(0, Math.round(a.total * 60 - (a.base + (a.run ? (Date.now() - a.t0) / 1000 : 0)))) : 0)
const frOf = (n) => FR.find((f) => f.n === n) || { e: '🙂', c: '#64748b' }

function derive(d) {
  const today = day(), days = new Set(d.sessions.map((s) => s.date))
  let st = 0, i = days.has(today) ? 0 : 1
  while (days.has(ago(i))) { st++; i++ }
  const wk = [...Array(7)].map((_, k) => { const dt = ago(6 - k); return { dt, l: new Date(dt + 'T12:00').toLocaleDateString('en', { weekday: 'short' }), m: sum(d.sessions.filter((s) => s.date === dt).map((s) => s.mins)) } })
  return { today: sum(d.sessions.filter((s) => s.date === today).map((s) => s.mins)), total: sum(d.sessions.map((s) => s.mins)), streak: st, wk, days, lvl: Math.floor(d.xp / 200) + 1, xpIn: d.xp % 200 }
}

const Av = ({ f, s = 34 }) => <span className="av" style={{ width: s, height: s, fontSize: s * 0.5, background: `linear-gradient(135deg,${f.c || '#8b5cf6'},#1e293b)` }}>{f.e}</span>
const Sim = () => <span className="sim">Simulated</span>
const Bar = ({ p, c }) => <div className="bar"><i style={{ width: Math.min(100, p * 100) + '%', background: c }} /></div>
function Ring({ p, size = 120, sw = 10, children }) {
  const r = (size - sw) / 2, c = 2 * Math.PI * r
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8b5cf6" /><stop offset="1" stopColor="#22d3ee" /></linearGradient></defs>
        <circle cx={size / 2} cy={size / 2} r={r} className="rt" strokeWidth={sw} />
        <circle cx={size / 2} cy={size / 2} r={r} className="rp" strokeWidth={sw} stroke="url(#g)" strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, p))} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div className="rc">{children}</div>
    </div>
  )
}

export default function App() {
  const [db, setDb] = useState(load), dbRef = useRef(db)
  const [page, setPage] = useState('overview'), [toasts, setT] = useState([]), [, tick] = useState(0), [boot, setBoot] = useState(true)
  const upd = (fn) => { const n = fn(dbRef.current); dbRef.current = n; setDb(n) }
  const toast = (m) => { const id = uid(); setT((t) => [...t, { id, m }]); setTimeout(() => setT((t) => t.filter((x) => x.id !== id)), 3200) }
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(db)) } catch { /* storage full */ } }, [db])
  useEffect(() => { const b = setTimeout(() => setBoot(false), 700); return () => clearTimeout(b) }, [])

  // Time is computed from timestamps (Date.now - t0 + base), never by decrementing a counter.
  const finish = () => {
    const d = dbRef.current, a = d.active
    if (!a) return // guard: rewards can only be granted once per session
    const today = day(), before = sum(d.sessions.filter((s) => s.date === today).map((s) => s.mins))
    const bonus = before < GOAL && before + a.total >= GOAL ? 30 : 0, xp = 20 + bonus, coins = Math.round(a.total / 5)
    const s = { id: uid(), subject: a.subject, mins: a.total, date: today, shared: false }
    const chProg = { ...d.chProg }
    CH.forEach((c) => { if (d.joined[c.id] && (!c.sub || c.sub === a.subject)) chProg[c.id] = (chProg[c.id] || 0) + a.total })
    const lvlUp = Math.floor((d.xp + xp) / 200) > Math.floor(d.xp / 200)
    upd((x) => ({ ...x, active: null, sessions: [...x.sessions, s], xp: x.xp + xp, coins: x.coins + coins, chProg, last: { ...s, xp, coins, bonus, lvlUp } }))
    toast(`Session complete! +${xp} XP · +${coins} coins`)
  }
  useEffect(() => {
    const i = setInterval(() => { tick((x) => x + 1); const a = dbRef.current.active; if (a && a.run && remaining(a) <= 0) finish() }, 500)
    return () => clearInterval(i)
  }, [])
  const c = {
    db, upd, toast, s: derive(db), finish, go: setPage,
    start: (subject, mins, room) => { if (dbRef.current.active) return toast('A session is already running'); upd((d) => ({ ...d, active: { subject, total: mins, base: 0, t0: Date.now(), run: true, room: room || null } })); toast(`Focus started: ${subject} · ${mins} min`) },
    pause: () => upd((d) => ({ ...d, active: { ...d.active, base: d.active.base + (Date.now() - d.active.t0) / 1000, run: false } })),
    resume: () => upd((d) => ({ ...d, active: { ...d.active, t0: Date.now(), run: true } })),
    end: () => { upd((d) => ({ ...d, active: null })); toast('Session ended — no rewards for unfinished sessions') },
  }
  const Page = { overview: Overview, focus: Focus, rooms: Rooms, community: Community, plan: Plan, challenges: Challenges, leaderboard: Leaderboard, stats: Stats, coach: Coach }[page]
  if (boot) return <div className="boot"><div className="logo big">◉</div><p>Loading LifeOS…</p></div>
  return (
    <div className="app">
      <aside className="side">
        <div className="brand"><span className="logo">◉</span><div><b>LifeOS</b><small>Focus Together. Grow Together.</small></div></div>
        <nav>{NAV.map(([k, l, i]) => <button key={k} className={page === k ? 'on' : ''} onClick={() => setPage(k)}><span>{i}</span><em>{l}</em></button>)}</nav>
        <div className="me" onClick={() => { const n = prompt('Your username', db.user.name); if (n) upd((d) => ({ ...d, user: { ...d.user, name: n.slice(0, 16) } })) }} title="Click to rename">
          <Av f={db.user} s={38} /><div><b>{db.user.name}</b><small>Lv {c.s.lvl} · {db.coins} 🪙</small></div>
        </div>
        <button className="ghost sm" onClick={() => { if (confirm('Reset all demo data?')) { upd(() => seed()); toast('Demo data reset') } }}>↺ Reset demo data</button>
      </aside>
      <main><Page c={c} /></main>
      {db.last && !db.last.seen && <Complete c={c} />}
      <div className="toasts">{toasts.map((t) => <div key={t.id} className="toast">{t.m}</div>)}</div>
    </div>
  )
}

function Timer({ c, size = 250, room }) {
  const { db, start, pause, resume, end, finish } = c, a = db.active
  const [sub, setSub] = useState(room?.sub || 'Programming'), [m, setM] = useState(25)
  const rem = remaining(a)
  return (
    <div className="timer">
      <Ring p={a ? 1 - rem / (a.total * 60) : 0} size={size} sw={14}>
        <div className="time">{fmt(a ? rem : m * 60)}</div><small>{a ? (a.run ? 'Focusing · ' + a.subject : 'Paused') : 'Ready'}</small>
      </Ring>
      {!a ? (
        <>
          <div className="chips">{SUBJ.map((s) => <button key={s} className={sub === s ? 'chip on' : 'chip'} onClick={() => setSub(s)}>{s}</button>)}</div>
          <div className="chips">{[25, 50, 90].map((x) => <button key={x} className={m === x ? 'chip on' : 'chip'} onClick={() => setM(x)}>{x} min</button>)}</div>
          <button className="cta" onClick={() => start(sub, m, room?.n)}>▶ Start Focusing</button>
        </>
      ) : (
        <div className="row">
          {a.run ? <button className="btn" onClick={pause}>⏸ Pause</button> : <button className="btn" onClick={resume}>▶ Resume</button>}
          <button className="ghost" onClick={end}>■ End</button>
          <button className="ghost" onClick={finish} title="Demo shortcut so judges don't wait 25 minutes">⏭ Finish now (demo)</button>
        </div>
      )}
    </div>
  )
}

function Complete({ c }) {
  const { db, upd } = c, l = db.last
  const [cf] = useState(() => [...Array(36)].map((_, i) => ({ l: Math.random() * 100, d: Math.random() * 0.8, b: COL[i % 4] })))
  const close = () => upd((d) => ({ ...d, last: { ...d.last, seen: true } }))
  return (
    <div className="modal"><div className="confetti">{cf.map((x, i) => <i key={i} style={{ left: x.l + '%', background: x.b, animationDelay: x.d + 's' }} />)}</div>
      <div className="card pop">
        <h2>🎉 Session complete!</h2><p>{l.mins} min of {l.subject}</p>
        <div className="grid3"><div className="stat"><b>+{l.xp}</b><small>XP{l.bonus ? ' (incl. daily goal bonus!)' : ''}</small></div><div className="stat"><b>+{l.coins}</b><small>coins</small></div><div className="stat"><b>{c.s.streak}🔥</b><small>day streak</small></div></div>
        {l.lvlUp && <p className="good">⬆ Level up! You're now level {c.s.lvl}</p>}
        <ShareBox c={c} session={db.sessions.find((s) => s.id === l.id)} onDone={close} />
        <button className="ghost" onClick={close}>Close</button>
      </div></div>
  )
}

function ShareBox({ c, session, onDone }) {
  const { upd, toast, db } = c, [cap, setCap] = useState(''), [priv, setPriv] = useState(false), [img, setImg] = useState(null)
  if (!session) return <p className="muted">No unshared session yet — finish a focus session first.</p>
  const pick = (e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => setImg(r.result); r.readAsDataURL(f) }
  const go = () => {
    if (session.shared) return // prevents duplicate posts
    upd((d) => ({
      ...d, sessions: d.sessions.map((s) => (s.id === session.id ? { ...s, shared: priv ? 'private' : true } : s)),
      posts: priv ? d.posts : [{ id: uid(), me: true, u: d.user.name, sub: session.subject, mins: session.mins, msg: cap || `${d.user.name} completed ${session.mins} min of ${session.subject}! 🔥`, ago: 'Just now', likes: 0, comments: [], img }, ...d.posts],
    }))
    toast(priv ? 'Session kept private 🔒' : 'Shared to the community! 🎉'); onDone && onDone()
  }
  return (
    <div className="share">
      <input placeholder="Add a caption…" value={cap} maxLength={140} onChange={(e) => setCap(e.target.value)} />
      <label className="file">📷 Add photo<input type="file" accept="image/*" onChange={pick} hidden /></label>
      {img && <img className="prev" src={img} alt="preview" />}
      <label className="chk"><input type="checkbox" checked={priv} onChange={(e) => setPriv(e.target.checked)} /> Keep this session private</label>
      <button className="btn" onClick={go}>{priv ? 'Save privately' : 'Share session'} → {db.user.name}</button>
    </div>
  )
}

const Head = ({ t, sub, children }) => <header className="head"><div><h1>{t}</h1><p>{sub}</p></div>{children}</header>

function Overview({ c }) {
  const { db, s, go } = c, a = db.active, done = db.tasks.filter((t) => t.date === day() && t.done).length, all = db.tasks.filter((t) => t.date === day()).length
  return (
    <>
      <Head t={`Welcome back, ${db.user.name} 👋`} sub={new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}>
        <button className="cta" onClick={() => go('focus')}>▶ Start Focusing</button>
      </Head>
      <div className="grid4">
        <div className="card stat"><b>{s.streak}🔥</b><small>Day streak</small></div><div className="card stat"><b>{s.total}</b><small>Total focus minutes</small></div>
        <div className="card stat"><b>{db.coins}🪙</b><small>Coins</small></div>
        <div className="card stat"><b>Lv {s.lvl}</b><small>{s.xpIn}/200 XP</small><Bar p={s.xpIn / 200} c="linear-gradient(90deg,#8b5cf6,#22d3ee)" /></div>
      </div>
      <div className="grid2">
        <div className="card"><h3>Daily progress</h3><div className="row"><Ring p={s.today / GOAL} size={130}><b>{s.today}</b><small>/ {GOAL} min</small></Ring>
          <div><p>✅ {done}/{all} tasks completed today</p><Bar p={all ? done / all : 0} c="#22d3ee" /><p className="muted">Hit {GOAL} min today for +30 XP bonus.</p></div></div></div>
        <div className="card"><h3>Current focus session</h3>{a ? <><div className="time sm">{fmt(remaining(a))}</div><p>{a.subject} · {a.run ? 'running' : 'paused'}</p><button className="btn" onClick={() => go('focus')}>Open timer</button></> : <><p className="muted">No active session.</p><button className="btn" onClick={() => go('focus')}>Start one</button></>}</div>
      </div>
      <div className="grid3">
        <div className="card"><h3>Friends focusing now <Sim /></h3>{FR.slice(0, 4).map((f, i) => <div className="li" key={f.n}><Av f={f} /><b>{f.n}</b><small>{SUBJ[i % 4]}</small><span className="dot" /></div>)}</div>
        <div className="card"><h3>Recent activity</h3>{db.posts.slice(0, 3).map((p) => <div className="li" key={p.id}><Av f={p.me ? db.user : frOf(p.u)} /><small>{p.msg}</small></div>)}<button className="ghost sm" onClick={() => go('community')}>Open feed</button></div>
        <div className="card"><h3>Upcoming challenges</h3>{CH.slice(0, 3).map((x) => <div className="li" key={x.id}><b>{x.t}</b><small>{x.left}</small></div>)}<button className="ghost sm" onClick={() => go('challenges')}>View all</button></div>
      </div>
      <div className="card"><h3>Achievements</h3><div className="badges">{BADGES.map(([n, i, f]) => <div key={n} className={'badge' + (f(db, s) ? ' got' : '')}><span>{i}</span><small>{n}</small></div>)}</div></div>
    </>
  )
}

function Focus({ c }) {
  const { s } = c
  return (
    <>
      <Head t="Focus" sub="Pick a subject and a duration, then go deep." />
      <div className="grid2"><div className="card center"><Timer c={c} size={300} /></div>
        <div className="card"><h3>Today</h3><p>{s.today} min focused · {s.streak}🔥 streak</p><Bar p={s.today / GOAL} c="linear-gradient(90deg,#8b5cf6,#22d3ee)" />
          <h3>Weekly streak</h3><div className="week">{s.wk.map((d) => <div key={d.dt} className={'day' + (d.m ? ' on' : '')}><small>{d.l}</small><b>{d.m ? '✓' : '·'}</b></div>)}</div>
          <p className="muted">Rewards: +20 XP and 1 coin per 5 min per completed session. Daily goal bonus: +30 XP.</p></div></div>
    </>
  )
}

function Rooms({ c }) {
  const { db, upd, toast } = c, room = ROOMS.find((r) => r.id === db.room)
  const [msgs, setMsgs] = useState([]), [txt, setTxt] = useState(''), [cam, setCam] = useState(false), [mic, setMic] = useState(false)
  useEffect(() => { if (room) setMsgs([{ u: FR[room.m[0]].n, t: `Welcome to ${room.n}! Let's focus 🎯` }]) }, [db.room])
  if (!room) return (
    <>
      <Head t="Study Rooms" sub="Focus Together — rooms are simulated for this demo (no real-time multiplayer or video).">{<Sim />}</Head>
      <div className="grid3">{ROOMS.map((r) => (
        <div className="card room" key={r.id}><h3>{r.e} {r.n}</h3><p className="muted">{r.sub}</p><p>{r.m.length} focusing</p>
          <div className="stack">{r.m.map((i) => <Av key={i} f={FR[i]} />)}</div>
          <button className="btn" onClick={() => { upd((d) => ({ ...d, room: r.id })); toast(`Joined ${r.n}`) }}>Join Room</button></div>))}</div>
    </>
  )
  const send = (e) => {
    e.preventDefault(); if (!txt.trim()) return
    const m = FR[room.m[Math.floor(Math.random() * room.m.length)]].n, R = ['Nice, keep going! 🔥', 'Break at the next 25?', 'Locked in 🔒', 'You got this 💪']
    setMsgs((x) => [...x, { u: db.user.name, t: txt, me: 1 }]); setTxt('')
    setTimeout(() => setMsgs((x) => [...x, { u: m, t: R[Math.floor(Math.random() * R.length)] }]), 1200)
  }
  return (
    <>
      <Head t={`${room.e} ${room.n}`} sub={`${room.sub} · ${room.m.length + 1} focusing`}><button className="ghost" onClick={() => { upd((d) => ({ ...d, room: null })); toast('Left the room') }}>Leave room</button></Head>
      <div className="grid2">
        <div className="card center"><Timer c={c} room={room} size={260} />
          <div className="row"><button className={cam ? 'btn' : 'ghost'} onClick={() => setCam(!cam)}>{cam ? '📹 Camera on' : '📷 Camera off'}</button><button className={mic ? 'btn' : 'ghost'} onClick={() => setMic(!mic)}>{mic ? '🎙 Mic on' : '🔇 Muted'}</button></div>
          <p className="muted">Camera/mic buttons are visual only — no video is captured or sent.</p></div>
        <div className="card"><h3>Participants <Sim /></h3>
          <div className="li"><Av f={db.user} /><b>{db.user.name} (you)</b><small>{db.active ? (db.active.run ? 'Focusing' : 'Paused') : 'Idle'}</small><span className={'dot' + (db.active?.run ? '' : ' off')} /></div>
          {room.m.map((i, k) => <div className="li" key={i}><Av f={FR[i]} /><b>{FR[i].n}</b><small>{k % 3 === 2 ? 'On break' : 'Focusing'}</small><span className={'dot' + (k % 3 === 2 ? ' off' : '')} /></div>)}
          <h3>Room chat <Sim /></h3><div className="chat">{msgs.map((m, i) => <p key={i} className={m.me ? 'me' : ''}><b>{m.u}:</b> {m.t}</p>)}</div>
          <form className="row" onSubmit={send}><input value={txt} onChange={(e) => setTxt(e.target.value)} placeholder="Say something…" /><button className="btn">Send</button></form></div>
      </div>
    </>
  )
}

function Community({ c }) {
  const { db, upd } = c, [open, setOpen] = useState(null), [cm, setCm] = useState('')
  const unshared = [...db.sessions].reverse().find((s) => !s.shared)
  const like = (id) => upd((d) => ({ ...d, posts: d.posts.map((p) => (p.id === id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p)) }))
  const comment = (id) => { if (!cm.trim()) return; upd((d) => ({ ...d, posts: d.posts.map((p) => (p.id === id ? { ...p, comments: [...p.comments, { u: d.user.name, t: cm }] } : p)) })); setCm('') }
  return (
    <>
      <Head t="Community" sub="Posts from friends are seeded demo data; your posts are saved locally on this device." />
      <div className="grid2 feed">
        <div>{db.posts.map((p) => (
          <div className="card post" key={p.id}>
            <div className="li"><Av f={p.me ? db.user : frOf(p.u)} s={42} /><div><b>{p.u}</b><small>{p.sub} · {hm(p.mins)} · {p.ago}</small></div></div>
            <p>{p.msg}</p>{p.img && <img className="prev" src={p.img} alt="" />}
            <div className="row"><button className={'ghost sm' + (p.liked ? ' liked' : '')} onClick={() => like(p.id)}>{p.liked ? '❤️' : '🤍'} {p.likes}</button><button className="ghost sm" onClick={() => setOpen(open === p.id ? null : p.id)}>💬 {p.comments.length}</button></div>
            {open === p.id && <div className="cms">{p.comments.map((x, i) => <p key={i}><b>{x.u}:</b> {x.t}</p>)}<form className="row" onSubmit={(e) => { e.preventDefault(); comment(p.id) }}><input value={cm} onChange={(e) => setCm(e.target.value)} placeholder="Add a comment…" /><button className="btn sm">Post</button></form></div>}
          </div>))}</div>
        <div><div className="card"><h3>Share a session</h3>{unshared ? <><p className="muted">{unshared.mins} min of {unshared.subject} on {unshared.date}</p><ShareBox c={c} session={unshared} /></> : <p className="muted">All sessions shared. Complete a new focus session to post it.</p>}</div>
          <div className="card"><h3>Friends' achievements <Sim /></h3>{FR.map((f) => <div className="li" key={f.n}><Av f={f} /><b>{f.n}</b><small>🏅 {f.s}-day streak</small></div>)}</div></div>
      </div>
    </>
  )
}

function Plan({ c }) {
  const { db, upd, toast } = c, today = day(), tasks = db.tasks.filter((t) => t.date === today)
  const [f, setF] = useState({ title: '', pri: 'Medium', dur: 30 }), [g, setG] = useState(''), [ed, setEd] = useState(null), [st, setSt] = useState('09:00'), [hrs, setHrs] = useState(4)
  const add = (e) => { e.preventDefault(); if (!f.title.trim()) return; upd((d) => ({ ...d, tasks: [...d.tasks, { id: uid(), ...f, dur: +f.dur || 30, done: false, rw: false, date: today }] })); setF({ ...f, title: '' }); toast('Task added') }
  const toggle = (t) => upd((d) => ({ ...d, xp: d.xp + (!t.done && !t.rw ? 10 : 0), tasks: d.tasks.map((x) => (x.id === t.id ? { ...x, done: !x.done, rw: x.rw || !x.done } : x)) })) || (!t.done && !t.rw && toast('+10 XP for completing a task'))
  const gen = () => { const r = schedule(tasks.filter((t) => !t.done), st, hrs * 60); upd((d) => ({ ...d, sched: r })); toast(`Day generated: ${r.items.length} tasks scheduled`) }
  const sc = db.sched
  return (
    <>
      <Head t="My Plan" sub="Goals, tasks and a generated daily timeline." />
      <div className="grid2">
        <div className="card"><h3>Tasks</h3>
          <form className="row wrap" onSubmit={add}><input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="New task…" /><select value={f.pri} onChange={(e) => setF({ ...f, pri: e.target.value })}>{Object.keys(PRI).map((p) => <option key={p}>{p}</option>)}</select><input className="num" type="number" min="5" step="5" value={f.dur} onChange={(e) => setF({ ...f, dur: e.target.value })} /><button className="btn">Add</button></form>
          {tasks.map((t) => ed?.id === t.id ? (
            <div className="li" key={t.id}><input value={ed.title} onChange={(e) => setEd({ ...ed, title: e.target.value })} /><select value={ed.pri} onChange={(e) => setEd({ ...ed, pri: e.target.value })}>{Object.keys(PRI).map((p) => <option key={p}>{p}</option>)}</select><input className="num" type="number" value={ed.dur} onChange={(e) => setEd({ ...ed, dur: +e.target.value })} /><button className="btn sm" onClick={() => { upd((d) => ({ ...d, tasks: d.tasks.map((x) => (x.id === t.id ? { ...x, ...ed } : x)) })); setEd(null) }}>Save</button></div>
          ) : (
            <div className={'li task' + (t.done ? ' done' : '')} key={t.id}><input type="checkbox" checked={t.done} onChange={() => toggle(t)} /><span>{t.title}</span><small className={'pri ' + t.pri}>{t.pri}</small><small>{t.dur}m</small>
              <button className="ghost sm" onClick={() => setEd(t)}>✏️</button><button className="ghost sm" onClick={() => upd((d) => ({ ...d, tasks: d.tasks.filter((x) => x.id !== t.id) }))}>🗑</button></div>))}
          {!tasks.length && <p className="muted">No tasks for today.</p>}
          <h3>Goals</h3><form className="row" onSubmit={(e) => { e.preventDefault(); if (g.trim()) { upd((d) => ({ ...d, goals: [...d.goals, { id: uid(), t: g, done: false }] })); setG('') } }}><input value={g} onChange={(e) => setG(e.target.value)} placeholder="New goal…" /><button className="btn">Add</button></form>
          {db.goals.map((x) => <div className={'li task' + (x.done ? ' done' : '')} key={x.id}><input type="checkbox" checked={x.done} onChange={() => upd((d) => ({ ...d, goals: d.goals.map((y) => (y.id === x.id ? { ...y, done: !y.done } : y)) }))} /><span>{x.t}</span><button className="ghost sm" onClick={() => upd((d) => ({ ...d, goals: d.goals.filter((y) => y.id !== x.id) }))}>🗑</button></div>)}</div>
        <div className="card"><h3>Daily timeline</h3>
          <div className="row wrap"><label>Start <input type="time" value={st} onChange={(e) => setSt(e.target.value)} /></label><label>Hours <input className="num" type="number" min="1" max="12" value={hrs} onChange={(e) => setHrs(+e.target.value)} /></label><button className="cta sm" onClick={gen}>✨ Generate My Day</button></div>
          {!sc ? <p className="muted">Generate a schedule from priority, duration and available time.</p> : <div className="tl">{sc.items.map((i) => <div key={i.id} className="slot"><small>{i.start}–{i.end}</small><b>{i.t}</b><small className={'pri ' + i.pri}>{i.pri}</small></div>)}
            {sc.left.length > 0 && <p className="muted">Doesn't fit today → tomorrow: {sc.left.map((t) => t.title).join(', ')}</p>}</div>}</div>
      </div>
    </>
  )
}

function Challenges({ c }) {
  const { db, upd, toast } = c
  return (
    <>
      <Head t="Challenges" sub="Join a battle — your focus sessions automatically update your progress. Other participants are simulated." />
      <div className="grid3">{CH.map((x) => {
        const mine = db.chProg[x.id] || 0, joined = db.joined[x.id], rank = [...x.o.map(([n, m]) => ({ n, m })), ...(joined ? [{ n: db.user.name, m: mine, me: 1 }] : [])].sort((a, b) => b.m - a.m)
        return (
          <div className="card" key={x.id}><h3>{x.t}</h3><small className="muted">⏳ {x.left} left · {rank.length} participants <Sim /></small>
            <Bar p={mine / x.goal} c="linear-gradient(90deg,#8b5cf6,#22d3ee)" /><small>{joined ? `You: ${mine}/${x.goal} min` : `Goal: ${x.goal} min${x.sub ? ' of ' + x.sub : ''}`}</small>
            {rank.map((r, i) => <div className="li" key={r.n}><b>#{i + 1}</b><span className={r.me ? 'good' : ''}>{r.n}</span><small>{r.m} min</small></div>)}
            <button className={joined ? 'ghost' : 'btn'} disabled={joined} onClick={() => { upd((d) => ({ ...d, joined: { ...d.joined, [x.id]: true } })); toast(`Joined ${x.t}`) }}>{joined ? '✓ Joined' : 'Join Challenge'}</button></div>)
      })}</div>
    </>
  )
}

function Leaderboard({ c }) {
  const { db, s, upd, toast } = c, [tab, setTab] = useState('week')
  const wkm = sum(s.wk.map((d) => d.m)), me = { n: db.user.name, e: db.user.e, c: db.user.c, m: wkm, s: s.streak, x: db.xp, me: 1 }
  const rows = [...FR, me].sort((a, b) => (tab === 'week' ? b.m - a.m : b.x - a.x)), rank = rows.findIndex((r) => r.me) + 1
  const lk = db.lock, buddy = lk ? FR.find((f) => f.n === lk.p) : null, bm = buddy ? 40 + FR.indexOf(buddy) * 10 : 0, tot = s.today + bm
  return (
    <>
      <Head t="Leaderboard" sub="Friends are demo data — this is a local simulation, not a live ranking."><div className="chips">{[['week', 'Weekly'], ['friends', 'Friends (XP)']].map(([k, l]) => <button key={k} className={tab === k ? 'chip on' : 'chip'} onClick={() => setTab(k)}>{l}</button>)}</div></Head>
      <div className="grid2">
        <div className="card"><div className="you">Your rank: <b>#{rank}</b> of {rows.length}</div>
          {rows.map((r, i) => <div className={'li rk' + (r.me ? ' me' : '')} key={r.n}><b>#{i + 1}</b><Av f={r} /><span>{r.n}</span><small>{(r.m / 60).toFixed(1)}h</small><small>{r.s}🔥</small><small>{r.x} XP</small></div>)}</div>
        <div className="card"><h3>🤝 Lockmate <Sim /></h3>
          {!lk ? <><p className="muted">Pair with a study partner: shared daily target (120 min) and shared streak.</p><div className="chips">{FR.map((f) => <button key={f.n} className="chip" onClick={() => { upd((d) => ({ ...d, lock: { p: f.n } })); toast(`Paired with ${f.n}!`) }}>{f.e} {f.n}</button>)}</div></>
            : <><div className="li"><Av f={db.user} /><b>You</b><small>{s.today} min</small></div><div className="li"><Av f={buddy} /><b>{buddy.n}</b><small>{bm} min (simulated)</small></div>
              <Bar p={tot / 120} c="linear-gradient(90deg,#22d3ee,#8b5cf6)" /><p>{tot}/120 min shared target · {tot >= 120 ? '✅ Target hit!' : 'Keep going!'}</p><p>Shared streak: <b>{s.streak}🔥</b></p>
              <button className="ghost sm" onClick={() => upd((d) => ({ ...d, lock: null }))}>Unpair</button></>}</div>
      </div>
    </>
  )
}

function Stats({ c }) {
  const { db, s } = c, wk = s.wk, max = Math.max(60, ...wk.map((d) => d.m)), by = {}, wd = {}
  db.sessions.forEach((x) => { by[x.subject] = (by[x.subject] || 0) + x.mins; const w = new Date(x.date + 'T12:00').toLocaleDateString('en', { weekday: 'long' }); wd[w] = (wd[w] || 0) + x.mins })
  const best = Object.entries(wd).sort((a, b) => b[1] - a[1])[0], tot = sum(Object.values(by)) || 1, wm = sum(wk.map((d) => d.m)), [hv, setHv] = useState(null)
  return (
    <>
      <Head t="Statistics" sub="Your focus data, saved locally." />
      <div className="grid4"><div className="card stat"><b>{(wm / 60).toFixed(1)}h</b><small>Weekly focus</small></div><div className="card stat"><b>{db.sessions.length}</b><small>Completed sessions</small></div><div className="card stat"><b>{s.streak}🔥</b><small>Current streak</small></div><div className="card stat"><b>{best ? best[0] : '—'}</b><small>Most productive day</small></div></div>
      <div className="grid2">
        <div className="card"><h3>Daily focus activity {hv && <small className="muted">{hv.l}: {hv.m} min</small>}</h3>
          <svg viewBox="0 0 320 170" className="chart"><defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#22d3ee" /><stop offset="1" stopColor="#8b5cf6" /></linearGradient></defs>
            {wk.map((d, i) => { const h = (d.m / max) * 120; return <g key={d.dt} onMouseEnter={() => setHv(d)} onMouseLeave={() => setHv(null)}><rect x={14 + i * 44} y={140 - h} width="30" height={Math.max(h, 2)} rx="8" fill="url(#bg)" opacity={hv && hv !== d ? 0.5 : 1} /><text x={29 + i * 44} y="160" textAnchor="middle" className="ax">{d.l}</text></g> })}</svg></div>
        <div className="card"><h3>Subject distribution</h3>{Object.entries(by).sort((a, b) => b[1] - a[1]).map(([k, v], i) => <div key={k}><div className="li"><span>{k}</span><small>{hm(v)} · {Math.round((v / tot) * 100)}%</small></div><Bar p={v / tot} c={COL[i % 4]} /></div>)}
          <h3>Weekly productivity</h3><p className="muted">{wm >= 300 ? 'Great week — over 5 hours of focus.' : `${300 - wm} min to reach a 5-hour week.`}</p></div>
      </div>
    </>
  )
}

function Coach({ c }) {
  const { db, s, upd, toast } = c, I = insights(db, s), [mins, setMins] = useState(90), [res, setRes] = useState(null)
  const unf = db.tasks.filter((t) => t.date === day() && !t.done).sort((a, b) => PRI[b.pri] - PRI[a.pri])
  const run = () => { const n = new Date(), start = toHM(Math.ceil((n.getHours() * 60 + n.getMinutes()) / 5) * 5), r = schedule(unf, start, mins); setRes(r) }
  const apply = () => {
    const tm = ago(-1), ids = new Set(res.left.map((t) => t.id))
    upd((d) => ({ ...d, tasks: d.tasks.map((t) => (ids.has(t.id) ? { ...t, date: tm } : t)), sched: res })); toast('Recovery plan applied'); setRes(null)
  }
  return (
    <>
      <Head t="AI Coach" sub="Smart Coach / AI Coach Demo — rule-based local logic, no AI model or API is connected."><Sim /></Head>
      <div className="grid3">{[['📅 Today', I.daily], ['📊 This week', I.weekly], ['📖 Study suggestion', I.study], ['🎯 Goal recommendation', I.goal]].map(([t, x]) => <div className="card" key={t}><h3>{t}</h3><p>{x}</p></div>)}
        <div className="card"><h3>💡 Tips</h3>{I.suggestions.map((x) => <p key={x}>• {x}</p>)}</div></div>
      <div className="card rec"><h2>🛟 AI Life Recovery Mode</h2><p className="muted">Missed some tasks? Let's reset the day without guilt.</p>
        <h3>1. Unfinished tasks (by priority)</h3>{unf.length ? unf.map((t) => <div className="li" key={t.id}><span>{t.title}</span><small className={'pri ' + t.pri}>{t.pri}</small><small>{t.dur}m</small></div>) : <p className="good">Nothing unfinished — you're on track! 🎉</p>}
        {unf.length > 0 && <><h3>2. How much time do you have left today?</h3><div className="row"><input className="num" type="number" min="15" step="15" value={mins} onChange={(e) => setMins(+e.target.value)} /><span>minutes</span><button className="cta sm" onClick={run}>Reorganize my day</button></div></>}
        {res && <><h3>3. Your recovery plan</h3>{res.items.map((i) => <div className="slot" key={i.id}><small>{i.start}–{i.end}</small><b>{i.t}</b><small className={'pri ' + i.pri}>{i.pri}</small></div>)}
          {res.left.length > 0 && <p>📦 Move to tomorrow: <b>{res.left.map((t) => t.title).join(', ')}</b></p>}
          <p className="good">💜 A reset is progress. You still have {mins} minutes — finish the high-priority items and let the rest go to tomorrow.</p><button className="btn" onClick={apply}>Apply plan</button></>}</div>
    </>
  )
}
