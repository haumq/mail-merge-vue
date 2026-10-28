// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::path::Path;
use base64::{Engine as _, engine::general_purpose};

use tauri::{Emitter, Manager, WebviewUrl, WebviewWindowBuilder};

#[tauri::command]
async fn open_oauth_popup(
    app: tauri::AppHandle,
    url: String,
    title: String,
    window_label: String,
    provider: String, // 👈 Phân biệt "gmail" hoặc "outlook"
    incognito: Option<bool>,
) -> Result<(), String> {
    if let Some(existing_win) = app.get_webview_window(&window_label) {
        let _ = existing_win.destroy();
    }

    let app_handle = app.clone();
    let label_clone = window_label.clone();
    let target_url = url.parse().map_err(|e| format!("URL không hợp lệ: {}", e))?;
    let is_incognito = incognito.unwrap_or(false);

    // Tạo tên Event độc lập cho từng dịch vụ
    let event_name = format!("{}-token-received", provider); 

    WebviewWindowBuilder::new(&app, &window_label, WebviewUrl::External(target_url))
        .title(title)
        .inner_size(500.0, 650.0)
        .center()
        .resizable(false)
        .always_on_top(true)
        .incognito(is_incognito)
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        .on_navigation(move |url| {
            let url_str = url.as_str();

            if url_str.starts_with("http://localhost:1420") || url_str.contains("access_token=") || url_str.contains("error=") {
                // 💥 Chỉ phát Event đúng cho dịch vụ đang gọi
                let _ = app_handle.emit(&event_name, url_str.to_string());
                
                if let Some(win) = app_handle.get_webview_window(&label_clone) {
                    let _ = win.destroy();
                }
                return false;
            }

            true
        })
        .build()
        .map_err(|e| format!("Lỗi tạo cửa sổ: {}", e))?;

    Ok(())
}

use std::io::{Read, Write};
use std::net::TcpListener;

#[tauri::command]
async fn start_oauth_listener(app_handle: tauri::AppHandle) -> Result<(), String> {
    std::thread::spawn(move || {
        // Thử bind cổng 1420, nếu bận thì bỏ qua thay vì làm crash luồng
        let listener = match TcpListener::bind("127.0.0.1:1420") {
            Ok(l) => l,
            Err(e) => {
                eprintln!("Không thể mở cổng 1420 (có thể đang bận): {}", e);
                return;
            }
        };

        // Lắng nghe kết quả redirect
        if let Ok((mut stream, _)) = listener.accept() {
            let mut buffer = [0; 2048];
            if stream.read(&mut buffer).is_ok() {
                let response = "HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\n\r\n\
                    <!DOCTYPE html><html><head><title>Xác thực thành công</title></head>\
                    <body style='font-family:sans-serif;text-align:center;padding-top:50px;'>\
                    <h2 style='color:#059669;'>✅ Đăng nhập thành công!</h2>\
                    <p>Bạn có thể đóng tab này và quay lại ứng dụng.</p>\
                    <script>\
                    const hash = window.location.hash;\
                    if (hash) {\
                        fetch('/token' + hash.replace('#', '?')).then(() => window.close());\
                    } else {\
                        window.close();\
                    }\
                    </script></body></html>";
                let _ = stream.write_all(response.as_bytes());
            }
        }

        if let Ok((mut stream, _)) = listener.accept() {
            let mut buffer = [0; 2048];
            if stream.read(&mut buffer).is_ok() {
                let req = String::from_utf8_lossy(&buffer).to_string();
                let _ = app_handle.emit("oauth-token-received", req);
                let _ = stream.write_all(b"HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\nOK");
            }
        }
    });
    Ok(())
}



// 1. Kiểm tra file có tồn tại trên máy không (Dùng chung cho cả Outlook & Gmail)

#[tauri::command]
fn check_file_exists(path: String) -> bool {
    // 1. Làm sạch đường dẫn: Xóa ngoặc kép, dấu chấm phẩy thừa, khoảng trắng ẩn Unicode
    let cleaned_path = path
        .trim()
        .trim_matches(|c| c == '"' || c == '\'' || c == ';')
        .replace('\u{00A0}', " ")
        .replace('\u{200B}', "");

    let exists = Path::new(&cleaned_path).exists();
    
    // 2. In log ra Terminal để kiểm tra trực tiếp
    println!("[Rust check_file_exists] Path: '{}' -> Exists: {}", cleaned_path, exists);

    exists
}

// 2. Đọc file từ đường dẫn và mã hóa sang Base64
#[tauri::command]
fn read_file_base64(path: String) -> Result<String, String> {
    // Làm sạch ký tự ngoặc kép, khoảng trắng ẩn Unicode trước khi đọc file
    let cleaned_path = path
        .trim()
        .trim_matches(|c| c == '"' || c == '\'')
        .replace('\u{00A0}', " ")
        .replace('\u{200B}', "");

    let bytes = std::fs::read(&cleaned_path).map_err(|e| e.to_string())?;
    Ok(general_purpose::STANDARD.encode(bytes))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
    // 👈 Khởi chạy Localhost Server ở port 1420 cho bản .exe
    .plugin(tauri_plugin_localhost::Builder::new(1420).build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        // Đăng ký 2 command với Tauri
        .invoke_handler(tauri::generate_handler![
            check_file_exists,
            read_file_base64,
            start_oauth_listener,
            open_oauth_popup
        ])
        .run(tauri::generate_context!())
        .expect("Lỗi khi chạy ứng dụng Tauri");
}
