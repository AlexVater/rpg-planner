# RPG Planner

Planejador de campanha de RPG no estilo Obsidian: notas tipadas (NPC, local, artefato, item
mágico, lore, facção, sessão) que se linkam e aparecem como um grafo. Roda 100% no navegador;
o "banco" é um JSON.

## Rodar
Dê duplo clique em `iniciar.bat` — ou:

```bash
npm install
npm run dev
```

## Como usar
- **Nova nota** na barra lateral. Escolha o tipo e, se for sub-informação, o campo **Dentro de**.
- Escreva `[[Nome de outra nota]]` no texto para criar um link (`[[Nome|apelido]]` também vale).
  Link para nota que não existe vira um nó tracejado no grafo; clique nele para criá-la.
- Renomear uma nota atualiza os links nas outras.
- Chips de tipo filtram lista e grafo. Passe o mouse num nó para destacar as conexões.
- Tudo é salvo automaticamente no navegador. **Exportar/Importar JSON** para backup ou para
  levar para outra máquina.
- Na primeira execução carrega a campanha de exemplo de `public/campaign.json`.

## Scripts
| Comando | O quê |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm test` | testes (Vitest) da lógica em `src/lib` |
| `npm run build` | build estático em `dist/` |

## GitHub Pages
`.github/workflows/deploy.yml` publica em cada push na `main`. No repositório, ative
*Settings → Pages → Source: GitHub Actions*.

## Spec-Driven Development
Segue o fluxo do [GitHub Spec Kit](https://github.com/github/spec-kit):
- `.specify/memory/constitution.md` — princípios do projeto
- `specs/001-campaign-graph/` — `spec.md`, `plan.md`, `data-model.md`, `tasks.md`

Para usar os comandos oficiais (`/speckit-specify`, `/speckit-plan`…) nas próximas features:

```bash
uv tool install specify-cli
specify init --here --integration claude
```
