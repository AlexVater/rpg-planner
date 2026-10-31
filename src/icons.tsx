// Grimório icons: 24×24 grid, stroke only. Used as SVG and as Path2D in the graph.
export const ICONS = {
  npc: 'M12 3.5a3.75 3.75 0 1 1 0 7.5a3.75 3.75 0 1 1 0-7.5z M4.5 20.5c.6-4 3.6-6.5 7.5-6.5s6.9 2.5 7.5 6.5',
  local: 'M4.5 20.5V8h2.5v2.5h2.5V8h5v2.5h2.5V8h2.5v12.5z M10 20.5v-4a2 2 0 0 1 4 0v4 M3 20.5h18',
  artefato:
    'M9 3.5h6 M10 3.5v3C7 7.8 5.5 10.4 5.5 13.5c0 4 2.9 7 6.5 7s6.5-3 6.5-7c0-3.1-1.5-5.7-4.5-7v-3 M7.5 12.5h9',
  item: 'M12 2.5l2.2 7.3 7.3 2.2-7.3 2.2-2.2 7.3-2.2-7.3L2.5 12l7.3-2.2z',
  lore: 'M7 4.5h10.5a2 2 0 0 1 2 2v11 M7 4.5a2 2 0 0 0-2 2v1.5h4 M9 6.5v11a2 2 0 0 1-2 2h11a2 2 0 0 0 2-2v-.5h-9 M12 9.5h4.5 M12 13h4.5',
  faccao: 'M12 3l7.5 2.8v6c0 4.6-3.2 7.6-7.5 9-4.3-1.4-7.5-4.4-7.5-9v-6z M12 3v18 M4.5 11.5h15',
  sessao:
    'M12 2.5l8.5 4.8v9.4L12 21.5l-8.5-4.8V7.3z M12 7.5l4.5 8h-9z M12 2.5v5 M3.5 7.3l4 8.2 M20.5 7.3l-4 8.2 M7.5 15.5L12 21.5l4.5-6',
  outro: 'M7 3.5h10v17l-5-3.5-5 3.5z',
  search: 'M10.5 4a6.5 6.5 0 1 1 0 13a6.5 6.5 0 1 1 0-13z M15.5 15.5L20 20',
  close: 'M6 6l12 12 M18 6L6 18',
  plus: 'M12 5v14 M5 12h14',
  warn: 'M12 3.5l9 16H3z M12 10v4 M12 17v.5',
  upload: 'M12 15V4 M7.5 8.5L12 4l4.5 4.5 M4.5 15v4.5h15V15',
  download: 'M12 4v11 M7.5 10.5L12 15l4.5-4.5 M4.5 15v4.5h15V15',
  list: 'M9 6.5h11 M9 12h11 M9 17.5h11 M4.5 6.5h.5 M4.5 12h.5 M4.5 17.5h.5',
  graph:
    'M6.5 3.5a2.5 2.5 0 1 1 0 5a2.5 2.5 0 1 1 0-5z M17.5 9.5a2.5 2.5 0 1 1 0 5a2.5 2.5 0 1 1 0-5z M8.5 15.5a2.5 2.5 0 1 1 0 5a2.5 2.5 0 1 1 0-5z M8.8 7l6.4 3.6 M15.3 13.3l-4.6 3.1 M6.9 8.5l1.2 7',
  back: 'M15 5l-7 7 7 7',
}

export function Icon({ d }: { d: string }) {
  return (
    <svg
      className="icon-svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  )
}
