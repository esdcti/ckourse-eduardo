use std::collections::VecDeque;
use std::sync::{Mutex, OnceLock};
use std::time::{SystemTime, UNIX_EPOCH};

/// Keep a bounded in-memory ring buffer of recent diagnostic lines so they can
/// be surfaced inside the app (useful on mobile where `adb`/USB is unavailable).
const MAX_LINES: usize = 300;

fn buffer() -> &'static Mutex<VecDeque<String>> {
    static BUF: OnceLock<Mutex<VecDeque<String>>> = OnceLock::new();
    BUF.get_or_init(|| Mutex::new(VecDeque::new()))
}

fn timestamp_ms() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis())
        .unwrap_or(0)
}

/// Record a diagnostic line. Also mirrors to stderr (visible via `adb logcat`).
pub fn log(msg: impl Into<String>) {
    let line = format!("[{}] {}", timestamp_ms(), msg.into());
    eprintln!("{}", line);
    if let Ok(mut b) = buffer().lock() {
        if b.len() >= MAX_LINES {
            b.pop_front();
        }
        b.push_back(line);
    }
}

fn snapshot() -> Vec<String> {
    buffer()
        .lock()
        .map(|b| b.iter().cloned().collect())
        .unwrap_or_default()
}

fn clear() {
    if let Ok(mut b) = buffer().lock() {
        b.clear();
    }
}

/// Returns the recent diagnostic lines for display/copy in the frontend.
#[tauri::command]
pub fn get_debug_log() -> Vec<String> {
    snapshot()
}

/// Clears the diagnostic buffer.
#[tauri::command]
pub fn clear_debug_log() {
    clear();
}
