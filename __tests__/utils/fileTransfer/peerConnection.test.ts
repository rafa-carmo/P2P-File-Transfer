import { createPeerConnection, onICECandidate } from '@/utils/fileTransfer/peerConnection'
import { STUN_SERVER } from '@/utils/fileTransfer/constants'

const mockPc = {
  onicecandidate: null as ((event: RTCPeerConnectionIceEvent) => void) | null,
  localDescription: null as RTCSessionDescription | null,
}

const MockRTCPeerConnection = jest.fn().mockImplementation(() => mockPc)

beforeAll(() => {
  ;(global as any).RTCPeerConnection = MockRTCPeerConnection
})

beforeEach(() => {
  MockRTCPeerConnection.mockClear()
  mockPc.onicecandidate = null
  mockPc.localDescription = null
})

describe('createPeerConnection', () => {
  it('instantiates RTCPeerConnection with the configured STUN server', () => {
    createPeerConnection()
    expect(MockRTCPeerConnection).toHaveBeenCalledWith({
      iceServers: [{ urls: STUN_SERVER }],
    })
  })

  it('returns the created peer connection instance', () => {
    const pc = createPeerConnection()
    expect(pc).toBe(mockPc)
  })
})

describe('onICECandidate', () => {
  it('does not invoke callback while candidates are still gathering', () => {
    const callback = jest.fn()
    onICECandidate(mockPc as unknown as RTCPeerConnection, callback)

    // e.candidate is truthy – still gathering
    mockPc.onicecandidate!({ candidate: {} } as RTCPeerConnectionIceEvent)
    expect(callback).not.toHaveBeenCalled()
  })

  it('invokes callback with JSON-serialized localDescription when gathering is complete', () => {
    const callback = jest.fn()
    const localDesc = { type: 'offer', sdp: 'v=0' } as RTCSessionDescription
    mockPc.localDescription = localDesc

    onICECandidate(mockPc as unknown as RTCPeerConnection, callback)

    // e.candidate is null – gathering complete
    mockPc.onicecandidate!({ candidate: null } as unknown as RTCPeerConnectionIceEvent)
    expect(callback).toHaveBeenCalledWith(JSON.stringify(localDesc))
  })

  it('does not invoke callback when gathering is complete but localDescription is null', () => {
    const callback = jest.fn()
    mockPc.localDescription = null

    onICECandidate(mockPc as unknown as RTCPeerConnection, callback)
    mockPc.onicecandidate!({ candidate: null } as unknown as RTCPeerConnectionIceEvent)

    expect(callback).not.toHaveBeenCalled()
  })
})
