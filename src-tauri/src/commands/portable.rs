use serde::Serialize;

use crate::portable::PortableState;
use crate::AppDataDir;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PortableInfo {
    pub is_portable: bool,
    pub data_dir: String,
    pub custom_data_dir: Option<String>,
}

#[tauri::command]
pub fn get_portable_info(state: tauri::State<'_, PortableState>) -> PortableInfo {
    let custom = state.custom_data_dir.lock().ok().and_then(|g| g.clone());
    PortableInfo {
        is_portable: state.is_portable,
        data_dir: state.data_dir.to_string_lossy().to_string(),
        custom_data_dir: custom,
    }
}

#[tauri::command]
pub fn set_custom_data_dir(
    app_data: tauri::State<'_, AppDataDir>,
    portable_state: tauri::State<'_, PortableState>,
    path: String,
) -> Result<String, String> {
    // Don't allow changing if in portable mode
    if portable_state.is_portable {
        return Err("Não é possível alterar o local do banco em modo portátil".to_string());
    }

    crate::portable::save_custom_data_dir(&app_data.0, &path)?;

    // Update the state for the current session info
    if let Ok(mut guard) = portable_state.custom_data_dir.lock() {
        if path.is_empty() {
            *guard = None;
        } else {
            *guard = Some(path.clone());
        }
    }

    Ok("Reinicie o app para aplicar a mudança.".to_string())
}
