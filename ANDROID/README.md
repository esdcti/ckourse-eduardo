# Ckourse Mobile (Android)

> Player offline de cursos baixados para Android — com tracking de progresso, notas, e modelo freemium.

---

## Visão Geral

O Ckourse Mobile é a versão Android do [Ckourse](https://github.com/esdcti/ckourse-eduardo), adaptada para funcionar com vídeos armazenados localmente no dispositivo (SD card, pasta de downloads, armazenamento interno).

**Modelo de negócio**: Freemium
- **Free**: até 2 cursos importados, funcionalidades completas
- **Pro**: cursos ilimitados (compra única via Google Play)

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Runtime | Tauri 2 Mobile |
| Frontend | React 19 + TypeScript + Tailwind CSS v4 |
| Backend | Rust (shared com desktop) |
| Banco de dados | SQLite (rusqlite) |
| Player de vídeo | HTML5 `<video>` via WebView |
| Billing | Google Play Billing Library |
| Distribuição | Google Play Store |

---

## Diferenças vs Desktop

| Feature | Desktop | Mobile |
|---------|---------|--------|
| Importar curso | Seleciona pasta no filesystem | SAF (Storage Access Framework) |
| Auto-updater | Tauri plugin | Google Play auto-update |
| Modo portátil | Detecta `.portable` | N/A |
| PiP | Browser PiP API | Android PiP API |
| Layout | Sidebar + main | Bottom tabs + stack navigation |
| Billing | N/A (open source) | Google Play In-App Purchase |

---

## Status do Projeto

- [ ] Ambiente de desenvolvimento configurado
- [ ] `tauri android init` executado
- [ ] Layout mobile adaptado (responsive)
- [ ] Storage Access Framework integrado
- [ ] Player de vídeo funcionando no Android
- [ ] SQLite rodando no Android
- [ ] Gate de 2 cursos (freemium)
- [ ] Google Play Billing integrado
- [ ] Testes em dispositivo físico
- [ ] Publicação na Play Store

---

## Como Rodar

```bash
# Pré-requisitos instalados (ver SETUP.md)
npm install
npm run tauri android init
npm run tauri android dev
```

---

## Documentos

| Arquivo | Conteúdo |
|---------|----------|
| [SETUP.md](./SETUP.md) | Guia de instalação do ambiente |
| [ROADMAP.md](./ROADMAP.md) | Plano de desenvolvimento |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Decisões técnicas e arquitetura |
| [MONETIZATION.md](./MONETIZATION.md) | Modelo freemium e pricing |
| [AGENTS.md](./AGENTS.md) | Regras para IA contribuir no projeto |
| [PLAYSTORE.md](./PLAYSTORE.md) | Checklist de publicação na Play Store |
