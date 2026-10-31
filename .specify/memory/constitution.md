# RPG Planner — Constitution

**Version**: 1.0.0 | **Ratified**: 2026-10-30

## Core Principles

### I. Front-end only, static-first
The app runs entirely in the browser and must build to static files deployable on GitHub Pages.
No server is introduced until a spec explicitly requires one; if one is ever added, it MUST be
Node.js + TypeScript.

### II. JSON is the database
A campaign is a single JSON document (`Campaign`). Everything the user creates must round-trip
through export → import without loss. The schema carries a `version` field and changes to it
require a migration.

### III. Links are the core
Information is a graph of notes. Relations are expressed in note text with `[[Title]]` (Obsidian
style) and hierarchy via a parent reference. The graph view is derived from data, never stored.

### IV. Typed, tested core logic
TypeScript `strict` everywhere. Pure logic (link parsing, graph building, rename, import
validation) lives outside React components and has Vitest unit tests.

### V. Simplicity
Smallest thing that works. Few dependencies, no state-management libraries, no CSS frameworks.
Prefer one obvious way over configurability.

## Workflow
Spec-Driven Development (GitHub Spec Kit): constitution → specify → plan → tasks → implement.
Each feature lives in `specs/NNN-name/`. Code changes trace back to a task in `tasks.md`.

## Governance
This constitution overrides other practices. Amendments bump the version and are recorded here.
