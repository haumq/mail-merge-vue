// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::path::Path;
use base64::{Engine as _, engine::general_purpose};


use std::io::{Read, Write};
use std::net::TcpListener;
use tauri::Emitter;

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
            start_oauth_listener
        ])
        .run(tauri::generate_context!())
        .expect("Lỗi khi chạy ứng dụng Tauri");
}
