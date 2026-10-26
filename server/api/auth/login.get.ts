export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const params = new URLSearchParams({
    client_id: config.msClientId,
    response_type: 'code',
    redirect_uri: config.msRedirectUri,
    response_mode: 'query',
    scope: 'openid profile email offline_access Mail.Send User.Read',
    prompt: 'select_account'
  })

  const authUrl = `https://login.microsoftonline.com/${config.msTenantId}/oauth2/v2.0/authorize?${params.toString()}`
  return sendRedirect(event, authUrl)
})