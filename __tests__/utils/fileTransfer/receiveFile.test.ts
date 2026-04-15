import {
  initializeReceiveState,
  addReceivedChunk,
  setReceivedFileMeta,
  getReceivedFile,
  getReceiveProgress,
  isFileEncrypted,
} from '@/utils/fileTransfer/receiveFile'
import { FileMeta } from '@/utils/fileTransfer/types'

const makeMeta = (
  overrides: Partial<FileMeta & { encrypted?: boolean }> = {},
): FileMeta & { encrypted?: boolean } => ({
  type: 'meta',
  name: 'test.txt',
  size: 1000,
  ...overrides,
})

describe('initializeReceiveState', () => {
  it('starts with null fileMeta', () => {
    expect(initializeReceiveState().fileMeta).toBeNull()
  })

  it('starts with an empty buffers array', () => {
    expect(initializeReceiveState().receivedBuffers).toEqual([])
  })

  it('starts with receivedSize of 0', () => {
    expect(initializeReceiveState().receivedSize).toBe(0)
  })
})

describe('setReceivedFileMeta', () => {
  it('stores the provided meta', () => {
    const state = initializeReceiveState()
    const meta = makeMeta({ name: 'doc.pdf', size: 5000 })
    setReceivedFileMeta(state, meta)
    expect(state.fileMeta).toEqual(meta)
  })

  it('resets receivedBuffers and receivedSize', () => {
    const state = initializeReceiveState()
    state.receivedBuffers = [new ArrayBuffer(100)]
    state.receivedSize = 100
    setReceivedFileMeta(state, makeMeta())
    expect(state.receivedBuffers).toEqual([])
    expect(state.receivedSize).toBe(0)
  })
})

describe('addReceivedChunk', () => {
  it('appends the chunk to receivedBuffers', () => {
    const state = initializeReceiveState()
    const chunk = new ArrayBuffer(256)
    addReceivedChunk(state, chunk)
    expect(state.receivedBuffers).toHaveLength(1)
    expect(state.receivedBuffers[0]).toBe(chunk)
  })

  it('accumulates receivedSize across multiple chunks', () => {
    const state = initializeReceiveState()
    addReceivedChunk(state, new ArrayBuffer(100))
    addReceivedChunk(state, new ArrayBuffer(200))
    expect(state.receivedSize).toBe(300)
  })

  it('returns 0 when fileMeta is not set', () => {
    const state = initializeReceiveState()
    const result = addReceivedChunk(state, new ArrayBuffer(100))
    expect(result).toBe(0)
  })

  it('returns progress percentage relative to fileMeta.size', () => {
    const state = initializeReceiveState()
    setReceivedFileMeta(state, makeMeta({ size: 400 }))
    const progress = addReceivedChunk(state, new ArrayBuffer(100))
    expect(progress).toBe(25)
  })

  it('returns 100 when all bytes are received', () => {
    const state = initializeReceiveState()
    setReceivedFileMeta(state, makeMeta({ size: 50 }))
    const progress = addReceivedChunk(state, new ArrayBuffer(50))
    expect(progress).toBe(100)
  })
})

describe('getReceiveProgress', () => {
  it('returns 0 when fileMeta is not set', () => {
    expect(getReceiveProgress(initializeReceiveState())).toBe(0)
  })

  it('returns correct progress after receiving chunks', () => {
    const state = initializeReceiveState()
    setReceivedFileMeta(state, makeMeta({ size: 1000 }))
    addReceivedChunk(state, new ArrayBuffer(500))
    expect(getReceiveProgress(state)).toBe(50)
  })
})

describe('getReceivedFile', () => {
  it('returns a Blob instance', () => {
    const state = initializeReceiveState()
    setReceivedFileMeta(state, makeMeta())
    state.receivedBuffers = [new Uint8Array([1, 2, 3]).buffer]
    expect(getReceivedFile(state)).toBeInstanceOf(Blob)
  })

  it('returns a Blob whose size matches total received bytes', () => {
    const state = initializeReceiveState()
    setReceivedFileMeta(state, makeMeta())
    state.receivedBuffers = [new Uint8Array([1, 2]).buffer, new Uint8Array([3, 4, 5]).buffer]
    const blob = getReceivedFile(state)
    expect(blob.size).toBe(5)
  })
})

describe('isFileEncrypted', () => {
  it('returns false when fileMeta is null', () => {
    expect(isFileEncrypted(initializeReceiveState())).toBe(false)
  })

  it('returns false when encrypted is not set in meta', () => {
    const state = initializeReceiveState()
    setReceivedFileMeta(state, makeMeta())
    expect(isFileEncrypted(state)).toBe(false)
  })

  it('returns false when encrypted is explicitly false', () => {
    const state = initializeReceiveState()
    setReceivedFileMeta(state, makeMeta({ encrypted: false }))
    expect(isFileEncrypted(state)).toBe(false)
  })

  it('returns true when encrypted is true', () => {
    const state = initializeReceiveState()
    setReceivedFileMeta(state, makeMeta({ encrypted: true }))
    expect(isFileEncrypted(state)).toBe(true)
  })
})
