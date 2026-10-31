/* @ds-bundle: {"format":4,"namespace":"Grimorio","components":[{"name":"TypeIcon"},{"name":"Button"},{"name":"SectionHeading"},{"name":"SearchField"},{"name":"TypeChip"},{"name":"NoteTree"},{"name":"TagInput"},{"name":"ModeToggle"},{"name":"NotePanel"},{"name":"ReadingPage"},{"name":"GraphNode"},{"name":"Dialog"},{"name":"Alert"},{"name":"EmptyState"}]} */
(function () {
  // Ícones próprios, grade 24×24, só traço. Servem em SVG (lista, chips, painel)
  // e em canvas via Path2D (nós do react-force-graph-2d).
  var icons = {
    npc: "M12 3.5a3.75 3.75 0 1 1 0 7.5a3.75 3.75 0 1 1 0-7.5z M4.5 20.5c.6-4 3.6-6.5 7.5-6.5s6.9 2.5 7.5 6.5",
    local: "M4.5 20.5V8h2.5v2.5h2.5V8h5v2.5h2.5V8h2.5v12.5z M10 20.5v-4a2 2 0 0 1 4 0v4 M3 20.5h18",
    artefato: "M9 3.5h6 M10 3.5v3C7 7.8 5.5 10.4 5.5 13.5c0 4 2.9 7 6.5 7s6.5-3 6.5-7c0-3.1-1.5-5.7-4.5-7v-3 M7.5 12.5h9",
    item: "M12 2.5l2.2 7.3 7.3 2.2-7.3 2.2-2.2 7.3-2.2-7.3L2.5 12l7.3-2.2z",
    lore: "M7 4.5h10.5a2 2 0 0 1 2 2v11 M7 4.5a2 2 0 0 0-2 2v1.5h4 M9 6.5v11a2 2 0 0 1-2 2h11a2 2 0 0 0 2-2v-.5h-9 M12 9.5h4.5 M12 13h4.5",
    faccao: "M12 3l7.5 2.8v6c0 4.6-3.2 7.6-7.5 9-4.3-1.4-7.5-4.4-7.5-9v-6z M12 3v18 M4.5 11.5h15",
    sessao: "M12 2.5l8.5 4.8v9.4L12 21.5l-8.5-4.8V7.3z M12 7.5l4.5 8h-9z M12 2.5v5 M3.5 7.3l4 8.2 M20.5 7.3l-4 8.2 M7.5 15.5L12 21.5l4.5-6",
    outro: "M7 3.5h10v17l-5-3.5-5 3.5z",
    search: "M10.5 4a6.5 6.5 0 1 1 0 13a6.5 6.5 0 1 1 0-13z M15.5 15.5L20 20",
    close: "M6 6l12 12 M18 6L6 18",
    plus: "M12 5v14 M5 12h14",
    warn: "M12 3.5l9 16H3z M12 10v4 M12 17v.5",
    link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1 M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
    chevron: "M9 6l6 6-6 6",
    upload: "M12 15V4 M7.5 8.5L12 4l4.5 4.5 M4.5 15v4.5h15V15",
    download: "M12 4v11 M7.5 10.5L12 15l4.5-4.5 M4.5 15v4.5h15V15"
  };

  // Ordem, nome e token de cada tipo. `color` espelha o token para o canvas,
  // que não lê variáveis CSS; troque os dois juntos.
  var types = [
    { id: "npc", label: "NPC", token: "--type-npc", color: "#e3a63b" },
    { id: "local", label: "Local", token: "--type-local", color: "#5fb86c" },
    { id: "artefato", label: "Artefato", token: "--type-artefato", color: "#ac83e0" },
    { id: "item", label: "Item mágico", token: "--type-item", color: "#5c9fe8" },
    { id: "lore", label: "Lore", token: "--type-lore", color: "#e8645a" },
    { id: "faccao", label: "Facção", token: "--type-faccao", color: "#3fc1c1" },
    { id: "sessao", label: "Sessão", token: "--type-sessao", color: "#adb043" },
    { id: "outro", label: "Outro", token: "--type-outro", color: "#948f87" }
  ];
  var byId = {};
  types.forEach(function (t) { byId[t.id] = t; });

  // Cores do canvas (espelho de tokens.json).
  var graph = {
    background: "#0d0c0b",
    ink: "#c4baab",
    inkStrong: "#f1ebe1",
    halo: "#0d0c0b",
    link: "#6e6253",
    linkActive: "#c4baab",
    selected: "#d4a94a",
    onType: "#141210",
    ghost: "#948f87",
    dimAlpha: 0.18,
    nodeRadius: 7,
    selectedRadius: 10
  };

  function icon(name, opts) {
    opts = opts || {};
    var d = icons[name] || icons.outro;
    var sw = opts.strokeWidth || 1.75;
    return '<svg class="gr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + sw +
      '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>';
  }

  // Troca cada <i data-gr-icon="npc"></i> dentro de `root` pelo SVG.
  function renderIcons(root) {
    (root || document).querySelectorAll("[data-gr-icon]").forEach(function (el) {
      el.outerHTML = icon(el.getAttribute("data-gr-icon"));
    });
  }

  var pathCache = {};
  function path2d(name) {
    if (!pathCache[name]) pathCache[name] = new Path2D(icons[name] || icons.outro);
    return pathCache[name];
  }

  // Desenha um nó. Use como nodeCanvasObject do react-force-graph-2d:
  //   nodeCanvasObject={(n, ctx, s) => Grimorio.drawNode(n, ctx, s, { selected, dimmed })}
  // node: { x, y, type, title, ghost? }
  function drawNode(node, ctx, scale, state) {
    state = state || {};
    var t = byId[node.type] || byId.outro;
    var r = state.selected ? graph.selectedRadius : graph.nodeRadius;
    ctx.save();
    if (state.dimmed) ctx.globalAlpha = graph.dimAlpha;

    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
    if (node.ghost) {
      ctx.setLineDash([2.5, 2]);
      ctx.lineWidth = 1.25;
      ctx.strokeStyle = graph.ghost;
      ctx.fillStyle = graph.background;
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      ctx.fillStyle = t.color;
      ctx.fill();
      if (state.selected) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = graph.inkStrong;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(node.x, node.y, r + 3.5, 0, Math.PI * 2);
        ctx.lineWidth = 1;
        ctx.strokeStyle = graph.selected;
        ctx.stroke();
      }
      // Ícone só quando há zoom suficiente para lê-lo.
      if (r * scale >= 9) {
        var k = (r * 1.25) / 12;
        ctx.save();
        ctx.translate(node.x - 12 * k, node.y - 12 * k);
        ctx.scale(k, k);
        ctx.lineWidth = 2.2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = graph.onType;
        ctx.stroke(path2d(t.id));
        ctx.restore();
      }
    }

    // Título embaixo, com contorno da cor do fundo para ler sobre as linhas.
    var fs = Math.max(11 / scale, 2.5);
    if (scale > 0.6 || state.selected || state.active) {
      ctx.font = (state.selected ? "600 " : "400 ") + fs + 'px "Roboto Condensed", "Arial Narrow", sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.lineWidth = 3 / scale;
      ctx.strokeStyle = graph.halo;
      ctx.strokeText(node.title, node.x, node.y + r + 3);
      ctx.fillStyle = node.ghost ? graph.ghost : (state.selected || state.active ? graph.inkStrong : graph.ink);
      ctx.fillText(node.title, node.x, node.y + r + 3);
    }
    ctx.restore();
  }

  // Props sugeridas para o ForceGraph2D (linhas e fundo).
  function graphProps(opts) {
    opts = opts || {};
    return {
      backgroundColor: graph.background,
      linkColor: function (l) { return opts.isActive && opts.isActive(l) ? graph.linkActive : graph.link; },
      linkWidth: function (l) { return opts.isActive && opts.isActive(l) ? 1.6 : 1; },
      linkLineDash: function (l) { return l.kind === "child" ? [3, 3] : null; },
      nodeRelSize: graph.nodeRadius,
      cooldownTicks: 120
    };
  }

  window.Grimorio = {
    types: types,
    type: function (id) { return byId[id] || byId.outro; },
    icons: icons,
    icon: icon,
    renderIcons: renderIcons,
    graph: graph,
    drawNode: drawNode,
    graphProps: graphProps
  };
})();
