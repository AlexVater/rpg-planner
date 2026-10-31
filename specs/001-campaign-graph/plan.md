# Implementation Plan: Campaign Graph (v1)

**Spec**: [spec.md](spec.md) | **Data model**: [data-model.md](data-model.md)

## Technical Context
- **Language**: TypeScript 5 (strict) · **UI**: React 18 · **Build**: Vite 5
- **Graph**: `react-force-graph-2d` · **Markdown**: `react-markdown`
- **Storage**: browser `localStorage`, seed from `public/campaign.json`
- **Tests**: Vitest (pure logic in `src/lib`)
- **Target**: static site (GitHub Pages), no back-end

## Constitution Check
| Principle | Status |
|---|---|
| I Front-end only | ✅ Vite static build, `base: './'` |
| II JSON is the DB | ✅ `Campaign` JSON, versioned, import/export |
| III Links are the core | ✅ graph derived in `src/lib/graph.ts` |
| IV Typed, tested | ✅ strict TS, Vitest on `src/lib` |
| V Simplicity | ✅ 2 runtime deps beyond React, plain CSS |

## Project Structure
```
public/campaign.json          sample campaign (seed)
src/types.ts                  Note, Campaign, NoteType
src/noteTypes.ts              labels, colors, icons per type
src/lib/links.ts              parse [[links]], resolve titles, rename
src/lib/graph.ts              build nodes/edges, backlinks, ancestry
src/lib/campaign.ts           validation (import), factory helpers
src/lib/storage.ts            localStorage load/save, seed fetch, download
src/state/useCampaign.ts      useReducer CRUD + autosave
src/components/Sidebar.tsx    search, type chips, nested list, import/export
src/components/GraphView.tsx  force graph
src/components/NoteEditor.tsx editor + preview + backlinks
src/App.tsx, main.tsx, styles.css
.github/workflows/deploy.yml  GitHub Pages (manual push later)
iniciar.bat                   double-click launcher
```

## Key Decisions
- **Vite over Next**: no server needed; Next adds SSR/routing we don't use.
- **Links by title** (Obsidian semantics) rather than id, so text stays human-readable. Rename
  rewrites links in other notes.
- **Ghost nodes** for unresolved links — id `ghost:<title>`.
- **Preview rendering**: `[[x]]` is converted to a markdown link `[x](#note:x)` and intercepted.
