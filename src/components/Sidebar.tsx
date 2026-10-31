import { useMemo, useRef, useState } from 'react'
import type { Campaign, Note, NoteType } from '../types'
import { NOTE_TYPES, NOTE_TYPE_KEYS } from '../noteTypes'

interface Props {
  campaign: Campaign
  selectedId: string | null
  visibleTypes: Set<NoteType>
  onToggleType: (type: NoteType) => void
  onSelect: (id: string) => void
  onNew: () => void
  onRenameCampaign: (name: string) => void
  onExport: () => void
  onImport: (file: File) => void
}

export function Sidebar(props: Props) {
  const { campaign, selectedId, visibleTypes } = props
  const [query, setQuery] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  const { roots, children, matches } = useMemo(() => {
    const q = query.trim().toLowerCase()
    const matches = (n: Note) =>
      visibleTypes.has(n.type) &&
      (!q ||
        n.title.toLowerCase().includes(q) ||
        n.body.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q)))
    const ids = new Set(campaign.notes.map((n) => n.id))
    const children = new Map<string, Note[]>()
    const roots: Note[] = []
    const sorted = [...campaign.notes].sort((a, b) => a.title.localeCompare(b.title))
    for (const n of sorted) {
      if (n.parentId && ids.has(n.parentId)) {
        children.set(n.parentId, [...(children.get(n.parentId) ?? []), n])
      } else roots.push(n)
    }
    return { roots, children, matches }
  }, [campaign.notes, query, visibleTypes])

  // A note is shown if it matches or any descendant matches (keeps the tree readable).
  const shows = (n: Note): boolean => matches(n) || (children.get(n.id) ?? []).some(shows)

  const renderNote = (n: Note, depth: number) => {
    if (!shows(n)) return null
    const info = NOTE_TYPES[n.type]
    return (
      <li key={n.id}>
        <button
          className={`note-item${n.id === selectedId ? ' selected' : ''}${matches(n) ? '' : ' dim'}`}
          style={{ paddingLeft: 8 + depth * 14 }}
          onClick={() => props.onSelect(n.id)}
        >
          <span className="dot" style={{ background: info.color }} />
          <span className="note-item-title">{n.title || 'Sem título'}</span>
        </button>
        {children.get(n.id) && <ul>{children.get(n.id)!.map((c) => renderNote(c, depth + 1))}</ul>}
      </li>
    )
  }

  return (
    <aside className="sidebar">
      <input
        className="campaign-name"
        value={campaign.name}
        onChange={(e) => props.onRenameCampaign(e.target.value)}
        aria-label="Nome da campanha"
      />
      <button className="primary" onClick={props.onNew}>
        + Nova nota
      </button>
      <input
        className="search"
        placeholder="Buscar…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="chips">
        {NOTE_TYPE_KEYS.map((t) => (
          <button
            key={t}
            className={`chip${visibleTypes.has(t) ? ' on' : ''}`}
            style={{ '--c': NOTE_TYPES[t].color } as React.CSSProperties}
            onClick={() => props.onToggleType(t)}
            title={NOTE_TYPES[t].label}
          >
            {NOTE_TYPES[t].icon} {NOTE_TYPES[t].label}
          </button>
        ))}
      </div>
      <ul className="note-list">{roots.map((n) => renderNote(n, 0))}</ul>
      <div className="io">
        <button onClick={props.onExport}>Exportar JSON</button>
        <button onClick={() => fileInput.current?.click()}>Importar JSON</button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) props.onImport(file)
            e.target.value = ''
          }}
        />
      </div>
    </aside>
  )
}
