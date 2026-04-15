import { getSendProgress, sendFileMetadata, sendFileChunk, sendFile } from '@/utils/fileTransfer/sendFile'
import { CHUNK_SIZE } from '@/utils/fileTransfer/constants'

function makeMockChannel(overrides: Partial<RTCDataChannel> = {}): RTCDataChannel {
  return {
    readyState: 'open',
    bufferedAmount: 0,
    send: jest.fn(),
    onbufferedamountlow: null,
    ...overrides,
  } as unknown as RTCDataChannel
}

describe('getSendProgress', () => {
  it('returns 0 when totalSize is 0', () => {
    expect(getSendProgress(0, 0)).toBe(0)
  })

  it('returns 0 at the beginning', () => {
    expect(getSendProgress(0, 1000)).toBe(0)
  })

  it('returns 50 at the halfway point', () => {
    expect(getSendProgress(500, 1000)).toBe(50)
  })

  it('returns 100 when offset equals totalSize', () => {
    expect(getSendProgress(1000, 1000)).toBe(100)
  })
})

describe('sendFileMetadata', () => {
  it('sends a valid JSON string via the channel', async () => {
    const channel = makeMockChannel()
    const file = new File(['hello'], 'test.txt', { type: 'text/plain' })
    await sendFileMetadata(channel, file)
    expect(channel.send).toHaveBeenCalledTimes(1)
    const sent = JSON.parse((channel.send as jest.Mock).mock.calls[0][0])
    expect(sent).toMatchObject({ type: 'meta', name: 'test.txt', size: 5 })
  })

  it('sets encrypted to false when no encryptionKey is provided', async () => {
    const channel = makeMockChannel()
    await sendFileMetadata(channel, new File(['data'], 'f.txt'))
    const sent = JSON.parse((channel.send as jest.Mock).mock.calls[0][0])
    expect(sent.encrypted).toBe(false)
  })

  it('sets encrypted to true when an encryptionKey is provided', async () => {
    const channel = makeMockChannel()
    const key = {} as CryptoKey
    await sendFileMetadata(channel, new File(['data'], 'f.txt'), key)
    const sent = JSON.parse((channel.send as jest.Mock).mock.calls[0][0])
    expect(sent.encrypted).toBe(true)
  })
})

describe('sendFileChunk', () => {
  it('sends an ArrayBuffer when no encryption key is provided', async () => {
    const channel = makeMockChannel()
    const content = new Uint8Array([1, 2, 3, 4, 5])
    const file = new File([content], 'data.bin')

    await sendFileChunk(channel, file, 0)

    expect(channel.send).toHaveBeenCalledTimes(1)
    const sent = (channel.send as jest.Mock).mock.calls[0][0]
    expect(sent).toBeInstanceOf(ArrayBuffer)
  })

  it('returns the correct chunk buffer', async () => {
    const channel = makeMockChannel()
    const content = new Uint8Array([10, 20, 30])
    const file = new File([content], 'data.bin')

    const buffer = await sendFileChunk(channel, file, 0)
    expect(new Uint8Array(buffer)).toEqual(new Uint8Array([10, 20, 30]))
  })

  it('slices the file from the given offset', async () => {
    const channel = makeMockChannel()
    const content = new Uint8Array([1, 2, 3, 4, 5])
    const file = new File([content], 'data.bin')

    const buffer = await sendFileChunk(channel, file, 2)
    expect(new Uint8Array(buffer)).toEqual(new Uint8Array([3, 4, 5]))
  })
})

describe('sendFile', () => {
  it('throws when the channel is not open', async () => {
    const channel = makeMockChannel({ readyState: 'connecting' })
    const file = new File(['hello'], 'test.txt')

    await expect(sendFile(channel, file, jest.fn())).rejects.toThrow('Canal não está aberto')
  })

  it('sends metadata, chunk, and end message for a small file', async () => {
    const channel = makeMockChannel()
    const content = new Uint8Array([1, 2, 3])
    const file = new File([content], 'small.bin')
    const onProgress = jest.fn()

    await sendFile(channel, file, onProgress)

    const calls = (channel.send as jest.Mock).mock.calls
    // First call: metadata (string)
    expect(typeof calls[0][0]).toBe('string')
    expect(JSON.parse(calls[0][0])).toMatchObject({ type: 'meta' })
    // Second call: binary chunk (ArrayBuffer)
    expect(calls[1][0]).toBeInstanceOf(ArrayBuffer)
    // Third call: end message (string)
    expect(typeof calls[2][0]).toBe('string')
    expect(JSON.parse(calls[2][0])).toMatchObject({ type: 'end' })
  })

  it('calls onProgress with 100 on completion', async () => {
    const channel = makeMockChannel()
    const file = new File([new Uint8Array([1, 2])], 'f.bin')
    const onProgress = jest.fn()

    await sendFile(channel, file, onProgress)

    expect(onProgress).toHaveBeenLastCalledWith(100)
  })

  it('sends multiple chunks for a file larger than CHUNK_SIZE', async () => {
    const channel = makeMockChannel()
    const content = new Uint8Array(CHUNK_SIZE + 100)
    const file = new File([content], 'large.bin')
    const onProgress = jest.fn()

    await sendFile(channel, file, onProgress)

    const calls = (channel.send as jest.Mock).mock.calls
    // metadata + 2 binary chunks + end
    const binaryChunks = calls.filter((c) => c[0] instanceof ArrayBuffer)
    expect(binaryChunks).toHaveLength(2)
  })
})
