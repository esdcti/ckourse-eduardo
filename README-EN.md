# Ckourse

> Your local course player — with progress that actually sticks.

Ckourse is an open-source desktop application for watching and organizing downloaded courses. No subscriptions, no cloud, no chaos — just your files, beautifully organized with full progress tracking.

---

## The Problem

You download a course from the internet. You get a folder with 80 videos, inconsistently named, nested in subfolders, with PDFs and subtitles scattered around. You watch a few lessons, close your laptop, and come back three days later with no idea where you left off.

Your media player doesn't know what "Section 4 - Lesson 12" means. Your file manager doesn't track progress. Nothing ties it all together.

**Ckourse does.**

---

## Features

### ✅ v1.10 — Current
- 🧠 **Smart Merge** — Ckourse is now truly cross-device! When opening the app, it detects cloud changes and smartly merges them with your local database without destroying offline progress.
- ⚡ **Invisible Sync** — The app silently sends your progress to Google Drive 15 seconds after any change, and immediately on close. Zero data loss!

### ✅ Core Features
- 📁 **Smart folder import** — point Ckourse at any course folder and it parses the structure automatically
- 🎬 **YouTube Import** — paste a playlist URL, track download progress in real-time, and import it as a course (requires yt-dlp + ffmpeg)
- ☁️ **Google Drive Integration (Streaming)** — link your Google account via OAuth and import full course folders directly from the cloud. Your progress travels with you via **Smart Sync**.
- 📱 **Mobile & Desktop** — Ckourse runs natively on Windows, macOS, Linux, and also on **Android** with progress sync and smooth cloud streaming via our custom TCP proxy.
- ▶️ **Built-in video player** — native HTML5 player with subtitle support, autoplay, PiP, and timestamp navigation
- ⌨️ **Full Keyboard Shortcuts** — Space, N/P (next/prev), F (fullscreen), M (mute), J/L (skip), C (subtitles)
- 📊 **Progress tracking** — per-lesson completion, per-course progress bar, resume from exactly where you stopped
- ⏱️ **Time Remaining** — each card shows how much time is left to finish the course
- 📝 **Timestamped notes** — add notes tied to specific timestamps, exportable as Markdown
- 📋 **Copy notes** — copy button for easy snippet extraction
- 📄 **PDF viewer** — read course attachments inline
- 🔖 **Bookmarks and Favorites** — bookmark courses and lessons for quick access
- 🏷️ **Custom Tags** — organize by tech: React, Docker, SQL, AWS...
- 🎚️ **Per-course playback speed** — each course saves its preferred speed
- 🎯 **Focus Mode** — hides sidebar and header, maximizes the video
- 🗂️ **Sidebar Status Filter** — quick access to In Progress, Completed, or Not Started courses
- 💾 **Export/Import DB** — migrate progress between PCs in one click
- 🌙 **Themes** — light, dark, and system-sync
- 🌐 **Portuguese (BR) Interface** — full i18n system (pt-BR + English)
- 💾 **Portable Mode** — run from a flash drive with data saved alongside the app
- 🔄 **Auto-updater** — receive updates automatically
- 🔍 **Global Search** — search courses and lessons by name
- 🎉 **Completion celebration** — animation when you finish a course
- 📈 **Dashboard with stats** — streaks, activity heatmap, progression levels

### 🚧 Upcoming Features
- 🎯 **Daily study goals** — visual streak and consistency
- 📌 **Video bookmarks** — timestamp bookmarks for quick review
- 🔍 **Search inside notes** — full-text search
- 🃏 **Review Playlists** — combine lessons from different courses
- 🤖 **Whisper Transcription** — automatic subtitles via local AI

---

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop Framework | [Tauri 2](https://tauri.app/) |
| Frontend | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Routing | [React Router 7](https://reactrouter.com/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| Icons | [Phosphor Icons](https://phosphoricons.com/) |
| Charts | [Recharts](https://recharts.org/) |
| Analytics | [PostHog](https://posthog.com/) (optional, env-configured) |
| Backend | [Rust](https://www.rust-lang.org/) |
| Database | SQLite via [rusqlite](https://github.com/rusqlite/rusqlite) (bundled) |
| Build Tool | [Vite](https://vite.dev/) |

---

## Download

Pre-built installers for macOS and Windows are available on the [Releases page](https://github.com/redaantar/ckourse/releases).

---

## Building from Source

### Prerequisites

- [Rust](https://rustup.rs/) (latest stable)
- [Node.js](https://nodejs.org/) (v20+)
- Platform toolchain for Tauri — see [Tauri prerequisites](https://tauri.app/start/prerequisites/)

### Development

```bash
# Clone the repository
git clone https://github.com/redaantar/ckourse.git
cd ckourse

# Install frontend dependencies
npm install

# Run in development mode (macOS / Windows / Linux)
npm run tauri dev

# Build for production (produces installers for the current OS)
npm run tauri build
```

#### Platform-specific build targets

**macOS** — build a universal binary (Apple Silicon + Intel):

```bash
rustup target add x86_64-apple-darwin  # one-time setup
npm run tauri build -- --target universal-apple-darwin
```

Output: `.dmg` and `.app` under `src-tauri/target/universal-apple-darwin/release/bundle/`.

**Windows** — build an MSI and NSIS installer:

```powershell
npm run tauri build
```

Output: `.msi` and `.exe` under `src-tauri\target\release\bundle\`.

**Linux** — build `.deb` / `.AppImage`:

```bash
npm run tauri build
```

Output: `.deb` and `.AppImage` under `src-tauri/target/release/bundle/`.

### Environment variables (optional)

PostHog analytics is disabled unless you set the following in a `.env` file at the project root. Leave them unset to run the app with analytics off.

```bash
VITE_PUBLIC_POSTHOG_PROJECT_TOKEN=your_token
VITE_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

### CI

CI builds macOS (universal) and Windows installers on tag push — see [`.github/workflows/build.yml`](.github/workflows/build.yml).

---

## Project Structure

```
ckourse/
├── src/                      # React frontend
│   ├── components/
│   │   ├── app-shell/        # Layout, sidebar, navigation
│   │   ├── course-detail/    # Video player, notes, sections
│   │   ├── dashboard/        # Course cards, stats, empty state
│   │   └── ui/               # Shared UI primitives
│   ├── pages/                # Route pages (Dashboard, CourseDetail, Notes,
│   │                         #   Bookmarks, Progress, ImportCourse, Settings)
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Store, utilities, constants
│   ├── assets/               # Lottie animations, icons
│   └── types/                # TypeScript type definitions
├── src-tauri/                # Rust backend
│   ├── src/
│   │   ├── main.rs           # Tauri entry point
│   │   ├── lib.rs            # Tauri app setup
│   │   ├── db.rs             # SQLite schema and queries
│   │   ├── parser.rs         # Course folder parser
│   │   ├── portable.rs       # Portable mode logic
│   │   ├── subtitle.rs       # Subtitle file handling
│   │   ├── tcp_proxy.rs      # Local HTTP proxy to bypass WebView streaming limits
│   │   ├── video_protocol.rs # Local video streaming via custom protocol
│   │   ├── gdrive_protocol.rs# Google Drive API proxy
│   │   └── commands/         # courses.rs, lessons.rs, notes.rs, settings.rs,
│   │                         #   portable.rs, youtube.rs, drive.rs
│   └── tauri.conf.json       # Tauri configuration
└── public/                   # Static assets
```

---

## Portable Mode (USB Drive / SD Card)

Want to take your courses and progress to any computer? Use portable mode:

1. Copy `ckourse.exe` to the USB drive/SD card
2. Create an empty file named `.portable` in the same folder as the executable
3. Done — upon opening, the database will be saved in `./data/` alongside the app

```
E:\Ckourse\
├── ckourse.exe
├── .portable          ← empty file enabling the mode
└── data\
    └── ckourse.db     ← created automatically
```

Your courses can be in any folder on the drive. Progress, notes, and settings travel with you.

---

## Cloud Usage (Google Drive)

Ckourse has official integration with the Google Drive API via OAuth2. 

**Cloud Courses (Streaming):** In settings, click "Connect Google Account". After that, you can paste the link of any folder from your Drive and Ckourse will import all videos. The application features a Native TCP Proxy in Rust running locally (127.0.0.1) that converts web requests into seamless Google Drive streams. It guarantees absolute stability during playback (even on Android WebView), bypassing the need to download the full video and evading platform anti-bot limits.

**Cloud Sync (Smart Sync):** Ckourse is `offline-first` and features an advanced merging system (SQL Merge). Once your cloud is linked, the app transparently backs up your progress to Drive on every change or upon closing. If you open Ckourse on your phone or another PC, it downloads the latest database and merges progress without deleting data, ensuring zero loss.

---

## Contributing

Ckourse is in early development. Contributions, issues, and feature requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow, code conventions, and commit style, and the [Code of Conduct](CODE_OF_CONDUCT.md) for community expectations.

To report a security vulnerability, see [SECURITY.md](SECURITY.md).

---

## License

MIT — free to use, modify, and distribute.

---

## Links

- 🐛 Issues: [github.com/redaantar/ckourse/issues](https://github.com/redaantar/ckourse/issues)
