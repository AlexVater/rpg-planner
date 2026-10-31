# GraphNode

Os nós e as linhas do `react-force-graph-2d`, desenhados em código com `Grimorio.drawNode`. A prévia mostra o estado de hover sobre a nota selecionada *Taverna do Javali*: ela e os vizinhos ficam acesos e o resto apagado.

```jsx
<ForceGraph2D
  graphData={data}
  {...Grimorio.graphProps({ isActive: l => litLinks.has(l) })}
  nodeCanvasObject={(n, ctx, scale) => Grimorio.drawNode(n, ctx, scale, {
    selected: n.id === selectedId,
    active: litNodes.has(n.id),
    dimmed: hoverId != null && !litNodes.has(n.id),
  })}
  nodePointerAreaPaint={(n, color, ctx) => { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(n.x, n.y, 10, 0, 2*Math.PI); ctx.fill(); }}
/>
```

O consumidor fornece em cada nó `type`, `title` e `ghost` (nota citada inexistente), e em cada link `kind: "child"` para a relação de sub-nota (tracejada). Sem notas, mostre `EmptyState` sobre o canvas. A legenda `.gr-legend` fica no canto inferior esquerdo.
