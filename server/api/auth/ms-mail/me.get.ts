export default defineEventHandler(async (event) => {
  const accessToken = await getOrRefreshAccessToken(event)
  if (!accessToken) {
    throw createError({ statusCode: 401, statusMessage: 'Chưa đăng nhập Microsoft' })
  }

  const profile: any = await $fetch('https://graph.microsoft.com/v1.0/me', {
    headers: { Authorization: `Bearer ${accessToken}` }
  })

  let avatar: string | null = null
  try {
    const photoBuffer = await $fetch<ArrayBuffer>('https://graph.microsoft.com/v1.0/me/photo/$value', {
      headers: { Authorization: `Bearer ${accessToken}` },
      responseType: 'arrayBuffer'
    })
    avatar = `data:image/jpeg;base64,${Buffer.from(photoBuffer).toString('base64')}`
  } catch {}

  return {
    name: profile.displayName || profile.givenName || 'Microsoft User',
    email: profile.mail || profile.userPrincipalName,
    avatar
  }
})