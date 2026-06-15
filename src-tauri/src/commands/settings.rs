use tauri::Manager;

use crate::db::{self, DbState};

#[tauri::command]
pub fn get_all_settings(state: tauri::State<'_, DbState>) -> Result<Vec<(String, String)>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    db::get_all_settings(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_setting(
    state: tauri::State<'_, DbState>,
    key: String,
    value: String,
) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    db::set_setting(&conn, &key, &value).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_library_stats(
    state: tauri::State<'_, DbState>,
    app: tauri::AppHandle,
) -> Result<db::LibraryStats, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let app_data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let db_path = app_data_dir.join("ckourse.db");
    db::get_library_stats(&conn, &db_path.to_string_lossy()).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_course_tags(
    state: tauri::State<'_, DbState>,
    course_id: i64,
) -> Result<Vec<String>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT tag FROM course_tags WHERE course_id = ?1 ORDER BY tag")
        .map_err(|e| e.to_string())?;
    let tags = stmt
        .query_map(rusqlite::params![course_id], |row| row.get::<_, String>(0))
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();
    Ok(tags)
}

#[tauri::command]
pub fn set_course_tags(
    state: tauri::State<'_, DbState>,
    course_id: i64,
    tags: Vec<String>,
) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM course_tags WHERE course_id = ?1", rusqlite::params![course_id])
        .map_err(|e| e.to_string())?;
    for tag in &tags {
        let trimmed = tag.trim();
        if !trimmed.is_empty() {
            conn.execute(
                "INSERT OR IGNORE INTO course_tags (course_id, tag) VALUES (?1, ?2)",
                rusqlite::params![course_id, trimmed],
            )
            .map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

#[tauri::command]
pub fn get_all_tags(state: tauri::State<'_, DbState>) -> Result<Vec<String>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT DISTINCT tag FROM course_tags ORDER BY tag")
        .map_err(|e| e.to_string())?;
    let tags = stmt
        .query_map([], |row| row.get::<_, String>(0))
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();
    Ok(tags)
}
