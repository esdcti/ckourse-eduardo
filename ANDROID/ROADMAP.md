# Roadmap — Ckourse Mobile (Android)

Plano de desenvolvimento organizado em fases incrementais.

---

## Fase 1: Fundação (Semana 1-2)

Fazer o app desktop rodar no Android sem novas features.

| # | Tarefa | Complexidade | Status |
|---|--------|-------------|--------|
| 1.1 | Configurar ambiente Android (SDK, NDK, emulador) | Baixa | ⬜ |
| 1.2 | Rodar `tauri android init` e resolver erros | Baixa | ⬜ |
| 1.3 | Fazer o app abrir no emulador (mesmo que quebrado) | Média | ⬜ |
| 1.4 | Resolver incompatibilidades do video_protocol.rs no Android | Alta | ⬜ |
| 1.5 | Confirmar que SQLite funciona no Android | Baixa | ⬜ |
| 1.6 | Testar navegação básica (rotas funcionando) | Baixa | ⬜ |

---

## Fase 2: Adaptação Mobile (Semana 2-3)

Adaptar a UI para funcionar bem em telas touch.

| # | Tarefa | Complexidade | Status |
|---|--------|-------------|--------|
| 2.1 | Criar layout mobile (bottom tabs: Home, Progresso, Notas, Config) | Média | ⬜ |
| 2.2 | Adaptar Dashboard para grid 1-2 colunas | Baixa | ⬜ |
| 2.3 | Adaptar CourseDetail para tela vertical (vídeo em cima, curriculum em baixo) | Média | ⬜ |
| 2.4 | Adaptar player de vídeo (controles touch-friendly) | Média | ⬜ |
| 2.5 | Remover elementos desktop-only (sidebar, drag region, fullscreen toggle) | Baixa | ⬜ |
| 2.6 | Testar gestos (swipe back, scroll, pinch) | Baixa | ⬜ |
| 2.7 | Safe area insets (notch, barra de navegação) | Baixa | ⬜ |

---

## Fase 3: Storage Access Framework (Semana 3-4)

Permitir que o usuário selecione pastas de curso do armazenamento.

| # | Tarefa | Complexidade | Status |
|---|--------|-------------|--------|
| 3.1 | Implementar SAF picker (selecionar pasta) | Alta | ⬜ |
| 3.2 | Adaptar parser.rs para ler via SAF URIs | Alta | ⬜ |
| 3.3 | Adaptar video_protocol.rs para servir vídeos via content:// URIs | Alta | ⬜ |
| 3.4 | Persistir permissão de acesso à pasta (takePersistableUriPermission) | Média | ⬜ |
| 3.5 | Testar com pastas no armazenamento interno e SD card | Média | ⬜ |
| 3.6 | Fallback: permitir importar vídeos individuais se SAF falhar | Baixa | ⬜ |

---

## Fase 4: Freemium Gate (Semana 4)

Implementar o limite de 2 cursos e tela de upgrade.

| # | Tarefa | Complexidade | Status |
|---|--------|-------------|--------|
| 4.1 | Criar gate no backend Rust (`can_import_course()`) | Baixa | ⬜ |
| 4.2 | Criar tela de upgrade (paywall) | Média | ⬜ |
| 4.3 | Mostrar contagem "1/2 cursos" ou "2/2 cursos" no dashboard | Baixa | ⬜ |
| 4.4 | Integrar Google Play Billing Library | Alta | ⬜ |
| 4.5 | Implementar verificação de compra (purchase validation) | Média | ⬜ |
| 4.6 | Salvar status Pro no SQLite + revalidar no app start | Média | ⬜ |
| 4.7 | Testar fluxo completo (free → compra → unlock) | Média | ⬜ |

---

## Fase 5: Polimento (Semana 5)

| # | Tarefa | Complexidade | Status |
|---|--------|-------------|--------|
| 5.1 | Splash screen com logo Ckourse | Baixa | ⬜ |
| 5.2 | Ícone do app (adaptive icon Android) | Baixa | ⬜ |
| 5.3 | Notificação de "Continue de onde parou" | Média | ⬜ |
| 5.4 | Deep link: abrir curso específico | Média | ⬜ |
| 5.5 | Orientação: suportar portrait e landscape | Baixa | ⬜ |
| 5.6 | Performance: testar em device low-end | Média | ⬜ |
| 5.7 | Acessibilidade básica (talkback, contraste) | Média | ⬜ |

---

## Fase 6: Publicação (Semana 5-6)

| # | Tarefa | Complexidade | Status |
|---|--------|-------------|--------|
| 6.1 | Criar conta Google Play Developer (R$125 taxa única) | Burocrática | ⬜ |
| 6.2 | Gerar signed APK/AAB | Baixa | ⬜ |
| 6.3 | Criar listing na Play Store (screenshots, descrição, assets) | Média | ⬜ |
| 6.4 | Submeter para review | Burocrática | ⬜ |
| 6.5 | ASO básico (keywords, título otimizado) | Baixa | ⬜ |
| 6.6 | Configurar in-app purchase na Play Console | Média | ⬜ |

---

## Estimativa Total

| Fase | Duração | Risco |
|------|---------|-------|
| Fundação | 1-2 semanas | Baixo |
| Adaptação Mobile | 1 semana | Baixo |
| SAF (Storage) | 1-2 semanas | **Alto** (maior desafio técnico) |
| Freemium Gate | 1 semana | Médio |
| Polimento | 1 semana | Baixo |
| Publicação | 1 semana | Burocrático |

**Total estimado: 5-8 semanas** para uma v1.0 publicável.

---

## Métricas de Sucesso (Primeiro Mês)

- 500+ downloads orgânicos
- 5%+ taxa de conversão free → pro
- Rating 4.0+ na Play Store
- 0 crashes críticos reportados
