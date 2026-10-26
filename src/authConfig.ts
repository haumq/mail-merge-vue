import { PublicClientApplication, type Configuration } from '@azure/msal-browser'

export const msalConfig: Configuration = {
  auth: {
    clientId: '35dce193-fc1c-45aa-aa03-77e5e49f8aae', // Nhập Client ID từ Azure Portal
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: window.location.origin // http://localhost:5173
  },
  cache: {
    cacheLocation: 'localStorage'
  }
}

export const loginRequest = {
  scopes: ['User.Read', 'Mail.Send', 'offline_access']
}

export const msalInstance = new PublicClientApplication(msalConfig)