# NotePanel

A coluna direita (`size-panel`, 420px), que só existe com uma nota selecionada. Monta os outros componentes nesta ordem:

1. `.gr-panel-head`: `.gr-type-badge` (ícone do tipo num disco com anel), `.gr-title-input` em Cinzel 26px, `.gr-panel-kicker` (tipo · nota-mãe) e o `gr-icon-btn` de fechar.
2. `Alert` quando o título repete o de outra nota.
3. `.gr-row` com **Tipo** e **Dentro de**.
4. `TagInput`.
5. `ModeToggle` + `.gr-textarea` (Editar) ou `ReadingPage` (Visualizar).
6. `SectionHeading` *Sub-notas* e *Citada em*, com itens `gr-tree-item`.
7. `.gr-panel-foot`: status de salvamento e “Excluir nota”.

A borda lateral de 3px na cor do tipo vem de `--c` (`style="--c: var(--type-local)"`). Ela marca a coluna inteira e não é um cartão. Ao criar uma nota, foque o `.gr-title-input`.
