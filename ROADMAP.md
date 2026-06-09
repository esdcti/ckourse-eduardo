# Roadmap — Ckourse

Plano de evolução do Ckourse, organizado por complexidade de implementação.

---

## 🟢 Baixa Complexidade

Melhorias rápidas que agregam valor imediato com pouco esforço.

| # | Feature | Descrição |
|---|---------|-----------|
| 1 | **Atalhos de teclado** | Implementar hotkeys globais para play/pause, próxima aula, aula anterior, pular 10s, marcar como concluída |
| 2 | **Modo Picture-in-Picture** | Permitir assistir em janela flutuante enquanto usa outros apps |
| 3 | **Indicador de duração total** | Mostrar tempo total do curso e tempo restante estimado no dashboard |
| 4 | **Filtros na biblioteca** | Filtrar cursos por categoria, status (em progresso, concluído, não iniciado) |
| 5 | **Ordenação de cursos** | Ordenar por nome, data de importação, progresso, último assistido |
| 6 | **Marcar aula como concluída sem assistir** | Botão para pular aulas que já conhece o conteúdo |
| 7 | **Confirmação de saída durante reprodução** | Avisar antes de fechar o app se um vídeo está sendo reproduzido |
| 8 | **Tooltip de progresso no card** | Mostrar "X de Y aulas" ao passar o mouse no card do curso |
| 9 | **Exportar notas como Markdown** | Gerar arquivo .md com todas as notas de um curso |
| 10 | **Idioma da interface (i18n)** | Suporte a português e inglês com seleção nas configurações |

---

## 🟡 Média Complexidade

Features que envolvem mais lógica ou integração entre camadas.

| # | Feature | Descrição |
|---|---------|-----------|
| 11 | **Banco de dados portátil** | Opção de salvar o banco SQLite junto com os cursos (no cartão de memória/pen drive) para carregar progresso entre computadores |
| 12 | **Visualizador de PDF integrado** | Renderizar PDFs e documentos de recurso sem abrir app externo |
| 13 | **Busca global com preview** | Buscar em cursos, aulas e notas com preview do conteúdo encontrado |
| 14 | **Velocidade por curso** | Lembrar velocidade de playback preferida para cada curso individual |
| 15 | **Tags personalizadas** | Sistema de tags livre para organizar cursos além das categorias |
| 16 | **Histórico de atividade** | Timeline mostrando aulas assistidas por dia com heatmap estilo GitHub |
| 17 | **Meta diária de estudo** | Definir meta de minutos/aulas por dia com notificações e streak |
| 18 | **Import/Export de dados** | Exportar e importar todo o banco (cursos, progresso, notas) como JSON para backup ou migração |
| 19 | **Arrastar para reordenar cursos** | Permitir organização manual da ordem dos cursos na biblioteca |
| 20 | **Detecção de novos vídeos** | Verificar se novos vídeos foram adicionados à pasta e oferecer re-scan |
| 21 | **Playlists/filas de estudo** | Criar listas de reprodução customizadas misturando aulas de diferentes cursos |
| 22 | **Modo foco** | Ocultar UI desnecessária durante a reprodução, sidebar auto-hide |
| 23 | **Suporte a áudio-only** | Permitir importar cursos que são apenas podcasts/audiobooks (mp3, m4a) |
| 24 | **Marcadores no vídeo** | Marcar pontos específicos do vídeo para revisão rápida (bookmarks de timestamp) |

---

## 🔴 Alta Complexidade

Features que exigem trabalho significativo de arquitetura, UI ou infraestrutura.

| # | Feature | Descrição |
|---|---------|-----------|
| 25 | **Modo portátil completo** | Executar o app direto de pen drive/cartão de memória sem instalação, com dados salvos no mesmo diretório |
| 26 | **Sincronização entre dispositivos** | Sincronizar progresso e notas entre múltiplos computadores (via pasta compartilhada, OneDrive, Google Drive, ou servidor próprio) |
| 27 | **Geração de resumo com IA** | Gerar resumo automático das aulas usando transcrição de legendas + LLM local (Ollama) ou API |
| 28 | **Quiz/flashcards** | Criar perguntas de revisão baseadas nas notas ou geradas por IA para reforço de aprendizado |
| 29 | **Transcrição automática** | Usar Whisper (local) para gerar legendas automaticamente em vídeos sem legenda |
| 30 | **Versão mobile companion** | App mobile (Android/iOS) que mostra progresso e permite assistir cursos sincronizados |
| 31 | **Capítulos inteligentes** | Detectar automaticamente mudanças de tópico no vídeo e criar marcadores de capítulo |
| 32 | **Plugin system** | Arquitetura extensível para plugins da comunidade (temas, integrações, parsers customizados) |
| 33 | **Certificados de conclusão** | Gerar certificado PDF personalizável ao concluir um curso |
| 34 | **Leitor de código integrado** | Syntax highlighting para arquivos de código de recurso com navegação inline |
| 35 | **Suporte a cursos online (download)** | Integração com yt-dlp para baixar e importar playlists do YouTube diretamente |
| 36 | **Gamificação** | Sistema de XP, níveis, conquistas e badges para motivar estudo consistente |
| 37 | **Multi-janela** | Abrir múltiplos cursos em janelas separadas simultaneamente |
| 38 | **Modo colaborativo** | Compartilhar notas e progresso com outros estudantes do mesmo curso via link |

---

## Prioridade Sugerida

Para a próxima versão (v1.1), as features com maior impacto imediato:

1. **Banco de dados portátil** (#11) — resolve a portabilidade entre máquinas
2. **Atalhos de teclado** (#1) — melhoria de UX fundamental
3. **Exportar notas como Markdown** (#9) — valor imediato sem complexidade
4. **i18n** (#10) — abre o app para mais usuários
5. **Filtros e ordenação** (#4, #5) — essencial conforme a biblioteca cresce

---

## Como Contribuir

Se quiser trabalhar em alguma dessas features:
1. Abra uma issue mencionando qual feature pretende implementar
2. Discuta a abordagem antes de começar
3. Siga as convenções em [CONTRIBUTING.md](CONTRIBUTING.md)

Sugestões de novas features são bem-vindas via issues!
