# LifeOS — Focus Together. Grow Together.

A responsive React + Vite social productivity MVP. It combines focus sessions, task planning, study rooms, a community feed, challenges, a leaderboard, progress analytics, and a local rules-based productivity coach.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

Create a production bundle with:

```bash
npm run build
npm run preview
```

## Demo flow

1. Open **Study Rooms** and join the Late Night Library (room members and presence are seeded demo data).
2. Open **Focus**, choose a subject and 25, 50, or 90 minutes, then start a session.
3. Pause/resume as needed. Use **Finish session** to complete a demo session without waiting for the entire timer, or let the timer finish naturally.
4. Collect XP and coins. Reaching the daily focus goal grants an additional bonus.
5. Share the win to **Community**, or keep it private.
6. Check the **Leaderboard**, **Challenges**, and **Statistics** pages.
7. Open **AI Coach** and use **AI Life Recovery Mode** to schedule the unfinished tasks that fit into the time you have left.

## What is real in this MVP

- Focus time uses elapsed-time calculations based on timestamps, not just a decrementing counter.
- Your profile, tasks, sessions, rewards, likes, comments, challenge joins, room chat, and preferences are stored in browser LocalStorage.
- Task creation, editing, deletion, completion, and priority-based day generation work locally.
- Recovery mode uses deterministic local scheduling rules; it does not call an AI service.
- Community posts can include an optional image preview. You choose whether to publish a completed session.

## Simulated elements

Friend presence, seeded friend profiles, participant counts, room activity, starter room messages, challenge participant counts, Lockmate activity, and competitor leaderboard figures are demo data. Camera and microphone toggles are visual controls only: no video, audio, WebRTC, or real-time multiplayer is implemented.

## Reset

Use the profile menu → **Reset demo** to restore the original sample state. This only affects LifeOS data in this browser.

## Stack

React, JavaScript (ES modules), Vite, CSS, Lucide React. No backend, external API key, database, or authentication is required.
