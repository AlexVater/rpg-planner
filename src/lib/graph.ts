import type { GraphLink, GraphNode, Note, NoteType } from '../types'
import { findByTitle, normalizeTitle, parseLinks } from './links'

export const GHOST_PREFIX = 'ghost:'

export function buildGraph(
  notes: Note[],
  visibleTypes?: Set<NoteType>,
): { nodes: GraphNode[]; links: GraphLink[] } {
  const visible = visibleTypes ? notes.filter((n) => visibleTypes.has(n.type)) : notes
  const visibleIds = new Set(visible.map((n) => n.id))
  const nodes: GraphNode[] = visible.map((n) => ({ id: n.id, title: n.title, type: n.type }))
  const links: GraphLink[] = []
  const seen = new Set<string>()
  const ghosts = new Map<string, GraphNode>()

  const add = (source: string, target: string, kind: GraphLink['kind']) => {
    if (source === target) return
    const key = kind === 'link' ? [source, target].sort().join('|') : `${source}>${target}`
    if (seen.has(`${kind}:${key}`)) return
    seen.add(`${kind}:${key}`)
    links.push({ source, target, kind })
  }

  for (const note of visible) {
    if (note.parentId && visibleIds.has(note.parentId)) add(note.parentId, note.id, 'parent')
    for (const { target } of parseLinks(note.body)) {
      const resolved = findByTitle(notes, target)
      if (resolved) {
        if (visibleIds.has(resolved.id)) add(note.id, resolved.id, 'link')
        continue
      }
      const ghostId = GHOST_PREFIX + normalizeTitle(target)
      if (!ghosts.has(ghostId)) ghosts.set(ghostId, { id: ghostId, title: target, type: 'ghost' })
      add(note.id, ghostId, 'link')
    }
  }

  return { nodes: [...nodes, ...ghosts.values()], links }
}

/** Notes whose body links to the given note. */
export function backlinks(notes: Note[], note: Note): Note[] {
  const key = normalizeTitle(note.title)
  return notes.filter(
    (n) => n.id !== note.id && parseLinks(n.body).some((l) => normalizeTitle(l.target) === key),
  )
}

/** True if `ancestorId` is `noteId` itself or one of its ancestors. */
export function isAncestor(notes: Note[], ancestorId: string, noteId: string): boolean {
  const byId = new Map(notes.map((n) => [n.id, n]))
  let current: string | undefined = noteId
  const visited = new Set<string>()
  while (current && !visited.has(current)) {
    if (current === ancestorId) return true
    visited.add(current)
    current = byId.get(current)?.parentId
  }
  return false
}
