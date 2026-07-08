
use tokio::net::TcpListener;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use reqwest::Client;
use serde::{Deserialize, Serialize};

use crate::db::{self, DbState};
use crate::parser::{ParsedCourse, ParsedSection, ParsedLesson, ParsedResource, ResourceType, Confidence};
const REDIRECT_URI: &str = "http://127.0.0.1:3456";

const DEFAULT_CLIENT_ID: &str = "873301581649-s748k7pv47orvlpl07djm5kiu8gjkqca.apps.googleusercontent.com";
const DEFAULT_CLIENT_SECRET: &str = "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";
#[derive(Serialize, Deserialize, Debug)]
struct TokenResponse {
    access_token: String,
    refresh_token: Option<String>,
    expires_in: u64,
    token_type: String,
}

#[tauri::command]
pub async fn get_google_drive_auth_url(state: tauri::State<'_, DbState>) -> Result<String, String> {
    let (client_id, _) = {
        let conn = state.conn.lock().map_err(|e| e.to_string())?;
        let settings = db::get_all_settings(&conn).map_err(|e| e.to_string())?;
        
        let cid = settings.iter().find(|(k, _)| k == "gdrive_client_id").map(|(_, v)| v.clone()).filter(|v| !v.trim().is_empty()).unwrap_or_else(|| DEFAULT_CLIENT_ID.to_string());
        let sec = settings.iter().find(|(k, _)| k == "gdrive_client_secret").map(|(_, v)| v.clone()).filter(|v| !v.trim().is_empty()).unwrap_or_else(|| DEFAULT_CLIENT_SECRET.to_string());
        (cid, sec)
    };

    let auth_url = format!(
        "https://accounts.google.com/o/oauth2/v2/auth?client_id={}&redirect_uri={}&response_type=code&scope=https://www.googleapis.com/auth/drive.readonly%20https://www.googleapis.com/auth/drive.appdata&access_type=offline&prompt=consent",
        urlencoding::encode(&client_id),
        urlencoding::encode(REDIRECT_URI)
    );

    Ok(auth_url)
}

#[tauri::command]
pub async fn start_google_drive_oauth_server(
    state: tauri::State<'_, DbState>,
) -> Result<String, String> {
    let (client_id, client_secret) = {
        let conn = state.conn.lock().map_err(|e| e.to_string())?;
        let settings = db::get_all_settings(&conn).map_err(|e| e.to_string())?;
        
        let cid = settings.iter().find(|(k, _)| k == "gdrive_client_id").map(|(_, v)| v.clone()).filter(|v| !v.trim().is_empty()).unwrap_or_else(|| DEFAULT_CLIENT_ID.to_string());
        let sec = settings.iter().find(|(k, _)| k == "gdrive_client_secret").map(|(_, v)| v.clone()).filter(|v| !v.trim().is_empty()).unwrap_or_else(|| DEFAULT_CLIENT_SECRET.to_string());
        (cid, sec)
    };

    let listener = TcpListener::bind("127.0.0.1:3456").await.map_err(|e| format!("Porta 3456 ocupada. Tente novamente. {}", e))?;
    
    // Accept only the first connection
    if let Ok((mut stream, _)) = listener.accept().await {
        let mut buffer = [0; 2048];
        if stream.read(&mut buffer).await.is_ok() {
            let request = String::from_utf8_lossy(&buffer[..]);
            if let Some(line) = request.lines().next() {
                if line.starts_with("GET /") {
                    if let Some(code_pos) = line.find("code=") {
                        let code_start = code_pos + 5;
                        let code_end = line[code_start..].find(|c: char| c == '&' || c == ' ').unwrap_or(line.len() - code_start);
                        let code = &line[code_start..code_start + code_end];

                    let client = Client::new();
                    let params = [
                        ("client_id", client_id.as_str()),
                        ("client_secret", client_secret.as_str()),
                        ("code", code),
                        ("grant_type", "authorization_code"),
                        ("redirect_uri", REDIRECT_URI),
                    ];

                    let res = client.post("https://oauth2.googleapis.com/token")
                        .form(&params)
                        .send()
                        .await
                        .map_err(|e| e.to_string())?;

                    if res.status().is_success() {
                        let token_res: TokenResponse = res.json().await.map_err(|e| e.to_string())?;

                        {
                            let conn = state.conn.lock().map_err(|e| e.to_string())?;
                            db::set_setting(&conn, "gdrive_access_token", &token_res.access_token).map_err(|e| e.to_string())?;
                            if let Some(refresh) = token_res.refresh_token {
                                db::set_setting(&conn, "gdrive_refresh_token", &refresh).map_err(|e| e.to_string())?;
                            }
                        }

                        let response = "HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\n\r\n<html><head><style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;background:#09090b;color:#fafafa;text-align:center;}</style></head><body><div><h1 style='color:#3b82f6;'>✅ Conectado com sucesso!</h1><p>O Ckourse já está vinculado ao seu Google Drive.</p><p style='color:#71717a;'>Pode fechar esta janela e voltar para o aplicativo.</p><script>setTimeout(()=>window.close(), 2000);</script></div></body></html>";
                        let _ = stream.write_all(response.as_bytes()).await;
                        
                        return Ok("Autenticado com sucesso".to_string());
                    } else {
                        let err_text = res.text().await.unwrap_or_default();
                        let response = "HTTP/1.1 400 Bad Request\r\nContent-Type: text/html; charset=utf-8\r\n\r\n<html><body><h1>Erro de Autenticação</h1></body></html>";
                        let _ = stream.write_all(response.as_bytes()).await;
                        return Err(format!("Erro da API do Google: {}", err_text));
                    }
                    }
                }
            }
        }
    }

    Err("Nenhum código de autorização recebido".to_string())
}

#[derive(Serialize, Deserialize, Debug)]
struct DriveFile {
    id: String,
    name: String,
    #[serde(rename = "mimeType")]
    mime_type: String,
    size: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
struct DriveListResponse {
    files: Vec<DriveFile>,
}

#[derive(Deserialize, Debug)]
struct DriveFileName {
    name: String,
}

pub(crate) async fn get_valid_token(state: &tauri::State<'_, DbState>) -> Result<String, String> {
    let access_token = {
        let conn = state.conn.lock().map_err(|e| e.to_string())?;
        let settings = db::get_all_settings(&conn).map_err(|e| e.to_string())?;
        settings.into_iter().find(|(k, _)| k == "gdrive_access_token").map(|(_, v)| v)
    };
    access_token.ok_or("Conta não conectada. Conecte o Google Drive nas configurações.".to_string())
}

pub(crate) async fn force_refresh_token(state: &tauri::State<'_, DbState>) -> Result<String, String> {
    let (refresh_token, client_id, client_secret) = {
        let conn = state.conn.lock().map_err(|e| e.to_string())?;
        let settings = db::get_all_settings(&conn).map_err(|e| e.to_string())?;
        
        let rt = settings.iter().find(|(k, _)| k == "gdrive_refresh_token").map(|(_, v)| v.clone()).ok_or("Refresh token ausente")?;
        let cid = settings.iter().find(|(k, _)| k == "gdrive_client_id").map(|(_, v)| v.clone()).filter(|v| !v.trim().is_empty()).unwrap_or_else(|| DEFAULT_CLIENT_ID.to_string());
        let sec = settings.iter().find(|(k, _)| k == "gdrive_client_secret").map(|(_, v)| v.clone()).filter(|v| !v.trim().is_empty()).unwrap_or_else(|| DEFAULT_CLIENT_SECRET.to_string());
        
        (rt, cid, sec)
    };

    let client = Client::new();
    let params = [
        ("client_id", client_id.as_str()),
        ("client_secret", client_secret.as_str()),
        ("refresh_token", refresh_token.as_str()),
        ("grant_type", "refresh_token"),
    ];

    let res = client.post("https://oauth2.googleapis.com/token")
        .form(&params)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status().is_success() {
        let token_res: TokenResponse = res.json().await.map_err(|e| e.to_string())?;
        let new_token = token_res.access_token;
        
        {
            let conn = state.conn.lock().map_err(|e| e.to_string())?;
            db::set_setting(&conn, "gdrive_access_token", &new_token).map_err(|e| e.to_string())?;
        }
        
        Ok(new_token)
    } else {
        Err("Falha ao renovar token. Por favor, reconecte sua conta do Google Drive nas configurações.".to_string())
    }
}

async fn fetch_folder(token: &str, folder_id: &str) -> Result<Vec<DriveFile>, String> {
    let client = Client::new();
    let url = format!(
        "https://www.googleapis.com/drive/v3/files?q='{}'+in+parents+and+trashed=false&fields=files(id,name,mimeType,size)&pageSize=1000&orderBy=name",
        folder_id
    );
    let res = client.get(&url)
        .header("Authorization", format!("Bearer {}", token))
        .send()
        .await
        .map_err(|e| e.to_string())?;
    
    if res.status().is_success() {
        let list: DriveListResponse = res.json().await.map_err(|e| e.to_string())?;
        Ok(list.files)
    } else if res.status() == 401 {
        Err("401".to_string())
    } else {
        let err = res.text().await.unwrap_or_default();
        Err(format!("Drive API Error: {}", err))
    }
}

async fn fetch_folder_with_retry(state: &tauri::State<'_, DbState>, folder_id: &str) -> Result<Vec<DriveFile>, String> {
    let mut token = get_valid_token(state).await?;
    match fetch_folder(&token, folder_id).await {
        Ok(files) => Ok(files),
        Err(e) if e == "401" => {
            token = force_refresh_token(state).await?;
            fetch_folder(&token, folder_id).await.map_err(|e| if e == "401" { "Sessão expirada. Reconecte.".to_string() } else { e })
        },
        Err(e) => Err(e)
    }
}

async fn get_folder_name(state: &tauri::State<'_, DbState>, folder_id: &str) -> Result<String, String> {
    let mut token = get_valid_token(state).await?;
    
    let client = Client::new();
    let url = format!("https://www.googleapis.com/drive/v3/files/{}?fields=name", folder_id);
    
    let mut res = client.get(&url)
        .header("Authorization", format!("Bearer {}", token))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status() == 401 {
        token = force_refresh_token(state).await?;
        res = client.get(&url)
            .header("Authorization", format!("Bearer {}", token))
            .send()
            .await
            .map_err(|e| e.to_string())?;
    }

    if res.status().is_success() {
        let file: DriveFileName = res.json().await.map_err(|e| e.to_string())?;
        Ok(file.name)
    } else {
        Err("Não foi possível acessar a pasta base. Verifique se o link está correto.".to_string())
    }
}

fn extract_folder_id(url: &str) -> Option<String> {
    if let Some(idx) = url.find("/folders/") {
        let start = idx + 9;
        let end = url[start..].find('?').map(|i| start + i).unwrap_or(url.len());
        Some(url[start..end].to_string())
    } else {
        None
    }
}

fn is_video(mime: &str, name: &str) -> bool {
    mime.starts_with("video/") || name.ends_with(".mp4") || name.ends_with(".mkv") || name.ends_with(".webm") || name.ends_with(".avi") || name.ends_with(".ts")
}

#[tauri::command]
pub async fn scan_google_drive(
    folder_url: String,
    state: tauri::State<'_, DbState>,
) -> Result<ParsedCourse, String> {
    let folder_id = extract_folder_id(&folder_url).ok_or("URL do Google Drive inválida. Deve conter /folders/ID")?;
    
    let course_title = get_folder_name(&state, &folder_id).await?;
    let root_files = fetch_folder_with_retry(&state, &folder_id).await?;
    
    let mut sections = Vec::new();
    let mut course_resources = Vec::new();
    let mut total_video_count = 0;
    
    let mut root_lessons = Vec::new();
    let mut order_counter = 1;
    let mut subfolders = Vec::new();

    for file in root_files {
        if file.mime_type == "application/vnd.google-apps.folder" {
            subfolders.push(file);
        } else if is_video(&file.mime_type, &file.name) {
            root_lessons.push(ParsedLesson {
                title: file.name.replace(".mp4", "").replace(".mkv", ""),
                order: order_counter,
                video_path: format!("gdrive://{}", file.id),
                duration_secs: 0,
                subtitles: vec![],
                resources: vec![],
            });
            order_counter += 1;
            total_video_count += 1;
        } else {
            course_resources.push(ParsedResource {
                title: file.name.clone(),
                path: format!("gdrive://{}", file.id),
                resource_type: ResourceType::Document,
            });
        }
    }

    if !root_lessons.is_empty() {
        sections.push(ParsedSection {
            title: "Módulo Principal".to_string(),
            order: 1,
            lessons: root_lessons,
        });
    }

    let mut section_order = if sections.is_empty() { 1 } else { 2 };

    for folder in subfolders {
        let items = fetch_folder_with_retry(&state, &folder.id).await?;
        let mut lessons = Vec::new();
        let mut lesson_order = 1;
        
        for item in items {
            if is_video(&item.mime_type, &item.name) {
                lessons.push(ParsedLesson {
                    title: item.name.replace(".mp4", "").replace(".mkv", ""),
                    order: lesson_order,
                    video_path: format!("gdrive://{}", item.id),
                    duration_secs: 0,
                    subtitles: vec![],
                    resources: vec![],
                });
                lesson_order += 1;
                total_video_count += 1;
            }
        }
        
        if !lessons.is_empty() {
            sections.push(ParsedSection {
                title: folder.name,
                order: section_order,
                lessons,
            });
            section_order += 1;
        }
    }

    if sections.is_empty() {
        return Err("Nenhum vídeo encontrado nesta pasta ou subpastas.".to_string());
    }

    Ok(ParsedCourse {
        title: course_title,
        description: None,
        thumbnail_path: None,
        sections,
        resources: course_resources,
        confidence: Confidence::High,
        confidence_reasons: vec!["Google Drive parsing".to_string()],
        total_video_count,
        folder_path: folder_url,
    })
}

#[derive(Deserialize)]
struct AppDataFile {
    id: String,
    #[serde(rename = "modifiedTime")]
    modified_time: Option<String>,
}

#[derive(Deserialize)]
struct AppDataList {
    files: Vec<AppDataFile>,
}

#[derive(Serialize)]
pub struct SyncStatus {
    pub needs_sync: bool,
    pub drive_modified_time: Option<String>,
}

#[tauri::command]
pub async fn check_drive_sync_status(
    state: tauri::State<'_, DbState>,
) -> Result<SyncStatus, String> {
    let mut token = get_valid_token(&state).await?;
    let client = Client::new();

    let search_url = "https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='ckourse.db'&fields=files(id,modifiedTime)";
    let mut search_res = client.get(search_url)
        .header("Authorization", format!("Bearer {}", token))
        .send().await.map_err(|e| e.to_string())?;

    if search_res.status() == 401 {
        token = force_refresh_token(&state).await?;
        search_res = client.get(search_url)
            .header("Authorization", format!("Bearer {}", token))
            .send().await.map_err(|e| e.to_string())?;
    }

    if !search_res.status().is_success() {
        return Err(format!("Erro ao buscar status: {}", search_res.text().await.unwrap_or_default()));
    }
    
    let search_data: AppDataList = search_res.json().await.map_err(|e| e.to_string())?;
    let drive_file = search_data.files.first();
    
    let drive_modified_time = drive_file.and_then(|f| f.modified_time.clone());

    let local_last_sync = {
        let conn = state.conn.lock().map_err(|e| e.to_string())?;
        let settings = db::get_all_settings(&conn).unwrap_or_default();
        settings.into_iter().find(|(k, _)| k == "gdrive_last_sync_time").map(|(_, v)| v)
    };

    let needs_sync = match (&drive_modified_time, &local_last_sync) {
        (Some(drive_time), Some(local_time)) => drive_time != local_time,
        (Some(_), None) => true, // cloud has data, we never synced
        (None, _) => false, // cloud has no data
    };

    Ok(SyncStatus {
        needs_sync,
        drive_modified_time,
    })
}

#[tauri::command]
pub async fn backup_database_to_drive(
    portable_state: tauri::State<'_, crate::portable::PortableState>,
    state: tauri::State<'_, DbState>,
) -> Result<String, String> {
    let mut token = get_valid_token(&state).await?;
    let client = Client::new();

    let db_path = portable_state.data_dir.join("ckourse.db");

    // Force WAL checkpoint so all data is written to the .db file
    {
        let _conn = state.conn.lock().map_err(|e| e.to_string())?;
        _conn.execute_batch("PRAGMA wal_checkpoint(TRUNCATE);").map_err(|e| format!("Erro ao sincronizar banco: {}", e))?;
    }

    let file_bytes = tokio::fs::read(&db_path).await.map_err(|e| format!("Erro ao ler banco local: {}", e))?;

    let search_url = "https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='ckourse.db'";
    let mut search_res = client.get(search_url)
        .header("Authorization", format!("Bearer {}", token))
        .send().await.map_err(|e| e.to_string())?;

    if search_res.status() == 401 {
        token = force_refresh_token(&state).await?;
        search_res = client.get(search_url)
            .header("Authorization", format!("Bearer {}", token))
            .send().await.map_err(|e| e.to_string())?;
    }

    if !search_res.status().is_success() {
        return Err(format!("Erro ao buscar backup: {}", search_res.text().await.unwrap_or_default()));
    }
    
    let search_data: AppDataList = search_res.json().await.map_err(|e| e.to_string())?;
    let existing_file_id = search_data.files.first().map(|f| f.id.clone());

    if let Some(file_id) = existing_file_id {
        let upload_url = format!("https://www.googleapis.com/upload/drive/v3/files/{}?uploadType=media", file_id);
        let res = client.patch(&upload_url)
            .header("Authorization", format!("Bearer {}", token))
            .header("Content-Type", "application/octet-stream")
            .body(file_bytes)
            .send().await.map_err(|e| e.to_string())?;
        
        if res.status().is_success() {
            Ok("Backup atualizado com sucesso!".to_string())
        } else {
            Err(format!("Erro ao atualizar backup: {}", res.text().await.unwrap_or_default()))
        }
    } else {
        let metadata_url = "https://www.googleapis.com/drive/v3/files";
        let metadata_res = client.post(metadata_url)
            .header("Authorization", format!("Bearer {}", token))
            .json(&serde_json::json!({
                "name": "ckourse.db",
                "parents": ["appDataFolder"]
            }))
            .send().await.map_err(|e| e.to_string())?;

        if !metadata_res.status().is_success() {
            return Err(format!("Erro ao criar metadados do backup: {}", metadata_res.text().await.unwrap_or_default()));
        }

        let metadata_data: AppDataFile = metadata_res.json().await.map_err(|e| e.to_string())?;
        
        let upload_url = format!("https://www.googleapis.com/upload/drive/v3/files/{}?uploadType=media", metadata_data.id);
        let res = client.patch(&upload_url)
            .header("Authorization", format!("Bearer {}", token))
            .header("Content-Type", "application/octet-stream")
            .body(file_bytes)
            .send().await.map_err(|e| e.to_string())?;
        
        if res.status().is_success() {
            // Update local last_sync_time if we get the modifiedTime, but patch doesn't return it easily unless fields are requested.
            // We can just rely on the next startup check.
            Ok("Backup criado com sucesso!".to_string())
        } else {
            Err(format!("Erro ao fazer upload do backup: {}", res.text().await.unwrap_or_default()))
        }
    }
}

#[tauri::command]
pub async fn restore_database_from_drive(
    portable_state: tauri::State<'_, crate::portable::PortableState>,
    state: tauri::State<'_, DbState>,
) -> Result<String, String> {
    let mut token = get_valid_token(&state).await?;
    let client = Client::new();

    let search_url = "https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='ckourse.db'";
    let mut search_res = client.get(search_url)
        .header("Authorization", format!("Bearer {}", token))
        .send().await.map_err(|e| e.to_string())?;

    if search_res.status() == 401 {
        token = force_refresh_token(&state).await?;
        search_res = client.get(search_url)
            .header("Authorization", format!("Bearer {}", token))
            .send().await.map_err(|e| e.to_string())?;
    }

    if !search_res.status().is_success() {
        return Err(format!("Erro ao buscar backup: {}", search_res.text().await.unwrap_or_default()));
    }
    
    let search_data: AppDataList = search_res.json().await.map_err(|e| e.to_string())?;
    let existing_file_id = match search_data.files.first() {
        Some(f) => f.id.clone(),
        None => return Err("Nenhum backup encontrado na nuvem.".to_string()),
    };

    let download_url = format!("https://www.googleapis.com/drive/v3/files/{}?alt=media", existing_file_id);
    let mut download_res = client.get(&download_url)
        .header("Authorization", format!("Bearer {}", token))
        .send().await.map_err(|e| e.to_string())?;

    if download_res.status() == 401 {
        token = force_refresh_token(&state).await?;
        download_res = client.get(&download_url)
            .header("Authorization", format!("Bearer {}", token))
            .send().await.map_err(|e| e.to_string())?;
    }

    if !download_res.status().is_success() {
        return Err(format!("Erro ao fazer download do backup: {}", download_res.text().await.unwrap_or_default()));
    }

    let bytes = download_res.bytes().await.map_err(|e| e.to_string())?;

    let db_path = portable_state.data_dir.join("ckourse.db");

    // SAFETY BACKUP: Ensure WAL is flushed and make a copy of the current database before overwriting it
    {
        if let Ok(mut _conn) = state.conn.lock() {
            let _ = _conn.execute_batch("PRAGMA wal_checkpoint(TRUNCATE);");
        }
    }
    let safety_backup_path = portable_state.data_dir.join("ckourse_safety_backup.db");
    let _ = std::fs::copy(&db_path, &safety_backup_path);

    let temp_db_path = portable_state.data_dir.join("ckourse_restored.db");
    std::fs::write(&temp_db_path, bytes).map_err(|e| format!("Erro ao salvar banco baixado: {}", e))?;

    {
        let _conn = state.conn.lock().map_err(|e| e.to_string())?;
        
        // Ensure the downloaded database is intact and attach it
        _conn.execute("ATTACH DATABASE ?1 AS remote", rusqlite::params![temp_db_path.to_str().unwrap()])
            .map_err(|e| format!("Erro ao anexar banco remoto: {}", e))?;

        // SMART MERGE LOGIC
        // 1. Merge Courses (update local if remote is newer)
        _conn.execute_batch("
            UPDATE courses SET
                title = remote.courses.title,
                author = remote.courses.author,
                accent_color = remote.courses.accent_color,
                category = remote.courses.category,
                description = remote.courses.description,
                thumbnail_path = remote.courses.thumbnail_path,
                folder_path = remote.courses.folder_path,
                last_watched = remote.courses.last_watched,
                updated_at = remote.courses.updated_at
            FROM remote.courses
            WHERE courses.id = remote.courses.id AND remote.courses.updated_at > courses.updated_at;
        ").map_err(|e| format!("Erro ao mesclar courses: {}", e))?;

        // 2. Insert Missing Courses
        _conn.execute_batch("
            INSERT OR IGNORE INTO courses (id, title, author, accent_color, category, description, thumbnail_path, folder_path, last_watched, created_at, updated_at)
            SELECT id, title, author, accent_color, category, description, thumbnail_path, folder_path, last_watched, created_at, updated_at
            FROM remote.courses;
        ").map_err(|e| format!("Erro ao inserir novos courses: {}", e))?;

        // 3. Merge Sections (Insert Missing)
        _conn.execute_batch("
            INSERT OR IGNORE INTO sections (id, course_id, title, sort_order)
            SELECT id, course_id, title, sort_order FROM remote.sections;
        ").map_err(|e| format!("Erro ao inserir novas sections: {}", e))?;

        // 4. Merge Lessons (Update if remote is newer)
        // Check if remote has updated_at column first (in case it's an old backup without it)
        let has_updated_at: bool = _conn.query_row(
            "SELECT COUNT(*) > 0 FROM pragma_table_info('lessons', 'remote') WHERE name = 'updated_at'",
            [],
            |row| row.get(0),
        ).unwrap_or(false);

        if has_updated_at {
            _conn.execute_batch("
                UPDATE lessons SET
                    completed = remote.lessons.completed,
                    is_last_watched = remote.lessons.is_last_watched,
                    duration = remote.lessons.duration,
                    last_position = remote.lessons.last_position,
                    updated_at = remote.lessons.updated_at
                FROM remote.lessons
                WHERE lessons.id = remote.lessons.id AND remote.lessons.updated_at > lessons.updated_at;
            ").map_err(|e| format!("Erro ao mesclar lessons: {}", e))?;
        }

        // 5. Insert Missing Lessons
        if has_updated_at {
            _conn.execute_batch("
                INSERT OR IGNORE INTO lessons (id, section_id, title, video_path, sort_order, completed, is_last_watched, duration, last_position, updated_at)
                SELECT id, section_id, title, video_path, sort_order, completed, is_last_watched, duration, last_position, updated_at
                FROM remote.lessons;
            ").map_err(|e| format!("Erro ao inserir novas lessons (com updated_at): {}", e))?;
        } else {
            _conn.execute_batch("
                INSERT OR IGNORE INTO lessons (id, section_id, title, video_path, sort_order, completed, is_last_watched, duration, last_position)
                SELECT id, section_id, title, video_path, sort_order, completed, is_last_watched, duration, last_position
                FROM remote.lessons;
            ").map_err(|e| format!("Erro ao inserir novas lessons (sem updated_at): {}", e))?;
        }

        // 6. Merge Notes (Update if remote is newer)
        _conn.execute_batch("
            UPDATE notes SET
                content = remote.notes.content,
                updated_at = remote.notes.updated_at
            FROM remote.notes
            WHERE notes.id = remote.notes.id AND remote.notes.updated_at > notes.updated_at;
        ").map_err(|e| format!("Erro ao mesclar notes: {}", e))?;

        // 7. Insert Missing Notes
        _conn.execute_batch("
            INSERT OR IGNORE INTO notes (id, course_id, lesson_id, lesson_title, content, created_at, updated_at)
            SELECT id, course_id, lesson_id, lesson_title, content, created_at, updated_at FROM remote.notes;
        ").map_err(|e| format!("Erro ao inserir novas notes: {}", e))?;

        // 8. Additive Sync: Bookmarks, Favorites, Activity Log, Subtitles, Resources, Tags
        _conn.execute_batch("
            INSERT OR IGNORE INTO bookmarks (id, course_id, created_at) SELECT id, course_id, created_at FROM remote.bookmarks;
            INSERT OR IGNORE INTO favorites (id, lesson_id, created_at) SELECT id, lesson_id, created_at FROM remote.favorites;
            INSERT OR IGNORE INTO activity_log (date) SELECT date FROM remote.activity_log;
            INSERT OR IGNORE INTO subtitles (id, lesson_id, path, language, is_positional_match) SELECT id, lesson_id, path, language, is_positional_match FROM remote.subtitles;
            INSERT OR IGNORE INTO resources (id, course_id, lesson_id, title, path, resource_type) SELECT id, course_id, lesson_id, title, path, resource_type FROM remote.resources;
            INSERT OR IGNORE INTO course_tags (id, course_id, tag) SELECT id, course_id, tag FROM remote.course_tags;
        ").map_err(|e| format!("Erro ao inserir entidades aditivas: {}", e))?;

        // Finally, detach the remote database
        let _ = _conn.execute_batch("DETACH DATABASE remote;");
    }

    let _ = std::fs::remove_file(temp_db_path);

    Ok("Backup restaurado com sucesso! Atualize o app para ver os dados.".to_string())
}
