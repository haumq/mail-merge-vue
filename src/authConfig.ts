import { PublicClientApplication, type Configuration } from '@azure/msal-browser'

// 1. Nạp Client ID từ biến môi trường (GitHub Secrets / .env)
const clientId = import.meta.env.VITE_OUTLOOK_CLIENT_ID

// 2. Chuẩn hóa Redirect URI theo môi trường
const getRedirectUri = () => {
  if (import.meta.env.DEV) {
    return window.location.origin  || 'http://localhost:1420' // Port dev của bạn (1420/5173/3000)
  }
  // Môi trường Production (.exe) của Tauri
  return 'https://tauri.localhost'
}

export const msalConfig: Configuration = {
  auth: {
    clientId: clientId,
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: getRedirectUri()
  },
  cache: {
    cacheLocation: 'localStorage'
  }
}

export const loginRequest = {
  scopes: ['User.Read', 'Mail.Send', 'offline_access']
}

export const msalInstance = new PublicClientApplication(msalConfig)