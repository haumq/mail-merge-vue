import { createApp } from 'vue'
import App from './App.vue'
import './style.css' // File chứa cấu hình Tailwind CSS
import { getCurrentWindow } from '@tauri-apps/api/window'

async function bootstrap() {
  const currentWin = getCurrentWindow()

  // 1. Nếu là cửa sổ Popup OAuth và chứa access_token trong Hash URL
  if (
    (currentWin.label === 'google-oauth-popup' || currentWin.label === 'outlook-oauth-popup') ||
    window.location.hash.includes('access_token=')
  ) {
    const hash = window.location.hash
    if (hash.includes('access_token=')) {
      const params = new URLSearchParams(hash.replace('#', '?'))
      const token = params.get('access_token')

      if (token) {
        const isOutlook = currentWin.label.includes('outlook')
        const storageKey = isOutlook ? 'outlook_access_token' : 'gmail_access_token'

        // Ghi token vào LocalStorage
        localStorage.setItem(storageKey, token)

        // Tiêu diệt cửa sổ ngay lập tức
        try {
          await currentWin.destroy()
        } catch {
          window.close()
        }
        return // 🛑 DỪNG HOÀN TOÀN, KHÔNG CHẠY VUE UI TRÊN POPUP
      }
    }
  }

  // 2. Khởi chạy App Vue bình thường ở cửa sổ chính
  createApp(App).mount('#app')
}

bootstrap()