# Arquitetura — Ckourse Mobile

Decisões técnicas e como o código é compartilhado entre desktop e mobile.

---

## Princípio: Máximo Compartilhamento

O objetivo é reusar **90%+ do código** entre desktop e mobile:

```
┌─────────────────────────────────────────────────┐
│                   Frontend (React)               │
│  src/components, src/pages, src/hooks, src/lib   │
│  ─────────────────────────────────────────────── │
│  Shared: 85%  │  Mobile-only: 10%  │  Desktop: 5%│
└─────────────────────────────────────────────────┘
                        │
                   Tauri Bridge
                        │
┌─────────────────────────────────────────────────┐
│                 Backend (Rust)                    │
│  src-tauri/src/ (commands, db, parser, etc.)     │
│  ─────────────────────────────────────────────── │
│  Shared: 90%  │  Mobile-only: 8%  │  Desktop: 2% │
└─────────────────────────────────────────────────┘
```

---

## Detecção de Plataforma

```typescript
// Frontend
import { type } from "@tauri-apps/plugin-os";

const platform = await type(); // "android" | "windows" | "linux" | "macos"
const isMobile = platform === "android" || platform === "ios";
```

```rust
// Backend
#[cfg(target_os = "android")]
fn android_specific() { ... }

#[cfg(not(target_os = "android"))]
fn desktop_specific() { ... }
```

---

## Layout Adaptativo

### Desktop
```
┌──────┬───────────────────────────────┐
│      │  Header (breadcrumbs, theme)  │
│ Side │───────────────────────────────│
│ bar  │                               │
│      │         Main Content          │
│      │                               │
└──────┴───────────────────────────────┘
```

### Mobile
```
┌───────────────────────┐
│   Status Bar          │
├───────────────────────┤
│                       │
│    Main Content       │
│    (scroll)           │
│                       │
├───────────────────────┤
│ 🏠  📊  📝  ⚙️       │  ← Bottom Tabs
└───────────────────────┘
```

Implementação:
```tsx
// src/App.tsx
function App() {
  const isMobile = usePlatform() === "android";
  
  return isMobile ? <MobileLayout /> : <AppShell />;
}
```

---

## Storage Access Framework (SAF)

O maior desafio técnico. No desktop, lemos pastas diretamente via `std::fs`. No Android, precisamos do SAF.

### Fluxo de importação no Android:

```
1. User clica "Importar Curso"
2. Android abre DocumentPicker (SAF)
3. User seleciona uma pasta
4. App recebe content:// URI
5. App chama takePersistableUriPermission() (manter acesso)
6. Rust lê os arquivos via ContentResolver (JNI ou plugin)
7. Parser detecta estrutura normalmente
8. Vídeos são servidos via content:// URI no player
```

### Implementação:

```rust
// src-tauri/src/saf.rs
#[cfg(target_os = "android")]
pub fn list_directory(uri: &str) -> Result<Vec<FileEntry>, String> {
    // Usa JNI para chamar ContentResolver.query()
    // Retorna lista de arquivos na pasta
}

#[cfg(target_os = "android")]
pub fn read_file(uri: &str) -> Result<Vec<u8>, String> {
    // Usa JNI para abrir InputStream via ContentResolver
}
```

---

## Video Playback no Android

### Desktop (atual):
- `video_protocol.rs` registra protocolo custom `stream://`
- Serve bytes do arquivo direto do filesystem

### Mobile (adaptação):
- Opção A: Servir via `convertFileSrc()` com content:// URI
- Opção B: Copiar vídeo para cache temporário e servir de lá
- Opção C: Plugin Tauri customizado que expõe um servidor HTTP local

**Decisão**: Opção A é a preferida (zero cópia), com fallback pra B se houver problemas de compatibilidade com WebView.

---

## Banco de Dados

SQLite funciona idêntico no Android — o `rusqlite` com feature `bundled` compila o SQLite junto no binário, sem dependência externa.

**Localização do DB no Android:**
```
/data/data/com.ckourse.app/databases/ckourse.db
```

Acesso via:
```rust
#[cfg(target_os = "android")]
fn get_db_path(app: &tauri::AppHandle) -> PathBuf {
    app.path().app_data_dir().unwrap().join("ckourse.db")
}
```

---

## Google Play Billing

### Arquitetura:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────→│  Rust Layer  │────→│  Kotlin/JNI  │
│  (paywall)   │     │  (validate)  │     │  (Billing)   │
└──────────────┘     └──────────────┘     └──────────────┘
                                                  │
                                          Google Play API
```

### Fluxo:
1. Frontend mostra paywall quando `courseCount >= 2`
2. User clica "Comprar Pro"
3. Rust chama plugin de billing (Kotlin via JNI)
4. Google Play mostra modal de compra
5. Após sucesso, Kotlin retorna purchase token
6. Rust valida e salva `is_pro = true` no SQLite
7. Frontend desbloqueia importação

### Segurança:
- Purchase token é validado localmente (verificação de assinatura)
- Sem servidor remoto necessário (offline-first)
- O gate está no Rust, não no frontend (não pode ser bypassed via JS)

---

## Feature Flags

Para compilação condicional desktop/mobile:

```toml
# src-tauri/Cargo.toml
[features]
default = []
mobile = []
desktop = []
```

```rust
#[cfg(feature = "mobile")]
mod saf;

#[cfg(feature = "mobile")]
mod billing;
```

No `tauri.conf.json`, targets mobile automaticamente ativam a feature `mobile`.

---

## Testes

| Tipo | Ferramenta | Quando |
|------|-----------|--------|
| UI no emulador | Android Studio AVD | Dev diário |
| Device físico | USB Debug | Antes de release |
| Performance | Android Profiler | Antes de publicar |
| Billing | Google Play test tracks | Antes de publicar |
| Crash reporting | Sentry ou Firebase Crashlytics | Em produção |
