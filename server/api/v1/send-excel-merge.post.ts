import ExcelJS from 'exceljs'
import { readMultipartFormData } from 'h3'

export default defineEventHandler(async (event) => {
  const accessToken = await getOrRefreshAccessToken(event)
  if (!accessToken) {
    throw createError({ statusCode: 401, statusMessage: 'Chưa đăng nhập Microsoft Mail' })
  }

  const formData = await readMultipartFormData(event)
  if (!formData) {
    throw createError({ statusCode: 400, statusMessage: 'Dữ liệu không hợp lệ' })
  }

  let excelBuffer: Buffer | null = null
  let subjectTemplate = ''
  let bodyTemplate = ''
  const commonAttachments: Array<{ filename: string; contentBytes: string; contentType: string }> = []

  // Đọc FormData
  for (const item of formData) {
    if (item.name === 'excelFile') {
      excelBuffer = item.data
    } else if (item.name === 'subjectTemplate') {
      subjectTemplate = item.data.toString('utf-8')
    } else if (item.name === 'bodyTemplate') {
      bodyTemplate = item.data.toString('utf-8')
    } else if (item.name === 'commonAttachments' && item.filename) {
      commonAttachments.push({
        filename: item.filename,
        contentType: item.type || 'application/octet-stream',
        contentBytes: item.data.toString('base64')
      })
    }
  }

  if (!excelBuffer) {
    throw createError({ statusCode: 400, statusMessage: 'Không tìm thấy file Excel' })
  }

  // Đọc file Excel từ Buffer
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(excelBuffer)
  const worksheet = workbook.worksheets[0]

  if (!worksheet) {
    throw createError({ statusCode: 400, statusMessage: 'Sheet không tồn tại' })
  }

  const rows: string[][] = []
  worksheet.eachRow({ includeEmpty: true }, (row) => {
    const values = (row.values as any[]).slice(1).map(val => {
      if (val === null || val === undefined) return ''
      if (typeof val === 'object') {
        if (val.text) return val.text
        if (val.hyperlink) return val.hyperlink.replace(/^mailto:/i, '').trim()
      }
      return String(val).trim()
    })
    rows.push(values)
  })

  if (rows.length < 2) {
    throw createError({ statusCode: 400, statusMessage: 'File Excel không có dữ liệu hàng gửi' })
  }

  const headers = rows[0]!
  const dataRows = rows.slice(1)

  // Tìm vị trí các cột
  const findCol = (regex: RegExp) => headers.findIndex(h => regex.test(String(h || '')))
  const toColIdx = findCol(/^email$\vert{}^mail$|^to$/i) !== -1 ? findCol(/^email$|^mail$\vert{}^to$/i) : 0
  const ccColIdx = findCol(/^cc$/i)
  const bccColIdx = findCol(/^bcc$/i)

  const parseRecipients = (raw?: string) => {
    if (!raw) return []
    return raw
      .split(/[;,]/)
      .map(e => e.trim())
      .filter(Boolean)
      .map(email => ({ emailAddress: { address: email } }))
  }

  const details: Array<{ row: number; email: string; status: 'SUCCESS' | 'FAILED'; error?: string }> = []

  // Lặp qua từng dòng để gửi email
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i]!
    const rowNum = i + 2

    const toRecipients = parseRecipients(row[toColIdx])
    const ccRecipients = ccColIdx !== -1 ? parseRecipients(row[ccColIdx]) : []
    const bccRecipients = bccColIdx !== -1 ? parseRecipients(row[bccColIdx]) : []

    const primaryEmail = toRecipients[0]?.emailAddress?.address || 'N/A'

    if (!toRecipients.length) {
      details.push({ row: rowNum, email: primaryEmail, status: 'FAILED', error: 'Không tìm thấy địa chỉ Email nhận' })
      continue
    }

    // Replace các biến dynamic {{TenVar}}
    let subject = subjectTemplate
    let body = bodyTemplate

    headers.forEach((header, colIdx) => {
      const key = String(header || '').trim()
      const val = String(row[colIdx] ?? '')
      if (key) {
        subject = subject.replaceAll(`{{${key}}}`, val)
        body = body.replaceAll(`{{${key}}}`, val)
      }
    })

    // Gửi qua Microsoft Graph API
    try {
      const graphPayload = {
        message: {
          subject,
          body: {
            contentType: 'HTML',
            content: body
          },
          toRecipients,
          ccRecipients,
          bccRecipients,
          attachments: commonAttachments.map(att => ({
            '@odata.type': '#microsoft.graph.fileAttachment',
            name: att.filename,
            contentType: att.contentType,
            contentBytes: att.contentBytes
          }))
        },
        saveToSentItems: 'true'
      }

      await $fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: graphPayload
      })

      details.push({ row: rowNum, email: primaryEmail, status: 'SUCCESS' })
    } catch (err: any) {
      details.push({
        row: rowNum,
        email: primaryEmail,
        status: 'FAILED',
        error: err.data?.error?.message || err.message || 'Lỗi gửi mail qua Microsoft Graph'
      })
    }
  }

  const successCount = details.filter(d => d.status === 'SUCCESS').length
  const failedCount = details.filter(d => d.status === 'FAILED').length

  return {
    success: failedCount === 0,
    details,
    summary: {
      total: dataRows.length,
      success: successCount,
      failed: failedCount
    }
  }
})