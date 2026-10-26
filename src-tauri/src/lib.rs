// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::path::Path;
use base64::{Engine as _, engine::general_purpose};

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
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        // Đăng ký 2 command với Tauri
        .invoke_handler(tauri::generate_handler![
            check_file_exists,
            read_file_base64
        ])
        .run(tauri::generate_context!())
        .expect("Lỗi khi chạy ứng dụng Tauri");
}