import type { NoteType } from './types'
import { ICONS } from './icons'

export interface NoteTypeInfo {
  label: string
  /** Mirrors the --type-* token; the graph canvas can't read CSS variables. */
  color: string
  /** SVG path (24×24 grid, stroke only). */
  icon: string
}

export const NOTE_TYPES: Record<NoteType, NoteTypeInfo> = {
  npc: { label: 'NPC', color: '#e3a63b', icon: ICONS.npc },
  local: { label: 'Local', color: '#5fb86c', icon: ICONS.local },
  artefato: { label: 'Artefato', color: '#ac83e0', icon: ICONS.artefato },
  'item-magico': { label: 'Item mágico', color: '#5c9fe8', icon: ICONS.item },
  lore: { label: 'Lore', color: '#e8645a', icon: ICONS.lore },
  faccao: { label: 'Facção', color: '#3fc1c1', icon: ICONS.faccao },
  sessao: { label: 'Sessão', color: '#adb043', icon: ICONS.sessao },
  outro: { label: 'Outro', color: '#948f87', icon: ICONS.outro },
}

export const NOTE_TYPE_KEYS = Object.keys(NOTE_TYPES) as NoteType[]

export const GHOST_COLOR = '#948f87'

/** Canvas colors, mirroring the Grimório tokens. */
export const GRAPH_COLORS = {
  background: '#0d0c0b',
  ink: '#c4baab',
  inkStrong: '#f1ebe1',
  link: '#6e6253',
  linkActive: '#c4baab',
  selected: '#d4a94a',
  onType: '#141210',
}
