# Diretrizes para Agentes de IA — Ckourse Mobile

Este documento define as regras e convenções para contribuições de IA neste módulo mobile.

---

## Regras Gerais

1. **Idioma**: Commits, comentários de PR e documentação em português (exceto código e nomes técnicos).
2. **Commits**: Usar Conventional Commits em português — `feat:`, `fix:`, `docs:`, `ci:`, `refactor:`, `style:`, `chore:`.
3. **Sem testes obrigatórios**: Não adicione testes a menos que explicitamente solicitado.
4. **Não quebre o build**: Toda alteração deve manter o projeto compilável para desktop E mobile.
5. **Mobile-first**: Decisões de UI devem priorizar a experiência mobile (touch, telas pequenas).

---

## Arquitetura Mobile

| Camada | Tecnologia | Localização |
|--------|-----------|-------------|
| Runtime | Tauri 2 Mobile (Android) | `src-tauri/` (shared) |
| Frontend | React 19 + TypeScript | `src/` (shared com adaptações) |
| Backend | Rust | `src-tauri/src/` (shared) |
| Banco de dados | SQLite (rusqlite) | Runtime: app internal storage |
| Estilização | Tailwind CSS v4 | Classes inline responsivas |
| Billing | Google Play Billing | Plugin Tauri customizado |
| Ícones | Phosphor Icons | `@phosphor-icons/react` |

---

## Convenções de Código

### Rust (Backend - Shared)
- Comandos mobile-específicos em `src-tauri/src/commands/mobile.rs`
- Feature flags para código platform-specific: `#[cfg(target_os = "android")]`
- Acesso a storage via SAF wrapper

### TypeScript (Frontend)
- Componentes responsivos: usar breakpoints Tailwind (`sm:`, `md:`, `lg:`)
- Hooks mobile-específicos em `src/hooks/mobile/`
- Detecção de plataforma: `import { platform } from "@tauri-apps/plugin-os"`
- Layout mobile: bottom tabs ao invés de sidebar

### i18n
- Todas as strings de UI devem usar o sistema `useI18n()`
- Idiomas suportados: `en`, `pt-BR`
- Ao adicionar strings de UI, adicione em AMBOS os idiomas

---

## Modelo Freemium

- O gate de cursos é verificado no Rust (backend), não no frontend
- Nunca confie apenas em verificação client-side
- O status Pro é armazenado no SQLite local + validado via Google Play
- Funcionalidades Pro: cursos ilimitados, export de notas, stats avançados

---

## Estrutura de Pastas (Adições Mobile)

```
src/
├── components/
│   └── mobile/          # Componentes exclusivos mobile
├── hooks/
│   └── mobile/          # Hooks exclusivos mobile (billing, SAF)
├── layouts/
│   └── MobileLayout.tsx # Layout com bottom tabs
└── lib/
    └── billing.ts       # Interface com Google Play Billing

src-tauri/src/
├── commands/
│   └── mobile.rs        # Comandos exclusivos Android
├── billing.rs           # Verificação de licença
└── saf.rs               # Storage Access Framework wrapper
```

---

## O Que NÃO Fazer

- Não quebre a versão desktop ao fazer mudanças mobile
- Não commite chaves de API ou tokens de billing
- Não faça verificação de licença apenas no frontend (pode ser bypassed)
- Não assuma que o usuário tem conexão com internet
- Não force orientação landscape — o app deve funcionar em portrait e landscape
- Não ignore as guidelines do Material Design para gestos e navegação
