# Contributing to Open Calc

Thanks for helping improve Open Calc.

## Development workflow

1. Fork the repository.
2. Create a feature branch from `main`.
3. Make focused changes with clear commit messages.
4. Run checks locally before opening a PR.
5. Open a pull request with a clear summary and screenshots/GIFs for UI or visualization changes.

## Local checks

```bash
npm run build
```

A successful build confirms content indexing and Vite production compilation.

## Content guidelines

- Keep lessons intuition-first, then formalize rigor.
- Prefer concrete examples and physical interpretation where natural.
- Keep notation consistent with neighboring lessons.
- Ensure every new cross-reference points to a real lesson slug.
- Ensure every new visualization ID exists in `src/components/viz/VizFrame.jsx`.

## Pull request checklist

- [ ] Build passes locally.
- [ ] New links and cross-references resolve correctly.
- [ ] New visualizations are wired and render without console errors.
- [ ] Written explanations are mathematically accurate and age-appropriate for the chapter.

## Code style

- Follow existing style and file organization.
- Avoid unrelated refactors in feature PRs.
- Keep changes focused and reviewable.
