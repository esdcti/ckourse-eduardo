use std::path::PathBuf;
use std::sync::Mutex;

/// State that tracks the data directory mode.
pub struct PortableState {
    pub is_portable: bool,
    pub data_dir: PathBuf,
    pub custom_data_dir: Mutex<Option<String>>,
}

/// Check if a `.portable` marker file exists next to the executable.
pub fn is_portable() -> bool {
    get_portable_dir().is_some()
}

/// Returns the portable data directory if the app is running in portable mode.
pub fn get_portable_dir() -> Option<PathBuf> {
    let exe_path = std::env::current_exe().ok()?;
    let exe_dir = exe_path.parent()?;

    if exe_dir.join(".portable").exists() {
        let data_dir = exe_dir.join("data");
        Some(data_dir)
    } else {
        None
    }
}

/// Resolve the data directory with priority:
/// 1. Portable mode (.portable file next to exe)
/// 2. Custom path from config file
/// 3. Default AppData directory
pub fn resolve_data_dir(app_data_dir: &PathBuf) -> (PathBuf, bool, Option<String>) {
    // Priority 1: Portable mode
    if let Some(portable_dir) = get_portable_dir() {
        return (portable_dir, true, None);
    }

    // Priority 2: Custom data dir saved in a simple config next to the default AppData
    let config_file = app_data_dir.join("data_dir.txt");
    if config_file.exists() {
        if let Ok(custom_path) = std::fs::read_to_string(&config_file) {
            let custom_path = custom_path.trim().to_string();
            if !custom_path.is_empty() {
                let custom_dir = PathBuf::from(&custom_path);
                // Verify the path is accessible
                if custom_dir.exists() || std::fs::create_dir_all(&custom_dir).is_ok() {
                    return (custom_dir, false, Some(custom_path));
                }
            }
        }
    }

    // Priority 3: Default AppData
    (app_data_dir.clone(), false, None)
}

/// Save the custom data dir path to config. Empty string means "use default".
pub fn save_custom_data_dir(app_data_dir: &PathBuf, path: &str) -> Result<(), String> {
    std::fs::create_dir_all(app_data_dir).map_err(|e| e.to_string())?;
    let config_file = app_data_dir.join("data_dir.txt");
    if path.is_empty() {
        // Remove custom config to go back to default
        let _ = std::fs::remove_file(&config_file);
    } else {
        // Validate path is writable
        let dir = PathBuf::from(path);
        std::fs::create_dir_all(&dir).map_err(|e| format!("Não foi possível criar a pasta: {}", e))?;
        std::fs::write(&config_file, path).map_err(|e| e.to_string())?;
    }
    Ok(())
}
