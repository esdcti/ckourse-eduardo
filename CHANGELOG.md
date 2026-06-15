# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/), e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [1.5.1] - 2026-06-15

### Adicionado
- **Importação do YouTube**: tab "YouTube" na página de importação com campo de URL, validação de yt-dlp, seleção de pasta destino e download automático
- **Visualizador de PDF inline**: clique em recurso PDF abre viewer fullscreen dentro do app (sem abrir externamente)
- **Tags customizadas UI**: input de tags no painel de edição de curso com add/remove e persistência

---

## [1.5.0] - 2026-06-15

### Adicionado
- **Export/Import banco de dados**: botões "Exportar banco" e "Importar banco" nas Configurações. Cria backup automático ao importar.
- **Sistema de tags**: tabela `course_tags` (many-to-many) com comandos `get_course_tags`, `set_course_tags`, `get_all_tags`
- **Modo foco**: botão 👁 no header do CourseDetail — esconde header e sidebar do currículo com animação
- **Backend YouTube (yt-dlp)**: comandos `check_ytdlp` e `download_youtube_playlist` — baixa playlist como MP4 + legendas VTT
- Migration automática para tabela `course_tags` com índices

---

## [1.4.0] - 2026-06-15

### Adicionado
- **Atalhos N/P**: tecla N para próxima aula, Shift+P para aula anterior no player
- **Exportar notas como Markdown**: botão "Markdown" na página Notas — converte HTML para Markdown com timestamps preservados
- **Indicador de tempo restante**: cards do dashboard mostram "~2h30" restantes por curso
- **Filtro por status na sidebar**: links rápidos "Em Progresso", "Não Iniciado", "Concluído"
- **Tooltip de progresso**: hover no card mostra "15/20 aulas • ~2h restantes"
- **Copiar nota**: botão de copy no hover de cada nota (copia texto limpo pro clipboard)
- **Velocidade salva por curso**: persiste no SQLite via settings (`speed_course_{id}`), restaurada ao reabrir

### Alterado
- Struct `Course` agora inclui `total_duration` (soma das durações de todas as aulas)
- Query `get_all_courses` e `get_bookmarked_courses` retornam duração total
- VideoPlayer aceita prop `onPrevious` e `onSpeedChange`

---

## [1.3.2] - 2026-06-15

### Adicionado
- Tradução completa de strings restantes: NoteEditor, VideoPlayer tooltips, SidebarSearch, AppShell
- Chaves i18n: `noResultsFor`, `currentTime`, `goToTime`, `bold`, `italic`, `underline`, `strikethrough`, `typeAtToTag`, `writeANote`, tooltips do player, `navigation`, `app`, `anotherLesson`

---

## [1.3.0] - 2026-06-15

### Adicionado
- **Cobertura completa de i18n para pt-BR**: ~80 novas chaves de tradução
- Traduzidos: Settings, CourseDetail, ImportCourse, Progress, Notes, Bookmarks
- Traduzidos: CourseEditPanel, VideoPlayer, UpdateBanner, DashboardStats, CourseCard
- Traduzidos: CourseCelebration, NotesPanel, SectionAccordion
- Toasts de erro, badges de status, labels de nível e datas agora usam i18n

---

## [1.2.1] - 2026-06-09

### Corrigido
- Variável não utilizada (`sortLabels`) que impedia a compilação do TypeScript

---

## [1.2.0] - 2026-06-09

### Adicionado
- **Escolher local do banco de dados**: botão nas Configurações → Biblioteca para selecionar uma pasta customizada
- **Restaurar padrão**: botão para voltar o banco ao local padrão (AppData)

### Melhorado
- Módulo portátil suporta 3 modos: padrão, `.portable`, e pasta customizada

---

## [1.1.0] - 2026-06-09

### Adicionado
- **Modo Portátil**: arquivo `.portable` ao lado do executável ativa modo portátil
- **i18n**: sistema de tradução com suporte a pt-BR e English
- **Seletor de idioma** nas Configurações
- **CI/CD automático**: cada push na main gera release
- AGENTS.md, ROADMAP.md, CHANGELOG.md

---

## [1.0.5] - 2026-06-09

### Adicionado
- Primeiro build do fork com CI próprio
- Atribuição ao autor original

---

## [1.0.4] - Base original

Release original do projeto [Ckourse](https://github.com/redaantar/ckourse) por Reda Antar.
