import { useState } from 'react'
import type { NoteType } from './types'
import { NOTE_TYPE_KEYS } from './noteTypes'
import { useCampaign } from './state/useCampaign'
import { GHOST_PREFIX } from './lib/graph'
import { downloadCampaign, readCampaignFile } from './lib/storage'
import { Sidebar } from './components/Sidebar'
import { GraphView } from './components/GraphView'
import { NoteEditor } from './components/NoteEditor'

export default function App() {
  const store = useCampaign()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [visibleTypes, setVisibleTypes] = useState(() => new Set<NoteType>(NOTE_TYPE_KEYS))

  if (!store.campaign) return <div className="loading">Carregando…</div>
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
    try {
      const imported = await readCampaignFile(file)
      if (!confirm(`Substituir a campanha atual por "${imported.name}" (${imported.notes.length} notas)?`)) return
      store.load(imported)
      setSelectedId(null)
    } catch (e) {
      alert(`Não foi possível importar: ${(e as Error).message}`)
    }
  }

  return (
    <div className={`app${selected ? ' with-editor' : ''}`}>
      <Sidebar
        campaign={campaign}
        selectedId={selectedId}
        visibleTypes={visibleTypes}
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
    </div>
  )
}
