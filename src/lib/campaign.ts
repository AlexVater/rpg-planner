import type { Campaign, Note, NoteType } from '../types'
import { NOTE_TYPE_KEYS } from '../noteTypes'
import { isAncestor } from './graph'

export function createNote(partial: Partial<Note> = {}): Note {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    title: '',
    type: 'outro',
    tags: [],
    body: '',
    createdAt: now,
    updatedAt: now,
    ...partial,
  }
}

export function emptyCampaign(): Campaign {
  return { version: 1, name: 'Minha campanha', notes: [] }
}

/** Validates unknown JSON as a Campaign. Throws a readable error when invalid. */
export function parseCampaign(data: unknown): Campaign {
  if (!data || typeof data !== 'object') throw new Error('Arquivo não é um objeto JSON.')
  const obj = data as Record<string, unknown>
  if (obj.version !== 1) throw new Error('Versão de campanha não suportada.')
  if (!Array.isArray(obj.notes)) throw new Error('Campo "notes" ausente ou inválido.')

  const ids = new Set<string>()
  const notes: Note[] = obj.notes.map((raw, i) => {
    if (!raw || typeof raw !== 'object') throw new Error(`Nota #${i + 1} inválida.`)
    const n = raw as Record<string, unknown>
    if (typeof n.id !== 'string' || !n.id) throw new Error(`Nota #${i + 1} sem id.`)
    if (ids.has(n.id)) throw new Error(`Id duplicado: ${n.id}`)
    ids.add(n.id)
    const type = NOTE_TYPE_KEYS.includes(n.type as NoteType) ? (n.type as NoteType) : 'outro'
    const now = new Date().toISOString()
    return {
      id: n.id,
      title: typeof n.title === 'string' ? n.title : '',
      type,
      parentId: typeof n.parentId === 'string' ? n.parentId : undefined,
      tags: Array.isArray(n.tags) ? n.tags.filter((t): t is string => typeof t === 'string') : [],
      body: typeof n.body === 'string' ? n.body : '',
      createdAt: typeof n.createdAt === 'string' ? n.createdAt : now,
      updatedAt: typeof n.updatedAt === 'string' ? n.updatedAt : now,
    }
  })

  // Drop parents that don't exist or would form a cycle.
  const cleaned = notes.map((n) =>
    n.parentId && !ids.has(n.parentId) ? { ...n, parentId: undefined } : n,
  )
  for (let i = 0; i < cleaned.length; i++) {
    const note = cleaned[i]
    if (note.parentId && isAncestor(cleaned, note.id, note.parentId)) {
      cleaned[i] = { ...note, parentId: undefined }
    }
  }

  return {
    version: 1,
    name: typeof obj.name === 'string' && obj.name ? obj.name : 'Minha campanha',
    notes: cleaned,
  }
}
