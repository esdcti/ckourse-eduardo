use std::sync::atomic::{AtomicU16, Ordering};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::{TcpListener, TcpStream};
use reqwest::Client;
use tauri::Manager;

use crate::db::DbState;
use crate::commands::drive::get_valid_token;

static PROXY_PORT: AtomicU16 = AtomicU16::new(0);

pub async fn start_proxy(app_handle: tauri::AppHandle) {
    let listener = match TcpListener::bind("127.0.0.1:0").await {
        Ok(l) => l,
        Err(e) => {
            crate::debug_log::log(format!("TCP Proxy: Failed to bind port: {}", e));
            return;
        }
    };
    
    let port = listener.local_addr().unwrap().port();
    PROXY_PORT.store(port, Ordering::SeqCst);
    crate::debug_log::log(format!("TCP Proxy started on port {}", port));

    let client = Client::new();

    loop {
        if let Ok((stream, _)) = listener.accept().await {
            let app = app_handle.clone();
            let c = client.clone();
            tokio::spawn(async move {
                if let Err(e) = handle_connection(stream, c, app).await {
                    crate::debug_log::log(format!("Proxy connection error: {}", e));
                }
            });
        }
    }
}

#[tauri::command]
pub fn get_proxy_port() -> u16 {
    PROXY_PORT.load(Ordering::SeqCst)
}

async fn handle_connection(mut stream: TcpStream, client: Client, app: tauri::AppHandle) -> Result<(), String> {
    let mut buf = [0u8; 4096];
    let n = stream.read(&mut buf).await.map_err(|e| e.to_string())?;
    if n == 0 { return Ok(()); }
    
    let request_str = String::from_utf8_lossy(&buf[..n]);
    
    let first_line = request_str.lines().next().unwrap_or("");
    if !first_line.starts_with("GET") {
        return Ok(());
    }

    let url_part = first_line.split_whitespace().nth(1).unwrap_or("");
    let file_id = if let Some(idx) = url_part.find("id=") {
        url_part[idx+3..].split('&').next().unwrap_or("")
    } else {
        return Err("No id parameter found in URL".into());
    };

    if file_id.is_empty() {
        return Err("Empty file id".into());
    }

    let mut range_header = None;
    for line in request_str.lines() {
        let lower = line.to_lowercase();
        if lower.starts_with("range:") {
            range_header = Some(line["range:".len()..].trim().to_string());
            break;
        }
    }

    let state = app.state::<DbState>();
    let mut token = get_valid_token(&state).await?;
    
    let url = format!("https://www.googleapis.com/drive/v3/files/{}?alt=media", file_id);
    
    let mut req = client.get(&url)
        .header(reqwest::header::AUTHORIZATION, format!("Bearer {}", token));
        
    if let Some(r) = &range_header {
        req = req.header(reqwest::header::RANGE, r);
    }
    
    let mut resp = req.send().await.map_err(|e| e.to_string())?;
    
    if resp.status() == reqwest::StatusCode::UNAUTHORIZED {
        // Just call get_valid_token again (or it might have been force_refresh_token in original logic, but wait)
        // If we want to force refresh:
        token = crate::commands::drive::force_refresh_token(&state).await?;
        
        let mut req = client.get(&url)
            .header(reqwest::header::AUTHORIZATION, format!("Bearer {}", token));
        if let Some(r) = &range_header {
            req = req.header(reqwest::header::RANGE, r);
        }
        resp = req.send().await.map_err(|e| e.to_string())?;
    }
    
    if !resp.status().is_success() && resp.status() != reqwest::StatusCode::PARTIAL_CONTENT {
        let err_text = resp.text().await.unwrap_or_default();
        return Err(format!("Drive API Error: {}", err_text));
    }
    
    let status_line = if resp.status() == reqwest::StatusCode::PARTIAL_CONTENT {
        "HTTP/1.1 206 Partial Content\r\n"
    } else {
        "HTTP/1.1 200 OK\r\n"
    };
    
    let mut res_headers = String::from(status_line);
    res_headers.push_str("Access-Control-Allow-Origin: *\r\n");
    res_headers.push_str("Accept-Ranges: bytes\r\n");
    
    if let Some(ct) = resp.headers().get(reqwest::header::CONTENT_TYPE) {
        res_headers.push_str(&format!("Content-Type: {}\r\n", ct.to_str().unwrap_or("video/mp4")));
    } else {
        res_headers.push_str("Content-Type: video/mp4\r\n");
    }
    
    if let Some(cl) = resp.headers().get(reqwest::header::CONTENT_LENGTH) {
        res_headers.push_str(&format!("Content-Length: {}\r\n", cl.to_str().unwrap_or("0")));
    }
    
    if let Some(cr) = resp.headers().get(reqwest::header::CONTENT_RANGE) {
        res_headers.push_str(&format!("Content-Range: {}\r\n", cr.to_str().unwrap_or("")));
    }
    
    res_headers.push_str("\r\n");
    
    if let Err(e) = stream.write_all(res_headers.as_bytes()).await {
        return Err(format!("Failed to write headers: {}", e));
    }
    
    while let Some(chunk) = resp.chunk().await.map_err(|e| format!("Chunk error: {}", e))? {
        if let Err(_) = stream.write_all(&chunk).await {
            break; // ExoPlayer disconnected (e.g. video seek or stop)
        }
    }
    
    Ok(())
}
