import { useState } from 'react'
import type { Campaign, NoteType } from './types'
import { NOTE_TYPE_KEYS } from './noteTypes'
import { useCampaign } from './state/useCampaign'
import { GHOST_PREFIX } from './lib/graph'
import { downloadCampaign, readCampaignFile } from './lib/storage'
import { Sidebar } from './components/Sidebar'
import { GraphView } from './components/GraphView'
import { NoteEditor } from './components/NoteEditor'
import { ConfirmDialog } from './components/ConfirmDialog'
import { ICONS, Icon } from './icons'

export default function App() {
  const store = useCampaign()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [visibleTypes, setVisibleTypes] = useState(() => new Set<NoteType>(NOTE_TYPE_KEYS))
  const [pendingImport, setPendingImport] = useState<{ file: string; campaign: Campaign } | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  // Mobile only: which full-screen view sits under the note sheet.
  const [mobileTab, setMobileTab] = useState<'notes' | 'graph'>('graph')

  if (!store.campaign)
    return (
      <div className="loading">
        <div className="spinner" />
        <p>Abrindo o grimório…</p>
      </div>
    )
  const { campaign } = store
  const selected = campaign.notes.find((n) => n.id === selectedId) ?? null

  const toggleType = (t: NoteType) =>
    setVisibleTypes((prev) => {
      const next = new Set(prev)
      if (next.has(t)) next.delete(t)
      else next.add(t)
      return next
    })

  const openTitle = (title: string) => setSelectedId(store.resolveOrCreate(title).id)

  const importFile = async (file: File) => {
    setImportError(null)
    try {
      setPendingImport({ file: file.name, campaign: await readCampaignFile(file) })
    } catch (e) {
      setImportError((e as Error).message)
    }
  }

  return (
    <div className={`app tab-${mobileTab}${selected ? ' with-editor' : ''}`}>
      <Sidebar
        campaign={campaign}
        selectedId={selectedId}
        visibleTypes={visibleTypes}
        importError={importError}
        onToggleType={toggleType}
        onSelect={setSelectedId}
        onNew={() => setSelectedId(store.addNote({ type: 'npc' }).id)}
        onRenameCampaign={store.renameCampaign}
        onExport={() => downloadCampaign(campaign)}
        onImport={importFile}
      />
      <GraphView
        notes={campaign.notes}
        visibleTypes={visibleTypes}
        selectedId={selectedId}
        onNodeClick={(node) =>
          node.id.startsWith(GHOST_PREFIX) ? openTitle(node.title) : setSelectedId(node.id)
        }
        onNew={() => setSelectedId(store.addNote({ type: 'npc' }).id)}
      />
      {selected && (
        <NoteEditor
          key={selected.id}
          note={selected}
          notes={campaign.notes}
          onChange={(patch) => store.updateNote(selected.id, patch)}
          onDelete={() => {
            store.deleteNote(selected.id)
            setSelectedId(null)
          }}
          onClose={() => setSelectedId(null)}
          onOpen={setSelectedId}
          onOpenTitle={openTitle}
        />
      )}
      <nav className="mobile-nav" aria-label="Navegação">
        <button aria-pressed={mobileTab === 'notes'} onClick={() => setMobileTab('notes')}>
          <Icon d={ICONS.list} />
          Notas
        </button>
        <button
          className="mobile-new"
          aria-label="Nova nota"
          onClick={() => setSelectedId(store.addNote({ type: 'npc' }).id)}
        >
          <Icon d={ICONS.plus} />
        </button>
        <button aria-pressed={mobileTab === 'graph'} onClick={() => setMobileTab('graph')}>
          <Icon d={ICONS.graph} />
          Grafo
        </button>
      </nav>
      {pendingImport && (
        <ConfirmDialog
          title="Substituir a campanha?"
          confirmLabel="Importar e substituir"
          onCancel={() => setPendingImport(null)}
          onConfirm={() => {
            store.load(pendingImport.campaign)
            setSelectedId(null)
            setPendingImport(null)
          }}
        >
          Importar <strong>{pendingImport.file}</strong> (“{pendingImport.campaign.name}”,{' '}
          {pendingImport.campaign.notes.length} notas) vai substituir a campanha atual ({campaign.notes.length}{' '}
          notas). Exporte antes se quiser guardar uma cópia.
        </ConfirmDialog>
      )}
    </div>
  )
}
