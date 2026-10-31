# ReadingPage

O modo Visualizar. O markdown renderizado vira uma página `parchment-100` com `shadow-page`, em Spectral 17/28.

- `.gr-dropcap` no primeiro parágrafo faz a capitular em Cinzel `parchment-link`. Use só no primeiro.
- `h2` em Cinzel com filete `parchment-rule`. `blockquote` vira uma caixa lateral `parchment-200`.
- `[[Link]]` → `<a class="gr-wikilink">`, clicável, que abre a nota e centraliza o grafo.
- Link para nota inexistente → `gr-wikilink gr-wikilink--missing`: sublinhado tracejado, `parchment-muted`. Clicar cria a nota.
- Nota sem texto → `<p class="gr-page-empty">`.
