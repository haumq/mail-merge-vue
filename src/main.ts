import { createApp } from 'vue'
import App from './App.vue'
import './style.css' // File chứa cấu hình Tailwind CSS
import { getCurrentWindow } from '@tauri-apps/api/window'
// import { emit } from '@tauri-apps/api/event'

async function initApp() {
  const currentWin = getCurrentWindow()

  // 1. Kiểm tra nếu là cửa sổ OAuth Popup
  if (currentWin.label === 'google-oauth-popup' || currentWin.label === 'outlook-oauth-popup') {
    const hash = window.location.hash
    if (hash.includes('access_token=')) {
      const params = new URLSearchParams(hash.replace('#', '?'))
      const token = params.get('access_token')

      if (token) {
        const isGoogle = currentWin.label === 'google-oauth-popup'
        const storageKey = isGoogle ? 'gmail_access_token' : 'outlook_access_token'
        
        // Ghi trực tiếp token vào localStorage dùng chung
        localStorage.setItem(storageKey, token)
      }
    }

    // 2. Tự hủy cửa sổ phụ ngay lập tức
    try {
      await currentWin.destroy()
    } catch {
      await currentWin.close()
    }
    return
  }

  // Khởi chạy ứng dụng bình thường ở cửa sổ main
  createApp(App).mount('#app')
}

initApp()
