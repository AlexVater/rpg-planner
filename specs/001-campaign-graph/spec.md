# Feature Specification: Campaign Graph (v1)

**Feature Branch**: `001-campaign-graph` | **Created**: 2026-10-30 | **Status**: Draft

## Summary
A game master plans an RPG campaign as linked notes (NPCs, places, artifacts, magic items, lore…)
and sees them as an interactive graph, like Obsidian. Data is a JSON file kept in the browser.

## User Scenarios & Testing

### User Story 1 — Create typed notes (P1)
As a GM I create a note with a title, a type and free text so I can record campaign information.

**Acceptance**
1. **Given** an empty campaign, **When** I click "Nova nota", **Then** a note is created, opened in
   the editor and shown in the list and in the graph.
2. **Given** a note, **When** I change its type, **Then** its color/icon change everywhere.
3. **Given** a note, **When** I delete it (with confirmation), **Then** it disappears from list
   and graph and its children lose their parent.

### User Story 2 — Link notes (P1)
As a GM I write `[[Other note]]` in a note's text so related things are connected.

**Acceptance**
1. **Given** notes "Gandar" and "Taverna do Javali", **When** Gandar's text contains
   `[[Taverna do Javali]]`, **Then** the graph shows an edge between them.
2. **When** I view the note (preview mode), **Then** the link is clickable and opens the target.
3. **When** a link points to a non-existent title, **Then** the graph shows a ghost node and
   clicking it creates that note.
4. **When** I open a note, **Then** I see its backlinks (notes that link to it).
5. **When** I rename a note, **Then** links to it in other notes are updated.

### User Story 3 — Sub-information (P2)
As a GM I set a note's parent (e.g. "Quarto secreto" inside "Taverna do Javali").

**Acceptance**
1. Parent edges are drawn in a distinct (dashed) style.
2. The sidebar list shows children nested under the parent.
3. A note cannot be its own ancestor.

### User Story 4 — Browse and filter (P2)
1. Searching filters the list by title/tags/text.
2. Toggling type chips hides/shows notes of that type in list and graph.
3. Clicking a graph node opens the note; hovering highlights its neighbors.

### User Story 5 — Persistence & JSON (P1)
1. Changes are saved automatically in the browser and survive reload.
2. First run loads a sample campaign from `campaign.json`.
3. "Exportar" downloads the campaign as JSON; "Importar" replaces it from a JSON file after
   validation and confirmation; invalid files show an error and change nothing.

### Edge Cases
- Duplicate titles: links resolve to the first match (case-insensitive); the editor warns.
- `[[Title|alias]]` shows the alias but links to Title.
- Empty title is shown as "Sem título".

## Requirements
- **FR-001** Note types: NPC, Local, Artefato, Item mágico, Lore, Facção, Sessão, Outro — each with a color and icon.
- **FR-002** Note fields: title, type, parent (optional), tags, markdown body, timestamps.
- **FR-003** Graph derived from `[[links]]` and parent references.
- **FR-004** Autosave to localStorage; seed from static `campaign.json`.
- **FR-005** Import/export of the full campaign JSON.
- **FR-006** Static build deployable to GitHub Pages.

## Out of Scope (v1)
Multi-user editing, player accounts, back-end, images/attachments.

## Success Criteria
- A GM can create 3 linked notes and a sub-note in under 2 minutes without docs.
- Export → import reproduces an identical campaign.
