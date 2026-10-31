export type NoteType =
  | 'npc'
  | 'local'
  | 'artefato'
  | 'item-magico'
  | 'lore'
  | 'faccao'
  | 'sessao'
  | 'outro'

export interface Note {
  id: string
  title: string
  type: NoteType
  parentId?: string
  tags: string[]
  body: string
  createdAt: string
  updatedAt: string
}

export interface Campaign {
  version: 1
  name: string
  notes: Note[]
}

export interface GraphNode {
  id: string
  title: string
  type: NoteType | 'ghost'
}

export interface GraphLink {
  source: string
  target: string
  kind: 'link' | 'parent'
}
