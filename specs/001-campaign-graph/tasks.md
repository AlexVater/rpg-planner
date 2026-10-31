# Tasks: Campaign Graph (v1)

`[P]` = can run in parallel · `[USn]` = user story

## Phase 1 — Setup
- [x] T001 Vite + React + TS project, strict tsconfig, Vitest (`package.json`, `vite.config.ts`)
- [x] T002 `src/types.ts`, `src/noteTypes.ts`

## Phase 2 — Foundational (pure logic, test-first)
- [x] T003 [P] `src/lib/links.ts` + `links.test.ts`: parse, resolve, rename [US2]
- [x] T004 [P] `src/lib/graph.ts` + `graph.test.ts`: nodes/edges, ghosts, backlinks, ancestry [US2][US3]
- [x] T005 [P] `src/lib/campaign.ts` + `campaign.test.ts`: validate import, new note [US5]
- [x] T006 `src/lib/storage.ts`: load/save/seed/download [US5]
- [x] T007 `src/state/useCampaign.ts`: reducer CRUD + autosave [US1]

## Phase 3 — UI
- [x] T008 [US1][US4] `Sidebar.tsx`: new note, search, type chips, nested list
- [x] T009 [US1][US2][US3] `NoteEditor.tsx`: fields, preview with clickable links, backlinks, delete
- [x] T010 [US2][US4] `GraphView.tsx`: colored nodes, dashed parent edges, ghosts, hover highlight
- [x] T011 [US5] Import/export buttons, `public/campaign.json` sample
- [x] T012 `App.tsx` layout + `styles.css` dark theme

## Phase 4 — Polish
- [x] T013 GitHub Pages workflow, `iniciar.bat`, README
- [x] T014 Verify: `npm test`, `npm run build`, manual run in browser
