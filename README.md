# Spyfall Clone 🕵️‍♂️ – Next.js Side Project

A modern, real-time web implementation of the popular social deduction party game **Spyfall**, built with **Next.js**, **React**, and **Redis**.

## Purpose

The goal of this project is to make playing Spyfall with friends quick and easy. The UI is simple, clean, and easy to learn, so you can open it at a party, share a short code, and start a round with no hassle.

## Features

- Create or join lobbies instantly with a simple 6-character code
- Real-time synchronization of game state across all devices
- Robust client-side timer with server drift correction for accuracy
- Session persistence allows seamless rejoining after closing the tab
- Smart join links for joining via shared URLs
- Customizable settings for timer duration, spy count, and location packs
- "Tap to Reveal" role cards to prevent accidental leaks
- In-game locations reference grid for crossing off suspects
- Fully responsive design optimized for mobile devices

## Tech Stack

- **Next.js 15** – App Router framework for server-side rendering and API routes
- **React 19** – UI library for building interactive, state-driven components
- **Tailwind CSS v4** – Utility-first CSS for rapid, beautiful styling
- **TypeScript** – Ensures type safety across the full stack
- **Redis (Upstash)** – Fast, ephemeral key-value store for managing game state
- **SWR** – React Hooks for data fetching, handling polling and cache synchronization

## Installation and setup

To clone and run this application, you'll need Git and Node.js installed. You will also need a Redis instance (local or hosted). Then:

```
# Clone this repository
git clone https://github.com/AidenCarrera/spyfall-clone.git

# Go into the repository
cd spyfall-clone

# Install dependencies
npm install

# Set up environment variables
# (Create a .env.local file and add your Redis credentials)
# KV_REST_API_URL=...
# KV_REST_API_TOKEN=...

# Run the app
npm run dev

# Open your browser at http://localhost:3000 to view the app
```

## Playing The Game

- Create Game: enter your name to host a new lobby and get a unique code
- Join Game: friends can join by entering the code or clicking a shared link
- Lobby Settings: host adjusts timer, number of spies, and location packs
- Start Game: once everyone is in, the host starts the game
- Non-Spies: ask questions to deduce who the spy is without revealing the location
- The Spy: listen carefully to infer the location and blend in
- Reveal Role: tap your card to see if you are the Spy or what your role is
- Cross Off: tap locations in the reference grid to eliminate suspects
- Pause/End: host can pause the timer or end the game early

## Future Improvements

- Add custom location packs created by users
- Add an AI question prompt that gives players a relevant, in-theme question when they’re out of ideas
- Add spectator mode for late joiners
