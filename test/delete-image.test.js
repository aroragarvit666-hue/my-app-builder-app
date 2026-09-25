const mockDelete = jest.fn()

jest.mock('@adobe/aio-sdk', () => ({
  Core: {
    Logger: jest.fn(() => ({ info: jest.fn(), debug: jest.fn(), error: jest.fn() }))
  },
  Files: {
    init: jest.fn(async () => ({ delete: mockDelete }))
  }
}))

const { main } = require('../actions/delete-image/index.js')

describe('delete-image', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 400 when name is missing', async () => {
    const res = await main({})
    expect(res.statusCode).toBe(400)
    expect(res.body.error).toContain('name')
  })

  it('returns 400 for a path outside the images folder', async () => {
    const res = await main({ name: 'public/secrets/foo.png' })
    expect(res.statusCode).toBe(400)
    expect(res.body.error).toContain('Invalid')
  })

  it('returns 200 on successful delete', async () => {
    const res = await main({ name: 'public/images/1-cat.png' })
    expect(res.statusCode).toBe(200)
    expect(res.body.deleted).toBe('public/images/1-cat.png')
    expect(mockDelete).toHaveBeenCalledWith('public/images/1-cat.png')
  })

  it('returns 500 on SDK failure', async () => {
    mockDelete.mockRejectedValueOnce(new Error('delete failed'))
    const res = await main({ name: 'public/images/1-cat.png' })
    expect(res.statusCode).toBe(500)
    expect(res.body.error).toBe('delete failed')
  })
})
