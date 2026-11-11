// Smart Coach / AI Coach Demo — transparent local logic (no AI model, no API).
// To plug in a real AI later, replace insights() and schedule() with API calls returning the same shapes.
export const PRI = { High: 3, Medium: 2, Low: 1 }
const toMin = (h) => { const [a, b] = h.split(':').map(Number); return a * 60 + b }
export const toHM = (m) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
// Priority first, then shorter tasks first; 5-minute breaks; whatever doesn't fit goes to `left`.
export function schedule(tasks, start, avail) {
  const sorted = [...tasks].sort((a, b) => PRI[b.pri] - PRI[a.pri] || a.dur - b.dur)
  let cur = toMin(start), used = 0; const items = [], left = []
  for (const t of sorted) {
    if (used + t.dur <= avail) { items.push({ id: t.id, t: t.title, pri: t.pri, start: toHM(cur), end: toHM(cur + t.dur) }); cur += t.dur + 5; used += t.dur + 5 }
    else left.push(t)
  }
  return { items, left }
}
export function insights(d, s) {
  const best = [...s.wk].sort((a, b) => b.m - a.m)[0], wkTotal = s.wk.reduce((a, x) => a + x.m, 0)
  const bySub = {}; d.sessions.forEach((x) => (bySub[x.subject] = (bySub[x.subject] || 0) + x.mins))
  const least = ['Mathematics', 'Programming', 'Reading', 'Science'].sort((a, b) => (bySub[a] || 0) - (bySub[b] || 0))[0]
  return {
    daily: s.today >= 60 ? `Daily goal crushed — ${s.today} min focused today.` : `You're ${60 - s.today} min away from today's 60-minute goal. One 25-minute block gets you close.`,
    weekly: `This week: ${(wkTotal / 60).toFixed(1)}h focused. Strongest day: ${best.l} (${best.m} min).`,
    study: `${least} has the least focus time — try a 25-minute block on it next.`,
    goal: s.streak >= 3 ? `Streak of ${s.streak} days! Aim for ${s.streak + 2} by keeping one session per day.` : 'Set a goal: 1 session every day this week to start a streak.',
    suggestions: ['Do your hardest task in your most productive time window.', 'Pair up with a Lockmate for accountability.', 'Use 50-minute sessions for deep work, 25 for review.'],
  }
}
