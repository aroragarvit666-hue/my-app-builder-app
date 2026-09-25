const mockList = jest.fn()
const mockGetProperties = jest.fn()

jest.mock('@adobe/aio-sdk', () => ({
  Core: {
    Logger: jest.fn(() => ({ info: jest.fn(), debug: jest.fn(), error: jest.fn() }))
  },
  Files: {
    init: jest.fn(async () => ({
      list: mockList,
      getProperties: mockGetProperties
    }))
  }
}))

const { main } = require('../actions/list-images/index.js')

describe('list-images', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 200 with an empty list', async () => {
    mockList.mockResolvedValue([])
    const res = await main({})
    expect(res.statusCode).toBe(200)
    expect(res.body.images).toEqual([])
  })

  it('returns 200 with mapped images', async () => {
    mockList.mockResolvedValue([
      { name: 'public/images/1700000000000-cat.png', isDirectory: false }
    ])
    mockGetProperties.mockResolvedValue({
      url: 'https://example.com/cat.png',
      contentLength: 123,
      lastModified: '2024-01-01T00:00:00Z'
    })
    const res = await main({})
    expect(res.statusCode).toBe(200)
    expect(res.body.images[0].displayName).toBe('cat.png')
    expect(res.body.images[0].url).toBe('https://example.com/cat.png')
  })

  it('returns 500 on SDK failure', async () => {
    mockList.mockRejectedValueOnce(new Error('list failed'))
    const res = await main({})
    expect(res.statusCode).toBe(500)
    expect(res.body.error).toBe('list failed')
  })
})
