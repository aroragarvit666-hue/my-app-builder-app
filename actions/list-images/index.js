const { Core, Files } = require('@adobe/aio-sdk')

async function main(params) {
  const logger = Core.Logger('list-images', { level: params.LOG_LEVEL || 'info' })
  try {
    logger.info('list-images invoked')

    const files = await Files.init()
    const entries = await files.list('public/images/')

    const images = await Promise.all(
      (entries || [])
        .filter((e) => !e.isDirectory)
        .map(async (e) => {
          const name = e.name
          const props = await files.getProperties(name)
          return {
            name,
            // Strip the "public/images/<timestamp>-" prefix for display
            displayName: name.replace(/^public\/images\/\d+-/, ''),
            url: props.url,
            contentLength: props.contentLength,
            lastModified: props.lastModified
          }
        })
    )

    // Newest first
    images.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))

    logger.info(`Found ${images.length} image(s)`)
    return { statusCode: 200, body: { images } }
  } catch (error) {
    logger.error('list-images failed:', error.message)
    return { statusCode: 500, body: { error: error.message } }
  }
}

exports.main = main
