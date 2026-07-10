use percent_encoding::percent_decode_str;
use reqwest::header::{HeaderMap, HeaderValue, RANGE};
use reqwest::Client;
use tauri::http::{header, Request, Response, StatusCode};
use tauri::{Manager, UriSchemeContext, UriSchemeResponder, Wry};

use crate::commands::{force_refresh_token, get_valid_token};
use crate::db::DbState;

pub const SCHEME: &str = "gdrive";

pub fn handle(
    ctx: UriSchemeContext<'_, Wry>,
    request: Request<Vec<u8>>,
    responder: UriSchemeResponder,
) {
    let app_handle = ctx.app_handle().clone();

    tauri::async_runtime::spawn(async move {
        let response = serve(app_handle, &request).await;
        responder.respond(response);
    });
}

async fn serve(app: tauri::AppHandle, request: &Request<Vec<u8>>) -> Response<Vec<u8>> {
    let file_id = match decode_path(request) {
        Some(p) => p,
        None => return status_only(StatusCode::BAD_REQUEST),
    };

    let state = app.state::<DbState>();

    let mut token = match get_valid_token(&state).await {
        Ok(t) => t,
        Err(_) => return status_only(StatusCode::UNAUTHORIZED),
    };

    let client = Client::new();
    let url = format!(
        "https://www.googleapis.com/drive/v3/files/{}?alt=media&acknowledgeAbuse=true",
        file_id
    );

    let mut headers = HeaderMap::new();
    headers.insert(
        reqwest::header::AUTHORIZATION,
        HeaderValue::from_str(&format!("Bearer {}", token)).unwrap(),
    );

    #[cfg(target_os = "android")]
    let max_chunk: u64 = 150 * 1024 * 1024; // 150 MB for Android (MediaPlayer issue workaround)
    #[cfg(not(target_os = "android"))]
    let max_chunk: u64 = 5 * 1024 * 1024; // 5 MB for Desktop (saves memory)
    #[cfg(target_os = "android")]
    let mut requested_range = "bytes=0-157286399".to_string(); // Default to 150 MB to prevent OOM
    #[cfg(not(target_os = "android"))]
    let mut requested_range = "bytes=0-5242879".to_string(); // Default to 5 MB to prevent OOM

    // Forward and clamp the Range header from the frontend
    if let Some(range_header) = request.headers().get(header::RANGE) {
        let s = range_header.to_str().unwrap_or("");
        if let Some(s) = s.strip_prefix("bytes=") {
            if let Some((a, b)) = s.split_once('-') {
                if a.is_empty() {
                    // This is a suffix request: bytes=-500
                    if let Ok(suffix) = b.parse::<u64>() {
                        let clamped_suffix = std::cmp::min(suffix, max_chunk);
                        requested_range = format!("bytes=-{}", clamped_suffix);
                    }
                } else {
                    let start: u64 = a.parse().unwrap_or(0);
                    let end = b.parse::<u64>().ok();
                    
                    let new_end = match end {
                        Some(e) => if e >= start && e - start + 1 > max_chunk { start + max_chunk - 1 } else { e },
                        None => start + max_chunk - 1,
                    };
                    requested_range = format!("bytes={}-{}", start, new_end);
                }
            }
        }
    }
    
    headers.insert(RANGE, HeaderValue::from_str(&requested_range).unwrap());
    let has_range_header = request.headers().contains_key(header::RANGE);

    let mut res = client.get(&url).headers(headers.clone()).send().await;

    // Retry if token expired
    if let Ok(ref response) = res {
        if response.status() == 401 {
            if let Ok(new_token) = force_refresh_token(&state).await {
                token = new_token;
                headers.insert(
                    reqwest::header::AUTHORIZATION,
                    HeaderValue::from_str(&format!("Bearer {}", token)).unwrap(),
                );
                res = client.get(&url).headers(headers).send().await;
            }
        }
    }

    let response = match res {
        Ok(r) => r,
        Err(e) => {
            eprintln!("Google Drive Proxy Error: {}", e);
            return status_only(StatusCode::INTERNAL_SERVER_ERROR);
        }
    };

    let upstream_status = response.status();

    // Capture the upstream Content-Range before consuming the response body
    // (reqwest's `bytes()` takes ownership of the response).
    let upstream_content_range = response
        .headers()
        .get(reqwest::header::CONTENT_RANGE)
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());

    // Total file size = denominator of "bytes start-end/total".
    let total_size = upstream_content_range
        .as_deref()
        .and_then(|cr| cr.rsplit('/').next())
        .and_then(|s| s.trim().parse::<u64>().ok());

    // Read the (possibly clamped/partial) body into memory.
    let bytes = match response.bytes().await {
        Ok(b) => b.to_vec(),
        Err(e) => {
            eprintln!("Google Drive Proxy Read Error: {}", e);
            return status_only(StatusCode::INTERNAL_SERVER_ERROR);
        }
    };
    let body_len = bytes.len() as u64;

    // Content-Length MUST match the number of bytes we actually return.
    // Previously, for a range-less request we advertised the *full* file size
    // while only sending a clamped chunk (150 MB on Android). Small videos
    // happened to fit in one chunk and played fine, but larger videos left the
    // player waiting for bytes that never arrived — the reason mobile playback
    // only worked for short courses.
    let mut builder = Response::builder()
        .header(header::ACCESS_CONTROL_ALLOW_ORIGIN, "*")
        .header(header::ACCEPT_RANGES, "bytes")
        .header(header::CONTENT_TYPE, "video/mp4")
        .header(header::CONTENT_LENGTH, body_len.to_string());

    // Did this single response cover the entire file?
    let served_full = match total_size {
        Some(total) => body_len >= total,
        None => upstream_status.as_u16() < 300,
    };

    if has_range_header || !served_full {
        // Partial content: advertise the exact byte range so the player knows
        // there is more and issues follow-up Range requests.
        builder = builder.status(StatusCode::PARTIAL_CONTENT);
        if let Some(cr) = &upstream_content_range {
            builder = builder.header(header::CONTENT_RANGE, cr.as_str());
        } else if let (Some(total), true) = (total_size, body_len > 0) {
            builder = builder.header(
                header::CONTENT_RANGE,
                format!("bytes 0-{}/{}", body_len - 1, total),
            );
        }
    } else {
        builder = builder.status(StatusCode::OK);
    }

    builder
        .body(bytes)
        .unwrap_or_else(|_| status_only(StatusCode::INTERNAL_SERVER_ERROR))
}

fn decode_path(request: &Request<Vec<u8>>) -> Option<String> {
    let uri = request.uri();
    let raw = uri.path().trim_start_matches('/');
    let decoded = percent_decode_str(raw).decode_utf8().ok()?;
    Some(decoded.to_string())
}

fn status_only(status: StatusCode) -> Response<Vec<u8>> {
    Response::builder()
        .status(status)
        .header(header::ACCESS_CONTROL_ALLOW_ORIGIN, "*")
        .body(Vec::new())
        .expect("status-only response")
}
