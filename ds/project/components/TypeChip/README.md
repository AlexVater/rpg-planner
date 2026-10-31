# TypeChip

Liga e desliga um tipo na lista e no grafo. É um `<button aria-pressed>`.

- **Ligado**: borda e disco na cor do tipo, ícone `on-type` e texto `ink-100`.
- **Desligado**: borda `line-200`, disco vazado e texto `ink-300`. O ícone continua visível, então o tipo é reconhecível sem a cor.

O consumidor define `--c` com o token do tipo: `style="--c: var(--type-npc)"`. O contador é opcional.
