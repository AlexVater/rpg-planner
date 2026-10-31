import { useEffect, useReducer, useRef } from 'react'
import type { Campaign, Note } from '../types'
import { createNote } from '../lib/campaign'
import { findByTitle, renameLinksInBody } from '../lib/links'
import { loadLocal, loadSeed, saveLocal } from '../lib/storage'

type Action =
  | { type: 'load'; campaign: Campaign }
  | { type: 'add'; note: Note }
  | { type: 'update'; id: string; patch: Partial<Omit<Note, 'id'>> }
  | { type: 'delete'; id: string }
  | { type: 'rename-campaign'; name: string }

interface State {
  campaign: Campaign | null
}

function reducer(state: State, action: Action): State {
  if (action.type === 'load') return { campaign: action.campaign }
  const c = state.campaign
  if (!c) return state
  const now = new Date().toISOString()

  switch (action.type) {
    case 'add':
      return { campaign: { ...c, notes: [...c.notes, action.note] } }
    case 'update': {
      const old = c.notes.find((n) => n.id === action.id)
      if (!old) return state
      const renamed =
        action.patch.title !== undefined &&
        action.patch.title.trim() &&
        action.patch.title !== old.title &&
        old.title.trim()
      const notes = c.notes.map((n) => {
        if (n.id === action.id) return { ...n, ...action.patch, updatedAt: now }
        if (!renamed) return n
        const body = renameLinksInBody(n.body, old.title, action.patch.title!)
        return body === n.body ? n : { ...n, body, updatedAt: now }
      })
      return { campaign: { ...c, notes } }
    }
    case 'delete':
      return {
        campaign: {
          ...c,
          notes: c.notes
            .filter((n) => n.id !== action.id)
            .map((n) => (n.parentId === action.id ? { ...n, parentId: undefined } : n)),
        },
      }
    case 'rename-campaign':
      return { campaign: { ...c, name: action.name } }
  }
}

export function useCampaign() {
  const [state, dispatch] = useReducer(reducer, { campaign: null })
  const saveTimer = useRef<number>()

  useEffect(() => {
    const local = loadLocal()
    if (local) dispatch({ type: 'load', campaign: local })
    else loadSeed().then((campaign) => dispatch({ type: 'load', campaign }))
  }, [])

  useEffect(() => {
    if (!state.campaign) return
    window.clearTimeout(saveTimer.current)
    const campaign = state.campaign
    saveTimer.current = window.setTimeout(() => saveLocal(campaign), 300)
  }, [state.campaign])

  const notes = state.campaign?.notes ?? []

  return {
    campaign: state.campaign,
    load: (campaign: Campaign) => dispatch({ type: 'load', campaign }),
    addNote: (partial: Partial<Note> = {}) => {
      const note = createNote(partial)
      dispatch({ type: 'add', note })
      return note
    },
    updateNote: (id: string, patch: Partial<Omit<Note, 'id'>>) =>
      dispatch({ type: 'update', id, patch }),
    deleteNote: (id: string) => dispatch({ type: 'delete', id }),
    renameCampaign: (name: string) => dispatch({ type: 'rename-campaign', name }),
    /** Opens an existing note by title or creates it (used by links and ghost nodes). */
    resolveOrCreate: (title: string): Note => {
      const existing = findByTitle(notes, title)
      if (existing) return existing
      const note = createNote({ title: title.trim() })
      dispatch({ type: 'add', note })
      return note
    },
  }
}
