# Box Breathing Studio

An immersive box breathing web application that blends responsive visuals, ambient audio soundscapes, and spoken cues to guide a calming four-phase breathing practice.

## Features

- **Environment gallery** – Pick from four atmospheric background environments with smooth transitions.
- **Ambient soundscapes** – Choose synthesized ambient tracks or a silent option, and control the volume.
- **Custom pacing** – Adjust per-phase duration (inhale, hold, exhale, hold) with a responsive animation that scales to timing.
- **Session length presets** – Quick duration buttons plus custom minute entry.
- **Guided prompts** – Optional spoken cues that announce each breathing phase.
- **In-session overview** – Timer, current phase description, progress bar, and completed cycle count, wrapped in a focused breathing screen.

## Getting started

> **Note:** Installing dependencies requires access to the npm registry. If your environment blocks registry traffic you may need to configure a proxy or mirror before installing packages.

```bash
npm install
npm run dev
```

- The development server runs on http://localhost:5173 by default.
- Build for production with `npm run build`.

## Tech stack

- [React 18](https://react.dev/)
- [Vite](https://vitejs.dev/) for bundling and dev server
- TypeScript for type safety

## Project structure

```
├── src
│   ├── App.tsx                # Main application shell
│   ├── App.css                # Global styles and layout
│   ├── main.tsx               # React entry point
│   ├── components/            # UI building blocks
│   ├── hooks/                 # Breathing, audio, and speech hooks
│   ├── data/                  # Environment, audio, and duration presets
│   └── audio/                 # Ambient audio synthesis helpers
├── index.html                 # Vite entry document
└── package.json               # Scripts and dependencies
```

Enjoy a calmer breathing practice!
