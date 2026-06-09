# Roadmap — Ckourse

Plano de evolução focado em uso para **cursos de TI** (programação, DevOps, cloud, banco de dados, design de sistemas).

---

## 🟢 Baixa Complexidade (1-2 dias cada)

Melhorias rápidas com impacto direto na experiência diária de estudo.

| # | Feature | Por quê? |
|---|---------|----------|
| 1 | **Atalhos de teclado** | Estudar sem tirar a mão do teclado: espaço (play/pause), N (próxima), P (anterior), F (fullscreen), M (mute), ←→ (skip 10s) |
| 2 | **Exportar notas como Markdown** | Levar suas anotações pro Obsidian, Notion ou qualquer editor. Inclui timestamps como links |
| 3 | **Indicador de tempo restante** | No dashboard, mostrar "~2h30 restantes" por curso — ajuda a planejar sessões de estudo |
| 4 | **Filtro por status na sidebar** | Ver só cursos "Em Progresso" rapidamente sem abrir filtros |
| 5 | **Marcar aula sem assistir** | Você já sabe HTML básico? Pula as aulas introdutórias marcando como concluída |
| 6 | **Tema por curso** | Cor de destaque personalizada para identificar visualmente cada curso no dashboard |
| 7 | **Tooltip de progresso** | Hover no card mostra "42 de 120 aulas • ~18h restantes" |
| 8 | **Copiar trecho da nota** | Botão para copiar snippet de código da nota direto pro clipboard |
| 9 | **Velocidade salva por curso** | Assistir Python a 1.5x e AWS a 1x sem ficar ajustando toda vez |
| 10 | **Modo Picture-in-Picture** | Assistir aula em janela flutuante enquanto pratica código no VS Code |

---

## 🟡 Média Complexidade (3-7 dias cada)

Features que envolvem mais lógica mas resolvem dores reais de quem estuda TI.

| # | Feature | Por quê? |
|---|---------|----------|
| 11 | **Banco de dados portátil (completo)** | Exportar/importar o banco junto com os cursos — migrar entre PCs sem perder progresso |
| 12 | **Visualizador de PDF integrado** | Ler slides, cheatsheets e documentação sem sair do app |
| 13 | **Tags customizadas** | Organizar por tech: "React", "Docker", "SQL", "AWS" — mais útil que categorias genéricas |
| 14 | **Meta diária de estudo** | "Estudar 45min/dia" com streak e notificação — consistência > intensidade |
| 15 | **Histórico com heatmap** | Visualizar atividade estilo GitHub — quais dias você estudou, quantas aulas |
| 16 | **Detecção de novos vídeos** | Baixou aulas novas na pasta? O app detecta e oferece adicionar ao curso |
| 17 | **Busca dentro das notas** | "Onde eu anotei sobre docker-compose?" — busca full-text nas suas notas |
| 18 | **Marcadores no vídeo** | Bookmarks de timestamp: "05:23 - Explicação de useEffect" — navega direto ao ponto |
| 19 | **Playlists de revisão** | Juntar aulas específicas de diferentes cursos: "Revisar: Hooks + Context + Redux" |
| 20 | **Modo foco** | Oculta sidebar, mostra só vídeo + notas. Ideal pra monitor pequeno |
| 21 | **Importar playlist do YouTube** | Integração com yt-dlp para baixar playlist e importar como curso automaticamente |
| 22 | **Suporte a áudio** | Importar podcasts técnicos (mp3) como "cursos" — útil pra audiobooks e tech talks |

---

## 🔴 Alta Complexidade (1-3 semanas cada)

Features ambiciosas que transformam o app numa plataforma completa de estudo.

| # | Feature | Por quê? |
|---|---------|----------|
| 23 | **Transcrição automática com Whisper** | Gerar legendas localmente para cursos sem legenda — pesquisar conteúdo falado |
| 24 | **Resumo com IA local (Ollama)** | Resumir aula automaticamente a partir da transcrição. Revisão em 2 min em vez de 45 |
| 25 | **Flashcards de revisão** | Gerar cards de revisão a partir das notas. Algoritmo de repetição espaçada |
| 26 | **Leitor de código integrado** | Abrir arquivos de código-fonte do curso com syntax highlighting + copy |
| 27 | **Sincronização entre devices** | Progresso sincronizado via pasta na nuvem (OneDrive/Drive) ou servidor |
| 28 | **Certificados de conclusão** | Gerar PDF bonito ao terminar curso — útil para documentação pessoal |
| 29 | **Gamificação** | XP, níveis, conquistas ("Maratonista: 10 aulas em 1 dia", "Consistente: 30 dias seguidos") |
| 30 | **Plugin de integração com IDE** | Extensão VS Code que mostra progresso do curso e permite marcar aulas como concluídas |

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
