# Diretrizes para Agentes de IA

Este documento define as regras e convenções que agentes de IA devem seguir ao contribuir neste repositório.

---

## Regras Gerais

1. **Idioma**: Commits, comentários de PR e documentação em português (exceto código e nomes técnicos).
2. **Commits**: Usar Conventional Commits em português — `feat:`, `fix:`, `docs:`, `ci:`, `refactor:`, `style:`, `chore:`.
3. **Sem testes obrigatórios**: Não adicione testes a menos que explicitamente solicitado.
4. **Não quebre o build**: Toda alteração deve manter o projeto compilável.
5. **Versionamento (MUITO IMPORTANTE)**: Sempre que fizer alterações que resolvem problemas ou adicionam features, você **DEVE** fazer o bump da versão (ex: de `1.10.16` para `1.10.17`) em **TODOS** os 3 locais:
   - `package.json` → `"version"`
   - `src-tauri/Cargo.toml` → `version`
   - `src-tauri/tauri.conf.json` → `"version"`

---

## Fluxo de Release Automático (GitHub Actions)

- **O repositório já possui GitHub Actions configurado para release automático.**
- **Cada push na `main` com mudança na versão gera uma nova release.** O workflow lê a versão do `package.json`, cria a tag e faz o build do instalador.
- **Para atualizar o app e entregar a correção/feature:** Você só precisa bumpar a versão nos 3 arquivos citados acima e fazer o push.
- Pushes que alteram apenas `.md` ou `.github/**` não disparam build (economia de CI).

---

## Arquitetura

| Camada | Tecnologia | Localização |
|--------|-----------|-------------|
| Backend | Rust + Tauri 2 | `src-tauri/src/` |
| Frontend | React 19 + TypeScript | `src/` |
| Banco de dados | SQLite (rusqlite) | Runtime: AppData ou modo portátil |
| Estilização | Tailwind CSS v4 | Classes inline nos componentes |
| Ícones | Phosphor Icons | `@phosphor-icons/react` |
| Mobile Proxy | TCP HTTP Server (Rust) | Para bypass do WebView no Android |

---

## Convenções de Código

### Rust (Backend)
- Módulos em `src-tauri/src/commands/` — um arquivo por domínio
- Comandos Tauri com `#[tauri::command]`
- Serialização com `serde` usando `#[serde(rename_all = "camelCase")]`
- Erros convertidos com `.map_err(|e| e.to_string())`

### TypeScript (Frontend)
- Componentes funcionais com hooks
- Tipos em `src/types/`
- API calls centralizadas em `src/lib/store.ts`
- Hooks customizados em `src/hooks/`
- i18n via `useI18n()` — todas as strings de UI devem usar o sistema de tradução

---

## i18n (Internacionalização)

- Arquivo de traduções: `src/lib/i18n.ts`
- Idiomas suportados: `en`, `pt-BR`
- Padrão: `pt-BR`
- Ao adicionar strings de UI, adicione a chave em AMBOS os idiomas
- Use `const t = useI18n()` nos componentes e `t.chave` para acessar

---

## Modo Portátil

- Detectado pela presença de arquivo `.portable` na mesma pasta do executável
- Quando portátil, o banco SQLite vai em `./data/ckourse.db` relativo ao exe
- Módulo: `src-tauri/src/portable.rs`

---

## Integração com APIs e Nuvem (Google Drive)

- **Proxy GDrive (`gdrive://`)**: Sempre que o app precisar reproduzir vídeos da nuvem, NÃO injete a URL externa diretamente no frontend (para evitar bloqueio anti-bot com muitas requisições Range). Use o protocolo `gdrive://`, que faz o backend Rust (`gdrive_protocol.rs`) atuar como proxy utilizando `reqwest`.
- **OAuth offline**: O app processa callbacks localmente em `127.0.0.1:3456`. Não modifique esse comportamento sem repensar o fluxo de PWA/Mobile.
- **Sincronismo Nuvem (Smart Merge)**: O app realiza um sincronismo automático com o Google Drive de forma offline-first. Em vez de sobrescrever o banco local de forma destrutiva, ele usa `ATTACH DATABASE` no Rust para amarrar o banco remoto baixado com o local. Atualiza registros antigos localmente usando `UPDATE ... FROM remote WHERE remote.updated_at > local.updated_at`. Anotações e favoritos usam `INSERT OR IGNORE`. O envio é automático via debounce de 15s no React e interceptação de fechamento de janela (`onCloseRequested`), garantindo zero perda de dados entre dispositivos.
---

## Estrutura de Pastas Importante

```
src/
├── components/       # Componentes React reutilizáveis
├── pages/            # Páginas (rotas)
├── hooks/            # Hooks customizados
├── lib/              # Utilitários, store, i18n, constantes
├── types/            # Tipos TypeScript
└── assets/           # Ícones, animações Lottie

src-tauri/src/
├── commands/         # Comandos Tauri (API pro frontend)
├── db.rs             # Schema e queries SQLite
├── parser.rs         # Parser de pastas de curso
├── portable.rs       # Lógica de modo portátil
├── subtitle.rs       # Manipulação de legendas
├── tcp_proxy.rs      # Servidor HTTP local (127.0.0.1) para burlar limites do Android WebView em streams de vídeo
├── video_protocol.rs # Streaming local via protocolo customizado (obsoleto para cloud)
└── gdrive_protocol.rs# Proxy de requests do Google Drive
```

---

## O Que NÃO Fazer

- Não commite secrets, chaves privadas ou tokens
- Não altere o `TAURI_SIGNING_PRIVATE_KEY` — ele está nos GitHub Secrets
- Não remova o arquivo `LICENSE`
- Não adicione dependências sem necessidade clara
- Não faça push direto em `main` sem bump de versão quando houver features novas
