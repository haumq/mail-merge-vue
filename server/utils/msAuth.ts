import { H3Event, getCookie, setCookie } from 'h3'

export async function getOrRefreshAccessToken(event: H3Event): Promise<string | null> {
  let accessToken = getCookie(event, 'ms_access_token')
  if (accessToken) return accessToken

  const refreshToken = getCookie(event, 'ms_refresh_token')
  if (!refreshToken) return null

  const config = useRuntimeConfig()
  try {
    const tokenUrl = `https://login.microsoftonline.com/${config.msTenantId}/oauth2/v2.0/token`
    const params = new URLSearchParams({
      client_id: config.msClientId,
      client_secret: config.msClientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })

    const tokenRes: any = await $fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    })

    setCookie(event, 'ms_access_token', tokenRes.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: tokenRes.expires_in
    })

    return tokenRes.access_token
  } catch (err) {
    return null
  }
}