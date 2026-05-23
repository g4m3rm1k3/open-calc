# OpenCalc — Free Education for Everyone AI Is About to Disrupt

**[▶ Open the App](https://g4m3rm1k3.github.io/open-calc/) · [Download for Windows](https://github.com/g4m3rm1k3/open-calc/releases/latest) · [Contribute a Lesson](CONTRIBUTING.md) · [Support This Project](#support-this-project)**

[![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)](https://reactjs.org)
[![D3](https://img.shields.io/badge/D3.js-7-f9a03c?logo=d3.js&logoColor=white)](https://d3js.org)
[![Three.js](https://img.shields.io/badge/Three.js-0.168-black?logo=three.js)](https://threejs.org)
[![KaTeX](https://img.shields.io/badge/KaTeX-0.16-2c3e50)](https://katex.org)
[![Pyodide](https://img.shields.io/badge/Pyodide-0.26-37763b?logo=python&logoColor=white)](https://pyodide.org)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)

---

## Why This Exists

AI is coming for jobs in manufacturing, logistics, trades, and services. When it does, millions of people will need to reskill — fast, affordably, and without going back into debt for a degree.

OpenCalc is the platform they'll need. It's a free, open-source, interactive STEM learning environment that teaches the math, science, and programming skills that hold their value no matter how the economy shifts. No tuition. No account required. No ads. Just learning.

**Intuition first, rigour always** — every concept follows the same cycle:

| Stage | What happens |
|---|---|
| **Hook** | A real-world question that makes the concept feel necessary |
| **Intuition** | Geometric or physical reasoning with interactive visualizations |
| **Math** | Precise definitions, theorems, and worked examples |
| **Rigor** | Step-by-step proof with a synchronized visualization |

---

## Who This Is For

**If you're reskilling** — whether you were laid off, looking to move up, or just hungry to learn — OpenCalc meets you where you are. Start with manufacturing fundamentals, move into programming, then math and data science. There's no wrong place to begin.

**If you're a student** — this is the interactive textbook your university never gave you. Every proof has a visualization. Every worked example is interactive. You can run Python in the browser right alongside the lesson.

**If you're a self-learner** — you'll find university-level STEM content that respects your intelligence and builds your intuition, not just your ability to pass a test.

---

## What's Inside

11 full courses, all free, all interactive:

| Course | Description | Status |
|---|---|---|
| **Pre-Calculus** | Functions, graphs, transformations, trigonometry | ✅ Active |
| **Geometry** | Proofs, constructions, similarity, circles, coordinates | ✅ Active |
| **Calculus** | Limits, derivatives, applications, integration, series | ✅ Active |
| **Physics** | Mechanics, kinematics, forces, waves | ✅ Active |
| **Discrete Math** | Logic, sets, induction, combinatorics, graph theory | ✅ Active |
| **Linear Algebra** | Vectors, matrices, transformations, eigenvalues | ✅ Active |
| **Python Programming** | Core language, data structures, algorithms | ✅ Active |
| **Data Science** | NumPy, Pandas, visualization, ML foundations | ✅ Active |
| **JavaScript Core** | Language fundamentals and runtime mechanics | ✅ Active |
| **Web Systems** | DOM, reactivity, APIs | ✅ Active |
| **Build Tetris** | Build a complete game from scratch — project-driven | ✅ Active |

> Manufacturing fundamentals, chemistry, and workforce transition tracks are actively being developed. See the [roadmap](#roadmap).

---

## Features That Make This Different

**In-browser code execution** — run Python and JavaScript directly in the lesson, no installation, no account, powered by [Pyodide](https://pyodide.org) and a sandboxed JS runtime.

**OpenMAT** — a MATLAB-style matrix workspace built into the app. Linear algebra, numerical methods, and data work without leaving the lesson.

**Synchronized proof visualizations** — every proof step advances the geometry in lockstep. You never have to guess what the animation is showing you — a `mathBridge` field on every visualization states it explicitly.

**AI Tutor** — built-in conversational AI tutor available inside lessons to answer questions in context.

**P2P Study Chat (no server, no cost)** — connect with other students worldwide studying the same lesson, powered by WebRTC over BitTorrent/Nostr DHT. No server. No account. No cost. Completely private.

**Works offline** — download the desktop app and learn anywhere, no internet required (P2P chat and AI tutor require a connection).

**Dark mode** — because learning at 2am is real.

---

## Download

| Platform | File | Notes |
|---|---|---|
| **Web (any device)** | [Open in browser →](https://g4m3rm1k3.github.io/open-calc/) | No install required |
| **Windows** (10/11, 64-bit) | `open-calc-X.X.X.exe` | See SmartScreen note below |
| **macOS** | `open-calc-X.X.X.dmg` | Coming soon |

👉 **[Download the latest release →](https://github.com/g4m3rm1k3/open-calc/releases/latest)**

> **Windows SmartScreen:** Click "More info" → "Run anyway". The app is unsigned (code signing is expensive for an unfunded open source project) but safe.

---

## For Organizations & Educators

If you run a workforce development program, community college, union training program, or reentry organization, OpenCalc is free to use and can be self-hosted on your network. The optional local backend enables LAN deployment with no internet dependency.

We're actively looking for pilot partners in manufacturing and trades retraining. If you're interested, open a [Discussion](https://github.com/g4m3rm1k3/open-calc/discussions) or reach out directly.

---

## Support This Project

OpenCalc is entirely free, open source, and built by one developer. If it matters to you, here's how to help:

- ⭐ **Star this repo** — it helps other people find it
- 🔀 **Contribute a lesson** — [CONTRIBUTING.md](CONTRIBUTING.md) has everything you need; the in-app tutorial makes it approachable for non-developers too
- 📣 **Share it** — post it in a community, send it to someone who needs it, mention it to a teacher or workforce counselor
- 💬 **Open a Discussion** — tell us who you are and what you'd need to use this seriously

> **Grant funders and foundations:** OpenCalc is seeking funding to support full-time development, content expansion into workforce retraining tracks, and accessibility improvements. The platform is GPL-3.0 licensed and will remain permanently free. If your organization funds open education, digital equity, or workforce development, please reach out via [Discussions](https://github.com/g4m3rm1k3/open-calc/discussions).

---

## Roadmap

Near-term priorities driven by the workforce retraining mission:

- [ ] Manufacturing fundamentals track (blueprint reading, tolerances, CNC basics)
- [ ] Trades math track (electrical, HVAC, plumbing calculations)
- [ ] Adaptive learning paths based on prior knowledge
- [ ] Mobile-first responsive improvements
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] macOS desktop app
- [ ] Multilingual content (Spanish first)

Have a specific need? Open a [Discussion](https://github.com/g4m3rm1k3/open-calc/discussions) — roadmap priorities are driven by real user needs.

---

## For Developers — Getting Started

**Requirements:** Node.js 18+, npm 9+

```bash
git clone https://github.com/g4m3rm1k3/open-calc.git
cd open-calc
npm install
npm run dev        # starts dev server at http://localhost:5173
```

```bash
npm run build      # production build + generates search index
npm run preview    # preview the production build locally
```

The fastest way to contribute a lesson is the **interactive in-app tutorial** — click the **?** button in the top navigation bar. It walks you through the full lesson schema with live preview. No prior experience with the codebase required.

For the full technical reference — lesson schema, visualization API, quiz grading system, quality standards — see [CONTRIBUTING.md](CONTRIBUTING.md).

### Building the desktop app

```bash
npm run desktop:build    # Windows .exe — run on Windows
                         # macOS .dmg  — run on macOS
# Output: desktop/staging/release/
```

### Optional local backend

```bash
npm run backend        # LAN hosting + lesson overrides (127.0.0.1:4318)
npm run backend:lan    # exposes on local network
```

Not required for the web or desktop app. Useful for self-hosted institutional deployments.

---

## Tech Stack

| Tool | Role |
|---|---|
| React 18 + Vite 5 | UI and build |
| D3.js 7 | 2D interactive visualizations |
| Three.js | 3D visualizations |
| KaTeX | Math rendering |
| Pyodide | Python runtime in the browser (no server) |
| Tailwind CSS | Styling with full dark mode |
| React Router | Client-side routing |
| Fuse.js | Full-text search across all lessons |
| Trystero + WebRTC | Serverless P2P study chat |
| Electron | Desktop app wrapper |

---

## Project Structure

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
      react/        # React visualizations (notebooks, games)
      VizFrame.jsx  # registry — maps string IDs to components
    lesson/         # lesson layout components
    math/           # KaTeX wrappers
  pages/            # route-level components
  context/          # app-level state (progress, theme, chat)
public/
  search-index.json # generated by npm run build
desktop/
  app/              # Electron main process
```

---

## License

GPL-3.0 — free to use, modify, and distribute. Derivative works must remain open source.

---

*Built with the belief that access to a rigorous education should never depend on the size of your bank account.*
