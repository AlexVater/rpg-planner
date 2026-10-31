// Grimório: os componentes são classes CSS (bundle.css). Estes tipos documentam
// os auxiliares JS em window.Grimorio.

export type NoteType = "npc" | "local" | "artefato" | "item" | "lore" | "faccao" | "sessao" | "outro";

export interface TypeInfo { id: NoteType; label: string; token: string; color: string; }

export interface GraphNodeData { x: number; y: number; type: NoteType; title: string; ghost?: boolean; }

export interface GraphNodeProps {
  /** Nota selecionada: raio maior, contorno ink-100 e anel gold-400. */
  selected?: boolean;
  /** Vizinho do nó sob o mouse: título sempre visível. */
  active?: boolean;
  /** Fora do foco do hover: opacidade 18%. */
  dimmed?: boolean;
}

export interface TypeIconProps { name: NoteType | "search" | "close" | "plus" | "warn" | "link" | "chevron" | "upload" | "download"; strokeWidth?: number; }

export interface Grimorio {
  types: TypeInfo[];
  type(id: string): TypeInfo;
  icons: Record<string, string>;
  icon(name: TypeIconProps["name"], opts?: { strokeWidth?: number }): string;
  renderIcons(root?: ParentNode): void;
  graph: Record<string, string | number>;
  drawNode(node: GraphNodeData, ctx: CanvasRenderingContext2D, globalScale: number, state?: GraphNodeProps): void;
  graphProps(opts?: { isActive?: (link: unknown) => boolean }): Record<string, unknown>;
}
