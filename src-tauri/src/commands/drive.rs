
use tokio::net::TcpListener;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use reqwest::Client;
use serde::{Deserialize, Serialize};

use crate::db::{self, DbState};
use crate::parser::{ParsedCourse, ParsedSection, ParsedLesson, ParsedResource, ResourceType, Confidence};
const REDIRECT_URI: &str = "http://127.0.0.1:3456";

#[derive(Serialize, Deserialize, Debug)]
struct TokenResponse {
    access_token: String,
    refresh_token: Option<String>,
    expires_in: u64,
    token_type: String,
}

#[tauri::command]
pub async fn start_google_drive_oauth(
    state: tauri::State<'_, DbState>,
) -> Result<String, String> {
    let (client_id, client_secret) = {
        let conn = state.conn.lock().map_err(|e| e.to_string())?;
        let settings = db::get_all_settings(&conn).map_err(|e| e.to_string())?;
        
        let cid = settings.iter().find(|(k, _)| k == "gdrive_client_id").map(|(_, v)| v.clone()).ok_or("Client ID não configurado nas Configurações.")?;
        let sec = settings.iter().find(|(k, _)| k == "gdrive_client_secret").map(|(_, v)| v.clone()).ok_or("Client Secret não configurado nas Configurações.")?;
        (cid, sec)
    };

    if client_id.trim().is_empty() || client_secret.trim().is_empty() {
        return Err("Preencha o Client ID e o Client Secret nas configurações do aplicativo primeiro.".to_string());
    }

    let auth_url = format!(
        "https://accounts.google.com/o/oauth2/v2/auth?client_id={}&redirect_uri={}&response_type=code&scope=https://www.googleapis.com/auth/drive.readonly%20https://www.googleapis.com/auth/drive.appdata&access_type=offline&prompt=consent",
        urlencoding::encode(&client_id),
        urlencoding::encode(REDIRECT_URI)
    );

    tauri_plugin_opener::open_url(auth_url, None::<&str>).map_err(|e| e.to_string())?;

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
        let cid = settings.iter().find(|(k, _)| k == "gdrive_client_id").map(|(_, v)| v.clone()).ok_or("Client ID ausente")?;
        let sec = settings.iter().find(|(k, _)| k == "gdrive_client_secret").map(|(_, v)| v.clone()).ok_or("Client Secret ausente")?;
        
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
}

#[derive(Deserialize)]
struct AppDataList {
    files: Vec<AppDataFile>,
}

#[tauri::command]
pub async fn backup_database_to_drive(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, DbState>,
) -> Result<String, String> {
    let mut token = get_valid_token(&state).await?;
    let client = Client::new();

    let portable_info = crate::portable::get_portable_info(&app_handle);
    let db_path = portable_info.data_dir.join("ckourse.db");

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
            Ok("Backup criado com sucesso!".to_string())
        } else {
            Err(format!("Erro ao fazer upload do backup: {}", res.text().await.unwrap_or_default()))
        }
    }
}

#[tauri::command]
pub async fn restore_database_from_drive(
    app_handle: tauri::AppHandle,
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

    let portable_info = crate::portable::get_portable_info(&app_handle);
    let db_path = portable_info.data_dir.join("ckourse.db");

    let _conn = state.conn.lock().map_err(|e| e.to_string())?;
    tokio::fs::write(&db_path, bytes).await.map_err(|e| format!("Erro ao salvar banco local: {}", e))?;

    Ok("Backup restaurado com sucesso! Reinicie o aplicativo.".to_string())
}
