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

### ✅ v1 — Core
- 📁 **Importação inteligente de pastas** — aponte o Ckourse para qualquer pasta de curso e ele analisa a estrutura automaticamente, detectando seções, aulas, legendas e anexos
- ▶️ **Player de vídeo integrado** — player HTML5 nativo com suporte a legendas, autoplay e navegação por timestamp
- 📊 **Rastreamento de progresso** — conclusão por aula, barra de progresso por curso, retome exatamente de onde parou
- 📝 **Notas com timestamp** — adicione notas vinculadas a timestamps específicos e navegue de volta instantaneamente, mesmo entre aulas
- 🔖 **Bookmarks** — marque aulas para acesso rápido em uma página dedicada
- 🗂️ **Biblioteca de cursos** — um dashboard limpo com todos os cursos importados e progresso visível
- 🎉 **Celebração de conclusão** — animação de partículas em canvas quando você termina um curso
- 🌙 **Temas** — claro, escuro e sincronizado com o sistema

### 🚧 v2 — Planejado
- 📄 **Visualizador de PDF/recursos** — leia anexos do curso sem sair do app
- 🔍 **Busca** — busque em todos os cursos, aulas e suas notas pessoais

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
│   │   ├── subtitle.rs       # Manipulação de legendas
│   │   └── commands/         # courses.rs, lessons.rs, notes.rs, settings.rs
│   └── tauri.conf.json       # Configuração do Tauri
└── public/                   # Assets estáticos
```

---

## Contribuindo

O Ckourse está em desenvolvimento inicial. Contribuições, issues e feature requests são bem-vindas. Veja [CONTRIBUTING.md](CONTRIBUTING.md) para o fluxo de trabalho, convenções de código e estilo de commit, e o [Code of Conduct](CODE_OF_CONDUCT.md) para expectativas da comunidade.

Para reportar uma vulnerabilidade de segurança, veja [SECURITY.md](SECURITY.md).

---

## Licença

MIT — livre para usar, modificar e distribuir.

---

## Links

- 🐛 Issues: [github.com/esdcti/ckourse-eduardo/issues](https://github.com/esdcti/ckourse-eduardo/issues)
- 🇬🇧 [English README](README-EN.md)
