import { createApp } from 'vue'
import App from './App.vue'
import './style.css' // File chứa cấu hình Tailwind CSS
import { getCurrentWindow } from '@tauri-apps/api/window'

import { emit } from '@tauri-apps/api/event'

async function initApp() {
  const currentWin = getCurrentWindow()

  // NẾU LÀ CỬA SỔ POPUP OAUTH
  if (currentWin.label === 'google-oauth-popup' || currentWin.label === 'outlook-oauth-popup') {
    const hash = window.location.hash
    const isGoogle = currentWin.label === 'google-oauth-popup'
    const provider = isGoogle ? 'gmail' : 'outlook'

    if (hash.includes('access_token=')) {
      const params = new URLSearchParams(hash.replace('#', '?'))
      const token = params.get('access_token')

      if (token) {
        // 1. Lưu tạm vào localStorage của Popup
        localStorage.setItem(`${provider}_access_token`, token)

        // 2. 💥 PHÁT SỰ KIỆN SANG CỬA SỔ CHÍNH ĐỂ CẬP NHẬT STATE VUE LẬP TỨC
        await emit('oauth-login-success', { provider, token })
      }
    }

    // 3. Tắt cửa sổ Popup
    try {
      await currentWin.destroy()
    } catch {
      window.close()
    }
    return // 🛑 Dừng hoàn toàn, không mount Vue trên cửa sổ Popup
  }

  // CỬA SỔ CHÍNH: Mount App bình thường
  createApp(App).mount('#app')
}

initApp()