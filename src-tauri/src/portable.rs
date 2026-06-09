use std::path::PathBuf;

/// State that tracks whether the app is running in portable mode.
pub struct PortableState {
    pub is_portable: bool,
    pub data_dir: PathBuf,
}

/// Check if a `.portable` marker file exists next to the executable.
/// If it does, the app runs in portable mode and stores data in a `data/`
/// subdirectory next to the executable.
pub fn is_portable() -> bool {
    get_portable_dir().is_some()
}

/// Returns the portable data directory if the app is running in portable mode.
/// Portable mode is activated by placing a `.portable` file next to the executable.
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
