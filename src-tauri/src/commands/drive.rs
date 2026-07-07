use tauri::Manager;
use tokio::net::TcpListener;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use reqwest::Client;
use serde::{Deserialize, Serialize};

use crate::db::{self, DbState};

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
        "https://accounts.google.com/o/oauth2/v2/auth?client_id={}&redirect_uri={}&response_type=code&scope=https://www.googleapis.com/auth/drive.readonly&access_type=offline&prompt=consent",
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
                if line.starts_with("GET /?code=") {
                    let code_start = line.find("code=").unwrap() + 5;
                    let code_end = line[code_start..].find(" ").unwrap_or(line.len() - code_start);
                    let code = &line[code_start..code_start + code_end];
                    let code = code.split('&').next().unwrap_or(code);

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

                        let conn = state.conn.lock().map_err(|e| e.to_string())?;
                        db::set_setting(&conn, "gdrive_access_token", &token_res.access_token).map_err(|e| e.to_string())?;
                        if let Some(refresh) = token_res.refresh_token {
                            db::set_setting(&conn, "gdrive_refresh_token", &refresh).map_err(|e| e.to_string())?;
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

    Err("Nenhum código de autorização recebido".to_string())
}
