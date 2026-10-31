# TypeIcon

Ícones próprios, um por tipo de nota, mais oito de interface. Eles substituem os emojis.

Grade 24×24, só traço, 1.75px, herdam `currentColor`. Não pinte o traço com a cor do tipo sobre fundo escuro em tamanho pequeno. Prefira o ícone em `on-type` dentro de um disco `type-*` (`.gr-type-badge`, `.gr-chip-mark`).

```js
el.innerHTML = Grimorio.icon("lore");          // SVG string
Grimorio.renderIcons(container);               // <i data-gr-icon="lore">
ctx.stroke(new Path2D(Grimorio.icons.lore));   // canvas, grade 24
```

O consumidor fornece o tamanho via `font-size` (o SVG mede 1em).
