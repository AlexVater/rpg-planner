import { useEffect, useMemo, useRef, useState } from 'react'
import ForceGraph2D, { type ForceGraphMethods } from 'react-force-graph-2d'
import type { GraphLink, GraphNode, Note, NoteType } from '../types'
import { GHOST_COLOR, NOTE_TYPES } from '../noteTypes'
import { buildGraph } from '../lib/graph'

// The force engine mutates nodes (x, y, vx…) and replaces link ends with node objects.
type SimNode = GraphNode & { x?: number; y?: number }
type SimLink = Omit<GraphLink, 'source' | 'target'> & { source: string | SimNode; target: string | SimNode }

interface Props {
  notes: Note[]
  visibleTypes: Set<NoteType>
  selectedId: string | null
  onNodeClick: (node: GraphNode) => void
}

const endId = (end: string | SimNode) => (typeof end === 'string' ? end : end.id)

export function GraphView({ notes, visibleTypes, selectedId, onNodeClick }: Props) {
  const wrap = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [hoverId, setHoverId] = useState<string | null>(null)
  const prevNodes = useRef(new Map<string, SimNode>())
  const fg = useRef<ForceGraphMethods<SimNode, SimLink>>()
  const fitted = useRef(false)

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) =>
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height }),
    )
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const data = useMemo(() => {
    const { nodes, links } = buildGraph(notes, visibleTypes)
    // Reuse previous node objects so the layout doesn't jump on every edit.
    const simNodes = nodes.map((n) => Object.assign(prevNodes.current.get(n.id) ?? {}, n) as SimNode)
    prevNodes.current = new Map(simNodes.map((n) => [n.id, n]))
    return { nodes: simNodes, links: links as SimLink[] }
  }, [notes, visibleTypes])

  useEffect(() => {
    fg.current?.d3Force('charge')?.strength(-220)
    fg.current?.d3Force('link')?.distance(70)
  }, [size.width > 0])

  useEffect(() => {
    const node = selectedId ? prevNodes.current.get(selectedId) : undefined
    if (node?.x !== undefined && node.y !== undefined) fg.current?.centerAt(node.x, node.y, 500)
  }, [selectedId, size.width])

  const neighbors = useMemo(() => {
    const map = new Map<string, Set<string>>()
    for (const l of data.links) {
      const s = endId(l.source)
      const t = endId(l.target)
      if (!map.has(s)) map.set(s, new Set())
      if (!map.has(t)) map.set(t, new Set())
      map.get(s)!.add(t)
      map.get(t)!.add(s)
    }
    return map
  }, [data])

  const focusId = hoverId ?? selectedId
  const isLit = (id: string) => !focusId || id === focusId || !!neighbors.get(focusId)?.has(id)

  return (
    <div className="graph" ref={wrap}>
      {notes.length === 0 && <p className="empty">Nenhuma nota ainda. Crie a primeira na barra lateral.</p>}
      {size.width > 0 && (
        <ForceGraph2D<SimNode, SimLink>
          ref={fg}
          onEngineStop={() => {
            if (fitted.current) return
            fitted.current = true
            fg.current?.zoomToFit(400, 60)
          }}
          width={size.width}
          height={size.height}
          graphData={data}
          backgroundColor="rgba(0,0,0,0)"
          nodeId="id"
          nodeLabel={() => ''}
          onNodeClick={(n) => onNodeClick(n)}
          onNodeHover={(n) => setHoverId(n?.id ?? null)}
          linkColor={(l) =>
            isLit(endId(l.source)) && isLit(endId(l.target)) && (!focusId || endId(l.source) === focusId || endId(l.target) === focusId)
              ? 'rgba(220,225,235,0.7)'
              : 'rgba(140,150,165,0.18)'
          }
          linkWidth={(l) => (l.kind === 'parent' ? 1.5 : 1)}
          linkLineDash={(l) => (l.kind === 'parent' ? [4, 3] : null)}
          nodeCanvasObject={(node, ctx, scale) => {
            const color = node.type === 'ghost' ? GHOST_COLOR : NOTE_TYPES[node.type].color
            const lit = isLit(node.id)
            const r = node.id === selectedId ? 7 : 5
            ctx.globalAlpha = lit ? 1 : 0.2
            ctx.beginPath()
            ctx.arc(node.x!, node.y!, r, 0, 2 * Math.PI)
            if (node.type === 'ghost') {
              ctx.setLineDash([2, 2])
              ctx.strokeStyle = color
              ctx.lineWidth = 1.5
              ctx.stroke()
              ctx.setLineDash([])
            } else {
              ctx.fillStyle = color
              ctx.fill()
            }
            if (node.id === selectedId) {
              ctx.strokeStyle = '#fff'
              ctx.lineWidth = 1.5
              ctx.stroke()
            }
            if (scale > 0.9 || node.id === focusId) {
              const fontSize = Math.max(11 / scale, 3)
              ctx.font = `${fontSize}px system-ui, sans-serif`
              ctx.textAlign = 'center'
              ctx.textBaseline = 'top'
              ctx.fillStyle = node.type === 'ghost' ? '#8a8f98' : '#dfe3ea'
              ctx.fillText(node.title || 'Sem título', node.x!, node.y! + r + 2)
            }
            ctx.globalAlpha = 1
          }}
          nodePointerAreaPaint={(node, color, ctx) => {
            ctx.fillStyle = color
            ctx.beginPath()
            ctx.arc(node.x!, node.y!, 8, 0, 2 * Math.PI)
            ctx.fill()
          }}
        />
      )}
      <div className="legend">
        <span><i className="line solid" /> link</span>
        <span><i className="line dashed" /> sub-nota</span>
        <span><i className="ghost-dot" /> nota não criada</span>
      </div>
    </div>
  )
}
