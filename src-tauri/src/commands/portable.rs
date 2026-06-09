use serde::Serialize;

use crate::portable::PortableState;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PortableInfo {
    pub is_portable: bool,
    pub data_dir: String,
}

#[tauri::command]
pub fn get_portable_info(state: tauri::State<'_, PortableState>) -> PortableInfo {
    PortableInfo {
        is_portable: state.is_portable,
        data_dir: state.data_dir.to_string_lossy().to_string(),
    }
}
