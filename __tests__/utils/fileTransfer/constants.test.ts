import { CHUNK_SIZE, MAX_BUFFER, STUN_SERVER, CHANNEL_NAME } from '@/utils/fileTransfer/constants'

describe('constants', () => {
  it('CHUNK_SIZE is 16 KB', () => {
    expect(CHUNK_SIZE).toBe(16 * 1024)
  })

  it('MAX_BUFFER is 64 KB', () => {
    expect(MAX_BUFFER).toBe(64 * 1024)
  })

  it('MAX_BUFFER is four times CHUNK_SIZE', () => {
    expect(MAX_BUFFER).toBe(CHUNK_SIZE * 4)
  })

  it('STUN_SERVER uses the stun: protocol', () => {
    expect(STUN_SERVER).toMatch(/^stun:/)
  })

  it('CHANNEL_NAME is "file"', () => {
    expect(CHANNEL_NAME).toBe('file')
  })
})
