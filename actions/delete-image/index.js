const { Core, Files } = require('@adobe/aio-sdk')

async function main(params) {
  const logger = Core.Logger('delete-image', { level: params.LOG_LEVEL || 'info' })
  try {
    logger.info('delete-image invoked')

    if (!params.name) {
      return { statusCode: 400, body: { error: 'Missing required param: name' } }
    }

    // Guard: only allow deleting from the images folder
    if (!params.name.startsWith('public/images/')) {
      return { statusCode: 400, body: { error: 'Invalid file path' } }
    }

    const files = await Files.init()
    await files.delete(params.name)

    logger.info(`Deleted ${params.name}`)
    return { statusCode: 200, body: { deleted: params.name } }
  } catch (error) {
    logger.error('delete-image failed:', error.message)
    return { statusCode: 500, body: { error: error.message } }
  }
}

exports.main = main
