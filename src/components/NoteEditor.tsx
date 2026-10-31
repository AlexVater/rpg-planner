import { useMemo, useState } from 'react'
import Markdown from 'react-markdown'
import type { Note, NoteType } from '../types'
import { NOTE_TYPES, NOTE_TYPE_KEYS } from '../noteTypes'
import { backlinks, isAncestor } from '../lib/graph'
import { normalizeTitle, parseLinks, wikiToMarkdown } from '../lib/links'
import { ICONS, Icon } from '../icons'
import { ConfirmDialog } from './ConfirmDialog'

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
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const info = NOTE_TYPES[note.type]

  const backs = useMemo(() => backlinks(notes, note), [notes, note])
  const children = notes.filter((n) => n.parentId === note.id)
  const parent = notes.find((n) => n.id === note.parentId)
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
        <span className="type-badge">
          <Icon d={info.icon} />
        </span>
        <div className="editor-title">
          <input
            className="title"
            value={note.title}
            placeholder="Sem título"
            aria-label="Título"
            onChange={(e) => onChange({ title: e.target.value })}
            autoFocus={!note.title}
          />
          <p className="kicker">
            {info.label}
            {parent && ` · em ${parent.title || 'Sem título'}`}
          </p>
        </div>
        <button className="icon-btn" onClick={onClose} aria-label="Fechar">
          <Icon d={ICONS.close} />
        </button>
      </header>
      {duplicate && (
        <div className="alert">
          <Icon d={ICONS.warn} />
          <span>
            Já existe outra nota chamada <strong>{note.title}</strong>. Os links vão para a primeira.
          </span>
        </div>
      )}

      <div className="fields">
        <label>
          <span className="label">Tipo</span>
          <select value={note.type} onChange={(e) => onChange({ type: e.target.value as NoteType })}>
            {NOTE_TYPE_KEYS.map((t) => (
              <option key={t} value={t}>
                {NOTE_TYPES[t].label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">Dentro de</span>
          <select
            value={note.parentId ?? ''}
            onChange={(e) => onChange({ parentId: e.target.value || undefined })}
          >
            <option value="">— nenhuma —</option>
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
            {t}
            <button
              aria-label={`Remover ${t}`}
              onClick={() => onChange({ tags: note.tags.filter((x) => x !== t) })}
            >
              ×
            </button>
          </span>
        ))}
        <input
          className="tag-add"
          placeholder="+ tag"
          aria-label="Adicionar tag"
          value={tagDraft}
          onChange={(e) => setTagDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addTag()
            if (e.key === 'Backspace' && !tagDraft && note.tags.length) onChange({ tags: note.tags.slice(0, -1) })
          }}
          onBlur={addTag}
        />
      </div>

      <div className="body-block">
        <div className="body-toolbar">
          <div className="seg" role="group" aria-label="Modo">
            <button aria-pressed={editing} onClick={() => setEditing(true)}>
              Editar
            </button>
            <button aria-pressed={!editing} onClick={() => setEditing(false)}>
              Visualizar
            </button>
          </div>
          <span className="hint">
            Use <code>[[Nome da nota]]</code> para linkar
          </span>
        </div>

        {editing ? (
          <textarea
            className="body"
            value={note.body}
            onChange={(e) => onChange({ body: e.target.value })}
            placeholder="Escreva aqui… ex.: Dono da [[Taverna do Javali]]."
          />
        ) : (
          <article className="page" onDoubleClick={() => setEditing(true)}>
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
                          title={exists ? undefined : 'Nota ainda não criada. Clique para criar.'}
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
              <p className="page-empty">
                Esta nota ainda não tem texto. Mude para Editar e escreva o que os jogadores ainda não sabem.
              </p>
            )}
          </article>
        )}
      </div>

      {children.length > 0 && <RelationList title="Sub-notas" notes={children} onOpen={onOpen} />}
      {backs.length > 0 && <RelationList title="Citada em" notes={backs} onOpen={onOpen} />}

      <footer className="editor-foot">
        <span>Salvo automaticamente</span>
        <button className="btn btn-danger btn-sm" onClick={() => setConfirmingDelete(true)}>
          Excluir nota
        </button>
      </footer>

      {confirmingDelete && (
        <ConfirmDialog
          title={`Excluir “${note.title || 'Sem título'}”?`}
          confirmLabel="Excluir nota"
          danger
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={onDelete}
        >
          {deleteConsequences(children.length, notes, note)}
        </ConfirmDialog>
      )}
    </section>
  )
}

function deleteConsequences(childCount: number, notes: Note[], note: Note): string {
  const key = normalizeTitle(note.title)
  const citing = note.title.trim()
    ? notes.filter((n) => n.id !== note.id && parseLinks(n.body).some((l) => normalizeTitle(l.target) === key)).length
    : 0
  const parts = []
  if (childCount) parts.push(`${childCount} sub-nota${childCount > 1 ? 's ficam' : ' fica'} sem nota-mãe`)
  if (citing) parts.push(`${citing} link${citing > 1 ? 's viram' : ' vira'} nota fantasma`)
  return parts.length ? `Isto não pode ser desfeito: ${parts.join(' e ')}.` : 'Isto não pode ser desfeito.'
}

function RelationList({ title, notes, onOpen }: { title: string; notes: Note[]; onOpen: (id: string) => void }) {
  return (
    <div>
      <h3 className="heading">
        {title} <span className="count">{notes.length}</span>
      </h3>
      <ul className="note-list">
        {notes.map((n) => (
          <li key={n.id}>
            <button
              className="note-item"
              style={{ '--c': NOTE_TYPES[n.type].color } as React.CSSProperties}
              onClick={() => onOpen(n.id)}
            >
              <span className="dot" />
              <span className="note-item-title">{n.title || 'Sem título'}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
