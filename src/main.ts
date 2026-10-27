import { createApp } from 'vue'
import App from './App.vue'
import './style.css' // File chứa cấu hình Tailwind CSS
import { getCurrentWindow } from '@tauri-apps/api/window'

async function initApp() {
  const currentWin = getCurrentWindow()

  // 1. KIỂM TRA NẾU LÀ CỬA SỔ POPUP OAUTH
  if (currentWin.label === 'google-oauth-popup' || currentWin.label === 'outlook-oauth-popup') {
    const hash = window.location.hash
    const isGoogle = currentWin.label === 'google-oauth-popup'
    const storageKey = isGoogle ? 'gmail_access_token' : 'outlook_access_token'

    if (hash.includes('access_token=')) {
      const params = new URLSearchParams(hash.replace('#', '?'))
      const token = params.get('access_token')
      if (token) {
        localStorage.setItem(storageKey, token)
      }
    } else if (hash.includes('error=')) {
      console.error('Lỗi OAuth từ Provider:', hash)
    }

    // 2. ÉP HỦY CỬA SỔ PHỤ TRONG MỌI TRƯỜNG HỢP
    try {
      await currentWin.destroy()
    } catch {
      window.close()
    }

    return // 🛑 DỪNG TẠI ĐÂY, KHÔNG MOUNT VUE TRÊN POPUP
  }

  // 3. CỬA SỔ CHÍNH: Khởi chạy Vue bình thường
  createApp(App).mount('#app')
}

initApp()