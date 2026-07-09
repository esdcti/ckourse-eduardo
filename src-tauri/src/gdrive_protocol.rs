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

    // Forward the Range header from the frontend
    if let Some(range_header) = request.headers().get(header::RANGE) {
        if let Ok(r) = HeaderValue::from_bytes(range_header.as_bytes()) {
            headers.insert(RANGE, r);
        }
    }

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

    let status =
        StatusCode::from_u16(response.status().as_u16()).unwrap_or(StatusCode::INTERNAL_SERVER_ERROR);

    let mut builder = Response::builder()
        .status(status)
        .header(header::ACCESS_CONTROL_ALLOW_ORIGIN, "*");

    let headers_to_copy = [
        reqwest::header::CONTENT_TYPE,
        reqwest::header::CONTENT_LENGTH,
        reqwest::header::CONTENT_RANGE,
        reqwest::header::ACCEPT_RANGES,
    ];

    for h in headers_to_copy {
        if let Some(val) = response.headers().get(&h) {
            if let Ok(v) = tauri::http::HeaderValue::from_bytes(val.as_bytes()) {
                builder = builder.header(h.as_str(), v);
            }
        }
    }

    // Since WebView2 requests chunks, buffering into memory here is acceptable
    // However, if the frontend requests the whole file without Range, this will buffer the whole file.
    // WebViews generally use Range requests for video src.
    let bytes = match response.bytes().await {
        Ok(b) => b.to_vec(),
        Err(e) => {
            eprintln!("Google Drive Proxy Read Error: {}", e);
            return status_only(StatusCode::INTERNAL_SERVER_ERROR);
        }
    };

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
