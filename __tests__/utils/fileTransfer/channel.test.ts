import {
  isChannelReady,
  setupChannelListeners,
  setupOndatachannel,
} from '@/utils/fileTransfer/channel'
import { FileMeta } from '@/utils/fileTransfer/types'

function makeMockChannel(overrides: Partial<RTCDataChannel> = {}): RTCDataChannel {
  return {
    onopen: null,
    onmessage: null,
    onerror: null,
    onclose: null,
    readyState: 'open',
    send: jest.fn(),
    ...overrides,
  } as unknown as RTCDataChannel
}

describe('isChannelReady', () => {
  it('returns false when channel is null', () => {
    expect(isChannelReady(null)).toBe(false)
  })

  it('returns false when channel state is "connecting"', () => {
    expect(isChannelReady(makeMockChannel({ readyState: 'connecting' }))).toBe(false)
  })

  it('returns false when channel state is "closing"', () => {
    expect(isChannelReady(makeMockChannel({ readyState: 'closing' }))).toBe(false)
  })

  it('returns false when channel state is "closed"', () => {
    expect(isChannelReady(makeMockChannel({ readyState: 'closed' }))).toBe(false)
  })

  it('returns true when channel state is "open"', () => {
    expect(isChannelReady(makeMockChannel({ readyState: 'open' }))).toBe(true)
  })
})

describe('setupChannelListeners', () => {
  it('calls onOpen when the channel opens', () => {
    const channel = makeMockChannel()
    const onOpen = jest.fn()
    setupChannelListeners(channel, onOpen, jest.fn(), jest.fn(), jest.fn())
    ;(channel as any).onopen()
    expect(onOpen).toHaveBeenCalledTimes(1)
  })

  it('calls onMetaReceived when a meta message is received', () => {
    const channel = makeMockChannel()
    const onMetaReceived = jest.fn()
    setupChannelListeners(channel, jest.fn(), onMetaReceived, jest.fn(), jest.fn())

    const meta: FileMeta = { type: 'meta', name: 'file.txt', size: 1024 }
    ;(channel as any).onmessage({ data: JSON.stringify(meta) })
    expect(onMetaReceived).toHaveBeenCalledWith(meta)
  })

  it('calls onTransferComplete when an "end" message is received', () => {
    const channel = makeMockChannel()
    const onTransferComplete = jest.fn()
    setupChannelListeners(channel, jest.fn(), jest.fn(), jest.fn(), onTransferComplete)

    ;(channel as any).onmessage({ data: JSON.stringify({ type: 'end' }) })
    expect(onTransferComplete).toHaveBeenCalledTimes(1)
  })

  it('calls onDataReceived when a binary ArrayBuffer is received', async () => {
    const channel = makeMockChannel()
    const onDataReceived = jest.fn()
    setupChannelListeners(channel, jest.fn(), jest.fn(), onDataReceived, jest.fn())

    const buffer = new ArrayBuffer(8)
    await (channel as any).onmessage({ data: buffer })
    expect(onDataReceived).toHaveBeenCalledWith(buffer)
  })
})

describe('setupOndatachannel', () => {
  it('attaches ondatachannel handler to the peer connection', () => {
    const mockPc = { ondatachannel: null } as unknown as RTCPeerConnection
    const callback = jest.fn()
    setupOndatachannel(mockPc, callback)

    const mockChannel = {
      binaryType: '',
      bufferedAmountLowThreshold: 0,
    } as unknown as RTCDataChannel

    ;(mockPc as any).ondatachannel({ channel: mockChannel })
    expect(callback).toHaveBeenCalledWith(mockChannel)
  })

  it('sets binaryType to arraybuffer on the received channel', () => {
    const mockPc = { ondatachannel: null } as unknown as RTCPeerConnection
    setupOndatachannel(mockPc, jest.fn())

    const mockChannel = {
      binaryType: '',
      bufferedAmountLowThreshold: 0,
    } as unknown as RTCDataChannel

    ;(mockPc as any).ondatachannel({ channel: mockChannel })
    expect(mockChannel.binaryType).toBe('arraybuffer')
  })
})
