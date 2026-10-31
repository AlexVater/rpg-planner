# Grimório

O design system do **RPG Planner**: um caderno de campanha para mestres, com notas ligadas entre si e um grafo da história. A direção visual é um *grimório moderno*, com a sobriedade dos compêndios digitais de RPG de mesa: fundo de carvão quente, títulos em capitulares com serifa, cabeçalhos em versalete carmesim e uma página de pergaminho para ler. A cor fica reservada para o que informa algo, que é o **tipo da nota**.

Feito em React + CSS puro. Os componentes são classes CSS (`gr-*`, em `components/bundle.css`). O `components/bundle.js` traz os ícones, a tabela de tipos e o desenho dos nós no canvas do `react-force-graph-2d`.

## Princípios

1. **Escuro e calmo, cor com função.** O app é quase todo `bg-*` e `ink-*`. Só três coisas usam cor: os oito `type-*` (o tipo da nota), o `crimson-500` (a ação principal e os cabeçalhos) e o `gold-400` (foco e seleção).
2. **Livro, não jogo.** Nada de brilho, gradiente ou moldura dourada. A atmosfera vem da tipografia (Cinzel nos títulos, Spectral na leitura) e de filetes finos. Os cantos são quase retos (`radius-sm`).
3. **Escrever é escuro, ler é pergaminho.** No modo Editar o texto fica no tom do app. O modo Visualizar abre uma página `parchment-100`, como um livro aberto sobre a mesa.
4. **O grafo é o céu da campanha.** O `bg-000` é o ponto mais fundo da tela, então os nós coloridos se destacam. Linhas em `line-200`, sem cor.

## Tom de texto

Português, direto, no vocabulário do mestre: *nota*, *sub-nota*, *citada em*, *campanha*, *sessão*.

- Botões dizem o que fazem: “+ Nova nota”, “Exportar JSON”, “Excluir nota”.
- Confirmações dizem a consequência: “Isto vai substituir a campanha atual (42 notas).”
- Estados vazios convidam, sem fazer piada: “Nenhuma nota ainda. Comece pelo vilão, ou pela taverna onde tudo começa.”
- Versalete (`label-caps`) só nos cabeçalhos de seção: SUB-NOTAS, CITADA EM, TIPOS.

## Cor

| Papel | Tokens | Regra |
| --- | --- | --- |
| Superfícies | `bg-000` grafo · `bg-100` app · `bg-200` barra lateral e painel · `bg-300` campos · `bg-400` hover | Cada nível clareia um passo. O painel e a barra lateral usam o mesmo `bg-200` para emoldurar o grafo. |
| Texto | `ink-100` principal · `ink-200` secundário · `ink-300` dica | `ink-300` passa 4.5:1 até `bg-300`, mas não sobre `bg-400`. |
| Linhas | `line-100` divisória · `line-200` link do grafo e borda de botão · `line-300` borda de campo | `line-100` é decorativa. Controles usam `line-200`/`line-300` (3:1). |
| Ação | `crimson-500` / `crimson-600` + `on-crimson` | Um botão primário por região. `crimson-400` é para texto vermelho (perigo, cabeçalhos). |
| Foco e seleção | `gold-400` | Anel de foco, contorno extra do nó selecionado. Nunca como fundo. |
| Leitura | `parchment-100/200`, `parchment-ink`, `parchment-muted`, `parchment-link`, `parchment-rule` | Só dentro de `.gr-page`. |

### Os tipos de nota

| Tipo | Token | Ícone (`Grimorio.icons`) |
| --- | --- | --- |
| NPC | `type-npc` âmbar | `npc`, busto |
| Local | `type-local` verde | `local`, torre com ameias |
| Artefato | `type-artefato` roxo | `artefato`, ânfora |
| Item mágico | `type-item` azul | `item`, estrela de quatro pontas |
| Lore | `type-lore` vermelho | `lore`, pergaminho |
| Facção | `type-faccao` ciano | `faccao`, escudo partido |
| Sessão | `type-sessao` oliva | `sessao`, d20 |
| Outro | `type-outro` cinza | `outro`, marcador |

Os oito tons vêm da paleta original, ajustados para passar 4.5:1 sobre `bg-200`. Vários deles têm luminosidade parecida, então **a cor nunca vai sozinha**: sempre com o ícone (no chip, no painel e no nó do grafo com zoom) ou com o nome do tipo. Sobre um fundo `type-*`, o ícone é desenhado em `on-type`.

## Tipografia

Quatro famílias do Google Fonts, carregadas pelo `@import` no topo de `bundle.css`:

- **Cinzel** (`--font-display`): nome da campanha, título da nota, títulos da página e diálogos. Só capitulares, então nunca em parágrafos.
- **Roboto Condensed** (`--font-label`): botões, chips, cabeçalhos em versalete e títulos dos nós. É o tom “ficha de personagem”.
- **Roboto** (`--font-ui`): o resto da interface, ou seja, a lista, os campos e as dicas.
- **Spectral** (`--font-read`): texto corrido na página de pergaminho, a 17/28.

## Espaço, forma e profundidade

- Grade de 4px: `space-1` 4 · `space-2` 8 · `space-3` 12 · `space-4` 16 · `space-6` 24 · `space-8` 32.
- Colunas: barra lateral `size-sidebar` 272px, painel `size-panel` 420px, grafo no resto. Abaixo de `size-breakpoint` (900px), uma coluna: a barra lateral no topo (altura máxima de ~40vh, com rolagem) e o grafo embaixo. Com uma nota aberta, o painel ocupa o lugar do grafo.
- Cantos: `radius-sm` (3px) para quase tudo, `radius-md` para diálogo e página, `radius-pill` para tags e chips.
- Profundidade com filetes, não com sombra. As únicas sombras são `shadow-panel` (diálogos) e `shadow-page` (a página de pergaminho).

## Ícones

Ícones próprios substituem os emojis. A grade é 24×24, só traço, com 1.75px de espessura e pontas arredondadas, e eles herdam `currentColor`. Use assim:

```js
Grimorio.icon("npc")           // string <svg class="gr-icon">…
Grimorio.renderIcons(root)     // troca <i data-gr-icon="npc"></i> pelo SVG
new Path2D(Grimorio.icons.npc) // no canvas
```

Além dos tipos, há ícones de interface: `search`, `close`, `plus`, `warn`, `link`, `chevron`, `upload` e `download`.

## O grafo (canvas)

O canvas não lê CSS, então `Grimorio.graph` espelha os tokens em hexadecimal. Se mudar um, mude o outro também.

```jsx
<ForceGraph2D
  {...Grimorio.graphProps({ isActive: l => hoverSet.has(l) })}
  nodeCanvasObject={(n, ctx, s) =>
    Grimorio.drawNode(n, ctx, s, { selected: n.id === selId, dimmed: hover && !hoverSet.has(n), active: hoverSet.has(n) })}
/>
```

- Nó: círculo `type-*` com o ícone em `on-type`. O ícone aparece quando o raio na tela passa de 9px.
- Selecionado: raio 10, contorno `ink-100` e anel externo `gold-400`.
- Fantasma (nota citada que ainda não existe): contorno tracejado `type-outro` sobre o fundo e título cinza.
- Hover: o nó e os vizinhos ficam em opacidade total e o resto cai para 18%.
- Linha contínua `line-200` = link. Linha tracejada (`kind: "child"`) = sub-nota.

## Estados

Cada estado tem um componente: **Carregando** (`EmptyState`, variante com spinner), **campanha vazia** e **busca vazia** (`EmptyState`), **nota sem texto** (`ReadingPage`, `.gr-page-empty`), **título repetido** e **erro ao importar** (`Alert`), **confirmação de importação** e **de exclusão** (`Dialog`).
