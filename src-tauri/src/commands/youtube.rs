use std::path::Path;
use std::process::Command;

use crate::db::DbState;

#[derive(serde::Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct YtDlpStatus {
    pub available: bool,
    pub version: Option<String>,
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
    url: String,
    output_dir: String,
) -> Result<String, String> {
    let output_path = Path::new(&output_dir);
    std::fs::create_dir_all(output_path).map_err(|e| format!("Erro ao criar pasta: {}", e))?;

    let output_template = output_path
        .join("%(playlist_index)03d - %(title)s.%(ext)s")
        .to_string_lossy()
        .to_string();

    let result = Command::new("yt-dlp")
        .args([
            "--yes-playlist",
            "-f",
            "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
            "--merge-output-format",
            "mp4",
            "--write-subs",
            "--sub-langs",
            "all",
            "--convert-subs",
            "vtt",
            "--write-thumbnail",
            "--output",
            &output_template,
            &url,
        ])
        .output()
        .map_err(|e| format!("Erro ao executar yt-dlp: {}", e))?;

    if result.status.success() {
        Ok(output_dir)
    } else {
        let stderr = String::from_utf8_lossy(&result.stderr);
        Err(format!(
            "yt-dlp falhou: {}",
            stderr.lines().last().unwrap_or("erro desconhecido")
        ))
    }
}
