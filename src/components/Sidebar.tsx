import { useMemo, useRef, useState } from 'react'
import type { Campaign, Note, NoteType } from '../types'
import { NOTE_TYPES, NOTE_TYPE_KEYS } from '../noteTypes'
import { ICONS, Icon } from '../icons'

interface Props {
  campaign: Campaign
  selectedId: string | null
  visibleTypes: Set<NoteType>
  importError: string | null
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

  const { roots, children, matches, counts } = useMemo(() => {
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
    const counts = new Map<NoteType, number>()
    const sorted = [...campaign.notes].sort((a, b) => a.title.localeCompare(b.title))
    for (const n of sorted) {
      counts.set(n.type, (counts.get(n.type) ?? 0) + 1)
      if (n.parentId && ids.has(n.parentId)) {
        children.set(n.parentId, [...(children.get(n.parentId) ?? []), n])
      } else roots.push(n)
    }
    return { roots, children, matches, counts }
  }, [campaign.notes, query, visibleTypes])

  // A note is shown if it matches or any descendant matches (keeps the tree readable).
  const shows = (n: Note): boolean => matches(n) || (children.get(n.id) ?? []).some(shows)
  const anyShown = roots.some(shows)

  const renderNote = (n: Note) => {
    if (!shows(n)) return null
    const kids = children.get(n.id)
    return (
      <li key={n.id}>
        <button
          className={`note-item${n.id === selectedId ? ' selected' : ''}${matches(n) ? '' : ' dim'}`}
          style={{ '--c': NOTE_TYPES[n.type].color } as React.CSSProperties}
          onClick={() => props.onSelect(n.id)}
        >
          <span className="dot" />
          <span className="note-item-title">{n.title || 'Sem título'}</span>
          {kids && <span className="note-item-meta">{kids.length}</span>}
        </button>
        {kids && <ul>{kids.map(renderNote)}</ul>}
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
      <button className="btn btn-primary btn-block" onClick={props.onNew}>
        <Icon d={ICONS.plus} />
        Nova nota
      </button>
      <label className="search">
        <Icon d={ICONS.search} />
        <input
          placeholder="Buscar em títulos, texto e tags"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar notas"
        />
      </label>

      <section>
        <h3 className="heading">Tipos</h3>
        <div className="chips">
          {NOTE_TYPE_KEYS.map((t) => (
            <button
              key={t}
              className="chip"
              aria-pressed={visibleTypes.has(t)}
              style={{ '--c': NOTE_TYPES[t].color } as React.CSSProperties}
              onClick={() => props.onToggleType(t)}
            >
              <span className="chip-mark">
                <Icon d={NOTE_TYPES[t].icon} />
              </span>
              {NOTE_TYPES[t].label}
              {counts.get(t) ? <span className="count">{counts.get(t)}</span> : null}
            </button>
          ))}
        </div>
      </section>

      <section className="notes-section">
        <h3 className="heading">
          Notas <span className="count">{campaign.notes.length}</span>
        </h3>
        {campaign.notes.length > 0 && !anyShown ? (
          <div className="empty-state compact">
            <div className="sigil">
              <Icon d={ICONS.search} />
            </div>
            <h3>Nada encontrado</h3>
            <p>{query.trim() ? `Nenhuma nota tem “${query.trim()}” no título, no texto ou nas tags.` : 'Todos os tipos estão desligados.'}</p>
          </div>
        ) : (
          <ul className="note-list">{roots.map(renderNote)}</ul>
        )}
      </section>

      {props.importError && (
        <div className="alert alert-danger" role="alert">
          <Icon d={ICONS.warn} />
          <span>
            <strong>Não foi possível importar.</strong> {props.importError}
          </span>
        </div>
      )}
      <div className="io">
        <button className="btn btn-ghost btn-sm" onClick={props.onExport}>
          <Icon d={ICONS.download} />
          Exportar JSON
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => fileInput.current?.click()}>
          <Icon d={ICONS.upload} />
          Importar JSON
        </button>
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
