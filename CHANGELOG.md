# Changelog

All notable changes to UpSkillOS are documented here.

Format: [Semantic Versioning](https://semver.org). Dates are YYYY-MM-DD.

---

## [Unreleased]

### Added
- 30-course curriculum (up from initial 24): SQL Fundamentals, Python+SQL, NoSQL Databases, Applied Statistics, Command Line, C++ Programming
- Agent workflow documentation system (`docs/AGENT_WORKFLOW.md`)
- Automated doc-drift checker (`scripts/check-doc-drift.js`)
- GitHub community health files: CODE_OF_CONDUCT, SECURITY, issue templates, PR template
- FUNDING.yml for GitHub Sponsors integration

### Changed
- Project renamed from open-calc to UpSkillOS throughout documentation
- Lesson Writing Standard made universal (previously labeled "Linear Algebra only")
- ARCHITECTURE.md course inventory updated to reflect all 30 courses

---

## [0.1.0] — Initial public release

### Platform
- React 18 + Vite 5 frontend, HashRouter routing
- Electron desktop app (Windows)
- Pyodide Python runtime (browser)
- KaTeX math rendering
- D3.js, Three.js, Matter.js visualization layers
- P2P study chat via Trystero + WebRTC
- Step-by-step math solver with exportable sessions
- Full-text search via Fuse.js

### Curriculum (initial)
- Calculus Chapters 0–6 (Pre-Calc through Series)
- Linear Algebra Chapters 1–10
- Geometry Books 1–6
- Physics, Chemistry, Discrete Math
- Python, JavaScript, Web Systems
- Data Science, AI Engineering
- CNC Macro Systems, G-Code Interpreter
- Three.js Parts 1 & 2, HTML Canvas, Interface Design
- Git Systems, Build Tetris, Computer Science
- Digital Fundamentals
