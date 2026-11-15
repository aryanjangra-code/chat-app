# GroupChat

**A real-time chat app for small groups and one-to-one conversations.** GroupChat keeps the essentials close: rooms, direct messages, live updates, and a quiet interface that works in light or dark mode.

<p>
  <img alt="React" src="https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" />
  <img alt="Socket.IO" src="https://img.shields.io/badge/Socket.IO-realtime-010101?logo=socketdotio&logoColor=white" />
</p>

## What’s here

- Account creation and sign-in
- Discoverable group rooms with membership required to read or send messages
- Direct messages between two participants
- Live messaging, typing indicators, and online presence
- Message history, emoji reactions, editing, and deletion
- Light and dark themes, with browser notifications when permitted

## Run locally

The frontend expects the GroupChat API to be available at `http://localhost:5000` by default. Start the backend and configure its MongoDB connection before signing in.

```bash
npm install
```

Create `.env` in this frontend directory if the API runs somewhere other than the default:

```env
VITE_API_URL=http://localhost:5000
```

Start the development server:

```bash
npm run dev
```

Vite prints the local URL when the server is ready.

## Checks

```bash
npm test
npm run lint
npm run build
npm run preview
```

The test suite covers message-history merging, including the case where a live update arrives while history is loading.

## Built with

React, React Router, Vite, Tailwind CSS, Axios, and Socket.IO Client. Animation uses Anime.js; icons come from Lucide.
