import { useMemo, useState } from 'react'
import Markdown from 'react-markdown'
import type { Note, NoteType } from '../types'
import { NOTE_TYPES, NOTE_TYPE_KEYS } from '../noteTypes'
import { backlinks, isAncestor } from '../lib/graph'
import { normalizeTitle, wikiToMarkdown } from '../lib/links'

interface Props {
  note: Note
  notes: Note[]
  onChange: (patch: Partial<Omit<Note, 'id'>>) => void
  onDelete: () => void
  onClose: () => void
  onOpen: (id: string) => void
  onOpenTitle: (title: string) => void
}

export function NoteEditor({ note, notes, onChange, onDelete, onClose, onOpen, onOpenTitle }: Props) {
  const [editing, setEditing] = useState(note.body === '')
  const [tagDraft, setTagDraft] = useState('')
  const info = NOTE_TYPES[note.type]

  const backs = useMemo(() => backlinks(notes, note), [notes, note])
  const children = notes.filter((n) => n.parentId === note.id)
  const parentOptions = notes
    .filter((n) => !isAncestor(notes, note.id, n.id))
    .sort((a, b) => a.title.localeCompare(b.title))
  const duplicate =
    note.title.trim() &&
    notes.some((n) => n.id !== note.id && normalizeTitle(n.title) === normalizeTitle(note.title))

  const addTag = () => {
    const tag = tagDraft.trim()
    if (tag && !note.tags.includes(tag)) onChange({ tags: [...note.tags, tag] })
    setTagDraft('')
  }

  return (
    <section className="editor" style={{ '--c': info.color } as React.CSSProperties}>
      <header className="editor-head">
        <span className="type-icon">{info.icon}</span>
        <input
          className="title"
          value={note.title}
          placeholder="Sem título"
          onChange={(e) => onChange({ title: e.target.value })}
          autoFocus={!note.title}
        />
        <button className="icon" onClick={onClose} title="Fechar">
          ✕
        </button>
      </header>
      {duplicate && <p className="warn">Já existe outra nota com esse título — links vão para a primeira.</p>}

      <div className="fields">
        <label>
          Tipo
          <select value={note.type} onChange={(e) => onChange({ type: e.target.value as NoteType })}>
            {NOTE_TYPE_KEYS.map((t) => (
              <option key={t} value={t}>
                {NOTE_TYPES[t].icon} {NOTE_TYPES[t].label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Dentro de
          <select
            value={note.parentId ?? ''}
            onChange={(e) => onChange({ parentId: e.target.value || undefined })}
          >
            <option value="">— nenhum —</option>
            {parentOptions.map((n) => (
              <option key={n.id} value={n.id}>
                {n.title || 'Sem título'}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="tags">
        {note.tags.map((t) => (
          <span key={t} className="tag">
            #{t}
            <button onClick={() => onChange({ tags: note.tags.filter((x) => x !== t) })}>×</button>
          </span>
        ))}
        <input
          placeholder="+ tag"
          value={tagDraft}
          onChange={(e) => setTagDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTag()}
          onBlur={addTag}
        />
      </div>

      <div className="body-toolbar">
        <button className={editing ? 'on' : ''} onClick={() => setEditing(true)}>
          Editar
        </button>
        <button className={!editing ? 'on' : ''} onClick={() => setEditing(false)}>
          Visualizar
        </button>
        <span className="hint">Use [[Nome da nota]] para linkar</span>
      </div>

      {editing ? (
        <textarea
          className="body"
          value={note.body}
          onChange={(e) => onChange({ body: e.target.value })}
          placeholder="Escreva aqui… ex.: Dono da [[Taverna do Javali]]."
        />
      ) : (
        <div className="body preview" onDoubleClick={() => setEditing(true)}>
          {note.body.trim() ? (
            <Markdown
              urlTransform={(url) => url}
              components={{
                a: ({ href, children }) => {
                  if (href?.startsWith('#note:')) {
                    const title = decodeURIComponent(href.slice(6))
                    const exists = notes.some((n) => normalizeTitle(n.title) === normalizeTitle(title))
                    return (
                      <a
                        href={href}
                        className={`wikilink${exists ? '' : ' missing'}`}
                        onClick={(e) => {
                          e.preventDefault()
                          onOpenTitle(title)
                        }}
                      >
                        {children}
                      </a>
                    )
                  }
                  return (
                    <a href={href} target="_blank" rel="noreferrer">
                      {children}
                    </a>
                  )
                },
              }}
            >
              {wikiToMarkdown(note.body)}
            </Markdown>
          ) : (
            <p className="hint">Nada escrito ainda. Clique em Editar.</p>
          )}
        </div>
      )}

      {(children.length > 0 || backs.length > 0) && (
        <div className="relations">
          {children.length > 0 && (
            <RelationList title="Sub-notas" notes={children} onOpen={onOpen} />
          )}
          {backs.length > 0 && <RelationList title="Citada em" notes={backs} onOpen={onOpen} />}
        </div>
      )}

      <footer className="editor-foot">
        <button
          className="danger"
          onClick={() => confirm(`Excluir "${note.title || 'Sem título'}"?`) && onDelete()}
        >
          Excluir nota
        </button>
      </footer>
    </section>
  )
}

function RelationList({ title, notes, onOpen }: { title: string; notes: Note[]; onOpen: (id: string) => void }) {
  return (
    <div>
      <h4>{title}</h4>
      <ul>
        {notes.map((n) => (
          <li key={n.id}>
            <button className="link-btn" onClick={() => onOpen(n.id)}>
              {NOTE_TYPES[n.type].icon} {n.title || 'Sem título'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
