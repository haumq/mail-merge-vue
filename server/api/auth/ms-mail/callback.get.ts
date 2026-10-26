export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const code = query.code as string
  const config = useRuntimeConfig()

  if (!code) {
    throw createError({ statusCode: 400, statusMessage: 'Thiếu Authorization Code' })
  }

  const tokenUrl = `https://login.microsoftonline.com/${config.msTenantId}/oauth2/v2.0/token`
  const params = new URLSearchParams({
    client_id: config.msClientId,
    client_secret: config.msClientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: config.msRedirectUri
  })

  const tokenRes: any = await $fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  })

  // Lưu Access Token & Refresh Token vào HttpOnly Cookie
  setCookie(event, 'ms_access_token', tokenRes.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: tokenRes.expires_in
  })

  if (tokenRes.refresh_token) {
    setCookie(event, 'ms_refresh_token', tokenRes.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60
    })
  }

  // Báo cho Popup Frontend biết để cập nhật state và đóng popup
  setResponseHeader(event, 'Content-Type', 'text/html; charset=utf-8')
  return `
    <!DOCTYPE html>
    <html>
      <body>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'MS_AUTH_SUCCESS' }, '*');
          }
          window.close();
        </script>
        <p>Đăng nhập thành công! Cửa sổ này sẽ tự đóng...</p>
      </body>
    </html>
  `
})