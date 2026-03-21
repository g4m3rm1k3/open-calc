# Open Calc

Open Calc is an interactive, intuition-first calculus textbook built with React, Vite, D3, and KaTeX.

It is designed for self-learners and classrooms:
- clear conceptual storytelling before formal proof,
- worked examples with step-by-step math,
- interactive visualizations connected to core ideas,
- chapter progression with saved progress tracking.

## Tech Stack

- React 18 + Vite 5
- React Router
- D3 and Three.js visualizations
- KaTeX math rendering
- Tailwind CSS

## Local Development

### Requirements

- Node.js 18+
- npm 9+

### Install and run

```bash
npm install
npm run dev
```

This project generates a search index before starting dev/build.

### Production build

```bash
npm run build
npm run preview
```

## Project Structure

- `src/content/` lesson content and chapter indexes
- `src/components/viz/` visualization components (D3/Three)
- `src/pages/` route-level page components
- `src/context/` app-level state providers
- `public/search-index.json` generated searchable content index

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a PR.

## GitHub Pages Deployment

This repository includes a workflow that deploys to GitHub Pages on every push to `main`.

### One-time GitHub setup

1. Push this repo to GitHub.
2. In GitHub, open Settings -> Pages.
3. Set Source to GitHub Actions.
4. Ensure your default branch is `main`.

After that, every push to `main` will rebuild and deploy automatically.

## License

MIT. See [LICENSE](LICENSE).
