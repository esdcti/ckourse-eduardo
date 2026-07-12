# Roadmap — Ckourse

Plano de evolução focado em uso para **cursos de TI** (programação, DevOps, cloud, banco de dados, design de sistemas).

---

## ✅ Implementado

### v1.0–v1.2 (Base)
- Importação inteligente de pastas de cursos
- Player de vídeo com legendas (SRT/VTT/ASS)
- Progresso por aula e por curso com resume automático
- Notas com timestamp (clicáveis, navegação entre aulas)
- Bookmarks de cursos e favoritos de aulas
- Dashboard com stats e streaks
- Celebração de conclusão de curso
- Temas: claro, escuro, sincronizado com sistema
- Busca global em cursos e aulas
- Categorias customizadas
- Auto-updater integrado
- Modo portátil (pen drive)
- Local customizado para o banco de dados
- i18n completo (pt-BR + English)

### v1.3.x (i18n completo)
- Cobertura 100% de traduções em todos os componentes
- Tooltips, toasts, badges, labels de nível traduzidos
- NoteEditor, VideoPlayer, SidebarSearch, AppShell traduzidos

### v1.4.0 (Features de produtividade)
| # | Feature | Descrição |
|---|---------|-----------|
| 1 | ⌨️ Atalhos de teclado | Space/K (play), N/P (próxima/anterior), F (fullscreen), M (mute), J/L (skip), C (legendas) |
| 2 | 📄 Exportar notas como Markdown | Botão na página Notas — converte HTML→Markdown com timestamps preservados |
| 3 | ⏱️ Indicador de tempo restante | Cards do dashboard mostram "~2h30" ao lado do relógio |
| 4 | 🏷️ Filtro por status na sidebar | Links rápidos: "Em Progresso", "Não Iniciado", "Concluído" |
| 7 | 💬 Tooltip de progresso | Hover no card mostra "15/20 aulas • ~2h restantes" |
| 8 | 📋 Copiar trecho da nota | Botão de copy no hover de cada nota |
| 9 | 🎚️ Velocidade salva por curso | Persiste no SQLite, restaurada ao reabrir o curso |

### v1.5.x (Features de média complexidade)
| # | Feature | Descrição |
|---|---------|-----------|
| 11 | 💾 Export/Import banco | Botões nas Configurações — exportar .db para backup, importar de outro PC |
| 12 | 📄 Visualizador de PDF | Abre PDFs inline em fullscreen (iframe + asset protocol) |
| 13 | 🏷️ Tags customizadas | Sistema many-to-many — input de tags no painel de edição do curso |
| 14 | 🎯 Modo foco | Esconde header + sidebar do currículo, maximiza o vídeo |
| 15 | 🎬 Importar YouTube | Tab "YouTube" na importação — URL → yt-dlp → progresso visual em tempo real → parser → curso importado |

### v1.8.x - v1.11.x (Nuvem, Mobile e Estabilidade)
| # | Feature | Descrição |
|---|---------|-----------|
| 16 | ☁️ Integração Google Drive | OAuth nativo, importação de pastas direto da nuvem sem baixar nada |
| 17 | 🧠 Sincronismo Inteligente (Smart Sync) | Sync `offline-first` via Drive. Banco de dados mesclado (Merge SQL) automaticamente |
| 18 | 📱 Ckourse Mobile (Android) | Versão Android 100% funcional com interface responsiva e proxy TCP nativo para burlar limitações de vídeo |
| 19 | 🌐 Proxy TCP em Rust | Servidor HTTP local (127.0.0.1) que substitui APIs nativas falhas e serve vídeos da nuvem perfeitamente no ExoPlayer |
| 20 | 💾 API de Backup Segura | Checkpoint do cache WAL antes de restaurar bancos da nuvem, prevenindo perdas de sessão |

---

## 🟡 Próximas Features (v1.6+)

Features planejadas que ainda não foram implementadas.

| # | Feature | Complexidade | Por quê? |
|---|---------|-------------|----------|
| 16 | **Meta diária de estudo** | Média | "Estudar 45min/dia" com streak visual e notificação |
| 17 | **Busca dentro das notas** | Baixa | "Onde eu anotei sobre docker-compose?" — full-text search |
| 18 | **Marcadores no vídeo** | Média | Bookmarks de timestamp: "05:23 - Explicação de useEffect" |
| 19 | **Playlists de revisão** | Média | Juntar aulas de diferentes cursos numa playlist |
| 20 | **Detecção de novos vídeos** | Média | Detectar quando novos vídeos aparecem na pasta do curso |
| 21 | **Suporte a áudio** | Baixa | Importar podcasts/audiobooks como "cursos" |
| 22 | **Filtro por tags no dashboard** | Baixa | Usar as tags para filtrar cursos na tela principal |

---

## 🔴 Alta Complexidade (Futuro)

Features ambiciosas que transformam o app.

| # | Feature | Complexidade | Por quê? |
|---|---------|-------------|----------|
| 23 | **Transcrição com Whisper** | Alta | Gerar legendas localmente para cursos sem legenda |
| 24 | **Resumo com IA (Ollama)** | Alta | Resumir aula a partir da transcrição |
| 25 | **Flashcards de revisão** | Alta | Cards gerados a partir das notas com repetição espaçada |
| 26 | **Leitor de código integrado** | Média | Abrir arquivos de código do curso com syntax highlighting |
| 27 | **Certificados de conclusão** | Baixa | Gerar PDF ao terminar curso |
| 29 | **Gamificação expandida** | Média | Conquistas ("Maratonista: 10 aulas em 1 dia") |
| 30 | **Plugin VS Code** | Alta | Extensão que mostra progresso e permite marcar aulas |

---

## 📱 Ckourse Mobile (Android)

Documentação em [ANDROID/](./ANDROID/).

- **Status: Concluído e em Produção**. O app já possui compatibilidade plena com Android.
- **Tech Stack**: Tauri 2 Mobile + React + Rust (90% de código compartilhado com desktop).
- **Video Playback**: O streaming de mídias (locais ou da nuvem) funciona primorosamente graças ao nosso Proxy TCP Nativo implementado no Backend Rust, que alimenta o ExoPlayer local e evita as armadilhas comuns da WebView do Android.

---

## 🔄 Como o auto-release funciona

Cada push na branch `main` que altere código (não apenas `.md`) e tenha uma versão nova no `package.json`:

1. GitHub Actions lê a versão
2. Cria a tag automaticamente
3. Compila o instalador Windows
4. Publica a Release
5. O auto-updater notifica quem já tem o app instalado

**Resultado**: implementou → pushou → usuários recebem a atualização. Zero fricção.
