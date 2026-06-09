# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/), e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [1.2.0] - 2026-06-09

### Adicionado
- **Escolher local do banco de dados**: botão nas Configurações → Biblioteca para selecionar uma pasta customizada (pen drive, cartão SD, pasta na nuvem)
- **Restaurar padrão**: botão para voltar o banco ao local padrão (AppData)
- Mensagem de feedback ao alterar local do banco (pede reinício do app)

### Melhorado
- Módulo portátil agora suporta 3 modos: padrão, `.portable`, e pasta customizada
- Lógica de resolução de data_dir com prioridade: portátil > customizado > padrão

---

## [1.1.0] - 2026-06-09

### Adicionado
- **Modo Portátil**: coloque um arquivo `.portable` ao lado do executável e o banco de dados será salvo na mesma pasta — perfeito para rodar de um pen drive/cartão de memória
- **i18n (Internacionalização)**: sistema de tradução completo com suporte a Português (BR) e Inglês
- **Seletor de idioma**: nas Configurações, escolha entre pt-BR e English
- **Interface em Português**: Dashboard, sidebar, configurações e filtros traduzidos
- **CI/CD automático**: cada push na main com bump de versão gera release automaticamente
- **AGENTS.md**: diretrizes para agentes de IA contribuírem no projeto
- **ROADMAP.md**: plano de evolução organizado por complexidade
- **CHANGELOG.md**: histórico de mudanças do projeto

### Alterado
- Endpoint do auto-updater agora aponta para o fork (esdcti/ckourse-eduardo)
- Chave de assinatura própria para releases
- README.md traduzido para português com link para versão em inglês
- Idioma padrão da interface alterado para pt-BR

---

## [1.0.5] - 2026-06-09

### Adicionado
- Primeiro build próprio do fork
- Workflow de CI para gerar instalador Windows automaticamente
- Atribuição ao autor original no README

### Alterado
- Endpoint do updater migrado de `redaantar/ckourse` para `esdcti/ckourse-eduardo`
- Chave pública do updater atualizada

---

## [1.0.4] - Base original

Release original do projeto [Ckourse](https://github.com/redaantar/ckourse) por Reda Antar.

### Funcionalidades herdadas
- Importação inteligente de pastas de cursos
- Player de vídeo integrado com suporte a legendas (SRT/VTT/ASS)
- Rastreamento de progresso por aula e por curso
- Notas com timestamp vinculadas a aulas
- Bookmarks de cursos e favoritos de aulas
- Biblioteca de cursos com dashboard de estatísticas
- Celebração de conclusão de curso
- Temas: claro, escuro e sincronizado com o sistema
- Busca global em cursos e aulas
- Categorias customizadas
- Auto-updater integrado
- Keep-alive routing (preserva estado das páginas)
