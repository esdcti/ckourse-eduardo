use std::io::{BufRead, BufReader};
use std::path::Path;
use std::process::{Command, Stdio};
use tauri::Emitter;

#[derive(serde::Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct YtDlpStatus {
    pub available: bool,
    pub version: Option<String>,
}

#[derive(serde::Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct YtDlpProgress {
    pub status: String, // "downloading" | "processing" | "done" | "error"
    pub message: String,
    pub percent: f64,
    pub video_title: Option<String>,
    pub video_index: Option<u32>,
    pub total_videos: Option<u32>,
}

#[tauri::command]
pub fn check_ytdlp() -> YtDlpStatus {
    match Command::new("yt-dlp").arg("--version").output() {
        Ok(output) if output.status.success() => {
            let version = String::from_utf8_lossy(&output.stdout).trim().to_string();
            YtDlpStatus {
                available: true,
                version: Some(version),
            }
        }
        _ => YtDlpStatus {
            available: false,
            version: None,
        },
    }
}

#[tauri::command]
pub async fn download_youtube_playlist(
    app: tauri::AppHandle,
    url: String,
    output_dir: String,
) -> Result<String, String> {
    let output_path = Path::new(&output_dir);
    std::fs::create_dir_all(output_path).map_err(|e| format!("Erro ao criar pasta: {}", e))?;

    let output_template = output_path
        .join("%(playlist_index)03d - %(title)s.%(ext)s")
        .to_string_lossy()
        .to_string();

    // Emit initial status
    let _ = app.emit("ytdlp-progress", YtDlpProgress {
        status: "downloading".to_string(),
        message: "Iniciando download...".to_string(),
        percent: 0.0,
        video_title: None,
        video_index: None,
        total_videos: None,
    });

    let mut child = Command::new("yt-dlp")
        .args([
            "--yes-playlist",
            "-f", "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/bv*+ba/b",
            "--merge-output-format", "mp4",
            "--write-subs",
            "--sub-langs",
            "all",
            "--convert-subs",
            "vtt",
            "--newline",
            "--no-colors",
            "--windows-filenames",
            "--restrict-filenames",
            "--no-playlist-thumbnail",
            "--output",
            &output_template,
            &url,
        ])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Erro ao executar yt-dlp: {}. Verifique se está instalado e no PATH.", e))?;

    // Read stderr in a separate thread to avoid deadlock
    let stderr_handle = child.stderr.take().map(|stderr| {
        std::thread::spawn(move || {
            let reader = BufReader::new(stderr);
            let mut errors = Vec::new();
            for line in reader.lines().map_while(Result::ok) {
                if !line.trim().is_empty() {
                    errors.push(line);
                }
            }
            errors
        })
    });

    // Read stdout for progress
    if let Some(stdout) = child.stdout.take() {
        let reader = BufReader::new(stdout);
        let app_clone = app.clone();

        for line in reader.lines().map_while(Result::ok) {
            // yt-dlp outputs lines like:
            // [download]  45.2% of ~50.00MiB at 2.50MiB/s ETA 00:15
            // [download] Downloading video 3 of 12
            // [download] Destination: 003 - Title.mp4
            if line.contains("[download]") {
                let mut progress = YtDlpProgress {
                    status: "downloading".to_string(),
                    message: line.trim().to_string(),
                    percent: 0.0,
                    video_title: None,
                    video_index: None,
                    total_videos: None,
                };

                // Parse percent
                if let Some(pct_pos) = line.find('%') {
                    let start = line[..pct_pos].rfind(|c: char| c.is_whitespace() || c == ']').unwrap_or(0) + 1;
                    if let Ok(pct) = line[start..pct_pos].trim().parse::<f64>() {
                        progress.percent = pct;
                    }
                }

                // Parse "Downloading video X of Y"
                if line.contains("Downloading video") {
                    let parts: Vec<&str> = line.split_whitespace().collect();
                    if let Some(of_idx) = parts.iter().position(|&w| w == "of") {
                        if of_idx > 0 {
                            progress.video_index = parts[of_idx - 1].parse().ok();
                            progress.total_videos = parts.get(of_idx + 1).and_then(|s| s.parse().ok());
                        }
                    }
                }

                // Parse destination filename as title
                if line.contains("Destination:") {
                    if let Some(dest) = line.split("Destination:").nth(1) {
                        let filename = dest.trim();
                        // Remove extension and leading numbers
                        let title = filename
                            .rsplit_once('.')
                            .map(|(name, _)| name)
                            .unwrap_or(filename)
                            .trim_start_matches(|c: char| c.is_ascii_digit() || c == ' ' || c == '-');
                        progress.video_title = Some(title.trim().to_string());
                    }
                }

                let _ = app_clone.emit("ytdlp-progress", progress);
            } else if line.contains("[Merger]") || line.contains("[ExtractAudio]") || line.contains("[FixupM4a]") {
                let _ = app_clone.emit("ytdlp-progress", YtDlpProgress {
                    status: "processing".to_string(),
                    message: "Processando vídeo...".to_string(),
                    percent: 100.0,
                    video_title: None,
                    video_index: None,
                    total_videos: None,
                });
            }
        }
    }

    let status = child.wait().map_err(|e| format!("Erro ao aguardar yt-dlp: {}", e))?;

    // Collect stderr errors
    let stderr_lines = stderr_handle
        .and_then(|h| h.join().ok())
        .unwrap_or_default();

    if status.success() {
        let _ = app.emit("ytdlp-progress", YtDlpProgress {
            status: "done".to_string(),
            message: "Download concluído!".to_string(),
            percent: 100.0,
            video_title: None,
            video_index: None,
            total_videos: None,
        });
        Ok(output_dir)
    } else {
        let error_msg = stderr_lines
            .last()
            .cloned()
            .unwrap_or_else(|| "Erro desconhecido".to_string());
        let _ = app.emit("ytdlp-progress", YtDlpProgress {
            status: "error".to_string(),
            message: error_msg.clone(),
            percent: 0.0,
            video_title: None,
            video_index: None,
            total_videos: None,
        });
        Err(format!("yt-dlp falhou: {}", error_msg))
    }
}
