export default defineEventHandler((event) => {
  deleteCookie(event, 'ms_access_token')
  deleteCookie(event, 'ms_refresh_token')
  return { success: true }
})