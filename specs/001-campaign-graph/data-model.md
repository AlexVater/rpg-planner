# Data Model

```ts
type NoteType = 'npc' | 'local' | 'artefato' | 'item-magico' | 'lore' | 'faccao' | 'sessao' | 'outro'

interface Note {
  id: string            // crypto.randomUUID()
  title: string
  type: NoteType
  parentId?: string     // hierarchy (sub-information)
  tags: string[]
  body: string          // markdown, may contain [[Title]] or [[Title|alias]]
  createdAt: string     // ISO
  updatedAt: string     // ISO
}

interface Campaign {
  version: 1
  name: string
  notes: Note[]
}
```

## Derived (never stored)
```ts
interface GraphNode { id: string; title: string; type: NoteType | 'ghost' }
interface GraphLink { source: string; target: string; kind: 'link' | 'parent' }
```

## Rules
- Title match is case-insensitive and trimmed; first match wins.
- `parentId` must reference an existing note and must not create a cycle; invalid parents are
  dropped on import.
- localStorage key: `rpg-planner:campaign`.
