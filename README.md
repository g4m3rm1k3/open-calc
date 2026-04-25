# OpenCalc

An open-source interactive STEM platform — intuition first, rigour always.

Every proof has a synchronized visualization. Every worked example is interactive. Lessons explicitly connect what you see on screen to the math that creates it.

![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![D3](https://img.shields.io/badge/D3.js-7-f9a03c?logo=d3.js&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-0.168-black?logo=three.js)
![KaTeX](https://img.shields.io/badge/KaTeX-0.16-2c3e50)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss&logoColor=white)
![Pyodide](https://img.shields.io/badge/Pyodide-0.26-3776ab?logo=python&logoColor=white)

---

## Download

| Platform | File | Notes |
| --- | --- | --- |
| **Windows** (10/11, 64-bit) | `open-calc-X.X.X.exe` | See SmartScreen note below |
| **macOS** | `open-calc-X.X.X.dmg` | Coming soon |

👉 **[Download the latest release →](../../releases/latest)**

### Windows SmartScreen warning

When you first run the `.exe`, Windows may show a blue "Windows protected your PC" dialog. This happens because the app is not yet code-signed. It is safe to run:

1. Click **"More info"**
2. Click **"Run anyway"**

### System requirements

| | Minimum | Recommended |
| --- | --- | --- |
| **OS** | Windows 10 64-bit | Windows 11 |
| **RAM** | 4 GB | 8 GB+ |
| **Storage** | 400 MB free | 1 GB+ free |
| **GPU** | Any with WebGL | Dedicated GPU |
| **Internet** | Not required | Required for P2P study chat |

> **Note on heavy features:** The AI Tutor and Python sandbox are memory-intensive. If the app becomes unresponsive while using them, close other programs to free up RAM. The app will offer to restart itself if it runs into trouble.

---

## What it is

OpenCalc teaches university-level STEM with the belief that **intuition and rigour are not opposites** — they reinforce each other. Every concept follows the same cycle:

| Stage | What happens |
| --- | --- |
| **Hook** | A real-world question that makes the concept feel necessary |
| **Intuition** | Geometric or physical reasoning with interactive visualizations |
| **Math** | Precise definitions, theorems, and worked examples |
| **Rigor** | Step-by-step proof with a synchronized visualization |

A `mathBridge` field on every visualization explicitly states which part of the concept it is showing, so students never have to guess what the animation means.

Students can run Python and JavaScript code directly in the browser — no installation required, powered by Pyodide and a sandboxed JS runtime.

---

## Study Chat (P2P — no server)

OpenCalc has a built-in global and per-lesson study chat. It connects students worldwide who are studying the same material — **with no server, no account, and no cost**.

- **Global room** — always open, connects all OpenCalc users worldwide
- **Lesson rooms** — automatically join a room for whichever lesson you are on; anyone else studying that lesson worldwide is in the same room
- **No server** — powered by WebRTC over the BitTorrent/Nostr DHT network. Peer data flows directly between browsers, never through a central server
- **Block users** — hover any message and click the block icon to permanently hide messages from that user (stored locally)
- **Anonymous by default** — you get a random math-themed name (e.g. "CuriousEuler") that you can change at any time

---

## Courses

| Course | Description | Status |
| --- | --- | --- |
| **Pre-Calculus** | Functions, graphs, transformations, trigonometry | ✅ Active |
| **Geometry** | Proofs, constructions, similarity, circles, coordinates | ✅ Active |
| **Calculus** | Limits, derivatives, applications, integration, series (chapters 0–6) | ✅ Active |
| **Physics** | Mechanics, kinematics, forces, waves | ✅ Active |
| **Discrete Math** | Logic, sets, induction, combinatorics, graph theory | ✅ Active |
| **Linear Algebra** | Vectors, matrices, transformations, eigenvalues | ✅ Active |
| **Python Programming** | Core language, data structures, algorithms | ✅ Active |
| **Data Science** | NumPy, Pandas, visualization, ML foundations | ✅ Active |
| **JavaScript Core** | Language fundamentals and runtime mechanics | ✅ Active |
| **Web Systems** | DOM, reactivity, APIs | ✅ Active |
| **Build Tetris** | Build a complete game from scratch — project-driven | ✅ Active |

---

## Tech stack

| Tool | Role |
| --- | --- |
| React 18 + Vite 5 | UI and build |
| D3.js 7 | 2D interactive visualizations |
| Three.js | 3D visualizations |
| KaTeX | Math rendering |
| Pyodide | Python runtime in the browser (no server) |
| Tailwind CSS | Styling with full dark mode |
| React Router | Client-side routing |
| Fuse.js | Full-text search across all lessons |
| Trystero + WebRTC | Serverless P2P study chat |

---

## Getting started (development)

**Requirements:** Node.js 18+, npm 9+

```bash
git clone https://github.com/your-username/open-calc.git
cd open-calc
npm install
npm run dev        # starts dev server at http://localhost:5173
```

```bash
npm run build      # production build
npm run preview    # preview the production build locally
```

### Building the desktop app

```bash
# Windows (.exe portable)
npm run desktop:build

# The output will be in desktop/staging/release/
```

Build the Mac version (`.dmg`) by running `npm run desktop:build` on a Mac — electron-builder must run on the target OS.

Both files are uploaded as assets to the same GitHub Release.

### Optional local backend

The optional backend in `backend/server.mjs` enables lesson overrides and LAN hosting. It is **not required** for the desktop app or the web app.

```bash
npm run backend        # binds to 127.0.0.1:4318
npm run backend:lan    # exposes on local network
```

---

## Contributing a lesson

The fastest way to get started is the **interactive in-app tutorial**: open the app and click the **?** button in the top navigation bar. It walks you through writing your first lesson with downloadable templates, step-by-step guidance, and a live hoverable preview that shows you the code behind each section.

For the complete technical reference — full lesson schema, visualization API, quiz grading system, and quality standards — see [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Project structure

```
src/
  content/          # lesson files — one JS object per lesson
    chapter-0/      # Calculus prerequisites
    chapter-1/      # Limits
    chapter-2/      # Derivatives
    ...chapter-6/
    precalc/
    geometry-1/ ... geometry-6/
    python-1/
    data-science/
    javascript-1/
    physics-1/
    discrete-math/
    linear-algebra/
    web-1/
  components/
    chat/           # P2P study chat (global + lesson rooms)
    viz/
      d3/           # 2D D3 visualizations
      three/        # 3D Three.js visualizations
      react/        # pure React vizs (Python notebook, JS notebook, games)
      VizFrame.jsx  # registry — maps string IDs to components
    lesson/         # lesson layout components
    math/           # KaTeX wrappers
  pages/            # route-level components
  context/          # app-level state (progress, theme, chat)
public/
  search-index.json # generated by npm run build
desktop/
  app/              # Electron main process (no backend dependency)
```

---

## How it works

Each lesson is a single JS file in `src/content/{course}/` exporting a structured object. The renderer reads the object and renders all sections automatically — prose, visualizations, examples, quiz. Adding a visualization to a lesson requires only adding its ID string to the content file.

Proof steps sync to visualizations via a `currentStep` prop, so as a student steps through a proof, the geometry updates in lockstep.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full architecture and contribution guide.
