# Setup do Ambiente — Ckourse Mobile (Android)

Guia completo para configurar o ambiente de desenvolvimento no Windows.

---

## Pré-requisitos (já instalados para o desktop)

- ✅ Node.js 18+ e npm
- ✅ Rust (via rustup)
- ✅ Microsoft C++ Build Tools
- ✅ VS Code ou Kiro

---

## Instalação

### 1. Android Studio

1. Baixe em: https://developer.android.com/studio
2. Instale normalmente (aceite os defaults)
3. Abra o Android Studio pelo menos uma vez para finalizar o setup

### 2. SDK e ferramentas (via SDK Manager)

No Android Studio: `More Actions` → `SDK Manager` (ou `Settings` → `Languages & Frameworks` → `Android SDK`)

**Aba SDK Platforms:**
- ✅ Android 14.0 (API 34) — ou a mais recente disponível

**Aba SDK Tools** (marque "Show Package Details"):
- ✅ Android SDK Build-Tools (última versão)
- ✅ NDK (Side by side) — versão 25+ 
- ✅ Android SDK Command-line Tools (latest)
- ✅ Android SDK Platform-Tools

Clique "Apply" e aguarde o download.

### 3. Variáveis de ambiente

Adicione ao sistema (via `Configurações > Variáveis de Ambiente > Variáveis do Sistema`):

```
JAVA_HOME = C:\Program Files\Android\Android Studio\jbr
ANDROID_HOME = %LOCALAPPDATA%\Android\Sdk
NDK_HOME = %LOCALAPPDATA%\Android\Sdk\ndk\<versão-instalada>
```

Adicione ao `PATH`:
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\cmdline-tools\latest\bin
```

### 4. Targets Rust para Android

Abra um novo terminal (para pegar as variáveis de ambiente) e rode:

```bash
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
```

### 5. Emulador (opcional, mas recomendado)

No Android Studio: `More Actions` → `Virtual Device Manager`

1. Clique "Create Virtual Device"
2. Escolha "Pixel 7" (ou similar)
3. Selecione uma system image (API 34, x86_64)
4. Finalize e inicie o emulador

### 6. Celular físico (alternativa ao emulador)

1. No celular: `Configurações` → `Sobre o telefone` → toque 7x em "Número da versão"
2. Volte em `Configurações` → `Opções do desenvolvedor`
3. Ative "Depuração USB"
4. Conecte via cabo USB e aceite a permissão no celular
5. Verifique: `adb devices` deve mostrar seu dispositivo

---

## Inicializando o projeto mobile

```bash
cd c:\GIT\ckourse-eduardo
npm run tauri android init
```

Isso cria a estrutura Android dentro de `src-tauri/gen/android/`.

---

## Rodando no device/emulador

```bash
# Com emulador aberto ou celular conectado:
npm run tauri android dev
```

Primeira build demora mais (compila Rust para ARM). Builds subsequentes são incrementais.

---

## Verificando se tudo está OK

```bash
# Checa se Rust targets estão instalados
rustup target list --installed | findstr android

# Checa se Android SDK está acessível
adb --version

# Checa se o NDK está no lugar certo
dir %NDK_HOME%
```

---

## Troubleshooting

| Problema | Solução |
|----------|---------|
| `JAVA_HOME not set` | Verifique se a variável aponta para o JBR dentro do Android Studio |
| `NDK not found` | Confirme que o NDK foi instalado via SDK Manager e que `NDK_HOME` aponta para a pasta correta |
| `adb: command not found` | Adicione `%ANDROID_HOME%\platform-tools` ao PATH |
| Build demora muito | Normal na primeira vez (~5-10min). Subsequentes são rápidas |
| Emulador lento | Ative "Hardware Acceleration" no BIOS (Intel VT-x ou AMD-V) |
| `sdk-build-tools not found` | Instale via SDK Manager aba "SDK Tools" |

---

## Links úteis

- [Tauri Mobile Prerequisites](https://tauri.app/start/prerequisites/#android)
- [Android Developer Setup](https://developer.android.com/studio/install)
- [Tauri Android Guide](https://v2.tauri.app/distribute/google-play/)
