import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity, AlarmClock, ArrowDownRight, ArrowRight, ArrowUpRight, Award, BarChart3,
  Bell, BookOpen, Calendar, CalendarCheck, Camera, Check, CheckCircle2, ChevronDown,
  ChevronLeft, ChevronRight, CircleHelp, Clock3, Coins, Flame, Flag, Focus, Gift,
  Globe2, Heart, Home, Hourglass, LayoutDashboard, ListTodo, Lock, MessageCircle,
  MoreHorizontal, Pause, Play, Plus, Rocket, Send, Settings2, ShieldCheck, Sparkles,
  Star, Target, Timer, Trophy, Users, Video, VideoOff, WandSparkles, X, Zap,
  BookMarked, Brain, Coffee, Code2, GraduationCap, Headphones, Moon, Sun, Trash2,
  Pencil, RotateCcw, Share2, ChevronUp, CheckCheck, ImagePlus, UserRound, CalendarDays,
} from 'lucide-react';

const STORAGE_KEY = 'lifeos-v1';
const todayKey = () => new Date().toLocaleDateString('en-CA');
const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const dateOffset = (offset) => { const d = new Date(); d.setDate(d.getDate() + offset); return d.toLocaleDateString('en-CA'); };
const formatDuration = (seconds) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
const formatHours = (minutes) => `${(minutes / 60).toFixed(minutes % 60 === 0 ? 0 : 1)}h`;
const prettyDate = (date = new Date()) => date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
const timeAgo = (date) => { const mins = Math.max(1, Math.floor((Date.now() - new Date(date).getTime()) / 60000)); return mins < 60 ? `${mins}m ago` : mins < 1440 ? `${Math.floor(mins / 60)}h ago` : `${Math.floor(mins / 1440)}d ago`; };

const seedTasks = [
  { id: 't1', title: 'Review linked lists & trees', subject: 'Data Structures', priority: 'high', minutes: 60, done: false, time: '09:00' },
  { id: 't2', title: 'Finish database normalization notes', subject: 'Database Systems', priority: 'high', minutes: 45, done: false, time: '10:30' },
  { id: 't3', title: 'Read chapter 4 — system analysis', subject: 'System Analysis', priority: 'medium', minutes: 40, done: false, time: '13:00' },
  { id: 't4', title: 'Practice Java OOP exercises', subject: 'Programming', priority: 'medium', minutes: 35, done: true, time: '15:00' },
  { id: 't5', title: 'Plan tomorrow’s study blocks', subject: 'Planning', priority: 'low', minutes: 15, done: false, time: '17:30' },
];
const seedSessions = [
  { id: 's1', subject: 'Programming', minutes: 50, date: dateOffset(-6), completedAt: new Date(Date.now() - 6 * 86400000).toISOString() },
  { id: 's2', subject: 'Mathematics', minutes: 75, date: dateOffset(-5), completedAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 's3', subject: 'Reading', minutes: 45, date: dateOffset(-4), completedAt: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: 's4', subject: 'Programming', minutes: 90, date: dateOffset(-3), completedAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 's5', subject: 'Science', minutes: 50, date: dateOffset(-1), completedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 's6', subject: 'Mathematics', minutes: 30, date: todayKey(), completedAt: new Date(Date.now() - 3600000).toISOString() },
];
const seedPosts = [
  { id: 'p1', user: 'Maya Chen', initials: 'MC', color: 'coral', subject: 'Biology', minutes: 120, caption: 'Two chapters down. Future me is going to be so grateful for this session. 📚', createdAt: new Date(Date.now() - 22 * 60000).toISOString(), likes: 12, comments: [{ id: 'c1', user: 'Noah', text: 'That’s a serious session! 🔥' }], liked: false, demo: true },
  { id: 'p2', user: 'Noah Williams', initials: 'NW', color: 'blue', subject: 'Algorithms', minutes: 90, caption: 'Finally understood merge sort. It really does click when you draw it out.', createdAt: new Date(Date.now() - 95 * 60000).toISOString(), likes: 8, comments: [], liked: false, demo: true },
  { id: 'p3', user: 'Aisha Patel', initials: 'AP', color: 'pink', subject: 'Mathematics', minutes: 60, caption: 'A quiet hour, a clear desk, and one less thing hanging over my head. ✨', createdAt: new Date(Date.now() - 4 * 3600000).toISOString(), likes: 21, comments: [{ id: 'c2', user: 'Maya', text: 'Love this energy.' }, { id: 'c3', user: 'You', text: 'Needed this reminder.' }], liked: true, demo: true },
  { id: 'p4', user: 'Leo Martins', initials: 'LM', color: 'green', subject: 'Physics', minutes: 45, caption: 'Showing up even when motivation does not. Small wins count.', createdAt: new Date(Date.now() - 20 * 3600000).toISOString(), likes: 6, comments: [], liked: false, demo: true },
];
const seedFriends = [
  { name: 'Maya Chen', initials: 'MC', color: 'coral', status: 'Focusing', subject: 'Biology', streak: 12, hours: 13.5, xp: 1280 },
  { name: 'Noah Williams', initials: 'NW', color: 'blue', status: 'Focusing', subject: 'Algorithms', streak: 8, hours: 11.2, xp: 1120 },
  { name: 'Aisha Patel', initials: 'AP', color: 'pink', status: 'On a break', subject: 'Mathematics', streak: 21, hours: 10.8, xp: 1060 },
  { name: 'Leo Martins', initials: 'LM', color: 'green', status: 'Offline', subject: 'Physics', streak: 5, hours: 8.4, xp: 840 },
  { name: 'Sara Kim', initials: 'SK', color: 'yellow', status: 'Focusing', subject: 'Design', streak: 16, hours: 7.9, xp: 790 },
];
const seedChallenges = [
  { id: 'ch1', title: '10-Hour Weekly Focus', description: 'Build momentum with ten focused hours this week.', target: 600, participants: 128, endsIn: '2 days left', joined: true, icon: 'target', reward: 250 },
  { id: 'ch2', title: 'Weekend Study Sprint', description: 'Make your weekend count. Every minute adds up.', target: 240, participants: 64, endsIn: 'Starts Saturday', joined: false, icon: 'zap', reward: 120 },
  { id: 'ch3', title: 'First to 5 Hours', description: 'A friendly race to your next five hours of deep work.', target: 300, participants: 42, endsIn: '5 days left', joined: false, icon: 'trophy', reward: 180 },
  { id: 'ch4', title: 'Daily 2-Hour Habit', description: 'Show up for two hours a day, one day at a time.', target: 120, participants: 216, endsIn: '6 days left', joined: true, icon: 'flame', reward: 300 },
];
const seedRooms = [
  { id: 'r1', name: 'Late Night Library', subtitle: 'Quiet minds, big ideas', subject: 'Mixed subjects', people: 24, category: 'Quiet', color: 'purple', avatars: ['MC', 'AP', 'SK', '+21'] },
  { id: 'r2', name: 'Programming Zone', subtitle: 'Ship one more thing', subject: 'Programming', people: 18, category: 'Coding', color: 'blue', avatars: ['NW', 'LM', 'MC', '+15'] },
  { id: 'r3', name: 'Exam Preparation', subtitle: 'We’ve got this together', subject: 'Exam prep', people: 31, category: 'Study group', color: 'pink', avatars: ['AP', 'SK', 'NW', '+28'] },
  { id: 'r4', name: 'Silent Study Hall', subtitle: 'Just you and the work', subject: 'All subjects', people: 12, category: 'Quiet', color: 'cyan', avatars: ['LM', 'MC', 'AP', '+9'] },
  { id: 'r5', name: 'Deep Work Lounge', subtitle: 'Protect your attention', subject: 'Deep work', people: 9, category: 'Deep work', color: 'orange', avatars: ['SK', 'NW', 'LM', '+6'] },
];
const DEFAULT_DATA = {
  profile: { name: 'Edom', handle: '@edom', avatar: 'E', level: 8, xp: 1820, coins: 420, goalMinutes: 180, streak: 5, lastActiveDate: todayKey(), shareByDefault: false },
  tasks: seedTasks,
  rewardedTaskIds: ['t4'],
  habits: [],
  sessions: seedSessions,
  posts: seedPosts,
  challenges: seedChallenges,
  joinedChallengeIds: ['ch1', 'ch4'],
  joinedRoomId: null,
  roomMessages: {},
  focusActive: null,
  preferences: { sound: true },
  buddy: { paired: true, name: 'Maya Chen', initials: 'MC', target: 90, todayMinutes: 55, streak: 6 },
};

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return DEFAULT_DATA;
    return { ...DEFAULT_DATA, ...saved, profile: { ...DEFAULT_DATA.profile, ...saved.profile }, preferences: { ...DEFAULT_DATA.preferences, ...saved.preferences }, buddy: { ...DEFAULT_DATA.buddy, ...saved.buddy } };
  } catch { return DEFAULT_DATA; }
}

const navGroups = [
  { label: 'WORKSPACE', items: [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'focus', label: 'Focus', icon: Timer, pill: 'LIVE' },
    { id: 'rooms', label: 'Study Rooms', icon: Users },
    { id: 'community', label: 'Community', icon: Globe2 },
  ] },
  { label: 'YOUR GROWTH', items: [
    { id: 'plan', label: 'My Plan', icon: CalendarCheck },
    { id: 'challenges', label: 'Challenges', icon: Flag },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'statistics', label: 'Statistics', icon: BarChart3 },
  ] },
  { label: 'PERSONAL', items: [ { id: 'coach', label: 'AI Coach', icon: Sparkles, badge: 'NEW' } ] },
];

function Avatar({ initials = 'E', color = 'violet', size = 'md', online = false, className = '' }) {
  return <span className={`avatar avatar-${color} avatar-${size} ${className}`}>{initials}<i className={online ? 'online-dot' : ''} /></span>;
}
function Panel({ children, className = '', ...props }) { return <section className={`panel ${className}`} {...props}>{children}</section>; }
function PageTitle({ eyebrow, title, subtitle, action }) {
  return <div className="page-title"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>{action && <div className="page-title-action">{action}</div>}</div>;
}
function ProgressRing({ value, size = 120, stroke = 9, color = 'purple', children }) {
  const radius = (size - stroke) / 2; const circumference = 2 * Math.PI * radius; const offset = circumference - Math.min(100, Math.max(0, value)) / 100 * circumference;
  return <div className="progress-ring" style={{ width: size, height: size }}><svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}><circle className="ring-track" cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} /><circle className={`ring-value ring-${color}`} cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} strokeDasharray={circumference} strokeDashoffset={offset} transform={`rotate(-90 ${size / 2} ${size / 2})`} /></svg><div className="ring-content">{children}</div></div>;
}
function StatCard({ icon: Icon, label, value, change, tone = 'purple', sub }) {
  return <Panel className="stat-card"><div className={`stat-icon icon-${tone}`}><Icon size={18} /></div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-foot">{change && <span className="positive"><ArrowUpRight size={13} /> {change}</span>}{sub && <span>{sub}</span>}</div></Panel>;
}
function Toast({ toast }) { if (!toast) return null; return <div className={`toast toast-${toast.type || 'success'}`}><span className="toast-icon">{toast.type === 'error' ? <X size={16} /> : <Check size={16} />}</span>{toast.message}</div>; }
function Modal({ title, subtitle, onClose, children, wide = false }) {
  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><div className={`modal ${wide ? 'modal-wide' : ''}`}><div className="modal-head"><div><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</div><button className="icon-button" onClick={onClose}><X size={18} /></button></div>{children}</div></div>;
}
function EmptyState({ icon: Icon = Target, title, text, action }) { return <div className="empty-state"><span><Icon size={24} /></span><h3>{title}</h3><p>{text}</p>{action}</div>; }

export default function App() {
  const [data, setData] = useState(loadData);
  const [view, setView] = useState('overview');
  const [now, setNow] = useState(Date.now());
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);
  const [taskDraft, setTaskDraft] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: '', subject: 'Programming', priority: 'medium', minutes: 30, time: '14:00' });
  const [subject, setSubject] = useState('Programming');
  const [duration, setDuration] = useState(25);
  const [shareCaption, setShareCaption] = useState('A little progress is still progress. ✨');
  const [shareImage, setShareImage] = useState('');
  const [commentDrafts, setCommentDrafts] = useState({});
  const [activeRoomTab, setActiveRoomTab] = useState('Quiet');
  const [roomChatDraft, setRoomChatDraft] = useState('');
  const [showRoomChat, setShowRoomChat] = useState(true);
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [recoveryMinutes, setRecoveryMinutes] = useState(180);
  const [recoveryResult, setRecoveryResult] = useState(null);
  const [leaderTab, setLeaderTab] = useState('weekly');
  const [communityTab, setCommunityTab] = useState('For you');
  const [profileMenu, setProfileMenu] = useState(false);
  const [taskFilter, setTaskFilter] = useState('all');
  const [planningMinutes, setPlanningMinutes] = useState(240);
  const [mobileMenu, setMobileMenu] = useState(false);
  const completedModalShown = useRef(false);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }, [data]);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 250); return () => clearInterval(timer); }, []);
  useEffect(() => { if (toast) { const id = setTimeout(() => setToast(null), 3000); return () => clearTimeout(id); } }, [toast]);

  const notify = useCallback((message, type = 'success') => setToast({ message, type }), []);
  const update = useCallback((key, value) => setData((prev) => ({ ...prev, [key]: typeof value === 'function' ? value(prev[key]) : value })), []);
  const patchProfile = useCallback((patch) => setData((prev) => ({ ...prev, profile: { ...prev.profile, ...patch } })), []);
  const todaySessions = data.sessions.filter((s) => s.date === todayKey());
  const todayMinutes = todaySessions.reduce((sum, s) => sum + s.minutes, 0);
  const allTimeMinutes = data.sessions.reduce((sum, s) => sum + s.minutes, 0);
  const weekMinutes = data.sessions.filter((s) => s.date >= dateOffset(-6) && s.date <= todayKey()).reduce((sum, s) => sum + s.minutes, 0);
  const todayDone = data.tasks.filter((t) => t.done).length;
  const goalProgress = Math.min(100, Math.round(todayMinutes / data.profile.goalMinutes * 100));
  const active = data.focusActive;
  const activeElapsed = active ? (active.running ? active.elapsedSeconds + (now - active.startedAt) / 1000 : active.elapsedSeconds) : 0;
  const activeRemaining = active ? Math.max(0, active.durationSeconds - activeElapsed) : duration * 60;
  const activePercent = active ? Math.min(100, activeElapsed / active.durationSeconds * 100) : 0;

  const updateStreak = useCallback((date) => {
    setData((prev) => {
      const last = prev.profile.lastActiveDate;
      let streak = prev.profile.streak || 0;
      if (last !== date) streak = last === dateOffset(-1) ? streak + 1 : 1;
      const nextXp = prev.profile.xp + 20;
      return { ...prev, profile: { ...prev.profile, xp: nextXp, coins: prev.profile.coins + 12, streak, lastActiveDate: date, level: Math.floor(nextXp / 250) + 1, todayRewardClaimed: true } };
    });
  }, []);

  const finishSession = useCallback((reason = 'manual') => {
    if (!active) return;
    const elapsed = active.running ? active.elapsedSeconds + (Date.now() - active.startedAt) / 1000 : active.elapsedSeconds;
    const minutes = Math.max(1, Math.round(Math.min(active.durationSeconds, elapsed) / 60));
    const session = { id: uid(), subject: active.subject, minutes, date: todayKey(), completedAt: new Date().toISOString(), plannedMinutes: Math.round(active.durationSeconds / 60) };
    const dailyBonus = todayMinutes < data.profile.goalMinutes && todayMinutes + minutes >= data.profile.goalMinutes;
    setData((prev) => {
      if (!prev.focusActive || prev.focusActive.id !== active.id) return prev;
      const last = prev.profile.lastActiveDate;
      let streak = prev.profile.streak || 0;
      if (last !== session.date) streak = last === dateOffset(-1) ? streak + 1 : 1;
      const xp = prev.profile.xp + 20 + (dailyBonus ? 30 : 0);
      return { ...prev, focusActive: null, sessions: [session, ...prev.sessions], buddy: { ...prev.buddy, todayMinutes: (prev.buddy?.todayMinutes || 0) + minutes }, profile: { ...prev.profile, xp, coins: prev.profile.coins + 12 + (dailyBonus ? 20 : 0), streak, lastActiveDate: session.date, level: Math.floor(xp / 250) + 1 } };
    });
    completedModalShown.current = true;
    if (data.profile.shareByDefault) {
      setShareCaption(`Just completed a ${minutes}-minute ${session.subject} session. One step closer. ✨`);
      setModal({ type: 'share' });
    } else {
      setModal({ type: 'completed', reason, dailyBonus });
    }
    notify(dailyBonus ? 'Daily goal reached! +50 XP and 32 coins' : 'Session complete! +20 XP and 12 coins');
  }, [active, data.profile.goalMinutes, data.profile.name, data.profile.shareByDefault, notify, setShareCaption, todayMinutes]);

  useEffect(() => {
    if (active && active.running && activeRemaining <= 0 && !completedModalShown.current) finishSession('timer');
  }, [active, activeRemaining, finishSession]);

  const startFocus = () => {
    if (active) { setView('focus'); return; }
    completedModalShown.current = false;
    update('focusActive', { id: uid(), subject, durationSeconds: duration * 60, elapsedSeconds: 0, startedAt: Date.now(), running: true, roomId: data.joinedRoomId });
    setView('focus');
    notify(`${subject} focus session started`);
  };
  const startRoomFocus = () => {
    if (active) { setView('focus'); return; }
    completedModalShown.current = false;
    update('focusActive', { id: uid(), subject, durationSeconds: duration * 60, elapsedSeconds: 0, startedAt: Date.now(), running: true, roomId: data.joinedRoomId });
    notify(`${subject} session started in ${seedRooms.find((r) => r.id === data.joinedRoomId)?.name || 'your study room'}`);
  };
  const pauseFocus = () => {
    if (!active?.running) return;
    const elapsedSeconds = active.elapsedSeconds + (Date.now() - active.startedAt) / 1000;
    update('focusActive', { ...active, elapsedSeconds, running: false });
    notify('Focus paused');
  };
  const resumeFocus = () => { if (!active || active.running) return; update('focusActive', { ...active, startedAt: Date.now(), running: true }); notify('Back to focus. You’ve got this.'); };
  const discardFocus = () => { update('focusActive', null); notify('Session ended without saving', 'error'); };

  const shareCompletedSession = () => {
    const session = data.sessions[0];
    if (!session) return;
    const post = { id: uid(), user: data.profile.name, initials: data.profile.name.slice(0, 2).toUpperCase(), color: 'violet', subject: session.subject, minutes: session.minutes, caption: shareCaption.trim() || 'Just put in some focused work. One step closer.', createdAt: new Date().toISOString(), likes: 0, comments: [], liked: false, image: shareImage, demo: false };
    update('posts', (posts) => [post, ...posts]);
    setModal(null); setShareImage(''); setView('community'); notify('Your session was shared with the community');
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    const task = { ...taskForm, id: taskDraft?.id || uid(), minutes: Number(taskForm.minutes), done: taskDraft?.done || false };
    update('tasks', (tasks) => taskDraft ? tasks.map((t) => t.id === task.id ? task : t) : [...tasks, task]);
    setModal(null); setTaskDraft(null); setTaskForm({ title: '', subject: 'Programming', priority: 'medium', minutes: 30, time: '14:00' });
    notify(taskDraft ? 'Task updated' : 'Task added to your plan');
  };
  const openTaskModal = (task = null) => {
    setTaskDraft(task);
    setTaskForm(task ? { title: task.title, subject: task.subject, priority: task.priority, minutes: task.minutes, time: task.time || '14:00' } : { title: '', subject: 'Programming', priority: 'medium', minutes: 30, time: '14:00' });
    setModal({ type: 'task' });
  };
  const toggleTask = (id) => {
    const task = data.tasks.find((t) => t.id === id);
    if (!task) return;
    const completed = !task.done;
    const alreadyRewarded = (data.rewardedTaskIds || []).includes(id);
    const award = completed && !alreadyRewarded;
    setData((prev) => {
      const xp = prev.profile.xp + (award ? 5 : 0);
      return {
        ...prev,
        tasks: prev.tasks.map((t) => t.id === id ? { ...t, done: !t.done } : t),
        rewardedTaskIds: award ? [...(prev.rewardedTaskIds || []), id] : (prev.rewardedTaskIds || []),
        profile: award ? { ...prev.profile, xp, level: Math.floor(xp / 250) + 1 } : prev.profile,
      };
    });
    if (award) notify('Task completed · +5 XP');
    else if (completed) notify('Task completed');
    else notify('Task moved back to your list');
  };
  const deleteTask = (id) => { update('tasks', (tasks) => tasks.filter((t) => t.id !== id)); notify('Task deleted'); };

  const generateDay = () => {
    const pending = [...data.tasks.filter((t) => !t.done)].sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority]) || a.minutes - b.minutes);
    const currentTime = new Date();
    let cursor = Math.max(9 * 60, currentTime.getHours() * 60 + currentTime.getMinutes() + 10);
    let remaining = planningMinutes;
    const scheduled = [];
    const deferred = [];
    pending.forEach((task) => {
      if (task.minutes <= remaining) {
        const hours = Math.floor(cursor / 60).toString().padStart(2, '0');
        const mins = (cursor % 60).toString().padStart(2, '0');
        scheduled.push({ ...task, time: `${hours}:${mins}` });
        remaining -= task.minutes;
        cursor += task.minutes + 15;
      } else deferred.push(task);
    });
    update('tasks', (tasks) => tasks.map((t) => scheduled.find((s) => s.id === t.id) || t));
    notify(`${scheduled.length} tasks scheduled · ${deferred.length} moved to tomorrow`);
  };

  const toggleLike = (id) => update('posts', (posts) => posts.map((p) => p.id === id ? { ...p, liked: !p.liked, likes: Math.max(0, p.likes + (p.liked ? -1 : 1)) } : p));
  const addComment = (id) => { const text = (commentDrafts[id] || '').trim(); if (!text) return; update('posts', (posts) => posts.map((p) => p.id === id ? { ...p, comments: [...p.comments, { id: uid(), user: 'You', text }] } : p)); setCommentDrafts((prev) => ({ ...prev, [id]: '' })); notify('Comment added'); };
  const joinChallenge = (id) => {
    update('joinedChallengeIds', (ids) => ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);
    update('challenges', (items) => items.map((ch) => ch.id === id ? { ...ch, joined: !ch.joined, participants: ch.participants + (ch.joined ? -1 : 1) } : ch));
    notify(data.joinedChallengeIds.includes(id) ? 'Challenge left' : 'You’re in. Let’s make it count!');
  };
  const joinRoom = (id) => { update('joinedRoomId', id); setView('rooms'); notify(`Joined ${seedRooms.find((r) => r.id === id)?.name}`); };
  const leaveRoom = () => { update('joinedRoomId', null); notify('You left the study room'); };
  const sendRoomMessage = (e) => { e.preventDefault(); if (!roomChatDraft.trim() || !data.joinedRoomId) return; const roomId = data.joinedRoomId; update('roomMessages', (all) => ({ ...all, [roomId]: [...(all[roomId] || []), { id: uid(), user: 'You', text: roomChatDraft.trim(), at: new Date().toISOString() }] })); setRoomChatDraft(''); };

  const makeRecoveryPlan = () => {
    const pending = data.tasks.filter((t) => !t.done).sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority]));
    let remaining = Number(recoveryMinutes);
    const nowDate = new Date(); let cursor = nowDate.getHours() * 60 + nowDate.getMinutes() + 10;
    const todayItems = []; const tomorrowItems = [];
    pending.forEach((task) => {
      if (task.minutes <= remaining) {
        const h = Math.floor(cursor / 60).toString().padStart(2, '0'); const m = (cursor % 60).toString().padStart(2, '0');
        todayItems.push({ ...task, suggestedTime: `${h}:${m}` }); remaining -= task.minutes; cursor += task.minutes + 10;
      } else tomorrowItems.push(task);
    });
    const highMoved = tomorrowItems.filter((t) => t.priority === 'high').length;
    setRecoveryResult({ todayItems, tomorrowItems, minutes: Number(recoveryMinutes), highMoved });
    notify('Your recovery plan is ready');
  };

  const resetDemo = () => { localStorage.removeItem(STORAGE_KEY); setData(DEFAULT_DATA); setView('overview'); setModal(null); notify('Demo data reset to the starting state'); };

  const navTo = (id) => { setView(id); setMobileMenu(false); };
  const titleMap = { overview: 'Overview', focus: 'Focus', rooms: 'Study Rooms', community: 'Community', plan: 'My Plan', challenges: 'Challenges', leaderboard: 'Leaderboard', statistics: 'Statistics', coach: 'AI Coach' };

  const room = seedRooms.find((r) => r.id === data.joinedRoomId);
  const weeklyBars = useMemo(() => Array.from({ length: 7 }, (_, i) => { const date = dateOffset(i - 6); return { label: new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' }), minutes: data.sessions.filter((s) => s.date === date).reduce((sum, s) => sum + s.minutes, 0), today: date === todayKey() }; }), [data.sessions]);
  const subjectMap = useMemo(() => data.sessions.reduce((acc, s) => { acc[s.subject] = (acc[s.subject] || 0) + s.minutes; return acc; }, {}), [data.sessions]);
  const subjectTotal = Object.values(subjectMap).reduce((a, b) => a + b, 0) || 1;
  const sortedLeaderboard = useMemo(() => {
    const you = { name: data.profile.name, initials: data.profile.name.slice(0, 2).toUpperCase(), color: 'violet', status: 'You', hours: weekMinutes / 60, streak: data.profile.streak || 0, xp: data.profile.xp, self: true };
    return [...seedFriends.map((f) => ({ ...f, self: false })), you].sort((a, b) => leaderTab === 'xp' ? b.xp - a.xp : leaderTab === 'streak' ? b.streak - a.streak : b.hours - a.hours);
  }, [data.profile, weekMinutes, leaderTab]);
  const leaderboardRank = sortedLeaderboard.findIndex((r) => r.self) + 1;
  const joinedChallenges = data.challenges.filter((c) => data.joinedChallengeIds.includes(c.id));
  const currentLevel = Math.floor(data.profile.xp / 250) + 1;
  const levelProgress = (data.profile.xp % 250) / 250 * 100;

  return <div className="app-shell">
    <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
      <div className="brand-lockup"><div className="brand-mark"><span className="brand-orbit orbit-one"/><span className="brand-orbit orbit-two"/><span className="brand-core"/></div><div><div className="brand-name">life<span>os</span></div><div className="brand-tag">YOUR LIFE, IN SYNC</div></div><button className="mobile-close icon-button" onClick={() => setMobileMenu(false)}><X size={18}/></button></div>
      <div className="workspace-switch"><div className="workspace-avatar">L</div><div className="workspace-copy"><b>Personal space</b><span>Free workspace</span></div><ChevronDown size={15}/></div>
      <nav className="side-nav">{navGroups.map((group) => <div className="nav-group" key={group.label}><div className="nav-label">{group.label}</div>{group.items.map((item) => <button key={item.id} className={`nav-item ${view === item.id ? 'active' : ''}`} onClick={() => navTo(item.id)}><item.icon size={18}/><span>{item.label}</span>{item.pill && <small className="live-pill">{item.pill}</small>}{item.badge && <small className="new-pill">{item.badge}</small>}</button>)}</div>)}</nav>
      <div className="sidebar-bottom"><Panel className="upgrade-card"><div className="upgrade-glow"><Sparkles size={17}/></div><b>Make every day count.</b><p>Your next level is closer than you think.</p><div className="upgrade-progress"><span style={{ width: `${levelProgress}%` }}/></div><small>{Math.round(levelProgress)}% to level {currentLevel + 1}</small></Panel><button className="help-link" onClick={() => notify('LifeOS demo · Your progress is stored on this device')}><CircleHelp size={16}/> Help & feedback</button><div className="side-version">LIFEOS · HACKATHON PREVIEW</div></div>
    </aside>
    {mobileMenu && <div className="mobile-scrim" onClick={() => setMobileMenu(false)}/>}
    <main className="main-area">
      <header className="topbar"><div className="topbar-left"><button className="mobile-menu icon-button" onClick={() => setMobileMenu(true)}><MoreHorizontal size={20}/></button><div className="breadcrumbs"><span>Workspace</span><ChevronRight size={14}/><b>{titleMap[view]}</b></div></div><div className="topbar-actions"><div className="topbar-date"><CalendarDays size={15}/>{prettyDate()}</div><button className="icon-button notification-button" onClick={() => notify('You’re all caught up!')} aria-label="Notifications"><Bell size={18}/><i/></button><div className="profile-wrap"><button className="profile-trigger" onClick={() => setProfileMenu(!profileMenu)}><Avatar initials={data.profile.name.slice(0, 1).toUpperCase()} color="violet" size="sm"/><span>{data.profile.name}</span><ChevronDown size={14}/></button>{profileMenu && <div className="profile-dropdown"><button onClick={() => { setProfileMenu(false); setModal({ type: 'profile' }); }}><UserRound size={15}/> Edit profile</button><button onClick={() => { setProfileMenu(false); setModal({ type: 'settings' }); }}><Settings2 size={15}/> Preferences</button><button onClick={() => { setProfileMenu(false); setModal({ type: 'reset' }); }}><RotateCcw size={15}/> Reset demo</button></div>}</div></div></header>
      <div className="content-area">
        {view === 'overview' && <>
          <div className="welcome-row"><div><div className="eyebrow">{prettyDate().toUpperCase()}</div><h1>Good afternoon, {data.profile.name} <span className="wave">✦</span></h1><p>You’re building something great. Let’s make today count.</p></div><button className="button button-primary button-lg" onClick={startFocus}><Play size={17} fill="currentColor"/> Start focusing <ArrowRight size={16}/></button></div>
          <div className="stats-grid"><StatCard icon={Flame} label="Current streak" value={`${data.profile.streak || 5} days`} change="Keep it alive" tone="orange"/><StatCard icon={Clock3} label="Total focus" value={formatHours(allTimeMinutes)} sub={`${formatHours(todayMinutes)} today`} tone="blue"/><StatCard icon={Coins} label="Available coins" value={data.profile.coins.toLocaleString()} sub="Use them to celebrate" tone="yellow"/><StatCard icon={Zap} label="Level & XP" value={`Lvl ${currentLevel}`} change={`${data.profile.xp} total XP`} tone="purple"/></div>
          <div className="dashboard-grid"><div className="dashboard-main">
            <Panel className="daily-progress-panel"><div className="panel-heading"><div><div className="eyebrow">YOUR DAILY INTENTION</div><h2>Today’s progress</h2></div><button className="text-button" onClick={() => navTo('statistics')}>View insights <ArrowRight size={14}/></button></div><div className="progress-overview"><ProgressRing value={goalProgress} size={144} stroke={11}><div className="ring-big">{goalProgress}%</div><div className="ring-caption">of daily goal</div></ProgressRing><div className="progress-details"><div className="progress-detail-top"><div><span className="muted">Focus target</span><strong>{formatHours(data.profile.goalMinutes)}</strong></div><div><span className="muted">Focused today</span><strong>{formatHours(todayMinutes)}</strong></div></div><div className="thin-progress"><span style={{ width: `${goalProgress}%` }}/></div><div className="progress-detail-bottom"><span><CheckCircle2 size={14}/> {todayDone} of {data.tasks.length} tasks completed</span><span>{Math.max(0, data.profile.goalMinutes - todayMinutes)} min to go</span></div><button className="button button-soft" onClick={() => navTo('plan')}>Open my plan <ArrowRight size={14}/></button></div></div></Panel>
            <Panel className="focus-now-panel"><div className="focus-panel-copy"><div className="eyebrow">YOUR NEXT DEEP WORK BLOCK</div><h2>{active ? `${active.subject} session` : 'Make room for focus.'}</h2><p>{active ? (active.running ? 'You’re in the zone. Keep your momentum.' : 'Your session is paused. Pick it back up when ready.') : 'One intentional session can change the shape of your day.'}</p><div className="focus-meta"><span><Clock3 size={14}/>{active ? formatDuration(activeRemaining) : `${duration} minutes`}</span><span><BookOpen size={14}/>{active ? active.subject : subject}</span></div><button className="button button-primary" onClick={() => active ? navTo('focus') : startFocus()}>{active ? 'Return to session' : 'Start a focus session'} <ArrowRight size={15}/></button></div><div className="focus-visual"><div className="focus-orb"><span/><span/><span/><div className="focus-orb-center"><Timer size={27}/></div></div><div className="focus-orb-caption"><i/> {active?.running ? 'SESSION IN PROGRESS' : 'MAKE SPACE TO THINK'}</div></div></Panel>
            <div className="section-row"><div><div className="eyebrow">THE PEOPLE AROUND YOU</div><h2>Friends in focus</h2></div><button className="text-button" onClick={() => navTo('rooms')}>Find a room <ArrowRight size={14}/></button></div>
            <div className="friends-strip">{seedFriends.filter((f) => f.status === 'Focusing').map((friend) => <div className="friend-mini" key={friend.name}><Avatar initials={friend.initials} color={friend.color} size="lg" online/><div><b>{friend.name.split(' ')[0]}</b><span>{friend.subject}</span></div><div className="friend-status-dot"/></div>)}</div>
            <Panel className="activity-panel"><div className="panel-heading"><div><div className="eyebrow">A LITTLE MOMENTUM</div><h2>Community activity</h2></div><button className="text-button" onClick={() => navTo('community')}>See all <ArrowRight size={14}/></button></div>{data.posts.slice(0, 3).map((post) => <div className="mini-activity" key={post.id}><Avatar initials={post.initials} color={post.color} size="md"/><div className="mini-activity-copy"><b>{post.user} <span>completed {formatDuration(post.minutes * 60)} of {post.subject}</span></b><p>{post.caption}</p><small>{timeAgo(post.createdAt)}</small></div><div className="mini-likes"><Heart size={14}/>{post.likes}</div></div>)}</Panel>
          </div><div className="dashboard-side">
            <Panel className="streak-card"><div className="streak-card-top"><div><div className="eyebrow">CONSISTENCY IS EVERYTHING</div><h2>Your streak</h2></div><div className="streak-fire"><Flame size={22} fill="currentColor"/></div></div><div className="streak-number">{data.profile.streak || 5}<span>days</span></div><p>You’re showing up for yourself. Keep the chain going.</p><div className="week-dots">{['M','T','W','T','F','S','S'].map((d, i) => <div key={i} className={`week-day ${i < Math.min(5, data.profile.streak || 5) ? 'done' : ''} ${i === (new Date().getDay() + 6) % 7 ? 'today' : ''}`}><span>{d}</span><b>{i < Math.min(5, data.profile.streak || 5) ? <Check size={14}/> : '·'}</b></div>)}</div><div className="streak-note"><Flame size={13}/> 3 more days to beat your best streak</div></Panel>
            <Panel className="quick-tasks"><div className="panel-heading"><div><div className="eyebrow">STAY ON TRACK</div><h2>Today’s tasks</h2></div><button className="icon-button small" onClick={() => openTaskModal()}><Plus size={17}/></button></div><div className="task-list compact">{data.tasks.slice(0, 4).map((task) => <button className={`task-row ${task.done ? 'task-done' : ''}`} key={task.id} onClick={() => toggleTask(task.id)}><span className="task-check">{task.done && <Check size={12}/>}</span><span className="task-row-title">{task.title}<small>{task.time || 'Flexible'} · {task.minutes} min</small></span><i className={`priority-dot priority-${task.priority}`}/></button>)}</div><button className="button button-outline button-full" onClick={() => navTo('plan')}>View full plan <ArrowRight size={14}/></button></Panel>
            <Panel className="challenge-spotlight"><div className="challenge-spot-top"><span className="challenge-icon"><Trophy size={18}/></span><span className="challenge-live">IN PROGRESS</span></div><h3>10-Hour Weekly Focus</h3><p>You’re part of a community building better habits.</p><div className="challenge-mini-progress"><span style={{ width: `${Math.min(100, weekMinutes / 600 * 100)}%` }}/></div><div className="challenge-mini-meta"><b>{formatHours(weekMinutes)} <small>/ 10h</small></b><span>2 days left</span></div><button className="text-button" onClick={() => navTo('challenges')}>View challenge <ArrowRight size={14}/></button></Panel>
            <Panel className="buddy-card"><div className="buddy-top"><div className="buddy-avatars"><Avatar initials="E" color="violet" size="sm"/><Avatar initials="MC" color="coral" size="sm"/></div><span className="buddy-badge"><Lock size={11}/> LOCKMATE</span></div><h3>Better together.</h3><p>You and <b>Maya</b> are on a {data.buddy.streak}-day shared streak.</p><div className="buddy-target"><span>Shared daily target</span><b>{Math.round(data.buddy.todayMinutes / data.buddy.target * 100)}%</b></div><div className="thin-progress"><span style={{ width: `${Math.min(100, data.buddy.todayMinutes / data.buddy.target * 100)}%` }}/></div><small>{data.buddy.todayMinutes} / {data.buddy.target} focus minutes today</small></Panel>
          </div></div>
        </>}

        {view === 'focus' && <FocusPage active={active} subject={subject} setSubject={setSubject} duration={duration} setDuration={setDuration} activeRemaining={activeRemaining} activePercent={activePercent} startFocus={startFocus} pauseFocus={pauseFocus} resumeFocus={resumeFocus} finishSession={finishSession} discardFocus={discardFocus} todayMinutes={todayMinutes} sessions={data.sessions} notify={notify} profile={data.profile} patchProfile={patchProfile} />}

        {view === 'rooms' && <>
          <PageTitle eyebrow="FOCUS, SIDE BY SIDE" title="Study rooms" subtitle="Find your people. Share a little quiet. Get things done." action={<span className="demo-indicator"><i/> SIMULATED COMMUNITY</span>}/>
          {room ? <RoomView room={room} data={data} active={active} activeRemaining={activeRemaining} activePercent={activePercent} leaveRoom={leaveRoom} startFocus={startFocus} joinFocus={startRoomFocus} manageFocus={() => navTo('focus')} showRoomChat={showRoomChat} setShowRoomChat={setShowRoomChat} roomChatDraft={roomChatDraft} setRoomChatDraft={setRoomChatDraft} sendRoomMessage={sendRoomMessage} cameraOn={cameraOn} setCameraOn={setCameraOn} micOn={micOn} setMicOn={setMicOn} notify={notify}/>
          : <><div className="room-feature-banner"><div><span className="banner-kicker"><Headphones size={13}/> SHARED FOCUS, ZERO PRESSURE</span><h2>Your own little corner of the internet.</h2><p>Join a room, set a timer, and let the collective energy do its thing. No calls required.</p><button className="button button-primary" onClick={() => joinRoom('r1')}>Enter the library <ArrowRight size={15}/></button></div><div className="banner-art"><div className="banner-window"><div className="window-top"><i/><i/><i/></div><div className="window-lines"><span/><span/><span/><b/><span/></div><div className="banner-floating-avatar avatar avatar-blue">NW</div><div className="banner-floating-avatar avatar avatar-coral">MC</div><div className="banner-floating-avatar avatar avatar-pink">AP</div></div></div></div><div className="room-filter-row"><div><h2>Explore rooms</h2><p>Pick the energy that fits your next session.</p></div><div className="filter-tabs">{['All', 'Quiet', 'Coding', 'Study group', 'Deep work'].map((f) => <button key={f} className={activeRoomTab === f ? 'selected' : ''} onClick={() => setActiveRoomTab(f)}>{f}</button>)}</div></div><div className="room-grid">{seedRooms.filter((r) => activeRoomTab === 'All' || r.category === activeRoomTab).map((r) => <Panel className={`room-card room-${r.color}`} key={r.id}><div className="room-card-art"><div className="room-art-icon">{r.id === 'r2' ? <Code2/> : r.id === 'r3' ? <GraduationCap/> : r.id === 'r4' ? <Moon/> : r.id === 'r5' ? <Brain/> : <BookOpen/>}</div><span className="room-live-dot"><i/> ACTIVE</span><div className="room-art-orbit"/></div><div className="room-card-body"><div className="room-card-kicker">{r.category.toUpperCase()}</div><h3>{r.name}</h3><p>{r.subtitle}</p><div className="room-card-meta"><div className="avatar-stack">{r.avatars.slice(0, 3).map((a, i) => <Avatar key={a} initials={a} color={['coral', 'blue', 'pink'][i]} size="xs"/>)}<span className="avatar-more">+{r.people - 3}</span></div><span><Users size={13}/>{r.people} focusing</span></div><div className="room-subject"><BookMarked size={13}/>{r.subject}</div><button className="button button-outline button-full" onClick={() => joinRoom(r.id)}>Join room <ArrowRight size={14}/></button></div></Panel>)}</div><div className="simulated-note"><ShieldCheck size={15}/> Friends and room activity are simulated for this local demo. You’re not joining a live multiplayer room.</div></>}
        </>}

        {view === 'community' && <>
          <PageTitle eyebrow="MOMENTUM IS CONTAGIOUS" title="Community" subtitle="Celebrate the work, not just the outcome." action={<button className="button button-primary" onClick={() => setModal({ type: 'post' })}><Plus size={16}/> Share an update</button>}/>
          <Panel className="community-banner"><div className="community-banner-icon"><Heart size={22}/></div><div><h3>Progress looks good on everyone.</h3><p>A space for study wins, small breakthroughs, and showing up on the days it’s hard.</p></div><div className="community-banner-stats"><b>{data.posts.length + 124}</b><span>community wins this week</span></div></Panel>
          <div className="community-layout"><div className="feed-column"><div className="feed-tabs">{['For you', 'Friends', 'My posts'].map((tab) => <button key={tab} className={communityTab === tab ? 'selected' : ''} onClick={() => setCommunityTab(tab)}>{tab}</button>)}</div>{data.posts.filter((post) => communityTab === 'My posts' ? post.user === data.profile.name : communityTab === 'Friends' ? post.user !== data.profile.name : true).map((post) => <Panel className="post-card" key={post.id}><div className="post-head"><Avatar initials={post.initials} color={post.color} size="md"/><div className="post-user"><b>{post.user}</b><span>{post.subject} · {timeAgo(post.createdAt)}</span></div>{post.demo && <span className="demo-chip">DEMO</span>}{!post.demo && <button className="icon-button small post-more" onClick={() => { update('posts', (posts) => posts.filter((p) => p.id !== post.id)); notify('Your post was deleted'); }}><MoreHorizontal size={18}/></button>}</div><div className="post-session"><div className="post-session-icon"><Timer size={16}/></div><div><b>{formatDuration(post.minutes * 60)} focused</b><span>{post.subject} session</span></div><span className="post-session-tag"><Flame size={12}/> FOCUS WIN</span></div><p className="post-caption">{post.caption}</p>{post.image && <img className="post-image" src={post.image} alt="Shared update"/>}<div className="post-actions"><button className={post.liked ? 'liked' : ''} onClick={() => toggleLike(post.id)}><Heart size={17} fill={post.liked ? 'currentColor' : 'none'}/>{post.likes} likes</button><button onClick={() => document.getElementById(`comment-${post.id}`)?.focus()}><MessageCircle size={17}/>{post.comments.length} comments</button><button onClick={() => { const text = `${post.user} focused for ${post.minutes} minutes on ${post.subject} with LifeOS.`; if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(() => notify('Post summary copied')).catch(() => notify('Clipboard access is unavailable', 'error')); else notify('Clipboard access is unavailable', 'error'); }}><Share2 size={16}/>Share</button></div>{post.comments.length > 0 && <div className="comments-list">{post.comments.slice(-2).map((comment) => <div className="comment" key={comment.id}><b>{comment.user}</b><span>{comment.text}</span></div>)}</div>}<form className="comment-form" onSubmit={(e) => { e.preventDefault(); addComment(post.id); }}><Avatar initials="E" color="violet" size="xs"/><input id={`comment-${post.id}`} value={commentDrafts[post.id] || ''} onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))} placeholder="Add a little encouragement..."/><button type="submit" disabled={!(commentDrafts[post.id] || '').trim()}><Send size={15}/></button></form></Panel>)}{!data.posts.length && <EmptyState icon={Heart} title="The feed is quiet" text="Be the first to share a study win." action={<button className="button button-primary" onClick={() => setModal({ type: 'post' })}>Share an update</button>}/>}</div><div className="community-sidebar"><Panel className="community-side-card"><div className="eyebrow">YOUR CIRCLE</div><h3>Friends to cheer on</h3>{seedFriends.map((f) => <div className="circle-friend" key={f.name}><Avatar initials={f.initials} color={f.color} size="sm" online={f.status === 'Focusing'}/><div><b>{f.name}</b><span>{f.status === 'Focusing' ? `Focusing · ${f.subject}` : f.status}</span></div><button className="icon-button tiny" onClick={() => notify(`Cheered on ${f.name}!`)}><Heart size={14}/></button></div>)}</Panel><Panel className="community-side-card community-prompt"><span className="prompt-icon"><Sparkles size={17}/></span><h3>Today’s reminder</h3><p>“You do not have to see the whole staircase. Just take the first step.”</p><span>— Martin Luther King Jr.</span></Panel><div className="simulated-note"><ShieldCheck size={14}/> Demo friend profiles and seeded posts are simulated.</div></div></div>
        </>}

        {view === 'plan' && <>
          <PageTitle eyebrow="MAKE SPACE FOR WHAT MATTERS" title="Your plan" subtitle="A flexible plan is a promise to your future self." action={<><button className="button button-soft" onClick={generateDay}><WandSparkles size={15}/> Generate my day</button><button className="button button-primary" onClick={() => openTaskModal()}><Plus size={16}/> Add task</button></>}/>
          <div className="plan-summary-grid"><Panel className="plan-summary"><div className="summary-icon purple"><Target size={19}/></div><span>Daily focus goal</span><b>{formatHours(data.profile.goalMinutes)}</b><small>{goalProgress}% completed today</small></Panel><Panel className="plan-summary"><div className="summary-icon blue"><CheckCircle2 size={19}/></div><span>Tasks completed</span><b>{todayDone}<small> / {data.tasks.length}</small></b><small>One task at a time</small></Panel><Panel className="plan-summary"><div className="summary-icon orange"><Clock3 size={19}/></div><span>Planned time left</span><b>{formatHours(data.tasks.filter((t) => !t.done).reduce((a, t) => a + t.minutes, 0))}</b><small>Across unfinished tasks</small></Panel></div>
          <div className="plan-layout"><Panel className="timeline-panel"><div className="panel-heading"><div><div className="eyebrow">{prettyDate().toUpperCase()}</div><h2>Daily timeline</h2></div><div className="task-filter"><button className={taskFilter === 'all' ? 'selected' : ''} onClick={() => setTaskFilter('all')}>All</button><button className={taskFilter === 'pending' ? 'selected' : ''} onClick={() => setTaskFilter('pending')}>To do</button><button className={taskFilter === 'done' ? 'selected' : ''} onClick={() => setTaskFilter('done')}>Done</button></div></div>{data.tasks.filter((t) => taskFilter === 'all' || (taskFilter === 'pending' ? !t.done : t.done)).sort((a, b) => (a.time || '23:59').localeCompare(b.time || '23:59')).length ? <div className="timeline-list">{data.tasks.filter((t) => taskFilter === 'all' || (taskFilter === 'pending' ? !t.done : t.done)).sort((a, b) => (a.time || '23:59').localeCompare(b.time || '23:59')).map((task) => <div className={`timeline-item ${task.done ? 'timeline-complete' : ''}`} key={task.id}><div className="timeline-time">{task.time || 'Anytime'}<span>{task.minutes}m</span></div><div className="timeline-marker"><span>{task.done && <Check size={12}/>}</span></div><div className="timeline-task"><div className="timeline-task-top"><div><h3>{task.title}</h3><p>{task.subject} <i/> {task.minutes} min</p></div><span className={`priority-label priority-${task.priority}`}>{task.priority}</span></div><div className="timeline-actions"><button className="text-button" onClick={() => toggleTask(task.id)}>{task.done ? <><RotateCcw size={13}/> Reopen</> : <><CheckCircle2 size={13}/> Mark complete</>}</button><button className="icon-button tiny" onClick={() => openTaskModal(task)}><Pencil size={13}/></button><button className="icon-button tiny" onClick={() => deleteTask(task.id)}><Trash2 size={13}/></button></div></div></div>)}</div> : <EmptyState icon={ListTodo} title="Nothing on this list" text="Add a task or change your filter." action={<button className="button button-primary" onClick={() => openTaskModal()}>Add a task</button>}/>}</Panel><div className="plan-aside"><Panel className="availability-card"><div className="eyebrow">PLAN AROUND REAL LIFE</div><h3>Available study time</h3><p>How much focused time can you realistically fit into today?</p><div className="availability-options">{[120, 180, 240, 360].map((v) => <button key={v} className={planningMinutes === v ? 'selected' : ''} onClick={() => setPlanningMinutes(v)}>{v / 60}h</button>)}</div><small>Generate My Day will prioritize high-importance tasks and defer what doesn’t fit.</small></Panel><Panel className="goal-edit-card"><div className="eyebrow">AIM WITH INTENTION</div><h3>Daily focus goal</h3><p>Set the amount of deep work you want to make room for.</p><div className="goal-options">{[60, 120, 180, 240].map((n) => <button key={n} className={data.profile.goalMinutes === n ? 'selected' : ''} onClick={() => { patchProfile({ goalMinutes: n }); notify('Daily focus goal updated'); }}>{n / 60}h</button>)}</div><div className="goal-progress-row"><span>Today</span><b>{todayMinutes} / {data.profile.goalMinutes} min</b></div><div className="thin-progress"><span style={{ width: `${goalProgress}%` }}/></div></Panel><Panel className="plan-tip"><div className="tip-icon"><Coffee size={18}/></div><h3>Remember to reset.</h3><p>Short breaks are part of focused work. Try 50 minutes on, then a 10-minute breather.</p><button className="text-button" onClick={() => { setSubject('Reading'); setDuration(25); navTo('focus'); }}>Try a focus block <ArrowRight size={14}/></button></Panel></div></div>
        </>}

        {view === 'challenges' && <>
          <PageTitle eyebrow="A LITTLE FRIENDLY COMPETITION" title="Challenges" subtitle="Make a commitment. Find your pace. Celebrate the progress." action={<span className="demo-indicator"><i/> COMMUNITY DEMO</span>}/>
          <Panel className="challenge-feature"><div className="challenge-feature-copy"><span className="banner-kicker"><Trophy size={13}/> THIS WEEK’S FEATURED CHALLENGE</span><h2>Small sessions.<br/><span>Big momentum.</span></h2><p>Join people around you in making focus a daily habit. Every minute you complete moves you forward.</p><button className="button button-light" onClick={() => navTo('leaderboard')}>See the leaderboard <ArrowRight size={15}/></button></div><div className="challenge-feature-art"><div className="trophy-platform"><Trophy size={68}/></div><div className="sparkle s1">✦</div><div className="sparkle s2">✧</div><div className="sparkle s3">✦</div></div></Panel>
          <div className="section-row challenge-section-heading"><div><div className="eyebrow">FIND YOUR NEXT MILESTONE</div><h2>Open challenges</h2></div><span className="subtle-count">{data.challenges.length} challenges</span></div><div className="challenge-grid">{data.challenges.map((ch, i) => { const joined = data.joinedChallengeIds.includes(ch.id); const myProgress = ch.id === 'ch1' ? Math.min(100, weekMinutes / ch.target * 100) : ch.id === 'ch4' ? Math.min(100, todayMinutes / ch.target * 100) : Math.min(100, (data.sessions.filter((s) => s.date >= dateOffset(-6)).reduce((a, s) => a + s.minutes, 0) / ch.target) * 100); return <Panel className="challenge-card" key={ch.id}><div className={`challenge-card-icon ch-icon-${i}`}><>{ch.icon === 'target' ? <Target/> : ch.icon === 'zap' ? <Zap/> : ch.icon === 'trophy' ? <Trophy/> : <Flame/>}</></div><div className="challenge-card-top"><span>{joined ? 'YOU’RE IN' : 'OPEN TO JOIN'}</span><span><Users size={13}/>{ch.participants}</span></div><h3>{ch.title}</h3><p>{ch.description}</p><div className="challenge-target"><b>{formatHours(Math.min(ch.target, Math.round(ch.target * myProgress / 100)))}</b><span>of {formatHours(ch.target)}</span></div><div className="thin-progress"><span style={{ width: `${myProgress}%` }}/></div><div className="challenge-card-foot"><span><Clock3 size={13}/>{ch.endsIn}</span><span><Coins size={13}/>{ch.reward} coins</span></div><button className={`button ${joined ? 'button-soft' : 'button-outline'} button-full`} onClick={() => joinChallenge(ch.id)}>{joined ? <><Check size={15}/> Joined · Leave</> : <>Join challenge <ArrowRight size={14}/></>}</button></Panel>; })}</div><div className="simulated-note"><ShieldCheck size={15}/> Challenge participants and countdowns are sample data. Your progress is calculated from locally saved focus sessions.</div>
        </>}

        {view === 'leaderboard' && <>
          <PageTitle eyebrow="CONSISTENCY OVER EVERYTHING" title="Leaderboard" subtitle="A little friendly competition can go a long way." action={<span className="demo-indicator"><i/> WEEKLY DEMO DATA</span>}/>
          <div className="leaderboard-hero"><div><div className="eyebrow">YOUR CURRENT POSITION</div><div className="rank-number">#{leaderboardRank}<span> / {sortedLeaderboard.length}</span></div><p>You’re making progress. Keep your focus streak alive.</p></div><div className="leaderboard-hero-side"><Trophy size={29}/><div><b>{formatHours(weekMinutes)}</b><span>focused this week</span></div></div></div>
          <Panel className="leaderboard-panel"><div className="panel-heading"><div><div className="eyebrow">THE PEOPLE SHOWING UP</div><h2>Weekly rankings</h2></div><div className="filter-tabs">{[{ id: 'weekly', label: 'Focus time' }, { id: 'xp', label: 'XP' }, { id: 'streak', label: 'Streak' }].map((t) => <button key={t.id} className={leaderTab === t.id ? 'selected' : ''} onClick={() => setLeaderTab(t.id)}>{t.label}</button>)}</div></div><div className="leader-table"><div className="leader-row leader-head"><span>RANK</span><span>MEMBER</span><span>{leaderTab === 'weekly' ? 'FOCUS TIME' : leaderTab === 'xp' ? 'TOTAL XP' : 'STREAK'}</span><span>STATUS</span></div>{sortedLeaderboard.map((person, i) => <div className={`leader-row ${person.self ? 'leader-self' : ''}`} key={person.name}><span className={`leader-rank ${i < 3 ? `rank-${i + 1}` : ''}`}>{i === 0 ? <Trophy size={15}/> : `0${i + 1}`}</span><div className="leader-member"><Avatar initials={person.initials} color={person.color} size="md"/><div><b>{person.name} {person.self && <small>YOU</small>}</b><span>{person.self ? 'Your personal progress' : 'Community member'}</span></div></div><b className="leader-score">{leaderTab === 'weekly' ? `${person.hours.toFixed(1)}h` : leaderTab === 'xp' ? `${person.xp.toLocaleString()} XP` : `${person.streak} days`}</b><span className="leader-status">{person.self ? <em>That’s you</em> : <><i className={person.status === 'Focusing' ? 'status-green' : 'status-muted'}/>{person.status}</>}</span></div>)}</div><div className="leaderboard-foot"><span><ShieldCheck size={14}/> Demo rankings include seeded community members.</span><button className="text-button" onClick={() => navTo('statistics')}>Your stats <ArrowRight size={14}/></button></div></Panel>
          <div className="lockmate-grid"><Panel className="lockmate-card"><div className="lockmate-graphic"><div className="lockmate-avatar la-one">E</div><div className="lockmate-link"><Lock size={16}/></div><div className="lockmate-avatar la-two">MC</div></div><div><div className="eyebrow">ACCOUNTABILITY, BUILT IN</div><h3>Your Lockmate</h3><p>Stay accountable with a study buddy. You and Maya share a daily target and celebrate each other’s consistency.</p><div className="buddy-shared-line"><span>{data.buddy.streak}-day shared streak</span><span>{data.buddy.todayMinutes}/{data.buddy.target} min today</span></div><div className="thin-progress"><span style={{ width: `${Math.min(100, data.buddy.todayMinutes / data.buddy.target * 100)}%` }}/></div></div></Panel><Panel className="lockmate-info"><span className="lockmate-info-icon"><Users size={20}/></span><h3>Accountability works.</h3><p>Shared goals turn “I’ll do it later” into “we’ve got this”. Your Lockmate’s activity is simulated in this MVP.</p><button className="button button-soft button-full" onClick={() => notify('Maya sent you a focus nudge. You’ve got this!')}>Send a focus nudge <Send size={14}/></button></Panel></div>
        </>}

        {view === 'statistics' && <>
          <PageTitle eyebrow="YOUR EFFORT, MADE VISIBLE" title="Statistics" subtitle="Look back at how far you’ve come. Then keep going." action={<div className="period-pill"><Calendar size={14}/> Last 7 days <ChevronDown size={14}/></div>}/>
          <div className="stats-grid stats-grid-3"><StatCard icon={Clock3} label="Focus this week" value={formatHours(weekMinutes)} change="Your last 7 days" tone="blue"/><StatCard icon={CheckCheck} label="Completed sessions" value={data.sessions.filter((s) => s.date >= dateOffset(-6)).length} sub={`${data.sessions.length} total sessions`} tone="purple"/><StatCard icon={Flame} label="Current streak" value={`${data.profile.streak || 5} days`} change="Keep your rhythm" tone="orange"/></div>
          <div className="analytics-grid"><Panel className="chart-panel"><div className="panel-heading"><div><div className="eyebrow">SHOWING UP ADDS UP</div><h2>Focus activity</h2></div><span className="chart-total">{formatHours(weekMinutes)} <small>total</small></span></div><div className="bar-chart"><div className="chart-y-labels"><span>3h</span><span>2h</span><span>1h</span><span>0</span></div><div className="chart-bars">{weeklyBars.map((b, i) => <div className="chart-bar-column" key={i}><div className="bar-track"><span className={b.today ? 'bar-today' : ''} style={{ height: `${Math.max(3, b.minutes / 180 * 100)}%` }} title={`${b.minutes} minutes`}/></div><span className={b.today ? 'today-label' : ''}>{b.label}</span></div>)}</div></div><div className="chart-legend"><span><i/> Focus minutes per day</span><span>Daily goal: {formatHours(data.profile.goalMinutes)}</span></div></Panel><Panel className="subject-panel"><div className="panel-heading"><div><div className="eyebrow">WHERE YOUR TIME GOES</div><h2>Subject breakdown</h2></div></div><div className="subject-donut-wrap"><div className="subject-donut" style={{ background: `conic-gradient(${Object.keys(subjectMap).map((name, i) => { const colors = ['#9b7bff', '#42b8ed', '#ec83b3', '#efad62', '#5ac9a6', '#6f82ef']; const start = Object.keys(subjectMap).slice(0, i).reduce((a, n) => a + subjectMap[n] / subjectTotal * 100, 0); return `${colors[i % colors.length]} ${start}% ${start + subjectMap[name] / subjectTotal * 100}%`; }).join(', ')})` }}><div><b>{formatHours(subjectTotal)}</b><span>total focus</span></div></div></div><div className="subject-legend">{Object.entries(subjectMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, minutes], i) => <div key={name}><span className={`subject-color sc-${i}`}/><span>{name}</span><b>{formatHours(minutes)}</b><small>{Math.round(minutes / subjectTotal * 100)}%</small></div>)}</div></Panel></div>
          <div className="analytics-bottom-grid"><Panel className="weekday-panel"><div className="eyebrow">YOUR RHYTHM</div><h2>Daily breakdown</h2>{weeklyBars.map((b, i) => <div className="weekday-row" key={i}><span>{b.label}</span><div className="thin-progress"><span style={{ width: `${Math.min(100, b.minutes / 180 * 100)}%` }}/></div><b>{b.minutes}m</b></div>)}</Panel><Panel className="insight-panel"><span className="insight-spark"><Sparkles size={18}/></span><div className="eyebrow">A PATTERN WORTH NOTICING</div><h3>Your effort has a rhythm.</h3><p>{weeklyBars.reduce((best, cur) => cur.minutes > best.minutes ? cur : best, weeklyBars[0]).label} is your strongest focus day this week. Consider protecting a similar time block next week.</p><button className="text-button" onClick={() => navTo('coach')}>Talk to your coach <ArrowRight size={14}/></button></Panel></div>
          <div className="section-row achievement-heading"><div><div className="eyebrow">LITTLE MILESTONES, BIG DEAL</div><h2>Your achievements</h2></div><span className="subtle-count">Earned by showing up</span></div><div className="achievement-grid">{[{ icon: Star, title: 'First focus win', detail: 'Complete your first focus session', earned: data.sessions.length > 0, tone: 'purple' }, { icon: Flame, title: 'Five-day rhythm', detail: 'Build a five-day focus streak', earned: (data.profile.streak || 0) >= 5, tone: 'orange' }, { icon: Clock3, title: '10-hour week', detail: 'Focus for ten hours in one week', earned: weekMinutes >= 600, tone: 'blue' }, { icon: CheckCheck, title: 'Plan in motion', detail: 'Complete three planned tasks', earned: data.tasks.filter((t) => t.done).length >= 3, tone: 'green' }].map((badge) => <Panel className={`achievement-card ${badge.earned ? 'earned' : 'locked'}`} key={badge.title}><span className={`achievement-icon ${badge.tone}`}><badge.icon size={19}/></span><div><b>{badge.title}</b><p>{badge.detail}</p></div><span className="achievement-state">{badge.earned ? <><CheckCircle2 size={13}/> UNLOCKED</> : <><Lock size={12}/> LOCKED</>}</span></Panel>)}</div>
        </>}

        {view === 'coach' && <>
          <PageTitle eyebrow="A CLEARER WAY FORWARD" title="Your AI Coach" subtitle="Thoughtful guidance, powered by transparent local logic." action={<span className="coach-demo-badge"><Sparkles size={13}/> SMART COACH · DEMO</span>}/>
          <div className="coach-hero"><div className="coach-avatar"><div><Brain size={28}/></div><span/></div><div className="coach-hero-copy"><span className="coach-status"><i/> READY WHEN YOU ARE</span><h2>Let’s make your next move a good one.</h2><p>I look at your local focus history and task list to suggest a plan that feels doable, not overwhelming.</p></div><div className="coach-hero-spark">✦</div></div>
          <div className="coach-grid"><div className="coach-main"><Panel className="coach-insights"><div className="panel-heading"><div><div className="eyebrow">BASED ON YOUR RECENT ACTIVITY</div><h2>Your productivity snapshot</h2></div><span className="local-logic-tag"><Lock size={11}/> LOCAL LOGIC</span></div><div className="insight-stat-row"><div><b>{formatHours(weekMinutes)}</b><span>Focus this week</span></div><div><b>{data.sessions.filter((s) => s.date >= dateOffset(-6)).length}</b><span>Sessions logged</span></div><div><b>{todayDone}/{data.tasks.length}</b><span>Tasks completed</span></div></div><div className="coach-observation"><span className="observation-icon"><Activity size={17}/></span><div><b>{weekMinutes >= 300 ? 'You’re building a consistent rhythm.' : 'There is room to build momentum.'}</b><p>{weekMinutes >= 300 ? `You’ve focused for ${formatHours(weekMinutes)} in the last seven days. Protect your best study windows and keep sessions intentional.` : 'A few short, repeatable sessions can build a stronger baseline than one exhausting catch-up day. Start with 25 minutes.'}</p></div></div><div className="coach-observation"><span className="observation-icon blue"><CalendarCheck size={17}/></span><div><b>{data.tasks.filter((t) => !t.done).length} tasks are still on your list.</b><p>Prioritize the important work first. Leave room for breaks and avoid stacking every task back-to-back.</p></div></div></Panel><Panel className="coach-suggestions"><div className="eyebrow">YOUR NEXT BEST MOVES</div><h2>Three things to try today</h2>{[{ icon: Target, title: 'Start with one high-priority task', text: 'Give your most important task a protected 25-minute block.' }, { icon: Coffee, title: 'Take a real break', text: 'Step away from the screen between sessions. Rest is productive too.' }, { icon: Users, title: 'Borrow some momentum', text: 'Join a quiet study room and make focus feel less lonely.' }].map((s, i) => <div className="suggestion-row" key={s.title}><span className={`suggestion-number n-${i}`}>0{i + 1}</span><span className="suggestion-icon"><s.icon size={17}/></span><div><b>{s.title}</b><p>{s.text}</p></div><button className="icon-button tiny" onClick={() => i === 0 ? navTo('plan') : i === 1 ? notify('Break reminder set for your next session') : navTo('rooms')}><ArrowUpRight size={15}/></button></div>)}</Panel>
          </div></div><Panel className="recovery-panel"><div className="recovery-panel-head"><div className="recovery-icon"><RotateCcw size={19}/></div><div><span className="eyebrow">NO GUILT. JUST A RESET.</span><h2>AI Life Recovery Mode</h2><p>Missed a few things? Let’s make a realistic plan with the time you actually have left.</p></div><span className="recovery-feature-label">SMART RE-SCHEDULING</span></div><div className="recovery-controls"><div><label htmlFor="remaining-time">How much time do you have left today?</label><div className="recovery-time-options">{[60, 90, 120, 180, 240].map((v) => <button key={v} className={recoveryMinutes === v ? 'selected' : ''} onClick={() => setRecoveryMinutes(v)}>{v < 60 ? `${v}m` : `${v / 60}h`}</button>)}</div></div><div className="recovery-summary"><span>{data.tasks.filter((t) => !t.done).length} unfinished tasks</span><b>{formatHours(data.tasks.filter((t) => !t.done).reduce((a, t) => a + t.minutes, 0))} estimated work</b></div><button className="button button-primary" onClick={makeRecoveryPlan}><WandSparkles size={16}/> Build my recovery plan <ArrowRight size={14}/></button></div>{recoveryResult && <div className="recovery-results"><div className="recovery-message"><Sparkles size={18}/><div><b>You haven’t fallen behind. Your plan just needs a reset.</b><p>We protected your highest-priority work and moved the rest instead of cramming everything into today.</p></div></div><div className="recovery-result-grid"><div><h3><CheckCircle2 size={15}/> Do today ({recoveryResult.todayItems.length})</h3>{recoveryResult.todayItems.length ? recoveryResult.todayItems.map((t, i) => <div className="recovery-task" key={t.id}><span>{t.suggestedTime}</span><b>{t.title}</b><small>{t.minutes}m</small></div>) : <p className="muted">No tasks fit this time window. Take a break or choose a smaller task.</p>}</div><div><h3><Calendar size={15}/> Move to tomorrow ({recoveryResult.tomorrowItems.length})</h3>{recoveryResult.tomorrowItems.length ? recoveryResult.tomorrowItems.map((t) => <div className="recovery-task moved" key={t.id}><span className={`priority-dot priority-${t.priority}`}/><b>{t.title}</b><small>{t.minutes}m</small></div>) : <p className="muted">Nothing needs to move. Nice work.</p>}</div></div><button className="button button-soft" onClick={() => { if (recoveryResult.todayItems.length) update('tasks', (tasks) => tasks.map((t) => recoveryResult.todayItems.find((x) => x.id === t.id) ? { ...t, time: recoveryResult.todayItems.find((x) => x.id === t.id).suggestedTime } : t)); setRecoveryResult(null); notify('Recovery schedule applied to your plan'); navTo('plan'); }}>Apply today’s schedule <ArrowRight size={14}/></button></div>}</Panel><div className="coach-disclaimer"><ShieldCheck size={14}/> LifeOS Smart Coach is a local rules-based demo, not a connected AI model. Your data stays in this browser.</div>
        </>}
      </div>
    </main>
    <Toast toast={toast}/>

    {modal?.type === 'task' && <Modal title={taskDraft ? 'Edit task' : 'Add to your plan'} subtitle="Keep it clear, specific, and doable." onClose={() => setModal(null)}><form className="modal-form" onSubmit={addTask}><label>Task name<input autoFocus required value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="e.g. Review recursion problems"/></label><div className="form-two-col"><label>Subject<select value={taskForm.subject} onChange={(e) => setTaskForm({ ...taskForm, subject: e.target.value })}>{['Programming', 'Mathematics', 'Reading', 'Science', 'Data Structures', 'Database Systems', 'System Analysis', 'Personal'].map((s) => <option key={s}>{s}</option>)}</select></label><label>Priority<select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label></div><div className="form-two-col"><label>Estimated duration (min)<input type="number" min="5" max="600" value={taskForm.minutes} onChange={(e) => setTaskForm({ ...taskForm, minutes: e.target.value })}/></label><label>Planned start<input type="time" value={taskForm.time} onChange={(e) => setTaskForm({ ...taskForm, time: e.target.value })}/></label></div><div className="modal-actions"><button type="button" className="button button-ghost" onClick={() => setModal(null)}>Cancel</button><button type="submit" className="button button-primary">{taskDraft ? 'Save changes' : 'Add task'} <ArrowRight size={14}/></button></div></form></Modal>}
    {modal?.type === 'completed' && <Modal title="That’s a focus win." subtitle="You showed up for yourself. That matters." onClose={() => setModal(null)}><div className="completion-celebration"><div className="completion-burst"><Sparkles size={30}/></div><div className="completion-reward"><div><b>{modal.dailyBonus ? '+50' : '+20'}</b><span>XP earned</span></div><div><b>{modal.dailyBonus ? '+32' : '+12'}</b><span>coins earned</span></div><div><b>{data.sessions[0]?.minutes || 1}m</b><span>focused</span></div></div>{modal.dailyBonus && <div className="daily-bonus-note"><Gift size={14}/> Daily focus goal unlocked · +30 bonus XP</div>}<div className="completion-quote">“Small steps every day add up to remarkable results.”</div></div><div className="modal-actions modal-actions-stack"><button className="button button-primary button-full" onClick={() => { setModal({ type: 'share' }); setShareCaption(`Just completed a ${data.sessions[0]?.minutes || 1}-minute ${data.sessions[0]?.subject || 'focus'} session. One step closer. ✨`); }}>Share this win <Share2 size={15}/></button><button className="button button-ghost button-full" onClick={() => setModal(null)}>Keep it private for now</button></div></Modal>}
    {modal?.type === 'share' && <Modal title="Share your focus win" subtitle="Your progress might inspire someone else." onClose={() => setModal(null)}><div className="share-preview"><Avatar initials="E" color="violet" size="md"/><div><b>{data.profile.name}</b><span>{data.sessions[0]?.subject || 'Focus'} · {data.sessions[0]?.minutes || 1} minutes focused</span></div><span className="post-session-tag"><Flame size={12}/> FOCUS WIN</span></div><label className="share-caption-label">Add a caption<textarea rows="3" value={shareCaption} onChange={(e) => setShareCaption(e.target.value)} maxLength={220}/></label><label className="upload-image"><ImagePlus size={16}/>{shareImage ? 'Change photo' : 'Attach a photo (optional)'}<input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = () => setShareImage(reader.result); reader.readAsDataURL(file); } }}/></label>{shareImage && <div className="share-image-preview"><img src={shareImage} alt="Selected attachment"/><button className="icon-button" onClick={() => setShareImage('')}><X size={15}/></button></div>}<div className="modal-actions"><button className="button button-ghost" onClick={() => { setModal(null); setShareImage(''); }}>Cancel</button><button className="button button-primary" onClick={shareCompletedSession}>Share to community <Send size={14}/></button></div></Modal>}
    {modal?.type === 'post' && <Modal title="Share a little progress" subtitle="It doesn’t have to be a big win to be worth sharing." onClose={() => setModal(null)}><div className="share-preview"><Avatar initials="E" color="violet" size="md"/><div><b>{data.profile.name}</b><span>Community update</span></div></div><label className="share-caption-label">What’s on your mind?<textarea rows="4" maxLength={220} value={shareCaption} onChange={(e) => setShareCaption(e.target.value)} placeholder="A small win, a breakthrough, or a reminder..."/></label><label className="upload-image"><ImagePlus size={16}/>Attach a photo (optional)<input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = () => setShareImage(reader.result); reader.readAsDataURL(file); } }}/></label>{shareImage && <div className="share-image-preview"><img src={shareImage} alt="Selected attachment"/><button className="icon-button" onClick={() => setShareImage('')}><X size={15}/></button></div>}<div className="modal-actions"><button className="button button-ghost" onClick={() => setModal(null)}>Cancel</button><button className="button button-primary" onClick={() => { const post = { id: uid(), user: data.profile.name, initials: data.profile.name.slice(0, 2).toUpperCase(), color: 'violet', subject: 'Community update', minutes: 0, caption: shareCaption.trim() || 'Showing up, one step at a time.', createdAt: new Date().toISOString(), likes: 0, comments: [], liked: false, image: shareImage, demo: false }; update('posts', (posts) => [post, ...posts]); setModal(null); setShareImage(''); notify('Your update is live in the community'); }}>Post update <Send size={14}/></button></div></Modal>}
    {modal?.type === 'profile' && <Modal title="Your profile" subtitle="A little context helps make LifeOS yours." onClose={() => setModal(null)}><form className="modal-form" onSubmit={(e) => { e.preventDefault(); notify('Profile updated'); setModal(null); }}><div className="profile-edit-head"><Avatar initials={data.profile.name.slice(0, 1).toUpperCase()} color="violet" size="xl"/><div><b>{data.profile.handle}</b><span>Level {currentLevel} · {data.profile.xp} XP</span></div></div><label>Display name<input value={data.profile.name} onChange={(e) => patchProfile({ name: e.target.value })}/></label><label>Daily focus goal<select value={data.profile.goalMinutes} onChange={(e) => patchProfile({ goalMinutes: Number(e.target.value) })}><option value="60">1 hour</option><option value="120">2 hours</option><option value="180">3 hours</option><option value="240">4 hours</option></select></label><div className="modal-actions"><button type="button" className="button button-ghost" onClick={() => setModal(null)}>Cancel</button><button type="submit" className="button button-primary">Save profile</button></div></form></Modal>}
    {modal?.type === 'settings' && <Modal title="Preferences" subtitle="Choose how LifeOS fits into your day." onClose={() => setModal(null)}><div className="settings-list"><div><div><b>Open the share composer after a session</b><span>You’ll still choose whether to publish or keep it private.</span></div><button className={`toggle ${data.profile.shareByDefault ? 'on' : ''}`} onClick={() => patchProfile({ shareByDefault: !data.profile.shareByDefault })}><i/></button></div><div><div><b>Sound notifications</b><span>Visual feedback is always enabled in this demo.</span></div><button className={`toggle ${data.preferences.sound ? 'on' : ''}`} onClick={() => update('preferences', { ...data.preferences, sound: !data.preferences.sound })}><i/></button></div></div><div className="modal-actions"><button className="button button-primary" onClick={() => setModal(null)}>Done</button></div></Modal>}
    {modal?.type === 'reset' && <Modal title="Reset demo data?" subtitle="This clears locally saved sessions, tasks, posts, rewards, and preferences." onClose={() => setModal(null)}><div className="reset-warning"><RotateCcw size={23}/><p>Your progress will return to the original sample state. This cannot be undone.</p></div><div className="modal-actions"><button className="button button-ghost" onClick={() => setModal(null)}>Keep my data</button><button className="button button-danger" onClick={resetDemo}>Reset LifeOS</button></div></Modal>}
  </div>;
}

function FocusPage({ active, subject, setSubject, duration, setDuration, activeRemaining, activePercent, startFocus, pauseFocus, resumeFocus, finishSession, discardFocus, todayMinutes, sessions, notify, profile, patchProfile }) {
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const timerValue = active ? formatDuration(activeRemaining) : formatDuration(duration * 60);
  const subjects = [{ name: 'Programming', icon: Code2 }, { name: 'Mathematics', icon: Target }, { name: 'Reading', icon: BookOpen }, { name: 'Science', icon: Brain }];
  return <><PageTitle eyebrow="PROTECT YOUR ATTENTION" title="Focus mode" subtitle="One thing at a time. Give it your full attention." action={<span className="focus-private-tag"><Lock size={12}/> PRIVATE BY DEFAULT</span>}/><div className="focus-workspace"><Panel className="timer-panel"><div className="timer-panel-heading"><span className="timer-live-indicator"><i/>{active?.running ? 'FOCUS IN PROGRESS' : active ? 'SESSION PAUSED' : 'READY WHEN YOU ARE'}</span><span className="timer-mode-label">DEEP WORK MODE</span></div><div className="timer-main"><div className="timer-halo"><div className="timer-halo-inner"/><ProgressRing value={active ? activePercent : 0} size={280} stroke={7} color="cyan"><div className="timer-readout"><span className="timer-digits">{timerValue}</span><span className="timer-caption">{active ? active.subject.toUpperCase() : 'MINUTES OF FOCUS'}</span></div></ProgressRing><div className="timer-orbit-dot"/></div></div>{active ? <div className="timer-controls"><button className="button button-primary button-lg" onClick={active.running ? pauseFocus : resumeFocus}>{active.running ? <><Pause size={17} fill="currentColor"/> Pause session</> : <><Play size={17} fill="currentColor"/> Resume session</>}</button><button className="button button-soft" onClick={() => finishSession('manual')}><CheckCircle2 size={16}/> Finish session</button><button className="icon-button end-session-button" title="End without saving" onClick={() => setShowEndConfirm(true)}><X size={17}/></button></div> : <><div className="focus-subjects"><span>CHOOSE YOUR FOCUS</span><div>{subjects.map((s) => <button key={s.name} onClick={() => setSubject(s.name)} className={subject === s.name ? 'selected' : ''}><s.icon size={16}/>{s.name}</button>)}</div></div><div className="duration-select"><span>SESSION LENGTH</span><div>{[25, 50, 90].map((m) => <button key={m} className={duration === m ? 'selected' : ''} onClick={() => setDuration(m)}><b>{m}</b><small>min</small></button>)}</div></div><button className="button button-primary button-lg start-timer-button" onClick={startFocus}><Play size={17} fill="currentColor"/> Start focusing <ArrowRight size={16}/></button></>}
            <div className="timer-privacy-note"><Lock size={13}/> This session is private. You choose what to share when you finish.</div></Panel><div className="focus-side"><Panel className="focus-quote"><span className="quote-mark">“</span><blockquote>Deep work is the ability to focus without distraction on a cognitively demanding task.</blockquote><span>— Cal Newport</span><div className="quote-decoration">✳</div></Panel><Panel className="focus-today-card"><div className="eyebrow">YOUR DAY, SO FAR</div><h3>{formatDuration(todayMinutes * 60)}</h3><p>of intentional focus today</p><div className="thin-progress"><span style={{ width: `${Math.min(100, todayMinutes / profile.goalMinutes * 100)}%` }}/></div><div className="focus-today-meta"><span>Daily goal</span><b>{Math.round(todayMinutes / profile.goalMinutes * 100)}%</b></div></Panel><Panel className="focus-history-card"><div className="panel-heading"><div><div className="eyebrow">KEEP THE MOMENTUM</div><h3>Recent sessions</h3></div><span className="history-count">{sessions.length}</span></div>{sessions.slice(0, 4).map((s) => <div className="history-row" key={s.id}><span className="history-subject-icon"><BookOpen size={14}/></span><div><b>{s.subject}</b><span>{s.date === todayKey() ? 'Today' : new Date(`${s.date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></div><strong>{s.minutes}m</strong></div>)}</Panel></div></div>{showEndConfirm && <Modal title="End this session?" subtitle="This session won’t count toward your focus stats or rewards." onClose={() => setShowEndConfirm(false)}><div className="reset-warning"><X size={22}/><p>You’ve already spent time focusing. You can finish the session to save your effort, or end without saving.</p></div><div className="modal-actions"><button className="button button-ghost" onClick={() => setShowEndConfirm(false)}>Keep focusing</button><button className="button button-danger" onClick={() => { discardFocus(); setShowEndConfirm(false); }}>End without saving</button></div></Modal>}</>;
}

function RoomView({ room, data, active, activeRemaining, activePercent, leaveRoom, joinFocus, manageFocus, showRoomChat, setShowRoomChat, roomChatDraft, setRoomChatDraft, sendRoomMessage, cameraOn, setCameraOn, micOn, setMicOn, notify }) {
  const people = seedFriends.slice(0, 4);
  const messages = data.roomMessages[room.id] || [];
  return <><div className="room-inside-head"><div><button className="back-link" onClick={leaveRoom}><ChevronLeft size={14}/> All rooms</button><div className="room-inside-title"><span className={`room-title-icon room-${room.color}`}><BookOpen size={19}/></span><div><h1>{room.name}</h1><p><i/> {room.people + (data.joinedRoomId === room.id ? 1 : 0)} people focusing · {room.subject}</p></div></div></div><button className="button button-soft" onClick={leaveRoom}>Leave room <X size={14}/></button></div><div className="room-inside-grid"><div className="room-focus-column"><Panel className="room-session-panel"><div className="room-session-top"><div><span className="timer-live-indicator"><i/> ROOM IS ACTIVE</span><h2>Focus, together.</h2><p>Everyone here is working on their own thing. No pressure to talk.</p></div><div className="room-active-stack"><Avatar initials="MC" color="coral" size="sm" online/><Avatar initials="AP" color="pink" size="sm" online/><Avatar initials="NW" color="blue" size="sm" online/><span>+{room.people - 3}</span></div></div><div className="room-timer-stage"><div className="room-timer-glow"><ProgressRing value={active ? activePercent : 0} size={210} stroke={6} color="cyan"><div className="room-timer-readout"><b>{active ? formatDuration(activeRemaining) : '25:00'}</b><span>{active ? active.subject : 'READY TO FOCUS'}</span></div></ProgressRing></div>{active ? <button className="button button-primary" onClick={manageFocus}><Timer size={15}/> Open timer controls</button> : <button className="button button-primary" onClick={joinFocus}><Play size={15} fill="currentColor"/> Start a focus session</button>}</div><div className="room-participants-row"><div className="eyebrow">IN THE ROOM RIGHT NOW</div><div className="room-participant-grid">{people.map((p) => <div key={p.name} className="room-participant"><Avatar initials={p.initials} color={p.color} size="md" online/><b>{p.name.split(' ')[0]}</b><span>{p.status === 'Focusing' ? 'In focus' : 'On break'}</span></div>)}<div className="room-participant"><Avatar initials="E" color="violet" size="md" online/><b>You</b><span>In the room</span></div></div></div></Panel><Panel className="room-guidelines"><div><ShieldCheck size={16}/><b>Room etiquette</b></div><p>Respect the quiet. Use chat for encouragement, keep your camera off if you prefer, and remember everyone’s here to make progress.</p></Panel></div><div className="room-right-column"><Panel className="room-tools"><div className="panel-heading"><div><div className="eyebrow">YOUR STUDY SPACE</div><h3>Room controls</h3></div><span className="demo-chip">LOCAL DEMO</span></div><div className="room-control-row"><span><Video size={17}/> Camera</span><button className={`toggle ${cameraOn ? 'on' : ''}`} onClick={() => { setCameraOn(!cameraOn); notify(cameraOn ? 'Camera off (visual only)' : 'Camera on (visual only)'); }}><i/></button></div><div className="room-control-row"><span><Headphones size={17}/> Microphone</span><button className={`toggle ${micOn ? 'on' : ''}`} onClick={() => { setMicOn(!micOn); notify(micOn ? 'Microphone muted' : 'Microphone unmuted (visual only)'); }}><i/></button></div><div className="room-control-row"><span><MessageCircle size={17}/> Room chat</span><button className={`toggle ${showRoomChat ? 'on' : ''}`} onClick={() => setShowRoomChat(!showRoomChat)}><i/></button></div><div className="control-disclaimer"><Lock size={12}/> Camera and microphone controls are visual only. No media is transmitted.</div></Panel>{showRoomChat && <Panel className="room-chat"><div className="panel-heading"><div><div className="eyebrow">SAY SOMETHING KIND</div><h3>Room chat</h3></div><span className="chat-online"><i/> LIVE DEMO</span></div><div className="chat-messages"><div className="chat-message"><Avatar initials="MC" color="coral" size="xs"/><div><b>Maya <small>2m</small></b><p>Good luck everyone! Let's get it ✨</p></div></div><div className="chat-message"><Avatar initials="NW" color="blue" size="xs"/><div><b>Noah <small>5m</small></b><p>90 minutes, no distractions. We got this.</p></div></div>{messages.map((m) => <div className="chat-message" key={m.id}><Avatar initials="E" color="violet" size="xs"/><div><b>You <small>now</small></b><p>{m.text}</p></div></div>)}</div><form className="chat-compose" onSubmit={sendRoomMessage}><input value={roomChatDraft} onChange={(e) => setRoomChatDraft(e.target.value)} placeholder="Send encouragement..."/><button type="submit" disabled={!roomChatDraft.trim()}><Send size={15}/></button></form></Panel>}</div></div><div className="simulated-note"><ShieldCheck size={14}/> Room participants and starter messages are simulated. Chat messages you send are saved only in this browser.</div></>;
}
