const mockWrite = jest.fn()
const mockGetProperties = jest.fn()

jest.mock('@adobe/aio-sdk', () => ({
  Core: {
    Logger: jest.fn(() => ({ info: jest.fn(), debug: jest.fn(), error: jest.fn() }))
  },
  Files: {
    init: jest.fn(async () => ({
      write: mockWrite,
      getProperties: mockGetProperties
    }))
  }
}))

const { main } = require('../actions/upload-image/index.js')

// 1x1 transparent PNG
const PNG_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='

describe('upload-image', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetProperties.mockResolvedValue({ url: 'https://example.com/public/images/x.png' })
  })

  it('returns 400 on missing params', async () => {
    const res = await main({})
    expect(res.statusCode).toBe(400)
    expect(res.body.error).toContain('Missing')
  })

  it('returns 400 on unsupported content type', async () => {
    const res = await main({ fileName: 'a.txt', contentType: 'text/plain', data: PNG_B64 })
    expect(res.statusCode).toBe(400)
    expect(res.body.error).toContain('Unsupported')
  })

  it('returns 200 on successful upload', async () => {
    const res = await main({ fileName: 'a.png', contentType: 'image/png', data: PNG_B64 })
    expect(res.statusCode).toBe(200)
    expect(res.body.url).toBe('https://example.com/public/images/x.png')
    expect(mockWrite).toHaveBeenCalled()
  })

  it('returns 500 on SDK failure', async () => {
    mockWrite.mockRejectedValueOnce(new Error('storage down'))
    const res = await main({ fileName: 'a.png', contentType: 'image/png', data: PNG_B64 })
    expect(res.statusCode).toBe(500)
    expect(res.body.error).toBe('storage down')
  })
})
