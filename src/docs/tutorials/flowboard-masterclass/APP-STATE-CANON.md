# FlowBoard Masterclass - APP STATE CANON

Last Updated: 2026-05-12
Source of truth priority:
1. Running code in flowbard/src
2. This file
3. Latest lab End State Summary
4. Lesson snippets

Purpose:
- Prevent lesson/code drift.
- Force new labs to adapt to real project state.
- Record exact baseline before every lab starts.

## Current Baseline (Learner Project)

### Files in flowbard/src
- App.tsx
- App.css
- Card.tsx
- Card.css

### Components and exports
- App.tsx: default export App
- Card.tsx: default export Card
- Card.tsx: export type CardData

### CSS class names currently used
- app-container
- app-title
- app-subtitle
- version-badge
- list-column
- card
- card-title
- card-label
- card-description

### Current data shape
CardData:
- id: string
- title: string
- label: string
- description?: string

### Current visible UI
- Title "FlowBoard"
- Subtitle "Your work, your way."
- Version badge "v0.1.0 - Alpha"
- One vertical list of cards rendered from local array data
- At least one card includes description and renders optional description block

## Naming Decisions Log
- Keep `app-container` as canonical App root class name.
- Keep `list-column` as canonical list wrapper class name for vertical card stack.
- Prefer spread props at call site: `<Card key={card.id} {...card} />`.

## Conflict Resolution Protocol
If a lesson snippet differs from project code:
1. Keep running project behavior and interfaces.
2. Translate snippet names to canonical names from this file.
3. Apply only the concept delta for the current lab.
4. Refactor names only in an explicit refactor step with verification.

## Next Lab Baseline Checklist (fill before writing each lab)
- [ ] Confirm file list still matches or update it
- [ ] Confirm component/export names still match or update them
- [ ] Confirm CSS class names still match or update them
- [ ] Confirm data shape still matches or update it
- [ ] Confirm visible UI description still matches or update it
- [ ] Add translation map for any incoming snippet naming

## Lab Delta Log
Use one entry per completed lab.

### LAB-05 (planned)
- Expected delta:
  - Add List.tsx and List.css
  - Move list rendering structure from App to List component
  - Keep App header/subtitle/version and canonical class names
- Risk:
  - Snippet naming drift (`app`/`card-list`) vs canonical (`app-container`/`list-column`)
- Mitigation:
  - Translate snippet names to canonical baseline before writing steps
