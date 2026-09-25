const { Core, Files } = require('@adobe/aio-sdk')

// Allowed image content types
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

async function main(params) {
  const logger = Core.Logger('upload-image', { level: params.LOG_LEVEL || 'info' })
  try {
    logger.info('upload-image invoked')

    const required = ['fileName', 'contentType', 'data']
    const missing = required.filter((p) => !params[p])
    if (missing.length > 0) {
      return { statusCode: 400, body: { error: `Missing required params: ${missing.join(', ')}` } }
    }

    if (!ALLOWED_TYPES.includes(params.contentType)) {
      return {
        statusCode: 400,
        body: { error: `Unsupported content type: ${params.contentType}` }
      }
    }

    // data is a base64 string (no data URL prefix)
    const buffer = Buffer.from(params.data, 'base64')
    if (buffer.length === 0) {
      return { statusCode: 400, body: { error: 'Uploaded file is empty or invalid base64' } }
    }
    if (buffer.length > MAX_BYTES) {
      return { statusCode: 400, body: { error: 'File exceeds 5 MB limit' } }
    }

    // Sanitize the file name and store under public/ for a shareable URL
    const safeName = params.fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
    const key = `public/images/${Date.now()}-${safeName}`

    const files = await Files.init()
    await files.write(key, buffer)

    const props = await files.getProperties(key)
    logger.info(`Uploaded ${key} (${buffer.length} bytes)`)

    return {
      statusCode: 200,
      body: {
        name: key,
        url: props.url,
        contentLength: buffer.length,
        contentType: params.contentType
      }
    }
  } catch (error) {
    logger.error('upload-image failed:', error.message)
    return { statusCode: 500, body: { error: error.message } }
  }
}

exports.main = main
