# Roadmap — Ckourse

Plano de evolução focado em uso para **cursos de TI** (programação, DevOps, cloud, banco de dados, design de sistemas).

---

## 🟢 Baixa Complexidade (1-2 dias cada)

Melhorias rápidas com impacto direto na experiência diária de estudo.

| # | Feature | Por quê? | Status |
|---|---------|----------|--------|
| 1 | **Atalhos de teclado** | Estudar sem tirar a mão do teclado: espaço (play/pause), N (próxima), P (anterior), F (fullscreen), M (mute), ←→ (skip 10s) | ✅ v1.4.0 |
| 2 | **Exportar notas como Markdown** | Levar suas anotações pro Obsidian, Notion ou qualquer editor. Inclui timestamps como links | ✅ v1.4.0 |
| 3 | **Indicador de tempo restante** | No dashboard, mostrar "~2h30 restantes" por curso — ajuda a planejar sessões de estudo | ✅ v1.4.0 |
| 4 | **Filtro por status na sidebar** | Ver só cursos "Em Progresso" rapidamente sem abrir filtros | ✅ v1.4.0 |
| 5 | **Marcar aula sem assistir** | Você já sabe HTML básico? Pula as aulas introdutórias marcando como concluída | ✅ (já existia) |
| 6 | **Tema por curso** | Cor de destaque personalizada para identificar visualmente cada curso no dashboard | ✅ (já existia) |
| 7 | **Tooltip de progresso** | Hover no card mostra "42 de 120 aulas • ~18h restantes" | ✅ v1.4.0 |
| 8 | **Copiar trecho da nota** | Botão para copiar snippet de código da nota direto pro clipboard | ✅ v1.4.0 |
| 9 | **Velocidade salva por curso** | Assistir Python a 1.5x e AWS a 1x sem ficar ajustando toda vez | ✅ v1.4.0 |
| 10 | **Modo Picture-in-Picture** | Assistir aula em janela flutuante enquanto pratica código no VS Code | ✅ (já existia) |

---

## 🟡 Média Complexidade (3-7 dias cada)

Features que envolvem mais lógica mas resolvem dores reais de quem estuda TI.

| # | Feature | Por quê? | Status |
|---|---------|----------|--------|
| 11 | **Banco de dados portátil (completo)** | Exportar/importar o banco junto com os cursos — migrar entre PCs sem perder progresso | ✅ v1.5.0 |
| 12 | **Visualizador de PDF integrado** | Ler slides, cheatsheets e documentação sem sair do app | ✅ v1.5.0 |
| 13 | **Tags customizadas** | Organizar por tech: "React", "Docker", "SQL", "AWS" — mais útil que categorias genéricas | ✅ v1.5.0 |
| 14 | **Modo foco** | Oculta sidebar, mostra só vídeo + notas. Ideal pra monitor pequeno | ✅ v1.5.0 |
| 15 | **Importar playlist do YouTube** | Integração com yt-dlp para baixar playlist e importar como curso automaticamente | ✅ v1.5.0 (backend) |

---

## Prioridade para v1.2.0

Baseado no uso para cursos de TI, as próximas features mais impactantes:

1. **Atalhos de teclado** (#1) — produtividade imediata
2. **Velocidade salva por curso** (#9) — cada curso tem ritmo diferente
3. **Exportar notas como Markdown** (#2) — integra com workflow de estudo
4. **Marcadores no vídeo** (#18) — revisar pontos-chave sem reassistir tudo
5. **Meta diária** (#14) — consistência é o que faz a diferença

---

## Prioridade para v1.3.0

6. **Tags customizadas** (#13) — organização por tecnologia
7. **Visualizador de PDF** (#12) — docs e slides sem sair do app
8. **Importar YouTube** (#21) — muitos cursos bons estão lá
9. **Modo foco** (#20) — tela cheia sem distrações
10. **Histórico com heatmap** (#15) — motivação visual

---

## Como o auto-release funciona

Cada push na branch `main` que altere código (não apenas `.md`) e tenha uma versão nova no `package.json`:

1. GitHub Actions lê a versão
2. Cria a tag automaticamente
3. Compila o instalador Windows
4. Publica a Release
5. O auto-updater notifica quem já tem o app instalado

**Resultado**: implementou → pushou → usuários recebem a atualização. Zero fricção.
