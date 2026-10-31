import { useEffect, useMemo, useRef, useState } from 'react'
import ForceGraph2D, { type ForceGraphMethods } from 'react-force-graph-2d'
import type { GraphLink, GraphNode, Note, NoteType } from '../types'
import { GHOST_COLOR, GRAPH_COLORS, NOTE_TYPES } from '../noteTypes'
import { ICONS, Icon } from '../icons'
import { buildGraph } from '../lib/graph'

// The force engine mutates nodes (x, y, vx…) and replaces link ends with node objects.
type SimNode = GraphNode & { x?: number; y?: number }
type SimLink = Omit<GraphLink, 'source' | 'target'> & { source: string | SimNode; target: string | SimNode }

interface Props {
  notes: Note[]
  visibleTypes: Set<NoteType>
  selectedId: string | null
  onNodeClick: (node: GraphNode) => void
  onNew: () => void
}

const endId = (end: string | SimNode) => (typeof end === 'string' ? end : end.id)

export function GraphView({ notes, visibleTypes, selectedId, onNodeClick, onNew }: Props) {
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
      {notes.length === 0 && (
        <div className="empty-state graph-empty">
          <div className="sigil">
            <Icon d={ICONS.lore} />
          </div>
          <h3>Nenhuma nota ainda</h3>
          <p>Comece pelo vilão, ou pela taverna onde tudo começa.</p>
          <button className="btn btn-primary btn-sm" onClick={onNew}>
            <Icon d={ICONS.plus} />
            Nova nota
          </button>
        </div>
      )}
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
              ? GRAPH_COLORS.linkActive
              : focusId
                ? 'rgba(110,98,83,0.25)'
                : GRAPH_COLORS.link
          }
          linkWidth={(l) => (l.kind === 'parent' ? 1.5 : 1)}
          linkLineDash={(l) => (l.kind === 'parent' ? [4, 3] : null)}
          nodeCanvasObject={(node, ctx, scale) =>
            drawNode(node, ctx, scale, {
              selected: node.id === selectedId,
              active: !!focusId && isLit(node.id),
              dimmed: !isLit(node.id),
            })
          }
          nodePointerAreaPaint={(node, color, ctx) => {
            ctx.fillStyle = color
            ctx.beginPath()
            ctx.arc(node.x!, node.y!, 11, 0, 2 * Math.PI)
            ctx.fill()
          }}
        />
      )}
      <div className="legend">
        <span><i className="line solid" /> Link</span>
        <span><i className="line dashed" /> Sub-nota</span>
        <span><i className="ghost-dot" /> Ainda não criada</span>
      </div>
    </div>
  )
}

const paths = new Map<string, Path2D>()
const path2d = (d: string) => {
  if (!paths.has(d)) paths.set(d, new Path2D(d))
  return paths.get(d)!
}

/** Grimório node: type-colored disc with its icon, gold ring when selected, dashed when ghost. */
function drawNode(
  node: SimNode,
  ctx: CanvasRenderingContext2D,
  scale: number,
  state: { selected: boolean; active: boolean; dimmed: boolean },
) {
  const x = node.x!
  const y = node.y!
  const ghost = node.type === 'ghost'
  const info = ghost ? null : NOTE_TYPES[node.type as NoteType]
  const r = state.selected ? 10 : 7
  ctx.save()
  if (state.dimmed) ctx.globalAlpha = 0.18

  ctx.beginPath()
  ctx.arc(x, y, r, 0, 2 * Math.PI)
  if (!info) {
    ctx.fillStyle = GRAPH_COLORS.background
    ctx.fill()
    ctx.setLineDash([2.5, 2])
    ctx.lineWidth = 1.25
    ctx.strokeStyle = GHOST_COLOR
    ctx.stroke()
    ctx.setLineDash([])
  } else {
    ctx.fillStyle = info.color
    ctx.fill()
    if (state.selected) {
      ctx.lineWidth = 2
      ctx.strokeStyle = GRAPH_COLORS.inkStrong
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(x, y, r + 3.5, 0, 2 * Math.PI)
      ctx.lineWidth = 1
      ctx.strokeStyle = GRAPH_COLORS.selected
      ctx.stroke()
    }
    // Only draw the icon once it's big enough on screen to read.
    if (r * scale >= 9) {
      const k = (r * 1.25) / 12
      ctx.save()
      ctx.translate(x - 12 * k, y - 12 * k)
      ctx.scale(k, k)
      ctx.lineWidth = 2.2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = GRAPH_COLORS.onType
      ctx.stroke(path2d(info.icon))
      ctx.restore()
    }
  }

  if (scale > 0.9 || state.selected || state.active) {
    const title = node.title || 'Sem título'
    const fontSize = Math.max(11 / scale, 2.5)
    ctx.font = `${state.selected ? 700 : 400} ${fontSize}px "Roboto Condensed", "Arial Narrow", sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    // Halo in the background color so titles stay readable over links.
    ctx.lineWidth = 3 / scale
    ctx.strokeStyle = GRAPH_COLORS.background
    ctx.strokeText(title, x, y + r + 3)
    ctx.fillStyle = ghost ? GHOST_COLOR : state.selected || state.active ? GRAPH_COLORS.inkStrong : GRAPH_COLORS.ink
    ctx.fillText(title, x, y + r + 3)
  }
  ctx.restore()
}
