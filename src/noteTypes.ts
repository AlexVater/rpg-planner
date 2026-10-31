import type { NoteType } from './types'

export interface NoteTypeInfo {
  label: string
  color: string
  icon: string
}

export const NOTE_TYPES: Record<NoteType, NoteTypeInfo> = {
  npc: { label: 'NPC', color: '#e8a838', icon: '🧙' },
  local: { label: 'Local', color: '#4caf7a', icon: '🏰' },
  artefato: { label: 'Artefato', color: '#c05bd6', icon: '🏺' },
  'item-magico': { label: 'Item mágico', color: '#5b8def', icon: '✨' },
  lore: { label: 'Lore', color: '#d65b5b', icon: '📜' },
  faccao: { label: 'Facção', color: '#3fb8c4', icon: '⚔️' },
  sessao: { label: 'Sessão', color: '#9aa35b', icon: '🎲' },
  outro: { label: 'Outro', color: '#8a8f98', icon: '📌' },
}

export const NOTE_TYPE_KEYS = Object.keys(NOTE_TYPES) as NoteType[]

export const GHOST_COLOR = '#555a63'
