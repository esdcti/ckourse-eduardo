# Ckourse

> Seu player local de cursos — com progresso que realmente funciona.

Ckourse é um aplicativo desktop open-source para assistir e organizar cursos baixados. Sem assinaturas, sem nuvem, sem bagunça — apenas seus arquivos, organizados de forma bonita com rastreamento completo de progresso.

---

## O Problema

Você baixa um curso da internet. Recebe uma pasta com 80 vídeos, nomeados de forma inconsistente, dentro de subpastas, com PDFs e legendas espalhados. Assiste algumas aulas, fecha o notebook e volta três dias depois sem ideia de onde parou.

Seu media player não sabe o que "Seção 4 - Aula 12" significa. Seu gerenciador de arquivos não rastreia progresso. Nada une tudo isso.

**O Ckourse resolve.**

---

## Funcionalidades

### ✅ v1.11 — Atual
- 🧠 **Sincronismo Inteligente (Smart Merge)** — Ckourse agora é verdadeiramente cross-device! Ao abrir o aplicativo, ele detecta alterações na nuvem e mescla de forma inteligente com o seu banco local sem destruir seu progresso offline.
- ⚡ **Sincronização Invisível** — O app envia seu progresso pro Google Drive silenciosamente 15 segundos após você fazer qualquer alteração, e imediatamente se você fechar o aplicativo. Zero perda de dados!

### ✅ Funcionalidades Principais
- 📁 **Importação inteligente de pastas** — aponte o Ckourse para qualquer pasta de curso e ele analisa a estrutura automaticamente
- 🎬 **Importação do YouTube** — cole a URL de uma playlist, acompanhe o progresso em tempo real (vídeo X/Y + barra animada) e importe como curso (requer yt-dlp + ffmpeg)
- ☁️ **Integração Google Drive (Streaming)** — vincule sua conta do Google via OAuth e importe pastas de cursos inteiras diretamente da nuvem. Seu progresso viaja com você via **Smart Sync** (Sincronismo Inteligente).
- 📱 **Mobile & Desktop** — Ckourse roda nativamente no Windows, macOS, Linux, e também no **Android** com sincronismo de progresso e streaming liso direto da nuvem via nosso proxy TCP customizado.
- ▶️ **Player de vídeo integrado** — player HTML5 com legendas, autoplay, PiP e navegação por timestamp
- ⌨️ **Atalhos de teclado completos** — Space, N/P (próxima/anterior), F (fullscreen), M (mute), J/L (skip), C (legendas)
- 📊 **Rastreamento de progresso** — conclusão por aula, barra de progresso, retome de onde parou
- ⏱️ **Tempo restante** — cada card mostra quanto falta para terminar o curso
- 📝 **Notas com timestamp** — adicione notas vinculadas a timestamps específicos, exportáveis como Markdown
- 📋 **Copiar notas** — botão de copy para levar snippets pro clipboard
- 📄 **Visualizador de PDF** — abra PDFs inline sem sair do app
- 🔖 **Bookmarks e Favoritos** — marque cursos e aulas para acesso rápido
- 🏷️ **Tags customizadas** — organize por tech: React, Docker, SQL, AWS...
- 🎚️ **Velocidade por curso** — cada curso salva sua velocidade preferida
- 🎯 **Modo foco** — esconde sidebar e header, maximiza o vídeo
- 🗂️ **Filtro por status na sidebar** — acesso rápido a cursos em progresso, concluídos ou não iniciados
- 💾 **Export/Import banco** — migre progresso entre PCs com um clique
- 🌙 **Temas** — claro, escuro e sincronizado com o sistema
- 🌐 **Interface em Português (BR)** — sistema de i18n completo (pt-BR + English)
- 💾 **Modo Portátil** — rode do pen drive com dados salvos junto ao app
- 📂 **Local customizado para o banco** — salve em pasta na nuvem (Drive, OneDrive)
- 🔄 **Auto-updater** — receba atualizações automaticamente
- 🔍 **Busca global** — busque em cursos e aulas pelo nome
- 🎉 **Celebração de conclusão** — animação ao terminar um curso
- 📈 **Dashboard com stats** — streaks, heatmap de atividade, níveis de progressão

### 🚧 Próximas versões
- 🎯 **Meta diária de estudo** — streak e consistência
- 📌 **Marcadores no vídeo** — bookmarks de timestamp para revisão rápida
- 🔍 **Busca dentro das notas** — full-text search
- 🃏 **Playlists de revisão** — juntar aulas de cursos diferentes
- 🤖 **Transcrição com Whisper** — legendas automáticas via IA local

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework Desktop | [Tauri 2](https://tauri.app/) |
| Frontend | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Roteamento | [React Router 7](https://reactrouter.com/) |
| Estilização | [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| Ícones | [Phosphor Icons](https://phosphoricons.com/) |
| Gráficos | [Recharts](https://recharts.org/) |
| Analytics | [PostHog](https://posthog.com/) (opcional, configurado via env) |
| Backend | [Rust](https://www.rust-lang.org/) |
| Banco de Dados | SQLite via [rusqlite](https://github.com/rusqlite/rusqlite) (bundled) |
| Build Tool | [Vite](https://vite.dev/) |

---

## Download

Instaladores pré-compilados para macOS e Windows estão disponíveis na [página de Releases](https://github.com/esdcti/ckourse-eduardo/releases).

---

## Compilando a partir do Código-Fonte

### Pré-requisitos

- [Rust](https://rustup.rs/) (stable mais recente)
- [Node.js](https://nodejs.org/) (v20+)
- Toolchain da plataforma para Tauri — veja [pré-requisitos do Tauri](https://tauri.app/start/prerequisites/)

### Desenvolvimento

```bash
# Clone o repositório
git clone https://github.com/esdcti/ckourse-eduardo.git
cd ckourse-eduardo

# Instale as dependências do frontend
npm install

# Execute em modo de desenvolvimento (macOS / Windows / Linux)
npm run tauri dev

# Build para produção (gera instaladores para o SO atual)
npm run tauri build
```

#### Targets de build específicos por plataforma

**macOS** — build de binário universal (Apple Silicon + Intel):

```bash
rustup target add x86_64-apple-darwin  # configuração única
npm run tauri build -- --target universal-apple-darwin
```

Saída: `.dmg` e `.app` em `src-tauri/target/universal-apple-darwin/release/bundle/`.

**Windows** — build de instalador MSI e NSIS:

```powershell
npm run tauri build
```

Saída: `.msi` e `.exe` em `src-tauri\target\release\bundle\`.

**Linux** — build `.deb` / `.AppImage`:

```bash
npm run tauri build
```

Saída: `.deb` e `.AppImage` em `src-tauri/target/release/bundle/`.

### Variáveis de ambiente (opcional)

O PostHog analytics é desabilitado a menos que você configure o seguinte em um arquivo `.env` na raiz do projeto. Deixe sem definir para executar o app sem analytics.

```bash
VITE_PUBLIC_POSTHOG_PROJECT_TOKEN=seu_token
VITE_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

---

## Estrutura do Projeto

```
ckourse/
├── src/                      # Frontend React
│   ├── components/
│   │   ├── app-shell/        # Layout, sidebar, navegação
│   │   ├── course-detail/    # Player de vídeo, notas, seções
│   │   ├── dashboard/        # Cards de cursos, stats, estado vazio
│   │   └── ui/               # Componentes UI compartilhados
│   ├── pages/                # Páginas de rotas (Dashboard, CourseDetail, Notes,
│   │                         #   Bookmarks, Progress, ImportCourse, Settings)
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Store, utilitários, constantes
│   ├── assets/               # Animações Lottie, ícones
│   └── types/                # Definições de tipos TypeScript
├── src-tauri/                # Backend Rust
│   ├── src/
│   │   ├── main.rs           # Entry point do Tauri
│   │   ├── lib.rs            # Setup do app Tauri
│   │   ├── db.rs             # Schema SQLite e queries
│   │   ├── parser.rs         # Parser de pasta de cursos
│   │   ├── portable.rs       # Lógica de modo portátil
│   │   ├── subtitle.rs       # Manipulação de legendas
│   │   ├── tcp_proxy.rs      # Proxy HTTP local para servir vídeos burlado WebView limits
│   │   ├── video_protocol.rs # Streaming local via protocolo customizado
│   │   ├── gdrive_protocol.rs# Proxy de requisições Drive API
│   │   └── commands/         # courses.rs, lessons.rs, notes.rs,
│   │                         #   settings.rs, portable.rs, youtube.rs, drive.rs
│   └── tauri.conf.json       # Configuração do Tauri
└── public/                   # Assets estáticos
```

---

## Modo Portátil (Pen Drive / Cartão de Memória)

Quer levar seus cursos e progresso para qualquer computador? Use o modo portátil:

1. Copie o `ckourse.exe` para o pen drive/cartão de memória
2. Crie um arquivo vazio chamado `.portable` na mesma pasta do executável
3. Pronto — ao abrir, o banco de dados será salvo em `./data/` ao lado do app

```
E:\Ckourse\
├── ckourse.exe
├── .portable          ← arquivo vazio que ativa o modo
└── data\
    └── ckourse.db     ← criado automaticamente
```

Seus cursos podem estar em qualquer pasta do cartão. O progresso, notas e configurações viajam com você.

---

## Uso com a Nuvem (Google Drive)

O Ckourse possui integração oficial com a API do Google Drive via OAuth2. 

**Cursos na Nuvem (Streaming):** Nas configurações, clique em "Conectar Conta do Google". Depois disso, você pode colar o link de qualquer pasta do seu Drive e o Ckourse vai importar todos os vídeos. O aplicativo possui um Proxy TCP Nativo em Rust rodando no próprio dispositivo (127.0.0.1) que converte requisições web para streams perfeitos do Google Drive. Ele garante estabilidade absoluta na reprodução (inclusive no WebView do Android), burlando a necessidade de baixar o vídeo inteiro e os limites anti-robô da plataforma.

**Sincronismo Nuvem (Smart Sync):** O Ckourse é `offline-first` e possui um sistema avançado de mesclagem (Merge SQL). Quando você vincula a sua nuvem, o aplicativo vai fazer backup transparente do seu progresso pro Drive a cada alteração ou ao fechar. Se você abrir o Ckourse no celular ou em outro PC, ele baixa o banco mais atual e mescla os progressos sem apagar dados, garantindo zero perdas.

---

## Contribuindo

O Ckourse está em desenvolvimento inicial. Contribuições, issues e feature requests são bem-vindas. Veja [CONTRIBUTING.md](CONTRIBUTING.md) para o fluxo de trabalho, convenções de código e estilo de commit, e o [Code of Conduct](CODE_OF_CONDUCT.md) para expectativas da comunidade.

Para reportar uma vulnerabilidade de segurança, veja [SECURITY.md](SECURITY.md).

---

## Licença

MIT — livre para usar, modificar e distribuir.

---

## Créditos

Fork do projeto [Ckourse](https://github.com/redaantar/ckourse) por Reda Antar, licenciado sob MIT.

---

## Links

- 🐛 Issues: [github.com/esdcti/ckourse-eduardo/issues](https://github.com/esdcti/ckourse-eduardo/issues)
- 🇬🇧 [English README](README-EN.md)
