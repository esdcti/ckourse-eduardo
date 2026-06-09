mod commands;
mod db;
mod parser;
mod portable;
mod subtitle;
mod video_protocol;

use db::DbState;
use tauri::Manager;
use std::path::PathBuf;

/// Stores the default app data directory for reference when changing custom paths.
pub struct AppDataDir(pub PathBuf);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .register_asynchronous_uri_scheme_protocol(video_protocol::SCHEME, video_protocol::handle)
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .setup(|app| {
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("failed to resolve app data dir");

            let (data_dir, is_portable, custom_dir) = portable::resolve_data_dir(&app_data_dir);

            let conn = db::init_db(&data_dir).expect("failed to initialize database");

            app.manage(DbState {
                conn: std::sync::Mutex::new(conn),
            });

            app.manage(portable::PortableState {
                is_portable,
                data_dir,
                custom_data_dir: std::sync::Mutex::new(custom_dir),
            });

            // Store the app_data_dir for later use (changing custom dir)
            app.manage(AppDataDir(app_data_dir));

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::parse_course_folder,
            commands::import_course,
            commands::get_courses,
            commands::get_course,
            commands::get_course_detail,
            commands::toggle_lesson_completed,
            commands::set_last_watched,
            commands::save_lesson_position,
            commands::update_course,
            commands::reset_course_progress,
            commands::delete_course,
            commands::get_all_notes,
            commands::get_course_notes,
            commands::add_note,
            commands::update_note,
            commands::delete_note,
            commands::update_lesson_duration,
            commands::get_lesson_subtitles,
            commands::get_subtitle_vtt,
            commands::toggle_bookmark,
            commands::toggle_favorite,
            commands::get_bookmarked_courses,
            commands::get_all_favorites,
            commands::get_dashboard_stats,
            commands::get_progress_data,
            commands::delete_all_data,
            commands::get_all_settings,
            commands::set_setting,
            commands::get_library_stats,
            commands::get_custom_categories,
            commands::add_custom_category,
            commands::delete_custom_category,
            commands::search_content,
            commands::get_portable_info,
            commands::set_custom_data_dir,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
