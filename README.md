# Spyfall Clone

A fast, mobile-first implementation of Spyfall that supports both Spyfall 1 and Spyfall 2 location sets, built with Next.js, React, and Redis.

Play instantly with friends in real-time with no accounts or setup required.

---

## Purpose

The goal of this project is to make playing Spyfall with friends quick and easy. The UI is designed to be highly intuitive, clean, and fast to learn so that anyone can join a lobby, understand the interface instantly, and start playing with their friends.

---

## Live Demo

**Play it here:** [spyfall-clone.vercel.app](https://spyfall-clone.vercel.app/)

---

## Features

- **Instant Lobbies:** Start a game and invite players with a 6-character room code or link.
- **Spyfall 1 + 2 Support:** Includes both classic and expanded location sets for variety across games.
- **Fast Sync (Redis-backed polling):** Game settings, timer, and roles stay synced across all devices.
- **Easy Reconnects:** Rejoin active games automatically if you disconnect or close your tab.
- **Host Controls:** Host can customize settings, adjust the timer, select locations, and assign roles.
- **Mobile Friendly:** Tap-to-reveal cards to hide your role, and an interactive grid to cross off locations.

---

## Tech Stack

- **Framework:** Next.js 16
- **Frontend Library:** React 19
- **Database / State Store:** Upstash Redis
- **Styling:** Tailwind CSS v4
- **Language:** TypeScript

---

## Getting Started

### Prerequisites

- **Node.js** (v24 recommended)
- **pnpm**
- **Upstash Redis** account

### Setup

1. **Clone the project:**
   ```bash
   git clone https://github.com/AidenCarrera/spyfall-clone.git
   cd spyfall-clone
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables:**
   Copy the example environment template:
   ```bash
   cp .env.example .env.local
   ```
   Add your Upstash Redis credentials to `.env.local`:
   ```env
   KV_REST_API_URL="your-redis-url"
   KV_REST_API_TOKEN="your-redis-token"
   ```

4. **Run the app:**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How to Play

1. **Host a Game:** Start a lobby and share the 6-character room code or link.
2. **Setup:** Customize the round timer, number of spies, and location packs.
3. **Start:** The host starts the match once everyone has joined.
4. **Play:**
   - **Spies:** Your card says "Spy". Listen to questions to guess the secret location.
   - **Non-Spies:** You will see the secret location. Ask clever questions to expose the spy without giving away the location.
5. **Cross off:** Tap locations in the reference grid to keep track of suspects.

---

## License

MIT
