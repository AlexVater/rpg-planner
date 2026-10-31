# NoteTree

Lista de notas da barra lateral. As sub-notas ficam aninhadas sob a nota-mãe, com um filete `line-100` à esquerda.

- Cada item é um `<button class="gr-tree-item">` com `--c` do tipo, `.gr-dot`, `.gr-tree-title` e um `.gr-tree-meta` opcional (número de sub-notas).
- **Selecionada**: `is-selected`, fundo `bg-300` e um filete de 2px na cor do tipo.
- Busca: envolva o trecho encontrado em `<mark class="gr-hit">`.
- `.gr-tree-toggle` mostra ▾/▸ para expandir. Deixe o elemento vazio em folhas, para manter o alinhamento.
